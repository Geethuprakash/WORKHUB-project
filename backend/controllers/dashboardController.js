const db = require('../config/db');

// @desc    Get dashboard stats
// @route   GET /api/dashboard/stats
// @access  Admin, Tenant Admin
const getStats = async (req, res) => {
    try {
        const tenantCode = req.user.tenant_code;

        // 1. Total Employees
        const [empCount] = await db.query('SELECT COUNT(*) as count FROM employees WHERE tenant_code = ?', [tenantCode]);

        // 2. Active Projects
        const [projCount] = await db.query('SELECT COUNT(*) as count FROM projects WHERE tenant_code = ? AND status = "ONGOING"', [tenantCode]);

        // 3. Pending Tasks
        // Need to join projects to filter by tenant_code if tasks don't have it directly. 
        // Tasks table has project_id. Projects table has tenant_code.
        const [taskCount] = await db.query('SELECT COUNT(t.id) as count FROM tasks t JOIN projects p ON t.project_id = p.id WHERE p.tenant_code = ? AND t.is_completed = 0', [tenantCode]);

        res.json({
            employees: empCount[0].count,
            activeProjects: projCount[0].count,
            pendingTasks: taskCount[0].count
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Get detailed company report
// @route   GET /api/dashboard/report
// @access  Admin
const getCompanyReport = async (req, res) => {
    try {
        const tenantCode = req.user.tenant_code;

        // Fetch Organization Details
        const [org] = await db.query('SELECT organization_name, created_at, plan_type FROM tenants WHERE tenant_code = ?', [tenantCode]);
        
        // Fetch Employees with User, Department, and Salary info
        const [employees] = await db.query(`
            SELECT e.id, e.employee_code, e.designation, e.joining_date, e.status, u.display_name as name, u.email, d.name as department, s.basic_salary as salary
            FROM employees e
            JOIN users u ON e.user_id = u.id
            LEFT JOIN departments d ON e.department_id = d.id
            LEFT JOIN employee_salary s ON e.id = s.employee_id
            WHERE e.tenant_code = ?
        `, [tenantCode]);
        
        // Fetch Departments with employee count
        const [departments] = await db.query(`
            SELECT d.id, d.name, d.status, COUNT(e.id) as employee_count
            FROM departments d
            LEFT JOIN employees e ON d.id = e.department_id
            WHERE d.tenant_code = ?
            GROUP BY d.id
        `, [tenantCode]);

        // Fetch Projects with Manager details
        const [projects] = await db.query(`
            SELECT p.id, p.title, p.client_name, p.status, p.revenue, p.deadline, u.display_name as manager
            FROM projects p
            LEFT JOIN employees e ON p.manager_id = e.id
            LEFT JOIN users u ON e.user_id = u.id
            WHERE p.tenant_code = ?
        `, [tenantCode]);

        // Fetch Detailed Tasks
        const [tasksDetails] = await db.query(`
            SELECT t.title, t.is_completed, p.title as project_title, u.display_name as assigned_to
            FROM tasks t
            JOIN projects p ON t.project_id = p.id
            LEFT JOIN employees e ON t.assigned_to = e.id
            LEFT JOIN users u ON e.user_id = u.id
            WHERE p.tenant_code = ?
        `, [tenantCode]);

        // Fetch Detailed Assets
        const [assetsDetails] = await db.query(`
            SELECT a.asset_name, a.serial_no, a.status, u.display_name as assigned_to
            FROM assets a
            LEFT JOIN employees e ON a.assigned_to = e.id
            LEFT JOIN users u ON e.user_id = u.id
            WHERE a.tenant_code = ?
        `, [tenantCode]);

        const totalTasks = tasksDetails.length;
        const completedTasks = tasksDetails.filter(t => t.is_completed === 1).length;

        const reportData = {
            organization: org[0] || {},
            summary: {
                totalEmployees: employees.length,
                activeEmployees: employees.filter(e => e.status === 'ACTIVE').length,
                totalDepartments: departments.length,
                totalProjects: projects.length,
                ongoingProjects: projects.filter(p => p.status === 'ONGOING').length,
                totalTasks,
                completedTasks,
                totalAssets: assetsDetails.length
            },
            employeesList: employees.map(e => ({
                code: e.employee_code,
                name: e.name,
                email: e.email,
                department: e.department || 'N/A',
                designation: e.designation || 'N/A',
                salary: e.salary || 0,
                joined: e.joining_date,
                status: e.status
            })),
            projectsList: projects.map(p => ({
                title: p.title,
                client: p.client_name,
                manager: p.manager || 'N/A',
                status: p.status,
                revenue: p.revenue,
                deadline: p.deadline
            })),
            departmentsList: departments.map(d => ({
                name: d.name,
                employees: d.employee_count,
                status: d.status
            })),
            tasksList: tasksDetails.map(t => ({
                title: t.title,
                project: t.project_title,
                assigned: t.assigned_to || 'Unassigned',
                status: t.is_completed ? 'Completed' : 'Pending'
            })),
            assetsList: assetsDetails.map(a => ({
                name: a.asset_name,
                serial: a.serial_no || 'N/A',
                status: a.status,
                assigned: a.assigned_to || 'N/A'
            }))
        };

        res.json(reportData);

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error generating report' });
    }
};

module.exports = { getStats, getCompanyReport };
