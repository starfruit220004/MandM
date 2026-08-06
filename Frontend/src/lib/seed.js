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
    { id: 1, name: 'Zamboanga Copra Growers Coop', contactPerson: 'Juan Dela Cruz', address: 'Sitio Lumbayao, Zamboanga City', contact: '0917-330-8841', email: 'contact@zcgc.ph', createdAt: daysAgo(800), updatedAt: daysAgo(800) },
    { id: 2, name: 'Bautista Coconut Farms', contactPerson: 'Maria Bautista', address: 'Barangay San Roque, Curuan, Zamboanga City', contact: '0918-442-1190', email: 'bautistafarms@gmail.com', createdAt: daysAgo(650), updatedAt: daysAgo(650) },
    { id: 3, name: 'Isabela Coco Suppliers Inc.', contactPerson: 'Pedro Santiago', address: 'Isabela City, Basilan', contact: '0920-556-3302', email: 'sales@isabelacoco.ph', createdAt: daysAgo(400), updatedAt: daysAgo(400) },
    { id: 4, name: 'Mindanao Husk & Copra Traders', contactPerson: 'Ahmad Ali', address: 'Sinunuc, Zamboanga City', contact: '0917-660-9954', email: 'info@mhct.ph', createdAt: daysAgo(200), updatedAt: daysAgo(200) },
  ]);

  db.seedTable('customers', [
    { id: 1, name: 'Southern Oil Mills Corp.', contactPerson: 'Roberto Carlos', address: 'Ayala, Zamboanga City', contact: '0917-880-2213', email: 'procurement@southernoil.ph', createdAt: daysAgo(600), updatedAt: daysAgo(600) },
    { id: 2, name: 'Dela Cruz Sari-Sari & Trading', contactPerson: 'Elena Dela Cruz', address: 'Tetuan, Zamboanga City', contact: '0918-224-7761', email: 'delacruztrading@gmail.com', createdAt: daysAgo(300), updatedAt: daysAgo(300) },
    { id: 3, name: 'Pacific Desiccated Coconut Co.', contactPerson: 'Arthur Pendragon', address: 'Guiwan, Zamboanga City', contact: '0920-113-8842', email: 'orders@pacificdesiccated.ph', createdAt: daysAgo(250), updatedAt: daysAgo(250) },
    { id: 4, name: 'Villareal Copra Export', contactPerson: 'Sofia Villareal', address: 'Baliwasan, Zamboanga City', contact: '0917-556-9021', email: 'villareal.export@gmail.com', createdAt: daysAgo(150), updatedAt: daysAgo(150) },
  ]);

  db.seedTable('inventory', [
    { id: 1, name: 'Copra (Dried Coconut)', category: 'Processed', unit: 'kg', quantity: 5200, minStock: 1000, unitCost: 32, updatedAt: daysAgo(1) },
    { id: 2, name: 'Charcoal', category: 'Processed', unit: 'kg', quantity: 3100, minStock: 500, unitCost: 15, updatedAt: daysAgo(1) },
  ]);

  db.seedTable('stockMovements', [
    { id: 1, itemId: 1, type: 'in', qty: 2000, date: daysAgo(6), reference: 'Purchase #1' },
    { id: 2, itemId: 2, type: 'in', qty: 1200, date: daysAgo(5), reference: 'Purchase #2' },
    { id: 3, itemId: 1, type: 'out', qty: 450, date: daysAgo(2), reference: 'Sale #1' },
    { id: 4, itemId: 2, type: 'out', qty: 400, date: daysAgo(1), reference: 'Sale #2' },
  ]);

  db.seedTable('purchases', [
    {
      id: 1, supplierId: 1, date: daysAgo(6),
      items: [{ itemId: 1, itemName: 'Copra (Dried Coconut)', qty: 2000, unitPrice: 29.5, total: 59000 }],
      totalAmount: 59000, createdAt: daysAgo(6), updatedAt: daysAgo(6),
    },
    {
      id: 2, supplierId: 2, date: daysAgo(5),
      items: [{ itemId: 2, itemName: 'Charcoal', qty: 1200, unitPrice: 12.0, total: 14400 }],
      totalAmount: 14400, createdAt: daysAgo(5), updatedAt: daysAgo(5),
    },
    {
      id: 3, supplierId: 4, date: daysAgo(3),
      items: [
        { itemId: 1, itemName: 'Copra (Dried Coconut)', qty: 500, unitPrice: 29.5, total: 14750 },
        { itemId: 2, itemName: 'Charcoal', qty: 800, unitPrice: 12.0, total: 9600 },
      ],
      totalAmount: 24350, createdAt: daysAgo(3), updatedAt: daysAgo(3),
    },
  ]);

  db.seedTable('sales', [
    {
      id: 1, customerId: 1, date: daysAgo(2),
      items: [{ itemId: 1, itemName: 'Copra (Dried Coconut)', qty: 450, price: 35, total: 15750 }],
      totalAmount: 15750, createdAt: daysAgo(2), updatedAt: daysAgo(2),
    },
    {
      id: 2, customerId: 3, date: daysAgo(1),
      items: [{ itemId: 2, itemName: 'Charcoal', qty: 400, price: 18, total: 7200 }],
      totalAmount: 7200, createdAt: daysAgo(1), updatedAt: daysAgo(1),
    },
    {
      id: 3, customerId: 2, date: todayISO(),
      items: [
        { itemId: 1, itemName: 'Copra (Dried Coconut)', qty: 300, price: 35, total: 10500 },
        { itemId: 2, itemName: 'Charcoal', qty: 150, price: 18, total: 2700 },
      ],
      totalAmount: 13200, createdAt: todayISO(), updatedAt: todayISO(),
    },
  ]);

  db.seedTable('deliveries', [
    { id: 1, saleId: 1, customerId: 1, address: 'Ayala, Zamboanga City', scheduledDate: daysAgo(1), status: 'Delivered', createdAt: daysAgo(2), updatedAt: daysAgo(1) },
    { id: 2, saleId: 2, customerId: 3, address: 'Guiwan, Zamboanga City', scheduledDate: todayISO(), status: 'In Transit', createdAt: daysAgo(1), updatedAt: todayISO() },
    { id: 3, saleId: 3, customerId: 2, address: 'Tetuan, Zamboanga City', scheduledDate: daysAgo(-1), status: 'Pending', createdAt: todayISO(), updatedAt: todayISO() },
  ]);

  db.markSeeded();
}
