const db = require('../config/db');

// @desc    Get all departments for a tenant
// @route   GET /api/departments
// @access  Tenant Admin, Employee
const getDepartments = async (req, res) => {
    try {
        const [departments] = await db.query(
            'SELECT * FROM departments WHERE tenant_code = ?',
            [req.user.tenant_code]
        );
        res.json(departments);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Create a new department
// @route   POST /api/departments
// @access  Tenant Admin
const createDepartment = async (req, res) => {
    const { name } = req.body;

    try {
        const [result] = await db.query(
            'INSERT INTO departments (tenant_code, name, status) VALUES (?, ?, ?)',
            [req.user.tenant_code, name, 'ACTIVE']
        );

        res.status(201).json({ message: 'Department created successfully', departmentId: result.insertId });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error: ' + error.message });
    }
};

const deleteDepartment = async (req, res) => {
    const { id } = req.params;

    try {
        // Only allow if it belongs to current tenant
        const [dept] = await db.query(
            'SELECT id FROM departments WHERE id = ? AND tenant_code = ?',
            [id, req.user.tenant_code]
        );

        if (dept.length === 0) {
            return res.status(404).json({ message: 'Division not found or unauthorized' });
        }

        await db.query('DELETE FROM departments WHERE id = ?', [id]);
        res.json({ message: 'Division decommissioned successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error: ' + error.message });
    }
};

module.exports = { getDepartments, createDepartment, deleteDepartment };
