const db = require('./config/db');

async function checkNotifications() {
    try {
        const [tables] = await db.query("SHOW TABLES LIKE 'notifications'");
        if (tables.length === 0) {
            console.log("No notifications table found.");
            process.exit(0);
        }
        const [columns] = await db.query('SHOW COLUMNS FROM notifications');
        console.log("Notifications Columns:");
        columns.forEach(c => console.log(`- ${c.Field}`));
        process.exit(0);
    } catch (error) {
        console.error("FAIL Error showing notifications:", error);
        process.exit(1);
    }
}

checkNotifications();
