const prisma = require('./prismaClient');

const initDb = async () => {
    try {
        console.log('Checking database initialization...');
        
        // Dynamic initialization of admin if no users exist
        const userCount = await prisma.users.count();
        if (userCount === 0) {
            const now = new Date().toISOString();
            
            // Create a default employee for the admin
            const emp = await prisma.employees.create({
                data: {
                    firstName: 'Default',
                    lastName: 'Admin',
                    email: 'admin@example.com',
                    role: 'admin',
                    active: true,
                    createdAt: now,
                    updatedAt: now
                }
            });
            
            // Create the default admin user
            await prisma.users.create({
                data: {
                    username: 'admin',
                    password: 'admin123',
                    role: 'admin',
                    employeeId: emp.id,
                    active: true,
                    createdAt: now,
                    updatedAt: now
                }
            });
            console.log('No users found. Created default admin user (admin / admin123). Please change the password.');
        }

        const landingCount = await prisma.landing_page.count();
        if (landingCount === 0) {
            const features = JSON.stringify([
                { title: "Inventory Tracking", description: "Keep track of every coconut from farm to warehouse." },
                { title: "Sales & Deliveries", description: "Manage customer orders and dispatch deliveries seamlessly." },
                { title: "Analytics", description: "Get real-time insights into your trading operations." }
            ]);
            await prisma.landing_page.create({
                data: {
                    title: 'CocoTrade - Business Management System',
                    subtitle: 'From husk to harvest, every transaction tracked.',
                    hero_image: '/hero.jpg',
                    features: features,
                    contact_email: 'contact@cocotrade.ph',
                    updatedAt: new Date().toISOString()
                }
            });
        }
        
        console.log('Database initialization check complete.');

    } catch (err) {
        console.error("Error initializing tables:", err);
    }
};

initDb();

module.exports = {};
