import { useState } from 'react';
import { Plus, Pencil, Trash2, Trash } from 'lucide-react';
import { db, formatCurrency, formatDate, todayISO } from '../lib/storage';
import { useToast } from '../lib/ToastContext';
import PageHeader from '../components/PageHeader';
import DataTable from '../components/DataTable';
import Modal from '../components/Modal';
import ConfirmDialog from '../components/ConfirmDialog';
import { Field, Input, Select } from '../components/FormField';

function emptyLine() {
  return { itemId: '', qty: '', unitPrice: '' };
}

export default function Purchases() {
  const toast = useToast();
  const [rows, setRows] = useState(() => db.getAll('purchases'));
  const suppliers = db.getAll('suppliers');
  const inventory = db.getAll('inventory');

  const [modal, setModal] = useState(null);
  const [supplierId, setSupplierId] = useState('');
  const [date, setDate] = useState(todayISO());
  const [lines, setLines] = useState([emptyLine()]);
  const [errors, setErrors] = useState({});
  const [editingId, setEditingId] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [viewTarget, setViewTarget] = useState(null);

  function refresh() {
    setRows(db.getAll('purchases'));
  }

  function openAdd() {
    setSupplierId('');
    setDate(todayISO());
    setLines([emptyLine()]);
    setErrors({});
    setEditingId(null);
    setModal('form');
  }

  function openEdit(p) {
    setSupplierId(String(p.supplierId));
    setDate(p.date);
    setLines(p.items.map((it) => ({ itemId: String(it.itemId), qty: it.qty, unitPrice: it.unitPrice })));
    setErrors({});
    setEditingId(p.id);
    setModal('form');
  }

  function updateLine(idx, field, value) {
    setLines((prev) => prev.map((l, i) => (i === idx ? { ...l, [field]: value } : l)));
  }

  function addLine() {
    setLines((prev) => [...prev, emptyLine()]);
  }

  function removeLine(idx) {
    setLines((prev) => (prev.length > 1 ? prev.filter((_, i) => i !== idx) : prev));
  }

  const total = lines.reduce((sum, l) => sum + (Number(l.qty) || 0) * (Number(l.unitPrice) || 0), 0);

  function validate() {
    const e = {};
    if (!supplierId) e.supplier = 'Select a supplier.';
    if (!date) e.date = 'Select a purchase date.';
    lines.forEach((l, i) => {
      if (!l.itemId) e[`line-${i}`] = 'Select an item.';
      else if (!l.qty || Number(l.qty) <= 0) e[`line-${i}`] = 'Enter a valid quantity.';
      else if (l.unitPrice === '' || Number(l.unitPrice) < 0) e[`line-${i}`] = 'Enter a valid unit price.';
    });
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  function handleSubmit(e) {
    e.preventDefault();
    if (!validate()) return;

    const items = lines.map((l) => {
      const item = inventory.find((i) => i.id === Number(l.itemId));
      const qty = Number(l.qty);
      const unitPrice = Number(l.unitPrice);
      return { itemId: Number(l.itemId), itemName: item?.name, qty, unitPrice, total: qty * unitPrice };
    });
    const totalAmount = items.reduce((s, it) => s + it.total, 0);

    if (editingId) {
      // revert previous stock effect, then apply new
      const prev = db.get('purchases', editingId);
      prev.items.forEach((it) => {
        const inv = db.get('inventory', it.itemId);
        if (inv) db.update('inventory', it.itemId, { quantity: inv.quantity - it.qty });
      });
      items.forEach((it) => {
        const inv = db.get('inventory', it.itemId);
        if (inv) db.update('inventory', it.itemId, { quantity: inv.quantity + it.qty });
      });
      db.update('purchases', editingId, { supplierId: Number(supplierId), date, items, totalAmount });
      toast.success('Purchase record updated.');
    } else {
      const purchase = db.create('purchases', { supplierId: Number(supplierId), date, items, totalAmount });
      items.forEach((it) => {
        const inv = db.get('inventory', it.itemId);
        if (inv) db.update('inventory', it.itemId, { quantity: inv.quantity + it.qty });
        db.create('stockMovements', { itemId: it.itemId, type: 'in', qty: it.qty, date, reference: `Purchase #${purchase.id}` });
      });
      toast.success('Purchase recorded and inventory updated.');
    }
    refresh();
    setModal(null);
  }

  function handleDelete() {
    const p = deleteTarget;
    p.items.forEach((it) => {
      const inv = db.get('inventory', it.itemId);
      if (inv) db.update('inventory', it.itemId, { quantity: Math.max(0, inv.quantity - it.qty) });
    });
    db.remove('purchases', p.id);
    toast.success('Purchase record deleted and stock reverted.');
    setDeleteTarget(null);
    refresh();
  }

  const columns = [
    { key: 'id', label: 'ID', sortable: true, render: (r) => <span className="font-mono">#{r.id}</span> },
    { key: 'supplier', label: 'Supplier', sortable: true, accessor: (r) => suppliers.find((s) => s.id === r.supplierId)?.name, render: (r) => suppliers.find((s) => s.id === r.supplierId)?.name || '—' },
    { key: 'date', label: 'Date', sortable: true, render: (r) => formatDate(r.date) },
    { key: 'items', label: 'Items', render: (r) => `${r.items.length} item${r.items.length > 1 ? 's' : ''}` },
    { key: 'totalAmount', label: 'Total', sortable: true, render: (r) => <span className="font-mono font-medium">{formatCurrency(r.totalAmount)}</span> },
  ];

  return (
    <div>
      <PageHeader title="Purchase Management" description="Record coconut and copra purchases from suppliers.">
        <button onClick={openAdd} className="flex items-center gap-1.5 rounded-lg bg-blue-700 px-3.5 py-2 text-sm font-medium text-white hover:bg-blue-600">
          <Plus size={16} /> Record Purchase
        </button>
      </PageHeader>

      <DataTable
        columns={columns}
        rows={rows}
        searchKeys={[(r) => suppliers.find((s) => s.id === r.supplierId)?.name]}
        actions={(row) => (
          <div className="flex justify-end gap-1">
            <button onClick={() => setViewTarget(row)} className="rounded-md px-2 py-1 text-xs font-medium text-slate-700 hover:bg-slate-200/50">View</button>
            <button onClick={() => openEdit(row)} title="Edit" className="rounded-md p-1.5 text-slate-700 hover:bg-slate-200/50">
              <Pencil size={16} />
            </button>
            <button onClick={() => setDeleteTarget(row)} title="Delete" className="rounded-md p-1.5 text-red-600 hover:bg-red-100">
              <Trash2 size={16} />
            </button>
          </div>
        )}
      />

      <Modal open={modal === 'form'} onClose={() => setModal(null)} title={editingId ? 'Edit Purchase' : 'Record Purchase'} size="lg">
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Supplier" required error={errors.supplier}>
              <Select value={supplierId} onChange={(e) => setSupplierId(e.target.value)} error={errors.supplier}>
                <option value="">Select supplier…</option>
                {suppliers.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
              </Select>
            </Field>
            <Field label="Purchase date" required error={errors.date}>
              <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} error={errors.date} />
            </Field>
          </div>

          <div className="mt-2 mb-2 flex items-center justify-between">
            <p className="text-sm font-medium text-slate-900">Items purchased</p>
            <button type="button" onClick={addLine} className="text-xs font-medium text-blue-700 hover:text-blue-600">+ Add line item</button>
          </div>

          <div className="space-y-2">
            {lines.map((l, i) => (
              <div key={i} className="rounded-lg border border-slate-200 p-2.5">
                <div className="grid grid-cols-[1fr_90px_110px_auto] gap-2 items-start">
                  <Select value={l.itemId} onChange={(e) => updateLine(i, 'itemId', e.target.value)}>
                    <option value="">Select item…</option>
                    {inventory.map((it) => <option key={it.id} value={it.id}>{it.name}</option>)}
                  </Select>
                  <Input type="number" min="0" step="0.01" placeholder="Qty" value={l.qty} onChange={(e) => updateLine(i, 'qty', e.target.value)} />
                  <Input type="number" min="0" step="0.01" placeholder="Unit price" value={l.unitPrice} onChange={(e) => updateLine(i, 'unitPrice', e.target.value)} />
                  <button type="button" onClick={() => removeLine(i)} className="rounded-md p-2 text-red-500 hover:bg-red-100">
                    <Trash size={15} />
                  </button>
                </div>
                {errors[`line-${i}`] && <p className="mt-1 text-xs font-medium text-red-600">{errors[`line-${i}`]}</p>}
                <p className="mt-1 text-right text-xs text-slate-500 font-mono">
                  Subtotal: {formatCurrency((Number(l.qty) || 0) * (Number(l.unitPrice) || 0))}
                </p>
              </div>
            ))}
          </div>

          <div className="mt-3 flex justify-end border-t border-slate-200 pt-3">
            <p className="font-display text-lg font-semibold text-slate-900">Total: {formatCurrency(total)}</p>
          </div>

          <div className="mt-4 flex justify-end gap-2">
            <button type="button" onClick={() => setModal(null)} className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium hover:bg-slate-200/40">Cancel</button>
            <button type="submit" className="rounded-lg bg-blue-700 px-4 py-2 text-sm font-medium text-white hover:bg-blue-600">
              {editingId ? 'Save changes' : 'Record purchase'}
            </button>
          </div>
        </form>
      </Modal>

      <Modal open={!!viewTarget} onClose={() => setViewTarget(null)} title={`Purchase #${viewTarget?.id || ''}`} size="md">
        {viewTarget && (
          <div>
            <div className="mb-3 grid grid-cols-2 gap-2 text-sm">
              <div><span className="text-slate-500">Supplier:</span> <span className="font-medium">{suppliers.find((s) => s.id === viewTarget.supplierId)?.name}</span></div>
              <div><span className="text-slate-500">Date:</span> <span className="font-medium">{formatDate(viewTarget.date)}</span></div>
            </div>
            <ul className="space-y-1.5 rounded-lg border border-slate-200 p-3 text-sm">
              {viewTarget.items.map((it, i) => (
                <li key={i} className="flex justify-between">
                  <span>{it.itemName} × {it.qty} @ {formatCurrency(it.unitPrice)}</span>
                  <span className="font-mono">{formatCurrency(it.total)}</span>
                </li>
              ))}
            </ul>
            <div className="mt-3 flex justify-between border-t border-slate-200 pt-3 font-semibold text-slate-900">
              <span>Total</span>
              <span className="font-mono">{formatCurrency(viewTarget.totalAmount)}</span>
            </div>
          </div>
        )}
      </Modal>

      <ConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        message={<>Delete purchase <strong>#{deleteTarget?.id}</strong>? Inventory quantities added by this purchase will be reverted.</>}
      />
    </div>
  );
}
