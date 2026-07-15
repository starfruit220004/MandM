# CocoTrade — Coconut Business Management System (Frontend)

A React + Tailwind CSS frontend for a coconut trading business management
system. This is a **frontend-only prototype** — all data is stored in the
browser's `localStorage` via `src/lib/storage.js`, which is written to mirror
a REST client (`getAll` / `get` / `create` / `update` / `remove`) so it can be
swapped for real API calls once your backend is ready.

## Getting started

```bash
npm install
npm run dev
```

Then open the printed local URL (usually http://localhost:5173).

The database seeds itself automatically on first load with sample suppliers,
customers, inventory, purchases, sales, and deliveries.

## Demo accounts

| Role     | Username | Password      |
|----------|----------|---------------|
| Admin    | admin    | admin123      |
| Employee | renato   | employee123   |
| Employee | josefina | employee123   |

Admin has full access, including Employee Management. Employees can manage
inventory, purchases, sales, customers, suppliers, and deliveries, but the
Employees module is hidden and route-guarded for them.

## Project structure

```
src/
  lib/
    storage.js         localStorage-backed data layer (swap for API calls later)
    seed.js             sample/demo data
    AuthContext.jsx      login/session/role logic
    ToastContext.jsx     success/error notifications
  components/            shared UI: DataTable, Modal, ConfirmDialog, Sidebar, Topbar...
  pages/                 one file per module (Dashboard, Inventory, Sales, ...)
```

## Modules implemented

- Dashboard: summary cards, 7-day sales trend, stock levels chart, recent
  transactions, low-stock alerts
- Inventory: CRUD, stock in/out, minimum stock level, low-stock badges
- Purchases: multi-line purchase entry, auto stock-in, edit/delete with
  stock reversal, purchase history per supplier
- Sales: multi-line sales entry with stock validation, auto stock-out,
  edit/delete with stock reversal, purchase history per customer
- Suppliers / Customers: CRUD with transaction history drill-down
- Employees (admin only): CRUD, role assignment, activate/deactivate,
  linked login account management
- Deliveries: scheduling, status tracking (Pending / In Transit / Delivered)
- Reports: Inventory, Sales, Purchase, Supplier, and Customer reports,
  date-range filterable

All tables include search, column sorting, and pagination. All forms include
validation with inline error messages. Destructive actions require
confirmation. Notifications appear for success/error states.

## Connecting a real backend

Replace the implementation inside `src/lib/storage.js` with `fetch`/`axios`
calls to your API. The rest of the app only calls `db.getAll(table)`,
`db.get(table, id)`, `db.create(table, data)`, `db.update(table, id, data)`,
and `db.remove(table, id)`, so most pages will not need to change.
