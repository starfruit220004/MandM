export default function StatCard({ label, value, icon: Icon, tone = 'palm', sub }) {
  const tones = {
    palm: 'bg-blue-700 text-white',
    bark: 'bg-slate-900 text-white',
    copra: 'bg-sky-500 text-slate-950',
    cream: 'bg-white text-slate-900 border border-slate-200',
  };

  return (
    <div className={`rounded-xl p-4 shadow-sm ${tones[tone]}`}>
      <div className="flex items-start justify-between">
        <div>
          <p className={`text-xs font-medium uppercase tracking-wide ${tone === 'cream' ? 'text-slate-500' : 'opacity-80'}`}>
            {label}
          </p>
          <p className="font-display mt-1 text-2xl font-semibold">{value}</p>
          {sub && <p className={`mt-1 text-xs ${tone === 'cream' ? 'text-slate-500' : 'opacity-75'}`}>{sub}</p>}
        </div>
        {Icon && (
          <div className={`rounded-lg p-2 ${tone === 'cream' ? 'bg-blue-100 text-blue-700' : 'bg-white/15'}`}>
            <Icon size={18} />
          </div>
        )}
      </div>
    </div>
  );
}
