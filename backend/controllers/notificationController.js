const db = require('../config/db');

// @desc    Get all notifications for a user/tenant
// @route   GET /api/notifications
// @access  Private
const getNotifications = async (req, res) => {
    try {
        const tenantCode = req.user.tenant_code;
        const userId = req.user.id;

        // Fetch notifications specific to the user, or broadcasted to the tenant (user_id IS NULL)
        const [notifications] = await db.query(
            `SELECT * FROM notifications 
             WHERE tenant_code = ? AND (user_id = ? OR user_id IS NULL)
             ORDER BY created_at DESC LIMIT 50`,
            [tenantCode, userId]
        );

        // Count unread notifications
        const [unreadCount] = await db.query(
            `SELECT COUNT(*) as count FROM notifications 
             WHERE tenant_code = ? AND (user_id = ? OR user_id IS NULL) AND is_read = 0`,
            [tenantCode, userId]
        );

        res.json({
            notifications,
            unreadCount: unreadCount[0].count
        });
    } catch (error) {
        console.error("Error fetching notifications:", error);
        res.status(500).json({ message: 'Server error fetching notifications' });
    }
};

// @desc    Mark a notification as read
// @route   PUT /api/notifications/:id/read
// @access  Private
const markAsRead = async (req, res) => {
    try {
        const { id } = req.params;
        const tenantCode = req.user.tenant_code;

        // Ensure the notification belongs to this tenant
        const [result] = await db.query(
            'UPDATE notifications SET is_read = 1 WHERE id = ? AND tenant_code = ?',
            [id, tenantCode]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Notification not found' });
        }

        res.json({ message: 'Marked as read' });
    } catch (error) {
        console.error("Error marking notification read:", error);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Mark all notifications as read
// @route   PUT /api/notifications/read-all
// @access  Private
const markAllAsRead = async (req, res) => {
    try {
        const tenantCode = req.user.tenant_code;
        const userId = req.user.id;

        await db.query(
            'UPDATE notifications SET is_read = 1 WHERE tenant_code = ? AND (user_id = ? OR user_id IS NULL)',
            [tenantCode, userId]
        );

        res.json({ message: 'All notifications marked as read' });
    } catch (error) {
        console.error("Error marking all read:", error);
        res.status(500).json({ message: 'Server error' });
    }
};

module.exports = {
    getNotifications,
    markAsRead,
    markAllAsRead
};
