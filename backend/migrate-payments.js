require('dotenv').config();
const db = require('./config/db');

async function migrate() {
    try {
        console.log('Starting payments migration...');

        const [columns] = await db.query('DESCRIBE tenants');
        
        const hasPlanType = columns.some(col => col.Field === 'plan_type');
        if (!hasPlanType) {
            console.log('Adding plan_type column...');
            await db.query("ALTER TABLE tenants ADD COLUMN plan_type ENUM('BASIC', 'PRO', 'ENTERPRISE') DEFAULT 'BASIC'");
        } else {
            console.log('plan_type column already exists.');
        }

        const hasPaymentStatus = columns.some(col => col.Field === 'payment_status');
        if (!hasPaymentStatus) {
            console.log('Adding payment_status column...');
            await db.query("ALTER TABLE tenants ADD COLUMN payment_status ENUM('PENDING', 'PAID') DEFAULT 'PENDING'");
        } else {
            console.log('payment_status column already exists.');
        }

        const hasAmount = columns.some(col => col.Field === 'amount_paid');
        if (!hasAmount) {
            console.log('Adding amount_paid column...');
            await db.query("ALTER TABLE tenants ADD COLUMN amount_paid DECIMAL(10,2) DEFAULT 0.00");
        } else {
            console.log('amount_paid column already exists.');
        }

        console.log('Payments migration completed successfully.');
        process.exit(0);
    } catch (err) {
        console.error('Migration Error:', err);
        process.exit(1);
    }
}

migrate();
