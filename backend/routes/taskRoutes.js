const express = require('express');
const router = express.Router();
const { getTasks, createTask, updateTask } = require('../controllers/taskController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.route('/')
    .get(protect, getTasks)
    .post(protect, authorize('ADMIN', 'MANAGER'), createTask);

router.route('/:id')
    .put(protect, updateTask);

module.exports = router;
