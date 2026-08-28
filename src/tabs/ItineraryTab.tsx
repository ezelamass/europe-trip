import { lazy, Suspense, useMemo, useState } from 'react';
import type { Trip, RouteStop } from '../types';
import { useStore } from '../store/useStore';
import { formatRange, getCostBadgeColor, stopRange } from '../lib/format';
import { useMoney } from '../lib/useMoney';
import { computeBudget, withDynamicCosts } from '../lib/budget';
import { tripNights } from '../data/trips';
import StatTile from '../components/StatTile';
import Modal from '../components/Modal';
import { Button, TipCallout, GHOST_LINK_CLS } from '../components/ui';
// Leaflet pesa y la vista de mapa es opcional: se carga al pedirla.
const RouteMap = lazy(() => import('../components/RouteMap'));

/** Identidad estable: devolver `[]` inline hace que el snapshot de zustand v5
 *  nunca sea `Object.is`-igual y React re-renderice en loop. */
const NO_STOPS: RouteStop[] = [];

type Phase = 'pasado' | 'actual' | 'futuro';

/** Las fechas son acumulativas, así que los tramos ya vividos son siempre un
 *  prefijo contiguo: alcanza con comparar el rango de cada parada contra hoy. */
function phaseOf(from: Date | null, to: Date | null, today: Date): Phase {
  if (!from || !to) return 'futuro';
  if (to <= today) return 'pasado';
  if (from <= today) return 'actual';
  return 'futuro';
}

/** Medianoche de hoy. Se calcula una vez por render del itinerario en vez de tres
 *  `Date` por tarjeta (57 objetos para las 19 paradas de Europa 2026). */
function startOfToday(): Date {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}

function StopCard({
  stop,
  trip,
  index,
  nightsBefore,
  today,
  onOpenLodging,
}: {
  stop: RouteStop;
  trip: Trip;
  index: number;
  nightsBefore: number;
  today: Date;
  onOpenLodging: (s: RouteStop) => void;
}) {
  const money = useMoney();
  // Las acciones nunca cambian de identidad: suscribirse a ellas eran 57 selectores
  // (3 × 19 paradas) que solo devolvían una constante.
  const { updateStop, moveStop, removeStop } = useStore.getState();
  // Un viaje terminado se lee, no se edita. Antes esto colgaba de `hasPlannerTools`,
  // que significa otra cosa (qué herramientas de planificación tiene el viaje).
  const editable = trip.status !== 'completado';

  const { from, to } = stopRange(trip.startDate, nightsBefore, stop.nights);
  const phase = phaseOf(from, to, today);
  const dates = formatRange(from, to, stop.nights);

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
            <Button variant="ghost" size="icon"
              onClick={() => moveStop(trip.id, stop.id, -1)}
              aria-label="Subir parada">
              <i className="fa-solid fa-chevron-up" />
            </Button>
            <Button variant="ghost" size="icon"
              onClick={() => moveStop(trip.id, stop.id, 1)}
              aria-label="Bajar parada">
              <i className="fa-solid fa-chevron-down" />
            </Button>
            <Button variant="danger" size="icon"
              onClick={() => removeStop(trip.id, stop.id)}
              aria-label="Eliminar parada">
              <i className="fa-solid fa-trash" />
            </Button>
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
          <Button variant="ghost" size="icon"
            onClick={() => updateStop(trip.id, stop.id, { nights: Math.max(0, stop.nights - 1) })}>
            <i className="fa-solid fa-minus" />
          </Button>
          <span className="tabular-nums font-bold text-slate-100 w-6 text-center">{stop.nights}</span>
          <Button variant="ghost" size="icon"
            onClick={() => updateStop(trip.id, stop.id, { nights: stop.nights + 1 })}>
            <i className="fa-solid fa-plus" />
          </Button>
        </div>
      )}

      {stop.hack && (
        <div className="mt-3"><TipCallout>{stop.hack}</TipCallout></div>
      )}

      <div className="mt-3 flex flex-wrap gap-2">
        {(stop.hotelName || stop.address || stop.confirmationNumber) && (
          <Button variant="ghost" size="sm"
            onClick={() => onOpenLodging(stop)}>
            <i className="fa-solid fa-hotel mr-1.5" />
            Alojamiento
          </Button>
        )}
        {stop.photosAlbumUrl && (
          <a
            href={stop.photosAlbumUrl}
            target="_blank"
            rel="noreferrer"
            className={GHOST_LINK_CLS}
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
  const stops = useStore((s) => s.tripStops[trip.id]) ?? NO_STOPS;
  const money = useMoney();
  const displayCurrency = useStore((s) => s.displayCurrency);
  const includeBaseFlight = useStore((s) => s.includeBaseFlight);
  const baseFlightUSD = useStore((s) => s.baseFlightUSD);
  const facts = useStore((s) => s.customFacts);
  const quests = useStore((s) => s.sideQuests);
  const reservations = useStore((s) => s.highSpeedReservations);
  const momPaysHerTrip = useStore((s) => s.mamaPaysMomTrip);
  const benefits = useStore((s) => s.appliedBenefits);
  const setCurrency = useStore((s) => s.setCurrency);
  const toggleBaseFlight = useStore((s) => s.toggleBaseFlight);
  const toggleMomInvitation = useStore((s) => s.toggleMomInvitation);
  const resetStops = useStore((s) => s.resetStops);

  const usdToEurRate = useStore((s) => s.usdToEurRate);

  const [view, setView] = useState<'lista' | 'mapa'>('lista');
  const [lodging, setLodging] = useState<RouteStop | null>(null);


  const totals = useMemo(() => {
    // Los hacks, las reservas de tren y las side quests son parte del presupuesto de
    // Europa 2026 (así lo calculaba la app anterior), pero no de un viaje histórico.
    const planner = !!trip.hasPlannerTools;
    return computeBudget({
      stops,
      facts: planner ? withDynamicCosts(facts, benefits) : [],
      quests: planner ? quests : [],
      reservations: planner ? reservations : 0,
      momPaysHerTrip,
      includeBaseFlight: planner && includeBaseFlight,
      baseFlightUSD,
      usdToEurRate,
    });
  }, [
    stops, trip.hasPlannerTools, facts, benefits, quests, reservations,
    momPaysHerTrip, includeBaseFlight, baseFlightUSD, usdToEurRate,
  ]);

  // Noches acumuladas antes de cada parada, para calcular sus fechas.
  const nightsBefore = useMemo(() => {
    let acc = 0;
    return stops.map((s) => {
      const before = acc;
      acc += s.nights;
      return before;
    });
  }, [stops]);

  const today = useMemo(startOfToday, []);
  const hasBudget = totals.total > 0;
  const extras = (
    [
      ['Hacks', totals.facts],
      ['Reservas de tren', totals.reservations],
      ['Side quests', totals.quests],
      ['Vuelo internacional', totals.flight],
    ] as const
  ).filter(([, v]) => v > 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-white">
            {trip.emoji} {trip.title}
          </h2>
          <p className="text-sm text-slate-400 mt-1">
            {trip.dateLabel} · {tripNights(trip, stops)} noches · {stops.length} paradas
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
        <>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <StatTile label="Total estimado" value={money(totals.total)} icon="fa-wallet" tone="indigo" />
            <StatTile label="Alojamiento" value={money(totals.lodging)} icon="fa-hotel" />
            <StatTile label="Transporte" value={money(totals.transport)} icon="fa-train" />
            <StatTile label="Gasto diario" value={money(totals.daily)} icon="fa-utensils" />
          </div>

          {/* Lo que el total incluye además del itinerario, para que no haya dos
              números en pantalla que no cierren entre sí. */}
          {extras.length > 0 && (
            <div className="flex flex-wrap gap-2 text-[11px]">
              {extras.map(([label, value]) => (
                <span
                  key={label}
                  className="px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-300"
                >
                  {label} {money(value)}
                </span>
              ))}
              {totals.saved > 0 && (
                <span className="px-2.5 py-1.5 rounded-lg bg-emerald-950/50 border border-emerald-900/50 text-emerald-300 font-semibold">
                  Ahorro {money(totals.saved)}
                </span>
              )}
            </div>
          )}
        </>
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
          <label className="flex items-center gap-2 text-xs text-slate-300 bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 cursor-pointer">
            <input
              type="checkbox"
              checked={momPaysHerTrip}
              onChange={toggleMomInvitation}
              className="accent-indigo-500"
            />
            Mamá paga su tramo
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
              today={today}
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
