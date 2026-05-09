const db = require('../config/db');
const bcrypt = require('bcryptjs');

// @desc    Get all tenants
// @route   GET /api/tenants
// @access  SuperAdmin
const getTenants = async (req, res) => {
    try {
        const { status } = req.query;
        let query = 'SELECT * FROM tenants';
        let params = [];

        if (status) {
            query += ' WHERE status = ?';
            params.push(status);
        }

        const [tenants] = await db.query(query, params);
        res.json(tenants);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Approve a tenant
// @route   PUT /api/tenants/:id/approve
// @access  SuperAdmin
const approveTenant = async (req, res) => {
    const { id } = req.params;
    try {
        await db.query(
            'UPDATE tenants SET status = "APPROVED", approved_at = CURRENT_TIMESTAMP WHERE id = ?',
            [id]
        );
        res.json({ message: 'Tenant approved successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Reject a tenant
// @route   PUT /api/tenants/:id/reject
// @access  SuperAdmin
const rejectTenant = async (req, res) => {
    const { id } = req.params;
    try {
        await db.query(
            'UPDATE tenants SET status = "REJECTED" WHERE id = ?',
            [id]
        );
        res.json({ message: 'Tenant rejected successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Create a new tenant
// @route   POST /api/tenants
// @access  Admin
const createTenant = async (req, res) => {
    const { organization_name, project_area, tenant_code, email, password, display_name } = req.body;

    try {
        // 1. Create Tenant in `tenants` table (Default APPROVED if created by SuperAdmin)
        const [tenantResult] = await db.query(
            'INSERT INTO tenants (organization_name, project_area, tenant_code, status, approved_at) VALUES (?, ?, ?, "APPROVED", CURRENT_TIMESTAMP)',
            [organization_name, project_area || '', tenant_code]
        );

        // 2. Create Admin User for this Tenant in `users` table
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        await db.query(
            'INSERT INTO users (tenant_code, email, password_hash, role, display_name) VALUES (?, ?, ?, ?, ?)',
            [tenant_code, email, hashedPassword, 'ADMIN', display_name]
        );

        res.status(201).json({ message: 'Tenant created successfully', tenantId: tenantResult.insertId });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error: ' + error.message });
    }
};

module.exports = { getTenants, createTenant, approveTenant, rejectTenant };
