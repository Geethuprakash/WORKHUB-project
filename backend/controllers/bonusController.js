const db = require('../config/db');

// @desc    Calculate performance score for an employee
// @route   GET /api/bonuses/performance/:employeeId
// @access  Private (Manager/Admin)
const getPerformanceScore = async (req, res) => {
    try {
        const { employeeId } = req.params;
        const tenantCode = req.user.tenant_code;

        // 1. Get total tasks vs completed tasks
        const [tasks] = await db.query(
            'SELECT COUNT(*) as total, SUM(is_completed) as completed FROM tasks t JOIN projects p ON t.project_id = p.id WHERE t.assigned_to = ? AND p.tenant_code = ?',
            [employeeId, tenantCode]
        );

        const total = tasks[0].total || 0;
        const completed = tasks[0].completed || 0;
        
        // 2. Attendance logic (Simplified: assume 20 days is full attendance for the month)
        const [attendance] = await db.query(
            'SELECT COUNT(DISTINCT date) as days FROM attendance WHERE employee_id = ? AND tenant_code = ? AND status = "PRESENT"',
            [employeeId, tenantCode]
        );
        const presentDays = attendance[0].days || 0;

        // 3. Calculation Formula: (Task completion rate * 60) + (Attendance rate * 40)
        let taskScore = total > 0 ? (completed / total) * 60 : 0;
        let attendanceScore = Math.min((presentDays / 20) * 40, 40);
        
        const finalScore = Math.round(taskScore + attendanceScore);

        // Update employee performance_score in DB
        await db.query('UPDATE employees SET performance_score = ? WHERE id = ?', [finalScore, employeeId]);

        res.json({
            employee_id: employeeId,
            total_tasks: total,
            completed_tasks: completed,
            attendance_days: presentDays,
            performance_score: finalScore
        });
    } catch (error) {
        console.error("Error calculating performance:", error);
        res.status(500).json({ message: 'Server error calculating performance' });
    }
};

// @desc    Request a bonus for an employee
// @route   POST /api/bonuses/request
// @access  Private (Manager/Admin)
const requestBonus = async (req, res) => {
    try {
        const { employee_id, amount, reason, performance_score } = req.body;
        const tenantCode = req.user.tenant_code;
        
        // Corrected: get the employee ID of the person making the request
        const [requester] = await db.query('SELECT id FROM employees WHERE user_id = ?', [req.user.id]);
        const managerId = requester.length > 0 ? requester[0].id : null;

        if (!employee_id || !amount || !reason) {
            return res.status(400).json({ message: 'Missing required fields' });
        }

        const [result] = await db.query(
            'INSERT INTO bonuses (tenant_code, employee_id, manager_id, amount, reason, performance_score, status) VALUES (?, ?, ?, ?, ?, ?, "PENDING")',
            [tenantCode, employee_id, managerId, amount, reason, performance_score || 0]
        );

        res.status(201).json({ message: 'Bonus request submitted', bonusId: result.insertId });
    } catch (error) {
        console.error("Error requesting bonus:", error);
        res.status(500).json({ message: 'Server error requesting bonus' });
    }
};

// @desc    Approve or Reject a bonus request
// @route   PUT /api/bonuses/:id/status
// @access  Private (Admin only)
const updateBonusStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body; // 'APPROVED' or 'REJECTED'
        const tenantCode = req.user.tenant_code;

        if (!['APPROVED', 'REJECTED'].includes(status)) {
            return res.status(400).json({ message: 'Invalid status' });
        }

        const [result] = await db.query(
            'UPDATE bonuses SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ? AND tenant_code = ?',
            [status, id, tenantCode]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Bonus request not found' });
        }

        res.json({ message: `Bonus status updated to ${status}` });
    } catch (error) {
        console.error("Error updating bonus status:", error);
        res.status(500).json({ message: 'Server error updating bonus status' });
    }
};

// @desc    Get bonuses for the current tenant (or user)
// @route   GET /api/bonuses
// @access  Private
const getBonuses = async (req, res) => {
    try {
        const tenantCode = req.user.tenant_code;
        let query = `
            SELECT b.*, u.display_name as employee_name, e.employee_code, um.display_name as manager_name 
            FROM bonuses b
            JOIN employees e ON b.employee_id = e.id
            JOIN users u ON e.user_id = u.id
            LEFT JOIN employees m ON b.manager_id = m.id
            LEFT JOIN users um ON m.user_id = um.id
            WHERE b.tenant_code = ?
        `;
        let params = [tenantCode];

        if (req.user.role === 'EMPLOYEE') {
            query += ' AND b.employee_id = (SELECT id FROM employees WHERE user_id = ?)';
            params.push(req.user.id);
        }

        query += ' ORDER BY b.created_at DESC';

        const [bonuses] = await db.query(query, params);
        res.json(bonuses);
    } catch (error) {
        console.error("Error fetching bonuses:", error);
        res.status(500).json({ message: 'Server error fetching bonuses' });
    }
};

// @desc    Auto-calculate and generate bonus proposals for all employees
// @route   POST /api/bonuses/auto-generate
// @access  Private (Admin only)
const generateAutoBonuses = async (req, res) => {
    try {
        const tenantCode = req.user.tenant_code;
        
        // 1. Get all employees 
        const [employees] = await db.query('SELECT e.id, u.display_name FROM employees e JOIN users u ON e.user_id = u.id WHERE e.tenant_code = ? AND u.role != "ADMIN"', [tenantCode]);
        
        const results = [];
        let count = 0;
        
        for (const emp of employees) {
            // Re-calculate performance
            const [tasks] = await db.query(
                'SELECT COUNT(*) as total, SUM(is_completed) as completed FROM tasks t JOIN projects p ON t.project_id = p.id WHERE t.assigned_to = ? AND p.tenant_code = ?',
                [emp.id, tenantCode]
            );
            const total = tasks[0].total || 0;
            const completed = tasks[0].completed || 0;
            
            const [attendance] = await db.query(
                'SELECT COUNT(DISTINCT date) as days FROM attendance WHERE employee_id = ? AND tenant_code = ? AND status = "PRESENT"',
                [emp.id, tenantCode]
            );
            const presentDays = attendance[0].days || 0;
            
            let taskScore = total > 0 ? (completed / total) * 60 : 0;
            let attendanceScore = Math.min((presentDays / 20) * 40, 40);
            const score = Math.round(taskScore + attendanceScore);
            
            // Criteria: score >= 50 for system recognition
            if (score >= 50) {
                // Check if a pending bonus already exists to avoid duplicates
                const [existing] = await db.query(
                    'SELECT id FROM bonuses WHERE employee_id = ? AND status = "PENDING" AND tenant_code = ? AND performance_score = ?',
                    [emp.id, tenantCode, score]
                );

                if (existing.length === 0) {
                    const amount = score * 20; // Example: score 100 = 2000
                    const reason = `Automated Incentive Recommendation for ${score}% KPI attainment`;
                    
                    await db.query(
                        'INSERT INTO bonuses (tenant_code, employee_id, manager_id, amount, reason, performance_score, status) VALUES (?, ?, NULL, ?, ?, ?, "PENDING")',
                        [tenantCode, emp.id, amount, reason, score]
                    );
                    count++;
                }
            }
        }
        
        res.json({ message: `System analysis complete. Isolated ${count} eligible candidates.`, generated: count });
    } catch (error) {
        console.error("Error auto-generating bonuses:", error);
        res.status(500).json({ message: 'Server error during auto-generation' });
    }
};

module.exports = {
    getPerformanceScore,
    requestBonus,
    updateBonusStatus,
    getBonuses,
    generateAutoBonuses
};
