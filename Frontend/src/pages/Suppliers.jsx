import { useState } from 'react';
import { Plus, Pencil, Trash2, History } from 'lucide-react';
import { db, formatCurrency, formatDate } from '../lib/storage';
import { useToast } from '../lib/ToastContext';
import PageHeader from '../components/PageHeader';
import DataTable from '../components/DataTable';
import Modal from '../components/Modal';
import ConfirmDialog from '../components/ConfirmDialog';
import { Field, Input, Textarea } from '../components/FormField';

const emptyForm = { name: '', contactPerson: '', address: '', contact: '', email: '' };

export default function Suppliers() {
  const toast = useToast();
  const [rows, setRows] = useState(() => db.getAll('suppliers'));
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [errors, setErrors] = useState({});
  const [editingId, setEditingId] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [historyTarget, setHistoryTarget] = useState(null);

  function refresh() {
    setRows(db.getAll('suppliers'));
  }

  function openAdd() {
    setForm(emptyForm);
    setErrors({});
    setEditingId(null);
    setModal('form');
  }

  function openEdit(row) {
    setForm({ name: row.name, contactPerson: row.contactPerson || '', address: row.address, contact: row.contact, email: row.email });
    setErrors({});
    setEditingId(row.id);
    setModal('form');
  }

  function validate() {
    const e = {};
    if (!form.name.trim()) e.name = 'Supplier name is required.';
    if (!form.contact.trim()) e.contact = 'Contact number is required.';
    if (form.email && !/^\S+@\S+\.\S+$/.test(form.email)) e.email = 'Enter a valid email address.';
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  function handleSubmit(e) {
    e.preventDefault();
    if (!validate()) return;
    if (editingId) {
      db.update('suppliers', editingId, form);
      toast.success('Supplier updated.');
    } else {
      db.create('suppliers', form);
      toast.success('Supplier added.');
    }
    refresh();
    setModal(null);
  }

  function handleDelete() {
    db.remove('suppliers', deleteTarget.id);
    toast.success('Supplier deleted.');
    setDeleteTarget(null);
    refresh();
  }

  const purchases = historyTarget ? db.getAll('purchases').filter((p) => p.supplierId === historyTarget.id) : [];

  const columns = [
    { key: 'name', label: 'Supplier', sortable: true },
    { key: 'contactPerson', label: 'Contact Person', sortable: true },
    { key: 'contact', label: 'Contact', sortable: true },
    { key: 'email', label: 'Email', sortable: true },
    { key: 'address', label: 'Address' },
  ];

  return (
    <div>
      <PageHeader title="Supplier Management" description="Manage coconut and copra suppliers and their purchase history.">
        <button onClick={openAdd} className="flex items-center gap-1.5 rounded-lg bg-blue-700 px-3.5 py-2 text-sm font-medium text-white hover:bg-blue-600">
          <Plus size={16} /> Add Supplier
        </button>
      </PageHeader>

      <DataTable
        columns={columns}
        rows={rows}
        searchKeys={['name', 'contactPerson', 'contact', 'email', 'address']}
        actions={(row) => (
          <div className="flex justify-end gap-1">
            <button onClick={() => setHistoryTarget(row)} title="Transaction history" className="rounded-md p-1.5 text-slate-700 hover:bg-slate-200/50">
              <History size={16} />
            </button>
            <button onClick={() => openEdit(row)} title="Edit" className="rounded-md p-1.5 text-slate-700 hover:bg-slate-200/50">
              <Pencil size={16} />
            </button>
            <button onClick={() => setDeleteTarget(row)} title="Delete" className="rounded-md p-1.5 text-red-600 hover:bg-red-100">
              <Trash2 size={16} />
            </button>
          </div>
        )}
      />

      <Modal open={modal === 'form'} onClose={() => setModal(null)} title={editingId ? 'Edit Supplier' : 'Add Supplier'}>
        <form onSubmit={handleSubmit}>
          <Field label="Supplier name" required error={errors.name}>
            <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} error={errors.name} />
          </Field>
          <Field label="Contact person's name">
            <Input value={form.contactPerson} onChange={(e) => setForm({ ...form, contactPerson: e.target.value })} />
          </Field>
          <Field label="Contact number" required error={errors.contact}>
            <Input value={form.contact} onChange={(e) => setForm({ ...form, contact: e.target.value })} placeholder="09XX-XXX-XXXX" error={errors.contact} />
          </Field>
          <Field label="Email" error={errors.email}>
            <Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} error={errors.email} />
          </Field>
          <Field label="Address">
            <Textarea value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} />
          </Field>
          <div className="mt-5 flex justify-end gap-2">
            <button type="button" onClick={() => setModal(null)} className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium hover:bg-slate-200/40">
              Cancel
            </button>
            <button type="submit" className="rounded-lg bg-blue-700 px-4 py-2 text-sm font-medium text-white hover:bg-blue-600">
              {editingId ? 'Save changes' : 'Add supplier'}
            </button>
          </div>
        </form>
      </Modal>

      <Modal open={!!historyTarget} onClose={() => setHistoryTarget(null)} title={`Purchase History — ${historyTarget?.name || ''}`} size="lg">
        {purchases.length === 0 ? (
          <p className="py-8 text-center text-sm text-slate-500">No purchase records for this supplier yet.</p>
        ) : (
          <div className="space-y-3">
            {purchases.map((p) => (
              <div key={p.id} className="rounded-lg border border-slate-200 p-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium text-slate-900">Purchase #{p.id}</span>
                  <span className="text-slate-500">{formatDate(p.date)}</span>
                </div>
                <ul className="mt-2 space-y-1 text-xs text-slate-700">
                  {p.items.map((it, i) => (
                    <li key={i} className="flex justify-between">
                      <span>{it.itemName} × {it.qty}</span>
                      <span className="font-mono">{formatCurrency(it.total)}</span>
                    </li>
                  ))}
                </ul>
                <div className="mt-2 flex justify-between border-t border-slate-200 pt-2 text-sm font-semibold text-slate-900">
                  <span>Total</span>
                  <span className="font-mono">{formatCurrency(p.totalAmount)}</span>
                </div>
              </div>
            ))}
          </div>
        )}
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
