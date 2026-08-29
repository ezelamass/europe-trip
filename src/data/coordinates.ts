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
  'Punta del Este (Uruguay)': [-34.9527, -54.9385],
  'Santiago (Chile)': [-33.4489, -70.6693],
  'Florianópolis (Brasil)': [-27.5954, -48.548],
  'Colonia del Sacramento (Uruguay)': [-34.4726, -57.844],
  // Faltaba en el diccionario original: la parada de Mallorca desaparecía del mapa
  // y partía la línea de la ruta (docs/06-roadmap.md la marcaba en la fase 0).
  'Palma de Mallorca (España)': [39.5696, 2.65016],
};

/** Normaliza sin tirar el paréntesis: "Palma de Mallorca (España) 🇪🇸" y
 *  "Palma de Mallorca (España)" tienen que dar la misma clave, pero
 *  "Parada de Tránsito (Praga)" y "(Múnich)" NO — truncar ahí las colapsaba en una
 *  sola y el marcador caía 280 km en otro país. */
const norm = (s: string) =>
  s.replace(/[^\p{L}\p{N}\s.'()-]/gu, '').replace(/\s+/g, ' ').trim().toLowerCase();

/** Clave sin el paréntesis, para poder resolver una parada que no lo trae. */
const bare = (s: string) => norm(s.split('(')[0]);

const FULL: Record<string, [number, number]> = {};
const BARE: Record<string, [number, number]> = {};
for (const [name, xy] of Object.entries({ ...CITY_COORDINATES, ...EXTRA })) {
  FULL[norm(name)] = xy;
  const b = bare(name);
  // Solo se indexa por nombre pelado si no hay ambigüedad.
  if (b in BARE) delete BARE[b];
  else BARE[b] = xy;
}

/** Única fuente de coordenadas por nombre de ciudad. Vive en la capa de datos y no
 *  en el mapa: un componente de render no debería estar reconciliando diccionarios. */
export function coordsForCity(city: string): [number, number] | null {
  return FULL[norm(city)] ?? BARE[bare(city)] ?? null;
}
