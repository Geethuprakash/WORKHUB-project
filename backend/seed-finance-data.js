/**
 * seed-finance-data.js
 * Seeds finance-related data: salary_config, assets (assigned to employees), and payroll records.
 * Usage: node backend/seed-finance-data.js
 */
const db = require('./config/db');

const TENANT = 'TEST001';

async function seed() {
    try {
        console.log('--- Seeding Finance Data ---\n');

        // 1. Salary Config (HRA/PF percentages for tenant)
        const [existingConfig] = await db.query(
            'SELECT id FROM salary_config WHERE tenant_code = ?', [TENANT]
        );
        if (existingConfig.length === 0) {
            await db.query(
                'INSERT INTO salary_config (tenant_code, hra_percent, pf_percent) VALUES (?, ?, ?)',
                [TENANT, 20.00, 12.00]
            );
            console.log('✔ salary_config: Inserted (HRA=20%, PF=12%)');
        } else {
            console.log('→ salary_config: Already exists, skipped');
        }

        // 2. Assets — assign to specific employees
        const [employees] = await db.query(
            "SELECT id FROM employees WHERE tenant_code = ? AND status = 'ACTIVE' ORDER BY id", [TENANT]
        );

        const assetList = [
            { asset_name: 'MacBook Pro 14"', serial_no: 'MBP-C02X-001', status: 'ASSIGNED', emp_idx: 0 },
            { asset_name: 'Dell UltraSharp Monitor', serial_no: 'DEL-U2422-002', status: 'ASSIGNED', emp_idx: 1 },
            { asset_name: 'Logitech MX Keys Keyboard', serial_no: 'LGT-MXK-003', status: 'ASSIGNED', emp_idx: 2 },
            { asset_name: 'HP LaserJet Pro', serial_no: 'HP-LJ-004', status: 'READY', emp_idx: null },
            { asset_name: 'Cisco IP Phone 8841', serial_no: 'CSC-IP-005', status: 'READY', emp_idx: null },
            { asset_name: 'ThinkPad X1 Carbon', serial_no: 'LNV-X1-006', status: 'ASSIGNED', emp_idx: 0 },
        ];

        for (const asset of assetList) {
            const assigned_to = (asset.emp_idx !== null && employees[asset.emp_idx])
                ? employees[asset.emp_idx].id
                : null;

            const [exists] = await db.query(
                'SELECT id FROM assets WHERE serial_no = ?', [asset.serial_no]
            );
            if (exists.length === 0) {
                await db.query(
                    'INSERT INTO assets (tenant_code, asset_name, serial_no, assigned_to, status) VALUES (?, ?, ?, ?, ?)',
                    [TENANT, asset.asset_name, asset.serial_no, assigned_to, asset.status]
                );
                console.log(`✔ Asset: ${asset.asset_name} [${asset.status}] → Employee ${assigned_to || 'unassigned'}`);
            } else {
                console.log(`→ Asset: ${asset.serial_no} already exists, skipped`);
            }
        }

        // 3. Payroll records — generate for last 3 months for all employees
        const [salaries] = await db.query(
            'SELECT e.id as employee_id, es.basic_salary FROM employees e JOIN employee_salary es ON e.id = es.employee_id WHERE e.tenant_code = ? AND e.status = "ACTIVE"',
            [TENANT]
        );

        const [config] = await db.query('SELECT hra_percent, pf_percent FROM salary_config WHERE tenant_code = ?', [TENANT]);
        const { hra_percent, pf_percent } = config[0];

        const now = new Date();
        const months = [];
        for (let i = 1; i <= 3; i++) {
            const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
            months.push({ month: d.getMonth() + 1, year: d.getFullYear() });
        }

        for (const sal of salaries) {
            const basic = parseFloat(sal.basic_salary);
            // Cap very large salaries for demo purposes
            const capped = Math.min(basic, 100000);
            const hra = (capped * hra_percent) / 100;
            const pf = (capped * pf_percent) / 100;
            const net = capped + hra - pf;

            for (const period of months) {
                const [exists] = await db.query(
                    'SELECT id FROM payroll WHERE employee_id = ? AND month = ? AND year = ?',
                    [sal.employee_id, period.month, period.year]
                );
                if (exists.length === 0) {
                    // Make older months PAID, most recent PENDING
                    const status = period === months[0] ? 'PENDING' : 'PAID';
                    const payment_date = status === 'PAID' ? new Date(period.year, period.month, 5) : null;
                    await db.query(
                        'INSERT INTO payroll (tenant_code, employee_id, month, year, basic_salary, hra, pf, net_salary, status, payment_date) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
                        [TENANT, sal.employee_id, period.month, period.year, capped, hra, pf, net, status, payment_date]
                    );
                    console.log(`✔ Payroll: Employee ${sal.employee_id} | ${period.month}/${period.year} | Net: ${net.toFixed(2)} | ${status}`);
                } else {
                    console.log(`→ Payroll: Employee ${sal.employee_id} | ${period.month}/${period.year} already exists, skipped`);
                }
            }
        }

        console.log('\n✅ Finance data seeded successfully!');
        process.exit(0);
    } catch (err) {
        console.error('\n❌ Seed failed:', err.message);
        process.exit(1);
    }
}

seed();
