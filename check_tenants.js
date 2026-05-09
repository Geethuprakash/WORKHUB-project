require('dotenv').config();
const db = require('./backend/config/db');

async function run() {
    try {
        const [columns] = await db.query('DESCRIBE tenants');
        console.log(columns);
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}
run();
