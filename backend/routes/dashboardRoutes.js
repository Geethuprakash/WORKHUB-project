const express = require('express');
const router = express.Router();
const { getStats, getCompanyReport } = require('../controllers/dashboardController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.get('/stats', protect, authorize('ADMIN', 'MANAGER'), getStats);
router.get('/report', protect, authorize('ADMIN'), getCompanyReport);

module.exports = router;
