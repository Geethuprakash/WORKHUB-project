const express = require('express');
const router = express.Router();
const { getSalary, addSalary, getAssets, addAsset, processPayroll, getPayroll, markPaid, assignAsset, requestAsset, getAssetRequests } = require('../controllers/financeController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.get('/salary', protect, getSalary);
router.post('/salary', protect, authorize('ADMIN'), addSalary);
router.get('/assets', protect, getAssets);
router.get('/assets/requests', protect, authorize('ADMIN', 'MANAGER'), getAssetRequests);
router.post('/assets', protect, authorize('ADMIN'), addAsset);
router.put('/assets/assign/:id', protect, authorize('MANAGER'), assignAsset);
router.post('/assets/request', protect, authorize('EMPLOYEE'), requestAsset);

router.get('/payroll', protect, getPayroll);
router.post('/payroll/process', protect, authorize('ADMIN', 'MANAGER'), processPayroll);
router.put('/payroll/pay/:id', protect, authorize('ADMIN', 'MANAGER'), markPaid);

module.exports = router;
