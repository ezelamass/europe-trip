import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Fact, LuggageItem, RouteStop, SideQuest, TravelProfile, CatalogCity } from '../types';
import {
  DEFAULT_LUGGAGE_ITEMS,
  DEFAULT_SIDE_QUESTS,
  DEFAULT_TRAVEL_PROFILE,
  PREDEFINED_FACTS,
  BASE_CATALOG_CITIES,
} from '../data/europa2026';
import { TRIPS, DEFAULT_TRIP_ID } from '../data/trips';
import { readLegacyState } from './legacy';
import type { ViewCode } from '../data/worldMap';

/** Subir esto fuerza a que la data hardcodeada (itinerarios, valija, quests)
 *  pise lo guardado en el celular. El perfil de viajero NUNCA se pisa:
 *  son datos que cargó el usuario, no contenido de la app. */
export const DATA_VERSION = '2026-08-28-react-1';

export type TabId = 'trips' | 'itinerary' | 'world' | 'benefits' | 'hacks' | 'quests' | 'luggage';

interface Persisted {
  dataVersion: string;
  activeTripId: string;
  /** Itinerarios editados por el usuario, por viaje. */
  tripStops: Record<string, RouteStop[]>;
  travelProfile: TravelProfile;
  luggageItems: LuggageItem[];
  sideQuests: SideQuest[];
  customFacts: Fact[];
  catalogCities: CatalogCity[];
  displayCurrency: 'USD' | 'EUR';
  usdToEurRate: number;
  baseFlightUSD: number;
  includeBaseFlight: boolean;
  highSpeedReservations: number;
  reservationAvgCost: number;
  mamaPaysMomTrip: boolean;
  esimPhoneNumber: string;
  appliedBenefits: Record<string, boolean>;
}

interface Store extends Persisted {
  // UI (no se persiste salvo activeTripId)
  activeTab: TabId;
  profileContinent: ViewCode;

  setTab: (t: TabId) => void;
  setActiveTrip: (id: string) => void;
  setProfileContinent: (c: ViewCode) => void;

  // Itinerario del viaje activo
  stopsFor: (tripId: string) => RouteStop[];
  updateStop: (tripId: string, stopId: string, patch: Partial<RouteStop>) => void;
  removeStop: (tripId: string, stopId: string) => void;
  moveStop: (tripId: string, stopId: string, dir: -1 | 1) => void;
  addStop: (tripId: string, stop: RouteStop) => void;
  resetStops: (tripId: string) => void;

  // Perfil de viajero
  toggleCountryVisited: (iso: string) => void;
  adjustCountryVisits: (iso: string, delta: number) => void;
  toggleSubdivision: (iso: string, sub: string) => void;
  syncProfileFromTrips: () => number;

  // Valija
  addLuggageItem: (item: LuggageItem) => void;
  deleteLuggageItem: (id: string) => void;
  setLuggageLocation: (id: string, location: string) => void;

  // Quests y facts
  toggleQuestBudget: (id: string) => void;
  deleteQuest: (id: string) => void;
  addQuest: (q: SideQuest) => void;
  addFact: (f: Fact) => void;
  deleteFact: (id: string) => void;
  clearCustomFacts: () => void;

  // Ajustes
  setCurrency: (c: 'USD' | 'EUR') => void;
  setFxRate: (r: number) => void;
  setBaseFlightUSD: (v: number) => void;
  toggleBaseFlight: () => void;
  setReservations: (n: number) => void;
  toggleMomInvitation: () => void;
  setEsimPhone: (p: string) => void;
  toggleBenefit: (id: string) => void;

  // Respaldo
  exportState: () => string;
  importState: (json: string) => { ok: boolean; error?: string };
}

const seedStops = (): Record<string, RouteStop[]> =>
  Object.fromEntries(TRIPS.map((t) => [t.id, t.stops.map((s) => ({ ...s }))]));

/** Estado de la app vieja, si es la primera vez que se abre esta versión. */
const legacy = readLegacyState();

const initial: Persisted = {
  dataVersion: DATA_VERSION,
  activeTripId: DEFAULT_TRIP_ID,
  tripStops: (() => {
    const seeded = seedStops();
    // El viaje único de la app vieja es el actual `europa-2026`.
    if (legacy?.europaStops) seeded['europa-2026'] = legacy.europaStops;
    return seeded;
  })(),
  travelProfile: legacy?.travelProfile ?? DEFAULT_TRAVEL_PROFILE,
  luggageItems: legacy?.luggageItems ?? DEFAULT_LUGGAGE_ITEMS,
  sideQuests: legacy?.sideQuests ?? DEFAULT_SIDE_QUESTS,
  customFacts: legacy?.customFacts ?? PREDEFINED_FACTS,
  catalogCities: BASE_CATALOG_CITIES,
  displayCurrency: legacy?.displayCurrency ?? 'USD',
  usdToEurRate: legacy?.usdToEurRate ?? 0.8757,
  baseFlightUSD: legacy?.baseFlightUSD ?? 1076,
  includeBaseFlight: legacy?.includeBaseFlight ?? true,
  highSpeedReservations: legacy?.highSpeedReservations ?? 3,
  reservationAvgCost: 15,
  mamaPaysMomTrip: legacy?.mamaPaysMomTrip ?? false,
  esimPhoneNumber: legacy?.esimPhoneNumber ?? '',
  appliedBenefits: legacy?.appliedBenefits ?? {
    veranoJoven: true, tse: true, museos: true, abonoMadrid: true, eyca: true,
  },
};

export const useStore = create<Store>()(
  persist(
    (set, get) => ({
      ...initial,
      activeTab: 'trips',
      profileContinent: 'WORLD',

      setTab: (activeTab) => set({ activeTab }),
      setActiveTrip: (activeTripId) => set({ activeTripId }),
      setProfileContinent: (profileContinent) => set({ profileContinent }),

      stopsFor: (tripId) => get().tripStops[tripId] ?? [],

      updateStop: (tripId, stopId, patch) =>
        set((s) => ({
          tripStops: {
            ...s.tripStops,
            [tripId]: (s.tripStops[tripId] ?? []).map((st) =>
              st.id === stopId ? { ...st, ...patch } : st,
            ),
          },
        })),

      removeStop: (tripId, stopId) =>
        set((s) => ({
          tripStops: {
            ...s.tripStops,
            [tripId]: (s.tripStops[tripId] ?? []).filter((st) => st.id !== stopId),
          },
        })),

      moveStop: (tripId, stopId, dir) =>
        set((s) => {
          const list = [...(s.tripStops[tripId] ?? [])];
          const i = list.findIndex((st) => st.id === stopId);
          const j = i + dir;
          if (i === -1 || j < 0 || j >= list.length) return s;
          [list[i], list[j]] = [list[j], list[i]];
          return { tripStops: { ...s.tripStops, [tripId]: list } };
        }),

      addStop: (tripId, stop) =>
        set((s) => ({
          tripStops: { ...s.tripStops, [tripId]: [...(s.tripStops[tripId] ?? []), stop] },
        })),

      resetStops: (tripId) =>
        set((s) => {
          const trip = TRIPS.find((t) => t.id === tripId);
          if (!trip) return s;
          return {
            tripStops: { ...s.tripStops, [tripId]: trip.stops.map((st) => ({ ...st })) },
          };
        }),

      toggleCountryVisited: (iso) =>
        set((s) => {
          const p = { ...s.travelProfile };
          if (p[iso]) delete p[iso];
          else p[iso] = { visits: 1, subs: [] };
          return { travelProfile: p };
        }),

      adjustCountryVisits: (iso, delta) =>
        set((s) => {
          const cur = s.travelProfile[iso];
          if (!cur) return s;
          const visits = Math.max(1, cur.visits + delta);
          return { travelProfile: { ...s.travelProfile, [iso]: { ...cur, visits } } };
        }),

      toggleSubdivision: (iso, sub) =>
        set((s) => {
          const cur = s.travelProfile[iso] ?? { visits: 1, subs: [] };
          const subs = cur.subs.includes(sub)
            ? cur.subs.filter((x) => x !== sub)
            : [...cur.subs, sub];
          return { travelProfile: { ...s.travelProfile, [iso]: { ...cur, subs } } };
        }),

      /** Agrega al perfil los países que aparecen en los viajes y todavía no estaban.
       *  No pisa los contadores existentes: los que el usuario editó quedan como están. */
      syncProfileFromTrips: () => {
        const p = { ...get().travelProfile };
        let added = 0;
        for (const trip of TRIPS) {
          for (const iso of trip.countries) {
            if (!p[iso]) {
              p[iso] = { visits: 1, subs: [] };
              added++;
            }
          }
        }
        if (added) set({ travelProfile: p });
        return added;
      },

      addLuggageItem: (item) => set((s) => ({ luggageItems: [...s.luggageItems, item] })),
      deleteLuggageItem: (id) =>
        set((s) => ({ luggageItems: s.luggageItems.filter((i) => i.id !== id) })),
      setLuggageLocation: (id, location) =>
        set((s) => ({
          luggageItems: s.luggageItems.map((i) => (i.id === id ? { ...i, location } : i)),
        })),

      toggleQuestBudget: (id) =>
        set((s) => ({
          sideQuests: s.sideQuests.map((q) =>
            q.id === id ? { ...q, includedInBudget: !q.includedInBudget } : q,
          ),
        })),
      deleteQuest: (id) => set((s) => ({ sideQuests: s.sideQuests.filter((q) => q.id !== id) })),
      addQuest: (q) => set((s) => ({ sideQuests: [...s.sideQuests, q] })),

      addFact: (f) => set((s) => ({ customFacts: [...s.customFacts, f] })),
      deleteFact: (id) => set((s) => ({ customFacts: s.customFacts.filter((f) => f.id !== id) })),
      clearCustomFacts: () =>
        set((s) => ({ customFacts: s.customFacts.filter((f) => f.isPredefined) })),

      setCurrency: (displayCurrency) => set({ displayCurrency }),
      setFxRate: (usdToEurRate) => set({ usdToEurRate }),
      setBaseFlightUSD: (baseFlightUSD) => set({ baseFlightUSD }),
      toggleBaseFlight: () => set((s) => ({ includeBaseFlight: !s.includeBaseFlight })),
      setReservations: (highSpeedReservations) =>
        set({ highSpeedReservations: Math.max(0, highSpeedReservations) }),
      toggleMomInvitation: () => set((s) => ({ mamaPaysMomTrip: !s.mamaPaysMomTrip })),
      setEsimPhone: (esimPhoneNumber) => set({ esimPhoneNumber }),
      toggleBenefit: (id) =>
        set((s) => ({
          appliedBenefits: { ...s.appliedBenefits, [id]: !s.appliedBenefits[id] },
        })),

      /** Vuelca todo el estado del usuario a JSON, para bajarlo como respaldo. */
      exportState: () => {
        const s = get();
        return JSON.stringify(
          {
            exportedAt: new Date().toISOString(),
            dataVersion: s.dataVersion,
            tripStops: s.tripStops,
            travelProfile: s.travelProfile,
            luggageItems: s.luggageItems,
            sideQuests: s.sideQuests,
            customFacts: s.customFacts,
            appliedBenefits: s.appliedBenefits,
            displayCurrency: s.displayCurrency,
            usdToEurRate: s.usdToEurRate,
            baseFlightUSD: s.baseFlightUSD,
            includeBaseFlight: s.includeBaseFlight,
            highSpeedReservations: s.highSpeedReservations,
            mamaPaysMomTrip: s.mamaPaysMomTrip,
            esimPhoneNumber: s.esimPhoneNumber,
          },
          null,
          2,
        );
      },

      /** Restaura un respaldo. Solo pisa los campos que vengan en el archivo,
       *  así un export viejo no borra lo que todavía no existía cuando se generó. */
      importState: (json) => {
        try {
          const data = JSON.parse(json) as Record<string, unknown>;
          if (!data || typeof data !== 'object') return { ok: false, error: 'El archivo no es un JSON válido.' };
          if (!data.travelProfile && !data.tripStops) {
            return { ok: false, error: 'El archivo no parece un respaldo de esta app.' };
          }
          const patch: Record<string, unknown> = {};
          for (const k of [
            'tripStops', 'travelProfile', 'luggageItems', 'sideQuests', 'customFacts',
            'appliedBenefits', 'displayCurrency', 'usdToEurRate', 'baseFlightUSD',
            'includeBaseFlight', 'highSpeedReservations', 'mamaPaysMomTrip', 'esimPhoneNumber',
          ]) {
            if (data[k] !== undefined) patch[k] = data[k];
          }
          set(patch as Partial<Store>);
          return { ok: true };
        } catch (e) {
          return { ok: false, error: e instanceof Error ? e.message : 'Error desconocido.' };
        }
      },
    }),
    {
      name: 'eurotrip-state',
      version: 2,
      partialize: (s): Persisted => ({
        dataVersion: s.dataVersion,
        activeTripId: s.activeTripId,
        tripStops: s.tripStops,
        travelProfile: s.travelProfile,
        luggageItems: s.luggageItems,
        sideQuests: s.sideQuests,
        customFacts: s.customFacts,
        catalogCities: s.catalogCities,
        displayCurrency: s.displayCurrency,
        usdToEurRate: s.usdToEurRate,
        baseFlightUSD: s.baseFlightUSD,
        includeBaseFlight: s.includeBaseFlight,
        highSpeedReservations: s.highSpeedReservations,
        reservationAvgCost: s.reservationAvgCost,
        mamaPaysMomTrip: s.mamaPaysMomTrip,
        esimPhoneNumber: s.esimPhoneNumber,
        appliedBenefits: s.appliedBenefits,
      }),
      /** Al subir DATA_VERSION se restaura el contenido curado de la app,
       *  pero el perfil de viajero y los ajustes del usuario se conservan. */
      merge: (persistedState, current) => {
        const p = persistedState as Partial<Persisted> | undefined;
        if (!p) return current;
        const stale = p.dataVersion !== DATA_VERSION;
        return {
          ...current,
          ...p,
          ...(stale
            ? {
                dataVersion: DATA_VERSION,
                tripStops: seedStops(),
                luggageItems: DEFAULT_LUGGAGE_ITEMS,
                sideQuests: DEFAULT_SIDE_QUESTS,
                customFacts: PREDEFINED_FACTS,
                catalogCities: BASE_CATALOG_CITIES,
              }
            : {}),
          // Siempre del usuario, pase lo que pase con la versión.
          travelProfile: p.travelProfile ?? current.travelProfile,
        };
      },
    },
  ),
);
