/** Modelo de datos del planner. La app pasó de un viaje a muchos: `Trip` es la
 *  entidad de primer nivel y todo lo específico de Europa 2026 cuelga de ese viaje. */

export type TripStatus = 'completado' | 'en-curso' | 'planificado';

/** Una parada del itinerario: ciudad + noches + costos + alojamiento. */
export interface RouteStop {
  id: string;
  city: string;
  nights: number;
  transport: string;
  cost: number;
  dailyBudget: number;
  category: string;
  costLvl: string;
  core: string;
  hack: string;
  isConfirmed?: boolean;
  isFixed?: boolean;
  hotelName?: string;
  address?: string;
  accommodationCost?: number;
  confirmationNumber?: string;
  flightDetails?: string;
  photosAlbumUrl?: string;
  lodgingConfirmation?: string;
  lodgingHost?: string;
  lodgingCheckIn?: string;
  lodgingCheckOut?: string;
  lodgingCheckInMethod?: string;
  lodgingContact?: string;
  lodgingCostNote?: string;
  itineraryQuestIds?: string[];
  isDaniTrip?: boolean;
  cashAlert?: boolean;
  isMomTrip?: boolean;
}

export interface Trip {
  id: string;
  title: string;
  emoji: string;
  /** ISO 3166-1 alpha-2 de los países visitados en este viaje. */
  countries: string[];
  startDate: string;          // YYYY-MM-DD ('' si solo se conoce el mes)
  endDate: string;
  /** Etiqueta legible cuando no hay fechas exactas (ej. "julio 2015"). */
  dateLabel: string;
  nights: number;
  companions: string[];
  summary: string;
  photosAlbumUrl?: string;
  lodgingLinks?: { label: string; url: string }[];
  status: TripStatus;
  /** Nota correspondiente en el segundo cerebro (carpeta viajes/). */
  vaultNote?: string;
  /** Itinerario detallado. Vacío en los viajes históricos sin ese nivel de dato. */
  stops: RouteStop[];
  /** Solo el viaje activo usa las herramientas de planificación
   *  (beneficios, hacks, valija, side quests). */
  hasPlannerTools?: boolean;
  /** Confianza del dato, espejo del frontmatter de la nota en la vault. */
  confidence: 'alta' | 'media' | 'baja';
}

export interface Benefit {
  id: string; title: string; sub: string; desc: string;
  /** Contienen markup (<strong>) — son contenido de la app, no input del usuario. */
  bullets: string[];
  howToUse: string;
  /** En EUR, como todos los montos guardados. */
  saving: number;
  cost: number;
  icon: string; color: string; badgeText: string;
}

export interface CatalogCity {
  id: string; name: string; category: string; costLvl: string;
  minDays: number; maxDays: number;
  /** Con quién encaja mejor ese destino ("Amigos", "Solo"…), no un flag. */
  dynamic: string;
  hack: string;
  budget: number; core: string; activities?: string[];
}

export interface Fact {
  id: string; title: string; cost: number; saving: number;
  category: string; desc: string; tip: string; isPredefined?: boolean;
}

export interface QuestItineraryEntry {
  day: string;
  title: string;
  desc: string;
  /** Algunas entradas ubican el punto exacto; otras solo describen el momento. */
  place?: string;
  lat?: number;
  lng?: number;
}

export interface SideQuest {
  id: string; title: string; totalCost: number; includedInBudget: boolean;
  days: number; details: Record<string, number>; itinerary: QuestItineraryEntry[];
  hacks: string[]; isDefault?: boolean; dateLabel?: string;
}

export interface LuggageItem { id: string; name: string; category: string; location: string }

/** Perfil de viajero: por país, cuántas veces fue y qué subdivisiones marcó. */
export interface CountryProfile { visits: number; subs: string[] }
export type TravelProfile = Record<string, CountryProfile>;
