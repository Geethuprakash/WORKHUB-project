const axios = require('axios');

async function run() {
    try {
        const response = await axios.post('http://localhost:5001/api/payment/create-order', {
            amount: 999,
            plan_type: 'BASIC'
        });
        console.log('Success:', response.data);
    } catch (err) {
        if (err.response) {
            console.error('Error Response:', err.response.status, err.response.data);
        } else {
            console.error('Error Message:', err.message);
        }
    }
}

run();
