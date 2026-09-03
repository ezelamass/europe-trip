import { useState } from 'react';
import { useStore } from '../store/useStore';
import { useMoney } from '../lib/useMoney';
import QuestPlan from '../components/QuestPlan';
import type { RouteStop } from '../types';

/** Itinerario día por día de una parada puntual: se abre al tocar "Estás en"
 *  en el Inicio, con un tab por día en vez de tener que ir a Side quests y
 *  buscar cada uno a mano. Solo aparece si la parada tiene días curados
 *  (`itineraryQuestIds`) — hoy Berlín, Ámsterdam, Viena y Londres. */
export default function StopItinerary({ stop, onBack }: { stop: RouteStop; onBack: () => void }) {
  const allQuests = useStore((s) => s.sideQuests);
  const money = useMoney();
  const [active, setActive] = useState(0);

  const days = (stop.itineraryQuestIds ?? [])
    .map((id) => allQuests.find((q) => q.id === id))
    .filter((q): q is NonNullable<typeof q> => !!q);
  const quest = days[active];

  return (
    <div className="space-y-5">
      <button
        onClick={onBack}
        className="inline-flex items-center gap-2 text-sm font-semibold text-slate-400 active:scale-95 transition"
      >
        <i className="fa-solid fa-arrow-left" />
        Volver al viaje
      </button>

      <div>
        <h2 className="text-xl font-bold text-white">{stop.city}</h2>
        <p className="text-sm text-slate-400 mt-1">Itinerario día por día</p>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-1 -mx-4 px-4">
        {days.map((d, i) => (
          <button
            key={d.id}
            onClick={() => setActive(i)}
            className={`shrink-0 rounded-xl px-3 py-2 text-xs font-bold transition ${
              i === active
                ? 'bg-accent-400 text-slate-950'
                : 'bg-slate-900 border border-white/10 text-slate-300'
            }`}
          >
            Día {i + 1}
          </button>
        ))}
      </div>

      {quest && (
        <>
          <div>
            <h3 className="font-bold text-white leading-tight">{quest.title}</h3>
            <p className="text-[11px] text-slate-400 mt-1">
              {quest.dateLabel ? `${quest.dateLabel} · ` : ''}
              {money(quest.totalCost)}
            </p>
          </div>
          <QuestPlan quest={quest} />
        </>
      )}
    </div>
  );
}
