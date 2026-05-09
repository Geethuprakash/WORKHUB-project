const db = require('./config/db');
const { createNotification } = require('./utils/notificationHelper');

const seedNotifications = async () => {
    try {
        console.log('Seeding notifications...');
        
        // Get some tenants and users
        const [tenants] = await db.query('SELECT tenant_code FROM tenants LIMIT 5');
        
        for (const tenant of tenants) {
            const tenantCode = tenant.tenant_code;
            
            // System Welcome
            await createNotification(
                tenantCode, 
                null, 
                'SYSTEM_MESSAGE', 
                'Welcome to WorkHub! Your organization instance is now active and ready for configuration.'
            );
            
            // Task Alert
            await createNotification(
                tenantCode,
                null,
                'TASK_UPDATE',
                'New project objectives have been assigned to your department. Please review the Tasks module.'
            );
            
            // Finance Alert
            await createNotification(
                tenantCode,
                null,
                'FINANCE_ALERT',
                'Monthly payroll processing is now available for the current cycle.'
            );
        }
        
        console.log('Notifications seeded successfully!');
        process.exit(0);
    } catch (error) {
        console.error('Error seeding notifications:', error);
        process.exit(1);
    }
};

seedNotifications();
