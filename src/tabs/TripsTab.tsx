import { TRIPS } from '../data/trips';
import { useStore } from '../store/useStore';
import { flagEmoji } from '../lib/format';
import { COUNTRIES } from '../data/worldMap';
import StatTile from '../components/StatTile';
import BackupPanel from '../components/BackupPanel';
import type { Trip } from '../types';

const STATUS_STYLES: Record<Trip['status'], string> = {
  'en-curso': 'bg-emerald-950/50 text-emerald-300 border-emerald-900/50',
  completado: 'bg-slate-800 text-slate-300 border-slate-700',
  planificado: 'bg-blue-950/50 text-blue-300 border-blue-900/50',
};

const STATUS_LABEL: Record<Trip['status'], string> = {
  'en-curso': 'En curso',
  completado: 'Completado',
  planificado: 'Planificado',
};

/** La nota de la vault marcada con confianza baja/media tiene datos incompletos.
 *  Se muestra para que no se lea como dato firme lo que es una reconstrucción. */
const CONFIDENCE_NOTE: Record<Trip['confidence'], string | null> = {
  alta: null,
  media: 'Datos parciales',
  baja: 'Muy poca data',
};

function TripCard({ trip }: { trip: Trip }) {
  const setActiveTrip = useStore((s) => s.setActiveTrip);
  const setTab = useStore((s) => s.setTab);
  const isActive = useStore((s) => s.activeTripId) === trip.id;

  const open = () => {
    setActiveTrip(trip.id);
    setTab('itinerary');
  };

  return (
    <div
      className={`rounded-2xl border p-5 flex flex-col gap-3 transition ${
        isActive
          ? 'bg-indigo-950/30 border-indigo-800/60 shadow-lg shadow-indigo-950/30'
          : 'bg-slate-900 border-slate-800 hover:border-slate-700'
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="font-bold text-white text-lg leading-tight">
            <span className="mr-1.5">{trip.emoji}</span>
            {trip.title}
          </h3>
          <p className="text-xs text-slate-400 mt-1">{trip.dateLabel}</p>
        </div>
        <span
          className={`shrink-0 text-[10px] font-bold px-2 py-1 rounded-full border ${STATUS_STYLES[trip.status]}`}
        >
          {STATUS_LABEL[trip.status]}
        </span>
      </div>

      <p className="text-sm text-slate-300 leading-relaxed">{trip.summary}</p>

      <div className="flex flex-wrap gap-1.5">
        {trip.countries.map((iso) => (
          <span
            key={iso}
            className="text-xs bg-slate-800 border border-slate-700 rounded-lg px-2 py-1 text-slate-200"
          >
            {flagEmoji(iso)} {COUNTRIES[iso]?.n ?? iso}
          </span>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-2 text-xs">
        <div className="bg-slate-950/60 rounded-lg px-3 py-2 border border-slate-800">
          <div className="text-slate-500 text-[10px] uppercase tracking-wide">Noches</div>
          <div className="font-bold text-slate-100 tabular-nums">{trip.nights}</div>
        </div>
        <div className="bg-slate-950/60 rounded-lg px-3 py-2 border border-slate-800">
          <div className="text-slate-500 text-[10px] uppercase tracking-wide">Compañía</div>
          <div className="font-semibold text-slate-100 truncate" title={trip.companions.join(', ')}>
            {trip.companions.length === 1 ? trip.companions[0] : `${trip.companions.length} personas`}
          </div>
        </div>
      </div>

      {CONFIDENCE_NOTE[trip.confidence] && (
        <div className="text-[11px] text-amber-300/90 bg-amber-950/30 border border-amber-900/40 rounded-lg px-2.5 py-1.5">
          <i className="fa-solid fa-triangle-exclamation mr-1.5" />
          {CONFIDENCE_NOTE[trip.confidence]} — ver la nota en el segundo cerebro.
        </div>
      )}

      <div className="flex flex-wrap items-center gap-2 mt-auto pt-1">
        <button
          onClick={open}
          className="text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg px-3 py-2 transition active:scale-95"
        >
          <i className="fa-solid fa-route mr-1.5" />
          Ver itinerario
        </button>
        {trip.photosAlbumUrl && (
          <a
            href={trip.photosAlbumUrl}
            target="_blank"
            rel="noreferrer"
            className="text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg px-3 py-2 transition"
          >
            <i className="fa-regular fa-images mr-1.5" />
            Fotos
          </a>
        )}
        {trip.lodgingLinks?.map((l) => (
          <a
            key={l.url}
            href={l.url}
            target="_blank"
            rel="noreferrer"
            className="text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg px-3 py-2 transition"
            title={`Alojamiento en ${l.label}`}
          >
            <i className="fa-solid fa-location-dot mr-1.5" />
            {l.label}
          </a>
        ))}
      </div>
    </div>
  );
}

export default function TripsTab() {
  const totalNights = TRIPS.reduce((a, t) => a + t.nights, 0);
  const uniqueCountries = new Set(TRIPS.flatMap((t) => t.countries)).size;
  const people = new Set(
    TRIPS.flatMap((t) => t.companions).filter((c) => c !== 'Solo' && c !== 'Familia'),
  ).size;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-white">Mis viajes</h2>
        <p className="text-sm text-slate-400 mt-1">
          {TRIPS.length} viajes documentados. La versión narrativa de cada uno vive en la carpeta{' '}
          <code className="text-slate-300 bg-slate-800 px-1.5 py-0.5 rounded text-xs">viajes/</code>{' '}
          del segundo cerebro.
        </p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatTile label="Viajes" value={TRIPS.length} icon="fa-suitcase-rolling" tone="indigo" />
        <StatTile label="Noches" value={totalNights} icon="fa-moon" />
        <StatTile label="Países" value={uniqueCountries} icon="fa-earth-americas" tone="emerald" />
        <StatTile label="Compañeros" value={people} icon="fa-user-group" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {TRIPS.map((t) => (
          <TripCard key={t.id} trip={t} />
        ))}
      </div>

      <BackupPanel />
    </div>
  );
}
