require('dotenv').config();
const db = require('./config/db');

async function checkTenantsTable() {
    try {
        const [rows] = await db.query('SHOW TABLES LIKE "tenants"');
        if (rows.length === 0) {
            console.log('Table "tenants" NOT FOUND');
        } else {
            console.log('Table "tenants" FOUND');
            const [columns] = await db.query('DESCRIBE tenants');
            console.log('Columns:', columns);
        }
        process.exit(0);
    } catch (err) {
        console.error('DB Check Error:', err);
        process.exit(1);
    }
}

checkTenantsTable();
