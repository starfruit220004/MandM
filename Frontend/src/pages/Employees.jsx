import { useState } from 'react';
import { Plus, Pencil, Trash2, Power } from 'lucide-react';
import { db, formatDate } from '../lib/storage';
import { useToast } from '../lib/ToastContext';
import { useAuth } from '../lib/AuthContext';
import PageHeader from '../components/PageHeader';
import DataTable from '../components/DataTable';
import Modal from '../components/Modal';
import ConfirmDialog from '../components/ConfirmDialog';
import Badge from '../components/Badge';
import { Field, Input, Select } from '../components/FormField';

const emptyForm = { firstName: '', lastName: '', email: '', phone: '', position: '', role: 'employee', dateHired: '', username: '', password: '' };

export default function Employees() {
  const toast = useToast();
  const { user: currentUser } = useAuth();
  const [rows, setRows] = useState(() => db.getAll('employees'));
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [errors, setErrors] = useState({});
  const [editingId, setEditingId] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  function refresh() {
    setRows(db.getAll('employees'));
  }

  function openAdd() {
    setForm(emptyForm);
    setErrors({});
    setEditingId(null);
    setModal('form');
  }

  function openEdit(row) {
    const linkedUser = db.getAll('users').find((u) => u.employeeId === row.id);
    setForm({
      firstName: row.firstName,
      lastName: row.lastName,
      email: row.email,
      phone: row.phone,
      position: row.position,
      role: row.role,
      dateHired: row.dateHired,
      username: linkedUser?.username || '',
      password: '',
    });
    setErrors({});
    setEditingId(row.id);
    setModal('form');
  }

  function validate() {
    const e = {};
    if (!form.firstName.trim()) e.firstName = 'First name is required.';
    if (!form.lastName.trim()) e.lastName = 'Last name is required.';
    if (!form.email.trim() || !/^\S+@\S+\.\S+$/.test(form.email)) e.email = 'Enter a valid email address.';
    if (!form.phone.trim()) e.phone = 'Phone number is required.';
    if (!form.position.trim()) e.position = 'Position is required.';
    if (!form.dateHired) e.dateHired = 'Date hired is required.';
    if (!editingId) {
      if (!form.username.trim()) e.username = 'Username is required.';
      if (!form.password || form.password.length < 6) e.password = 'Password must be at least 6 characters.';
      const users = db.getAll('users');
      if (users.some((u) => u.username.toLowerCase() === form.username.trim().toLowerCase())) {
        e.username = 'This username is already taken.';
      }
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  function handleSubmit(e) {
    e.preventDefault();
    if (!validate()) return;

    const payload = {
      firstName: form.firstName.trim(),
      lastName: form.lastName.trim(),
      email: form.email.trim(),
      phone: form.phone.trim(),
      position: form.position.trim(),
      role: form.role,
      dateHired: form.dateHired,
    };

    if (editingId) {
      db.update('employees', editingId, { ...payload, active: db.get('employees', editingId).active });
      const linkedUser = db.getAll('users').find((u) => u.employeeId === editingId);
      if (linkedUser) {
        const userUpdate = { role: form.role };
        if (form.password) userUpdate.password = form.password;
        db.update('users', linkedUser.id, userUpdate);
      }
      toast.success('Employee updated.');
    } else {
      const employee = db.create('employees', { ...payload, active: true });
      db.create('users', { username: form.username.trim(), password: form.password, role: form.role, employeeId: employee.id, active: true });
      toast.success('Employee account created.');
    }
    refresh();
    setModal(null);
  }

  function handleDelete() {
    const linkedUser = db.getAll('users').find((u) => u.employeeId === deleteTarget.id);
    if (linkedUser) db.remove('users', linkedUser.id);
    db.remove('employees', deleteTarget.id);
    toast.success('Employee removed.');
    setDeleteTarget(null);
    refresh();
  }

  function toggleActive(row) {
    if (row.id === currentUser.employeeId) {
      toast.error("You can't deactivate your own account.");
      return;
    }
    const nextActive = !row.active;
    db.update('employees', row.id, { active: nextActive });
    const linkedUser = db.getAll('users').find((u) => u.employeeId === row.id);
    if (linkedUser) db.update('users', linkedUser.id, { active: nextActive });
    toast.success(`${row.firstName} ${row.lastName} ${nextActive ? 'activated' : 'deactivated'}.`);
    refresh();
  }

  const columns = [
    { key: 'name', label: 'Name', sortable: true, accessor: (r) => `${r.firstName} ${r.lastName}`, render: (r) => `${r.firstName} ${r.lastName}` },
    { key: 'position', label: 'Position', sortable: true },
    { key: 'email', label: 'Email', sortable: true },
    { key: 'role', label: 'Role', sortable: true, render: (r) => <Badge tone={r.role === 'admin' ? 'bark' : 'neutral'}>{r.role}</Badge> },
    { key: 'dateHired', label: 'Date Hired', sortable: true, render: (r) => formatDate(r.dateHired) },
    { key: 'active', label: 'Status', sortable: true, render: (r) => <Badge tone={r.active ? 'green' : 'rust'}>{r.active ? 'Active' : 'Inactive'}</Badge> },
  ];

  return (
    <div>
      <PageHeader title="Employee Management" description="Manage staff accounts, roles, and account status.">
        <button onClick={openAdd} className="flex items-center gap-1.5 rounded-lg bg-blue-700 px-3.5 py-2 text-sm font-medium text-white hover:bg-blue-600">
          <Plus size={16} /> Add Employee
        </button>
      </PageHeader>

      <DataTable
        columns={columns}
        rows={rows}
        searchKeys={[(r) => `${r.firstName} ${r.lastName}`, 'email', 'position']}
        actions={(row) => (
          <div className="flex justify-end gap-1">
            <button onClick={() => toggleActive(row)} title={row.active ? 'Deactivate' : 'Activate'} className={`rounded-md p-1.5 hover:bg-slate-200/50 ${row.active ? 'text-blue-700' : 'text-ink-400'}`}>
              <Power size={16} />
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

      <Modal open={modal === 'form'} onClose={() => setModal(null)} title={editingId ? 'Edit Employee' : 'Add Employee'} size="lg">
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-2 gap-3">
            <Field label="First name" required error={errors.firstName}>
              <Input value={form.firstName} onChange={(e) => setForm({ ...form, firstName: e.target.value })} error={errors.firstName} />
            </Field>
            <Field label="Last name" required error={errors.lastName}>
              <Input value={form.lastName} onChange={(e) => setForm({ ...form, lastName: e.target.value })} error={errors.lastName} />
            </Field>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Email" required error={errors.email}>
              <Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} error={errors.email} />
            </Field>
            <Field label="Phone" required error={errors.phone}>
              <Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="09XX-XXX-XXXX" error={errors.phone} />
            </Field>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Position" required error={errors.position}>
              <Input value={form.position} onChange={(e) => setForm({ ...form, position: e.target.value })} placeholder="e.g. Warehouse Staff" error={errors.position} />
            </Field>
            <Field label="Date hired" required error={errors.dateHired}>
              <Input type="date" value={form.dateHired} onChange={(e) => setForm({ ...form, dateHired: e.target.value })} error={errors.dateHired} />
            </Field>
          </div>
          <Field label="System role" required hint="Admin has full access; Employee cannot manage users or settings">
            <Select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}>
              <option value="employee">Employee</option>
              <option value="admin">Admin</option>
            </Select>
          </Field>

          <div className="mt-2 rounded-lg border border-slate-200 bg-sky-100 p-3">
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-700">Login credentials</p>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Username" required={!editingId} error={errors.username} hint={editingId ? 'Username cannot be changed' : undefined}>
                <Input value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} disabled={!!editingId} error={errors.username} />
              </Field>
              <Field label={editingId ? 'New password' : 'Password'} required={!editingId} error={errors.password} hint={editingId ? 'Leave blank to keep current password' : 'Minimum 6 characters'}>
                <Input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} error={errors.password} />
              </Field>
            </div>
          </div>

          <div className="mt-5 flex justify-end gap-2">
            <button type="button" onClick={() => setModal(null)} className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium hover:bg-slate-200/40">Cancel</button>
            <button type="submit" className="rounded-lg bg-blue-700 px-4 py-2 text-sm font-medium text-white hover:bg-blue-600">
              {editingId ? 'Save changes' : 'Create employee'}
            </button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        message={<>Remove <strong>{deleteTarget?.firstName} {deleteTarget?.lastName}</strong> and their login account? This action cannot be undone.</>}
      />
    </div>
  );
}
