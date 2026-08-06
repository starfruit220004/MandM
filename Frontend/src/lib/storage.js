// Lightweight localStorage-backed "database" for the frontend-only prototype.
// Each table is a JSON array stored under its own key. Swap this module out
// for real API calls once the backend is wired up — the shape (getAll/get/
// create/update/remove) mirrors a typical REST resource client on purpose.

const NS = 'coco_erp_v3';

function key(table) {
  return `${NS}:${table}`;
}

function readTable(table) {
  const raw = localStorage.getItem(key(table));
  if (!raw) return [];
  try {
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

function writeTable(table, rows) {
  localStorage.setItem(key(table), JSON.stringify(rows));
}

function nextId(rows) {
  return rows.reduce((max, r) => Math.max(max, r.id || 0), 0) + 1;
}

export const db = {
  isSeeded() {
    return localStorage.getItem(`${NS}:seeded`) === 'true';
  },
  markSeeded() {
    localStorage.setItem(`${NS}:seeded`, 'true');
  },
  seedTable(table, rows) {
    writeTable(table, rows);
  },
  getAll(table) {
    return readTable(table);
  },
  get(table, id) {
    return readTable(table).find((r) => r.id === Number(id)) || null;
  },
  create(table, data) {
    const rows = readTable(table);
    const now = new Date().toISOString();
    const row = { id: nextId(rows), ...data, createdAt: now, updatedAt: now };
    rows.push(row);
    writeTable(table, rows);
    return row;
  },
  update(table, id, data) {
    const rows = readTable(table);
    const idx = rows.findIndex((r) => r.id === Number(id));
    if (idx === -1) return null;
    rows[idx] = { ...rows[idx], ...data, id: rows[idx].id, updatedAt: new Date().toISOString() };
    writeTable(table, rows);
    return rows[idx];
  },
  remove(table, id) {
    const rows = readTable(table);
    const next = rows.filter((r) => r.id !== Number(id));
    writeTable(table, next);
  },
  reset() {
    Object.keys(localStorage)
      .filter((k) => k.startsWith(NS))
      .forEach((k) => localStorage.removeItem(k));
  },
};

export function formatCurrency(n) {
  return new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP' }).format(n || 0);
}

export function formatDate(d) {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('en-PH', { year: 'numeric', month: 'short', day: 'numeric' });
}

export function formatDateTime(d) {
  if (!d) return '—';
  return new Date(d).toLocaleString('en-PH', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
}

export function todayISO() {
  return new Date().toISOString().slice(0, 10);
}
