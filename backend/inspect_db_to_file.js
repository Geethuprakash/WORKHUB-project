const db = require('./config/db');
const fs = require('fs');

async function inspect() {
    let output = '';
    try {
        const [managers] = await db.query("SELECT id, display_name FROM users WHERE role = 'MANAGER'");
        output += '--- Managers ---\n' + JSON.stringify(managers, null, 2) + '\n';

        for (const m of managers) {
            const [emp] = await db.query("SELECT * FROM employees WHERE user_id = ?", [m.id]);
            output += `\n--- Manager ID ${m.id} in Employees Table ---\n` + JSON.stringify(emp, null, 2) + '\n';
        }

        const [enquiries] = await db.query("SELECT id, sender_id, sender_role, receiver_id, receiver_role, subject FROM enquiries");
        output += '\n--- Enquiries ---\n' + JSON.stringify(enquiries, null, 2) + '\n';

        fs.writeFileSync('inspect_output.txt', output);
        process.exit(0);
    } catch (error) {
        fs.writeFileSync('inspect_output.txt', error.stack);
        process.exit(1);
    }
}

inspect();
