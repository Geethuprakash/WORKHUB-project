const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const db = require('../config/db');

const generateToken = (id, role, tenant_code) => {
    return jwt.sign({ id, role, tenant_code }, process.env.JWT_SECRET, {
        expiresIn: '30d',
    });
};

// @desc    Auth user & get token
// @route   POST /api/auth/login
// @access  Public
const loginUser = async (req, res) => {
    const { email, password, portal } = req.body;
    console.log(`Login attempt for: ${email}`);

    try {
        const [rows] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
        const user = rows[0];
        console.log(`User found: ${!!user}`);

        const isMatch = user ? await bcrypt.compare(password, user.password_hash) : false;
        console.log(`Password match: ${isMatch}`);

        if (user && isMatch) {
            // Enforce Portal Separation
            if (user.role === 'SUPER_ADMIN' && portal !== 'super') {
                return res.status(401).json({ message: 'SuperAdmin access restricted. Use secure portal.' });
            }
            if (user.role !== 'SUPER_ADMIN' && portal === 'super') {
                return res.status(401).json({ message: 'Access Denied. Internal Security Protocol triggered.' });
            }

            // Check Tenant Status (For non-system users)
            if (user.tenant_code !== 'SYSTEM') {
                const [tenantRows] = await db.query('SELECT status FROM tenants WHERE tenant_code = ?', [user.tenant_code]);
                const tenant = tenantRows[0];

                if (tenant && tenant.status !== 'APPROVED') {
                    return res.status(403).json({ 
                        message: `Your company access is ${tenant.status}. Please contact SuperAdmin.` 
                    });
                }
            }

            res.json({
                _id: user.id,
                name: user.display_name,
                email: user.email,
                role: user.role,
                tenant_code: user.tenant_code,
                token: generateToken(user.id, user.role, user.tenant_code),
            });
        } else {
            res.status(401).json({ message: 'Invalid email or password' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Register a new tenant and admin user
// @route   POST /api/auth/register
// @access  Public
const registerUser = async (req, res) => {
    const { 
        organization_name, 
        project_area,
        tenant_code, 
        email, 
        password, 
        display_name, 
        criterias,
        license_number,
        gst_number,
        plan_type,
        payment_status,
        amount_paid
    } = req.body;

    try {
        // 1. Check if user already exists
        const [existingUsers] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
        if (existingUsers.length > 0) {
            return res.status(400).json({ message: 'User with this email already exists' });
        }

        // 2. Check if tenant_code already exists
        const [existingTenants] = await db.query('SELECT * FROM tenants WHERE tenant_code = ?', [tenant_code]);
        if (existingTenants.length > 0) {
            return res.status(400).json({ message: 'Tenant code already exists' });
        }

        // 3. Create Tenant (Status is PENDING by default)
        await db.query(
            'INSERT INTO tenants (organization_name, project_area, tenant_code, criterias, license_number, gst_number, plan_type, payment_status, amount_paid) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
            [organization_name, project_area || '', tenant_code, criterias || '', license_number || '', gst_number || '', plan_type || 'BASIC', payment_status || 'PENDING', amount_paid || 0.00]
        );

        // 4. Create Admin User
        const salt = await bcrypt.genSalt(10);
        const password_hash = await bcrypt.hash(password, salt);

        const [userResult] = await db.query(
            'INSERT INTO users (tenant_code, email, password_hash, role, display_name) VALUES (?, ?, ?, ?, ?)',
            [tenant_code, email, password_hash, 'ADMIN', display_name]
        );

        const userId = userResult.insertId;

        res.status(201).json({
            message: 'Registration and Payment successful! Your company access is pending approval.',
            _id: userId,
            name: display_name,
            email: email,
            role: 'ADMIN',
            tenant_code: tenant_code,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error during registration' });
    }
};

module.exports = { loginUser, registerUser };
