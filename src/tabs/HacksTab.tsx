import { useMemo, useState } from 'react';
import { useStore } from '../store/useStore';
import { getCategoryIcon } from '../lib/format';
import { useMoney } from '../lib/useMoney';
import { Button, TipCallout, INPUT_CLS, SELECT_CLS } from '../components/ui';
import { withDynamicCosts } from '../lib/budget';

const CATEGORIES = ['Transporte', 'Tecnología', 'Salud', 'Hospedaje', 'Finanzas', 'Tip'];

export default function HacksTab() {
  const rawFacts = useStore((s) => s.customFacts);
  const benefits = useStore((s) => s.appliedBenefits);
  // El pase de Interrail sale la mitad con Verano Joven: si se congela, la tarjeta
  // dice €429 al lado de un texto que promete €214,50.
  const facts = useMemo(() => withDynamicCosts(rawFacts, benefits), [rawFacts, benefits]);
  const addFact = useStore((s) => s.addFact);
  const deleteFact = useStore((s) => s.deleteFact);
  const clearCustom = useStore((s) => s.clearCustomFacts);
  const money = useMoney();

  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ title: '', cost: '', saving: '', category: 'Tip', desc: '', tip: '' });

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
          <Button onClick={() => setOpen((v) => !v)}>
            <i className="fa-solid fa-plus mr-1.5" />
            Nuevo hack
          </Button>
          {facts.some((f) => !f.isPredefined) && (
            <Button variant="ghost" onClick={clearCustom}>
              Limpiar propios
            </Button>
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
              className={INPUT_CLS}
            />
            <select
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
              className={SELECT_CLS}
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
              className={INPUT_CLS}
            />
            <input
              type="number"
              value={form.saving}
              onChange={(e) => setForm({ ...form, saving: e.target.value })}
              placeholder="Ahorro (€)"
              className={INPUT_CLS}
            />
          </div>
          <textarea
            value={form.desc}
            onChange={(e) => setForm({ ...form, desc: e.target.value })}
            placeholder="Descripción"
            rows={2}
            className={`w-full ${INPUT_CLS}`}
          />
          <Button type="submit" className="!text-sm !px-4">
            Guardar
          </Button>
        </form>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        {facts.map((f) => {
          const { icon, chip } = getCategoryIcon(f.category);
          return (
          <div key={f.id} className="bg-slate-900 border border-slate-800 rounded-2xl p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-3 min-w-0">
                <span className={`shrink-0 w-9 h-9 rounded-lg grid place-items-center ${chip}`}>
                  <i className={`fa-solid ${icon}`} />
                </span>
                <div className="min-w-0">
                  <h3 className="font-bold text-white leading-tight">{f.title}</h3>
                  <span className="text-[11px] text-slate-500">{f.category}</span>
                </div>
              </div>
              {!f.isPredefined && (
                <Button
                  variant="danger"
                  size="icon"
                  onClick={() => deleteFact(f.id)}
                  aria-label="Eliminar"
                  className="shrink-0"
                >
                  <i className="fa-solid fa-trash" />
                </Button>
              )}
            </div>
            {f.desc &&
              // Los predefinidos traen markup a propósito (<em>, <strong>) y son
              // contenido del repo. Lo que escribe el usuario va como texto plano.
              (f.isPredefined ? (
                <p
                  className="text-sm text-slate-300 mt-3"
                  dangerouslySetInnerHTML={{ __html: f.desc }}
                />
              ) : (
                <p className="text-sm text-slate-300 mt-3">{f.desc}</p>
              ))}
            {f.tip && (
              <div className="mt-3">
                <TipCallout>{f.tip}</TipCallout>
              </div>
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
          );
        })}
      </div>
    </div>
  );
}
