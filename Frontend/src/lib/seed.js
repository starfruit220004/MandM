import { db, todayISO } from './storage';

function daysAgo(n) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString().slice(0, 10);
}

export function seedIfNeeded() {
  if (db.isSeeded()) return;

  db.seedTable('employees', [
    { id: 1, firstName: 'Marites', lastName: 'Villanueva', email: 'marites.v@cocotrade.ph', phone: '0917-201-4432', position: 'Operations Manager', role: 'admin', active: true, dateHired: '2021-03-01', createdAt: daysAgo(900), updatedAt: daysAgo(30) },
    { id: 2, firstName: 'Renato', lastName: 'Bautista', email: 'renato.b@cocotrade.ph', phone: '0918-552-0091', position: 'Warehouse Staff', role: 'employee', active: true, dateHired: '2022-06-15', createdAt: daysAgo(700), updatedAt: daysAgo(10) },
    { id: 3, firstName: 'Josefina', lastName: 'Cruz', email: 'jo.cruz@cocotrade.ph', phone: '0920-114-7765', position: 'Sales Associate', role: 'employee', active: true, dateHired: '2023-01-10', createdAt: daysAgo(500), updatedAt: daysAgo(5) },
    { id: 4, firstName: 'Domingo', lastName: 'Reyes', email: 'domingo.r@cocotrade.ph', phone: '0917-773-2210', position: 'Delivery Coordinator', role: 'employee', active: false, dateHired: '2022-11-20', createdAt: daysAgo(430), updatedAt: daysAgo(60) },
  ]);

  db.seedTable('users', [
    { id: 1, username: 'admin', password: 'admin123', role: 'admin', employeeId: 1, active: true, createdAt: daysAgo(900), updatedAt: daysAgo(900) },
    { id: 2, username: 'renato', password: 'employee123', role: 'employee', employeeId: 2, active: true, createdAt: daysAgo(700), updatedAt: daysAgo(700) },
    { id: 3, username: 'josefina', password: 'employee123', role: 'employee', employeeId: 3, active: true, createdAt: daysAgo(500), updatedAt: daysAgo(500) },
  ]);

  db.seedTable('suppliers', [
    { id: 1, name: 'Zamboanga Copra Growers Coop', address: 'Sitio Lumbayao, Zamboanga City', contact: '0917-330-8841', email: 'contact@zcgc.ph', createdAt: daysAgo(800), updatedAt: daysAgo(800) },
    { id: 2, name: 'Bautista Coconut Farms', address: 'Barangay San Roque, Curuan, Zamboanga City', contact: '0918-442-1190', email: 'bautistafarms@gmail.com', createdAt: daysAgo(650), updatedAt: daysAgo(650) },
    { id: 3, name: 'Isabela Coco Suppliers Inc.', address: 'Isabela City, Basilan', contact: '0920-556-3302', email: 'sales@isabelacoco.ph', createdAt: daysAgo(400), updatedAt: daysAgo(400) },
    { id: 4, name: 'Mindanao Husk & Copra Traders', address: 'Sinunuc, Zamboanga City', contact: '0917-660-9954', email: 'info@mhct.ph', createdAt: daysAgo(200), updatedAt: daysAgo(200) },
  ]);

  db.seedTable('customers', [
    { id: 1, name: 'Southern Oil Mills Corp.', address: 'Ayala, Zamboanga City', contact: '0917-880-2213', email: 'procurement@southernoil.ph', createdAt: daysAgo(600), updatedAt: daysAgo(600) },
    { id: 2, name: 'Dela Cruz Sari-Sari & Trading', address: 'Tetuan, Zamboanga City', contact: '0918-224-7761', email: 'delacruztrading@gmail.com', createdAt: daysAgo(300), updatedAt: daysAgo(300) },
    { id: 3, name: 'Pacific Desiccated Coconut Co.', address: 'Guiwan, Zamboanga City', contact: '0920-113-8842', email: 'orders@pacificdesiccated.ph', createdAt: daysAgo(250), updatedAt: daysAgo(250) },
    { id: 4, name: 'Villareal Copra Export', address: 'Baliwasan, Zamboanga City', contact: '0917-556-9021', email: 'villareal.export@gmail.com', createdAt: daysAgo(150), updatedAt: daysAgo(150) },
  ]);

  db.seedTable('inventory', [
    { id: 1, name: 'Whole Coconuts (Buko)', category: 'Raw', unit: 'pcs', quantity: 4200, minStock: 1000, unitCost: 12.5, updatedAt: daysAgo(1) },
    { id: 2, name: 'Copra (Sun-dried)', category: 'Processed', unit: 'kg', quantity: 850, minStock: 1000, unitCost: 32, updatedAt: daysAgo(1) },
    { id: 3, name: 'Coconut Husk', category: 'By-product', unit: 'kg', quantity: 2100, minStock: 500, unitCost: 3.5, updatedAt: daysAgo(2) },
    { id: 4, name: 'Coconut Shell (Charcoal grade)', category: 'By-product', unit: 'kg', quantity: 640, minStock: 300, unitCost: 6, updatedAt: daysAgo(3) },
    { id: 5, name: 'Desiccated Coconut', category: 'Processed', unit: 'kg', quantity: 180, minStock: 200, unitCost: 55, updatedAt: daysAgo(1) },
    { id: 6, name: 'Virgin Coconut Oil (VCO)', category: 'Processed', unit: 'liters', quantity: 95, minStock: 100, unitCost: 180, updatedAt: daysAgo(2) },
    { id: 7, name: 'Coconut Fiber (Coir)', category: 'By-product', unit: 'kg', quantity: 1300, minStock: 400, unitCost: 4.2, updatedAt: daysAgo(4) },
  ]);

  db.seedTable('stockMovements', [
    { id: 1, itemId: 1, type: 'in', qty: 2000, date: daysAgo(6), reference: 'Purchase #1' },
    { id: 2, itemId: 2, type: 'in', qty: 1200, date: daysAgo(5), reference: 'Purchase #2' },
    { id: 3, itemId: 1, type: 'out', qty: 450, date: daysAgo(2), reference: 'Sale #1' },
    { id: 4, itemId: 6, type: 'out', qty: 40, date: daysAgo(1), reference: 'Sale #3' },
  ]);

  db.seedTable('purchases', [
    {
      id: 1, supplierId: 1, date: daysAgo(6),
      items: [{ itemId: 1, itemName: 'Whole Coconuts (Buko)', qty: 2000, unitPrice: 11.8, total: 23600 }],
      totalAmount: 23600, createdAt: daysAgo(6), updatedAt: daysAgo(6),
    },
    {
      id: 2, supplierId: 2, date: daysAgo(5),
      items: [{ itemId: 2, itemName: 'Copra (Sun-dried)', qty: 1200, unitPrice: 29.5, total: 35400 }],
      totalAmount: 35400, createdAt: daysAgo(5), updatedAt: daysAgo(5),
    },
    {
      id: 3, supplierId: 4, date: daysAgo(3),
      items: [
        { itemId: 4, itemName: 'Coconut Shell (Charcoal grade)', qty: 500, unitPrice: 5.2, total: 2600 },
        { itemId: 7, itemName: 'Coconut Fiber (Coir)', qty: 800, unitPrice: 3.8, total: 3040 },
      ],
      totalAmount: 5640, createdAt: daysAgo(3), updatedAt: daysAgo(3),
    },
  ]);

  db.seedTable('sales', [
    {
      id: 1, customerId: 1, date: daysAgo(2),
      items: [{ itemId: 1, itemName: 'Whole Coconuts (Buko)', qty: 450, price: 15, total: 6750 }],
      totalAmount: 6750, createdAt: daysAgo(2), updatedAt: daysAgo(2),
    },
    {
      id: 2, customerId: 3, date: daysAgo(1),
      items: [{ itemId: 5, itemName: 'Desiccated Coconut', qty: 60, price: 68, total: 4080 }],
      totalAmount: 4080, createdAt: daysAgo(1), updatedAt: daysAgo(1),
    },
    {
      id: 3, customerId: 2, date: todayISO(),
      items: [
        { itemId: 6, itemName: 'Virgin Coconut Oil (VCO)', qty: 40, price: 220, total: 8800 },
        { itemId: 3, itemName: 'Coconut Husk', qty: 300, price: 5, total: 1500 },
      ],
      totalAmount: 10300, createdAt: todayISO(), updatedAt: todayISO(),
    },
  ]);

  db.seedTable('deliveries', [
    { id: 1, saleId: 1, customerId: 1, address: 'Ayala, Zamboanga City', scheduledDate: daysAgo(1), status: 'Delivered', createdAt: daysAgo(2), updatedAt: daysAgo(1) },
    { id: 2, saleId: 2, customerId: 3, address: 'Guiwan, Zamboanga City', scheduledDate: todayISO(), status: 'In Transit', createdAt: daysAgo(1), updatedAt: todayISO() },
    { id: 3, saleId: 3, customerId: 2, address: 'Tetuan, Zamboanga City', scheduledDate: daysAgo(-1), status: 'Pending', createdAt: todayISO(), updatedAt: todayISO() },
  ]);

  db.markSeeded();
}
