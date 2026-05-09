const db = require('./config/db');

async function seedRemainingFinance() {
    const TENANT = 'TEST001';

    try {
        console.log("Starting finance data seeding for all active employees...");

        // 1. Get ALL active employees for this tenant
        const [employees] = await db.query(
            "SELECT id FROM employees WHERE tenant_code = ? AND status = 'ACTIVE' ORDER BY id",
            [TENANT]
        );

        console.log(`Found ${employees.length} active employees.`);

        // 2. Ensure every employee has a salary entry
        for (const emp of employees) {
            // Check if salary exists
            const [existingSalary] = await db.query(
                "SELECT id FROM employee_salary WHERE employee_id = ?",
                [emp.id]
            );

            if (existingSalary.length === 0) {
                const salary = 45000 + (emp.id * 5000); // Varied salaries
                await db.query(
                    "INSERT INTO employee_salary (tenant_code, employee_id, basic_salary, effective_from, is_verified) VALUES (?, ?, ?, ?, ?)",
                    [TENANT, emp.id, salary, '2026-01-01', 1]
                );
                console.log(`Seeded salary for employee ID: ${emp.id}`);
            }
        }

        // 3. Assign some assets to the newer employees (4 and 5)
        const newAssets = [
            { asset_name: 'Dell XPS 15', serial_no: 'DELL-XPS-404', emp_id: 4 },
            { asset_name: 'iPhone 15 Pro', serial_no: 'APL-IPH-505', emp_id: 5 },
            { asset_name: 'Sony WH-1000XM5', serial_no: 'SNY-HDP-406', emp_id: 4 }
        ];

        for (const asset of newAssets) {
            const [existingAsset] = await db.query(
                "SELECT id FROM assets WHERE serial_no = ?",
                [asset.serial_no]
            );

            if (existingAsset.length === 0) {
                await db.query(
                    "INSERT INTO assets (tenant_code, asset_name, serial_no, assigned_to, status) VALUES (?, ?, ?, ?, ?)",
                    [TENANT, asset.asset_name, asset.serial_no, asset.emp_id, 'ASSIGNED']
                );
                console.log(`Seeded asset ${asset.asset_name} for employee ID: ${asset.emp_id}`);
            }
        }

        // 4. Generate some payroll history for ALL employees who have salaries
        const [salaries] = await db.query("SELECT * FROM employee_salary WHERE tenant_code = ?", [TENANT]);

        for (const sal of salaries) {
            // Check if payroll already exists for Feb 2026
            const [existingPayroll] = await db.query(
                "SELECT id FROM payroll WHERE employee_id = ? AND month = 2 AND year = 2026",
                [sal.employee_id]
            );

            if (existingPayroll.length === 0) {
                const basic = parseFloat(sal.basic_salary);
                const hra = (basic * 0.20).toFixed(2);
                const pf = (basic * 0.12).toFixed(2);
                const net = (basic + parseFloat(hra) - parseFloat(pf)).toFixed(2);

                await db.query(
                    `INSERT INTO payroll (tenant_code, employee_id, month, year, basic_salary, hra, pf, deductions, bonuses, net_salary, status)
                     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                    [TENANT, sal.employee_id, 2, 2026, basic, hra, pf, 0, 0, net, 'PENDING']
                );

                // Add one PAID month too
                await db.query(
                    `INSERT INTO payroll (tenant_code, employee_id, month, year, basic_salary, hra, pf, deductions, bonuses, net_salary, status, payment_date)
                     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                    [TENANT, sal.employee_id, 1, 2026, basic, hra, pf, 0, 0, net, 'PAID', '2026-02-05']
                );
                console.log(`Seeded payroll history for employee ID: ${sal.employee_id}`);
            }
        }

        console.log("Finance data seeding completed successfully.");
        process.exit(0);
    } catch (error) {
        console.error("Error seeding finance data:", error);
        process.exit(1);
    }
}

seedRemainingFinance();
