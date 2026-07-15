import { createContext, useCallback, useContext, useState } from 'react';
import { CheckCircle2, XCircle, Info, X } from 'lucide-react';

const ToastContext = createContext(null);
let idCounter = 1;

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const dismiss = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const push = useCallback((message, type = 'success') => {
    const id = idCounter++;
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => dismiss(id), 3500);
  }, [dismiss]);

  const toast = {
    success: (msg) => push(msg, 'success'),
    error: (msg) => push(msg, 'error'),
    info: (msg) => push(msg, 'info'),
  };

  return (
    <ToastContext.Provider value={toast}>
      {children}
      <div className="fixed top-4 right-4 z-[100] flex flex-col gap-2 w-[min(360px,calc(100vw-2rem))]">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`animate-toast-in flex items-start gap-2.5 rounded-lg border px-4 py-3 shadow-lg backdrop-blur-sm ${
              t.type === 'success'
                ? 'bg-palm-800/95 border-palm-600 text-palm-50'
                : t.type === 'error'
                ? 'bg-rust-600/95 border-rust-500 text-white'
                : 'bg-bark-800/95 border-husk-600 text-cream-50'
            }`}
          >
            {t.type === 'success' && <CheckCircle2 size={18} className="mt-0.5 shrink-0" />}
            {t.type === 'error' && <XCircle size={18} className="mt-0.5 shrink-0" />}
            {t.type === 'info' && <Info size={18} className="mt-0.5 shrink-0" />}
            <p className="text-sm leading-snug flex-1">{t.message}</p>
            <button onClick={() => dismiss(t.id)} className="opacity-70 hover:opacity-100 shrink-0">
              <X size={15} />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within ToastProvider');
  return ctx;
}
