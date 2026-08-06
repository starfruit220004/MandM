# Backend Development Tracker

This document tracks the progress of the backend development for the MandM Coconut ERP system.

## Setup & Configuration
- [x] Initialize Node.js project (`package.json`)
- [x] Install dependencies (`express`, `cors`, `sqlite3`, `morgan`)
- [x] Setup Express server (`index.js`)
- [x] Setup SQLite Database connection

## Database Schema (SQLite)
- [x] Create `employees` table
- [x] Create `users` table
- [x] Create `suppliers` table
- [x] Create `customers` table
- [x] Create `inventory` table
- [x] Create `stockMovements` table
- [x] Create `purchases` table
- [x] Create `sales` table
- [x] Create `deliveries` table
- [x] Seed database with initial data (migrate from frontend `seed.js`)

## API Endpoints (CRUD)
- [x] **Auth / Users**
  - [x] `POST /api/login`
  - [x] `GET /api/users`
- [x] **Employees**
  - [x] `GET /api/employees`
  - [x] `POST /api/employees`
  - [x] `PUT /api/employees/:id`
  - [x] `DELETE /api/employees/:id`
- [x] **Suppliers**
  - [x] `GET /api/suppliers`
  - [x] `POST /api/suppliers`
  - [x] `PUT /api/suppliers/:id`
  - [x] `DELETE /api/suppliers/:id`
- [x] **Customers**
  - [x] `GET /api/customers`
  - [x] `POST /api/customers`
  - [x] `PUT /api/customers/:id`
  - [x] `DELETE /api/customers/:id`
- [x] **Inventory & Stock Movements**
  - [x] `GET /api/inventory`
  - [x] `POST /api/inventory`
  - [x] `PUT /api/inventory/:id`
  - [x] `DELETE /api/inventory/:id`
  - [x] `GET /api/stockMovements`
- [x] **Purchases**
  - [x] `GET /api/purchases`
  - [x] `POST /api/purchases` (should also update inventory & stock movements)
- [x] **Sales**
  - [x] `GET /api/sales`
  - [x] `POST /api/sales` (should also update inventory & stock movements)
- [x] **Deliveries**
  - [x] `GET /api/deliveries`
  - [x] `POST /api/deliveries`
  - [x] `PUT /api/deliveries/:id`

## Frontend Integration
- [x] Create `api.js` client in `Frontend/src/lib` to handle API requests.
- [ ] Refactor React components to use asynchronous fetch (`api.js`) instead of synchronous local storage (`db` from `storage.js`).
  - *Note:* Since the current frontend relies heavily on synchronous state initialization (e.g. `useState(() => db.getAll(...))`), all components need to be updated to use `useEffect` for data fetching and to handle loading states.
- [ ] Update `AuthContext.jsx` to use the new `/api/login` endpoint.
- [ ] Remove `seed.js` and local storage logic (`storage.js`) from the frontend once fully integrated.
