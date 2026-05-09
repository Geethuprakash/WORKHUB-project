const db = require('./config/db');

async function inspect() {
    try {
        const [managers] = await db.query("SELECT id, display_name FROM users WHERE role = 'MANAGER'");
        console.log('--- Managers ---');
        console.log(managers);

        for (const m of managers) {
            const [emp] = await db.query("SELECT * FROM employees WHERE user_id = ?", [m.id]);
            console.log(`--- Manager ID ${m.id} in Employees Table ---`);
            console.log(emp);
        }

        const [enquiries] = await db.query("SELECT id, sender_id, receiver_id, receiver_role, subject FROM enquiries LIMIT 10");
        console.log('--- Sample Enquiries ---');
        console.log(enquiries);

        process.exit(0);
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
}

inspect();
