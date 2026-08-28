import type { Trip } from '../types';
import { coverFor } from '../data/covers';
import { tripNights } from '../data/trips';
import { useStore } from '../store/useStore';
import ItineraryTab from '../tabs/ItineraryTab';
import { GHOST_LINK_CLS } from '../components/ui';

/** Pantalla de un viaje: se abre desde una card y vuelve con la flecha.
 *  No es un tab — es una vista apilada encima del tab actual. */
export default function TripDetail({ trip, onBack }: { trip: Trip; onBack: () => void }) {
  const stops = useStore((s) => s.tripStops[trip.id]) ?? trip.stops;
  const cover = coverFor(trip.id);

  return (
    <div className="space-y-5">
      <div className="relative -mx-4 -mt-6">
        <div className="relative h-[32vh] min-h-[200px] max-h-[300px] bg-slate-800">
          {cover && <img src={cover} alt={trip.title} className="absolute inset-0 h-full w-full object-cover" />}
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-slate-950/30" />

          <button
            onClick={onBack}
            aria-label="Volver"
            className="absolute top-4 left-4 h-10 w-10 rounded-full bg-black/50 backdrop-blur text-white grid place-items-center active:scale-95 transition"
          >
            <i className="fa-solid fa-arrow-left" />
          </button>

          <div className="absolute inset-x-0 bottom-0 p-5">
            <h1 className="text-2xl font-extrabold text-white tracking-tight leading-tight">
              {trip.title}
            </h1>
            <p className="text-sm text-slate-300 mt-1">
              {trip.dateLabel} · {tripNights(trip, stops)} noches
            </p>
          </div>
        </div>
      </div>

      <p className="text-sm text-slate-300 leading-relaxed">{trip.summary}</p>

      <div className="flex flex-wrap gap-2">
        {trip.photosAlbumUrl && (
          <a href={trip.photosAlbumUrl} target="_blank" rel="noreferrer" className={GHOST_LINK_CLS}>
            <i className="fa-regular fa-images mr-1.5" />
            Álbum de fotos
          </a>
        )}
        {trip.lodgingLinks?.map((l) => (
          <a key={l.url} href={l.url} target="_blank" rel="noreferrer" className={GHOST_LINK_CLS}>
            <i className="fa-solid fa-location-dot mr-1.5" />
            {l.label}
          </a>
        ))}
      </div>

      <ItineraryTab trip={trip} />
    </div>
  );
}
