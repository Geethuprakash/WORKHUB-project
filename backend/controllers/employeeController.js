const db = require('../config/db');
const bcrypt = require('bcryptjs');

// @desc    Get all employees for a tenant
// @route   GET /api/employees
// @access  Tenant Admin
const getEmployees = async (req, res) => {
    try {
        const [employees] = await db.query(
            `SELECT e.*, u.email, u.display_name, u.role, d.name as department_name
       FROM employees e 
       JOIN users u ON e.user_id = u.id 
       LEFT JOIN departments d ON e.department_id = d.id
       WHERE e.tenant_code = ?`,
            [req.user.tenant_code]
        );
        res.json(employees);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Create a new employee
// @route   POST /api/employees
// @access  Tenant Admin
const createEmployee = async (req, res) => {
    const {
        email, password, display_name,
        employee_code, department_id, designation, role
    } = req.body;

    const connection = await db.getConnection(); // Use transaction

    try {
        await connection.beginTransaction();

        // 1. Create User
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const newRole = (req.user.role === 'ADMIN' && role) ? role : 'EMPLOYEE';

        const [userResult] = await connection.query(
            'INSERT INTO users (tenant_code, email, employee_code, password_hash, role, display_name) VALUES (?, ?, ?, ?, ?, ?)',
            [req.user.tenant_code, email, employee_code, hashedPassword, newRole, display_name]
        );

        const userId = userResult.insertId;

        // 2. Create Employee Record
        await connection.query(
            'INSERT INTO employees (tenant_code, user_id, employee_code, department_id, designation) VALUES (?, ?, ?, ?, ?)',
            [req.user.tenant_code, userId, employee_code, department_id, designation]
        );

        await connection.commit();
        res.status(201).json({ message: 'Employee created successfully' });

    } catch (error) {
        await connection.rollback();
        console.error(error);
        res.status(500).json({ message: 'Server error: ' + error.message });
    } finally {
        connection.release();
    }
};

const deleteEmployee = async (req, res) => {
    const { id } = req.params;
    const connection = await db.getConnection();
    try {
        await connection.beginTransaction();

        // Check ownership and get user_id
        const [emp] = await connection.query(
            'SELECT user_id FROM employees WHERE id = ? AND tenant_code = ?',
            [id, req.user.tenant_code]
        );

        if (emp.length === 0) {
            return res.status(404).json({ message: 'Employee not found' });
        }

        const userId = emp[0].user_id;

        // Delete records
        await connection.query('DELETE FROM employees WHERE id = ?', [id]);
        await connection.query('DELETE FROM users WHERE id = ?', [userId]);

        await connection.commit();
        res.json({ message: 'Employee record terminated successfully' });
    } catch (error) {
        await connection.rollback();
        console.error(error);
        res.status(500).json({ message: 'Server error: ' + error.message });
    } finally {
        connection.release();
    }
};

const getProfile = async (req, res) => {
    try {
        const [profile] = await db.query(
            `SELECT e.*, u.email, u.display_name, u.role, d.name as department_name
       FROM employees e 
       JOIN users u ON e.user_id = u.id 
       LEFT JOIN departments d ON e.department_id = d.id
       WHERE u.id = ?`,
            [req.user.id]
        );

        if (profile.length === 0) {
            // If not found in employees table (maybe it's an ADMIN/SUPER_ADMIN), fetch from users table
            const [userProfile] = await db.query(
                'SELECT id, display_name, email, role, tenant_code FROM users WHERE id = ?',
                [req.user.id]
            );
            if (userProfile.length === 0) {
                return res.status(404).json({ message: 'Profile not found' });
            }
            return res.json(userProfile[0]);
        }

        res.json(profile[0]);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

const updateProfile = async (req, res) => {
    const { display_name, phone } = req.body;
    const userId = req.user.id;
    const connection = await db.getConnection();

    try {
        await connection.beginTransaction();

        // 1. Update User display_name
        if (display_name) {
            await connection.query(
                'UPDATE users SET display_name = ? WHERE id = ?',
                [display_name, userId]
            );
        }

        // 2. Update Employee phone if it exists
        if (phone !== undefined) {
            // Check if employee record exists for this user
            const [employees] = await connection.query(
                'SELECT id FROM employees WHERE user_id = ?',
                [userId]
            );
            if (employees.length > 0) {
                await connection.query(
                    'UPDATE employees SET phone = ? WHERE user_id = ?',
                    [phone, userId]
                );
            }
        }

        await connection.commit();
        res.json({ message: 'Profile updated successfully' });
    } catch (error) {
        await connection.rollback();
        console.error(error);
        res.status(500).json({ message: 'Server error: ' + error.message });
    } finally {
        connection.release();
    }
};

module.exports = { getEmployees, createEmployee, deleteEmployee, getProfile, updateProfile };
