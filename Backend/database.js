const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.resolve(__dirname, 'mandm.sqlite');
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('Error opening database', err.message);
    } else {
        console.log('Connected to the SQLite database.');
        
        // Enable foreign keys
        db.run('PRAGMA foreign_keys = ON');

        // Create tables
        const queries = [
            `CREATE TABLE IF NOT EXISTS employees (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                firstName TEXT NOT NULL,
                lastName TEXT NOT NULL,
                email TEXT,
                phone TEXT,
                position TEXT,
                role TEXT,
                active BOOLEAN DEFAULT 1,
                dateHired TEXT,
                createdAt TEXT,
                updatedAt TEXT
            )`,
            `CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                username TEXT NOT NULL UNIQUE,
                password TEXT NOT NULL,
                role TEXT,
                employeeId INTEGER,
                active BOOLEAN DEFAULT 1,
                createdAt TEXT,
                updatedAt TEXT,
                FOREIGN KEY (employeeId) REFERENCES employees(id)
            )`,
            `CREATE TABLE IF NOT EXISTS suppliers (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                contactPerson TEXT,
                address TEXT,
                contact TEXT,
                email TEXT,
                createdAt TEXT,
                updatedAt TEXT
            )`,
            `CREATE TABLE IF NOT EXISTS customers (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                contactPerson TEXT,
                address TEXT,
                contact TEXT,
                email TEXT,
                createdAt TEXT,
                updatedAt TEXT
            )`,
            `CREATE TABLE IF NOT EXISTS inventory (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                category TEXT,
                unit TEXT,
                quantity REAL DEFAULT 0,
                minStock REAL DEFAULT 0,
                unitCost REAL DEFAULT 0,
                updatedAt TEXT
            )`,
            `CREATE TABLE IF NOT EXISTS stockMovements (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                itemId INTEGER,
                type TEXT,
                qty REAL,
                date TEXT,
                reference TEXT,
                FOREIGN KEY (itemId) REFERENCES inventory(id)
            )`,
            `CREATE TABLE IF NOT EXISTS purchases (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                supplierId INTEGER,
                date TEXT,
                items TEXT, -- Stored as JSON string
                totalAmount REAL,
                createdAt TEXT,
                updatedAt TEXT,
                FOREIGN KEY (supplierId) REFERENCES suppliers(id)
            )`,
            `CREATE TABLE IF NOT EXISTS sales (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                customerId INTEGER,
                date TEXT,
                items TEXT, -- Stored as JSON string
                totalAmount REAL,
                createdAt TEXT,
                updatedAt TEXT,
                FOREIGN KEY (customerId) REFERENCES customers(id)
            )`,
            `CREATE TABLE IF NOT EXISTS deliveries (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                saleId INTEGER,
                customerId INTEGER,
                address TEXT,
                scheduledDate TEXT,
                status TEXT,
                createdAt TEXT,
                updatedAt TEXT,
                FOREIGN KEY (saleId) REFERENCES sales(id),
                FOREIGN KEY (customerId) REFERENCES customers(id)
            )`
        ];

        db.serialize(() => {
            queries.forEach(query => db.run(query, (err) => {
                if (err) console.error("Error executing query:", err);
            }));
        });
    }
});

// Wrap db methods in promises for easier async/await usage
const run = (sql, params = []) => {
    return new Promise((resolve, reject) => {
        db.run(sql, params, function (err) {
            if (err) reject(err);
            else resolve(this);
        });
    });
};

const get = (sql, params = []) => {
    return new Promise((resolve, reject) => {
        db.get(sql, params, (err, result) => {
            if (err) reject(err);
            else resolve(result);
        });
    });
};

const all = (sql, params = []) => {
    return new Promise((resolve, reject) => {
        db.all(sql, params, (err, rows) => {
            if (err) reject(err);
            else resolve(rows);
        });
    });
};

module.exports = { db, run, get, all };
