/**
 * seed-projects-tasks.js
 * Seeds default projects and sample tasks into the database.
 * Usage: node backend/seed-projects-tasks.js
 */
const db = require('./config/db');

const TENANT = 'TEST001';

async function seed() {
    try {
        console.log('--- Seeding Projects & Tasks ---\n');

        // 1. Seed Projects
        const projects = [
            { title: 'Project Alpha', client_name: 'Internal', project_type: 'Development', revenue: 500000, deadline: '2026-06-30', status: 'ONGOING' },
            { title: 'Client Portal v2', client_name: 'Acme Corp', project_type: 'Web App', revenue: 1200000, deadline: '2026-09-15', status: 'PLANNING' },
            { title: 'Data Migration', client_name: 'FinSys Ltd', project_type: 'Integration', revenue: 350000, deadline: '2026-04-20', status: 'ONGOING' },
        ];

        const projectIds = [];
        for (const proj of projects) {
            const [exists] = await db.query(
                'SELECT id FROM projects WHERE tenant_code = ? AND title = ?', [TENANT, proj.title]
            );
            if (exists.length === 0) {
                const [res] = await db.query(
                    'INSERT INTO projects (tenant_code, title, client_name, project_type, revenue, deadline, status) VALUES (?, ?, ?, ?, ?, ?, ?)',
                    [TENANT, proj.title, proj.client_name, proj.project_type, proj.revenue, proj.deadline, proj.status]
                );
                projectIds.push(res.insertId);
                console.log(`✔ Project: "${proj.title}" [ID: ${res.insertId}]`);
            } else {
                projectIds.push(exists[0].id);
                console.log(`→ Project: "${proj.title}" already exists [ID: ${exists[0].id}]`);
            }
        }

        // 2. Get employees for assignment
        const [employees] = await db.query(
            "SELECT id FROM employees WHERE tenant_code = ? AND status = 'ACTIVE' ORDER BY id", [TENANT]
        );

        if (employees.length === 0) {
            console.log('No employees found, skipping tasks.');
            process.exit(0);
        }

        // 3. Seed Tasks
        const tasks = [
            { title: 'Design System Architecture', project_idx: 0, emp_idx: 0, completed: true },
            { title: 'Setup CI/CD Pipeline', project_idx: 0, emp_idx: 1, completed: false },
            { title: 'Backend API Development', project_idx: 0, emp_idx: 2, completed: false },
            { title: 'UI Wireframe Design', project_idx: 1, emp_idx: 0, completed: true },
            { title: 'Database Schema Planning', project_idx: 1, emp_idx: 1, completed: false },
            { title: 'Data Extraction Scripts', project_idx: 2, emp_idx: 2, completed: false },
            { title: 'QA & Testing', project_idx: 2, emp_idx: 0, completed: false },
        ];

        for (const task of tasks) {
            const projectId = projectIds[task.project_idx] || null;
            const empId = employees[task.emp_idx % employees.length]?.id || null;

            const [exists] = await db.query(
                'SELECT id FROM tasks WHERE title = ? AND project_id = ?', [task.title, projectId]
            );
            if (exists.length === 0) {
                await db.query(
                    'INSERT INTO tasks (project_id, assigned_to, title, is_completed) VALUES (?, ?, ?, ?)',
                    [projectId, empId, task.title, task.completed ? 1 : 0]
                );
                console.log(`✔ Task: "${task.title}" → Project ${projectId}, Employee ${empId} [${task.completed ? 'DONE' : 'ACTIVE'}]`);
            } else {
                console.log(`→ Task: "${task.title}" already exists, skipped`);
            }
        }

        console.log('\n✅ Projects & Tasks seeded successfully!');
        process.exit(0);
    } catch (err) {
        console.error('\n❌ Seed failed:', err.message);
        process.exit(1);
    }
}

seed();
