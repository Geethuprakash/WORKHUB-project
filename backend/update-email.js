const db = require('./config/db');

async function updateEmail() {
    try {
        const [result] = await db.query(
            "UPDATE users SET email = 'arun@gmail.com' WHERE email = 'sreesabareesam8055@gmail.com'"
        );
        console.log(`Updated ${result.affectedRows} rows. Email changed to arun@gmail.com`);
    } catch (error) {
        console.error('Error:', error.message);
    } finally {
        process.exit(0);
    }
}

updateEmail();
