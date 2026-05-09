const express = require('express');
const router = express.Router();
const { getLeaveBalance, applyLeave, getMyLeaveRequests, cancelLeaveRequest, getAllLeaveRequests, updateLeaveStatus } = require('../controllers/leaveController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.get('/balance', protect, getLeaveBalance);
router.post('/apply', protect, applyLeave);
router.get('/my-requests', protect, getMyLeaveRequests);
router.delete('/:id', protect, cancelLeaveRequest);

// Admin/Manager routes
router.get('/all', protect, authorize('ADMIN', 'MANAGER'), getAllLeaveRequests);
router.put('/:id', protect, authorize('ADMIN', 'MANAGER'), updateLeaveStatus);

module.exports = router;
