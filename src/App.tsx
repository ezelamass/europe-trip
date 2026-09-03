import { lazy, Suspense, useEffect, useState } from 'react';
import { useStore, type TabId } from './store/useStore';
import { TRIPS_BY_ID } from './data/trips';
import type { RouteStop } from './types';
import HomeTab from './tabs/HomeTab';
import TripsTab from './tabs/TripsTab';
import StatsTab from './tabs/StatsTab';
import BenefitsTab from './tabs/BenefitsTab';
import HacksTab from './tabs/HacksTab';
import QuestsTab from './tabs/QuestsTab';
import LuggageTab from './tabs/LuggageTab';
import TripDetail from './views/TripDetail';
import StopItinerary from './views/StopItinerary';
import BottomNav, { type NavItem } from './components/BottomNav';

// El mapa mundial son ~65 KB de geometría: se carga recién al abrir la tab.
const WorldTab = lazy(() => import('./tabs/WorldTab'));

/** Cuatro destinos, como la referencia. Las herramientas de un viaje (valija,
 *  beneficios, hacks, side quests) ya no viven acá: se entra por Inicio. */
const NAV: NavItem[] = [
  { id: 'home', label: 'Inicio', icon: 'fa-house' },
  { id: 'trips', label: 'Viajes', icon: 'fa-suitcase-rolling' },
  { id: 'world', label: 'Mi Mundo', icon: 'fa-earth-americas' },
  { id: 'stats', label: 'Métricas', icon: 'fa-chart-simple' },
];

/** Tabs que no están en la barra: se abren desde adentro de un viaje y vuelven
 *  a Inicio. Cada una lleva su título para la cabecera. */
const SUBTAB_TITLES: Partial<Record<TabId, string>> = {
  benefits: 'Beneficios UE',
  hacks: 'Hacks del viaje',
  quests: 'Side quests',
  luggage: 'Valija',
};

export default function App() {
  const activeTab = useStore((s) => s.activeTab);
  const setTab = useStore((s) => s.setTab);
  const [openTripId, setOpenTripId] = useState<string | null>(null);
  const [openStop, setOpenStop] = useState<RouteStop | null>(null);

  const detailTrip = openTripId ? TRIPS_BY_ID[openTripId] : null;
  const subtitle = SUBTAB_TITLES[activeTab];

  // Al cambiar de pantalla se vuelve arriba: si no, se entra a un viaje a media altura.
  useEffect(() => {
    window.scrollTo({ top: 0 });
  }, [activeTab, openTripId, openStop]);

  const navActive: TabId = subtitle ? 'home' : activeTab;

  return (
    <div className="min-h-screen bg-slate-950">
      <main className="mx-auto w-full max-w-2xl px-4 pt-6 pb-36">
        {openStop ? (
          <StopItinerary stop={openStop} onBack={() => setOpenStop(null)} />
        ) : detailTrip ? (
          <TripDetail trip={detailTrip} onBack={() => setOpenTripId(null)} />
        ) : subtitle ? (
          <div className="space-y-5">
            <button
              onClick={() => setTab('home')}
              className="inline-flex items-center gap-2 text-sm font-semibold text-slate-400 active:scale-95 transition"
            >
              <i className="fa-solid fa-arrow-left" />
              Volver al viaje
            </button>
            {activeTab === 'benefits' && <BenefitsTab />}
            {activeTab === 'hacks' && <HacksTab />}
            {activeTab === 'quests' && <QuestsTab />}
            {activeTab === 'luggage' && <LuggageTab />}
          </div>
        ) : (
          <>
            {activeTab === 'home' && <HomeTab onOpen={setOpenTripId} onOpenStop={setOpenStop} />}
            {activeTab === 'trips' && <TripsTab onOpen={setOpenTripId} />}
            {activeTab === 'stats' && <StatsTab />}
            {activeTab === 'world' && (
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
          </>
        )}
      </main>

      <BottomNav
        items={NAV}
        active={navActive}
        onSelect={(id) => {
          setOpenTripId(null);
          setOpenStop(null);
          setTab(id);
        }}
      />
    </div>
  );
}
