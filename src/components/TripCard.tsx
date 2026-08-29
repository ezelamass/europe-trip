import type { Trip } from '../types';
import { coverFor } from '../data/covers';
import { tripNights } from '../data/trips';
import { MES_CORTO } from '../lib/format';
import { useStops } from '../store/useStops';

/** "Mar. 09 Dic. 2025 - Mar. 16 Dic. 2025" es el formato de la referencia; acá se
 *  usa uno más corto porque las fechas de un viaje casi siempre comparten año. */
function rangeLabel(trip: Trip): string {
  if (!trip.startDate || !trip.endDate) return trip.dateLabel;
  const a = new Date(trip.startDate + 'T00:00:00');
  const b = new Date(trip.endDate + 'T00:00:00');
  const d = (x: Date) => `${String(x.getDate()).padStart(2, '0')} ${MES_CORTO[x.getMonth()]}`;
  return a.getFullYear() === b.getFullYear()
    ? `${d(a)} – ${d(b)} ${b.getFullYear()}`
    : `${d(a)} ${a.getFullYear()} – ${d(b)} ${b.getFullYear()}`;
}

function companionsLabel(trip: Trip): string {
  const c = trip.companions;
  if (!c.length) return 'Solo';
  if (c.length <= 2) return c.join(' y ');
  return `${c[0]}, ${c[1]} y ${c.length - 2} más`;
}

/** Días que faltan para que arranque un viaje planificado. Se cuenta por fecha y
 *  no por milisegundos, para que un cambio de horario no corra el número. */
function daysUntil(iso: string): number {
  const [y, m, d] = iso.split('-').map(Number);
  const hoy = new Date();
  return Math.round(
    (Date.UTC(y, m - 1, d) - Date.UTC(hoy.getFullYear(), hoy.getMonth(), hoy.getDate())) / 86_400_000,
  );
}

export default function TripCard({ trip, onOpen }: { trip: Trip; onOpen: (id: string) => void }) {
  const stops = useStops(trip.id);
  const cover = coverFor(trip.id);
  const nights = tripNights(trip, stops);
  const futuro = trip.status === 'planificado';
  const faltan = futuro && trip.startDate ? daysUntil(trip.startDate) : null;

  return (
    <article
      data-trip={trip.id}
      className="rounded-3xl overflow-hidden bg-slate-900 border border-white/10 shadow-lg shadow-black/30"
    >
      <button
        onClick={() => onOpen(trip.id)}
        className="block w-full text-left active:opacity-90 transition"
      >
        <div className="relative aspect-[16/9] bg-slate-800">
          {cover && (
            <img
              src={cover}
              alt={trip.title}
              loading="lazy"
              className="absolute inset-0 h-full w-full object-cover"
            />
          )}
          {trip.status === 'en-curso' && (
            <span className="absolute top-3 left-3 rounded-full bg-accent-400 text-slate-950 text-[10px] font-extrabold uppercase tracking-wide px-2.5 py-1">
              En curso
            </span>
          )}
          {futuro && (
            <span className="absolute top-3 left-3 rounded-full bg-white/95 text-slate-950 text-[10px] font-extrabold uppercase tracking-wide px-2.5 py-1">
              Planificado
            </span>
          )}
          <span className="absolute bottom-3 right-3 rounded-full bg-black/60 backdrop-blur text-white text-[11px] font-semibold px-2.5 py-1">
            {/* En un viaje que todavía no pasó, lo que importa es cuánto falta. */}
            {faltan !== null && faltan > 0
              ? `faltan ${faltan} días`
              : `${nights} ${nights === 1 ? 'noche' : 'noches'}`}
          </span>
        </div>

        <div className="p-4">
          <h3 className="text-lg font-bold text-white leading-tight">{trip.title}</h3>
          <p className="text-sm text-slate-400 mt-1">{rangeLabel(trip)}</p>
          <p className="text-sm text-slate-300 mt-2 flex items-center gap-2">
            <i className="fa-solid fa-user-group text-slate-500 text-xs" />
            <span className="truncate">{companionsLabel(trip)}</span>
          </p>
        </div>
      </button>

      {trip.photosAlbumUrl && (
        <a
          href={trip.photosAlbumUrl}
          target="_blank"
          rel="noreferrer"
          className="flex items-center justify-between gap-2 px-4 py-3 border-t border-white/10 text-accent-300 text-sm font-semibold active:bg-white/5 transition"
        >
          <span>
            <i className="fa-regular fa-images mr-2" />
            Ver el álbum de fotos
          </span>
          <i className="fa-solid fa-arrow-up-right-from-square text-xs opacity-70" />
        </a>
      )}
    </article>
  );
}
