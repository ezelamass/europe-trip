import { COUNTRIES } from './worldMap';

/** Los nombres de parada traen el país entre paréntesis ("Roma (Italia) 🇮🇹"),
 *  salvo alguna excepción ("Pueblos del Norte de España"). Resolverlo permite
 *  contar noches por país de verdad, en vez de repartir el total en partes iguales. */

const norm = (s: string) =>
  s.normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-zA-Z\s]/g, ' ')
    .replace(/\s+/g, ' ').trim().toLowerCase();

/** Formas que usan las paradas y que no coinciden con el nombre de `worldMap`. */
const ALIAS: Record<string, string> = {
  'rep checa': 'CZ',
  'republica checa': 'CZ',
  'holanda': 'NL',
  'inglaterra': 'GB',
};

const BY_NAME: [string, string][] = [
  ...Object.entries(COUNTRIES).map(([iso, m]) => [norm(m.n), iso] as [string, string]),
  ...Object.entries(ALIAS).map(([n, iso]) => [norm(n), iso] as [string, string]),
].sort((a, b) => b[0].length - a[0].length); // el nombre más largo gana

export function countryOfStop(city: string): string | null {
  const paren = city.match(/\(([^)]+)\)/)?.[1];
  if (paren) {
    const n = norm(paren);
    const hit = BY_NAME.find(([name]) => name === n);
    if (hit) return hit[1];
  }
  // Sin paréntesis: se busca cualquier nombre de país dentro del texto.
  const full = norm(city);
  return BY_NAME.find(([name]) => full.includes(name))?.[1] ?? null;
}
