const db = require('../config/db');

// @desc    Get all tasks for a tenant (or specific employee)
// @route   GET /api/tasks
// @access  Tenant Admin, Employee
const getTasks = async (req, res) => {
    try {
        let query = 'SELECT t.*, t.project_area, p.title as project_title, e.employee_code FROM tasks t LEFT JOIN projects p ON t.project_id = p.id LEFT JOIN employees e ON t.assigned_to = e.id';
        let params = [];

        if (req.user.role === 'EMPLOYEE') {
            // Get employee ID first
            const [emp] = await db.query('SELECT id FROM employees WHERE user_id = ?', [req.user.id]);
            if (emp.length > 0) {
                query += ' WHERE t.assigned_to = ?';
                params.push(emp[0].id);
            } else {
                return res.json([]); // No employee record found
            }
        } else {
            // Tenant Admin sees all tasks for their projects (Need to filter by tenant_code via project/employee joins if needed, but strict tenant separation might need explicit tenant_code on tasks table or via joins. Assuming constraints hold.)
            // For better tenant isolation, we should JOIN projects and check tenant_code
            query = 'SELECT t.*, t.project_area, p.title as project_title, e.employee_code FROM tasks t LEFT JOIN projects p ON t.project_id = p.id LEFT JOIN employees e ON t.assigned_to = e.id WHERE p.tenant_code = ?';
            params.push(req.user.tenant_code);
        }

        const [tasks] = await db.query(query, params);
        res.json(tasks);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Create a new task
// @route   POST /api/tasks
// @access  Tenant Admin, Manager
const createTask = async (req, res) => {
    const { project_id, assigned_to, title, criteria_json, project_area } = req.body;

    try {
        if (!title) return res.status(400).json({ message: 'Title is required' });

        // Validate project_id exists (FK guard) — use null if not found
        let safeProjectId = null;
        if (project_id) {
            const [proj] = await db.query(
                'SELECT id FROM projects WHERE id = ? AND tenant_code = ?',
                [project_id, req.user.tenant_code]
            );
            safeProjectId = proj.length > 0 ? proj[0].id : null;
        }

        // Validate assigned_to employee exists
        let safeAssignedTo = null;
        if (assigned_to) {
            const [emp] = await db.query(
                'SELECT id FROM employees WHERE id = ? AND tenant_code = ?',
                [assigned_to, req.user.tenant_code]
            );
            safeAssignedTo = emp.length > 0 ? emp[0].id : null;
        }

        const [result] = await db.query(
            'INSERT INTO tasks (project_id, assigned_to, title, project_area, criteria_json) VALUES (?, ?, ?, ?, ?)',
            [safeProjectId, safeAssignedTo, title, project_area || null, criteria_json ? JSON.stringify(criteria_json) : null]
        );

        res.status(201).json({ message: 'Task created', taskId: result.insertId });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Update task status
// @route   PUT /api/tasks/:id
// @access  Employee (to complete), Manager
const updateTask = async (req, res) => {
    const { is_completed, manager_comment } = req.body;
    const taskId = req.params.id;

    try {
        // TODO: Add check to ensure user owns task or is manager of tenant
        await db.query(
            'UPDATE tasks SET is_completed = ?, manager_comment = ? WHERE id = ?',
            [is_completed, manager_comment, taskId]
        );

        res.json({ message: 'Task updated' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

module.exports = { getTasks, createTask, updateTask };
