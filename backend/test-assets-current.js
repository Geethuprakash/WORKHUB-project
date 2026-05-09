const db = require('./config/db');

async function testSelect() {
    try {
        const [assets] = await db.query('SELECT * FROM assets ORDER BY id DESC LIMIT 5');
        console.log("Last 5 Assets Added:");
        assets.forEach(a => console.log(`- ID: ${a.id} | Name: ${a.asset_name} | Serial: ${a.serial_no} | Tenant: ${a.tenant_code}`));
        process.exit(0);
    } catch (error) {
        console.error("FAIL Error showing assets:", error);
        process.exit(1);
    }
}

testSelect();
