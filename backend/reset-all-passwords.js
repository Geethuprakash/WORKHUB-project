const bcrypt = require('bcryptjs');
const mysql = require('mysql2/promise');
require('dotenv').config();

async function resetAllPasswords() {
    try {
        const pool = mysql.createPool({
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_NAME,
        });

        const newPassword = 'password123';
        const hashedPassword = await bcrypt.hash(newPassword, 10);

        // Reset passwords for specific test users to 'password123'
        const usersToReset = [
            'admin@gmail.com',
            'akdmuralimk@gmail.com',
            'sreesabareesam8055@gmail.com',
            'sam2003@gmail.com'
        ];

        console.log('Resetting passwords specifically for test accounts...');

        for (const email of usersToReset) {
            const [result] = await pool.execute(
                'UPDATE users SET password_hash = ? WHERE email = ?',
                [hashedPassword, email]
            );
            if (result.affectedRows > 0) {
                console.log(`✅ Password reset for: ${email}`);
            } else {
                console.log(`⚠️ User not found or already has this password: ${email}`);
            }
        }

        console.log('\n-----------------------------------');
        console.log('TEST LOGIN CREDENTIALS');
        console.log('-----------------------------------');
        console.log('Role: ADMIN');
        console.log('Email: admin@gmail.com');
        console.log('Password: password123');
        console.log('-----------------------------------');
        console.log('Role: EMPLOYEE');
        console.log('Email: akdmuralimk@gmail.com');
        console.log('Password: password123');
        console.log('-----------------------------------');
        console.log('Role: MANAGER');
        console.log('Email: sreesabareesam8055@gmail.com');
        console.log('Password: password123');
        console.log('-----------------------------------\n');

        pool.end();
    } catch (error) {
        console.error('Error resetting passwords:', error);
    }
}

resetAllPasswords();
