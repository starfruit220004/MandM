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
  return { itemId: '', qty: '', price: '' };
}

export default function Sales() {
  const toast = useToast();
  const [rows, setRows] = useState(() => db.getAll('sales'));
  const customers = db.getAll('customers');
  const inventory = db.getAll('inventory');

  const [modal, setModal] = useState(null);
  const [customerId, setCustomerId] = useState('');
  const [date, setDate] = useState(todayISO());
  const [lines, setLines] = useState([emptyLine()]);
  const [errors, setErrors] = useState({});
  const [editingId, setEditingId] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [viewTarget, setViewTarget] = useState(null);

  function refresh() {
    setRows(db.getAll('sales'));
  }

  function openAdd() {
    setCustomerId('');
    setDate(todayISO());
    setLines([emptyLine()]);
    setErrors({});
    setEditingId(null);
    setModal('form');
  }

  function openEdit(s) {
    setCustomerId(String(s.customerId));
    setDate(s.date);
    setLines(s.items.map((it) => ({ itemId: String(it.itemId), qty: it.qty, price: it.price })));
    setErrors({});
    setEditingId(s.id);
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

  function availableStock(itemId) {
    const inv = inventory.find((i) => i.id === Number(itemId));
    if (!inv) return 0;
    // when editing, add back the quantity already reserved by this sale's original line
    if (editingId) {
      const original = db.get('sales', editingId);
      const reserved = original?.items.find((it) => it.itemId === Number(itemId))?.qty || 0;
      return inv.quantity + reserved;
    }
    return inv.quantity;
  }

  const total = lines.reduce((sum, l) => sum + (Number(l.qty) || 0) * (Number(l.price) || 0), 0);

  function validate() {
    const e = {};
    if (!customerId) e.customer = 'Select a customer.';
    if (!date) e.date = 'Select a sale date.';
    lines.forEach((l, i) => {
      if (!l.itemId) e[`line-${i}`] = 'Select a product.';
      else if (!l.qty || Number(l.qty) <= 0) e[`line-${i}`] = 'Enter a valid quantity.';
      else if (Number(l.qty) > availableStock(l.itemId)) e[`line-${i}`] = `Only ${availableStock(l.itemId)} available in stock.`;
      else if (l.price === '' || Number(l.price) < 0) e[`line-${i}`] = 'Enter a valid selling price.';
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
      const price = Number(l.price);
      return { itemId: Number(l.itemId), itemName: item?.name, qty, price, total: qty * price };
    });
    const totalAmount = items.reduce((s, it) => s + it.total, 0);

    if (editingId) {
      const prev = db.get('sales', editingId);
      prev.items.forEach((it) => {
        const inv = db.get('inventory', it.itemId);
        if (inv) db.update('inventory', it.itemId, { quantity: inv.quantity + it.qty });
      });
      items.forEach((it) => {
        const inv = db.get('inventory', it.itemId);
        if (inv) db.update('inventory', it.itemId, { quantity: inv.quantity - it.qty });
      });
      db.update('sales', editingId, { customerId: Number(customerId), date, items, totalAmount });
      toast.success('Sale updated.');
    } else {
      const sale = db.create('sales', { customerId: Number(customerId), date, items, totalAmount });
      items.forEach((it) => {
        const inv = db.get('inventory', it.itemId);
        if (inv) db.update('inventory', it.itemId, { quantity: inv.quantity - it.qty });
        db.create('stockMovements', { itemId: it.itemId, type: 'out', qty: it.qty, date, reference: `Sale #${sale.id}` });
      });
      toast.success('Sale recorded and inventory updated.');
    }
    refresh();
    setModal(null);
  }

  function handleDelete() {
    const s = deleteTarget;
    s.items.forEach((it) => {
      const inv = db.get('inventory', it.itemId);
      if (inv) db.update('inventory', it.itemId, { quantity: inv.quantity + it.qty });
    });
    db.remove('sales', s.id);
    toast.success('Sale deleted and stock restored.');
    setDeleteTarget(null);
    refresh();
  }

  const columns = [
    { key: 'id', label: 'ID', sortable: true, render: (r) => <span className="font-mono">#{r.id}</span> },
    { key: 'customer', label: 'Customer', sortable: true, accessor: (r) => customers.find((c) => c.id === r.customerId)?.name, render: (r) => customers.find((c) => c.id === r.customerId)?.name || '—' },
    { key: 'date', label: 'Date', sortable: true, render: (r) => formatDate(r.date) },
    { key: 'items', label: 'Items', render: (r) => `${r.items.length} item${r.items.length > 1 ? 's' : ''}` },
    { key: 'totalAmount', label: 'Total', sortable: true, render: (r) => <span className="font-mono font-medium">{formatCurrency(r.totalAmount)}</span> },
  ];

  return (
    <div>
      <PageHeader title="Sales Management" description="Create sales transactions and track revenue by customer.">
        <button onClick={openAdd} className="flex items-center gap-1.5 rounded-lg bg-palm-700 px-3.5 py-2 text-sm font-medium text-cream-50 hover:bg-palm-600">
          <Plus size={16} /> New Sale
        </button>
      </PageHeader>

      <DataTable
        columns={columns}
        rows={rows}
        searchKeys={[(r) => customers.find((c) => c.id === r.customerId)?.name]}
        actions={(row) => (
          <div className="flex justify-end gap-1">
            <button onClick={() => setViewTarget(row)} className="rounded-md px-2 py-1 text-xs font-medium text-ink-700 hover:bg-husk-200/50">View</button>
            <button onClick={() => openEdit(row)} title="Edit" className="rounded-md p-1.5 text-ink-700 hover:bg-husk-200/50">
              <Pencil size={16} />
            </button>
            <button onClick={() => setDeleteTarget(row)} title="Delete" className="rounded-md p-1.5 text-rust-600 hover:bg-rust-100">
              <Trash2 size={16} />
            </button>
          </div>
        )}
      />

      <Modal open={modal === 'form'} onClose={() => setModal(null)} title={editingId ? 'Edit Sale' : 'New Sale'} size="lg">
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Customer" required error={errors.customer}>
              <Select value={customerId} onChange={(e) => setCustomerId(e.target.value)} error={errors.customer}>
                <option value="">Select customer…</option>
                {customers.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </Select>
            </Field>
            <Field label="Sale date" required error={errors.date}>
              <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} error={errors.date} />
            </Field>
          </div>

          <div className="mt-2 mb-2 flex items-center justify-between">
            <p className="text-sm font-medium text-ink-900">Products sold</p>
            <button type="button" onClick={addLine} className="text-xs font-medium text-palm-700 hover:text-palm-600">+ Add line item</button>
          </div>

          <div className="space-y-2">
            {lines.map((l, i) => (
              <div key={i} className="rounded-lg border border-husk-200 p-2.5">
                <div className="grid grid-cols-[1fr_90px_110px_auto] gap-2 items-start">
                  <Select value={l.itemId} onChange={(e) => updateLine(i, 'itemId', e.target.value)}>
                    <option value="">Select product…</option>
                    {inventory.map((it) => (
                      <option key={it.id} value={it.id}>{it.name} ({availableStock(String(it.id))} {it.unit} avail.)</option>
                    ))}
                  </Select>
                  <Input type="number" min="0" step="0.01" placeholder="Qty" value={l.qty} onChange={(e) => updateLine(i, 'qty', e.target.value)} />
                  <Input type="number" min="0" step="0.01" placeholder="Price" value={l.price} onChange={(e) => updateLine(i, 'price', e.target.value)} />
                  <button type="button" onClick={() => removeLine(i)} className="rounded-md p-2 text-rust-500 hover:bg-rust-100">
                    <Trash size={15} />
                  </button>
                </div>
                {errors[`line-${i}`] && <p className="mt-1 text-xs font-medium text-rust-600">{errors[`line-${i}`]}</p>}
                <p className="mt-1 text-right text-xs text-ink-500 font-mono">
                  Subtotal: {formatCurrency((Number(l.qty) || 0) * (Number(l.price) || 0))}
                </p>
              </div>
            ))}
          </div>

          <div className="mt-3 flex justify-end border-t border-husk-200 pt-3">
            <p className="font-display text-lg font-semibold text-bark-900">Total: {formatCurrency(total)}</p>
          </div>

          <div className="mt-4 flex justify-end gap-2">
            <button type="button" onClick={() => setModal(null)} className="rounded-lg border border-husk-200 px-4 py-2 text-sm font-medium hover:bg-husk-200/40">Cancel</button>
            <button type="submit" className="rounded-lg bg-palm-700 px-4 py-2 text-sm font-medium text-cream-50 hover:bg-palm-600">
              {editingId ? 'Save changes' : 'Complete sale'}
            </button>
          </div>
        </form>
      </Modal>

      <Modal open={!!viewTarget} onClose={() => setViewTarget(null)} title={`Sale #${viewTarget?.id || ''}`} size="md">
        {viewTarget && (
          <div>
            <div className="mb-3 grid grid-cols-2 gap-2 text-sm">
              <div><span className="text-ink-500">Customer:</span> <span className="font-medium">{customers.find((c) => c.id === viewTarget.customerId)?.name}</span></div>
              <div><span className="text-ink-500">Date:</span> <span className="font-medium">{formatDate(viewTarget.date)}</span></div>
            </div>
            <ul className="space-y-1.5 rounded-lg border border-husk-200 p-3 text-sm">
              {viewTarget.items.map((it, i) => (
                <li key={i} className="flex justify-between">
                  <span>{it.itemName} × {it.qty} @ {formatCurrency(it.price)}</span>
                  <span className="font-mono">{formatCurrency(it.total)}</span>
                </li>
              ))}
            </ul>
            <div className="mt-3 flex justify-between border-t border-husk-200 pt-3 font-semibold text-ink-900">
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
        message={<>Delete sale <strong>#{deleteTarget?.id}</strong>? Inventory quantities sold will be restored.</>}
      />
    </div>
  );
}
