const db = require('./config/db');

async function updateDepartments() {
    try {
        await db.query("UPDATE departments SET name = 'FINANCE' WHERE id = 1");
        await db.query("UPDATE departments SET name = 'TESTING' WHERE id = 2");
        console.log('Departments updated successfully:');
        console.log('ID 1 -> FINANCE');
        console.log('ID 2 -> TESTING');
        process.exit(0);
    } catch (error) {
        console.error('Error updating departments:', error);
        process.exit(1);
    }
}

updateDepartments();
