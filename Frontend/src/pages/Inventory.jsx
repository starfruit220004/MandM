import { useState, useMemo } from 'react';
import { Plus, Pencil, Trash2, PackagePlus, PackageMinus, AlertTriangle, Search } from 'lucide-react';
import { db, formatCurrency } from '../lib/storage';
import { useToast } from '../lib/ToastContext';
import PageHeader from '../components/PageHeader';
import Modal from '../components/Modal';
import ConfirmDialog from '../components/ConfirmDialog';
import Badge from '../components/Badge';
import { Field, Input, Select } from '../components/FormField';

const CATEGORIES = ['Raw', 'Processed', 'By-product'];
const UNITS = ['pcs', 'kg', 'liters', 'sacks'];

const emptyForm = { name: '', category: 'Raw', unit: 'kg', quantity: 0, minStock: 0, unitCost: 0 };

export default function Inventory() {
  const toast = useToast();
  const [rows, setRows] = useState(() => db.getAll('inventory'));
  const [modal, setModal] = useState(null); // 'add' | 'edit'
  const [form, setForm] = useState(emptyForm);
  const [errors, setErrors] = useState({});
  const [editingId, setEditingId] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [stockModal, setStockModal] = useState(null); // { item, mode: 'in'|'out' }
  const [stockQty, setStockQty] = useState('');
  const [search, setSearch] = useState('');

  function refresh() {
    setRows(db.getAll('inventory'));
  }

  function openAdd() {
    setForm(emptyForm);
    setErrors({});
    setEditingId(null);
    setModal('form');
  }

  function openEdit(item) {
    setForm({ name: item.name, category: item.category, unit: item.unit, quantity: item.quantity, minStock: item.minStock, unitCost: item.unitCost });
    setErrors({});
    setEditingId(item.id);
    setModal('form');
  }

  function validate() {
    const e = {};
    if (!form.name.trim()) e.name = 'Item name is required.';
    if (form.quantity < 0) e.quantity = 'Quantity cannot be negative.';
    if (form.minStock < 0) e.minStock = 'Minimum stock cannot be negative.';
    if (form.unitCost < 0) e.unitCost = 'Unit cost cannot be negative.';
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  function handleSubmit(e) {
    e.preventDefault();
    if (!validate()) return;
    const payload = {
      name: form.name.trim(),
      category: form.category,
      unit: form.unit,
      quantity: Number(form.quantity),
      minStock: Number(form.minStock),
      unitCost: Number(form.unitCost),
    };
    if (editingId) {
      db.update('inventory', editingId, payload);
      toast.success('Inventory item updated.');
    } else {
      db.create('inventory', payload);
      toast.success('Inventory item added.');
    }
    refresh();
    setModal(null);
  }

  function handleDelete() {
    db.remove('inventory', deleteTarget.id);
    toast.success('Inventory item deleted.');
    setDeleteTarget(null);
    refresh();
  }

  function openStock(item, mode) {
    setStockModal({ item, mode });
    setStockQty('');
  }

  function submitStock(e) {
    e.preventDefault();
    const qty = Number(stockQty);
    if (!qty || qty <= 0) {
      toast.error('Enter a valid quantity greater than zero.');
      return;
    }
    const item = stockModal.item;
    const newQty = stockModal.mode === 'in' ? item.quantity + qty : item.quantity - qty;
    if (newQty < 0) {
      toast.error('Stock out quantity exceeds current stock.');
      return;
    }
    db.update('inventory', item.id, { quantity: newQty });
    db.create('stockMovements', {
      itemId: item.id,
      type: stockModal.mode,
      qty,
      date: new Date().toISOString().slice(0, 10),
      reference: 'Manual adjustment',
    });
    toast.success(`Stock ${stockModal.mode === 'in' ? 'in' : 'out'} recorded for ${item.name}.`);
    setStockModal(null);
    refresh();
  }

  const filteredRows = useMemo(() => {
    if (!search.trim()) return rows;
    const q = search.toLowerCase();
    return rows.filter((r) => r.name.toLowerCase().includes(q) || r.category.toLowerCase().includes(q));
  }, [rows, search]);

  return (
    <div>
      <PageHeader title="Inventory Management" description="Track stock levels for raw, processed, and by-product coconut items.">
        <button
          onClick={openAdd}
          className="flex items-center gap-1.5 rounded-lg bg-blue-700 px-3.5 py-2 text-sm font-medium text-white hover:bg-blue-600 transition-colors shadow-sm hover:shadow"
        >
          <Plus size={16} /> Add Item
        </button>
      </PageHeader>

      <div className="mb-6 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex gap-2">
          <Badge tone="neutral">Total Items: {filteredRows.length}</Badge>
          <Badge tone="rust">Low Stock: {filteredRows.filter(r => r.quantity <= r.minStock).length}</Badge>
        </div>
        <div className="relative w-full sm:w-72">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search inventory..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-lg border border-slate-200 py-2 pl-9 pr-4 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 shadow-sm"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {filteredRows.map((r) => {
          const isLow = r.quantity <= r.minStock;
          return (
            <div key={r.id} className={`group relative overflow-hidden rounded-xl border p-5 shadow-sm transition-all hover:-translate-y-1 hover:shadow-md ${isLow ? 'border-red-200 bg-red-50/20' : 'border-slate-200 bg-white hover:border-blue-300'}`}>
              {/* Status Indicator Bar */}
              <div className={`absolute top-0 left-0 w-full h-[3px] ${isLow ? 'bg-red-500' : 'bg-emerald-500 opacity-0 group-hover:opacity-100 transition-opacity'}`}></div>
              
              <div className="mb-3 flex items-start justify-between">
                <Badge tone={isLow ? 'rust' : 'neutral'} className="mb-2">
                  {r.category}
                </Badge>
                {isLow && (
                  <div className="flex items-center gap-1 text-xs font-semibold text-red-600 animate-pulse">
                    <AlertTriangle size={14} /> Low Stock
                  </div>
                )}
              </div>
              
              <h3 className="mb-1 font-display text-lg font-bold text-slate-900 line-clamp-2 leading-snug">{r.name}</h3>
              
              <div className="mb-5 mt-4 grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-0.5">Stock</p>
                  <p className={`font-mono text-xl font-bold ${isLow ? 'text-red-600' : 'text-slate-800'}`}>
                    {r.quantity} <span className="text-sm font-normal text-slate-500 ml-0.5">{r.unit}</span>
                  </p>
                </div>
                <div>
                  <p className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-0.5">Unit Cost</p>
                  <p className="font-mono text-lg font-semibold text-slate-700 mt-0.5">{formatCurrency(r.unitCost)}</p>
                </div>
              </div>
              
              <div className="mb-4 text-xs text-slate-500 bg-slate-50 rounded-md p-2 border border-slate-100">
                Min threshold: <span className="font-mono font-medium text-slate-700">{r.minStock} {r.unit}</span>
              </div>
              
              <div className="flex flex-wrap items-center justify-between border-t border-slate-100 pt-4 gap-2">
                <div className="flex gap-1.5">
                  <button onClick={() => openStock(r, 'in')} title="Stock in" className="flex items-center justify-center rounded-lg bg-emerald-50 px-3 py-1.5 text-emerald-700 hover:bg-emerald-100 transition-colors border border-emerald-100 hover:border-emerald-200">
                    <PackagePlus size={16} />
                  </button>
                  <button onClick={() => openStock(r, 'out')} title="Stock out" className="flex items-center justify-center rounded-lg bg-amber-50 px-3 py-1.5 text-amber-700 hover:bg-amber-100 transition-colors border border-amber-100 hover:border-amber-200">
                    <PackageMinus size={16} />
                  </button>
                </div>
                
                <div className="flex gap-1">
                  <button onClick={() => openEdit(r)} title="Edit" className="flex items-center justify-center rounded-lg p-1.5 text-slate-400 hover:bg-blue-50 hover:text-blue-600 transition-colors">
                    <Pencil size={15} />
                  </button>
                  <button onClick={() => setDeleteTarget(r)} title="Delete" className="flex items-center justify-center rounded-lg p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-600 transition-colors">
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
        
        {filteredRows.length === 0 && (
          <div className="col-span-full flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-200 py-16 text-slate-500 bg-slate-50/50">
            <p className="font-medium text-slate-600 text-lg">No inventory items found.</p>
            <p className="text-sm mt-1 text-slate-400">Try adjusting your search or add a new item.</p>
          </div>
        )}
      </div>

      <Modal open={modal === 'form'} onClose={() => setModal(null)} title={editingId ? 'Edit Inventory Item' : 'Add Inventory Item'}>
        <form onSubmit={handleSubmit}>
          <Field label="Item name" required error={errors.name}>
            <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g. Copra (Sun-dried)" error={errors.name} />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Category" required>
              <Select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
                {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </Select>
            </Field>
            <Field label="Unit" required>
              <Select value={form.unit} onChange={(e) => setForm({ ...form, unit: e.target.value })}>
                {UNITS.map((u) => <option key={u} value={u}>{u}</option>)}
              </Select>
            </Field>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Quantity" required error={errors.quantity}>
              <Input type="number" min="0" step="0.01" value={form.quantity} onChange={(e) => setForm({ ...form, quantity: e.target.value })} error={errors.quantity} />
            </Field>
            <Field label="Minimum stock level" required error={errors.minStock} hint="Triggers low-stock alert">
              <Input type="number" min="0" step="0.01" value={form.minStock} onChange={(e) => setForm({ ...form, minStock: e.target.value })} error={errors.minStock} />
            </Field>
          </div>
          <Field label="Unit cost (₱)" required error={errors.unitCost}>
            <Input type="number" min="0" step="0.01" value={form.unitCost} onChange={(e) => setForm({ ...form, unitCost: e.target.value })} error={errors.unitCost} />
          </Field>
          <div className="mt-5 flex justify-end gap-2">
            <button type="button" onClick={() => setModal(null)} className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium hover:bg-slate-200/40">
              Cancel
            </button>
            <button type="submit" className="rounded-lg bg-blue-700 px-4 py-2 text-sm font-medium text-white hover:bg-blue-600">
              {editingId ? 'Save changes' : 'Add item'}
            </button>
          </div>
        </form>
      </Modal>

      <Modal open={!!stockModal} onClose={() => setStockModal(null)} title={`${stockModal?.mode === 'in' ? 'Stock In' : 'Stock Out'} — ${stockModal?.item?.name || ''}`} size="sm">
        <form onSubmit={submitStock}>
          <p className="mb-3 text-sm text-slate-500">
            Current stock: <span className="font-mono font-medium text-slate-900">{stockModal?.item?.quantity} {stockModal?.item?.unit}</span>
          </p>
          <Field label={`Quantity to ${stockModal?.mode === 'in' ? 'add' : 'remove'}`} required>
            <Input type="number" min="0" step="0.01" autoFocus value={stockQty} onChange={(e) => setStockQty(e.target.value)} placeholder="0" />
          </Field>
          <div className="mt-5 flex justify-end gap-2">
            <button type="button" onClick={() => setStockModal(null)} className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium hover:bg-slate-200/40">
              Cancel
            </button>
            <button type="submit" className="rounded-lg bg-blue-700 px-4 py-2 text-sm font-medium text-white hover:bg-blue-600">
              Confirm
            </button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        message={<>Are you sure you want to delete <strong>{deleteTarget?.name}</strong>? This action cannot be undone.</>}
      />
    </div>
  );
}
