const db = require('./config/db');

async function createLeaveTable() {
    try {
        console.log("Creating leave_requests table...");

        await db.query(`
            CREATE TABLE IF NOT EXISTS leave_requests (
                id INT AUTO_INCREMENT PRIMARY KEY,
                tenant_code VARCHAR(50) NOT NULL,
                employee_id INT NOT NULL,
                leave_type ENUM('CL', 'SL', 'PL') NOT NULL,
                start_date DATE,
                end_date DATE,
                days INT NOT NULL,
                reason TEXT,
                status ENUM('PENDING', 'APPROVED', 'REJECTED') DEFAULT 'PENDING',
                manager_comment TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (employee_id) REFERENCES employees(id)
            )
        `);

        // Migration: If there are any "Leave Request" tickets, we could move them here, 
        // but for now let's just seed some fresh data for testing.

        const [geethika] = await db.query("SELECT id FROM employees WHERE employee_code = '001'");
        if (geethika.length > 0) {
            const empId = geethika[0].id;
            await db.query(`
                INSERT INTO leave_requests (tenant_code, employee_id, leave_type, days, reason, status)
                VALUES ('TEST001', ?, 'CL', 2, 'Family function in hometown', 'PENDING')
            `, [empId]);
            console.log("Seeded a sample leave request for Geethika (Employee ID: " + empId + ")");
        }

        console.log("Table created and seeded successfully.");
        process.exit(0);
    } catch (error) {
        console.error("Error creating leave table:", error);
        process.exit(1);
    }
}

createLeaveTable();
