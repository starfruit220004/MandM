const express = require('express');
const prisma = require('./prismaClient');

const router = express.Router();

function todayISO() {
    return new Date().toISOString();
}

// ==========================================
// Auth
// ==========================================
router.post('/mamik', async (req, res) => {
    const { username, password } = req.body;
    try {
        const user = await prisma.users.findUnique({
            where: { username }
        });
        
        if (user && user.password === password) {
            let employee = null;
            if (user.employeeId) {
                employee = await prisma.employees.findUnique({
                    where: { id: user.employeeId }
                });
            }
            res.json({ success: true, user: { ...user, employee } });
        } else {
            res.status(401).json({ error: 'Invalid credentials' });
        }
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.post('/forgot-password', async (req, res) => {
    const { username } = req.body;
    try {
        const user = await prisma.users.findUnique({
            where: { username }
        });
        res.json({ success: true, message: 'If the username exists, a reset link was sent.' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ==========================================
// Generic CRUD handlers
// ==========================================
const getAll = (table) => async (req, res) => {
    try {
        let items = await prisma[table].findMany();
        if (table === 'purchases' || table === 'sales') {
            items = items.map(item => ({
                ...item,
                items: item.items ? JSON.parse(item.items) : []
            }));
        }
        res.json(items);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

const getById = (table) => async (req, res) => {
    try {
        const item = await prisma[table].findUnique({
            where: { id: parseInt(req.params.id) }
        });
        if (item) {
            if ((table === 'purchases' || table === 'sales') && item.items) {
                item.items = JSON.parse(item.items);
            }
            res.json(item);
        } else {
            res.status(404).json({ error: 'Not found' });
        }
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

const create = (table) => async (req, res) => {
    try {
        const data = { ...req.body };
        const now = todayISO();
        data.createdAt = data.createdAt || now;
        data.updatedAt = data.updatedAt || now;

        const newItem = await prisma[table].create({ data });
        res.status(201).json(newItem);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

const update = (table) => async (req, res) => {
    try {
        const data = { ...req.body };
        data.updatedAt = todayISO();
        
        // Remove id from data to avoid updating primary key
        delete data.id;

        const updatedItem = await prisma[table].update({
            where: { id: parseInt(req.params.id) },
            data
        });
        res.json(updatedItem);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

const remove = (table) => async (req, res) => {
    try {
        await prisma[table].delete({
            where: { id: parseInt(req.params.id) }
        });
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// ==========================================
// Employees
// ==========================================
router.get('/employees', getAll('employees'));
router.get('/employees/:id', getById('employees'));
router.post('/employees', create('employees'));
router.put('/employees/:id', update('employees'));
router.delete('/employees/:id', remove('employees'));

// ==========================================
// Suppliers
// ==========================================
router.get('/suppliers', getAll('suppliers'));
router.get('/suppliers/:id', getById('suppliers'));
router.post('/suppliers', create('suppliers'));
router.put('/suppliers/:id', update('suppliers'));
router.delete('/suppliers/:id', remove('suppliers'));

// ==========================================
// Customers
// ==========================================
router.get('/customers', getAll('customers'));
router.get('/customers/:id', getById('customers'));
router.post('/customers', create('customers'));
router.put('/customers/:id', update('customers'));
router.delete('/customers/:id', remove('customers'));

// ==========================================
// Inventory
// ==========================================
router.get('/inventory', getAll('inventory'));
router.get('/inventory/:id', getById('inventory'));
router.post('/inventory', create('inventory'));
router.put('/inventory/:id', update('inventory'));
router.delete('/inventory/:id', remove('inventory'));

// ==========================================
// Stock Movements
// ==========================================
router.get('/stockMovements', getAll('stockMovements'));
router.post('/stockMovements', async (req, res) => {
    try {
        const data = req.body;
        
        const result = await prisma.$transaction(async (tx) => {
            const movement = await tx.stockMovements.create({
                data: {
                    itemId: data.itemId,
                    type: data.type,
                    qty: data.qty,
                    date: data.date,
                    reference: data.reference
                }
            });

            const inventoryItem = await tx.inventory.findUnique({ where: { id: data.itemId } });
            if (inventoryItem) {
                const newQty = data.type === 'in' ? inventoryItem.quantity + data.qty : inventoryItem.quantity - data.qty;
                await tx.inventory.update({
                    where: { id: data.itemId },
                    data: { quantity: newQty, updatedAt: todayISO() }
                });
            }
            return movement;
        });

        res.status(201).json(result);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ==========================================
// Purchases
// ==========================================
router.get('/purchases', getAll('purchases'));
router.post('/purchases', async (req, res) => {
    try {
        const data = req.body;
        const now = todayISO();
        
        const itemsStr = JSON.stringify(data.items);
        
        const result = await prisma.$transaction(async (tx) => {
            const purchase = await tx.purchases.create({
                data: {
                    supplierId: data.supplierId,
                    date: data.date,
                    items: itemsStr,
                    totalAmount: data.totalAmount,
                    createdAt: now,
                    updatedAt: now
                }
            });
            
            for (const item of data.items) {
                await tx.stockMovements.create({
                    data: {
                        itemId: item.itemId,
                        type: 'in',
                        qty: item.qty,
                        date: data.date,
                        reference: `Purchase #${purchase.id}`
                    }
                });
                
                const inv = await tx.inventory.findUnique({ where: { id: item.itemId } });
                if (inv) {
                    await tx.inventory.update({
                        where: { id: item.itemId },
                        data: { quantity: inv.quantity + item.qty, updatedAt: now }
                    });
                }
            }
            return purchase;
        });

        result.items = JSON.parse(result.items);
        res.status(201).json(result);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ==========================================
// Sales
// ==========================================
router.get('/sales', getAll('sales'));
router.post('/sales', async (req, res) => {
    try {
        const data = req.body;
        const now = todayISO();
        
        const itemsStr = JSON.stringify(data.items);
        
        const result = await prisma.$transaction(async (tx) => {
            const sale = await tx.sales.create({
                data: {
                    customerId: data.customerId,
                    date: data.date,
                    items: itemsStr,
                    totalAmount: data.totalAmount,
                    createdAt: now,
                    updatedAt: now
                }
            });
            
            for (const item of data.items) {
                await tx.stockMovements.create({
                    data: {
                        itemId: item.itemId,
                        type: 'out',
                        qty: item.qty,
                        date: data.date,
                        reference: `Sale #${sale.id}`
                    }
                });
                
                const inv = await tx.inventory.findUnique({ where: { id: item.itemId } });
                if (inv) {
                    await tx.inventory.update({
                        where: { id: item.itemId },
                        data: { quantity: inv.quantity - item.qty, updatedAt: now }
                    });
                }
            }
            return sale;
        });

        result.items = JSON.parse(result.items);
        res.status(201).json(result);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ==========================================
// Deliveries
// ==========================================
router.get('/deliveries', getAll('deliveries'));
router.post('/deliveries', create('deliveries'));
router.put('/deliveries/:id', update('deliveries'));
router.delete('/deliveries/:id', remove('deliveries'));

// Users
router.get('/users', getAll('users'));

// ==========================================
// Landing Page CMS
// ==========================================
router.get('/landing-page', async (req, res) => {
    try {
        const item = await prisma.landing_page.findFirst({
            orderBy: { id: 'asc' }
        });
        if (item) {
            item.features = JSON.parse(item.features || '[]');
            res.json(item);
        } else {
            res.status(404).json({ error: 'Landing page data not found' });
        }
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.put('/landing-page', async (req, res) => {
    try {
        const data = req.body;
        const featuresStr = JSON.stringify(data.features || []);
        const now = todayISO();
        
        const first = await prisma.landing_page.findFirst({
            orderBy: { id: 'asc' }
        });
        
        let updated;
        if (first) {
            updated = await prisma.landing_page.update({
                where: { id: first.id },
                data: {
                    title: data.title,
                    subtitle: data.subtitle,
                    hero_image: data.hero_image,
                    features: featuresStr,
                    contact_email: data.contact_email,
                    updatedAt: now
                }
            });
        } else {
            updated = await prisma.landing_page.create({
                data: {
                    title: data.title,
                    subtitle: data.subtitle,
                    hero_image: data.hero_image,
                    features: featuresStr,
                    contact_email: data.contact_email,
                    updatedAt: now
                }
            });
        }
            
        updated.features = JSON.parse(updated.features || '[]');
        res.json(updated);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
