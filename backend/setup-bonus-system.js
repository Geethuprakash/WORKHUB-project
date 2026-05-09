const db = require('./config/db');

async function setupBonusSystem() {
    try {
        console.log('--- Setting up Bonus System ---');
        
        // 1. Create bonuses table
        await db.query(`
            CREATE TABLE IF NOT EXISTS bonuses (
                id INT AUTO_INCREMENT PRIMARY KEY,
                tenant_code VARCHAR(50) NOT NULL,
                employee_id INT NOT NULL,
                manager_id INT NULL,
                amount DECIMAL(10, 2) NOT NULL,
                reason VARCHAR(255) NOT NULL,
                status ENUM('PENDING', 'APPROVED', 'REJECTED') DEFAULT 'PENDING',
                performance_score INT DEFAULT 0,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
                FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE
            )
        `);
        console.log('Table "bonuses" created/verified.');

        // 2. Add performance_score to employees table if it doesn't exist
        const [columns] = await db.query('SHOW COLUMNS FROM employees LIKE "performance_score"');
        if (columns.length === 0) {
            await db.query('ALTER TABLE employees ADD COLUMN performance_score INT DEFAULT 0');
            console.log('Column "performance_score" added to employees table.');
        } else {
            console.log('Column "performance_score" already exists in employees table.');
        }

        console.log('--- Bonus System Setup Complete ---');
        process.exit(0);
    } catch (err) {
        console.error('Error setting up bonus system:', err);
        process.exit(1);
    }
}

setupBonusSystem();
