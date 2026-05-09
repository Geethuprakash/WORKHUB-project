const db = require('./config/db');

async function checkAssets() {
    try {
        const [tables] = await db.query("SHOW TABLES LIKE 'assets'");
        if (tables.length === 0) {
            console.log("No assets table found.");
            process.exit(0);
        }
        const [columns] = await db.query('SHOW COLUMNS FROM assets');
        console.log("Assets Columns:");
        columns.forEach(c => console.log(`- ${c.Field}`));
        process.exit(0);
    } catch (error) {
        console.error("FAIL Error showing assets:", error);
        process.exit(1);
    }
}

checkAssets();
