import creditsJson from './covers.json';

export interface CoverCredit {
  title: string;
  author: string;
  license: string;
  source: string;
}

/** Crédito de cada foto. Cinco de las siete son CC BY / CC BY-SA, que exigen
 *  atribución: `covers.json` es la atribución del proyecto (la app ya no la muestra
 *  en pantalla). También hace de índice de qué viajes tienen portada. */
export const COVER_CREDITS = creditsJson as Record<string, CoverCredit>;

/** Portada de un viaje. Las imágenes viven en public/covers/ y se precachean,
 *  así que están disponibles sin red. `null` = todavía no tiene foto. */
export function coverFor(tripId: string): string | null {
  return COVER_CREDITS[tripId] ? `${import.meta.env.BASE_URL}covers/${tripId}.webp` : null;
}
