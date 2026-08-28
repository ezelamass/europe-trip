import { useMemo } from 'react';
import { COUNTRIES } from '../data/worldMap';
import { DOTS, PATHS, VIEWS, type ViewCode } from '../data/worldGeometry';
import type { TravelProfile } from '../types';

interface Props {
  profile: TravelProfile;
  view: ViewCode;
  onSelect: (iso: string) => void;
}

const VISITED = '#f43f5e';
const SOVEREIGN = '#334155';
const TERRITORY = '#293548';
const DOT_IDLE = '#475569';

export default function WorldMap({ profile, view, onSelect }: Props) {
  const box = VIEWS[view] ?? VIEWS.WORLD;

  // El trazo y los puntos se escalan con el zoom: si no, al enfocar un
  // continente los bordes se ven desproporcionadamente gruesos.
  const strokeWidth = Math.max(0.4, (box[2] / 2000) * 1.4);
  const dotR = Math.max(2.5, (box[2] / 2000) * 7);

  const shapes = useMemo(
    () =>
      Object.entries(PATHS).map(([iso, d]) => {
        const sovereign = !!COUNTRIES[iso];
        const visited = sovereign && !!profile[iso];
        return (
          <path
            key={iso}
            d={d}
            fill={visited ? VISITED : sovereign ? SOVEREIGN : TERRITORY}
            stroke="#0f172a"
            fillRule="evenodd"
            style={sovereign ? { cursor: 'pointer' } : undefined}
            onClick={sovereign ? () => onSelect(iso) : undefined}
          >
            <title>{sovereign ? COUNTRIES[iso].n : iso}</title>
          </path>
        );
      }),
    [profile, onSelect],
  );

  // Micro-estados sin geometría a esta resolución: se dibujan como punto para
  // que se puedan tocar y cuenten igual que el resto.
  const dots = useMemo(
    () =>
      Object.entries(DOTS)
        .filter(([iso]) => COUNTRIES[iso])
        .map(([iso, [cx, cy]]) => (
          <circle
            key={iso}
            cx={cx}
            cy={cy}
            r={dotR}
            fill={profile[iso] ? VISITED : DOT_IDLE}
            stroke="#0f172a"
            strokeWidth={strokeWidth}
            style={{ cursor: 'pointer' }}
            onClick={() => onSelect(iso)}
          >
            <title>{COUNTRIES[iso].n}</title>
          </circle>
        )),
    [profile, dotR, strokeWidth, onSelect],
  );

  return (
    <svg
      viewBox={box.join(' ')}
      preserveAspectRatio="xMidYMid meet"
      role="img"
      aria-label="Mapa de países visitados"
      className="w-full h-auto block transition-all duration-500"
    >
      {/* El trazo se hereda: cambiar de continente reescribe un atributo en el
          grupo en vez de invalidar el memo y los 173 paths. */}
      <g strokeWidth={strokeWidth}>{shapes}</g>
      {dots}
    </svg>
  );
}
