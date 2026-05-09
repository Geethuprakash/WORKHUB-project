const db = require('./config/db');

async function checkAssets() {
    try {
        const [assets] = await db.query("SELECT * FROM assets");
        console.log("Assets count:", assets.length);
        if (assets.length > 0) {
            console.log("First five assets:");
            assets.slice(0, 5).forEach(a => console.log(`- ${a.asset_name} / ${a.serial_no} / ${a.tenant_code}`));
        }
        process.exit(0);
    } catch (error) {
        console.error("FAIL Error showing assets:", error);
        process.exit(1);
    }
}

checkAssets();
