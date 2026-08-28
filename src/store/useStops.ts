import { useMemo } from 'react';
import { useStore, withPhotoAlbums } from './useStore';
import type { RouteStop } from '../types';

/** Identidad estable: devolver `[]` inline hace que el snapshot de zustand v5
 *  nunca sea `Object.is`-igual y React re-renderice en loop. */
const NO_STOPS: RouteStop[] = [];

/** Paradas de un viaje con los álbumes de fotos del usuario ya aplicados.
 *  Es el único lugar por donde se leen: los álbumes viven aparte de `tripStops`
 *  para que un bump de DATA_VERSION reponga el itinerario sin borrarlos. */
export function useStops(tripId: string): RouteStop[] {
  const stops = useStore((s) => s.tripStops[tripId]) ?? NO_STOPS;
  const albums = useStore((s) => s.photoAlbums);
  return useMemo(() => withPhotoAlbums(stops, albums), [stops, albums]);
}
