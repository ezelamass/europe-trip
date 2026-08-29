import { useMemo, useState } from 'react';
import { TRIPS } from '../data/trips';
import TripCard from '../components/TripCard';
import BackupPanel from '../components/BackupPanel';

type Filtro = 'activos' | 'futuros' | 'pasados';

export default function TripsTab({ onOpen }: { onOpen: (id: string) => void }) {
  const activos = useMemo(() => TRIPS.filter((t) => t.status === 'en-curso'), []);
  const futuros = useMemo(
    () =>
      TRIPS.filter((t) => t.status === 'planificado').sort((a, b) =>
        a.startDate.localeCompare(b.startDate),
      ),
    [],
  );
  const pasados = useMemo(() => TRIPS.filter((t) => t.status === 'completado'), []);

  // Abre en la primera pestaña que tenga algo: no tiene sentido arrancar vacío.
  const [filtro, setFiltro] = useState<Filtro>(
    activos.length ? 'activos' : futuros.length ? 'futuros' : 'pasados',
  );

  const lista = filtro === 'activos' ? activos : filtro === 'futuros' ? futuros : pasados;

  return (
    <div className="space-y-5">
      <h1 className="text-3xl font-extrabold text-white tracking-tight">Mis viajes</h1>

      {/* Segmented control, como el Activos/Pasados de la referencia */}
      <div className="flex rounded-full bg-slate-900 border border-white/10 p-1">
        {([
          ['activos', 'Activos', activos.length],
          ['futuros', 'Futuros', futuros.length],
          ['pasados', 'Pasados', pasados.length],
        ] as const).map(([id, label, n]) => (
          <button
            key={id}
            onClick={() => setFiltro(id)}
            className={`flex-1 rounded-full py-2.5 text-[13px] font-bold transition ${
              filtro === id ? 'bg-slate-800 text-white shadow-sm' : 'text-slate-400'
            }`}
          >
            {label}
            <span className={filtro === id ? 'text-slate-400 ml-1.5' : 'text-slate-600 ml-1.5'}>
              {n}
            </span>
          </button>
        ))}
      </div>

      {lista.length === 0 ? (
        <p className="text-sm text-slate-400 py-8 text-center">
          {filtro === 'activos'
            ? 'No hay ningún viaje en curso.'
            : filtro === 'futuros'
              ? 'Todavía no hay ningún viaje planificado.'
              : 'Todavía no hay viajes pasados.'}
        </p>
      ) : (
        <div className="space-y-4">
          {lista.map((t) => (
            <TripCard key={t.id} trip={t} onOpen={onOpen} />
          ))}
        </div>
      )}

      <div className="pt-2">
        <BackupPanel />
      </div>
    </div>
  );
}
