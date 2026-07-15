import { useMemo, useState } from 'react';
import { ChevronUp, ChevronDown, ChevronLeft, ChevronRight, Search, Inbox } from 'lucide-react';

/**
 * columns: [{ key, label, sortable, render(row), accessor(row) }]
 * rows: array of data objects
 * searchKeys: array of field names (or accessor fns) to match against the search query
 */
export default function DataTable({
  columns,
  rows,
  searchKeys = [],
  pageSize = 8,
  emptyLabel = 'No records found.',
  actions,
}) {
  const [query, setQuery] = useState('');
  const [sortKey, setSortKey] = useState(null);
  const [sortDir, setSortDir] = useState('asc');
  const [page, setPage] = useState(1);

  const filtered = useMemo(() => {
    if (!query.trim()) return rows;
    const q = query.trim().toLowerCase();
    return rows.filter((row) =>
      searchKeys.some((k) => {
        const val = typeof k === 'function' ? k(row) : row[k];
        return String(val ?? '').toLowerCase().includes(q);
      })
    );
  }, [rows, query, searchKeys]);

  const sorted = useMemo(() => {
    if (!sortKey) return filtered;
    const col = columns.find((c) => c.key === sortKey);
    const accessor = col?.accessor || ((r) => r[sortKey]);
    const copy = [...filtered];
    copy.sort((a, b) => {
      const av = accessor(a);
      const bv = accessor(b);
      if (typeof av === 'number' && typeof bv === 'number') return sortDir === 'asc' ? av - bv : bv - av;
      return sortDir === 'asc'
        ? String(av ?? '').localeCompare(String(bv ?? ''))
        : String(bv ?? '').localeCompare(String(av ?? ''));
    });
    return copy;
  }, [filtered, sortKey, sortDir, columns]);

  const totalPages = Math.max(1, Math.ceil(sorted.length / pageSize));
  const pageSafe = Math.min(page, totalPages);
  const pageRows = sorted.slice((pageSafe - 1) * pageSize, pageSafe * pageSize);

  function handleSort(col) {
    if (!col.sortable) return;
    if (sortKey === col.key) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(col.key);
      setSortDir('asc');
    }
    setPage(1);
  }

  return (
    <div>
      {searchKeys.length > 0 && (
        <div className="mb-3 flex items-center gap-2">
          <div className="relative w-full max-w-xs">
            <Search size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-300" />
            <input
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setPage(1);
              }}
              placeholder="Search…"
              className="w-full rounded-lg border border-husk-200 bg-cream-50 py-2 pl-9 pr-3 text-sm outline-none focus:border-palm-500 focus:ring-2 focus:ring-palm-400/30"
            />
          </div>
          <span className="text-xs text-ink-500">{sorted.length} record{sorted.length === 1 ? '' : 's'}</span>
        </div>
      )}

      <div className="overflow-x-auto rounded-xl border border-husk-200 bg-cream-50 shadow-sm">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-husk-200 bg-husk-700 text-cream-50">
              {columns.map((col) => (
                <th
                  key={col.key}
                  onClick={() => handleSort(col)}
                  className={`px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide whitespace-nowrap ${
                    col.sortable ? 'cursor-pointer select-none hover:bg-husk-600' : ''
                  }`}
                >
                  <span className="inline-flex items-center gap-1">
                    {col.label}
                    {col.sortable && sortKey === col.key && (sortDir === 'asc' ? <ChevronUp size={13} /> : <ChevronDown size={13} />)}
                  </span>
                </th>
              ))}
              {actions && <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide">Actions</th>}
            </tr>
          </thead>
          <tbody>
            {pageRows.length === 0 && (
              <tr>
                <td colSpan={columns.length + (actions ? 1 : 0)} className="px-4 py-14 text-center text-ink-500">
                  <div className="flex flex-col items-center gap-2">
                    <Inbox size={26} className="text-husk-400" />
                    <span className="text-sm">{emptyLabel}</span>
                  </div>
                </td>
              </tr>
            )}
            {pageRows.map((row, i) => (
              <tr
                key={row.id ?? i}
                className="border-b border-husk-200/60 last:border-0 hover:bg-palm-50 transition-colors"
              >
                {columns.map((col) => (
                  <td key={col.key} className="px-4 py-3 align-middle text-ink-900">
                    {col.render ? col.render(row) : row[col.key]}
                  </td>
                ))}
                {actions && <td className="px-4 py-3 text-right">{actions(row)}</td>}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {sorted.length > pageSize && (
        <div className="mt-3 flex items-center justify-between text-sm text-ink-700">
          <span>
            Page {pageSafe} of {totalPages}
          </span>
          <div className="flex gap-1.5">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={pageSafe === 1}
              className="flex items-center gap-1 rounded-lg border border-husk-200 px-2.5 py-1.5 hover:bg-husk-200/40 disabled:opacity-40 disabled:hover:bg-transparent"
            >
              <ChevronLeft size={14} /> Prev
            </button>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={pageSafe === totalPages}
              className="flex items-center gap-1 rounded-lg border border-husk-200 px-2.5 py-1.5 hover:bg-husk-200/40 disabled:opacity-40 disabled:hover:bg-transparent"
            >
              Next <ChevronRight size={14} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
