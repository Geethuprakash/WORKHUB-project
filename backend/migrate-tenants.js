require('dotenv').config();
const db = require('./config/db');

async function migrate() {
    try {
        console.log('Starting migration...');

        // Check if status column exists
        const [columns] = await db.query('DESCRIBE tenants');
        const hasStatus = columns.some(col => col.Field === 'status');

        if (!hasStatus) {
            console.log('Adding status column...');
            await db.query("ALTER TABLE tenants ADD COLUMN status ENUM('PENDING', 'APPROVED', 'REJECTED') DEFAULT 'PENDING'");
        } else {
            console.log('Status column already exists.');
        }

        const hasCriterias = columns.some(col => col.Field === 'criterias');
        if (!hasCriterias) {
            console.log('Adding criterias column...');
            await db.query("ALTER TABLE tenants ADD COLUMN criterias TEXT");
        }

        const hasApprovedAt = columns.some(col => col.Field === 'approved_at');
        if (!hasApprovedAt) {
            console.log('Adding approved_at column...');
            await db.query("ALTER TABLE tenants ADD COLUMN approved_at TIMESTAMP NULL");
        }

        // Set existing tenants to APPROVED
        console.log('Setting existing tenants to APPROVED...');
        await db.query("UPDATE tenants SET status = 'APPROVED' WHERE status IS NULL OR status = 'PENDING'");

        console.log('Migration completed successfully.');
        process.exit(0);
    } catch (err) {
        console.error('Migration Error:', err);
        process.exit(1);
    }
}

migrate();
