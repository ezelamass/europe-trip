import { lazy, Suspense, useMemo, useState } from 'react';
import type { Trip, RouteStop } from '../types';
import { useStore } from '../store/useStore';
import { fmtMoney, getCostBadgeColor, stopDates } from '../lib/format';
import StatTile from '../components/StatTile';
import Modal from '../components/Modal';
// Leaflet pesa y la vista de mapa es opcional: se carga al pedirla.
const RouteMap = lazy(() => import('../components/RouteMap'));

type Phase = 'pasado' | 'actual' | 'futuro';

/** Las fechas son acumulativas, así que los tramos ya vividos son siempre un
 *  prefijo contiguo: alcanza con comparar el rango de cada parada contra hoy. */
function phaseOf(startDate: string, nightsBefore: number, nights: number): Phase {
  if (!startDate) return 'futuro';
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const from = new Date(startDate + 'T00:00:00');
  from.setDate(from.getDate() + nightsBefore);
  const to = new Date(from);
  to.setDate(to.getDate() + nights);
  if (to <= today) return 'pasado';
  if (from <= today) return 'actual';
  return 'futuro';
}

function StopCard({
  stop,
  trip,
  index,
  nightsBefore,
  onOpenLodging,
}: {
  stop: RouteStop;
  trip: Trip;
  index: number;
  nightsBefore: number;
  onOpenLodging: (s: RouteStop) => void;
}) {
  const { displayCurrency, usdToEurRate } = useStore();
  const updateStop = useStore((s) => s.updateStop);
  const moveStop = useStore((s) => s.moveStop);
  const removeStop = useStore((s) => s.removeStop);
  const editable = trip.hasPlannerTools;

  const phase = phaseOf(trip.startDate, nightsBefore, stop.nights);
  const dates = stopDates(trip.startDate, nightsBefore, stop.nights);
  const money = (v: number) => fmtMoney(v, displayCurrency, usdToEurRate);

  return (
    <div
      className={`relative rounded-2xl border p-4 sm:p-5 transition ${
        phase === 'actual'
          ? 'bg-indigo-950/30 border-indigo-700/60 shadow-lg shadow-indigo-950/40'
          : phase === 'pasado'
            ? 'bg-slate-900/50 border-slate-800 opacity-70'
            : 'bg-slate-900 border-slate-800'
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3 min-w-0">
          <div
            className={`shrink-0 w-8 h-8 rounded-lg grid place-items-center text-sm font-bold ${
              phase === 'actual' ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-300'
            }`}
          >
            {index + 1}
          </div>
          <div className="min-w-0">
            <h3 className="font-bold text-white leading-tight">{stop.city}</h3>
            <div className="flex flex-wrap items-center gap-x-2 gap-y-1 mt-1 text-[11px]">
              {dates && <span className="text-slate-400">{dates}</span>}
              <span className="text-slate-500">·</span>
              <span className="text-slate-300 font-semibold">{stop.nights} noches</span>
              {phase === 'actual' && (
                <span className="bg-emerald-950/60 text-emerald-300 border border-emerald-900/50 rounded-full px-2 py-0.5 font-bold">
                  Estás acá
                </span>
              )}
              {stop.isConfirmed && (
                <span className="text-emerald-400" title="Confirmado">
                  <i className="fa-solid fa-circle-check" />
                </span>
              )}
            </div>
          </div>
        </div>

        {editable && (
          <div className="flex items-center gap-1 shrink-0">
            <button
              onClick={() => moveStop(trip.id, stop.id, -1)}
              aria-label="Subir parada"
              className="w-7 h-7 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 text-xs transition"
            >
              <i className="fa-solid fa-chevron-up" />
            </button>
            <button
              onClick={() => moveStop(trip.id, stop.id, 1)}
              aria-label="Bajar parada"
              className="w-7 h-7 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 text-xs transition"
            >
              <i className="fa-solid fa-chevron-down" />
            </button>
            <button
              onClick={() => removeStop(trip.id, stop.id)}
              aria-label="Eliminar parada"
              className="w-7 h-7 rounded-lg bg-rose-950/50 hover:bg-rose-900/50 text-rose-400 text-xs transition"
            >
              <i className="fa-solid fa-trash" />
            </button>
          </div>
        )}
      </div>

      {stop.transport && (
        <p className="mt-3 text-xs text-slate-300 bg-slate-950/50 border border-slate-800 rounded-lg px-3 py-2">
          <i className="fa-solid fa-arrow-right-long mr-2 text-slate-500" />
          {stop.transport}
        </p>
      )}

      <div className="mt-3 flex flex-wrap items-center gap-2 text-[11px]">
        <span className={`px-2 py-1 rounded-lg border font-semibold ${getCostBadgeColor(stop.costLvl)}`}>
          {stop.costLvl}
        </span>
        <span className="px-2 py-1 rounded-lg bg-slate-800 border border-slate-700 text-slate-300">
          {stop.category}
        </span>
        {stop.dailyBudget > 0 && (
          <span className="px-2 py-1 rounded-lg bg-slate-800 border border-slate-700 text-slate-300">
            {money(stop.dailyBudget)}/día
          </span>
        )}
        {stop.cost > 0 && (
          <span className="px-2 py-1 rounded-lg bg-slate-800 border border-slate-700 text-slate-300">
            Transporte {money(stop.cost)}
          </span>
        )}
      </div>

      {editable && (
        <div className="mt-3 flex items-center gap-2">
          <span className="text-[11px] text-slate-500 font-semibold uppercase tracking-wide">
            Noches
          </span>
          <button
            onClick={() => updateStop(trip.id, stop.id, { nights: Math.max(0, stop.nights - 1) })}
            className="w-7 h-7 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs transition"
          >
            <i className="fa-solid fa-minus" />
          </button>
          <span className="tabular-nums font-bold text-slate-100 w-6 text-center">{stop.nights}</span>
          <button
            onClick={() => updateStop(trip.id, stop.id, { nights: stop.nights + 1 })}
            className="w-7 h-7 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs transition"
          >
            <i className="fa-solid fa-plus" />
          </button>
        </div>
      )}

      {stop.hack && (
        <p className="mt-3 text-xs text-amber-200/90 bg-amber-950/25 border border-amber-900/40 rounded-lg px-3 py-2">
          <i className="fa-solid fa-lightbulb mr-2 text-amber-400" />
          {stop.hack}
        </p>
      )}

      <div className="mt-3 flex flex-wrap gap-2">
        {(stop.hotelName || stop.address || stop.confirmationNumber) && (
          <button
            onClick={() => onOpenLodging(stop)}
            className="text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg px-3 py-1.5 transition"
          >
            <i className="fa-solid fa-hotel mr-1.5" />
            Alojamiento
          </button>
        )}
        {stop.photosAlbumUrl && (
          <a
            href={stop.photosAlbumUrl}
            target="_blank"
            rel="noreferrer"
            className="text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg px-3 py-1.5 transition"
          >
            <i className="fa-regular fa-images mr-1.5" />
            Fotos
          </a>
        )}
      </div>
    </div>
  );
}

export default function ItineraryTab({ trip }: { trip: Trip }) {
  const stops = useStore((s) => s.tripStops[trip.id] ?? []);
  const { displayCurrency, usdToEurRate, includeBaseFlight, baseFlightUSD } = useStore();
  const setCurrency = useStore((s) => s.setCurrency);
  const toggleBaseFlight = useStore((s) => s.toggleBaseFlight);
  const resetStops = useStore((s) => s.resetStops);

  const [view, setView] = useState<'lista' | 'mapa'>('lista');
  const [lodging, setLodging] = useState<RouteStop | null>(null);

  const money = (v: number) => fmtMoney(v, displayCurrency, usdToEurRate);

  const totals = useMemo(() => {
    const nights = stops.reduce((a, s) => a + s.nights, 0);
    const lodgingTotal = stops.reduce((a, s) => a + (s.accommodationCost ?? 0), 0);
    const transport = stops.reduce((a, s) => a + (s.cost ?? 0), 0);
    const daily = stops.reduce((a, s) => a + s.nights * (s.dailyBudget ?? 0), 0);
    // El vuelo internacional es un dato de Europa 2026, no de todos los viajes:
    // sin este chequeo, los viajes históricos mostraban un presupuesto que no existe.
    // Se guarda en USD; el resto de los montos, en EUR.
    const flightEur =
      trip.hasPlannerTools && includeBaseFlight ? baseFlightUSD * usdToEurRate : 0;
    return { nights, lodgingTotal, transport, daily, total: lodgingTotal + transport + daily + flightEur };
  }, [stops, trip.hasPlannerTools, includeBaseFlight, baseFlightUSD, usdToEurRate]);

  // Noches acumuladas antes de cada parada, para calcular sus fechas.
  const nightsBefore = useMemo(() => {
    let acc = 0;
    return stops.map((s) => {
      const before = acc;
      acc += s.nights;
      return before;
    });
  }, [stops]);

  const hasBudget = totals.total > 0;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-white">
            {trip.emoji} {trip.title}
          </h2>
          <p className="text-sm text-slate-400 mt-1">
            {trip.dateLabel} · {totals.nights} noches · {stops.length} paradas
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex rounded-lg overflow-hidden border border-slate-700">
            {(['lista', 'mapa'] as const).map((v) => (
              <button
                key={v}
                onClick={() => setView(v)}
                className={`px-3 py-1.5 text-xs font-bold transition ${
                  view === v ? 'bg-indigo-600 text-white' : 'bg-slate-900 text-slate-400'
                }`}
              >
                <i className={`fa-solid ${v === 'lista' ? 'fa-list' : 'fa-map'} mr-1.5`} />
                {v === 'lista' ? 'Lista' : 'Mapa'}
              </button>
            ))}
          </div>
          <button
            onClick={() => setCurrency(displayCurrency === 'USD' ? 'EUR' : 'USD')}
            className="px-3 py-1.5 text-xs font-bold bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg border border-slate-700 transition"
            title="Cambiar moneda de visualización"
          >
            {displayCurrency === 'USD' ? '$ USD' : '€ EUR'}
          </button>
        </div>
      </div>

      {hasBudget ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <StatTile label="Total estimado" value={money(totals.total)} icon="fa-wallet" tone="indigo" />
          <StatTile label="Alojamiento" value={money(totals.lodgingTotal)} icon="fa-hotel" />
          <StatTile label="Transporte" value={money(totals.transport)} icon="fa-train" />
          <StatTile label="Gasto diario" value={money(totals.daily)} icon="fa-utensils" />
        </div>
      ) : (
        <div className="text-sm text-slate-400 bg-slate-900 border border-slate-800 rounded-xl px-4 py-3">
          <i className="fa-solid fa-circle-info mr-2 text-slate-500" />
          Este viaje no tiene costos cargados. Los datos que faltan quedaron anotados como
          pendientes en la nota de la vault, no completados a ojo.
        </div>
      )}

      {trip.hasPlannerTools && (
        <div className="flex flex-wrap items-center gap-3">
          <label className="flex items-center gap-2 text-xs text-slate-300 bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 cursor-pointer">
            <input
              type="checkbox"
              checked={includeBaseFlight}
              onChange={toggleBaseFlight}
              className="accent-indigo-500"
            />
            Incluir vuelo internacional (${baseFlightUSD} USD)
          </label>
          <button
            onClick={() => resetStops(trip.id)}
            className="text-xs font-semibold text-slate-400 hover:text-slate-200 underline underline-offset-2"
          >
            Restaurar itinerario original
          </button>
        </div>
      )}

      {view === 'mapa' ? (
        <Suspense
          fallback={
            <div className="h-[60vh] min-h-[320px] rounded-2xl border border-slate-800 bg-slate-950 grid place-items-center text-sm text-slate-400">
              <span>
                <i className="fa-solid fa-circle-notch fa-spin mr-2" />
                Cargando el mapa…
              </span>
            </div>
          }
        >
          <RouteMap stops={stops} />
        </Suspense>
      ) : stops.length === 0 ? (
        <p className="text-sm text-slate-400">Este viaje todavía no tiene paradas cargadas.</p>
      ) : (
        <div className="space-y-3">
          {stops.map((s, i) => (
            <StopCard
              key={s.id}
              stop={s}
              trip={trip}
              index={i}
              nightsBefore={nightsBefore[i]}
              onOpenLodging={setLodging}
            />
          ))}
        </div>
      )}

      <Modal
        open={!!lodging}
        onClose={() => setLodging(null)}
        title={lodging?.hotelName || 'Alojamiento'}
        subtitle={lodging?.city}
      >
        {lodging && (
          <dl className="space-y-3 text-sm">
            {[
              ['Dirección', lodging.address],
              ['Confirmación', lodging.confirmationNumber ?? lodging.lodgingConfirmation],
              ['Anfitrión', lodging.lodgingHost],
              ['Check-in', lodging.lodgingCheckIn],
              ['Check-out', lodging.lodgingCheckOut],
              ['Cómo entrar', lodging.lodgingCheckInMethod],
              ['Contacto', lodging.lodgingContact],
              ['Nota de costo', lodging.lodgingCostNote],
              ['Vuelo / traslado', lodging.flightDetails],
            ]
              .filter(([, v]) => v)
              .map(([k, v]) => (
                <div key={k as string} className="border-b border-slate-800 pb-2 last:border-0">
                  <dt className="text-[11px] uppercase tracking-wide text-slate-500 font-semibold">
                    {k}
                  </dt>
                  <dd className="text-slate-200 mt-0.5 whitespace-pre-wrap">{v}</dd>
                </div>
              ))}
            {lodging.accommodationCost ? (
              <div className="pt-1">
                <dt className="text-[11px] uppercase tracking-wide text-slate-500 font-semibold">
                  Costo
                </dt>
                <dd className="text-lg font-bold text-emerald-300">
                  {money(lodging.accommodationCost)}
                </dd>
              </div>
            ) : null}
          </dl>
        )}
      </Modal>
    </div>
  );
}
