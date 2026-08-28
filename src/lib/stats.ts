import { TRIPS, tripNights, uniqueCompanions, allTripCountries } from '../data/trips';
import { COUNTRIES } from '../data/worldMap';
import { coordsForCity } from '../data/coordinates';
import { countryOfStop } from '../data/countryOfStop';
import { calculateDistance } from './format';
import type { Trip } from '../types';

export interface YearNights { year: string; nights: number }
export interface Ranked { name: string; count: number }

/** Año de un viaje. Europa 2015 no tiene fecha exacta, solo la etiqueta. */
function yearOf(t: Trip): string {
  if (t.startDate) return t.startDate.slice(0, 4);
  const m = t.dateLabel.match(/\b(19|20)\d{2}\b/);
  return m ? m[0] : '—';
}

/** Kilómetros en línea recta entre paradas consecutivas de un viaje.
 *  Es una cota inferior: no cuenta desvíos ni el vuelo desde Buenos Aires. */
export function tripKm(t: Trip, stops = t.stops): number {
  let total = 0;
  let prev: [number, number] | null = null;
  for (const s of stops) {
    const c = coordsForCity(s.city);
    if (!c) continue;
    if (prev) total += calculateDistance(prev[0], prev[1], c[0], c[1]);
    prev = c;
  }
  return total;
}

export interface TravelStats {
  trips: number;
  nights: number;
  countries: number;
  continents: number;
  km: number;
  nightsByYear: YearNights[];
  companions: Ranked[];
  nightsByCountry: Ranked[];
  longest: { trip: Trip; nights: number };
  shortest: { trip: Trip; nights: number };
  firstYear: string;
}

export function computeStats(stopsByTrip: Record<string, typeof TRIPS[number]['stops']>): TravelStats {
  const nightsOf = (t: Trip) => tripNights(t, stopsByTrip[t.id]);

  const byYear = new Map<string, number>();
  const byCompanion = new Map<string, number>();
  const byCountry = new Map<string, number>();
  let km = 0;

  for (const t of TRIPS) {
    const n = nightsOf(t);
    byYear.set(yearOf(t), (byYear.get(yearOf(t)) ?? 0) + n);
    km += tripKm(t, stopsByTrip[t.id] ?? t.stops);
    for (const c of t.companions) byCompanion.set(c, (byCompanion.get(c) ?? 0) + 1);
    // Cuando las paradas dicen el país, las noches se cuentan donde de verdad
    // pasaron. Solo se reparte en partes iguales cuando no hay ese dato.
    const stops = stopsByTrip[t.id] ?? t.stops;
    const conPais = stops.filter((s) => countryOfStop(s.city) && s.nights > 0);
    if (conPais.length) {
      for (const s of conPais) {
        const iso = countryOfStop(s.city)!;
        byCountry.set(iso, (byCountry.get(iso) ?? 0) + s.nights);
      }
    } else {
      const share = n / (t.countries.length || 1);
      for (const iso of t.countries) byCountry.set(iso, (byCountry.get(iso) ?? 0) + share);
    }
  }

  const sorted = [...TRIPS].sort((a, b) => nightsOf(a) - nightsOf(b));
  const grupos = new Set(['Solo', 'Amigos', 'Familia']);

  return {
    trips: TRIPS.length,
    nights: TRIPS.reduce((a, t) => a + nightsOf(t), 0),
    countries: allTripCountries().length,
    continents: new Set(allTripCountries().map((iso) => COUNTRIES[iso]?.c).filter(Boolean)).size,
    km: Math.round(km),
    nightsByYear: [...byYear.entries()]
      .map(([year, nights]) => ({ year, nights }))
      .sort((a, b) => a.year.localeCompare(b.year)),
    companions: [...byCompanion.entries()]
      .filter(([name]) => !grupos.has(name))
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name)),
    nightsByCountry: [...byCountry.entries()]
      .map(([iso, nights]) => ({ name: iso, count: Math.round(nights) }))
      .sort((a, b) => b.count - a.count),
    longest: { trip: sorted[sorted.length - 1], nights: nightsOf(sorted[sorted.length - 1]) },
    shortest: { trip: sorted[0], nights: nightsOf(sorted[0]) },
    firstYear: [...byYear.keys()].sort()[0] ?? '—',
  };
}

export { uniqueCompanions };
