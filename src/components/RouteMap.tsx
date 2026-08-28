import { useEffect, useRef } from 'react';
import L from 'leaflet';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';
import type { RouteStop } from '../types';
import { CITY_COORDINATES } from '../data/europa2026';
import { calculateDistance } from '../lib/format';

// Leaflet resuelve sus iconos por URL relativa al CSS; con el bundler hay que
// pasárselos explícitamente o los marcadores salen rotos.
L.Icon.Default.mergeOptions({
  iconUrl: markerIcon,
  iconRetinaUrl: markerIcon2x,
  shadowUrl: markerShadow,
});

function coordsFor(city: string): [number, number] | null {
  if (CITY_COORDINATES[city]) return CITY_COORDINATES[city];
  // Las paradas históricas no están en el diccionario de Europa 2026: se busca
  // por el nombre antes del paréntesis para no depender del formato exacto.
  const base = city.split('(')[0].trim();
  const hit = Object.keys(CITY_COORDINATES).find((k) => k.split('(')[0].trim() === base);
  return hit ? CITY_COORDINATES[hit] : null;
}

export default function RouteMap({ stops }: { stops: RouteStop[] }) {
  const ref = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);

  useEffect(() => {
    if (!ref.current) return;
    const map = L.map(ref.current, { scrollWheelZoom: false });
    mapRef.current = map;

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap',
      maxZoom: 18,
    }).addTo(map);

    const points: [number, number][] = [];
    stops.forEach((s, i) => {
      const c = coordsFor(s.city);
      if (!c) return;
      points.push(c);
      L.marker(c)
        .addTo(map)
        .bindPopup(`<strong>${i + 1}. ${s.city}</strong><br/>${s.nights} noches`);
    });

    if (points.length > 1) {
      L.polyline(points, { color: '#6366f1', weight: 3, opacity: 0.8, dashArray: '6 6' }).addTo(map);
    }
    if (points.length) map.fitBounds(L.latLngBounds(points).pad(0.2));
    else map.setView([45, 10], 4);

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, [stops]);

  const km = stops.reduce((acc, s, i) => {
    if (i === 0) return 0;
    const a = coordsFor(stops[i - 1].city);
    const b = coordsFor(s.city);
    return a && b ? acc + calculateDistance(a[0], a[1], b[0], b[1]) : acc;
  }, 0);

  const missing = stops.filter((s) => !coordsFor(s.city)).length;

  return (
    <div className="space-y-2">
      <div ref={ref} className="h-[60vh] min-h-[320px] rounded-2xl overflow-hidden border border-slate-800 z-0" />
      <p className="text-xs text-slate-400">
        {km > 0 && (
          <>
            <i className="fa-solid fa-route mr-1.5" />
            ~{Math.round(km).toLocaleString('es-AR')} km en línea recta entre paradas.
          </>
        )}
        {missing > 0 && (
          <span className="ml-2 text-amber-300/90">
            {missing} parada{missing > 1 ? 's' : ''} sin coordenadas cargadas.
          </span>
        )}
      </p>
    </div>
  );
}
