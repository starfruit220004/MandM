const { run, get } = require('./database');

function daysAgo(n) {
    const d = new Date();
    d.setDate(d.getDate() - n);
    return d.toISOString().slice(0, 10);
}

function todayISO() {
    return new Date().toISOString().slice(0, 10);
}

async function seedDatabase() {
    try {
        console.log("Checking if database needs seeding...");
        const employeeCount = await get("SELECT COUNT(*) as count FROM employees");
        if (employeeCount.count > 0) {
            console.log("Database already seeded. Skipping.");
            return;
        }

        console.log("Seeding database...");

        // Employees
        const employees = [
            { id: 1, firstName: 'Marites', lastName: 'Villanueva', email: 'marites.v@cocotrade.ph', phone: '0917-201-4432', position: 'Operations Manager', role: 'admin', active: 1, dateHired: '2021-03-01', createdAt: daysAgo(900), updatedAt: daysAgo(30) },
            { id: 2, firstName: 'Renato', lastName: 'Bautista', email: 'renato.b@cocotrade.ph', phone: '0918-552-0091', position: 'Warehouse Staff', role: 'employee', active: 1, dateHired: '2022-06-15', createdAt: daysAgo(700), updatedAt: daysAgo(10) },
            { id: 3, firstName: 'Josefina', lastName: 'Cruz', email: 'jo.cruz@cocotrade.ph', phone: '0920-114-7765', position: 'Sales Associate', role: 'employee', active: 1, dateHired: '2023-01-10', createdAt: daysAgo(500), updatedAt: daysAgo(5) },
            { id: 4, firstName: 'Domingo', lastName: 'Reyes', email: 'domingo.r@cocotrade.ph', phone: '0917-773-2210', position: 'Delivery Coordinator', role: 'employee', active: 0, dateHired: '2022-11-20', createdAt: daysAgo(430), updatedAt: daysAgo(60) },
        ];
        for (const emp of employees) {
            await run(`INSERT INTO employees (id, firstName, lastName, email, phone, position, role, active, dateHired, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`, [emp.id, emp.firstName, emp.lastName, emp.email, emp.phone, emp.position, emp.role, emp.active, emp.dateHired, emp.createdAt, emp.updatedAt]);
        }

        // Users
        const users = [
            { id: 1, username: 'admin', password: 'admin123', role: 'admin', employeeId: 1, active: 1, createdAt: daysAgo(900), updatedAt: daysAgo(900) },
            { id: 2, username: 'renato', password: 'employee123', role: 'employee', employeeId: 2, active: 1, createdAt: daysAgo(700), updatedAt: daysAgo(700) },
            { id: 3, username: 'josefina', password: 'employee123', role: 'employee', employeeId: 3, active: 1, createdAt: daysAgo(500), updatedAt: daysAgo(500) },
        ];
        for (const u of users) {
            await run(`INSERT INTO users (id, username, password, role, employeeId, active, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`, [u.id, u.username, u.password, u.role, u.employeeId, u.active, u.createdAt, u.updatedAt]);
        }

        // Suppliers
        const suppliers = [
            { id: 1, name: 'Zamboanga Copra Growers Coop', contactPerson: 'Juan Dela Cruz', address: 'Sitio Lumbayao, Zamboanga City', contact: '0917-330-8841', email: 'contact@zcgc.ph', createdAt: daysAgo(800), updatedAt: daysAgo(800) },
            { id: 2, name: 'Bautista Coconut Farms', contactPerson: 'Maria Bautista', address: 'Barangay San Roque, Curuan, Zamboanga City', contact: '0918-442-1190', email: 'bautistafarms@gmail.com', createdAt: daysAgo(650), updatedAt: daysAgo(650) },
            { id: 3, name: 'Isabela Coco Suppliers Inc.', contactPerson: 'Pedro Santiago', address: 'Isabela City, Basilan', contact: '0920-556-3302', email: 'sales@isabelacoco.ph', createdAt: daysAgo(400), updatedAt: daysAgo(400) },
            { id: 4, name: 'Mindanao Husk & Copra Traders', contactPerson: 'Ahmad Ali', address: 'Sinunuc, Zamboanga City', contact: '0917-660-9954', email: 'info@mhct.ph', createdAt: daysAgo(200), updatedAt: daysAgo(200) },
        ];
        for (const s of suppliers) {
            await run(`INSERT INTO suppliers (id, name, contactPerson, address, contact, email, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`, [s.id, s.name, s.contactPerson, s.address, s.contact, s.email, s.createdAt, s.updatedAt]);
        }

        // Customers
        const customers = [
            { id: 1, name: 'Southern Oil Mills Corp.', contactPerson: 'Roberto Carlos', address: 'Ayala, Zamboanga City', contact: '0917-880-2213', email: 'procurement@southernoil.ph', createdAt: daysAgo(600), updatedAt: daysAgo(600) },
            { id: 2, name: 'Dela Cruz Sari-Sari & Trading', contactPerson: 'Elena Dela Cruz', address: 'Tetuan, Zamboanga City', contact: '0918-224-7761', email: 'delacruztrading@gmail.com', createdAt: daysAgo(300), updatedAt: daysAgo(300) },
            { id: 3, name: 'Pacific Desiccated Coconut Co.', contactPerson: 'Arthur Pendragon', address: 'Guiwan, Zamboanga City', contact: '0920-113-8842', email: 'orders@pacificdesiccated.ph', createdAt: daysAgo(250), updatedAt: daysAgo(250) },
            { id: 4, name: 'Villareal Copra Export', contactPerson: 'Sofia Villareal', address: 'Baliwasan, Zamboanga City', contact: '0917-556-9021', email: 'villareal.export@gmail.com', createdAt: daysAgo(150), updatedAt: daysAgo(150) },
        ];
        for (const c of customers) {
            await run(`INSERT INTO customers (id, name, contactPerson, address, contact, email, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`, [c.id, c.name, c.contactPerson, c.address, c.contact, c.email, c.createdAt, c.updatedAt]);
        }

        // Inventory
        const inventory = [
            { id: 1, name: 'Copra (Dried Coconut)', category: 'Processed', unit: 'kg', quantity: 5200, minStock: 1000, unitCost: 32, updatedAt: daysAgo(1) },
            { id: 2, name: 'Charcoal', category: 'Processed', unit: 'kg', quantity: 3100, minStock: 500, unitCost: 15, updatedAt: daysAgo(1) },
        ];
        for (const i of inventory) {
            await run(`INSERT INTO inventory (id, name, category, unit, quantity, minStock, unitCost, updatedAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`, [i.id, i.name, i.category, i.unit, i.quantity, i.minStock, i.unitCost, i.updatedAt]);
        }

        // StockMovements
        const movements = [
            { id: 1, itemId: 1, type: 'in', qty: 2000, date: daysAgo(6), reference: 'Purchase #1' },
            { id: 2, itemId: 2, type: 'in', qty: 1200, date: daysAgo(5), reference: 'Purchase #2' },
            { id: 3, itemId: 1, type: 'out', qty: 450, date: daysAgo(2), reference: 'Sale #1' },
            { id: 4, itemId: 2, type: 'out', qty: 400, date: daysAgo(1), reference: 'Sale #2' },
        ];
        for (const m of movements) {
            await run(`INSERT INTO stockMovements (id, itemId, type, qty, date, reference) VALUES (?, ?, ?, ?, ?, ?)`, [m.id, m.itemId, m.type, m.qty, m.date, m.reference]);
        }

        // Purchases
        const purchases = [
            { id: 1, supplierId: 1, date: daysAgo(6), items: [{ itemId: 1, itemName: 'Copra (Dried Coconut)', qty: 2000, unitPrice: 29.5, total: 59000 }], totalAmount: 59000, createdAt: daysAgo(6), updatedAt: daysAgo(6) },
            { id: 2, supplierId: 2, date: daysAgo(5), items: [{ itemId: 2, itemName: 'Charcoal', qty: 1200, unitPrice: 12.0, total: 14400 }], totalAmount: 14400, createdAt: daysAgo(5), updatedAt: daysAgo(5) },
            { id: 3, supplierId: 4, date: daysAgo(3), items: [{ itemId: 1, itemName: 'Copra (Dried Coconut)', qty: 500, unitPrice: 29.5, total: 14750 }, { itemId: 2, itemName: 'Charcoal', qty: 800, unitPrice: 12.0, total: 9600 }], totalAmount: 24350, createdAt: daysAgo(3), updatedAt: daysAgo(3) },
        ];
        for (const p of purchases) {
            await run(`INSERT INTO purchases (id, supplierId, date, items, totalAmount, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?, ?)`, [p.id, p.supplierId, p.date, JSON.stringify(p.items), p.totalAmount, p.createdAt, p.updatedAt]);
        }

        // Sales
        const sales = [
            { id: 1, customerId: 1, date: daysAgo(2), items: [{ itemId: 1, itemName: 'Copra (Dried Coconut)', qty: 450, price: 35, total: 15750 }], totalAmount: 15750, createdAt: daysAgo(2), updatedAt: daysAgo(2) },
            { id: 2, customerId: 3, date: daysAgo(1), items: [{ itemId: 2, itemName: 'Charcoal', qty: 400, price: 18, total: 7200 }], totalAmount: 7200, createdAt: daysAgo(1), updatedAt: daysAgo(1) },
            { id: 3, customerId: 2, date: todayISO(), items: [{ itemId: 1, itemName: 'Copra (Dried Coconut)', qty: 300, price: 35, total: 10500 }, { itemId: 2, itemName: 'Charcoal', qty: 150, price: 18, total: 2700 }], totalAmount: 13200, createdAt: todayISO(), updatedAt: todayISO() },
        ];
        for (const s of sales) {
            await run(`INSERT INTO sales (id, customerId, date, items, totalAmount, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?, ?)`, [s.id, s.customerId, s.date, JSON.stringify(s.items), s.totalAmount, s.createdAt, s.updatedAt]);
        }

        // Deliveries
        const deliveries = [
            { id: 1, saleId: 1, customerId: 1, address: 'Ayala, Zamboanga City', scheduledDate: daysAgo(1), status: 'Delivered', createdAt: daysAgo(2), updatedAt: daysAgo(1) },
            { id: 2, saleId: 2, customerId: 3, address: 'Guiwan, Zamboanga City', scheduledDate: todayISO(), status: 'In Transit', createdAt: daysAgo(1), updatedAt: todayISO() },
            { id: 3, saleId: 3, customerId: 2, address: 'Tetuan, Zamboanga City', scheduledDate: daysAgo(-1), status: 'Pending', createdAt: todayISO(), updatedAt: todayISO() },
        ];
        for (const d of deliveries) {
            await run(`INSERT INTO deliveries (id, saleId, customerId, address, scheduledDate, status, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`, [d.id, d.saleId, d.customerId, d.address, d.scheduledDate, d.status, d.createdAt, d.updatedAt]);
        }
        
        console.log("Database seeded successfully.");
    } catch (err) {
        console.error("Error seeding database:", err);
    }
}

module.exports = { seedDatabase };
