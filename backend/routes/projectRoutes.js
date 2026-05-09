const express = require('express');
const router = express.Router();
const db = require('../config/db');
const { protect } = require('../middleware/authMiddleware');

// GET /api/projects — list all projects for the tenant
router.get('/', protect, async (req, res) => {
    try {
        const [projects] = await db.query(
            'SELECT id, title, status FROM projects WHERE tenant_code = ? ORDER BY id',
            [req.user.tenant_code]
        );
        res.json(projects);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;
