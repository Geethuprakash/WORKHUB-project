const db = require('./config/db');

async function fix() {
    try {
        const [result] = await db.query("UPDATE employees SET department_id = 2 WHERE user_id = 4");
        console.log('--- Fix Applied ---');
        console.log(result);
        process.exit(0);
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
}

fix();
