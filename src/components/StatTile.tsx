interface Props {
  label: string;
  value: string | number;
  icon?: string;
  tone?: 'default' | 'indigo' | 'emerald' | 'amber';
}

const TONES = {
  default: 'bg-slate-900 border-slate-800 text-slate-100',
  indigo: 'bg-indigo-950/40 border-indigo-900/50 text-indigo-100',
  emerald: 'bg-emerald-950/40 border-emerald-900/50 text-emerald-100',
  amber: 'bg-amber-950/40 border-amber-900/50 text-amber-100',
};

export default function StatTile({ label, value, icon, tone = 'default' }: Props) {
  return (
    <div data-stat={label} className={`rounded-xl border p-3 sm:p-4 ${TONES[tone]}`}>
      <div className="flex items-center gap-1.5 text-[10px] sm:text-xs font-semibold uppercase tracking-wider text-slate-400">
        {icon && <i className={`fa-solid ${icon}`} />}
        <span className="truncate">{label}</span>
      </div>
      <div className="mt-1 text-xl sm:text-2xl font-extrabold tabular-nums">{value}</div>
    </div>
  );
}
