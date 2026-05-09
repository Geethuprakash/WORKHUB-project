const bcrypt = require('bcryptjs');
const mysql = require('mysql2/promise');
require('dotenv').config();

async function resetPassword() {
    try {
        const pool = mysql.createPool({
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_NAME,
        });

        const newPassword = 'password123';
        const hashedPassword = await bcrypt.hash(newPassword, 10);

        await pool.execute(
            'UPDATE users SET password_hash = ? WHERE email = ?',
            [hashedPassword, 'admin@gmail.com']
        );

        console.log('\n✅ Admin password successfully reset!');
        console.log('-----------------------------------');
        console.log('Email: admin@gmail.com');
        console.log('Password: password123');
        console.log('-----------------------------------\n');

        pool.end();
    } catch (error) {
        console.error('Error resetting password:', error);
    }
}

resetPassword();
