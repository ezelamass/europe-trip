import { useMemo } from 'react';
import { TRIPS, tripNights } from '../data/trips';
import { coverFor } from '../data/covers';
import { useStore } from '../store/useStore';
import { useStops } from '../store/useStops';
import { stopRange, formatRange } from '../lib/format';
import TripsTab from './TripsTab';
import type { RouteStop, Trip } from '../types';

/** Días calendario entre una fecha ISO y otra, contando por fecha y no por
 *  milisegundos, para que un cambio de hora no corra la cuenta. */
function daysBetween(isoFrom: string, to: Date): number {
  const [y, m, d] = isoFrom.split('-').map(Number);
  const from = Date.UTC(y, m - 1, d);
  const target = Date.UTC(to.getFullYear(), to.getMonth(), to.getDate());
  return Math.round((target - from) / 86_400_000);
}

/** Parada en curso y la siguiente. Las fechas son acumulativas, así que alcanza
 *  con recorrer las paradas sumando noches hasta pasar la de hoy. */
function locate(trip: Trip, stops: RouteStop[], today: Date) {
  let before = 0;
  for (let i = 0; i < stops.length; i++) {
    const { from, to } = stopRange(trip.startDate, before, stops[i].nights);
    if (from && to && from <= today && today < to) {
      return { current: stops[i], currentRange: formatRange(from, to, stops[i].nights), next: stops[i + 1] ?? null, before };
    }
    before += stops[i].nights;
  }
  return { current: null, currentRange: '', next: stops[0] ?? null, before: 0 };
}

function HeroActual({ trip, onOpen }: { trip: Trip; onOpen: (id: string) => void }) {
  const stops = useStops(trip.id);
  const setTab = useStore((s) => s.setTab);
  const today = useMemo(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  }, []);

  const total = tripNights(trip, stops);
  const { current, currentRange, next } = useMemo(() => locate(trip, stops, today), [trip, stops, today]);

  // Días entre dos medianoches locales. Dividir el delta en milisegundos se corre
  // un día cuando el viaje cruza un cambio de horario (la diferencia pasa a ser de
  // 23 o 25 horas), que es justo lo que hacen los viajes largos por Europa.
  const dia = trip.startDate ? daysBetween(trip.startDate, today) + 1 : 0;
  const pct = total ? Math.min(100, Math.max(0, (dia / total) * 100)) : 0;
  const cover = coverFor(trip.id);
  const faltan = trip.endDate ? Math.max(0, -daysBetween(trip.endDate, today)) : null;

  return (
    <div className="space-y-5">
      {/* Hero: la foto ocupa la pantalla y el texto va encima, como en la referencia */}
      <div className="relative -mx-4 -mt-6">
        <div className="relative h-[42vh] min-h-[260px] max-h-[380px] bg-slate-800">
          {cover && <img src={cover} alt={trip.title} className="absolute inset-0 h-full w-full object-cover" />}
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-slate-950/10" />
          <div className="absolute inset-x-0 bottom-0 p-5">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-accent-400 text-slate-950 text-[10px] font-extrabold uppercase tracking-wide px-2.5 py-1">
              <span className="h-1.5 w-1.5 rounded-full bg-slate-950 animate-pulse" />
              En curso
            </span>
            <h1 className="mt-2 text-3xl font-extrabold text-white tracking-tight leading-tight">
              {trip.title}
            </h1>
            <p className="text-sm text-slate-300 mt-1">{trip.dateLabel}</p>
          </div>
        </div>
      </div>

      {/* Progreso */}
      <div className="rounded-2xl bg-slate-900 border border-white/10 p-4">
        <div className="flex items-baseline justify-between">
          <span className="text-sm font-bold text-white">
            Día {dia} de {total}
          </span>
          {faltan !== null && (
            <span className="text-xs text-slate-400">
              {faltan === 0 ? 'último día' : `faltan ${faltan} días`}
            </span>
          )}
        </div>
        <div className="mt-2 h-2 rounded-full bg-slate-800 overflow-hidden">
          <div className="h-full rounded-full bg-accent-400 transition-all duration-700" style={{ width: `${pct}%` }} />
        </div>
      </div>

      {/* Dónde estás ahora */}
      {current && (
        <div className="rounded-2xl bg-slate-900 border border-white/10 overflow-hidden">
          <div className="p-4">
            <p className="text-[10px] font-bold uppercase tracking-wider text-accent-300">Estás en</p>
            <h2 className="text-xl font-bold text-white mt-1">{current.city}</h2>
            <p className="text-xs text-slate-400 mt-0.5">
              {currentRange} · {current.nights} noches
            </p>
            {current.hotelName && (
              <p className="text-sm text-slate-300 mt-3">
                <i className="fa-solid fa-hotel mr-2 text-slate-500" />
                {current.hotelName}
              </p>
            )}
          </div>
          {next && (
            <div className="border-t border-white/10 px-4 py-3 flex items-center gap-3">
              <i className="fa-solid fa-arrow-right-long text-slate-600" />
              <div className="min-w-0">
                <p className="text-[10px] uppercase tracking-wider text-slate-500 font-bold">Después</p>
                <p className="text-sm text-slate-200 truncate">{next.city}</p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Accesos del viaje: acá viven las herramientas que antes eran tabs globales */}
      <div>
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Este viaje</h3>
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => onOpen(trip.id)}
            className="rounded-2xl bg-slate-900 border border-white/10 p-4 text-left active:scale-[0.98] transition"
          >
            <i className="fa-solid fa-route text-accent-300 text-lg" />
            <p className="text-sm font-bold text-white mt-2">Itinerario</p>
            <p className="text-[11px] text-slate-400">
              {stops.length} {stops.length === 1 ? 'parada' : 'paradas'}
            </p>
          </button>
          {([
            ['luggage', 'fa-bag-shopping', 'Valija'],
            ['benefits', 'fa-passport', 'Beneficios'],
            ['hacks', 'fa-lightbulb', 'Hacks'],
            ['quests', 'fa-mountain-sun', 'Side quests'],
          ] as const).map(([tab, icon, label]) => (
            <button
              key={tab}
              onClick={() => setTab(tab)}
              className="rounded-2xl bg-slate-900 border border-white/10 p-4 text-left active:scale-[0.98] transition"
            >
              <i className={`fa-solid ${icon} text-accent-300 text-lg`} />
              <p className="text-sm font-bold text-white mt-2">{label}</p>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function HomeTab({ onOpen }: { onOpen: (id: string) => void }) {
  const enCurso = TRIPS.find((t) => t.status === 'en-curso');
  // Sin viaje en curso, la pantalla principal son los viajes pasados.
  return enCurso ? <HeroActual trip={enCurso} onOpen={onOpen} /> : <TripsTab onOpen={onOpen} />;
}

