import { X } from 'lucide-react';
import { useEffect } from 'react';

export default function Modal({ open, onClose, title, children, size = 'md' }) {
  useEffect(() => {
    function onKey(e) {
      if (e.key === 'Escape') onClose?.();
    }
    if (open) document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open) return null;

  const widths = {
    sm: 'max-w-sm',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-bark-950/50 backdrop-blur-[2px]" onClick={onClose} />
      <div
        className={`relative w-full ${widths[size]} max-h-[90vh] overflow-y-auto rounded-xl bg-cream-50 border border-husk-200 shadow-2xl animate-fade-in-up`}
      >
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-husk-200 bg-cream-50/95 backdrop-blur px-5 py-4">
          <h2 className="font-display text-lg font-semibold text-bark-900">{title}</h2>
          <button
            onClick={onClose}
            className="rounded-md p-1.5 text-ink-500 hover:bg-husk-200/50 hover:text-ink-900 transition-colors"
            aria-label="Close dialog"
          >
            <X size={18} />
          </button>
        </div>
        <div className="p-5">{children}</div>
      </div>
    </div>
  );
}
