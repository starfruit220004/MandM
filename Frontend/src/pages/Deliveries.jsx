import { useState, useMemo } from 'react';
import { Plus, Pencil, Trash2, Search, Calendar, MapPin, User } from 'lucide-react';
import { db, formatDate, todayISO } from '../lib/storage';
import { useToast } from '../lib/ToastContext';
import PageHeader from '../components/PageHeader';
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
  const [search, setSearch] = useState('');
  const [draggedId, setDraggedId] = useState(null);

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

  function handleDrop(e, status) {
    e.preventDefault();
    if (draggedId) {
      db.update('deliveries', draggedId, { status });
      toast.success(`Delivery marked as ${status}.`);
      refresh();
      setDraggedId(null);
    }
  }

  const filteredRows = useMemo(() => {
    if (!search.trim()) return rows;
    const q = search.toLowerCase();
    return rows.filter((r) => {
      const c = customers.find(c => c.id === r.customerId)?.name || '';
      return c.toLowerCase().includes(q) || r.address.toLowerCase().includes(q) || String(r.id).includes(q);
    });
  }, [rows, search, customers]);

  return (
    <div className="flex h-[calc(100vh-6rem)] flex-col">
      <PageHeader title="Delivery Queue" description="Drag and drop deliveries to update their status.">
        <button onClick={openAdd} className="flex items-center gap-1.5 rounded-lg bg-blue-700 px-3.5 py-2 text-sm font-medium text-white hover:bg-blue-600">
          <Plus size={16} /> Schedule Delivery
        </button>
      </PageHeader>

      <div className="mb-6 flex items-center justify-between gap-4">
        <div className="flex gap-2">
          {STATUSES.map((s) => (
            <Badge key={s} tone={deliveryStatusTone(s)}>{s}: {filteredRows.filter((r) => r.status === s).length}</Badge>
          ))}
        </div>
        <div className="relative w-72">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search deliveries..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-lg border border-slate-200 py-2 pl-9 pr-4 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>
      </div>

      <div className="flex flex-1 gap-6 overflow-x-auto pb-4">
        {STATUSES.map((status) => (
          <div
            key={status}
            className="flex w-80 flex-shrink-0 flex-col rounded-xl bg-slate-50 p-4 border border-slate-200"
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => handleDrop(e, status)}
          >
            <div className="mb-4 flex items-center justify-between px-1">
              <h3 className="font-semibold text-slate-700">{status}</h3>
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-slate-200 text-xs font-medium text-slate-600">
                {filteredRows.filter((r) => r.status === status).length}
              </span>
            </div>

            <div className="flex flex-col gap-3 h-full overflow-y-auto pr-1 pb-4">
              {filteredRows
                .filter((r) => r.status === status)
                .map((row) => (
                  <div
                    key={row.id}
                    draggable
                    onDragStart={() => setDraggedId(row.id)}
                    className="group cursor-grab active:cursor-grabbing relative rounded-lg border border-slate-200 bg-white p-4 shadow-sm hover:border-blue-300 hover:shadow-md transition-all"
                  >
                    <div className="mb-2 flex items-start justify-between">
                      <Badge tone={deliveryStatusTone(row.status)} className="!px-2 !py-0.5 !text-[10px]">#{row.id}</Badge>
                      <div className="flex opacity-0 transition-opacity group-hover:opacity-100 -mr-2 -mt-2">
                        <button onClick={() => openEdit(row)} className="rounded p-1.5 text-slate-400 hover:bg-slate-100 hover:text-blue-600">
                          <Pencil size={14} />
                        </button>
                        <button onClick={() => setDeleteTarget(row)} className="rounded p-1.5 text-slate-400 hover:bg-slate-100 hover:text-red-600">
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                    
                    <div className="mb-3">
                      <div className="flex items-center gap-1.5 text-slate-900 font-medium">
                        <User size={14} className="text-slate-400" />
                        {customers.find(c => c.id === row.customerId)?.name || 'Unknown Customer'}
                      </div>
                    </div>
                    
                    <div className="space-y-1.5 text-xs text-slate-600">
                      <div className="flex items-start gap-1.5">
                        <MapPin size={14} className="mt-0.5 shrink-0 text-slate-400" />
                        <span className="line-clamp-2">{row.address}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Calendar size={14} className="shrink-0 text-slate-400" />
                        <span>{formatDate(row.scheduledDate)}</span>
                      </div>
                    </div>
                  </div>
                ))}
                
              {filteredRows.filter((r) => r.status === status).length === 0 && (
                <div className="flex h-24 items-center justify-center rounded-lg border-2 border-dashed border-slate-200 text-sm text-slate-400">
                  Drop here
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

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
            <button type="button" onClick={() => setModal(null)} className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium hover:bg-slate-200/40">Cancel</button>
            <button type="submit" className="rounded-lg bg-blue-700 px-4 py-2 text-sm font-medium text-white hover:bg-blue-600">
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
