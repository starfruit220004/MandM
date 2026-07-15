export function Field({ label, error, required, children, hint }) {
  return (
    <div className="mb-4">
      <label className="mb-1.5 block text-sm font-medium text-slate-900">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      {children}
      {hint && !error && <p className="mt-1 text-xs text-slate-500">{hint}</p>}
      {error && <p className="mt-1 text-xs font-medium text-red-600">{error}</p>}
    </div>
  );
}

const baseInput =
  'w-full rounded-lg border bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-300 outline-none transition-colors focus:ring-2 focus:ring-blue-400/40';

export function Input({ error, className = '', ...props }) {
  return (
    <input
      className={`${baseInput} ${error ? 'border-red-500' : 'border-slate-200 focus:border-blue-500'} ${className}`}
      {...props}
    />
  );
}

export function Select({ error, className = '', children, ...props }) {
  return (
    <select
      className={`${baseInput} ${error ? 'border-red-500' : 'border-slate-200 focus:border-blue-500'} ${className}`}
      {...props}
    >
      {children}
    </select>
  );
}

export function Textarea({ error, className = '', ...props }) {
  return (
    <textarea
      className={`${baseInput} ${error ? 'border-red-500' : 'border-slate-200 focus:border-blue-500'} ${className}`}
      rows={3}
      {...props}
    />
  );
}
