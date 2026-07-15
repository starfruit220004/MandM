import { useMemo } from 'react';
import {
  Boxes, UserSquare2, Users, UsersRound, Wallet, CalendarClock, TrendingUp, AlertTriangle,
} from 'lucide-react';
import {
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, BarChart, Bar, Cell,
} from 'recharts';
import { db, formatCurrency, formatDate, todayISO } from '../lib/storage';
import StatCard from '../components/StatCard';
import Badge from '../components/Badge';
import PageHeader from '../components/PageHeader';

export default function Dashboard() {
  const data = useMemo(() => {
    const inventory = db.getAll('inventory');
    const suppliers = db.getAll('suppliers');
    const customers = db.getAll('customers');
    const employees = db.getAll('employees');
    const sales = db.getAll('sales');
    const purchases = db.getAll('purchases');
    const deliveries = db.getAll('deliveries');

    const today = todayISO();
    const todaySales = sales.filter((s) => s.date === today).reduce((sum, s) => sum + s.totalAmount, 0);

    const now = new Date();
    const monthSales = sales
      .filter((s) => {
        const d = new Date(s.date);
        return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
      })
      .reduce((sum, s) => sum + s.totalAmount, 0);

    const pendingDeliveries = deliveries.filter((d) => d.status !== 'Delivered').length;
    const lowStock = inventory.filter((i) => i.quantity <= i.minStock);

    // last 7 days sales trend
    const trend = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const iso = d.toISOString().slice(0, 10);
      const total = sales.filter((s) => s.date === iso).reduce((sum, s) => sum + s.totalAmount, 0);
      trend.push({ day: d.toLocaleDateString('en-PH', { weekday: 'short' }), total });
    }

    const stockLevels = inventory.map((i) => ({ name: i.name.split(' ')[0], qty: i.quantity, min: i.minStock }));

    // recent transactions: merge sales + purchases
    const recent = [
      ...sales.map((s) => ({ type: 'Sale', id: s.id, date: s.date, amount: s.totalAmount, party: customers.find((c) => c.id === s.customerId)?.name })),
      ...purchases.map((p) => ({ type: 'Purchase', id: p.id, date: p.date, amount: p.totalAmount, party: suppliers.find((s) => s.id === p.supplierId)?.name })),
    ]
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(0, 6);

    return {
      totalInventory: inventory.length,
      totalSuppliers: suppliers.length,
      totalCustomers: customers.length,
      totalEmployees: employees.filter((e) => e.active).length,
      todaySales,
      monthSales,
      pendingDeliveries,
      lowStock,
      trend,
      stockLevels,
      recent,
    };
  }, []);

  return (
    <div>
      <PageHeader title="Dashboard" description="Snapshot of today's coconut trading operations." />

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-4">
        <StatCard label="Inventory Items" value={data.totalInventory} icon={Boxes} tone="bark" />
        <StatCard label="Suppliers" value={data.totalSuppliers} icon={UserSquare2} tone="cream" />
        <StatCard label="Customers" value={data.totalCustomers} icon={Users} tone="cream" />
        <StatCard label="Active Employees" value={data.totalEmployees} icon={UsersRound} tone="cream" />
        <StatCard label="Today's Sales" value={formatCurrency(data.todaySales)} icon={Wallet} tone="palm" />
        <StatCard label="Monthly Sales" value={formatCurrency(data.monthSales)} icon={TrendingUp} tone="copra" />
        <StatCard label="Pending Deliveries" value={data.pendingDeliveries} icon={CalendarClock} tone="cream" />
        <StatCard
          label="Low-Stock Items"
          value={data.lowStock.length}
          icon={AlertTriangle}
          tone={data.lowStock.length > 0 ? 'copra' : 'cream'}
        />
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-5">
        <div className="lg:col-span-3 rounded-xl border border-husk-200 bg-cream-50 p-4 shadow-sm">
          <h3 className="font-display text-base font-semibold text-bark-900">Sales — last 7 days</h3>
          <div className="mt-3 h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data.trend} margin={{ left: -18, right: 8 }}>
                <defs>
                  <linearGradient id="salesFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--color-palm-500)" stopOpacity={0.45} />
                    <stop offset="100%" stopColor="var(--color-palm-500)" stopOpacity={0.03} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="var(--color-husk-200)" vertical={false} />
                <XAxis dataKey="day" tick={{ fontSize: 12, fill: 'var(--color-ink-500)' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: 'var(--color-ink-500)' }} axisLine={false} tickLine={false} width={60} tickFormatter={(v) => `₱${v}`} />
                <Tooltip
                  formatter={(v) => formatCurrency(v)}
                  contentStyle={{ borderRadius: 10, border: '1px solid var(--color-husk-200)', fontSize: 12 }}
                />
                <Area type="monotone" dataKey="total" stroke="var(--color-palm-600)" strokeWidth={2} fill="url(#salesFill)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="lg:col-span-2 rounded-xl border border-husk-200 bg-cream-50 p-4 shadow-sm">
          <h3 className="font-display text-base font-semibold text-bark-900">Stock levels</h3>
          <div className="mt-3 h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.stockLevels} margin={{ left: -18, right: 8 }}>
                <CartesianGrid stroke="var(--color-husk-200)" vertical={false} />
                <XAxis dataKey="name" tick={{ fontSize: 10, fill: 'var(--color-ink-500)' }} axisLine={false} tickLine={false} interval={0} angle={-20} textAnchor="end" height={50} />
                <YAxis tick={{ fontSize: 11, fill: 'var(--color-ink-500)' }} axisLine={false} tickLine={false} width={40} />
                <Tooltip contentStyle={{ borderRadius: 10, border: '1px solid var(--color-husk-200)', fontSize: 12 }} />
                <Bar dataKey="qty" radius={[4, 4, 0, 0]}>
                  {data.stockLevels.map((entry, i) => (
                    <Cell key={i} fill={entry.qty <= entry.min ? 'var(--color-rust-500)' : 'var(--color-palm-500)'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-5">
        <div className="lg:col-span-3 rounded-xl border border-husk-200 bg-cream-50 shadow-sm">
          <div className="border-b border-husk-200 px-4 py-3">
            <h3 className="font-display text-base font-semibold text-bark-900">Recent transactions</h3>
          </div>
          <div className="divide-y divide-husk-200/60">
            {data.recent.map((t, i) => (
              <div key={i} className="flex items-center justify-between px-4 py-3 text-sm">
                <div className="flex items-center gap-3">
                  <Badge tone={t.type === 'Sale' ? 'green' : 'gold'}>{t.type}</Badge>
                  <div>
                    <p className="font-medium text-ink-900">{t.party || '—'}</p>
                    <p className="text-xs text-ink-500">{formatDate(t.date)}</p>
                  </div>
                </div>
                <span className="font-mono text-sm font-medium text-ink-900">{formatCurrency(t.amount)}</span>
              </div>
            ))}
            {data.recent.length === 0 && <p className="px-4 py-8 text-center text-sm text-ink-500">No transactions yet.</p>}
          </div>
        </div>

        <div className="lg:col-span-2 rounded-xl border border-husk-200 bg-cream-50 shadow-sm">
          <div className="flex items-center justify-between border-b border-husk-200 px-4 py-3">
            <h3 className="font-display text-base font-semibold text-bark-900">Low-stock alerts</h3>
            {data.lowStock.length > 0 && <Badge tone="rust">{data.lowStock.length} item{data.lowStock.length > 1 ? 's' : ''}</Badge>}
          </div>
          <div className="divide-y divide-husk-200/60">
            {data.lowStock.map((item) => (
              <div key={item.id} className="flex items-center justify-between px-4 py-3 text-sm">
                <div>
                  <p className="font-medium text-ink-900">{item.name}</p>
                  <p className="text-xs text-ink-500">Min. stock: {item.minStock} {item.unit}</p>
                </div>
                <span className="font-mono text-sm font-semibold text-rust-600">{item.quantity} {item.unit}</span>
              </div>
            ))}
            {data.lowStock.length === 0 && <p className="px-4 py-8 text-center text-sm text-ink-500">All stock levels are healthy.</p>}
          </div>
        </div>
      </div>
    </div>
  );
}
