const db = require('./config/db');

async function getAdmin() {
    try {
        const [users] = await db.query("SELECT email, tenant_code, id FROM users WHERE role = 'ADMIN' LIMIT 5");
        console.log("Admin Users:");
        users.forEach(u => console.log(`- Email: ${u.email} | Tenant: ${u.tenant_code} | ID: ${u.id}`));
        process.exit(0);
    } catch (error) {
        console.error("FAIL Error:", error);
        process.exit(1);
    }
}

getAdmin();
