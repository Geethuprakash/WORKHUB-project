const Razorpay = require('razorpay');
const crypto = require('crypto');

const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// @desc   Create a Razorpay Order
// @route  POST /api/payment/create-order
// @access Public
const createOrder = async (req, res) => {
    require('fs').writeFileSync('debug.txt', JSON.stringify(req.body, null, 2));
    const { amount, plan_type } = req.body;

    if (!amount || !plan_type) {
        return res.status(400).json({ message: 'Amount and plan_type are required' });
    }

    try {
        const options = {
            amount: amount * 100,           // Razorpay expects paise
            currency: 'INR',
            receipt: `workhub_${plan_type}_${Date.now()}`,
            notes: {
                plan_type,
            },
        };

        const order = await razorpay.orders.create(options);
        res.status(201).json({
            success: true,
            orderId: order.id,
            amount: order.amount,
            currency: order.currency,
            key: process.env.RAZORPAY_KEY_ID,
        });
    } catch (error) {
        require('fs').writeFileSync('debug.txt', error.stack || error.message || String(error));
        console.error('Razorpay Order Error:', error);
        res.status(500).json({ message: 'Failed to create payment order' });
    }
};

// @desc   Verify Razorpay Payment Signature
// @route  POST /api/payment/verify
// @access Public
const verifyPayment = async (req, res) => {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    try {
        const body = razorpay_order_id + '|' + razorpay_payment_id;
        const expectedSignature = crypto
            .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
            .update(body)
            .digest('hex');

        if (expectedSignature === razorpay_signature) {
            res.json({ success: true, message: 'Payment verified successfully' });
        } else {
            res.status(400).json({ success: false, message: 'Payment verification failed' });
        }
    } catch (error) {
        console.error('Payment Verify Error:', error);
        res.status(500).json({ message: 'Server error during verification' });
    }
};

module.exports = { createOrder, verifyPayment };
