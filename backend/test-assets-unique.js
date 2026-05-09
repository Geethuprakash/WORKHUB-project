const db = require('./config/db');

async function checkIndex() {
    try {
        const [indexes] = await db.query("SHOW INDEX FROM assets");
        console.log("Assets Indexes:");
        indexes.forEach(i => console.log(`- ${i.Key_name} | Column: ${i.Column_name} | Non_unique: ${i.Non_unique}`));
        process.exit(0);
    } catch (error) {
        console.error("FAIL Error showing indexes:", error);
        process.exit(1);
    }
}

checkIndex();
