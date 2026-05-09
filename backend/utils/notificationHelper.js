const db = require('../config/db');

/**
 * Creates a notification in the database.
 * 
 * @param {string} tenantCode - The tenant code
 * @param {number|null} userId - The user ID to notify, or null for all admins in the tenant
 * @param {string} type - 'TASK_UPDATE', 'PROJECT_ALERT', 'SYSTEM_MESSAGE', etc.
 * @param {string} message - The content of the notification
 */
const createNotification = async (tenantCode, userId, type, message) => {
    try {
        await db.query(
            'INSERT INTO notifications (tenant_code, user_id, type, message) VALUES (?, ?, ?, ?)',
            [tenantCode, userId || null, type, message]
        );
    } catch (error) {
        console.error("Failed to create notification:", error);
    }
};

module.exports = {
    createNotification
};
