require('dotenv').config({ path: './backend/.env' });
const db = require('./config/db');

async function checkAttendanceDB() {
    try {
        const [rows] = await db.query('SHOW TABLES LIKE "attendance"');
        if (rows.length === 0) {
            console.log('Table "attendance" NOT FOUND');
        } else {
            console.log('Table "attendance" FOUND');
            const [columns] = await db.query('DESCRIBE attendance');
            console.log('Columns:', columns);
            const [data] = await db.query('SELECT * FROM attendance');
            console.log('Current Data:', data);
        }
        process.exit(0);
    } catch (err) {
        console.error('DB Check Error:', err);
        process.exit(1);
    }
}

checkAttendanceDB();
