require('dotenv').config();
const db = require('./config/db');
const bcrypt = require('bcryptjs');

async function resetPasswords() {
    try {
        const users = ['admin@gmail.com', 'arun@gmail.com'];
        const newPassword = 'password123';
        
        const salt = await bcrypt.genSalt(10);
        const password_hash = await bcrypt.hash(newPassword, salt);
        
        for (const email of users) {
            const [result] = await db.query(
                'UPDATE users SET password_hash = ? WHERE email = ?',
                [password_hash, email]
            );
            console.log(`Updated password for ${email}. Affected rows: ${result.affectedRows}`);
        }
        
        process.exit(0);
    } catch (error) {
        console.error("Error updating password:", error);
        process.exit(1);
    }
}

resetPasswords();
