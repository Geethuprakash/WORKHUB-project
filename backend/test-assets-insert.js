const db = require('./config/db');

async function testInsert() {
    try {
        const tenant_code = 'P-005';
        const asset_name = 'MACBOOK';
        const serial_no = 'MC';
        const status = 'READY';

        const [result] = await db.query(
            'INSERT INTO assets (tenant_code, asset_name, serial_no, status) VALUES (?, ?, ?, ?)',
            [tenant_code, asset_name, serial_no, status]
        );
        console.log("Insert Success:", result.insertId);
        process.exit(0);
    } catch (error) {
        console.error("FAIL Insert Error Details:", error.message);
        console.error(error);
        process.exit(1);
    }
}

testInsert();
