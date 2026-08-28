// Convierte la salida de build-final.js en el módulo TS que importa la app.
// El archivo generado no se edita a mano: se regenera con este script.
const fs = require('fs');
const path = require('path');

const SRC = path.join(__dirname, 'world-map-data.js');
const DATA_DIR = path.join(__dirname, '..', 'src', 'data');

const raw = fs.readFileSync(SRC, 'utf8');
// Se descarta el comentario de cabecera del generador y se exporta cada const.
const body = raw.slice(raw.indexOf('*/') + 2).replace(/^const /gm, 'export const ');

// Un const por línea: se reparten entre los dos módulos.
const block = (name) => body.match(new RegExp('^export const ' + name + ' = .*?;$', 'ms'))[0];

const HEADER =
  '// GENERADO — no editar a mano. Regenerar con scripts/ (ver scripts/README.md).\n' +
  '// Emitido por scripts/to-module.js desde la salida de scripts/build-final.js.\n\n';

// La geometría va aparte a propósito: son ~65 KB que solo el mapa necesita, y si
// comparten módulo con COUNTRIES/SUBDIVISIONS (que importan format.ts y TripsTab)
// Rollup los arrastra al chunk inicial de la app.
const geometry =
  HEADER +
  ['WORLD_VIEWS', 'WORLD_DOTS', 'WORLD_PATHS'].map(block).join('\n\n') +
  `

import type { ContinentCode, ViewCode } from './worldMap';

export const PATHS = WORLD_PATHS as Record<string, string>;
export const DOTS = WORLD_DOTS as unknown as Record<string, [number, number]>;
export const VIEWS = WORLD_VIEWS as Record<ViewCode, [number, number, number, number]>;
export type { ContinentCode, ViewCode };
`;

const meta =
  HEADER +
  ['WORLD_CONTINENTS', 'WORLD_COUNTRIES', 'WORLD_SUBDIVISIONS'].map(block).join('\n\n') +
  `

export type ContinentCode = 'EU' | 'SA' | 'NA' | 'AS' | 'AF' | 'OC';
export type ViewCode = 'WORLD' | ContinentCode;
export interface CountryMeta { n: string; c: ContinentCode }
export interface Subdivisions { label: string; list: [string, string][] }

export const COUNTRIES = WORLD_COUNTRIES as Record<string, CountryMeta>;
export const SUBDIVISIONS = WORLD_SUBDIVISIONS as unknown as Record<string, Subdivisions>;
export const CONTINENTS = WORLD_CONTINENTS as Record<ContinentCode, string>;
export const TOTAL_COUNTRIES = Object.keys(COUNTRIES).length;
`;

for (const [file, content] of [['worldGeometry.ts', geometry], ['worldMap.ts', meta]]) {
  const out = path.join(DATA_DIR, file);
  fs.writeFileSync(out, content);
  console.error('escrito:', out, (fs.statSync(out).size / 1024).toFixed(1), 'KB');
}
