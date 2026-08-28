import type { Fact, RouteStop, SideQuest } from '../types';

/** Aplica los descuentos por beneficio activo. Un hack declara con qué beneficio
 *  se abarata (`halfPriceWith`) y cuál es su precio de lista (`fullPrice`); acá no
 *  hay ningún id especial. La app vieja recalculaba esto en cada render, y
 *  congelarlo dejaba el Interrail diciendo €429 mientras su texto prometía €214,50. */
export function withDynamicCosts(facts: Fact[], benefits: Record<string, boolean>): Fact[] {
  return facts.map((f) => {
    if (!f.halfPriceWith) return f;
    const full = f.fullPrice ?? f.cost;
    const activo = !!benefits[f.halfPriceWith];
    return { ...f, cost: activo ? full / 2 : full, saving: activo ? full / 2 : 0 };
  });
}

/** Costo promedio de una reserva de asiento en alta velocidad. Antes se persistía
 *  en el localStorage sin setter: un valor guardado viejo habría congelado el número
 *  para siempre si acá cambiara. */
export const RESERVATION_AVG_COST = 15;

export interface BudgetInput {
  stops: RouteStop[];
  facts: Fact[];
  quests: SideQuest[];
  /** Reservas de alta velocidad (cantidad; el promedio es RESERVATION_AVG_COST). */
  reservations: number;
  /** Cuando mamá paga su tramo, el alojamiento de esas paradas no es gasto de Eze. */
  momPaysHerTrip: boolean;
  includeBaseFlight: boolean;
  baseFlightUSD: number;
  usdToEurRate: number;
}

export interface BudgetTotals {
  nights: number;
  lodging: number;
  transport: number;
  daily: number;
  facts: number;
  reservations: number;
  quests: number;
  flight: number;
  total: number;
  saved: number;
}

/**
 * Réplica del cálculo de la app anterior, que se había perdido en la migración:
 * el total incluye hacks, reservas de tren y side quests, no solo el itinerario.
 * El alojamiento suma únicamente en paradas confirmadas (en las tentativas todavía
 * no hay reserva, así que solo cuenta el gasto diario estimado).
 */
export function computeBudget(i: BudgetInput): BudgetTotals {
  let lodging = 0;
  let transport = 0;
  let daily = 0;
  let nights = 0;

  for (const s of i.stops) {
    nights += s.nights;
    daily += s.nights * (s.dailyBudget || 0);
    transport += s.cost || 0;
    if (s.isConfirmed) {
      const noLoPagaEze = s.isMomTrip && i.momPaysHerTrip;
      lodging += noLoPagaEze ? 0 : s.accommodationCost || 0;
    }
  }

  const facts = i.facts.reduce((a, f) => a + (f.cost || 0), 0);
  const saved = i.facts.reduce((a, f) => a + (f.saving || 0), 0);
  const reservations = i.reservations * RESERVATION_AVG_COST;
  const quests = i.quests.reduce((a, q) => a + (q.includedInBudget ? q.totalCost : 0), 0);
  // El vuelo internacional se guarda en USD; todo lo demás, en EUR.
  const flight = i.includeBaseFlight ? i.baseFlightUSD * i.usdToEurRate : 0;

  return {
    nights,
    lodging,
    transport,
    daily,
    facts,
    reservations,
    quests,
    flight,
    total: lodging + transport + daily + facts + reservations + quests + flight,
    saved,
  };
}
