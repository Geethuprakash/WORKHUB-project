const db = require('./config/db');

async function updateSalaries() {
    try {
        console.log("Starting salary adjustment to < 70,000...");

        // 1. Get all base salaries
        const [salaries] = await db.query("SELECT * FROM employee_salary");
        console.log(`Updating ${salaries.length} salary records.`);

        for (const sal of salaries) {
            // Generate a random salary between 45,000 and 69,000
            const newBasic = Math.floor(Math.random() * (69000 - 45000 + 1)) + 45000;

            // Update base salary
            await db.query(
                "UPDATE employee_salary SET basic_salary = ? WHERE id = ?",
                [newBasic, sal.id]
            );
            console.log(`Updated Employee ID ${sal.employee_id} to Basic: ${newBasic}`);

            // 2. Update existing payroll records to reflect the new basic salary
            // Recalculate HRA (20%) and PF (12%)
            const hra = (newBasic * 0.20);
            const pf = (newBasic * 0.12);
            const net = (newBasic + hra - pf);

            await db.query(
                "UPDATE payroll SET basic_salary = ?, hra = ?, pf = ?, net_salary = ? WHERE employee_id = ?",
                [newBasic, hra, pf, net, sal.employee_id]
            );
            console.log(`Updated Payroll for Employee ID ${sal.employee_id} to Net: ${net.toFixed(2)}`);
        }

        console.log("Salary and Payroll adjustment completed successfully.");
        process.exit(0);
    } catch (error) {
        console.error("Error updating salaries:", error);
        process.exit(1);
    }
}

updateSalaries();
