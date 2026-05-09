const db = require('../config/db');

// @desc    Get leave balance for the employee
// @route   GET /api/leaves/balance
// @access  Employee
const getLeaveBalance = async (req, res) => {
    try {
        let employeeId;
        const requestedEmpId = req.query.employeeId;

        if (requestedEmpId && (req.user.role === 'ADMIN' || req.user.role === 'MANAGER')) {
            employeeId = requestedEmpId;
        } else {
            const [emp] = await db.query('SELECT id FROM employees WHERE user_id = ?', [req.user.id]);
            if (emp.length === 0) return res.json([]);
            employeeId = emp[0].id;
        }

        const [balance] = await db.query(
            'SELECT leave_type, SUM(balance) as balance FROM employee_leave_balance WHERE employee_id = ? GROUP BY leave_type',
            [employeeId]
        );
        res.json(balance);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Apply for leave
// @route   POST /api/leaves/apply
// @access  Employee
const applyLeave = async (req, res) => {
    const { leave_type, reason, days } = req.body;
    try {
        const [emp] = await db.query('SELECT id, tenant_code FROM employees WHERE user_id = ?', [req.user.id]);
        if (emp.length === 0) return res.status(404).json({ message: 'Employee not found' });

        // Check Balance
        const [balRows] = await db.query(
            'SELECT balance FROM employee_leave_balance WHERE employee_id = ? AND leave_type = ?',
            [emp[0].id, leave_type]
        );

        if (balRows.length === 0 || balRows[0].balance < days) {
            return res.status(400).json({ message: 'Insufficient leave balance' });
        }

        // Insert into leave_requests table
        await db.query(
            'INSERT INTO leave_requests (tenant_code, employee_id, leave_type, days, reason, status) VALUES (?, ?, ?, ?, ?, ?)',
            [emp[0].tenant_code, emp[0].id, leave_type, days, reason, 'PENDING']
        );

        res.status(201).json({ message: 'Leave request submitted successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Get all leave requests for the logged-in employee
// @route   GET /api/leaves/my-requests
// @access  Employee
const getMyLeaveRequests = async (req, res) => {
    try {
        const [emp] = await db.query('SELECT id FROM employees WHERE user_id = ?', [req.user.id]);
        if (emp.length === 0) return res.json([]);

        const [requests] = await db.query(`
            SELECT lr.*, e.employee_code, u.display_name 
            FROM leave_requests lr
            JOIN employees e ON lr.employee_id = e.id
            JOIN users u ON e.user_id = u.id
            WHERE lr.employee_id = ?
            ORDER BY lr.created_at DESC
        `, [emp[0].id]);

        res.json(requests);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Cancel a pending leave request
// @route   DELETE /api/leaves/:id
// @access  Employee
const cancelLeaveRequest = async (req, res) => {
    try {
        const [emp] = await db.query('SELECT id FROM employees WHERE user_id = ?', [req.user.id]);
        if (emp.length === 0) return res.status(404).json({ message: 'Employee not found' });

        const [reqRow] = await db.query('SELECT * FROM leave_requests WHERE id = ? AND employee_id = ?', [req.params.id, emp[0].id]);
        if (reqRow.length === 0) return res.status(404).json({ message: 'Leave request not found or unauthorized' });

        if (reqRow[0].status !== 'PENDING') {
            return res.status(400).json({ message: 'Only PENDING requests can be cancelled' });
        }

        await db.query('DELETE FROM leave_requests WHERE id = ?', [req.params.id]);

        res.json({ message: 'Leave request cancelled successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Get all leave requests (for Admin/Managers)
// @route   GET /api/leaves/all
// @access  Admin/Manager
const getAllLeaveRequests = async (req, res) => {
    try {
        const [requests] = await db.query(`
            SELECT lr.*, e.employee_code, u.display_name 
            FROM leave_requests lr
            JOIN employees e ON lr.employee_id = e.id
            JOIN users u ON e.user_id = u.id
            WHERE lr.tenant_code = ?
            ORDER BY lr.created_at DESC
        `, [req.user.tenant_code]);

        res.json(requests);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Update leave request status (Approve/Reject)
// @route   PUT /api/leaves/:id
// @access  Admin/Manager
const updateLeaveStatus = async (req, res) => {
    const { status, manager_comment } = req.body;
    const { id } = req.params;

    try {
        const [reqRow] = await db.query('SELECT * FROM leave_requests WHERE id = ?', [id]);
        if (reqRow.length === 0) return res.status(404).json({ message: 'Leave request not found' });

        const request = reqRow[0];

        if (status === 'APPROVED' && request.status !== 'APPROVED') {
            await db.query(
                'UPDATE employee_leave_balance SET balance = balance - ? WHERE employee_id = ? AND leave_type = ?',
                [request.days, request.employee_id, request.leave_type]
            );
        }

        await db.query(
            'UPDATE leave_requests SET status = ?, manager_comment = ? WHERE id = ?',
            [status, manager_comment, id]
        );

        res.json({ message: `Leave request ${status.toLowerCase()} successfully` });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

module.exports = { getLeaveBalance, applyLeave, getMyLeaveRequests, cancelLeaveRequest, getAllLeaveRequests, updateLeaveStatus };

