const db = require('../config/db');

// @desc    Add or Update salary for employee
// @route   POST /api/salary
// @access  Tenant Admin
const addSalary = async (req, res) => {
    const { employee_id, basic_salary } = req.body;
    try {
        if (!employee_id || !basic_salary) return res.status(400).json({ message: "Employee ID and Basic Salary are required" });

        const [exists] = await db.query('SELECT id FROM employee_salary WHERE employee_id = ? AND tenant_code = ?', [employee_id, req.user.tenant_code]);

        if (exists.length > 0) {
            await db.query(
                'UPDATE employee_salary SET basic_salary = ?, effective_from = CURRENT_DATE WHERE id = ?',
                [basic_salary, exists[0].id]
            );
            res.json({ message: 'Salary updated successfully' });
        } else {
            await db.query(
                'INSERT INTO employee_salary (tenant_code, employee_id, basic_salary, effective_from, is_verified) VALUES (?, ?, ?, CURRENT_DATE, 1)',
                [req.user.tenant_code, employee_id, basic_salary]
            );
            res.status(201).json({ message: 'Salary record created' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Get salary details for employee
// @route   GET /api/salary
// @access  Employee, Tenant Admin
const getSalary = async (req, res) => {
    try {
        let query = 'SELECT es.*, u.display_name FROM employee_salary es JOIN employees e ON es.employee_id = e.id JOIN users u ON e.user_id = u.id';
        let params = [];

        if (req.user.role === 'EMPLOYEE') {
            const [emp] = await db.query('SELECT id FROM employees WHERE user_id = ?', [req.user.id]);
            if (emp.length === 0) return res.status(404).json({ message: 'Employee not found' });
            query += ' WHERE es.employee_id = ?';
            params.push(emp[0].id);
        } else {
            query += ' WHERE es.tenant_code = ?';
            params.push(req.user.tenant_code);
        }

        const [salaries] = await db.query(query, params);
        res.json(salaries);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// --- ASSETS ---

// @desc    Get assets
// @route   GET /api/assets
// @access  Admin (Full), Manager (Dept), Employee (Self)
const getAssets = async (req, res) => {
    try {
        let query = 'SELECT a.*, u.display_name as assigned_to_name FROM assets a LEFT JOIN employees e ON a.assigned_to = e.id LEFT JOIN users u ON e.user_id = u.id WHERE a.tenant_code = ?';
        let params = [req.user.tenant_code];

        if (req.user.role === 'MANAGER') {
            // Get manager's department
            const [mgr] = await db.query('SELECT department_id FROM employees WHERE user_id = ?', [req.user.id]);
            if (mgr.length > 0 && mgr[0].department_id) {
                // Show assets assigned to employees in manager's department OR unassigned assets
                query += ' AND (e.department_id = ? OR a.assigned_to IS NULL)';
                params.push(mgr[0].department_id);
            }
        } else if (req.user.role === 'EMPLOYEE') {
            const [emp] = await db.query('SELECT id FROM employees WHERE user_id = ?', [req.user.id]);
            if (emp.length === 0) return res.status(404).json({ message: 'Employee not found' });

            query += ' AND a.assigned_to = ?';
            params.push(emp[0].id);
        }

        query += ' ORDER BY a.id DESC';

        const [assets] = await db.query(query, params);
        res.json(assets);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Assign asset
// @route   PUT /api/assets/assign/:id
// @access  Admin, Manager
const assignAsset = async (req, res) => {
    const { employee_id } = req.body;
    try {
        await db.query(
            'UPDATE assets SET assigned_to = ?, status = "ASSIGNED" WHERE id = ? AND tenant_code = ?',
            [employee_id, req.params.id, req.user.tenant_code]
        );
        res.json({ message: 'Asset assigned successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Request asset
// @route   POST /api/assets/request
// @access  Employee
const requestAsset = async (req, res) => {
    const { item_name, description } = req.body;
    try {
        await db.query(
            'INSERT INTO tickets (tenant_code, created_by_user_id, category, related_id, description, status) VALUES (?, ?, "ASSET", NULL, ?, "OPEN")',
            [req.user.tenant_code, req.user.id, `Request for ${item_name}: ${description}`]
        );
        res.status(201).json({ message: 'Request submitted' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Get asset requests
// @route   GET /api/finance/assets/requests
// @access  Admin, Manager
const getAssetRequests = async (req, res) => {
    try {
        const [requests] = await db.query(
            `SELECT t.*, u.display_name as employee_name, e.employee_code 
             FROM tickets t 
             JOIN users u ON t.created_by_user_id = u.id 
             JOIN employees e ON u.id = e.user_id
             WHERE t.tenant_code = ? AND t.category = "ASSET"
             ORDER BY t.created_at DESC`,
            [req.user.tenant_code]
        );
        res.json(requests);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Add asset
// @route   POST /api/assets
// @access  Tenant Admin
const addAsset = async (req, res) => {
    const { asset_name, serial_no, status } = req.body;
    try {
        await db.query(
            'INSERT INTO assets (tenant_code, asset_name, serial_no, status) VALUES (?, ?, ?, ?)',
            [req.user.tenant_code, asset_name, serial_no, status || 'READY']
        );
        res.status(201).json({ message: 'Asset added' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// --- PAYROLL ---

// @desc    Process monthly payroll
// @route   POST /api/finance/payroll/process
// @access  Tenant Admin
const processPayroll = async (req, res) => {
    const { month, year } = req.body;
    try {
        if (!month || !year) return res.status(400).json({ message: "Month and Year are required" });

        // 1. Get salary config for tenant
        const [config] = await db.query('SELECT * FROM salary_config WHERE tenant_code = ?', [req.user.tenant_code]);
        if (config.length === 0) return res.status(400).json({ message: 'Salary configuration not found for tenant. Please set HRA/PF percentages.' });

        const { hra_percent, pf_percent } = config[0];

        // 2. Get all employees with their basic salaries
        const [salaries] = await db.query(
            'SELECT e.id as employee_id, es.basic_salary FROM employees e JOIN employee_salary es ON e.id = es.employee_id WHERE e.tenant_code = ? AND e.status = "ACTIVE"',
            [req.user.tenant_code]
        );

        if (salaries.length === 0) return res.status(404).json({ message: "No active employees found with salary records" });

        // 3. Generate payroll records
        for (const sal of salaries) {
            const basic = parseFloat(sal.basic_salary);
            const hra = (basic * hra_percent) / 100;
            const pf = (basic * pf_percent) / 100;
            const net = basic + hra - pf;

            // Check if already exists for this month/year/employee
            const [exists] = await db.query(
                'SELECT id FROM payroll WHERE employee_id = ? AND month = ? AND year = ?',
                [sal.employee_id, month, year]
            );

            if (exists.length > 0) {
                await db.query(
                    'UPDATE payroll SET basic_salary = ?, hra = ?, pf = ?, net_salary = ? WHERE id = ?',
                    [basic, hra, pf, net, exists[0].id]
                );
            } else {
                await db.query(
                    'INSERT INTO payroll (tenant_code, employee_id, month, year, basic_salary, hra, pf, net_salary, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
                    [req.user.tenant_code, sal.employee_id, month, year, basic, hra, pf, net, 'PENDING']
                );
            }
        }

        res.json({ message: 'Payroll processed successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Get payroll records
// @route   GET /api/finance/payroll
// @access  Admin, Employee
const getPayroll = async (req, res) => {
    const { month, year } = req.query;
    try {
        let query = `
            SELECT p.*, u.display_name, e.employee_code 
            FROM payroll p 
            JOIN employees e ON p.employee_id = e.id 
            JOIN users u ON e.user_id = u.id 
            WHERE p.tenant_code = ?
        `;
        let params = [req.user.tenant_code];

        if (month) { query += ' AND p.month = ?'; params.push(parseInt(month)); }
        if (year) { query += ' AND p.year = ?'; params.push(parseInt(year)); }

        if (req.user.role === 'EMPLOYEE') {
            const [emp] = await db.query('SELECT id FROM employees WHERE user_id = ?', [req.user.id]);
            if (emp.length > 0) {
                query += ' AND p.employee_id = ?';
                params.push(emp[0].id);
            }
        }

        query += ' ORDER BY p.year DESC, p.month DESC';

        const [records] = await db.query(query, params);
        res.json(records);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Mark payroll as paid
// @route   PUT /api/finance/payroll/pay/:id
// @access  Tenant Admin
const markPaid = async (req, res) => {
    try {
        await db.query(
            'UPDATE payroll SET status = "PAID", payment_date = CURRENT_TIMESTAMP WHERE id = ? AND tenant_code = ?',
            [req.params.id, req.user.tenant_code]
        );
        res.json({ message: 'Payroll marked as paid' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

module.exports = { getSalary, addSalary, getAssets, addAsset, processPayroll, getPayroll, markPaid, assignAsset, requestAsset, getAssetRequests };
