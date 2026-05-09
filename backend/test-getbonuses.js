const db = require('./config/db');

async function testQuery() {
    try {
        const tenantCode = 'default';
        let query = `
            SELECT b.*, u.display_name as employee_name, e.employee_code, um.display_name as manager_name 
            FROM bonuses b
            JOIN employees e ON b.employee_id = e.id
            JOIN users u ON e.user_id = u.id
            LEFT JOIN employees m ON b.manager_id = m.id
            LEFT JOIN users um ON m.user_id = um.id
            WHERE b.tenant_code = ?
        `;
        let params = [tenantCode];

        const [bonuses] = await db.query(query, params);
        console.log("Success! Extracted bonuses:", bonuses.length);
        process.exit(0);
    } catch (error) {
        console.error("FAIL Error fetching bonuses:", error);
        process.exit(1);
    }
}

testQuery();
