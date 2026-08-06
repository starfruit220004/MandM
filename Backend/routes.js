const express = require('express');
const { all, get, run } = require('./database');

const router = express.Router();

// Utility for formatting dates
function todayISO() {
    return new Date().toISOString();
}

// ==========================================
// Auth
// ==========================================
router.post('/login', async (req, res) => {
    const { username, password } = req.body;
    try {
        const user = await get('SELECT * FROM users WHERE username = ? AND password = ?', [username, password]);
        if (user) {
            const employee = await get('SELECT * FROM employees WHERE id = ?', [user.employeeId]);
            res.json({ success: true, user: { ...user, employee } });
        } else {
            res.status(401).json({ error: 'Invalid credentials' });
        }
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ==========================================
// Generic CRUD handlers
// ==========================================
const getAll = (table) => async (req, res) => {
    try {
        let items = await all(`SELECT * FROM ${table}`);
        // Parse items column for sales/purchases if they exist
        if (table === 'purchases' || table === 'sales') {
            items = items.map(item => ({
                ...item,
                items: JSON.parse(item.items)
            }));
        }
        res.json(items);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

const getById = (table) => async (req, res) => {
    try {
        const item = await get(`SELECT * FROM ${table} WHERE id = ?`, [req.params.id]);
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

const create = (table, fields) => async (req, res) => {
    try {
        const data = req.body;
        const now = todayISO();
        data.createdAt = data.createdAt || now;
        data.updatedAt = data.updatedAt || now;

        const columns = fields.concat(['createdAt', 'updatedAt']);
        const placeholders = columns.map(() => '?').join(', ');
        const values = columns.map(field => data[field]);

        const result = await run(`INSERT INTO ${table} (${columns.join(', ')}) VALUES (${placeholders})`, values);
        const newItem = await get(`SELECT * FROM ${table} WHERE id = ?`, [result.lastID]);
        res.status(201).json(newItem);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

const update = (table, fields) => async (req, res) => {
    try {
        const data = req.body;
        data.updatedAt = todayISO();
        
        const updateFields = fields.filter(f => data[f] !== undefined);
        const setString = updateFields.map(f => `${f} = ?`).concat(['updatedAt = ?']).join(', ');
        const values = updateFields.map(f => data[f]).concat([data.updatedAt, req.params.id]);

        await run(`UPDATE ${table} SET ${setString} WHERE id = ?`, values);
        const updatedItem = await get(`SELECT * FROM ${table} WHERE id = ?`, [req.params.id]);
        res.json(updatedItem);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

const remove = (table) => async (req, res) => {
    try {
        await run(`DELETE FROM ${table} WHERE id = ?`, [req.params.id]);
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// ==========================================
// Employees
// ==========================================
const employeeFields = ['firstName', 'lastName', 'email', 'phone', 'position', 'role', 'active', 'dateHired'];
router.get('/employees', getAll('employees'));
router.get('/employees/:id', getById('employees'));
router.post('/employees', create('employees', employeeFields));
router.put('/employees/:id', update('employees', employeeFields));
router.delete('/employees/:id', remove('employees'));

// ==========================================
// Suppliers
// ==========================================
const supplierFields = ['name', 'contactPerson', 'address', 'contact', 'email'];
router.get('/suppliers', getAll('suppliers'));
router.get('/suppliers/:id', getById('suppliers'));
router.post('/suppliers', create('suppliers', supplierFields));
router.put('/suppliers/:id', update('suppliers', supplierFields));
router.delete('/suppliers/:id', remove('suppliers'));

// ==========================================
// Customers
// ==========================================
const customerFields = ['name', 'contactPerson', 'address', 'contact', 'email'];
router.get('/customers', getAll('customers'));
router.get('/customers/:id', getById('customers'));
router.post('/customers', create('customers', customerFields));
router.put('/customers/:id', update('customers', customerFields));
router.delete('/customers/:id', remove('customers'));

// ==========================================
// Inventory
// ==========================================
const inventoryFields = ['name', 'category', 'unit', 'quantity', 'minStock', 'unitCost'];
router.get('/inventory', getAll('inventory'));
router.get('/inventory/:id', getById('inventory'));
router.post('/inventory', create('inventory', inventoryFields));
router.put('/inventory/:id', update('inventory', inventoryFields));
router.delete('/inventory/:id', remove('inventory'));

// ==========================================
// Stock Movements
// ==========================================
const stockMovementFields = ['itemId', 'type', 'qty', 'date', 'reference'];
router.get('/stockMovements', getAll('stockMovements'));
router.post('/stockMovements', async (req, res) => {
    try {
        const data = req.body;
        const result = await run(`INSERT INTO stockMovements (itemId, type, qty, date, reference) VALUES (?, ?, ?, ?, ?)`, 
            [data.itemId, data.type, data.qty, data.date, data.reference]);
        
        // Update inventory quantity based on type
        const inventoryItem = await get('SELECT quantity FROM inventory WHERE id = ?', [data.itemId]);
        if (inventoryItem) {
            const newQty = data.type === 'in' ? inventoryItem.quantity + data.qty : inventoryItem.quantity - data.qty;
            await run(`UPDATE inventory SET quantity = ?, updatedAt = ? WHERE id = ?`, [newQty, todayISO(), data.itemId]);
        }

        const newItem = await get(`SELECT * FROM stockMovements WHERE id = ?`, [result.lastID]);
        res.status(201).json(newItem);
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
        const result = await run(`INSERT INTO purchases (supplierId, date, items, totalAmount, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?)`, 
            [data.supplierId, data.date, itemsStr, data.totalAmount, now, now]);
        
        const purchaseId = result.lastID;

        // Create stock movements and update inventory
        for (const item of data.items) {
            await run(`INSERT INTO stockMovements (itemId, type, qty, date, reference) VALUES (?, ?, ?, ?, ?)`, 
                [item.itemId, 'in', item.qty, data.date, `Purchase #${purchaseId}`]);
            
            const inv = await get('SELECT quantity FROM inventory WHERE id = ?', [item.itemId]);
            if (inv) {
                await run('UPDATE inventory SET quantity = ?, updatedAt = ? WHERE id = ?', [inv.quantity + item.qty, now, item.itemId]);
            }
        }

        const newItem = await get(`SELECT * FROM purchases WHERE id = ?`, [purchaseId]);
        newItem.items = JSON.parse(newItem.items);
        res.status(201).json(newItem);
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
        const result = await run(`INSERT INTO sales (customerId, date, items, totalAmount, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?)`, 
            [data.customerId, data.date, itemsStr, data.totalAmount, now, now]);
        
        const saleId = result.lastID;

        // Create stock movements and update inventory
        for (const item of data.items) {
            await run(`INSERT INTO stockMovements (itemId, type, qty, date, reference) VALUES (?, ?, ?, ?, ?)`, 
                [item.itemId, 'out', item.qty, data.date, `Sale #${saleId}`]);
            
            const inv = await get('SELECT quantity FROM inventory WHERE id = ?', [item.itemId]);
            if (inv) {
                await run('UPDATE inventory SET quantity = ?, updatedAt = ? WHERE id = ?', [inv.quantity - item.qty, now, item.itemId]);
            }
        }

        const newItem = await get(`SELECT * FROM sales WHERE id = ?`, [saleId]);
        newItem.items = JSON.parse(newItem.items);
        res.status(201).json(newItem);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ==========================================
// Deliveries
// ==========================================
const deliveryFields = ['saleId', 'customerId', 'address', 'scheduledDate', 'status'];
router.get('/deliveries', getAll('deliveries'));
router.post('/deliveries', create('deliveries', deliveryFields));
router.put('/deliveries/:id', update('deliveries', deliveryFields));
router.delete('/deliveries/:id', remove('deliveries'));

// Users
router.get('/users', getAll('users'));

module.exports = router;
