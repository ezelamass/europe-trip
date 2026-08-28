import { CITY_COORDINATES } from './europa2026';

/** Coordenadas de las paradas que no están en el diccionario de Europa 2026.
 *  Sin esto, los cuatro viajes sudamericanos abrían el mapa vacío sobre los Alpes. */
const EXTRA: Record<string, [number, number]> = {
  'Río de Janeiro (Brasil)': [-22.906847, -43.172896],
  'Ilha Grande (Brasil)': [-23.150833, -44.203611],
  'Búzios (Brasil)': [-22.746944, -41.881944],
  'Mar del Plata (Argentina)': [-38.005477, -57.542611],
  'San Carlos de Bariloche (Argentina)': [-41.133308, -71.310432],
  'Mina Clavero (Argentina)': [-31.723056, -65.008889],
  'Buenos Aires (Argentina)': [-34.603722, -58.381592],
  // Faltaba en el diccionario original: la parada de Mallorca desaparecía del mapa
  // y partía la línea de la ruta (docs/06-roadmap.md la marcaba en la fase 0).
  'Palma de Mallorca (España)': [39.5696, 2.65016],
};

/** Normaliza "Palma de Mallorca (España) 🇪🇸" → "palma de mallorca": las claves
 *  traen país y a veces emoji, así que el match exacto fallaba. */
const cityKey = (city: string) =>
  city.split('(')[0].replace(/[^\p{L}\s.'-]/gu, '').trim().toLowerCase();

const BY_KEY: Record<string, [number, number]> = {};
for (const [name, xy] of Object.entries({ ...CITY_COORDINATES, ...EXTRA })) {
  BY_KEY[cityKey(name)] = xy;
}

/** Única fuente de coordenadas por nombre de ciudad. Vive en la capa de datos y no
 *  en el mapa: un componente de render no debería estar reconciliando diccionarios. */
export function coordsForCity(city: string): [number, number] | null {
  return BY_KEY[cityKey(city)] ?? null;
}
