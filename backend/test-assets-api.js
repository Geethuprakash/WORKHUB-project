const axios = require('axios');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const generateToken = (id, role, tenant_code) => {
    return jwt.sign({ id, role, tenant_code }, process.env.JWT_SECRET, {
        expiresIn: '30d',
    });
};

async function testApi() {
    try {
        const id = 13;
        const role = 'ADMIN';
        const tenant_code = '2345';
        
        const token = generateToken(id, role, tenant_code);
        console.log("Generated Token:", token);

        const response = await axios.post('http://127.0.0.1:5001/api/finance/assets', {
            asset_name: 'MACBOOK_PRO',
            serial_no: 'MP123',
            status: 'READY'
        }, {
            headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        console.log("API Response Success:", response.status, response.data);
        process.exit(0);
    } catch (error) {
        console.error("API Response ERROR:", error.response ? error.response.status : "No Response");
        if (error.response) {
            console.error("Error Data:", error.response.data);
        } else {
            console.error("Error Message:", error.message);
        }
        process.exit(1);
    }
}

testApi();
