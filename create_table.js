require('dotenv').config({ path: './backend/.env' });
const db = require('./backend/config/db');

async function createNotificationsTable() {
    try {
        const query = `
            CREATE TABLE IF NOT EXISTS notifications (
                id INT AUTO_INCREMENT PRIMARY KEY,
                tenant_code VARCHAR(50) NOT NULL,
                user_id INT NULL,
                type VARCHAR(50) NOT NULL,
                message TEXT NOT NULL,
                is_read TINYINT(1) DEFAULT 0,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `;
        const connection = await db.getConnection();
        await connection.query(query);
        console.log("Notifications table created successfully.");
        connection.release();
        process.exit(0);
    } catch (error) {
        console.error("Error creating notifications table:", error);
        process.exit(1);
    }
}

createNotificationsTable();
