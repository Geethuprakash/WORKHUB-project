const db = require('./config/db');

async function migrate() {
    try {
        console.log('Adding project_area column to tasks table...');
        await db.query('ALTER TABLE tasks ADD COLUMN project_area VARCHAR(255) DEFAULT NULL AFTER title');
        console.log('✅ project_area column added to tasks table successfully.');
        process.exit(0);
    } catch (error) {
        if (error.code === 'ER_DUP_FIELDNAME') {
            console.log('ℹ️  Column project_area already exists in tasks table. Skipping.');
            process.exit(0);
        }
        console.error('❌ Migration failed:', error.message);
        process.exit(1);
    }
}

migrate();
