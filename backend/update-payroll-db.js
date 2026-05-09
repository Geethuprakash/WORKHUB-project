const mysql = require('mysql2/promise');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

async function updateDb() {
    const connection = await mysql.createConnection({
        host: process.env.DB_HOST || 'localhost',
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || '',
        database: process.env.DB_NAME || 'workhubdb'
    });

    try {
        await connection.query(`
            CREATE TABLE IF NOT EXISTS payroll (
                id INT NOT NULL AUTO_INCREMENT,
                tenant_code VARCHAR(50) NOT NULL,
                employee_id INT NOT NULL,
                month INT NOT NULL,
                year INT NOT NULL,
                basic_salary DECIMAL(10,2) NOT NULL,
                hra DECIMAL(10,2) NOT NULL,
                pf DECIMAL(10,2) NOT NULL,
                deductions DECIMAL(10,2) DEFAULT 0.00,
                bonuses DECIMAL(10,2) DEFAULT 0.00,
                net_salary DECIMAL(10,2) NOT NULL,
                status ENUM('PAID', 'PENDING') DEFAULT 'PENDING',
                payment_date TIMESTAMP NULL DEFAULT NULL,
                created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
                PRIMARY KEY (id),
                KEY (employee_id),
                FOREIGN KEY (employee_id) REFERENCES employees(id)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
        `);
        console.log('Payroll table created or already exists');

        // Check if salary_config has data for TEST001
        const [configs] = await connection.query('SELECT * FROM salary_config WHERE tenant_code = "TEST001"');
        if (configs.length === 0) {
            await connection.query('INSERT INTO salary_config (tenant_code, hra_percent, pf_percent) VALUES ("TEST001", 10, 12)');
            console.log('Default salary config added');
        }

    } catch (err) {
        console.error('Error updating database:', err);
    } finally {
        await connection.end();
    }
}

updateDb();
