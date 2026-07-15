const palettes = {
  green: 'bg-palm-100 text-palm-800 border-palm-300',
  gold: 'bg-copra-200 text-copra-600 border-copra-500/40',
  rust: 'bg-rust-100 text-rust-600 border-rust-500/30',
  neutral: 'bg-husk-200/50 text-ink-700 border-husk-200',
  bark: 'bg-bark-900 text-cream-50 border-bark-900',
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
