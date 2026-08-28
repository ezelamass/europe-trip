import type { Fact, LuggageItem, RouteStop, SideQuest, TravelProfile } from '../types';
import { DEFAULT_SIDE_QUESTS, PREDEFINED_FACTS } from '../data/europa2026';

/** Clave que usaba la app de HTML puro. La nueva guarda en `eurotrip-state`,
 *  así que sin este puente el celular de Eze perdía su perfil de viajero
 *  (países y regiones cargados a mano) la primera vez que abriera la versión React. */
const LEGACY_KEY = 'eurotrip_state_lego';
const NEW_KEY = 'eurotrip-state';
/** Se guarda intacta la copia vieja antes de tocar nada: si la migración sale mal,
 *  el dato original sigue estando. Es la red de seguridad que pedía docs/06-roadmap. */
const BACKUP_KEY = 'eurotrip_state_lego_backup';

interface LegacyState {
  dataVersion?: string;
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

/** Lo mismo que guardaba la app vieja, menos lo que no se migra tal cual:
 *  `dataVersion` (solo servía para decidir) y `routeStops` (ver la nota abajo). */
export interface MigratedLegacy extends Omit<LegacyState, 'dataVersion' | 'routeStops'> {
  /** Álbumes de fotos por id de parada, rescatados del itinerario viejo. */
  photoAlbums?: Record<string, string>;
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

    // El itinerario NO se migra tal cual, a propósito. La app vieja solo restauraba
    // `routeStops` cuando la `dataVersion` guardada coincidía con la publicada; si no,
    // volvía al itinerario hardcodeado y rescataba únicamente los álbumes de fotos.
    // Copiarlo entero acá pisaría con datos viejos las correcciones de alojamiento y
    // transporte que se fueron publicando (Nápoles, Sorrento, el FlixBus…).
    if (Array.isArray(old.routeStops)) {
      const albums: Record<string, string> = {};
      for (const s of old.routeStops) {
        if (s && typeof s.id === 'string' && typeof s.photosAlbumUrl === 'string') {
          albums[s.id] = s.photosAlbumUrl;
        }
      }
      if (Object.keys(albums).length) out.photoAlbums = albums;
    }

    if (Array.isArray(old.luggageItems) && old.luggageItems.length) out.luggageItems = old.luggageItems;

    // La app vieja guardaba en `customFacts` SOLO los hacks que agregó el usuario, y
    // en pantalla mostraba `[...PREDEFINED_FACTS, ...customFacts]`. Acá la lista es una
    // sola, así que hay que reponer los predefinidos o desaparecen del tab Hacks.
    if (Array.isArray(old.customFacts) && old.customFacts.length) {
      const propios = old.customFacts.filter((f) => f && !f.isPredefined);
      out.customFacts = [...PREDEFINED_FACTS, ...propios];
    }

    // Ídem con las side quests: el loader viejo reinyectaba las que faltaban.
    if (Array.isArray(old.sideQuests) && old.sideQuests.length) {
      const guardadas = old.sideQuests.filter(Boolean);
      const ids = new Set(guardadas.map((q) => q.id));
      out.sideQuests = [...DEFAULT_SIDE_QUESTS.filter((q) => !ids.has(q.id)), ...guardadas];
    }

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
