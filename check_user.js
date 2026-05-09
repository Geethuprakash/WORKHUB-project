require('dotenv').config({ path: './backend/.env' });
const mysql = require('mysql2/promise');

async function checkUser() {
    const connection = await mysql.createConnection({
        host: process.env.DB_HOST, user: process.env.DB_USER, password: process.env.DB_PASSWORD, database: process.env.DB_NAME
    });
    const [users] = await connection.query('SELECT id, email, role, display_name FROM users WHERE id = 6');
    console.log(users[0]);
    await connection.end();
    process.exit();
}
checkUser();
