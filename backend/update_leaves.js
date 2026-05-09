const db = require('./config/db');

async function updateLeaves() {
    try {
        const [resultCL] = await db.query("UPDATE employee_leave_balance SET balance = 10 WHERE leave_type = 'CL'");
        const [resultSL] = await db.query("UPDATE employee_leave_balance SET balance = 5 WHERE leave_type = 'SL'");
        const [resultPL] = await db.query("UPDATE employee_leave_balance SET balance = 5 WHERE leave_type = 'PL'");

        console.log(`Updated CL: ${resultCL.affectedRows} rows`);
        console.log(`Updated SL: ${resultSL.affectedRows} rows`);
        console.log(`Updated PL: ${resultPL.affectedRows} rows`);
        process.exit(0);
    } catch (error) {
        console.error("FAIL Error updating leaves:", error);
        process.exit(1);
    }
}

updateLeaves();
