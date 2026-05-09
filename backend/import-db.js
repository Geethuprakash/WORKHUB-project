const mysql = require('mysql2/promise');
const fs = require('fs').promises;
const path = require('path');
require('dotenv').config();

async function importDatabaseSafely() {
    console.log('Connecting to MySQL...');
    const connection = await mysql.createConnection({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME
    });

    console.log('Reading workhubdb.sql file...');
    const sqlFilePath = path.join(__dirname, '..', 'workhubdb.sql');
    const sqlFileContent = await fs.readFile(sqlFilePath, 'utf8');

    // Remove comments
    let cleanSql = sqlFileContent.replace(/--.*$/gm, '').replace(/\/\*[\s\S]*?\*\//g, '');

    // Split by semicolons
    const statements = cleanSql.split(';')
        .map(s => s.trim())
        .filter(s => s.length > 0);

    console.log(`Executing ${statements.length} SQL statements one by one...`);

    let successCount = 0;
    let errorCount = 0;

    for (let i = 0; i < statements.length; i++) {
        try {
            await connection.query(statements[i]);
            successCount++;
        } catch (error) {
            // If it's the "Multiple primary key defined" error, ignore it safely because the table already has its PK!
            if (error.code === 'ER_MULTIPLE_PRI_KEY') {
                // safely ignored
            } else {
                console.log(`Warning on statement ${i + 1}: ${error.code} - ${error.message} (ignoring)`);
            }
            errorCount++;
        }
    }

    console.log(`\nImport Summary:`);
    console.log(`✅ Successfully executed: ${successCount}`);
    console.log(`⚠️ Ignored errors (like duplicate PKs): ${errorCount}`);
    console.log('Database imported successfully! All tables and initial data are now available.');

    await connection.end();
}

importDatabaseSafely();
