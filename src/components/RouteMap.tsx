import { useEffect, useMemo, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';
import type { RouteStop } from '../types';
import { coordsForCity } from '../data/coordinates';
import { calculateDistance, escapeHTML } from '../lib/format';

// Leaflet resuelve sus iconos por URL relativa al CSS; con el bundler hay que
// pasárselos explícitamente o los marcadores salen rotos.
L.Icon.Default.mergeOptions({
  iconUrl: markerIcon,
  iconRetinaUrl: markerIcon2x,
  shadowUrl: markerShadow,
});

export default function RouteMap({ stops }: { stops: RouteStop[] }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!ref.current) return;
    const map = L.map(ref.current, { scrollWheelZoom: false });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap',
      maxZoom: 18,
    }).addTo(map);

    const points: [number, number][] = [];
    stops.forEach((s, i) => {
      const c = coordsForCity(s.city);
      if (!c) return;
      points.push(c);
      // Ciudad y noches vienen del mismo objeto sin validar (un respaldo importado o
      // el estado de la app vieja), así que se escapan las dos.
      L.marker(c)
        .addTo(map)
        .bindPopup(
          `<strong>${i + 1}. ${escapeHTML(s.city)}</strong><br/>${escapeHTML(String(s.nights))} noches`,
        );
    });

    if (points.length > 1) {
      L.polyline(points, { color: '#6366f1', weight: 3, opacity: 0.8, dashArray: '6 6' }).addTo(map);
    }
    if (points.length) map.fitBounds(L.latLngBounds(points).pad(0.2));
    else map.setView([45, 10], 4);

    return () => {
      map.remove();
    };
  }, [stops]);

  // Una sola pasada: se arrastra la coordenada anterior en vez de volver a
  // normalizar el nombre de la parada previa en cada iteración.
  const { km, missing } = useMemo(() => {
    let total = 0;
    let sin = 0;
    let prev: [number, number] | null = null;
    for (const s of stops) {
      const c = coordsForCity(s.city);
      if (!c) {
        sin++;
        continue;
      }
      if (prev) total += calculateDistance(prev[0], prev[1], c[0], c[1]);
      prev = c;
    }
    return { km: total, missing: sin };
  }, [stops]);

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
