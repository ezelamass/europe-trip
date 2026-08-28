import type { Fact, LuggageItem, RouteStop, SideQuest, TravelProfile } from '../types';

/** Clave que usaba la app de HTML puro. La nueva guarda en `eurotrip-state`,
 *  así que sin este puente el celular de Eze perdía su perfil de viajero
 *  (países y regiones cargados a mano) la primera vez que abriera la versión React. */
const LEGACY_KEY = 'eurotrip_state_lego';
const NEW_KEY = 'eurotrip-state';
/** Se guarda intacta la copia vieja antes de tocar nada: si la migración sale mal,
 *  el dato original sigue estando. Es la red de seguridad que pedía docs/06-roadmap. */
const BACKUP_KEY = 'eurotrip_state_lego_backup';

interface LegacyState {
  travelProfile?: TravelProfile;
  routeStops?: RouteStop[];
  luggageItems?: LuggageItem[];
  sideQuests?: SideQuest[];
  customFacts?: Fact[];
  appliedBenefits?: Record<string, boolean>;
  displayCurrency?: 'USD' | 'EUR';
  usdToEurRate?: number;
  baseFlightUSD?: number;
  includeBaseFlight?: boolean;
  highSpeedReservations?: number;
  mamaPaysMomTrip?: boolean;
  esimPhoneNumber?: string;
}

export interface MigratedLegacy {
  travelProfile?: TravelProfile;
  europaStops?: RouteStop[];
  luggageItems?: LuggageItem[];
  sideQuests?: SideQuest[];
  customFacts?: Fact[];
  appliedBenefits?: Record<string, boolean>;
  displayCurrency?: 'USD' | 'EUR';
  usdToEurRate?: number;
  baseFlightUSD?: number;
  includeBaseFlight?: boolean;
  highSpeedReservations?: number;
  mamaPaysMomTrip?: boolean;
  esimPhoneNumber?: string;
}

/**
 * Lee el estado de la app vieja una única vez: solo corre si todavía no hay
 * estado nuevo guardado. Devuelve `null` cuando no hay nada que migrar o cuando
 * el JSON viejo está corrupto — en ningún caso rompe el arranque de la app.
 */
export function readLegacyState(): MigratedLegacy | null {
  if (typeof localStorage === 'undefined') return null;
  try {
    // Si ya existe estado nuevo, la migración ya pasó (o el usuario arrancó de cero).
    if (localStorage.getItem(NEW_KEY)) return null;

    const raw = localStorage.getItem(LEGACY_KEY);
    if (!raw) return null;

    if (!localStorage.getItem(BACKUP_KEY)) localStorage.setItem(BACKUP_KEY, raw);

    const old = JSON.parse(raw) as LegacyState;
    const out: MigratedLegacy = {};

    if (old.travelProfile && typeof old.travelProfile === 'object') {
      out.travelProfile = old.travelProfile;
    }
    // El viaje único de la app vieja es el que hoy se llama `europa-2026`.
    if (Array.isArray(old.routeStops) && old.routeStops.length) {
      out.europaStops = old.routeStops;
    }
    if (Array.isArray(old.luggageItems) && old.luggageItems.length) out.luggageItems = old.luggageItems;
    if (Array.isArray(old.sideQuests) && old.sideQuests.length) out.sideQuests = old.sideQuests;
    if (Array.isArray(old.customFacts) && old.customFacts.length) out.customFacts = old.customFacts;

    for (const k of [
      'appliedBenefits',
      'displayCurrency',
      'usdToEurRate',
      'baseFlightUSD',
      'includeBaseFlight',
      'highSpeedReservations',
      'mamaPaysMomTrip',
      'esimPhoneNumber',
    ] as const) {
      if (old[k] !== undefined) (out as Record<string, unknown>)[k] = old[k];
    }

    return Object.keys(out).length ? out : null;
  } catch {
    // Un localStorage corrupto o bloqueado no puede impedir que la app abra.
    return null;
  }
}
