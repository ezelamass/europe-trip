import type { SideQuest } from '../types';
import { TipCallout } from './ui';

/** El plan (horarios + links a Maps) y los hacks de una side quest. Vive acá
 *  porque tanto el modal de QuestsTab como la vista de itinerario por parada
 *  necesitan renderizar exactamente lo mismo. */
export default function QuestPlan({ quest }: { quest: SideQuest }) {
  return (
    <div className="space-y-5">
      <div>
        <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
          Plan
        </h4>
        <ol className="space-y-3">
          {quest.itinerary.map((it, i) => (
            <li key={i} className="flex gap-3">
              <span className="shrink-0 text-[11px] font-bold text-accent-300 bg-accent-400/10 border border-accent-400/25 rounded-lg px-2 py-1 h-fit tabular-nums">
                {it.day}
              </span>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-slate-100">{it.title}</p>
                <p className="text-xs text-slate-400 mt-0.5">{it.desc}</p>
                {it.mapsUrl && (
                  <a
                    href={it.mapsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-[11px] font-semibold text-accent-300 mt-1"
                  >
                    <i className="fa-solid fa-location-dot" />
                    Ver en Maps
                  </a>
                )}
              </div>
            </li>
          ))}
        </ol>
      </div>

      {quest.hacks.length > 0 && (
        <div>
          <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
            Hacks
          </h4>
          <ul className="space-y-2">
            {quest.hacks.map((h, i) => (
              <li key={i}>
                <TipCallout>{h}</TipCallout>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
