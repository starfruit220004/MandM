import { useState } from 'react';
import { Plus, Pencil, Trash2, PackagePlus, PackageMinus, AlertTriangle } from 'lucide-react';
import { db, formatCurrency, formatDate } from '../lib/storage';
import { useToast } from '../lib/ToastContext';
import PageHeader from '../components/PageHeader';
import DataTable from '../components/DataTable';
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

  const columns = [
    { key: 'name', label: 'Item', sortable: true },
    { key: 'category', label: 'Category', sortable: true, render: (r) => <Badge tone="neutral">{r.category}</Badge> },
    {
      key: 'quantity',
      label: 'Stock',
      sortable: true,
      render: (r) => (
        <span className={`font-mono ${r.quantity <= r.minStock ? 'font-semibold text-rust-600' : ''}`}>
          {r.quantity} {r.unit}
        </span>
      ),
    },
    { key: 'minStock', label: 'Min. Stock', sortable: true, render: (r) => <span className="font-mono text-ink-500">{r.minStock} {r.unit}</span> },
    { key: 'unitCost', label: 'Unit Cost', sortable: true, render: (r) => <span className="font-mono">{formatCurrency(r.unitCost)}</span> },
    {
      key: 'status',
      label: 'Status',
      render: (r) =>
        r.quantity <= r.minStock ? (
          <Badge tone="rust"><AlertTriangle size={11} /> Low stock</Badge>
        ) : (
          <Badge tone="green">In stock</Badge>
        ),
    },
    { key: 'updatedAt', label: 'Updated', sortable: true, render: (r) => formatDate(r.updatedAt) },
  ];

  return (
    <div>
      <PageHeader title="Inventory Management" description="Track stock levels for raw, processed, and by-product coconut items.">
        <button
          onClick={openAdd}
          className="flex items-center gap-1.5 rounded-lg bg-palm-700 px-3.5 py-2 text-sm font-medium text-cream-50 hover:bg-palm-600 transition-colors"
        >
          <Plus size={16} /> Add Item
        </button>
      </PageHeader>

      <DataTable
        columns={columns}
        rows={rows}
        searchKeys={['name', 'category']}
        actions={(row) => (
          <div className="flex justify-end gap-1">
            <button onClick={() => openStock(row, 'in')} title="Stock in" className="rounded-md p-1.5 text-palm-700 hover:bg-palm-100">
              <PackagePlus size={16} />
            </button>
            <button onClick={() => openStock(row, 'out')} title="Stock out" className="rounded-md p-1.5 text-copra-600 hover:bg-copra-200">
              <PackageMinus size={16} />
            </button>
            <button onClick={() => openEdit(row)} title="Edit" className="rounded-md p-1.5 text-ink-700 hover:bg-husk-200/50">
              <Pencil size={16} />
            </button>
            <button onClick={() => setDeleteTarget(row)} title="Delete" className="rounded-md p-1.5 text-rust-600 hover:bg-rust-100">
              <Trash2 size={16} />
            </button>
          </div>
        )}
      />

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
            <button type="button" onClick={() => setModal(null)} className="rounded-lg border border-husk-200 px-4 py-2 text-sm font-medium hover:bg-husk-200/40">
              Cancel
            </button>
            <button type="submit" className="rounded-lg bg-palm-700 px-4 py-2 text-sm font-medium text-cream-50 hover:bg-palm-600">
              {editingId ? 'Save changes' : 'Add item'}
            </button>
          </div>
        </form>
      </Modal>

      <Modal open={!!stockModal} onClose={() => setStockModal(null)} title={`${stockModal?.mode === 'in' ? 'Stock In' : 'Stock Out'} — ${stockModal?.item?.name || ''}`} size="sm">
        <form onSubmit={submitStock}>
          <p className="mb-3 text-sm text-ink-500">
            Current stock: <span className="font-mono font-medium text-ink-900">{stockModal?.item?.quantity} {stockModal?.item?.unit}</span>
          </p>
          <Field label={`Quantity to ${stockModal?.mode === 'in' ? 'add' : 'remove'}`} required>
            <Input type="number" min="0" step="0.01" autoFocus value={stockQty} onChange={(e) => setStockQty(e.target.value)} placeholder="0" />
          </Field>
          <div className="mt-5 flex justify-end gap-2">
            <button type="button" onClick={() => setStockModal(null)} className="rounded-lg border border-husk-200 px-4 py-2 text-sm font-medium hover:bg-husk-200/40">
              Cancel
            </button>
            <button type="submit" className="rounded-lg bg-palm-700 px-4 py-2 text-sm font-medium text-cream-50 hover:bg-palm-600">
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
