const express = require('express');
const router = express.Router();
const { getPerformanceScore, requestBonus, updateBonusStatus, getBonuses, generateAutoBonuses } = require('../controllers/bonusController');
const { protect, authorize } = require('../middleware/authMiddleware');

// Get performance and bonuses - Private for everyone, with selective filters based on role
router.get('/', protect, getBonuses);
router.get('/performance/:employeeId', protect, authorize('ADMIN'), getPerformanceScore);

// Request a bonus - Manager/Admin
router.post('/request', protect, authorize('ADMIN'), requestBonus);

// Update status - Admin only
router.put('/:id/status', protect, authorize('ADMIN'), updateBonusStatus);
router.post('/auto-generate', protect, authorize('ADMIN'), generateAutoBonuses);

module.exports = router;
