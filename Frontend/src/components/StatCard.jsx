export default function StatCard({ label, value, icon: Icon, tone = 'palm', sub }) {
  const tones = {
    palm: 'bg-palm-700 text-cream-50',
    bark: 'bg-bark-900 text-cream-50',
    copra: 'bg-copra-500 text-bark-950',
    cream: 'bg-cream-50 text-ink-900 border border-husk-200',
  };

  return (
    <div className={`rounded-xl p-4 shadow-sm ${tones[tone]}`}>
      <div className="flex items-start justify-between">
        <div>
          <p className={`text-xs font-medium uppercase tracking-wide ${tone === 'cream' ? 'text-ink-500' : 'opacity-80'}`}>
            {label}
          </p>
          <p className="font-display mt-1 text-2xl font-semibold">{value}</p>
          {sub && <p className={`mt-1 text-xs ${tone === 'cream' ? 'text-ink-500' : 'opacity-75'}`}>{sub}</p>}
        </div>
        {Icon && (
          <div className={`rounded-lg p-2 ${tone === 'cream' ? 'bg-palm-100 text-palm-700' : 'bg-white/15'}`}>
            <Icon size={18} />
          </div>
        )}
      </div>
    </div>
  );
}
