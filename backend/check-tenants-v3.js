require('dotenv').config();
const db = require('./config/db');

async function checkTenantsTable() {
    try {
        const [columns] = await db.query('DESCRIBE tenants');
        columns.forEach(col => {
            console.log(`Field: ${col.Field}, Type: ${col.Type}, Null: ${col.Null}, Key: ${col.Key}, Default: ${col.Default}, Extra: ${col.Extra}`);
        });
        process.exit(0);
    } catch (err) {
        console.error('DB Check Error:', err);
        process.exit(1);
    }
}

checkTenantsTable();
