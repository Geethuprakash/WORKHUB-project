const mysql = require('mysql2');
const dotenv = require('dotenv');
dotenv.config({ path: './backend/.env' });

const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
}).promise();

async function check() {
    try {
        console.log('Checking database for Mahi...');
        const [users] = await pool.query('SELECT id, display_name FROM users WHERE display_name LIKE "%mahi%" OR display_name LIKE "%nahi%"');
        console.log('Users found:', JSON.stringify(users, null, 2));

        for (const user of users) {
            const [emps] = await pool.query('SELECT id, user_id FROM employees WHERE user_id = ?', [user.id]);
            console.log(`Employee record for ${user.display_name}:`, JSON.stringify(emps, null, 2));

            for (const emp of emps) {
                const [sal] = await pool.query('SELECT * FROM employee_salary WHERE employee_id = ?', [emp.id]);
                console.log(`Salary for ${user.display_name}:`, JSON.stringify(sal, null, 2));

                const [pay] = await pool.query('SELECT * FROM payroll WHERE employee_id = ?', [emp.id]);
                console.log(`Payroll for ${user.display_name}:`, JSON.stringify(pay, null, 2));
            }
        }
        process.exit(0);
    } catch (error) {
        console.error('Database Error:', error);
        process.exit(1);
    }
}

check();
