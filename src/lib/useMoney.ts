import { useCallback } from 'react';
import { useStore } from '../store/useStore';
import { fmtMoney } from './format';

/** Formateador de montos ligado a la moneda elegida. Estaba repetido en cinco
 *  componentes junto con sus dos selectores; acá se define una sola vez. */
export function useMoney(): (amountEur: number, decimals?: number) => string {
  const displayCurrency = useStore((s) => s.displayCurrency);
  const usdToEurRate = useStore((s) => s.usdToEurRate);
  return useCallback(
    (amountEur: number, decimals = 0) => fmtMoney(amountEur, displayCurrency, usdToEurRate, decimals),
    [displayCurrency, usdToEurRate],
  );
}
