import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type {
  Fact, LuggageItem, RouteStop, SideQuest, TravelProfile, CountryProfile,
} from '../types';
import {
  DEFAULT_LUGGAGE_ITEMS,
  DEFAULT_SIDE_QUESTS,
  DEFAULT_TRAVEL_PROFILE,
  PREDEFINED_FACTS,
} from '../data/europa2026';
import { TRIPS, DEFAULT_TRIP_ID, allTripCountries } from '../data/trips';
import { readLegacyState } from './legacy';
import type { ViewCode } from '../data/worldMap';

/** Subir esto fuerza a que la data hardcodeada (itinerarios, valija, quests)
 *  pise lo guardado en el celular. El perfil de viajero NUNCA se pisa:
 *  son datos que cargó el usuario, no contenido de la app. */
export const DATA_VERSION = '2026-09-05-free-tour';

/** `home`, `trips`, `world` y `stats` están en la barra inferior; el resto son
 *  herramientas de un viaje, a las que se entra desde Inicio. */
export type TabId =
  | 'home' | 'trips' | 'world' | 'stats'
  | 'benefits' | 'hacks' | 'quests' | 'luggage';

interface Persisted {
  dataVersion: string;
  activeTripId: string;
  /** Itinerarios editados por el usuario, por viaje. */
  tripStops: Record<string, RouteStop[]>;
  travelProfile: TravelProfile;
  luggageItems: LuggageItem[];
  sideQuests: SideQuest[];
  customFacts: Fact[];
  displayCurrency: 'USD' | 'EUR';
  usdToEurRate: number;
  baseFlightUSD: number;
  includeBaseFlight: boolean;
  highSpeedReservations: number;
  mamaPaysMomTrip: boolean;
  appliedBenefits: Record<string, boolean>;
  /** Álbumes de fotos por id de parada. Los carga el usuario (o vienen de la app
   *  vieja), así que viven fuera de `tripStops`: ahí los borraría cada bump de
   *  DATA_VERSION, que es justo lo que reseteo del itinerario tiene que hacer. */
  photoAlbums: Record<string, string>;
}

interface Store extends Persisted {
  // UI (no se persiste salvo activeTripId)
  activeTab: TabId;
  profileContinent: ViewCode;

  setTab: (t: TabId) => void;
  setActiveTrip: (id: string) => void;
  setProfileContinent: (c: ViewCode) => void;

  // Itinerario del viaje activo
  updateStop: (tripId: string, stopId: string, patch: Partial<RouteStop>) => void;
  removeStop: (tripId: string, stopId: string) => void;
  moveStop: (tripId: string, stopId: string, dir: -1 | 1) => void;
  resetStops: (tripId: string) => void;

  // Perfil de viajero
  toggleCountryVisited: (iso: string) => void;
  /** Marca visitado sin poder borrar: el selector no es un control destructivo. */
  addCountryVisited: (iso: string) => void;
  adjustCountryVisits: (iso: string, delta: number) => void;
  toggleSubdivision: (iso: string, sub: string) => void;
  syncProfileFromTrips: () => number;

  // Valija
  addLuggageItem: (item: LuggageItem) => void;
  deleteLuggageItem: (id: string) => void;
  setLuggageLocation: (id: string, location: string) => void;

  // Quests y facts
  toggleQuestBudget: (id: string) => void;
  addFact: (f: Fact) => void;
  deleteFact: (id: string) => void;
  clearCustomFacts: () => void;

  // Ajustes
  setCurrency: (c: 'USD' | 'EUR') => void;
  toggleBaseFlight: () => void;
  toggleMomInvitation: () => void;
  setReservations: (n: number) => void;
  toggleBenefit: (id: string) => void;

  // Respaldo
  exportState: () => string;
  importState: (json: string) => { ok: boolean; error?: string };
}

const seedStops = (): Record<string, RouteStop[]> =>
  Object.fromEntries(TRIPS.map((t) => [t.id, t.stops.map((s) => ({ ...s }))]));

/** Une el itinerario curado con los álbumes que cargó el usuario. Se hace en la
 *  lectura y no al sembrar, para que un bump de DATA_VERSION reponga las paradas
 *  sin llevarse puestos los álbumes. */
export function withPhotoAlbums(
  stops: RouteStop[],
  albums: Record<string, string>,
): RouteStop[] {
  return stops.map((s) =>
    albums[s.id] && !s.photosAlbumUrl ? { ...s, photosAlbumUrl: albums[s.id] } : s,
  );
}

/** Estado de la app vieja, si es la primera vez que se abre esta versión. */
const legacy = readLegacyState();

const initial: Persisted = {
  dataVersion: DATA_VERSION,
  activeTripId: DEFAULT_TRIP_ID,
  tripStops: seedStops(),
  photoAlbums: legacy?.photoAlbums ?? {},
  travelProfile: legacy?.travelProfile ?? DEFAULT_TRAVEL_PROFILE,
  luggageItems: legacy?.luggageItems ?? DEFAULT_LUGGAGE_ITEMS,
  sideQuests: legacy?.sideQuests ?? DEFAULT_SIDE_QUESTS,
  customFacts: legacy?.customFacts ?? PREDEFINED_FACTS,
  displayCurrency: legacy?.displayCurrency ?? 'USD',
  usdToEurRate: legacy?.usdToEurRate ?? 0.8757,
  baseFlightUSD: legacy?.baseFlightUSD ?? 1076,
  includeBaseFlight: legacy?.includeBaseFlight ?? true,
  highSpeedReservations: legacy?.highSpeedReservations ?? 3,
  mamaPaysMomTrip: legacy?.mamaPaysMomTrip ?? false,
  appliedBenefits: legacy?.appliedBenefits ?? {
    veranoJoven: true, tse: true, museos: true, abonoMadrid: true, eyca: true,
  },
};

export const useStore = create<Store>()(
  persist(
    (set, get) => ({
      ...initial,
      activeTab: 'home',
      profileContinent: 'WORLD',

      setTab: (activeTab) => set({ activeTab }),
      setActiveTrip: (activeTripId) => set({ activeTripId }),
      setProfileContinent: (profileContinent) => set({ profileContinent }),

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

      addCountryVisited: (iso) =>
        set((s) =>
          s.travelProfile[iso]
            ? s
            : { travelProfile: { ...s.travelProfile, [iso]: { visits: 1, subs: [] } } },
        ),

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
        for (const iso of allTripCountries()) {
          if (!p[iso]) {
            p[iso] = { visits: 1, subs: [] };
            added++;
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

      addFact: (f) => set((s) => ({ customFacts: [...s.customFacts, f] })),
      deleteFact: (id) => set((s) => ({ customFacts: s.customFacts.filter((f) => f.id !== id) })),
      clearCustomFacts: () =>
        set((s) => ({ customFacts: s.customFacts.filter((f) => f.isPredefined) })),

      setCurrency: (displayCurrency) => set({ displayCurrency }),
      toggleBaseFlight: () => set((s) => ({ includeBaseFlight: !s.includeBaseFlight })),
      toggleMomInvitation: () => set((s) => ({ mamaPaysMomTrip: !s.mamaPaysMomTrip })),
      setReservations: (n) => set({ highSpeedReservations: Math.max(0, Math.min(99, Math.round(n))) }),
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
            photoAlbums: s.photoAlbums,
          },
          null,
          2,
        );
      },

      /** Restaura un respaldo. Cada campo se valida antes de escribirlo: un archivo
       *  truncado o editado a mano no puede dejar el estado en una forma que rompa
       *  el render, porque zustand lo persiste al instante y la pantalla en blanco
       *  sería permanente — justo en la función que existe para evitar perder datos. */
      importState: (json) => {
        let data: Record<string, unknown>;
        try {
          data = JSON.parse(json) as Record<string, unknown>;
        } catch {
          return { ok: false, error: 'El archivo no es un JSON válido.' };
        }
        if (!data || typeof data !== 'object' || Array.isArray(data)) {
          return { ok: false, error: 'El archivo no es un respaldo de esta app.' };
        }

        const isObj = (v: unknown) => !!v && typeof v === 'object' && !Array.isArray(v);
        const patch: Partial<Persisted> = {};

        if (data.travelProfile !== undefined) {
          if (!isObj(data.travelProfile)) return { ok: false, error: 'El perfil de viajero del respaldo está dañado.' };
          const entries = Object.entries(data.travelProfile as Record<string, unknown>)
            .filter(([, v]) => isObj(v) && Array.isArray((v as CountryProfile).subs))
            .map(([k, v]) => [k, {
              visits: Number((v as CountryProfile).visits) || 1,
              subs: ((v as CountryProfile).subs as unknown[]).filter((x): x is string => typeof x === 'string'),
            }] as const);
          patch.travelProfile = Object.fromEntries(entries);
        }

        if (data.tripStops !== undefined) {
          if (!isObj(data.tripStops)) return { ok: false, error: 'Los itinerarios del respaldo están dañados.' };
          const entries = Object.entries(data.tripStops as Record<string, unknown>)
            .filter(([, v]) => Array.isArray(v))
            // `nights` tiene que ser un número: sin esto, un respaldo truncado
            // propagaba NaN al presupuesto y a las fechas ("NaN NaN – NaN NaN").
            .map(([k, v]) => [
              k,
              (v as RouteStop[])
                .filter((s) => isObj(s) && typeof s.id === 'string')
                .map((s) => ({
                  ...s,
                  nights: Number.isFinite(Number(s.nights)) ? Number(s.nights) : 0,
                  cost: Number(s.cost) || 0,
                  dailyBudget: Number(s.dailyBudget) || 0,
                  accommodationCost: Number(s.accommodationCost) || 0,
                })),
            ] as const);
          patch.tripStops = { ...seedStops(), ...Object.fromEntries(entries) };
        }

        for (const k of ['luggageItems', 'sideQuests', 'customFacts'] as const) {
          if (data[k] === undefined) continue;
          if (!Array.isArray(data[k])) return { ok: false, error: `El campo "${k}" del respaldo está dañado.` };
          (patch as Record<string, unknown>)[k] = (data[k] as unknown[]).filter(isObj);
        }

        if (data.photoAlbums !== undefined) {
          if (!isObj(data.photoAlbums)) return { ok: false, error: 'Los álbumes del respaldo están dañados.' };
          patch.photoAlbums = Object.fromEntries(
            Object.entries(data.photoAlbums as Record<string, unknown>)
              .filter(([, v]) => typeof v === 'string'),
          ) as Record<string, string>;
        }

        if (data.appliedBenefits !== undefined) {
          if (!isObj(data.appliedBenefits)) return { ok: false, error: 'Los beneficios del respaldo están dañados.' };
          patch.appliedBenefits = data.appliedBenefits as Record<string, boolean>;
        }

        if (data.displayCurrency === 'USD' || data.displayCurrency === 'EUR') {
          patch.displayCurrency = data.displayCurrency;
        }
        for (const k of ['usdToEurRate', 'baseFlightUSD', 'highSpeedReservations'] as const) {
          const v = Number(data[k]);
          if (Number.isFinite(v) && v >= 0) patch[k] = v;
        }
        for (const k of ['includeBaseFlight', 'mamaPaysMomTrip'] as const) {
          if (typeof data[k] === 'boolean') patch[k] = data[k] as boolean;
        }

        if (!Object.keys(patch).length) {
          return { ok: false, error: 'El archivo no contiene datos que se puedan restaurar.' };
        }
        set(patch as Partial<Store>);
        return { ok: true };
      },
    }),
    {
      name: 'eurotrip-state',
      // Sin `version`: zustand, ante un número distinto y sin `migrate`, descarta el
      // estado guardado. La app ya versiona su contenido con DATA_VERSION + `merge`,
      // que sí sabe qué conservar; tener dos mecanismos era un pie en la trampa.
      partialize: (s): Persisted => ({
        dataVersion: s.dataVersion,
        activeTripId: s.activeTripId,
        tripStops: s.tripStops,
        travelProfile: s.travelProfile,
        luggageItems: s.luggageItems,
        sideQuests: s.sideQuests,
        customFacts: s.customFacts,
        displayCurrency: s.displayCurrency,
        usdToEurRate: s.usdToEurRate,
        baseFlightUSD: s.baseFlightUSD,
        includeBaseFlight: s.includeBaseFlight,
        highSpeedReservations: s.highSpeedReservations,
        mamaPaysMomTrip: s.mamaPaysMomTrip,
        appliedBenefits: s.appliedBenefits,
        photoAlbums: s.photoAlbums,
      }),
      /** Al subir DATA_VERSION se restaura el contenido curado de la app —
       *  pero solo el curado. Lo que agregó el usuario (ítems de valija, hacks y
       *  side quests propios) se conserva: una corrección de contenido no puede
       *  borrar datos que cargó una persona. El perfil de viajero nunca se toca. */
      merge: (persistedState, current) => {
        const p = persistedState as Partial<Persisted> | undefined;
        if (!p) return current;
        if (p.dataVersion === DATA_VERSION) return { ...current, ...p };

        // Lo propio del usuario se distingue por no estar entre los defaults.
        const idsDe = (xs: { id: string }[]) => new Set(xs.map((x) => x.id));
        const luggageDefaults = idsDe(DEFAULT_LUGGAGE_ITEMS);
        const questDefaults = idsDe(DEFAULT_SIDE_QUESTS);

        const propios = <T extends { id: string }>(xs: T[] | undefined, defaults: Set<string>) =>
          (xs ?? []).filter((x) => x && !defaults.has(x.id));

        return {
          ...current,
          ...p,
          dataVersion: DATA_VERSION,
          tripStops: seedStops(),
          luggageItems: [...DEFAULT_LUGGAGE_ITEMS, ...propios(p.luggageItems, luggageDefaults)],
          sideQuests: [...DEFAULT_SIDE_QUESTS, ...propios(p.sideQuests, questDefaults)],
          customFacts: [
            ...PREDEFINED_FACTS,
            ...(p.customFacts ?? []).filter((f) => f && !f.isPredefined),
          ],
          // Siempre del usuario, pase lo que pase con la versión.
          travelProfile: p.travelProfile ?? current.travelProfile,
          photoAlbums: p.photoAlbums ?? current.photoAlbums,
        };
      },
    },
  ),
);
