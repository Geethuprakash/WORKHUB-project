require('dotenv').config({ path: './backend/.env' });
const mysql = require('mysql2/promise');

async function checkLeaves() {
    const connection = await mysql.createConnection({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME
    });

    try {
        const [leaves] = await connection.query('SELECT * FROM leave_requests');
        console.log('Total Leave Requests:', leaves.length);
        if (leaves.length > 0) {
            leaves.forEach(l => console.log(`ID: ${l.id}, EmpID: ${l.employee_id}, Status: ${l.status}, Reason: ${l.reason}`));
        } else {
            console.log('Table is empty.');
        }
    } catch (err) {
        console.error('Error fetching leaves:', err);
    } finally {
        await connection.end();
        process.exit();
    }
}

checkLeaves();
