import { SUBDIVISIONS } from '../data/worldMap';
import type { TravelProfile } from '../types';

/** Los montos se guardan siempre en EUR; la moneda de visualización es aparte.
 *  `usdToEurRate` = cuántos EUR vale 1 USD (su inversa convierte EUR → USD). */
export const eurToUsdRate = (usdToEurRate: number) => (usdToEurRate ? 1 / usdToEurRate : 0);

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

export const curSym = (currency: 'USD' | 'EUR') => (currency === 'USD' ? '$' : '€');

/** Convierte lo que el usuario tipeó (en la moneda visible) a EUR para guardarlo. */
export function inputToEur(amount: number, currency: 'USD' | 'EUR', usdToEurRate: number): number {
  const v = Number(amount) || 0;
  return currency === 'USD' ? v * usdToEurRate : v;
}

export function eurToInput(
  amountEur: number,
  currency: 'USD' | 'EUR',
  usdToEurRate: number,
  decimals = 2,
): number {
  const usd = currency === 'USD';
  const v = (Number(amountEur) || 0) * (usd ? eurToUsdRate(usdToEurRate) : 1);
  return Number(v.toFixed(decimals));
}

export function flagEmoji(iso: string): string {
  if (!iso || iso.length !== 2) return '🏳️';
  return iso
    .toUpperCase()
    .replace(/./g, (c) => String.fromCodePoint(127397 + c.charCodeAt(0)));
}

export function getCategoryIcon(cat: string): string {
  switch (cat) {
    case 'Salud': return 'fa-file-medical text-emerald-400 bg-emerald-950/30';
    case 'Transporte': return 'fa-train-subway text-blue-400 bg-blue-950/30';
    case 'Hospedaje': return 'fa-hotel text-amber-400 bg-amber-950/30';
    case 'Tip': return 'fa-lightbulb text-violet-400 bg-violet-950/30';
    case 'Finanzas': return 'fa-wallet text-indigo-400 bg-indigo-950/30';
    default: return 'fa-compass text-slate-400 bg-slate-900';
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

export function subsVisited(iso: string, profile: TravelProfile): number {
  const entry = profile[iso];
  if (!entry || !Array.isArray(entry.subs)) return 0;
  const valid = new Set((SUBDIVISIONS[iso]?.list ?? []).map((x) => x[0]));
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

/** Fechas de cada parada, acumulando noches desde el inicio del viaje. */
export function stopDates(startDate: string, nightsBefore: number, nights: number): string {
  if (!startDate) return '';
  const start = new Date(startDate + 'T00:00:00');
  const from = new Date(start);
  from.setDate(from.getDate() + nightsBefore);
  const to = new Date(from);
  to.setDate(to.getDate() + nights);
  const f = (d: Date) => `${d.getDate()} ${MESES[d.getMonth()]}`;
  return nights > 0 ? `${f(from)} – ${f(to)}` : f(from);
}
