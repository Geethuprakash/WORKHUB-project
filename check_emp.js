require('dotenv').config({ path: './backend/.env' });
const mysql = require('mysql2/promise');

async function checkEmp() {
    const connection = await mysql.createConnection({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME
    });

    try {
        const [emp] = await connection.query('SELECT * FROM employees');
        console.log('--- EMPLOYEES ---');
        emp.forEach(e => console.log(`ID: ${e.id}, UserID: ${e.user_id}, Code: ${e.employee_code}`));
    } catch (err) {
        console.error(err);
    } finally {
        await connection.end();
        process.exit();
    }
}

checkEmp();
