const db = require('./config/db');

async function check() {
    try {
        console.log('Checking last 5 users:');
        const [users] = await db.query('SELECT id, email, tenant_code, role, display_name FROM users ORDER BY id DESC LIMIT 5');
        console.table(users);

        console.log('Checking last 5 tenants:');
        const [tenants] = await db.query('SELECT id, organization_name, project_area, tenant_code, status FROM tenants ORDER BY id DESC LIMIT 5');
        console.table(tenants);

        process.exit(0);
    } catch (error) {
        console.error('Check failed:', error);
        process.exit(1);
    }
}

check();
