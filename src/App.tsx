import { lazy, Suspense, useEffect } from 'react';
import { useStore, type TabId } from './store/useStore';
import { TRIPS_BY_ID, DEFAULT_TRIP_ID } from './data/trips';
import TripsTab from './tabs/TripsTab';
import ItineraryTab from './tabs/ItineraryTab';
import BenefitsTab from './tabs/BenefitsTab';
import HacksTab from './tabs/HacksTab';
import QuestsTab from './tabs/QuestsTab';
import LuggageTab from './tabs/LuggageTab';

// El mapa mundial son ~79 KB de geometría: se carga recién al abrir la tab.
const WorldTab = lazy(() => import('./tabs/WorldTab'));

interface TabDef {
  id: TabId;
  label: string;
  icon: string;
  /** Las herramientas de planificación solo aplican al viaje que las tiene. */
  plannerOnly?: boolean;
}

const TABS: TabDef[] = [
  { id: 'trips', label: 'Viajes', icon: 'fa-suitcase-rolling' },
  { id: 'itinerary', label: 'Itinerario', icon: 'fa-route' },
  { id: 'world', label: 'Mi Mundo', icon: 'fa-earth-americas' },
  { id: 'benefits', label: 'Beneficios', icon: 'fa-passport', plannerOnly: true },
  { id: 'hacks', label: 'Hacks', icon: 'fa-lightbulb', plannerOnly: true },
  { id: 'quests', label: 'Side Quests', icon: 'fa-mountain-sun', plannerOnly: true },
  { id: 'luggage', label: 'Valija', icon: 'fa-bag-shopping', plannerOnly: true },
];

export default function App() {
  const activeTab = useStore((s) => s.activeTab);
  const setTab = useStore((s) => s.setTab);
  const storedTripId = useStore((s) => s.activeTripId);
  const setActiveTrip = useStore((s) => s.setActiveTrip);

  // Un id guardado que ya no existe (viaje renombrado, respaldo de otra versión)
  // dejaba el <select> apuntando a una opción inexistente: se repara el estado.
  const activeTripId = TRIPS_BY_ID[storedTripId] ? storedTripId : DEFAULT_TRIP_ID;
  useEffect(() => {
    if (storedTripId !== activeTripId) setActiveTrip(activeTripId);
  }, [storedTripId, activeTripId, setActiveTrip]);

  const trip = TRIPS_BY_ID[activeTripId];

  const tabs = TABS.filter((t) => !t.plannerOnly || trip.hasPlannerTools);
  // Si el viaje activo no tiene herramientas, no dejamos una tab huérfana seleccionada.
  const current = tabs.some((t) => t.id === activeTab) ? activeTab : 'trips';

  return (
    <div className="min-h-screen flex flex-col pb-24 lg:pb-0">
      <header className="bg-slate-950 border-b border-slate-800 sticky top-0 z-40 shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="bg-gradient-to-tr from-blue-600 to-indigo-600 text-white p-2.5 rounded-xl shadow-md shrink-0">
              <i className="fa-solid fa-compass text-lg" />
            </div>
            <div className="min-w-0">
              <h1 className="font-bold text-base sm:text-lg text-white tracking-tight leading-tight">
                Mis Viajes
              </h1>
              <p className="text-[10px] sm:text-xs text-slate-400 font-medium truncate">
                {trip.emoji} {trip.title} · {trip.dateLabel}
              </p>
            </div>
          </div>

          {/* Selector de viaje: la app dejó de ser de un solo viaje. */}
          <select
            value={activeTripId}
            onChange={(e) => setActiveTrip(e.target.value)}
            aria-label="Viaje activo"
            className="shrink-0 bg-slate-900 border border-slate-700 text-slate-200 text-xs sm:text-sm rounded-lg px-2.5 py-2 max-w-[45vw] sm:max-w-none focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            {Object.values(TRIPS_BY_ID).map((t) => (
              <option key={t.id} value={t.id}>
                {t.emoji} {t.title}
              </option>
            ))}
          </select>
        </div>

        {/* Tabs: scroll horizontal en mobile */}
        <nav className="max-w-7xl mx-auto px-2 sm:px-6 lg:px-8 hidden lg:block">
          <div className="flex gap-1 overflow-x-auto no-scrollbar">
            {tabs.map((t) => (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={`px-4 py-2.5 text-sm font-semibold whitespace-nowrap border-b-2 transition ${
                  current === t.id
                    ? 'border-indigo-500 text-indigo-300'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                <i className={`fa-solid ${t.icon} mr-2`} />
                {t.label}
              </button>
            ))}
          </div>
        </nav>
      </header>

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {current === 'trips' && <TripsTab />}
        {current === 'itinerary' && <ItineraryTab trip={trip} />}
        {current === 'world' && (
          <Suspense
            fallback={
              <p className="text-sm text-slate-400">
                <i className="fa-solid fa-circle-notch fa-spin mr-2" />
                Cargando el mapa…
              </p>
            }
          >
            <WorldTab />
          </Suspense>
        )}
        {current === 'benefits' && <BenefitsTab />}
        {current === 'hacks' && <HacksTab />}
        {current === 'quests' && <QuestsTab />}
        {current === 'luggage' && <LuggageTab />}
      </main>

      {/* Barra inferior en mobile */}
      <nav className="lg:hidden fixed bottom-0 inset-x-0 z-40 bg-slate-950/95 backdrop-blur border-t border-slate-800 pb-[env(safe-area-inset-bottom)]">
        <div className="flex overflow-x-auto no-scrollbar">
          {tabs.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`flex-1 min-w-[72px] py-2.5 flex flex-col items-center gap-1 transition ${
                current === t.id ? 'text-indigo-400' : 'text-slate-500'
              }`}
            >
              <i className={`fa-solid ${t.icon} text-base`} />
              <span className="text-[10px] font-semibold leading-none">{t.label}</span>
            </button>
          ))}
        </div>
      </nav>
    </div>
  );
}
