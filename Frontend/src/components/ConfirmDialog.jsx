import { AlertTriangle } from 'lucide-react';
import Modal from './Modal';

export default function ConfirmDialog({ open, onClose, onConfirm, title = 'Delete record', message, confirmLabel = 'Delete' }) {
  return (
    <Modal open={open} onClose={onClose} title={title} size="sm">
      <div className="flex gap-3">
        <div className="shrink-0 flex h-10 w-10 items-center justify-center rounded-full bg-rust-100 text-rust-600">
          <AlertTriangle size={20} />
        </div>
        <p className="text-sm text-ink-700 leading-relaxed pt-1.5">{message}</p>
      </div>
      <div className="mt-6 flex justify-end gap-2">
        <button
          onClick={onClose}
          className="rounded-lg border border-husk-200 px-4 py-2 text-sm font-medium text-ink-700 hover:bg-husk-200/40 transition-colors"
        >
          Cancel
        </button>
        <button
          onClick={onConfirm}
          className="rounded-lg bg-rust-600 px-4 py-2 text-sm font-medium text-white hover:bg-rust-500 transition-colors"
        >
          {confirmLabel}
        </button>
      </div>
    </Modal>
  );
}
