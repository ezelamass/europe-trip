import { useMemo } from 'react';
import { useStore } from '../store/useStore';
import { computeStats } from '../lib/stats';
import { COUNTRIES } from '../data/worldMap';
import { flagEmoji } from '../lib/format';
import StatTile from '../components/StatTile';

function Bars({
  data,
  unit,
  unitSingular,
}: {
  data: { name: string; count: number }[];
  unit: string;
  unitSingular?: string;
}) {
  const max = Math.max(1, ...data.map((d) => d.count));
  return (
    <div className="space-y-2">
      {data.map((d) => (
        <div key={d.name}>
          <div className="flex items-baseline justify-between text-xs mb-1">
            <span className="text-slate-200 font-semibold truncate">{d.name}</span>
            <span className="text-slate-400 tabular-nums shrink-0 ml-2">
              {d.count} {d.count === 1 ? (unitSingular ?? unit) : unit}
            </span>
          </div>
          <div className="h-2 rounded-full bg-slate-800 overflow-hidden">
            <div
              className="h-full rounded-full bg-accent-400/80 transition-all duration-500"
              style={{ width: `${(d.count / max) * 100}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

function Section({ title, hint, children }: { title: string; hint?: string; children: React.ReactNode }) {
  return (
    <section className="rounded-2xl bg-slate-900 border border-white/10 p-4">
      <h2 className="text-sm font-bold text-white">{title}</h2>
      {hint && <p className="text-[11px] text-slate-500 mt-0.5 mb-3">{hint}</p>}
      <div className={hint ? '' : 'mt-3'}>{children}</div>
    </section>
  );
}

export default function StatsTab() {
  const tripStops = useStore((s) => s.tripStops);
  const s = useMemo(() => computeStats(tripStops), [tripStops]);

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-3xl font-extrabold text-white tracking-tight">Métricas</h1>
        <p className="text-sm text-slate-400 mt-1">
          Todo lo que sale de los {s.trips} viajes documentados, desde {s.firstYear}. En{' '}
          <strong className="text-slate-300">Mi Mundo</strong> están los países que cargaste a
          mano, que pueden ser más.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <StatTile label="Noches de viaje" value={s.nights} icon="fa-moon" tone="accent" />
        <StatTile label="Viajes" value={s.trips} icon="fa-suitcase-rolling" />
        <StatTile label="Países" value={s.countries} icon="fa-flag" tone="emerald" />
        <StatTile label="Continentes pisados" value={`${s.continents}/6`} icon="fa-earth-americas" />
      </div>

      <Section
        title="Kilómetros entre paradas"
        hint="En línea recta, sumando tramo a tramo. No cuenta desvíos ni los vuelos desde Buenos Aires, así que es un piso."
      >
        <p className="text-3xl font-extrabold text-white tabular-nums">
          {s.km.toLocaleString('es-AR')} <span className="text-base text-slate-400 font-bold">km</span>
        </p>
      </Section>

      <Section title="Noches por año">
        <Bars
          data={s.nightsByYear.map((y) => ({ name: y.year, count: y.nights }))}
          unit="noches"
          unitSingular="noche"
        />
      </Section>

      <Section title="Con quién viajé más" hint="Cantidad de viajes compartidos.">
        <Bars data={s.companions.slice(0, 6)} unit="viajes" unitSingular="viaje" />
      </Section>

      <Section
        title="Noches por país"
        hint="Un viaje de varios países reparte sus noches en partes iguales: no hay dato por país en los viajes históricos."
      >
        <Bars
          data={s.nightsByCountry.slice(0, 8).map((c) => ({
            name: `${flagEmoji(c.name)} ${COUNTRIES[c.name]?.n ?? c.name}`,
            count: c.count,
          }))}
          unit="noches"
          unitSingular="noche"
        />
      </Section>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <Section title="El más largo">
          <p className="text-lg font-bold text-white">
            {s.longest.trip.emoji} {s.longest.trip.title}
          </p>
          <p className="text-sm text-slate-400">{s.longest.nights} noches</p>
        </Section>
        <Section title="El más corto">
          <p className="text-lg font-bold text-white">
            {s.shortest.trip.emoji} {s.shortest.trip.title}
          </p>
          <p className="text-sm text-slate-400">{s.shortest.nights} noches</p>
        </Section>
      </div>
    </div>
  );
}
