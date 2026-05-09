const mysql = require('mysql2/promise');
require('dotenv').config();

async function cleanDatabase() {
    try {
        console.log('Connecting to MySQL...');
        const connection = await mysql.createConnection({
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_NAME
        });

        console.log('Disabling foreign key checks...');
        await connection.query('SET FOREIGN_KEY_CHECKS = 0');

        console.log('Fetching all tables...');
        const [tables] = await connection.query('SHOW TABLES');
        const dbName = 'workhubdb'; // or process.env.DB_NAME
        const tableNames = tables.map(t => Object.values(t)[0]);

        if (tableNames.length > 0) {
            console.log(`Dropping ${tableNames.length} tables...`);
            for (const table of tableNames) {
                await connection.query(`DROP TABLE IF EXISTS \`${table}\``);
                console.log(`Dropped \`${table}\``);
            }
        }

        console.log('Re-enabling foreign key checks...');
        await connection.query('SET FOREIGN_KEY_CHECKS = 1');

        console.log('✅ Database is now completely clean!');
        await connection.end();
    } catch (error) {
        console.error('❌ Error cleaning database:', error.message);
    }
}

cleanDatabase();
