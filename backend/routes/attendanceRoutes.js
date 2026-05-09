const express = require('express');
const router = express.Router();
const { checkIn, checkOut, getStatus, getTodayAttendance, getMyAttendance } = require('../controllers/attendanceController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.post('/check-in', protect, checkIn);
router.post('/check-out', protect, checkOut);
router.get('/status', protect, getStatus);
router.get('/my-history', protect, getMyAttendance);

// Admin/Manager route
router.get('/today', protect, authorize('ADMIN', 'MANAGER'), getTodayAttendance);

module.exports = router;
