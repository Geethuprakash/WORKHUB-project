require('dotenv').config({ path: './backend/.env' });
const mysql = require('mysql2/promise');

async function applyLeave() {
    const connection = await mysql.createConnection({
        host: process.env.DB_HOST, user: process.env.DB_USER, password: process.env.DB_PASSWORD, database: process.env.DB_NAME
    });
    
    // User 4 is Arun (Manager)
    const [emp] = await connection.query('SELECT id, tenant_code FROM employees WHERE user_id = 4');
    console.log('Arun Employee Record:', emp[0]);
    
    if (emp[0]) {
        await connection.query(
            'INSERT INTO leave_requests (tenant_code, employee_id, leave_type, days, reason, status) VALUES (?, ?, ?, ?, ?, ?)',
            [emp[0].tenant_code, emp[0].id, 'CL', 1, 'Test from script', 'PENDING']
        );
        console.log('Leave applied for Arun');
    }
    
    await connection.end();
    process.exit();
}
applyLeave();
