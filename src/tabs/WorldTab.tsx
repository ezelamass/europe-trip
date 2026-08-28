import { useMemo, useState } from 'react';
import { useStore } from '../store/useStore';
import {
  CONTINENTS,
  COUNTRIES,
  SUBDIVISIONS,
  TOTAL_COUNTRIES,
  type ContinentCode,
  type ViewCode,
} from '../data/worldMap';
import { countryVisitsFromTrips } from '../data/trips';
import { flagEmoji, subsTotal, subsVisited } from '../lib/format';
import StatTile from '../components/StatTile';
import WorldMap from '../components/WorldMap';
import Modal from '../components/Modal';

const CONTINENT_ORDER: ContinentCode[] = ['EU', 'SA', 'NA', 'AS', 'AF', 'OC'];

export default function WorldTab() {
  const profile = useStore((s) => s.travelProfile);
  const view = useStore((s) => s.profileContinent);
  const setView = useStore((s) => s.setProfileContinent);
  const toggleCountryVisited = useStore((s) => s.toggleCountryVisited);
  const adjustCountryVisits = useStore((s) => s.adjustCountryVisits);
  const toggleSubdivision = useStore((s) => s.toggleSubdivision);
  const syncProfileFromTrips = useStore((s) => s.syncProfileFromTrips);

  const [detail, setDetail] = useState<string | null>(null);
  const [picker, setPicker] = useState(false);
  const [query, setQuery] = useState('');
  const [synced, setSynced] = useState<number | null>(null);

  const visited = useMemo(() => Object.keys(profile).filter((iso) => COUNTRIES[iso]), [profile]);

  const stats = useMemo(() => {
    const byContinent: Record<string, { visited: number; total: number }> = {};
    for (const c of CONTINENT_ORDER) byContinent[c] = { visited: 0, total: 0 };
    for (const [iso, meta] of Object.entries(COUNTRIES)) {
      byContinent[meta.c].total++;
      if (profile[iso]) byContinent[meta.c].visited++;
    }
    const regions = visited.reduce((acc, iso) => acc + subsVisited(iso, profile), 0);
    const continentsTouched = CONTINENT_ORDER.filter((c) => byContinent[c].visited > 0).length;
    return { byContinent, regions, continentsTouched };
  }, [profile, visited]);

  /** Países que aparecen en los viajes documentados y todavía no están en el perfil. */
  const missingFromTrips = useMemo(() => {
    const fromTrips = countryVisitsFromTrips();
    return Object.keys(fromTrips).filter((iso) => COUNTRIES[iso] && !profile[iso]);
  }, [profile]);

  const pct = ((visited.length / TOTAL_COUNTRIES) * 100).toFixed(1).replace('.', ',');

  const grouped = useMemo(() => {
    const out: Record<string, string[]> = {};
    for (const iso of visited) {
      const c = COUNTRIES[iso].c;
      (out[c] ??= []).push(iso);
    }
    for (const list of Object.values(out)) list.sort((a, b) => COUNTRIES[a].n.localeCompare(COUNTRIES[b].n));
    return out;
  }, [visited]);

  const pickerResults = useMemo(() => {
    const q = query.trim().toLowerCase();
    return Object.entries(COUNTRIES)
      .filter(([iso, m]) => !q || m.n.toLowerCase().includes(q) || iso.toLowerCase() === q)
      .sort((a, b) => a[1].n.localeCompare(b[1].n));
  }, [query]);

  // Algunos países existen en el diccionario con la lista vacía (el Vaticano no
  // tiene subdivisiones): se tratan igual que si no estuvieran.
  const raw = detail ? SUBDIVISIONS[detail] : undefined;
  const detailSubs = raw?.list.length ? raw : undefined;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-white">Mi Mundo</h2>
          <p className="text-sm text-slate-400 mt-1">
            Perfil de viajero sobre los {TOTAL_COUNTRIES} países soberanos.
          </p>
        </div>
        <button
          onClick={() => setPicker(true)}
          className="text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg px-3 py-2 transition active:scale-95"
        >
          <i className="fa-solid fa-plus mr-1.5" />
          Agregar país
        </button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatTile label="Del mundo" value={`${pct}%`} icon="fa-earth-americas" tone="indigo" />
        <StatTile label="Países" value={`${visited.length}/${TOTAL_COUNTRIES}`} icon="fa-flag" />
        <StatTile label="Continentes" value={`${stats.continentsTouched}/6`} icon="fa-globe" tone="emerald" />
        <StatTile label="Regiones" value={stats.regions} icon="fa-map-location-dot" />
      </div>

      {missingFromTrips.length > 0 && (
        <div className="flex flex-wrap items-center justify-between gap-3 bg-amber-950/25 border border-amber-900/40 rounded-xl px-4 py-3">
          <p className="text-xs text-amber-100/90">
            <i className="fa-solid fa-link mr-1.5 text-amber-400" />
            Hay {missingFromTrips.length} país
            {missingFromTrips.length > 1 ? 'es' : ''} en tus viajes que no están en el perfil:{' '}
            <strong>{missingFromTrips.map((i) => COUNTRIES[i].n).join(', ')}</strong>.
          </p>
          <button
            onClick={() => setSynced(syncProfileFromTrips())}
            className="text-xs font-bold bg-amber-600 hover:bg-amber-500 text-white rounded-lg px-3 py-1.5 transition shrink-0"
          >
            Sincronizar
          </button>
        </div>
      )}
      {synced !== null && (
        <p className="text-xs text-emerald-300">
          <i className="fa-solid fa-circle-check mr-1.5" />
          {synced === 0 ? 'Ya estaba todo sincronizado.' : `${synced} país(es) agregados desde tus viajes.`}
        </p>
      )}

      {/* Foco por continente */}
      <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
        {(['WORLD', ...CONTINENT_ORDER] as ViewCode[]).map((c) => (
          <button
            key={c}
            onClick={() => setView(c)}
            className={`shrink-0 px-3 py-1.5 rounded-lg text-xs font-bold border transition ${
              view === c
                ? 'bg-indigo-600 border-indigo-500 text-white'
                : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            {c === 'WORLD' ? '🌍 Mundo' : CONTINENTS[c as ContinentCode]}
          </button>
        ))}
      </div>

      <div className="bg-slate-950 rounded-2xl border border-slate-800 p-2 sm:p-4">
        <WorldMap profile={profile} view={view} onSelect={setDetail} />
      </div>

      {/* Barras por continente */}
      <div className="space-y-2">
        <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wide">Por continente</h3>
        {CONTINENT_ORDER.map((c) => {
          const { visited: v, total } = stats.byContinent[c];
          const p = total ? (v / total) * 100 : 0;
          return (
            <button
              key={c}
              onClick={() => setView(c)}
              className="w-full text-left group"
            >
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="font-semibold text-slate-200 group-hover:text-indigo-300 transition">
                  {CONTINENTS[c]}
                </span>
                <span className="text-slate-400 tabular-nums">
                  {v}/{total} · {p.toFixed(1).replace('.', ',')}%
                </span>
              </div>
              <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-rose-500 to-indigo-500 rounded-full transition-all duration-500"
                  style={{ width: `${p}%` }}
                />
              </div>
            </button>
          );
        })}
      </div>

      {/* Listado de países visitados */}
      <div className="space-y-4">
        <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wide">
          Países visitados
        </h3>
        {CONTINENT_ORDER.filter((c) => grouped[c]?.length).map((c) => (
          <div key={c}>
            <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
              {CONTINENTS[c]}
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
              {grouped[c].map((iso) => {
                const total = subsTotal(iso);
                const vis = subsVisited(iso, profile);
                return (
                  <button
                    key={iso}
                    onClick={() => setDetail(iso)}
                    className="flex items-center justify-between gap-2 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-xl px-3 py-2.5 text-left transition"
                  >
                    <span className="flex items-center gap-2 min-w-0">
                      <span className="text-lg leading-none">{flagEmoji(iso)}</span>
                      <span className="text-sm text-slate-100 truncate">{COUNTRIES[iso].n}</span>
                    </span>
                    <span className="shrink-0 text-[11px] text-slate-400 tabular-nums">
                      {profile[iso].visits}×{total > 0 && ` · ${vis}/${total}`}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Detalle de país */}
      <Modal
        open={!!detail}
        onClose={() => setDetail(null)}
        title={
          detail ? (
            <span>
              {flagEmoji(detail)} {COUNTRIES[detail]?.n}
            </span>
          ) : (
            ''
          )
        }
        subtitle={detail && detailSubs ? `${subsVisited(detail, profile)}/${detailSubs.list.length} ${detailSubs.label}` : undefined}
      >
        {detail && (
          <div className="space-y-4">
            <div className="flex items-center justify-between gap-3 bg-slate-950/60 border border-slate-800 rounded-xl px-4 py-3">
              <span className="text-sm text-slate-300">
                {profile[detail] ? 'Visitado' : 'Sin visitar'}
              </span>
              <button
                onClick={() => toggleCountryVisited(detail)}
                className={`text-xs font-bold rounded-lg px-3 py-1.5 transition ${
                  profile[detail]
                    ? 'bg-rose-950/60 text-rose-300 border border-rose-900/50 hover:bg-rose-900/50'
                    : 'bg-emerald-600 text-white hover:bg-emerald-500'
                }`}
              >
                {profile[detail] ? 'Quitar' : 'Marcar visitado'}
              </button>
            </div>

            {profile[detail] && (
              <>
                <div className="flex items-center justify-between gap-3">
                  <span className="text-sm text-slate-300">Veces que fui</span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => adjustCountryVisits(detail, -1)}
                      className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
                    >
                      <i className="fa-solid fa-minus text-xs" />
                    </button>
                    <span className="w-8 text-center font-bold text-lg tabular-nums text-white">
                      {profile[detail].visits}
                    </span>
                    <button
                      onClick={() => adjustCountryVisits(detail, 1)}
                      className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
                    >
                      <i className="fa-solid fa-plus text-xs" />
                    </button>
                  </div>
                </div>

                {detailSubs ? (
                  <div>
                    <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                      {detailSubs.label}
                    </h4>
                    <div className="grid grid-cols-2 gap-1.5">
                      {detailSubs.list.map(([code, name]) => {
                        const on = profile[detail].subs.includes(code);
                        return (
                          <button
                            key={code}
                            onClick={() => toggleSubdivision(detail, code)}
                            className={`text-left text-xs rounded-lg px-2.5 py-2 border transition ${
                              on
                                ? 'bg-rose-950/40 border-rose-900/50 text-rose-200'
                                : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                            }`}
                          >
                            <i
                              className={`fa-solid ${on ? 'fa-circle-check' : 'fa-circle'} mr-1.5 text-[10px]`}
                            />
                            {name}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ) : (
                  <p className="text-xs text-slate-500">
                    Este país todavía no tiene subdivisiones cargadas. Se agregan editando{' '}
                    <code className="bg-slate-800 px-1 rounded">SUBS</code> en{' '}
                    <code className="bg-slate-800 px-1 rounded">scripts/build-final.js</code>.
                  </p>
                )}
              </>
            )}
          </div>
        )}
      </Modal>

      {/* Selector de países */}
      <Modal open={picker} onClose={() => setPicker(false)} title="Agregar país" maxWidth="max-w-lg">
        <input
          autoFocus
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Buscar entre los 195 países…"
          className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 mb-3"
        />
        <div className="max-h-[50vh] overflow-y-auto custom-scrollbar space-y-1">
          {pickerResults.map(([iso, meta]) => (
            <button
              key={iso}
              onClick={() => toggleCountryVisited(iso)}
              className="w-full flex items-center justify-between gap-2 px-3 py-2 rounded-lg hover:bg-slate-800 transition text-left"
            >
              <span className="flex items-center gap-2 min-w-0">
                <span className="text-lg leading-none">{flagEmoji(iso)}</span>
                <span className="text-sm text-slate-200 truncate">{meta.n}</span>
              </span>
              <i
                className={`fa-solid shrink-0 ${
                  profile[iso] ? 'fa-circle-check text-rose-400' : 'fa-circle text-slate-700'
                }`}
              />
            </button>
          ))}
        </div>
      </Modal>
    </div>
  );
}
