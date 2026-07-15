const palettes = {
  green: 'bg-blue-100 text-blue-800 border-blue-300',
  gold: 'bg-sky-200 text-sky-600 border-sky-500/40',
  rust: 'bg-red-100 text-red-600 border-red-500/30',
  neutral: 'bg-slate-200/50 text-slate-700 border-slate-200',
  bark: 'bg-slate-900 text-white border-slate-900',
};

export default function Badge({ children, tone = 'neutral', className = '' }) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-medium whitespace-nowrap ${palettes[tone]} ${className}`}
    >
      {children}
    </span>
  );
}

export function deliveryStatusTone(status) {
  if (status === 'Delivered') return 'green';
  if (status === 'In Transit') return 'gold';
  return 'neutral';
}
