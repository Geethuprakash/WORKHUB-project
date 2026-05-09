const db = require('../config/db');

// @desc    Check-in for the day
// @route   POST /api/attendance/check-in
// @access  Employee
const checkIn = async (req, res) => {
    try {
        console.log('Attendance Check-in Attempt - User:', req.user);
        const userId = req.user.id;
        const tenantCode = req.user.tenant_code;
        const now_date = new Date();
        const today = now_date.toLocaleDateString('en-CA'); // YYYY-MM-DD in local time
        const now = now_date.toTimeString().split(' ')[0];

        console.log('Parameters - Tenant:', tenantCode, 'Today:', today, 'Now:', now);

        // 1. Get Employee ID
        console.log('Querying employee for user_id:', userId);
        const [emp] = await db.query('SELECT id FROM employees WHERE user_id = ?', [userId]);
        console.log('Employee Query Result:', emp);
        if (emp.length === 0) {
            console.log('404: Employee record not found for user_id:', userId);
            return res.status(404).json({ message: 'Employee not found' });
        }
        const employeeId = emp[0].id;

        // 2. Check if already checked in
        console.log('Checking existing attendance for employee_id:', employeeId, 'date:', today);
        const [existing] = await db.query(
            'SELECT id FROM attendance WHERE employee_id = ? AND date = ?',
            [employeeId, today]
        );
        console.log('Existing Check-in Result:', existing);

        if (existing.length > 0) {
            console.log('400: Already checked in');
            return res.status(400).json({ message: 'Already checked in for today' });
        }

        // 3. Record Attendance
        console.log('Inserting attendance record...');
        const [insertResult] = await db.query(
            'INSERT INTO attendance (tenant_code, employee_id, date, check_in, status) VALUES (?, ?, ?, ?, ?)',
            [tenantCode, employeeId, today, now, 'PRESENT']
        );
        console.log('Insert Result:', insertResult);

        res.status(201).json({ message: 'Checked in successfully', time: now });
    } catch (error) {
        console.error('Attendance Controller Error:', error);
        res.status(500).json({ message: 'Server error: ' + error.message });
    }
};

// @desc    Check-out for the day
// @route   POST /api/attendance/check-out
// @access  Employee
const checkOut = async (req, res) => {
    try {
        const userId = req.user.id;
        const now_date = new Date();
        const today = now_date.toLocaleDateString('en-CA');
        const now = now_date.toTimeString().split(' ')[0];

        // 1. Get Employee ID
        const [emp] = await db.query('SELECT id FROM employees WHERE user_id = ?', [userId]);
        if (emp.length === 0) return res.status(404).json({ message: 'Employee not found' });
        const employeeId = emp[0].id;

        // 2. Check if checked in
        const [record] = await db.query(
            'SELECT id, check_out FROM attendance WHERE employee_id = ? AND date = ?',
            [employeeId, today]
        );

        if (record.length === 0) {
            return res.status(400).json({ message: 'You must check in before checking out' });
        }

        if (record[0].check_out) {
            return res.status(400).json({ message: 'Already checked out for today' });
        }

        // 3. Update Record
        await db.query(
            'UPDATE attendance SET check_out = ? WHERE id = ?',
            [now, record[0].id]
        );

        res.json({ message: 'Checked out successfully', time: now });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Get today's attendance status
// @route   GET /api/attendance/status
// @access  Employee
const getStatus = async (req, res) => {
    try {
        const userId = req.user.id;
        const now_date = new Date();
        const today = now_date.toLocaleDateString('en-CA');

        // 1. Get Employee ID
        const [emp] = await db.query('SELECT id FROM employees WHERE user_id = ?', [userId]);
        if (emp.length === 0) return res.status(404).json({ message: 'Employee not found' });
        const employeeId = emp[0].id;

        // 2. Fetch record
        const [record] = await db.query(
            'SELECT * FROM attendance WHERE employee_id = ? AND date = ?',
            [employeeId, today]
        );

        if (record.length === 0) {
            return res.json({ checkedIn: false });
        }

        res.json({
            checkedIn: true,
            checkIn: record[0].check_in,
            checkOut: record[0].check_out,
            status: record[0].status
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Get all attendance for today (Admin/Manager)
// @route   GET /api/attendance/today
// @access  Admin/Manager
const getTodayAttendance = async (req, res) => {
    try {
        const targetDate = req.query.date || new Date().toLocaleDateString('en-CA');

        const [records] = await db.query(`
            SELECT a.*, u.display_name, e.employee_code, e.designation
            FROM attendance a
            JOIN employees e ON a.employee_id = e.id
            JOIN users u ON e.user_id = u.id
            WHERE a.tenant_code = ? AND a.date = ?
            ORDER BY a.check_in DESC
        `, [req.user.tenant_code, targetDate]);

        res.json(records);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Get all attendance history for logged-in employee
// @route   GET /api/attendance/my-history
// @access  Employee
const getMyAttendance = async (req, res) => {
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

        // 2. Fetch all attendance records
        const [records] = await db.query(
            'SELECT * FROM attendance WHERE employee_id = ? ORDER BY date DESC',
            [employeeId]
        );

        res.json(records);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

module.exports = { checkIn, checkOut, getStatus, getTodayAttendance, getMyAttendance };
