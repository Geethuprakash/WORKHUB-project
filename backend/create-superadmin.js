require('dotenv').config();
const db = require('./config/db');
const bcrypt = require('bcryptjs');

async function createSuperAdmin() {
    const email = 'superadmin@workhub.com';
    const password = 'superadmin123';
    const display_name = 'Super Admin';
    const tenant_code = 'SYSTEM';

    try {
        // Create a SYSTEM tenant if not exists
        const [tenants] = await db.query('SELECT * FROM tenants WHERE tenant_code = ?', [tenant_code]);
        if (tenants.length === 0) {
            await db.query('INSERT INTO tenants (organization_name, tenant_code, status, approved_at) VALUES (?, ?, "APPROVED", CURRENT_TIMESTAMP)', ['WorkHub System', tenant_code]);
        }

        const salt = await bcrypt.genSalt(10);
        const password_hash = await bcrypt.hash(password, salt);

        await db.query(
            'INSERT INTO users (tenant_code, email, password_hash, role, display_name) VALUES (?, ?, ?, ?, ?)',
            [tenant_code, email, password_hash, 'SUPER_ADMIN', display_name]
        );

        console.log('SuperAdmin created successfully');
        console.log('Email:', email);
        console.log('Password:', password);
        process.exit(0);
    } catch (err) {
        console.error('Error creating SuperAdmin:', err);
        process.exit(1);
    }
}

createSuperAdmin();
