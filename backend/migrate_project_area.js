const db = require('./config/db');

async function migrate() {
    try {
        console.log('Adding project_area column to tenants table...');
        await db.query('ALTER TABLE tenants ADD COLUMN project_area VARCHAR(255) AFTER organization_name');
        console.log('Success!');
        process.exit(0);
    } catch (error) {
        if (error.code === 'ER_DUP_COLUMN_NAME') {
            console.log('Column already exists.');
            process.exit(0);
        }
        console.error('Migration failed:', error);
        process.exit(1);
    }
}

migrate();
