const db = require('./config/db');

async function getSuperAdmin() {
    try {
        const [users] = await db.query("SELECT email, role FROM users WHERE role = 'SUPER_ADMIN'");
        if (users.length === 0) {
            console.log("No SUPER_ADMIN found in users table.");
        } else {
            console.log("SUPER_ADMIN List:");
            users.forEach(u => console.log(`- ${u.email}`));
        }
        process.exit(0);
    } catch (error) {
        console.error("FAIL Error fetching superadmin:", error);
        process.exit(1);
    }
}

getSuperAdmin();
