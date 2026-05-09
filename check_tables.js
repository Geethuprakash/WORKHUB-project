require('dotenv').config({ path: './backend/.env' });
const mysql = require('mysql2/promise');

async function checkTables() {
    const connection = await mysql.createConnection({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME
    });

    try {
        const [tables] = await connection.query('SHOW TABLES');
        console.log('--- TABLES ---');
        console.table(tables);
        
        const [columns] = await connection.query('DESCRIBE leave_requests');
        console.log('--- LEAVE_REQUESTS COLUMNS ---');
        console.table(columns);
    } catch (err) {
        console.error(err);
    } finally {
        await connection.end();
        process.exit();
    }
}

checkTables();
