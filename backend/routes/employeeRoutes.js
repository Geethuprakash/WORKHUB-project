const express = require('express');
const router = express.Router();
const { getEmployees, createEmployee, deleteEmployee, getProfile, updateProfile } = require('../controllers/employeeController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.route('/profile')
    .get(protect, getProfile)
    .put(protect, updateProfile);

router.route('/')
    .get(protect, authorize('ADMIN', 'MANAGER'), getEmployees)
    .post(protect, authorize('ADMIN', 'MANAGER'), createEmployee);

router.route('/:id')
    .delete(protect, authorize('ADMIN'), deleteEmployee);

module.exports = router;
