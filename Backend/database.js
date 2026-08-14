const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
    connectionString: process.env.DATABASE_URL
});

pool.on('connect', () => {
    // Connected to the PostgreSQL database.
});

pool.on('error', (err) => {
    console.error('Unexpected error on idle client', err);
});

const initDb = async () => {
    try {
        await pool.query(`
            CREATE TABLE IF NOT EXISTS employees (
                id SERIAL PRIMARY KEY,
                "firstName" TEXT NOT NULL,
                "lastName" TEXT NOT NULL,
                email TEXT,
                phone TEXT,
                position TEXT,
                role TEXT,
                active BOOLEAN DEFAULT true,
                "dateHired" TEXT,
                "createdAt" TEXT,
                "updatedAt" TEXT
            );
            CREATE TABLE IF NOT EXISTS users (
                id SERIAL PRIMARY KEY,
                username TEXT NOT NULL UNIQUE,
                password TEXT NOT NULL,
                role TEXT,
                "employeeId" INTEGER REFERENCES employees(id),
                active BOOLEAN DEFAULT true,
                "createdAt" TEXT,
                "updatedAt" TEXT
            );
            CREATE TABLE IF NOT EXISTS suppliers (
                id SERIAL PRIMARY KEY,
                name TEXT NOT NULL,
                "contactPerson" TEXT,
                address TEXT,
                contact TEXT,
                email TEXT,
                "createdAt" TEXT,
                "updatedAt" TEXT
            );
            CREATE TABLE IF NOT EXISTS customers (
                id SERIAL PRIMARY KEY,
                name TEXT NOT NULL,
                "contactPerson" TEXT,
                address TEXT,
                contact TEXT,
                email TEXT,
                "createdAt" TEXT,
                "updatedAt" TEXT
            );
            CREATE TABLE IF NOT EXISTS inventory (
                id SERIAL PRIMARY KEY,
                name TEXT NOT NULL,
                category TEXT,
                unit TEXT,
                quantity REAL DEFAULT 0,
                "minStock" REAL DEFAULT 0,
                "unitCost" REAL DEFAULT 0,
                "updatedAt" TEXT
            );
            CREATE TABLE IF NOT EXISTS "stockMovements" (
                id SERIAL PRIMARY KEY,
                "itemId" INTEGER REFERENCES inventory(id),
                type TEXT,
                qty REAL,
                date TEXT,
                reference TEXT
            );
            CREATE TABLE IF NOT EXISTS purchases (
                id SERIAL PRIMARY KEY,
                "supplierId" INTEGER REFERENCES suppliers(id),
                date TEXT,
                items TEXT,
                "totalAmount" REAL,
                "createdAt" TEXT,
                "updatedAt" TEXT
            );
            CREATE TABLE IF NOT EXISTS sales (
                id SERIAL PRIMARY KEY,
                "customerId" INTEGER REFERENCES customers(id),
                date TEXT,
                items TEXT,
                "totalAmount" REAL,
                "createdAt" TEXT,
                "updatedAt" TEXT
            );
            CREATE TABLE IF NOT EXISTS deliveries (
                id SERIAL PRIMARY KEY,
                "saleId" INTEGER REFERENCES sales(id),
                "customerId" INTEGER REFERENCES customers(id),
                address TEXT,
                "scheduledDate" TEXT,
                status TEXT,
                "createdAt" TEXT,
                "updatedAt" TEXT
            );
        `);
        console.log('Connected to the PostgreSQL database. Tables initialized.');
    } catch (err) {
        console.error("Error initializing tables:", err);
    }
};

initDb();

const camelCaseCols = [
    'firstName', 'lastName', 'dateHired', 'createdAt', 'updatedAt',
    'employeeId', 'contactPerson', 'minStock', 'unitCost',
    'itemId', 'supplierId', 'totalAmount', 'customerId',
    'saleId', 'scheduledDate', 'stockMovements'
];

const convertSql = (sql) => {
    let index = 1;
    let pgSql = sql.replace(/\?/g, () => `$${index++}`);
    
    // Add quotes to camelCase identifiers that aren't quoted yet
    camelCaseCols.forEach(col => {
        const regex = new RegExp(`(?<!")\\b${col}\\b(?!")`, 'g');
        pgSql = pgSql.replace(regex, `"${col}"`);
    });

    const isInsert = pgSql.trim().toUpperCase().startsWith('INSERT');
    if (isInsert && !pgSql.toUpperCase().includes('RETURNING')) {
        pgSql += ' RETURNING id';
    }

    return pgSql;
};

// Wrap pg methods to match sqlite3 interface
const run = async (sql, params = []) => {
    const finalSql = convertSql(sql);
    const result = await pool.query(finalSql, params);
    
    const isInsert = finalSql.trim().toUpperCase().startsWith('INSERT');
    return {
        lastID: isInsert && result.rows.length > 0 ? result.rows[0].id : null,
        changes: result.rowCount
    };
};

const get = async (sql, params = []) => {
    const finalSql = convertSql(sql);
    const result = await pool.query(finalSql, params);
    return result.rows ? result.rows[0] : undefined;
};

const all = async (sql, params = []) => {
    const finalSql = convertSql(sql);
    const result = await pool.query(finalSql, params);
    return result.rows || [];
};

module.exports = { pool, run, get, all };
