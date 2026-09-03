import type { QuestItineraryEntry } from '../types';

const W = 320;
const H = 190;
const PAD = 18;

/** Mini mapa del recorrido de un día: conecta las paradas con lat/lng en el
 *  orden real del itinerario (los números son su posición en el plan, no un
 *  contador aparte), para ver de un vistazo si el día zigzaguea. Este
 *  componente se reusa para quests de ciudades a latitudes muy distintas
 *  (Londres, Berlín, Ámsterdam, Viena...), así que la corrección de longitud
 *  se calcula por itinerario, no con una constante fija. */
export default function RouteMiniMap({ itinerary }: { itinerary: QuestItineraryEntry[] }) {
  const points = itinerary
    .map((it, i) => ({ ...it, order: i + 1 }))
    .filter((it): it is QuestItineraryEntry & { order: number; lat: number; lng: number } =>
      it.lat != null && it.lng != null
    );

  if (points.length < 2) return null;

  // A esta latitud, 1° de longitud equivale a bastante menos que 1° de
  // latitud en distancia real — sin esta corrección el mapa sale estirado
  // horizontalmente. Se usa el promedio de las paradas del propio itinerario
  // en vez de una latitud fija, porque el componente se reusa en ciudades
  // muy distintas.
  const avgLat = points.reduce((sum, p) => sum + p.lat, 0) / points.length;
  const latCos = Math.cos((avgLat * Math.PI) / 180);

  const xs = points.map((p) => p.lng * latCos);
  const ys = points.map((p) => -p.lat);
  const minX = Math.min(...xs);
  const maxX = Math.max(...xs);
  const minY = Math.min(...ys);
  const maxY = Math.max(...ys);
  const spanX = maxX - minX || 1;
  const spanY = maxY - minY || 1;
  const availW = W - PAD * 2;
  const availH = H - PAD * 2;
  const scale = Math.min(availW / spanX, availH / spanY);
  const offsetX = PAD + (availW - spanX * scale) / 2;
  const offsetY = PAD + (availH - spanY * scale) / 2;

  const toSvg = (p: { lat: number; lng: number }) => [
    offsetX + (p.lng * latCos - minX) * scale,
    offsetY + (-p.lat - minY) * scale,
  ];

  const coords = points.map(toSvg);

  return (
    <div className="rounded-2xl bg-slate-900 border border-white/10 p-3">
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto">
        <polyline
          points={coords.map(([x, y]) => `${x},${y}`).join(' ')}
          fill="none"
          className="stroke-accent-400/70"
          strokeWidth={2}
          strokeDasharray="5 4"
          strokeLinecap="round"
        />
        {points.map((p, i) => {
          const [x, y] = coords[i];
          return (
            <g key={i}>
              <circle cx={x} cy={y} r={8.5} className="fill-accent-400 stroke-slate-950" strokeWidth={1.5} />
              <text
                x={x}
                y={y}
                textAnchor="middle"
                dominantBaseline="central"
                className="fill-slate-950 text-[9px] font-bold"
              >
                {p.order}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}
