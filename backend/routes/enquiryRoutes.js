const express = require('express');
const router = express.Router();
const { sendEnquiry, getEnquiries, updateEnquiryStatus } = require('../controllers/enquiryController');
const { protect } = require('../middleware/authMiddleware');

// @route   POST /api/enquiries
// @desc    Send an enquiry
// @access  Protected
router.post('/', protect, sendEnquiry);

// @route   GET /api/enquiries
// @desc    Get enquiries based on role
// @access  Protected
router.get('/', protect, getEnquiries);

// @route   PUT /api/enquiries/:id/status
// @desc    Update enquiry status
// @access  Protected
router.put('/:id/status', protect, updateEnquiryStatus);

module.exports = router;
