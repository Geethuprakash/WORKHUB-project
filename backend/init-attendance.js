require('dotenv').config({ path: './backend/.env' });
const db = require('./config/db');

const initAttendance = async () => {
    try {
        const sql = `
        CREATE TABLE IF NOT EXISTS attendance (
            id INT NOT NULL AUTO_INCREMENT,
            tenant_code VARCHAR(50) NOT NULL,
            employee_id INT NOT NULL,
            date DATE NOT NULL,
            check_in TIME DEFAULT NULL,
            check_out TIME DEFAULT NULL,
            status ENUM('PRESENT', 'ABSENT', 'LATE') DEFAULT 'PRESENT',
            created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
            PRIMARY KEY (id),
            UNIQUE KEY uk_attendance (employee_id, date)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
        `;
        await db.query(sql);
        console.log('Attendance table created or already exists.');
        process.exit(0);
    } catch (error) {
        console.error('Error creating attendance table:', error);
        process.exit(1);
    }
};

initAttendance();
