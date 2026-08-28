import { useMemo, useState } from 'react';
import { useStore } from '../store/useStore';
import { Button, INPUT_CLS, SELECT_CLS } from '../components/ui';

const LOCATIONS = ['Mochila', 'Carry-on', 'Valija Grande'] as const;
const CATEGORIES = ['Documentos', 'Tecnología', 'Ropa/Calzado', 'Salud/Aseo', 'Otros'] as const;

const LOC_STYLE: Record<string, string> = {
  Mochila: 'bg-accent-400/10 text-accent-300 border-accent-400/25',
  'Carry-on': 'bg-amber-950/50 text-amber-300 border-amber-900/50',
  'Valija Grande': 'bg-emerald-950/50 text-emerald-300 border-emerald-900/50',
};

export default function LuggageTab() {
  const items = useStore((s) => s.luggageItems);
  const addItem = useStore((s) => s.addLuggageItem);
  const deleteItem = useStore((s) => s.deleteLuggageItem);
  const setLocation = useStore((s) => s.setLuggageLocation);

  const [name, setName] = useState('');
  const [category, setCategory] = useState<string>('Otros');
  const [location, setLoc] = useState<string>('Mochila');
  const [filter, setFilter] = useState<string>('todas');

  const byCategory = useMemo(() => {
    const out: Record<string, typeof items> = {};
    for (const i of items) {
      if (filter !== 'todas' && i.location !== filter) continue;
      (out[i.category] ??= []).push(i);
    }
    return out;
  }, [items, filter]);

  const counts = useMemo(() => {
    const out: Record<string, number> = {};
    for (const i of items) out[i.location] = (out[i.location] ?? 0) + 1;
    return out;
  }, [items]);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const n = name.trim();
    if (!n) return;
    addItem({ id: `lug-${Date.now()}`, name: n, category, location });
    setName('');
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-white">Valija</h2>
        <p className="text-sm text-slate-400 mt-1">{items.length} ítems repartidos en 3 bultos.</p>
      </div>

      <div className="grid grid-cols-3 gap-2">
        {LOCATIONS.map((l) => (
          <button
            key={l}
            onClick={() => setFilter(filter === l ? 'todas' : l)}
            className={`rounded-xl border px-3 py-2.5 text-left transition ${
              filter === l ? LOC_STYLE[l] : 'bg-slate-900 border-slate-800 text-slate-300'
            }`}
          >
            <div className="text-[10px] uppercase tracking-wide opacity-80 truncate">{l}</div>
            <div className="text-xl font-extrabold tabular-nums">{counts[l] ?? 0}</div>
          </button>
        ))}
      </div>

      <form onSubmit={submit} className="flex flex-wrap gap-2 bg-slate-900 border border-slate-800 rounded-xl p-3">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Agregar ítem…"
          className={`flex-1 min-w-[140px] ${INPUT_CLS}`}
        />
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className={SELECT_CLS}
        >
          {CATEGORIES.map((c) => (
            <option key={c}>{c}</option>
          ))}
        </select>
        <select
          value={location}
          onChange={(e) => setLoc(e.target.value)}
          className={SELECT_CLS}
        >
          {LOCATIONS.map((l) => (
            <option key={l}>{l}</option>
          ))}
        </select>
        <Button
          type="submit" className="!text-sm !px-4">
          <i className="fa-solid fa-plus" />
        </Button>
      </form>

      <div className="space-y-5">
        {CATEGORIES.filter((c) => byCategory[c]?.length).map((c) => (
          <div key={c}>
            <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
              {c} · {byCategory[c].length}
            </h3>
            <div className="space-y-1.5">
              {byCategory[c].map((i) => (
                <div
                  key={i.id}
                  className="flex items-center justify-between gap-2 bg-slate-900 border border-slate-800 rounded-xl px-3 py-2"
                >
                  <span className="text-sm text-slate-100 min-w-0 truncate">{i.name}</span>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <select
                      value={i.location}
                      onChange={(e) => setLocation(i.id, e.target.value)}
                      className={`text-[11px] font-semibold rounded-lg border px-2 py-1 ${LOC_STYLE[i.location] ?? 'bg-slate-800 border-slate-700 text-slate-300'}`}
                    >
                      {LOCATIONS.map((l) => (
                        <option key={l} className="bg-slate-900 text-slate-200">
                          {l}
                        </option>
                      ))}
                    </select>
                    <Button variant="danger" size="icon"
                      onClick={() => deleteItem(i.id)}
                      aria-label="Eliminar">
                      <i className="fa-solid fa-trash" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
