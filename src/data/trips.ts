/** Los viajes. Espejo de la carpeta `viajes/` del segundo cerebro
 *  (repo elamas-second-brain) — ahí vive la versión narrativa, acá la operativa.
 *  Orden: cronológico inverso, igual que el índice de la vault. */
import type { Trip, RouteStop } from '../types';
import { EUROPA_2026_STOPS } from './europa2026';

/** Construye una parada simple para los viajes históricos, donde solo se conoce
 *  la ciudad y las noches. Los campos de presupuesto van en 0: no hay dato y no
 *  se inventa (se ve como "sin dato" en la UI, no como "gratis"). */
function stop(
  id: string,
  city: string,
  nights: number,
  extra: Partial<RouteStop> = {},
): RouteStop {
  return {
    id,
    city,
    nights,
    transport: '',
    cost: 0,
    dailyBudget: 0,
    category: 'Hub / Familiar',
    costLvl: 'Medio',
    core: '',
    hack: '',
    ...extra,
  };
}

export const TRIPS: Trip[] = [
  {
    id: 'europa-2026',
    title: 'Europa 2026',
    emoji: '🌍',
    countries: ['ES', 'DE', 'NL', 'BE', 'CZ', 'AT', 'IT', 'GB'],
    startDate: '2026-06-24',
    endDate: '2026-09-08',
    dateLabel: '24 jun – 8 sep 2026',
    nights: 76,
    companions: ['Gerónimo', 'Dani', 'Mamá (Paula)', 'Laura (madrina)'],
    summary:
      '76 días, 8 países, 19 etapas. El viaje más largo y más solo hasta la fecha: ' +
      'arranca solo, pasa por Ibiza y Mallorca con amigos, Europa Central con mamá, ' +
      'y cierra el tramo final entero en soledad.',
    status: 'en-curso',
    vaultNote: 'europa-2026',
    stops: EUROPA_2026_STOPS,
    hasPlannerTools: true,
    confidence: 'alta',
  },
  {
    id: 'brasil-2026',
    title: 'Brasil — Río e Ilha Grande',
    emoji: '🇧🇷',
    countries: ['BR'],
    startDate: '2026-04-09',
    endDate: '2026-04-20',
    dateLabel: '9–20 abr 2026',
    nights: 11,
    companions: ['Gerónimo', 'Agus Oro'],
    summary:
      'Once noches en Brasil: la mayor parte en Río de Janeiro y los últimos días ' +
      'en Ilha Grande. Vuelos directos Flybondi desde Aeroparque.',
    photosAlbumUrl: 'https://photos.app.goo.gl/iMofqhVpt2mYnEhu9',
    lodgingLinks: [
      { label: 'Río de Janeiro', url: 'https://maps.app.goo.gl/mbD4AoizQ7D9MarT6' },
      { label: 'Ilha Grande', url: 'https://maps.app.goo.gl/3LBiLGggQ2r2BDXx7' },
    ],
    status: 'completado',
    vaultNote: 'brasil-rio-ilha-grande-2026',
    stops: [
      stop('br26-rio', 'Río de Janeiro (Brasil)', 7, {
        transport: 'Vuelo Flybondi FO 5902 (AEP 20:05 → GIG 23:00)',
        category: 'Aventura y Naturaleza',
      }),
      stop('br26-ilha', 'Ilha Grande (Brasil)', 4, {
        transport: 'Traslado terrestre + ferry desde Río',
        category: 'Aventura y Naturaleza',
        hack: 'El día exacto del corte Río→Ilha Grande es una reconstrucción; las fechas de vuelo sí son exactas.',
      }),
    ],
    confidence: 'alta',
  },
  {
    id: 'mar-del-plata-2026',
    title: 'Mar del Plata',
    emoji: '🏖️',
    countries: ['AR'],
    startDate: '2026-01-22',
    endDate: '2026-02-02',
    dateLabel: '22 ene – 2 feb 2026',
    nights: 11,
    companions: ['Manuel', 'Gerónimo'],
    summary: 'Once noches en la costa atlántica, en auto desde Buenos Aires.',
    photosAlbumUrl: 'https://photos.app.goo.gl/9nX4RWq1BgzupVpV8',
    status: 'completado',
    vaultNote: 'mar-del-plata-2026',
    stops: [
      stop('mdq26', 'Mar del Plata (Argentina)', 11, {
        transport: 'Auto desde Buenos Aires',
        category: 'Aventura y Naturaleza',
      }),
    ],
    confidence: 'alta',
  },
  {
    id: 'bariloche-2025',
    title: 'Bariloche',
    emoji: '🏔️',
    countries: ['AR'],
    startDate: '2025-12-09',
    endDate: '2025-12-16',
    dateLabel: '9–16 dic 2025',
    nights: 7,
    companions: ['Mati Baigorria', 'Gerónimo', 'Agus Oro', 'Juan Cruz Fernández', 'Pedro Trombotto', 'Pedro Nestares'],
    summary:
      'Siete noches en la Patagonia con el grupo de amigos emprendedores. ' +
      'Siete personas: el viaje más numeroso de los documentados.',
    photosAlbumUrl: 'https://photos.app.goo.gl/r1cZKwCajULPsQYq8',
    lodgingLinks: [
      { label: 'Centro de Bariloche', url: 'https://maps.app.goo.gl/nQgN63nVwn6Rnyhq8' },
    ],
    status: 'completado',
    vaultNote: 'bariloche-2025',
    stops: [
      stop('brc25', 'San Carlos de Bariloche (Argentina)', 7, {
        transport: 'Aerolíneas Argentinas 1676 (AEP 18:15 → BRC 20:40)',
        category: 'Aventura y Naturaleza',
        hotelName: 'Airbnb en el centro',
        confirmationNumber: '862644330300',
        hack: 'Vuelo comprado junto con Mati. El alojamiento figura "para 4" y el grupo era de 7: probablemente hubo un segundo alojamiento.',
      }),
    ],
    confidence: 'alta',
  },
  {
    id: 'chile-2025',
    title: 'Chile — Santiago',
    emoji: '🇨🇱',
    countries: ['CL'],
    startDate: '2025-04-30',
    endDate: '2025-05-01',
    dateLabel: '30 abr – 1 may 2025',
    nights: 1,
    companions: ['Mamá (Paula)', 'Tía'],
    summary:
      'Santiago de Chile con mamá y la tía. Las fechas están a confirmar: "30 al 1 de ' +
      'mayo" da una sola noche, que es muy poco para un viaje a Chile.',
    lodgingLinks: [
      { label: 'Hotel Plaza el Bosque Ebro', url: 'https://maps.app.goo.gl/hGub9sWzW6PUEsAN6' },
    ],
    status: 'completado',
    vaultNote: 'chile-santiago-2025',
    stops: [
      stop('cl25-scl', 'Santiago (Chile)', 1, {
        category: 'Hub / Familiar',
        hotelName: 'Hotel Plaza el Bosque Ebro',
        address: 'Ebro 2828, Las Condes',
      }),
    ],
    confidence: 'media',
  },
  {
    id: 'brasil-2025',
    title: 'Brasil — Río y Búzios',
    emoji: '🇧🇷',
    countries: ['BR'],
    startDate: '2025-02-18',
    endDate: '2025-02-25',
    dateLabel: '18–25 feb 2025',
    nights: 7,
    companions: ['Mamá (Paula)', 'Tía'],
    summary:
      'Siete noches con mamá y la tía: dos días en Río y el resto en Búzios. ' +
      'Sale de Aeroparque y vuelve a Ezeiza.',
    photosAlbumUrl: 'https://photos.app.goo.gl/z5furorJ7Ks5Dq148',
    lodgingLinks: [
      { label: 'Río de Janeiro', url: 'https://maps.app.goo.gl/G3rcZRBCxZ8ujdtT9' },
      { label: 'Búzios', url: 'https://maps.app.goo.gl/KJuryFXFHYDVEb647' },
    ],
    status: 'completado',
    vaultNote: 'brasil-rio-buzios-2025',
    stops: [
      stop('br25-rio', 'Río de Janeiro (Brasil)', 2, {
        transport: 'Vuelo desde AEP (18 feb, 14:00)',
        category: 'Hub / Familiar',
      }),
      stop('br25-buzios', 'Búzios (Brasil)', 5, {
        transport: 'Traslado terrestre desde Río',
        category: 'Aventura y Naturaleza',
        hack: 'El vuelo de vuelta sale de Río: el último día hay que volver de Búzios (~2h30-3h).',
      }),
    ],
    confidence: 'alta',
  },
  {
    id: 'cordoba-2025',
    title: 'Córdoba — Mina Clavero',
    emoji: '⛰️',
    countries: ['AR'],
    startDate: '2025-01-12',
    endDate: '2025-01-19',
    dateLabel: '12–19 ene 2025',
    nights: 7,
    companions: ['Juan', 'Benito', 'Molí'],
    summary: 'Siete noches en el Valle de Traslasierra, en auto con los amigos de la secundaria.',
    photosAlbumUrl: 'https://photos.app.goo.gl/YgBroyZ3rj8Y3Vkz8',
    lodgingLinks: [
      { label: 'Mina Clavero', url: 'https://maps.app.goo.gl/daXugy6RPRPjSZxbA' },
    ],
    status: 'completado',
    vaultNote: 'cordoba-mina-clavero-2025',
    stops: [
      stop('cba25', 'Mina Clavero (Argentina)', 7, {
        transport: 'Auto desde Buenos Aires',
        category: 'Aventura y Naturaleza',
      }),
    ],
    confidence: 'media',
  },
  {
    id: 'uruguay-2024',
    title: 'Uruguay — Punta del Este',
    emoji: '🇺🇾',
    countries: ['UY'],
    startDate: '2024-01-22',
    endDate: '2024-01-29',
    dateLabel: '22–29 ene 2024',
    nights: 7,
    companions: ['Equipo de Growth X'],
    summary:
      'Siete noches en Punta del Este con el equipo de Growth X, la academia donde ' +
      'trabajaba como closer ese verano. El único viaje de trabajo: el evento se llamó ' +
      '"La GrowthXperience".',
    lodgingLinks: [
      { label: 'Rincón del Este', url: 'https://maps.app.goo.gl/SQ46sxs6nYnHo3ec7' },
    ],
    status: 'completado',
    vaultNote: 'uruguay-punta-del-este-2024',
    stops: [
      stop('uy24-pde', 'Punta del Este (Uruguay)', 7, {
        transport: 'Ferry Colonia Express (Buenos Aires 08:30 → Colonia) + bus a Punta del Este',
        category: 'Premium & Networking',
        hotelName: 'Rincón del Este',
        confirmationNumber: '1596396',
        hack: 'Los ARS 90.253 de ferry y bus incluyen tasas (AGP, DNM, Ley 18057, migraciones). El alojamiento no tiene costo registrado: al ser viaje de empresa, parte pudo no salir de su bolsillo.',
      }),
    ],
    confidence: 'alta',
  },
  {
    id: 'europa-2015',
    title: 'Europa 2015 — el primero',
    emoji: '🗼',
    countries: ['FR', 'ES'],
    startDate: '',
    endDate: '',
    dateLabel: 'julio 2015 (~2 semanas)',
    nights: 14,
    companions: ['Familia'],
    summary:
      'El primer viaje a Europa, a los 10 años: París, Madrid y Barcelona. ' +
      'Queda muy poca data — no hay fechas exactas, orden de ciudades ni álbum de fotos.',
    lodgingLinks: [
      { label: 'París', url: 'https://maps.app.goo.gl/iMbDFw7BfE7enjrR7' },
      { label: 'Barcelona', url: 'https://maps.app.goo.gl/XTxL9gMb7bGfBDSG8' },
    ],
    status: 'completado',
    vaultNote: 'europa-2015',
    stops: [
      stop('eu15-par', 'París (Francia)', 0, { category: 'Premium & Networking' }),
      stop('eu15-mad', 'Madrid (España)', 0, { category: 'Hub / Familiar' }),
      stop('eu15-bcn', 'Barcelona (España)', 0, { category: 'Premium & Networking' }),
    ],
    confidence: 'baja',
  },
];

export const TRIPS_BY_ID: Record<string, Trip> = Object.fromEntries(
  TRIPS.map((t) => [t.id, t]),
);

/** El viaje que se abre por defecto: el que está en curso, si hay alguno. */
export const DEFAULT_TRIP_ID =
  TRIPS.find((t) => t.status === 'en-curso')?.id ?? TRIPS[0].id;

/** Cuántas veces aparece cada país en los viajes documentados.
 *  Alimenta la sugerencia de sincronización del perfil de viajero. */
/** Noches reales de un viaje. Se derivan de las paradas y solo se cae al total
 *  declarado cuando no hay reparto por parada (Europa 2015: sabemos que fueron
 *  ~2 semanas, pero no cuántas en cada ciudad). Así la card y el itinerario nunca
 *  muestran cifras distintas, ni siquiera después de editar las noches. */
export function tripNights(trip: Trip, stops?: RouteStop[]): number {
  const list = stops ?? trip.stops;
  const sum = list.reduce((a, s) => a + s.nights, 0);
  return sum > 0 ? sum : trip.nights;
}

/** Etiquetas de `companions` que describen un grupo, no una persona. Se declara
 *  junto a los datos que las usan, no en el componente que las cuenta. */
const GRUPOS = new Set(['Solo', 'Amigos', 'Familia']);

/** Personas distintas con las que viajó, sin contar etiquetas de grupo. */
export function uniqueCompanions(): string[] {
  return [...new Set(TRIPS.flatMap((t) => t.companions).filter((c) => !GRUPOS.has(c)))];
}

/** Países distintos de todos los viajes. */
export function allTripCountries(): string[] {
  return Object.keys(countryVisitsFromTrips());
}

export function countryVisitsFromTrips(): Record<string, number> {
  const out: Record<string, number> = {};
  for (const trip of TRIPS) {
    for (const iso of trip.countries) out[iso] = (out[iso] ?? 0) + 1;
  }
  return out;
}
