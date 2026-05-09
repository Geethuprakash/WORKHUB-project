require('dotenv').config();
const Razorpay = require('razorpay');

const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
});

async function run() {
    console.log("Keys loaded:", {
        id: process.env.RAZORPAY_KEY_ID,
        secret: process.env.RAZORPAY_KEY_SECRET ? "exists" : "missing"
    });

    const options = {
        amount: 999 * 100,
        currency: 'INR',
        receipt: `receipt_test_${Date.now()}`,
        notes: { plan_type: "BASIC" }
    };

    try {
        const order = await razorpay.orders.create(options);
        console.log("SUCCESS:", order);
    } catch (err) {
        console.error("FAIL ERROR:", err);
    }
    process.exit(0);
}

run();
