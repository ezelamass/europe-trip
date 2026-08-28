import { useState } from 'react';
import { COVER_CREDITS } from '../data/covers';
import { TRIPS_BY_ID } from '../data/trips';

/** Varias portadas son CC BY / CC BY-SA, que exigen atribuir autor y licencia.
 *  No es decorativo: es la condición para poder usarlas. */
export default function PhotoCredits() {
  const [open, setOpen] = useState(false);
  const entries = Object.entries(COVER_CREDITS);

  return (
    <div className="rounded-2xl bg-slate-900 border border-white/10 overflow-hidden">
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between gap-3 p-4 text-left"
      >
        <span>
          <span className="block text-sm font-bold text-slate-200">Créditos de las fotos</span>
          <span className="block text-xs text-slate-500 mt-0.5">
            {entries.length} portadas de Wikimedia Commons
          </span>
        </span>
        <i className={`fa-solid fa-chevron-down text-slate-500 text-xs transition ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <ul className="border-t border-white/10 divide-y divide-white/5">
          {entries.map(([tripId, c]) => (
            <li key={tripId} className="px-4 py-3">
              <p className="text-xs font-semibold text-slate-300">
                {TRIPS_BY_ID[tripId]?.title ?? tripId}
              </p>
              <p className="text-[11px] text-slate-500 mt-0.5">
                {c.author} · {c.license}
              </p>
              <a
                href={c.source}
                target="_blank"
                rel="noreferrer"
                className="text-[11px] text-accent-300 break-all"
              >
                {c.title}
              </a>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
