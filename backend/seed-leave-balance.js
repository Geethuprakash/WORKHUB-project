/**
 * seed-leave-balance.js
 * Run once to populate employee_leave_balance for all active employees.
 * Usage: node backend/seed-leave-balance.js
 */
const db = require('./config/db');

const LEAVE_TYPES = [
    { type: 'CL', balance: 10 },
    { type: 'SL', balance: 5 },
    { type: 'PL', balance: 5 },
];

async function seed() {
    try {
        const [employees] = await db.query(
            "SELECT id, tenant_code FROM employees WHERE status = 'ACTIVE'"
        );

        if (employees.length === 0) {
            console.log('No active employees found.');
            process.exit(0);
        }

        let inserted = 0;
        let skipped = 0;

        for (const emp of employees) {
            for (const leave of LEAVE_TYPES) {
                // Use INSERT IGNORE to skip if already exists (unique key: tenant_code + employee_id + leave_type)
                const [result] = await db.query(
                    `INSERT IGNORE INTO employee_leave_balance 
                     (tenant_code, employee_id, leave_type, balance) 
                     VALUES (?, ?, ?, ?)`,
                    [emp.tenant_code, emp.id, leave.type, leave.balance]
                );
                if (result.affectedRows > 0) {
                    inserted++;
                    console.log(`  ✔ Inserted: Employee ${emp.id} - ${leave.type} = ${leave.balance} days`);
                } else {
                    skipped++;
                    console.log(`  → Skipped (already exists): Employee ${emp.id} - ${leave.type}`);
                }
            }
        }

        console.log(`\nDone! Inserted: ${inserted}, Skipped: ${skipped}`);
        process.exit(0);
    } catch (err) {
        console.error('Seed failed:', err.message);
        process.exit(1);
    }
}

seed();
