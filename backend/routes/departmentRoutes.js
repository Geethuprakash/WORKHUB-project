const express = require('express');
const router = express.Router();
const { getDepartments, createDepartment, deleteDepartment } = require('../controllers/departmentController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.route('/')
    .get(protect, getDepartments)
    .post(protect, authorize('ADMIN'), createDepartment);

router.route('/:id')
    .delete(protect, authorize('ADMIN'), deleteDepartment);

module.exports = router;
