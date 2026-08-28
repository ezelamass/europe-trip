import { SUBDIVISIONS } from '../data/worldMap';
import type { TravelProfile } from '../types';

/** Los montos se guardan siempre en EUR; la moneda de visualización es aparte.
 *  `usdToEurRate` = cuántos EUR vale 1 USD (su inversa convierte EUR → USD). */
const eurToUsdRate = (usdToEurRate: number) => (usdToEurRate ? 1 / usdToEurRate : 0);

export function fmtMoney(
  amountEur: number,
  currency: 'USD' | 'EUR',
  usdToEurRate: number,
  decimals = 0,
): string {
  const usd = currency === 'USD';
  const val = (Number(amountEur) || 0) * (usd ? eurToUsdRate(usdToEurRate) : 1);
  return (usd ? '$' : '€') + val.toFixed(decimals);
}

export function flagEmoji(iso: string): string {
  if (!iso || iso.length !== 2) return '🏳️';
  return iso
    .toUpperCase()
    .replace(/./g, (c) => String.fromCodePoint(127397 + c.charCodeAt(0)));
}

/** Icono y colores de una categoría, separados: pegarlos en un string obligaba al
 *  call site a partirlos de nuevo con `.split(' ')[0]`. */
export function getCategoryIcon(cat: string): { icon: string; chip: string } {
  switch (cat) {
    case 'Salud': return { icon: 'fa-file-medical', chip: 'text-emerald-400 bg-emerald-950/30' };
    case 'Transporte': return { icon: 'fa-train-subway', chip: 'text-blue-400 bg-blue-950/30' };
    case 'Hospedaje': return { icon: 'fa-hotel', chip: 'text-amber-400 bg-amber-950/30' };
    case 'Tip': return { icon: 'fa-lightbulb', chip: 'text-violet-400 bg-violet-950/30' };
    case 'Finanzas': return { icon: 'fa-wallet', chip: 'text-indigo-400 bg-indigo-950/30' };
    default: return { icon: 'fa-compass', chip: 'text-slate-400 bg-slate-900' };
  }
}

export function getCostBadgeColor(lvl: string): string {
  switch (lvl) {
    case 'Bajo': return 'bg-emerald-950/50 text-emerald-300 border-emerald-900/50';
    case 'Medio': return 'bg-blue-950/50 text-blue-300 border-blue-900/50';
    case 'Alto': return 'bg-amber-950/50 text-amber-300 border-amber-900/50';
    case 'Crítico': return 'bg-rose-950/50 text-rose-300 border-rose-900/50';
    default: return 'bg-slate-900 text-slate-300 border-slate-800';
  }
}

export const subsTotal = (iso: string): number => SUBDIVISIONS[iso]?.list.length ?? 0;

/** Códigos válidos por país, cacheados: se consultan una vez por país visitado en
 *  cada render del perfil y el Set era el mismo siempre. */
const VALID_SUBS = new Map<string, Set<string>>();
function validSubs(iso: string): Set<string> {
  let s = VALID_SUBS.get(iso);
  if (!s) {
    s = new Set((SUBDIVISIONS[iso]?.list ?? []).map((x) => x[0]));
    VALID_SUBS.set(iso, s);
  }
  return s;
}

export function subsVisited(iso: string, profile: TravelProfile): number {
  const entry = profile[iso];
  if (!entry || !Array.isArray(entry.subs)) return 0;
  const valid = validSubs(iso);
  return entry.subs.filter((c) => valid.has(c)).length;
}

/** Distancia great-circle en km (fórmula de Haversine). */
export function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

const MESES = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];
/** Igual, capitalizado, para las cards. Estaba escrito tres veces. */
export const MES_CORTO = MESES.map((m) => m[0].toUpperCase() + m.slice(1));

/** Ventana de una parada, acumulando noches desde el inicio del viaje. Es la única
 *  implementación de esta aritmética: formatearla y ubicarla en el tiempo son dos
 *  lecturas del mismo rango, y tenerlas separadas era mantener el mismo cálculo dos veces. */
export function stopRange(
  startDate: string,
  nightsBefore: number,
  nights: number,
): { from: Date | null; to: Date | null } {
  if (!startDate) return { from: null, to: null };
  const from = new Date(startDate + 'T00:00:00');
  from.setDate(from.getDate() + nightsBefore);
  const to = new Date(from);
  to.setDate(to.getDate() + nights);
  return { from, to };
}

export function formatRange(from: Date | null, to: Date | null, nights: number): string {
  if (!from || !to) return '';
  const f = (d: Date) => `${d.getDate()} ${MESES[d.getMonth()]}`;
  return nights > 0 ? `${f(from)} – ${f(to)}` : f(from);
}

/** Escapa texto antes de inyectarlo como HTML (los popups de Leaflet reciben string).
 *  Los nombres de parada pueden venir de un respaldo importado o del estado viejo. */
export function escapeHTML(s: string): string {
  return String(s).replace(/[&<>"']/g, (c) =>
    ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!,
  );
}
