import { useState } from 'react';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { db, formatDate, todayISO } from '../lib/storage';
import { useToast } from '../lib/ToastContext';
import PageHeader from '../components/PageHeader';
import DataTable from '../components/DataTable';
import Modal from '../components/Modal';
import ConfirmDialog from '../components/ConfirmDialog';
import Badge, { deliveryStatusTone } from '../components/Badge';
import { Field, Input, Select } from '../components/FormField';

const STATUSES = ['Pending', 'In Transit', 'Delivered'];

const emptyForm = { customerId: '', saleId: '', address: '', scheduledDate: todayISO(), status: 'Pending' };

export default function Deliveries() {
  const toast = useToast();
  const [rows, setRows] = useState(() => db.getAll('deliveries'));
  const customers = db.getAll('customers');
  const sales = db.getAll('sales');

  const [modal, setModal] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [errors, setErrors] = useState({});
  const [editingId, setEditingId] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  function refresh() {
    setRows(db.getAll('deliveries'));
  }

  function openAdd() {
    setForm(emptyForm);
    setErrors({});
    setEditingId(null);
    setModal('form');
  }

  function openEdit(row) {
    setForm({
      customerId: String(row.customerId),
      saleId: row.saleId ? String(row.saleId) : '',
      address: row.address,
      scheduledDate: row.scheduledDate,
      status: row.status,
    });
    setErrors({});
    setEditingId(row.id);
    setModal('form');
  }

  function validate() {
    const e = {};
    if (!form.customerId) e.customerId = 'Select a customer.';
    if (!form.address.trim()) e.address = 'Delivery address is required.';
    if (!form.scheduledDate) e.scheduledDate = 'Select a delivery date.';
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  function handleSubmit(e) {
    e.preventDefault();
    if (!validate()) return;
    const payload = {
      customerId: Number(form.customerId),
      saleId: form.saleId ? Number(form.saleId) : null,
      address: form.address.trim(),
      scheduledDate: form.scheduledDate,
      status: form.status,
    };
    if (editingId) {
      db.update('deliveries', editingId, payload);
      toast.success('Delivery updated.');
    } else {
      db.create('deliveries', payload);
      toast.success('Delivery scheduled.');
    }
    refresh();
    setModal(null);
  }

  function handleDelete() {
    db.remove('deliveries', deleteTarget.id);
    toast.success('Delivery record deleted.');
    setDeleteTarget(null);
    refresh();
  }

  function quickStatus(row, status) {
    db.update('deliveries', row.id, { status });
    toast.success(`Delivery #${row.id} marked as ${status}.`);
    refresh();
  }

  const columns = [
    { key: 'id', label: 'ID', sortable: true, render: (r) => <span className="font-mono">#{r.id}</span> },
    { key: 'customer', label: 'Customer', sortable: true, accessor: (r) => customers.find((c) => c.id === r.customerId)?.name, render: (r) => customers.find((c) => c.id === r.customerId)?.name || '—' },
    { key: 'address', label: 'Address' },
    { key: 'scheduledDate', label: 'Delivery Date', sortable: true, render: (r) => formatDate(r.scheduledDate) },
    {
      key: 'status',
      label: 'Status',
      sortable: true,
      render: (r) => (
        <Select value={r.status} onChange={(e) => quickStatus(r, e.target.value)} className="!py-1 !text-xs w-36">
          {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
        </Select>
      ),
    },
  ];

  return (
    <div>
      <PageHeader title="Delivery Management" description="Schedule deliveries and track fulfillment status.">
        <button onClick={openAdd} className="flex items-center gap-1.5 rounded-lg bg-palm-700 px-3.5 py-2 text-sm font-medium text-cream-50 hover:bg-palm-600">
          <Plus size={16} /> Schedule Delivery
        </button>
      </PageHeader>

      <div className="mb-4 flex flex-wrap gap-2">
        {STATUSES.map((s) => (
          <Badge key={s} tone={deliveryStatusTone(s)}>{s}: {rows.filter((r) => r.status === s).length}</Badge>
        ))}
      </div>

      <DataTable
        columns={columns}
        rows={rows}
        searchKeys={[(r) => customers.find((c) => c.id === r.customerId)?.name, 'address', 'status']}
        actions={(row) => (
          <div className="flex justify-end gap-1">
            <button onClick={() => openEdit(row)} title="Edit" className="rounded-md p-1.5 text-ink-700 hover:bg-husk-200/50">
              <Pencil size={16} />
            </button>
            <button onClick={() => setDeleteTarget(row)} title="Delete" className="rounded-md p-1.5 text-rust-600 hover:bg-rust-100">
              <Trash2 size={16} />
            </button>
          </div>
        )}
      />

      <Modal open={modal === 'form'} onClose={() => setModal(null)} title={editingId ? 'Edit Delivery' : 'Schedule Delivery'}>
        <form onSubmit={handleSubmit}>
          <Field label="Customer" required error={errors.customerId}>
            <Select value={form.customerId} onChange={(e) => setForm({ ...form, customerId: e.target.value })} error={errors.customerId}>
              <option value="">Select customer…</option>
              {customers.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </Select>
          </Field>
          <Field label="Related sale" hint="Optional — link this delivery to a sales transaction">
            <Select value={form.saleId} onChange={(e) => setForm({ ...form, saleId: e.target.value })}>
              <option value="">None</option>
              {sales.filter((s) => !form.customerId || s.customerId === Number(form.customerId)).map((s) => (
                <option key={s.id} value={s.id}>Sale #{s.id} — {formatDate(s.date)}</option>
              ))}
            </Select>
          </Field>
          <Field label="Delivery address" required error={errors.address}>
            <Input value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} error={errors.address} />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Delivery date" required error={errors.scheduledDate}>
              <Input type="date" value={form.scheduledDate} onChange={(e) => setForm({ ...form, scheduledDate: e.target.value })} error={errors.scheduledDate} />
            </Field>
            <Field label="Status" required>
              <Select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
                {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
              </Select>
            </Field>
          </div>
          <div className="mt-5 flex justify-end gap-2">
            <button type="button" onClick={() => setModal(null)} className="rounded-lg border border-husk-200 px-4 py-2 text-sm font-medium hover:bg-husk-200/40">Cancel</button>
            <button type="submit" className="rounded-lg bg-palm-700 px-4 py-2 text-sm font-medium text-cream-50 hover:bg-palm-600">
              {editingId ? 'Save changes' : 'Schedule delivery'}
            </button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        message={<>Delete delivery <strong>#{deleteTarget?.id}</strong>? This action cannot be undone.</>}
      />
    </div>
  );
}
