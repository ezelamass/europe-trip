import { EUROPEAN_BENEFITS } from '../data/europa2026';
import { useStore } from '../store/useStore';
import { fmtMoney } from '../lib/format';

export default function BenefitsTab() {
  const applied = useStore((s) => s.appliedBenefits);
  const toggle = useStore((s) => s.toggleBenefit);
  const displayCurrency = useStore((s) => s.displayCurrency);
  const usdToEurRate = useStore((s) => s.usdToEurRate);
  const money = (v: number) => fmtMoney(v, displayCurrency, usdToEurRate);

  const activados = EUROPEAN_BENEFITS.filter((b) => applied[b.id]);
  const activos = activados.length;
  const ahorro = activados.reduce((a, b) => a + b.saving, 0);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-white">Beneficios UE</h2>
        <p className="text-sm text-slate-400 mt-1">
          {activos} de {EUROPEAN_BENEFITS.length} activados · ahorro estimado {money(ahorro)}.
          Ventajas del pasaporte español y de la franja de edad joven.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {EUROPEAN_BENEFITS.map((b) => {
          const on = !!applied[b.id];
          return (
            <div
              key={b.id}
              className={`rounded-2xl border overflow-hidden transition ${
                on ? 'bg-slate-900 border-slate-700' : 'bg-slate-900/50 border-slate-800 opacity-60'
              }`}
            >
              <div className={`bg-gradient-to-r ${b.color} px-5 py-3 flex items-center justify-between gap-3`}>
                <div className="flex items-center gap-2.5 min-w-0 text-white">
                  <i className={`fa-solid ${b.icon} text-lg shrink-0`} />
                  <div className="min-w-0">
                    <h3 className="font-bold leading-tight truncate">{b.title}</h3>
                    <p className="text-[11px] opacity-90 truncate">{b.sub}</p>
                  </div>
                </div>
                <button
                  onClick={() => toggle(b.id)}
                  aria-label={on ? 'Desactivar' : 'Activar'}
                  className={`shrink-0 w-11 h-6 rounded-full transition relative ${
                    on ? 'bg-white/90' : 'bg-black/30'
                  }`}
                >
                  <span
                    className={`absolute top-0.5 w-5 h-5 rounded-full bg-slate-900 transition-all ${
                      on ? 'left-[22px]' : 'left-0.5'
                    }`}
                  />
                </button>
              </div>

              <div className="p-5 space-y-3">
                <p className="text-sm text-slate-300">{b.desc}</p>
                <ul className="space-y-1.5">
                  {b.bullets.map((x, i) => (
                    <li key={i} className="text-xs text-slate-400 flex gap-2">
                      <i className="fa-solid fa-check text-emerald-400 mt-0.5 shrink-0" />
                      <span dangerouslySetInnerHTML={{ __html: x }} />
                    </li>
                  ))}
                </ul>
                <div className="text-xs bg-slate-950/60 border border-slate-800 rounded-lg px-3 py-2 text-slate-300">
                  <span className="font-semibold text-slate-200">Cómo se usa: </span>
                  {b.howToUse}
                </div>
                <div className="flex flex-wrap gap-2 text-[11px]">
                  <span className="px-2 py-1 rounded-lg bg-emerald-950/50 text-emerald-300 border border-emerald-900/50 font-semibold">
                    Ahorro: {money(b.saving)}
                  </span>
                  <span className="px-2 py-1 rounded-lg bg-slate-800 text-slate-300 border border-slate-700">
                    Costo: {b.cost === 0 ? 'gratis' : money(b.cost)}
                  </span>
                  {b.badgeText && (
                    <span className="px-2 py-1 rounded-lg bg-indigo-950/50 text-indigo-300 border border-indigo-900/50">
                      {b.badgeText}
                    </span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
