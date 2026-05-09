const db = require('../config/db');

async function migrate() {
    try {
        console.log('Altering enquiries table...');
        
        // Check if parent_id already exists to avoid duplicate column error
        const [columns] = await db.query("SHOW COLUMNS FROM enquiries LIKE 'parent_id'");
        if (columns.length > 0) {
            console.log('parent_id column already exists.');
            process.exit(0);
        }

        await db.query(`
            ALTER TABLE enquiries 
            ADD COLUMN parent_id INT DEFAULT NULL,
            ADD CONSTRAINT fk_enquiries_parent FOREIGN KEY (parent_id) REFERENCES enquiries(id) ON DELETE CASCADE
        `);
        
        console.log('--- Table Altered Successfully ---');
        process.exit(0);
    } catch (error) {
        console.error('Migration failed:', error);
        process.exit(1);
    }
}

migrate();
