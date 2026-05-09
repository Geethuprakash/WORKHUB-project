const db = require('../config/db');

// @desc    Send an enquiry
// @route   POST /api/enquiries
// @access  Protected
const sendEnquiry = async (req, res) => {
    try {
        const { subject, message, receiver_id, receiver_role, parent_id } = req.body;
        const sender_id = req.user.id;
        const sender_role = req.user.role;
        const tenant_code = req.user.tenant_code;

        if (!subject || !message) {
            return res.status(400).json({ message: 'Subject and message are required' });
        }

        // Validate sender/receiver routing rules
        // Employee can send to Manager or Admin
        if (sender_role === 'EMPLOYEE') {
            if (receiver_role && !['MANAGER', 'ADMIN'].includes(receiver_role)) {
                return res.status(400).json({ message: 'Employees can only send enquiries to Manager or Admin' });
            }
        }
        // Manager can send to Admin
        else if (sender_role === 'MANAGER') {
            if (receiver_role && receiver_role !== 'ADMIN') {
                return res.status(400).json({ message: 'Managers can only send enquiries to Admin' });
            }
        }

        const sql = `
            INSERT INTO enquiries (tenant_code, sender_id, sender_role, receiver_id, receiver_role, subject, message, parent_id)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `;

        const [result] = await db.query(sql, [
            tenant_code,
            sender_id,
            sender_role,
            receiver_id || null,
            receiver_role || 'ADMIN', // Default to ADMIN if not specified
            subject,
            message,
            parent_id || null
        ]);

        res.status(201).json({
            message: 'Enquiry sent successfully',
            enquiryId: result.insertId
        });

    } catch (error) {
        console.error('Error sending enquiry:', error);
        res.status(500).json({ message: 'Internal Server Error', error: error.message });
    }
};

// @desc    Get enquiries based on role
// @route   GET /api/enquiries
// @access  Protected
const getEnquiries = async (req, res) => {
    try {
        const tenant_code = req.user.tenant_code;
        const user_id = req.user.id;
        const role = req.user.role;

        let sql = '';
        let params = [];

        if (role === 'ADMIN') {
            // Admin sees all enquiries for this tenant
            sql = `
                SELECT e.*, 
                       u_sender.display_name as sender_name, u_sender.email as sender_email,
                       u_receiver.display_name as receiver_name, u_receiver.email as receiver_email
                FROM enquiries e
                LEFT JOIN users u_sender ON e.sender_id = u_sender.id
                LEFT JOIN users u_receiver ON e.receiver_id = u_receiver.id
                WHERE e.tenant_code = ?
                ORDER BY e.created_at DESC
            `;
            params = [tenant_code];
        } 
        else if (role === 'MANAGER') {
            // Manager sees enquiries sent to them (receiver_id)
            // OR enquiries sent to 'MANAGER' role generally (where they might be the intended recipient)
            // OR enquiries from Employees in their department
            
            // First, find the manager's department
            const [managerDept] = await db.query(
                `SELECT department_id FROM employees WHERE user_id = ?`,
                [user_id]
            );

            const department_id = managerDept[0]?.department_id;

            if (department_id) {
                sql = `
                    SELECT DISTINCT e.*, 
                           u_sender.display_name as sender_name, u_sender.email as sender_email,
                           u_receiver.display_name as receiver_name, u_receiver.email as receiver_email
                    FROM enquiries e
                    LEFT JOIN users u_sender ON e.sender_id = u_sender.id
                    LEFT JOIN users u_receiver ON e.receiver_id = u_receiver.id
                    WHERE e.tenant_code = ? 
                      AND (
                        e.receiver_id = ? 
                        OR e.receiver_role = 'MANAGER'
                        OR e.sender_id = ?
                        OR (e.sender_role = 'EMPLOYEE' AND e.sender_id IN (
                            SELECT user_id FROM employees WHERE department_id = ?
                        ))
                        OR e.parent_id IN (
                            SELECT id FROM enquiries 
                            WHERE tenant_code = ? AND (
                                receiver_id = ? 
                                OR receiver_role = 'MANAGER'
                                OR sender_id = ?
                                OR (sender_role = 'EMPLOYEE' AND sender_id IN (SELECT user_id FROM employees WHERE department_id = ?))
                            )
                        )
                      )
                    ORDER BY e.created_at DESC
                `;
                params = [tenant_code, user_id, user_id, department_id, tenant_code, user_id, user_id, department_id];
            } else {
                // If manager has no department, they can only see directly sent to them or sent by them
                sql = `
                    SELECT e.*, 
                           u_sender.display_name as sender_name, u_sender.email as sender_email,
                           u_receiver.display_name as receiver_name, u_receiver.email as receiver_email
                    FROM enquiries e
                    LEFT JOIN users u_sender ON e.sender_id = u_sender.id
                    LEFT JOIN users u_receiver ON e.receiver_id = u_receiver.id
                    WHERE e.tenant_code = ? AND (
                        e.receiver_id = ? 
                        OR e.receiver_role = 'MANAGER'
                        OR e.sender_id = ?
                        OR e.parent_id IN (
                            SELECT id FROM enquiries WHERE tenant_code = ? AND (receiver_id = ? OR receiver_role = 'MANAGER' OR sender_id = ?)
                        )
                    )
                    ORDER BY e.created_at DESC
                `;
                params = [tenant_code, user_id, user_id, tenant_code, user_id, user_id];
            }
        } 
        else if (role === 'EMPLOYEE') {
            // Employee sees enquiries they sent
            // OR replies sent to them specifically
            sql = `
                SELECT e.*, 
                       u_sender.display_name as sender_name, u_sender.email as sender_email,
                       u_receiver.display_name as receiver_name, u_receiver.email as receiver_email
                FROM enquiries e
                LEFT JOIN users u_sender ON e.sender_id = u_sender.id
                LEFT JOIN users u_receiver ON e.receiver_id = u_receiver.id
                WHERE e.tenant_code = ? AND (
                    e.sender_id = ? 
                    OR e.receiver_id = ?
                    OR e.parent_id IN (
                        SELECT id FROM enquiries WHERE tenant_code = ? AND (e.sender_id = ? OR e.receiver_id = ?)
                    )
                )
                ORDER BY e.created_at DESC
            `;
            params = [tenant_code, user_id, user_id, tenant_code, user_id, user_id];
        }

        const [enquiries] = await db.query(sql, params);
        res.status(200).json(enquiries);

    } catch (error) {
        console.error('Error fetching enquiries:', error);
        res.status(500).json({ message: 'Internal Server Error', error: error.message });
    }
};

// @desc    Update enquiry status
// @route   PUT /api/enquiries/:id/status
// @access  Protected
const updateEnquiryStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;
        const tenant_code = req.user.tenant_code;

        if (!status || !['UNREAD', 'READ', 'RESOLVED'].includes(status)) {
            return res.status(400).json({ message: 'Invalid status' });
        }

        const sql = `
            UPDATE enquiries 
            SET status = ? 
            WHERE id = ? AND tenant_code = ?
        `;

        const [result] = await db.query(sql, [status, id, tenant_code]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Enquiry not found' });
        }

        res.status(200).json({ message: 'Enquiry status updated successfully' });

    } catch (error) {
        console.error('Error updating enquiry status:', error);
        res.status(500).json({ message: 'Internal Server Error', error: error.message });
    }
};

module.exports = {
    sendEnquiry,
    getEnquiries,
    updateEnquiryStatus
};
