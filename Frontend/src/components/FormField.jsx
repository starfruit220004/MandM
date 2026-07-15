export function Field({ label, error, required, children, hint }) {
  return (
    <div className="mb-4">
      <label className="mb-1.5 block text-sm font-medium text-ink-900">
        {label} {required && <span className="text-rust-500">*</span>}
      </label>
      {children}
      {hint && !error && <p className="mt-1 text-xs text-ink-500">{hint}</p>}
      {error && <p className="mt-1 text-xs font-medium text-rust-600">{error}</p>}
    </div>
  );
}

const baseInput =
  'w-full rounded-lg border bg-cream-50 px-3 py-2 text-sm text-ink-900 placeholder:text-ink-300 outline-none transition-colors focus:ring-2 focus:ring-palm-400/40';

export function Input({ error, className = '', ...props }) {
  return (
    <input
      className={`${baseInput} ${error ? 'border-rust-500' : 'border-husk-200 focus:border-palm-500'} ${className}`}
      {...props}
    />
  );
}

export function Select({ error, className = '', children, ...props }) {
  return (
    <select
      className={`${baseInput} ${error ? 'border-rust-500' : 'border-husk-200 focus:border-palm-500'} ${className}`}
      {...props}
    >
      {children}
    </select>
  );
}

export function Textarea({ error, className = '', ...props }) {
  return (
    <textarea
      className={`${baseInput} ${error ? 'border-rust-500' : 'border-husk-200 focus:border-palm-500'} ${className}`}
      rows={3}
      {...props}
    />
  );
}
