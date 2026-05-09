const db = require('../config/db');

const createEnquiriesTable = async () => {
    try {
        const sql = `
            CREATE TABLE IF NOT EXISTS enquiries (
                id INT NOT NULL AUTO_INCREMENT,
                tenant_code VARCHAR(50) NOT NULL,
                sender_id INT NOT NULL,
                sender_role ENUM('ADMIN', 'MANAGER', 'EMPLOYEE') NOT NULL,
                receiver_id INT DEFAULT NULL,
                receiver_role ENUM('ADMIN', 'MANAGER', 'EMPLOYEE') NOT NULL,
                subject VARCHAR(255) NOT NULL,
                message TEXT NOT NULL,
                status ENUM('UNREAD', 'READ', 'RESOLVED') DEFAULT 'UNREAD',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                PRIMARY KEY (id),
                FOREIGN KEY (sender_id) REFERENCES users(id),
                FOREIGN KEY (receiver_id) REFERENCES users(id)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
        `;

        await db.query(sql);
        console.log('✅ enquiries table created successfully or already exists.');
        process.exit(0);
    } catch (error) {
        console.error('❌ Error creating enquiries table:', error);
        process.exit(1);
    }
};

createEnquiriesTable();
