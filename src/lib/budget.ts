import type { Fact, RouteStop, SideQuest } from '../types';

/** El Interrail Global Pass sale la mitad con el beneficio Verano Joven.
 *  La app vieja lo recalculaba en cada render; acá se deriva igual, porque
 *  congelarlo dejaba el hack diciendo €429 mientras el texto prometía €214,50. */
export const INTERRAIL_FACT_ID = 'predefined-interrail';
const INTERRAIL_FULL = 429.0;
const INTERRAIL_HALF = 214.5;

export function interrailPricing(veranoJoven: boolean) {
  return {
    cost: veranoJoven ? INTERRAIL_HALF : INTERRAIL_FULL,
    saving: veranoJoven ? INTERRAIL_HALF : 0,
  };
}

/** Aplica el precio vigente del Interrail sobre la lista de hacks. */
export function withDynamicCosts(facts: Fact[], veranoJoven: boolean): Fact[] {
  const { cost, saving } = interrailPricing(veranoJoven);
  return facts.map((f) => (f.id === INTERRAIL_FACT_ID ? { ...f, cost, saving } : f));
}

export interface BudgetInput {
  stops: RouteStop[];
  facts: Fact[];
  quests: SideQuest[];
  /** Reservas de alta velocidad: cantidad × costo promedio. */
  reservations: number;
  reservationAvgCost: number;
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
  const reservations = i.reservations * i.reservationAvgCost;
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
