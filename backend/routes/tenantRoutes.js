const express = require('express');
const router = express.Router();
const { getTenants, createTenant, approveTenant, rejectTenant } = require('../controllers/tenantController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.route('/')
    .get(protect, authorize('SUPER_ADMIN'), getTenants)
    .post(protect, authorize('SUPER_ADMIN'), createTenant);

router.put('/:id/approve', protect, authorize('SUPER_ADMIN'), approveTenant);
router.put('/:id/reject', protect, authorize('SUPER_ADMIN'), rejectTenant);

module.exports = router;
