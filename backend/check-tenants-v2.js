require('dotenv').config();
const db = require('./config/db');

async function checkTenantsTable() {
    try {
        const [columns] = await db.query('DESCRIBE tenants');
        console.log(JSON.stringify(columns, null, 2));
        process.exit(0);
    } catch (err) {
        console.error('DB Check Error:', err);
        process.exit(1);
    }
}

checkTenantsTable();
