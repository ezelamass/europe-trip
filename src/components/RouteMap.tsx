import { useEffect, useMemo, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';
import type { RouteStop } from '../types';
import { coordsForCity } from '../data/coordinates';
import { calculateDistance, escapeHTML, formatRange, stopRange } from '../lib/format';

// Leaflet resuelve sus iconos por URL relativa al CSS; con el bundler hay que
// pasárselos explícitamente o los marcadores salen rotos.
L.Icon.Default.mergeOptions({
  iconUrl: markerIcon,
  iconRetinaUrl: markerIcon2x,
  shadowUrl: markerShadow,
});

/** Cuánto dura cada parada del recorrido animado. */
const MS_POR_PARADA = 3000;

const RUTA = '#a3e635'; // accent-400

/** Marcador de la parada en la que está el recorrido: se distingue del resto. */
const iconoActual = L.divIcon({
  className: '',
  html:
    '<span style="display:block;width:18px;height:18px;border-radius:9999px;' +
    `background:${RUTA};box-shadow:0 0 0 4px rgba(163,230,53,.35),0 2px 8px rgba(0,0,0,.6)"></span>`,
  iconSize: [18, 18],
  iconAnchor: [9, 9],
});

interface Ubicada {
  stop: RouteStop;
  coord: [number, number];
  /** Índice dentro del itinerario completo, para numerar igual que la lista. */
  index: number;
  nightsBefore: number;
}

export default function RouteMap({
  stops,
  startDate,
}: {
  stops: RouteStop[];
  /** Fecha de inicio del viaje, para mostrar el rango de cada parada. */
  startDate?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const capaRef = useRef<L.LayerGroup | null>(null);

  /** Cuántas paradas se ven. `null` = todas (estado normal, sin animación). */
  const [visibles, setVisibles] = useState<number | null>(null);

  // Solo las paradas con coordenadas entran al mapa y al recorrido.
  const ubicadas = useMemo<Ubicada[]>(() => {
    const out: Ubicada[] = [];
    let nightsBefore = 0;
    stops.forEach((stop, index) => {
      const coord = coordsForCity(stop.city);
      if (coord) out.push({ stop, coord, index, nightsBefore });
      nightsBefore += stop.nights;
    });
    return out;
  }, [stops]);

  const reproduciendo = visibles !== null;
  const actual = reproduciendo ? ubicadas[visibles - 1] : undefined;

  // --- El mapa se crea una sola vez; las capas se redibujan aparte ---
  useEffect(() => {
    if (!ref.current) return;
    const map = L.map(ref.current, { scrollWheelZoom: false });
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap',
      maxZoom: 18,
    }).addTo(map);
    capaRef.current = L.layerGroup().addTo(map);
    mapRef.current = map;
    return () => {
      map.remove();
      mapRef.current = null;
      capaRef.current = null;
    };
  }, []);

  // --- Dibujo: se rehace cuando cambian las paradas o avanza el recorrido ---
  useEffect(() => {
    const map = mapRef.current;
    const capa = capaRef.current;
    if (!map || !capa) return;

    capa.clearLayers();
    const hasta = visibles ?? ubicadas.length;
    const mostradas = ubicadas.slice(0, hasta);

    mostradas.forEach((u, i) => {
      const esActual = visibles !== null && i === mostradas.length - 1;
      L.marker(u.coord, esActual ? { icon: iconoActual, zIndexOffset: 1000 } : {})
        .addTo(capa)
        // Ciudad y noches vienen del mismo objeto sin validar (un respaldo importado
        // o el estado de la app vieja), así que se escapan las dos.
        .bindPopup(
          `<strong>${u.index + 1}. ${escapeHTML(u.stop.city)}</strong><br/>` +
            `${escapeHTML(String(u.stop.nights))} noches`,
        );
    });

    if (mostradas.length > 1) {
      L.polyline(
        mostradas.map((u) => u.coord),
        { color: RUTA, weight: 3, opacity: 0.85, dashArray: '6 6' },
      ).addTo(capa);
    }

    if (!mostradas.length) {
      map.setView([45, 10], 4);
      return;
    }

    // Sin animación: la ruta entera. Con animación: el tramo que se acaba de
    // recorrer, que es lo que hace legible el movimiento de una parada a la otra.
    const suave = !window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    if (visibles === null) {
      map.fitBounds(L.latLngBounds(mostradas.map((u) => u.coord)).pad(0.2));
    } else {
      const cur = mostradas[mostradas.length - 1].coord;
      const prev = mostradas[mostradas.length - 2]?.coord;
      const bounds = L.latLngBounds(prev ? [prev, cur] : [cur, cur]).pad(prev ? 0.5 : 0);
      if (prev) map.flyToBounds(bounds, { duration: suave ? 1.1 : 0, maxZoom: 8 });
      else map.flyTo(cur, 6, { duration: suave ? 1.1 : 0 });
    }
  }, [ubicadas, visibles]);

  // --- El reloj del recorrido: una parada cada 3 s ---
  useEffect(() => {
    if (visibles === null) return;
    const id = setTimeout(() => {
      // Al llegar a la última se queda ahí los 3 s y recién ahí vuelve a la vista completa.
      setVisibles((v) => (v === null || v >= ubicadas.length ? null : v + 1));
    }, MS_POR_PARADA);
    return () => clearTimeout(id);
  }, [visibles, ubicadas.length]);

  // Una sola pasada: se arrastra la coordenada anterior en vez de volver a
  // normalizar el nombre de la parada previa en cada iteración.
  const km = useMemo(() => {
    let total = 0;
    for (let i = 1; i < ubicadas.length; i++) {
      const a = ubicadas[i - 1].coord;
      const b = ubicadas[i].coord;
      total += calculateDistance(a[0], a[1], b[0], b[1]);
    }
    return total;
  }, [ubicadas]);

  const sinCoords = stops.length - ubicadas.length;
  const rango = actual && startDate
    ? (() => {
        const { from, to } = stopRange(startDate, actual.nightsBefore, actual.stop.nights);
        return formatRange(from, to, actual.stop.nights);
      })()
    : '';

  return (
    <div className="space-y-2">
      <div className="relative">
        <div
          ref={ref}
          className="h-[60vh] min-h-[320px] rounded-2xl overflow-hidden border border-slate-800 z-0"
        />

        {ubicadas.length > 1 && (
          <button
            onClick={() => {
              if (reproduciendo) {
                setVisibles(null);
                return;
              }
              // El mapa mide 60vh y la tarjeta de la parada va abajo del todo: sin
              // centrarlo, queda tapada por la barra inferior.
              ref.current?.scrollIntoView({ block: 'center', behavior: 'smooth' });
              setVisibles(1);
            }}
            className="absolute top-3 right-3 z-[400] rounded-full bg-slate-950/90 backdrop-blur border border-white/15 text-white text-xs font-bold px-3.5 py-2 shadow-lg active:scale-95 transition"
          >
            <i className={`fa-solid ${reproduciendo ? 'fa-stop' : 'fa-play'} mr-1.5 text-accent-300`} />
            {reproduciendo ? 'Detener' : 'Ver recorrido'}
          </button>
        )}

        {/* Tarjeta de la parada en curso, encima del mapa */}
        {actual && (
          <div className="absolute inset-x-3 bottom-3 z-[400] rounded-2xl bg-slate-950/92 backdrop-blur border border-white/15 shadow-xl p-3.5">
            <div className="flex items-baseline justify-between gap-3">
              <p className="text-[10px] font-bold uppercase tracking-wider text-accent-300">
                Parada {visibles} de {ubicadas.length}
              </p>
              <p className="text-[11px] text-slate-400 tabular-nums">{rango}</p>
            </div>
            <h3 className="text-lg font-bold text-white leading-tight mt-0.5 truncate">
              {actual.stop.city}
            </h3>
            <p className="text-xs text-slate-400">
              {actual.stop.nights} {actual.stop.nights === 1 ? 'noche' : 'noches'}
              {actual.stop.transport ? ` · ${actual.stop.transport}` : ''}
            </p>
            <div className="mt-2.5 h-1 rounded-full bg-slate-800 overflow-hidden">
              <div
                key={visibles}
                className="h-full rounded-full bg-accent-400 animate-[avance_3s_linear_forwards]"
              />
            </div>
          </div>
        )}
      </div>

      <p className="text-xs text-slate-400">
        {km > 0 && (
          <>
            <i className="fa-solid fa-route mr-1.5" />
            ~{Math.round(km).toLocaleString('es-AR')} km en línea recta entre paradas.
          </>
        )}
        {sinCoords > 0 && (
          <span className="ml-2 text-amber-300/90">
            {sinCoords} parada{sinCoords > 1 ? 's' : ''} sin coordenadas cargadas.
          </span>
        )}
      </p>
    </div>
  );
}
