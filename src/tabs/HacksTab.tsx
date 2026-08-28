import { useMemo, useState } from 'react';
import { useStore } from '../store/useStore';
import { fmtMoney, getCategoryIcon } from '../lib/format';
import { withDynamicCosts } from '../lib/budget';

const CATEGORIES = ['Transporte', 'Tecnología', 'Salud', 'Hospedaje', 'Finanzas', 'Tip'];

export default function HacksTab() {
  const rawFacts = useStore((s) => s.customFacts);
  const veranoJoven = useStore((s) => !!s.appliedBenefits.veranoJoven);
  // El pase de Interrail sale la mitad con Verano Joven: si se congela, la tarjeta
  // dice €429 al lado de un texto que promete €214,50.
  const facts = useMemo(() => withDynamicCosts(rawFacts, veranoJoven), [rawFacts, veranoJoven]);
  const addFact = useStore((s) => s.addFact);
  const deleteFact = useStore((s) => s.deleteFact);
  const clearCustom = useStore((s) => s.clearCustomFacts);
  const displayCurrency = useStore((s) => s.displayCurrency);
  const usdToEurRate = useStore((s) => s.usdToEurRate);

  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ title: '', cost: '', saving: '', category: 'Tip', desc: '', tip: '' });

  const money = (v: number) => fmtMoney(v, displayCurrency, usdToEurRate);
  const totalSaving = facts.reduce((a, f) => a + (f.saving || 0), 0);
  const totalCost = facts.reduce((a, f) => a + (f.cost || 0), 0);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim()) return;
    addFact({
      id: `fact-${Date.now()}`,
      title: form.title.trim(),
      cost: Number(form.cost) || 0,
      saving: Number(form.saving) || 0,
      category: form.category,
      desc: form.desc.trim(),
      tip: form.tip.trim(),
    });
    setForm({ title: '', cost: '', saving: '', category: 'Tip', desc: '', tip: '' });
    setOpen(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-white">Hacks del viaje</h2>
          <p className="text-sm text-slate-400 mt-1">
            {facts.length} hacks · ahorro estimado {money(totalSaving)} con {money(totalCost)} de
            inversión.
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setOpen((v) => !v)}
            className="text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg px-3 py-2 transition active:scale-95"
          >
            <i className="fa-solid fa-plus mr-1.5" />
            Nuevo hack
          </button>
          {facts.some((f) => !f.isPredefined) && (
            <button
              onClick={clearCustom}
              className="text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg px-3 py-2 transition"
            >
              Limpiar propios
            </button>
          )}
        </div>
      </div>

      {open && (
        <form onSubmit={submit} className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <input
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="Título del hack"
              className="bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <select
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
              className="bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200"
            >
              {CATEGORIES.map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>
            <input
              type="number"
              value={form.cost}
              onChange={(e) => setForm({ ...form, cost: e.target.value })}
              placeholder="Costo (€)"
              className="bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100 placeholder-slate-500"
            />
            <input
              type="number"
              value={form.saving}
              onChange={(e) => setForm({ ...form, saving: e.target.value })}
              placeholder="Ahorro (€)"
              className="bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100 placeholder-slate-500"
            />
          </div>
          <textarea
            value={form.desc}
            onChange={(e) => setForm({ ...form, desc: e.target.value })}
            placeholder="Descripción"
            rows={2}
            className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100 placeholder-slate-500"
          />
          <button
            type="submit"
            className="bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-bold rounded-lg px-4 py-2 transition"
          >
            Guardar
          </button>
        </form>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        {facts.map((f) => (
          <div key={f.id} className="bg-slate-900 border border-slate-800 rounded-2xl p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-3 min-w-0">
                <span
                  className={`shrink-0 w-9 h-9 rounded-lg grid place-items-center ${getCategoryIcon(f.category)}`}
                >
                  <i className={`fa-solid ${getCategoryIcon(f.category).split(' ')[0]}`} />
                </span>
                <div className="min-w-0">
                  <h3 className="font-bold text-white leading-tight">{f.title}</h3>
                  <span className="text-[11px] text-slate-500">{f.category}</span>
                </div>
              </div>
              {!f.isPredefined && (
                <button
                  onClick={() => deleteFact(f.id)}
                  aria-label="Eliminar"
                  className="shrink-0 w-7 h-7 rounded-lg bg-slate-800 hover:bg-rose-950/60 text-slate-500 hover:text-rose-400 text-xs transition"
                >
                  <i className="fa-solid fa-trash" />
                </button>
              )}
            </div>
            {f.desc && <p className="text-sm text-slate-300 mt-3">{f.desc}</p>}
            {f.tip && (
              <p className="text-xs text-amber-200/90 bg-amber-950/25 border border-amber-900/40 rounded-lg px-3 py-2 mt-3">
                <i className="fa-solid fa-lightbulb mr-2 text-amber-400" />
                {f.tip}
              </p>
            )}
            <div className="flex flex-wrap gap-2 mt-3 text-[11px]">
              {f.saving > 0 && (
                <span className="px-2 py-1 rounded-lg bg-emerald-950/50 text-emerald-300 border border-emerald-900/50 font-semibold">
                  Ahorra {money(f.saving)}
                </span>
              )}
              {f.cost > 0 && (
                <span className="px-2 py-1 rounded-lg bg-slate-800 text-slate-300 border border-slate-700">
                  Cuesta {money(f.cost)}
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
