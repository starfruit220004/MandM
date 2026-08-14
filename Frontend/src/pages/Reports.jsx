import { useMemo, useState, useRef } from 'react';
import { FileBarChart2, Boxes, ShoppingCart, Receipt, UserSquare2, Users, FileText, File } from 'lucide-react';
import { db, formatCurrency, formatDate } from '../lib/storage';
import PageHeader from '../components/PageHeader';
import { Field, Input, Select } from '../components/FormField';
import html2pdf from 'html2pdf.js';

const TABS = [
  { key: 'inventory', label: 'Inventory', icon: Boxes },
  { key: 'sales', label: 'Sales', icon: Receipt },
  { key: 'purchases', label: 'Purchases', icon: ShoppingCart },
  { key: 'suppliers', label: 'Suppliers', icon: UserSquare2 },
  { key: 'customers', label: 'Customers', icon: Users },
];

function inRange(dateStr, from, to) {
  if (!dateStr) return true;
  if (from && dateStr < from) return false;
  if (to && dateStr > to) return false;
  return true;
}

export default function Reports() {
  const [tab, setTab] = useState('sales');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [category, setCategory] = useState('all');

  const inventory = db.getAll('inventory');
  const suppliers = db.getAll('suppliers');
  const customers = db.getAll('customers');
  const sales = useMemo(() => db.getAll('sales').filter((s) => inRange(s.date, from, to)), [from, to]);
  const purchases = useMemo(() => db.getAll('purchases').filter((p) => inRange(p.date, from, to)), [from, to]);

  const salesTotal = sales.reduce((s, r) => s + r.totalAmount, 0);
  const purchasesTotal = purchases.reduce((s, r) => s + r.totalAmount, 0);
  const inventoryValue = inventory.reduce((s, i) => s + i.quantity * i.unitCost, 0);

  const filteredInventory = category === 'all' ? inventory : inventory.filter((i) => i.category === category);

  return (
    <div>
      <PageHeader title="Reports" description="Generate and filter reports across all business operations. You can export these to Word or PDF." />

      <div className="mb-4 flex flex-wrap gap-1.5 rounded-xl border border-slate-200 bg-white p-1.5">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`flex items-center gap-1.5 rounded-lg px-3.5 py-2 text-sm font-medium transition-colors ${
              tab === t.key ? 'bg-blue-700 text-white shadow-sm' : 'text-slate-700 hover:bg-slate-200/40'
            }`}
          >
            <t.icon size={15} /> {t.label}
          </button>
        ))}
      </div>

      {(tab === 'sales' || tab === 'purchases') && (
        <div className="mb-4 flex flex-wrap items-end gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <Field label="From date">
            <Input type="date" value={from} onChange={(e) => setFrom(e.target.value)} />
          </Field>
          <Field label="To date">
            <Input type="date" value={to} onChange={(e) => setTo(e.target.value)} />
          </Field>
          {(from || to) && (
            <button onClick={() => { setFrom(''); setTo(''); }} className="mb-4 text-sm font-medium text-blue-700 hover:text-blue-600">
              Clear filter
            </button>
          )}
        </div>
      )}

      {tab === 'inventory' && (
        <div className="mb-4 flex items-end gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <Field label="Category">
            <Select value={category} onChange={(e) => setCategory(e.target.value)}>
              <option value="all">All categories</option>
              <option value="Raw">Raw</option>
              <option value="Processed">Processed</option>
              <option value="By-product">By-product</option>
            </Select>
          </Field>
        </div>
      )}

      {tab === 'inventory' && (
        <ReportShell title="Inventory Report" summary={`Total inventory value: ${formatCurrency(inventoryValue)}`}>
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-600 text-white">
                <Th>Item</Th><Th>Category</Th><Th align="right">Quantity</Th><Th align="right">Unit Cost</Th><Th align="right">Value</Th><Th>Updated</Th>
              </tr>
            </thead>
            <tbody>
              {filteredInventory.map((i) => (
                <tr key={i.id} className="border-b border-slate-200/60 last:border-0 hover:bg-slate-50/50">
                  <Td>{i.name}</Td>
                  <Td>{i.category}</Td>
                  <Td align="right" mono>{i.quantity} {i.unit}</Td>
                  <Td align="right" mono>{formatCurrency(i.unitCost)}</Td>
                  <Td align="right" mono>{formatCurrency(i.quantity * i.unitCost)}</Td>
                  <Td>{formatDate(i.updatedAt)}</Td>
                </tr>
              ))}
              {filteredInventory.length === 0 && (
                <tr>
                  <td colSpan="6" className="p-4 text-center text-slate-500">No records found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </ReportShell>
      )}

      {tab === 'sales' && (
        <ReportShell title="Sales Report" summary={`Total sales: ${formatCurrency(salesTotal)} across ${sales.length} transaction${sales.length === 1 ? '' : 's'}`}>
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-600 text-white">
                <Th>ID</Th><Th>Date</Th><Th>Customer</Th><Th align="right">Items</Th><Th align="right">Total</Th>
              </tr>
            </thead>
            <tbody>
              {sales.map((s) => (
                <tr key={s.id} className="border-b border-slate-200/60 last:border-0 hover:bg-slate-50/50">
                  <Td mono>#{s.id}</Td>
                  <Td>{formatDate(s.date)}</Td>
                  <Td>{customers.find((c) => c.id === s.customerId)?.name || '—'}</Td>
                  <Td align="right">{s.items.length}</Td>
                  <Td align="right" mono>{formatCurrency(s.totalAmount)}</Td>
                </tr>
              ))}
              {sales.length === 0 && (
                <tr>
                  <td colSpan="5" className="p-4 text-center text-slate-500">No records found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </ReportShell>
      )}

      {tab === 'purchases' && (
        <ReportShell title="Purchase Report" summary={`Total purchases: ${formatCurrency(purchasesTotal)} across ${purchases.length} transaction${purchases.length === 1 ? '' : 's'}`}>
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-600 text-white">
                <Th>ID</Th><Th>Date</Th><Th>Supplier</Th><Th align="right">Items</Th><Th align="right">Total</Th>
              </tr>
            </thead>
            <tbody>
              {purchases.map((p) => (
                <tr key={p.id} className="border-b border-slate-200/60 last:border-0 hover:bg-slate-50/50">
                  <Td mono>#{p.id}</Td>
                  <Td>{formatDate(p.date)}</Td>
                  <Td>{suppliers.find((s) => s.id === p.supplierId)?.name || '—'}</Td>
                  <Td align="right">{p.items.length}</Td>
                  <Td align="right" mono>{formatCurrency(p.totalAmount)}</Td>
                </tr>
              ))}
              {purchases.length === 0 && (
                <tr>
                  <td colSpan="5" className="p-4 text-center text-slate-500">No records found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </ReportShell>
      )}

      {tab === 'suppliers' && (
        <ReportShell title="Supplier Report" summary={`${suppliers.length} suppliers on record`}>
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-600 text-white">
                <Th>Supplier</Th><Th>Contact</Th><Th align="right">Purchases</Th><Th align="right">Total Spent</Th>
              </tr>
            </thead>
            <tbody>
              {suppliers.map((s) => {
                const supplierPurchases = db.getAll('purchases').filter((p) => p.supplierId === s.id);
                const spent = supplierPurchases.reduce((sum, p) => sum + p.totalAmount, 0);
                return (
                  <tr key={s.id} className="border-b border-slate-200/60 last:border-0 hover:bg-slate-50/50">
                    <Td>{s.name}</Td>
                    <Td>{s.contact}</Td>
                    <Td align="right">{supplierPurchases.length}</Td>
                    <Td align="right" mono>{formatCurrency(spent)}</Td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </ReportShell>
      )}

      {tab === 'customers' && (
        <ReportShell title="Customer Report" summary={`${customers.length} customers on record`}>
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-600 text-white">
                <Th>Customer</Th><Th>Contact</Th><Th align="right">Purchases</Th><Th align="right">Total Spent</Th>
              </tr>
            </thead>
            <tbody>
              {customers.map((c) => {
                const customerSales = db.getAll('sales').filter((s) => s.customerId === c.id);
                const spent = customerSales.reduce((sum, s) => sum + s.totalAmount, 0);
                return (
                  <tr key={c.id} className="border-b border-slate-200/60 last:border-0 hover:bg-slate-50/50">
                    <Td>{c.name}</Td>
                    <Td>{c.contact}</Td>
                    <Td align="right">{customerSales.length}</Td>
                    <Td align="right" mono>{formatCurrency(spent)}</Td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </ReportShell>
      )}
    </div>
  );
}

function ReportShell({ title, summary, children }) {
  const contentRef = useRef(null);

  const exportToPDF = () => {
    const element = contentRef.current;
    if (!element) return;
    const opt = {
      margin:       [0.5, 0.5, 0.5, 0.5],
      filename:     `${title.replace(/\s+/g, '_')}_${new Date().toISOString().slice(0, 10)}.pdf`,
      image:        { type: 'jpeg', quality: 0.98 },
      html2canvas:  { scale: 2, useCORS: true },
      jsPDF:        { unit: 'in', format: 'letter', orientation: 'landscape' }
    };
    html2pdf().set(opt).from(element).save();
  };

  const exportToWord = () => {
    const element = contentRef.current;
    if (!element) return;
    
    // Inject styling directly so MS Word picks it up
    const html = `
      <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
      <head>
        <meta charset='utf-8'>
        <title>${title}</title>
        <style>
          body { font-family: 'Segoe UI', Arial, sans-serif; color: #333; }
          h1 { color: #1d4ed8; font-size: 24px; border-bottom: 2px solid #1d4ed8; padding-bottom: 5px; }
          p.summary { font-size: 14px; color: #555; margin-bottom: 20px; }
          table { width: 100%; border-collapse: collapse; margin-top: 10px; font-size: 12px; }
          th, td { border: 1px solid #cbd5e1; padding: 10px; text-align: left; }
          th { background-color: #475569; color: #ffffff; font-weight: bold; text-transform: uppercase; }
          .right { text-align: right; }
          .mono { font-family: monospace; }
        </style>
      </head>
      <body>
        <h1>${title}</h1>
        <p class="summary"><strong>Summary:</strong> ${summary}</p>
        ${element.outerHTML}
      </body>
      </html>
    `;
    
    const blob = new Blob(['\\ufeff', html], { type: 'application/msword' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${title.replace(/\s+/g, '_')}_${new Date().toISOString().slice(0, 10)}.doc`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between border-b border-slate-200 px-5 py-4 gap-3 bg-slate-50/50">
        <div>
          <h3 className="font-display flex items-center gap-2 text-lg font-bold text-slate-900">
            <FileBarChart2 size={20} className="text-blue-700" /> {title}
          </h3>
          <span className="text-sm font-medium text-slate-500 mt-1 block">{summary}</span>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button onClick={exportToWord} className="flex items-center justify-center gap-2 rounded-lg bg-blue-50 px-4 py-2 text-sm font-semibold text-blue-700 hover:bg-blue-100 transition-colors border border-blue-200 shadow-sm">
            <FileText size={16} /> Export to Word
          </button>
          <button onClick={exportToPDF} className="flex items-center justify-center gap-2 rounded-lg bg-rose-50 px-4 py-2 text-sm font-semibold text-rose-700 hover:bg-rose-100 transition-colors border border-rose-200 shadow-sm">
            <File size={16} /> Export to PDF
          </button>
        </div>
      </div>
      <div className="overflow-x-auto">
        <div ref={contentRef} className="p-0">
          {children}
        </div>
      </div>
    </div>
  );
}

function Th({ children, align = 'left' }) {
  // Apply a class "right" if aligned right so Word can style it via CSS
  const alignClass = align === 'right' ? 'right' : '';
  return <th align={align} className={`px-5 py-3 text-${align} text-xs font-semibold uppercase tracking-wider ${alignClass} whitespace-nowrap`}>{children}</th>;
}
function Td({ children, align = 'left', mono = false }) {
  const alignClass = align === 'right' ? 'right' : '';
  const monoClass = mono ? 'mono' : '';
  return <td align={align} className={`px-5 py-3 text-${align} ${mono ? 'font-mono' : ''} ${alignClass} ${monoClass} text-sm text-slate-700`}>{children}</td>;
}
