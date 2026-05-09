require('dotenv').config();
const db = require('./config/db');
const bcrypt = require('bcryptjs');

async function updatePassword() {
    try {
        const email = 'admin@gmail.com';
        const newPassword = 'password123';

        const salt = await bcrypt.genSalt(10);
        const password_hash = await bcrypt.hash(newPassword, salt);

        const [result] = await db.query(
            'UPDATE users SET password_hash = ? WHERE email = ?',
            [password_hash, email]
        );

        console.log(`Updated password for ${email}. Affected rows: ${result.affectedRows}`);

        const connection = await db.getConnection();
        connection.release();
        process.exit(0);
    } catch (error) {
        console.error("Error updating password:", error);
        process.exit(1);
    }
}

updatePassword();
