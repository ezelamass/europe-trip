// Convierte la salida de build-final.js en el módulo TS que importa la app.
// El archivo generado no se edita a mano: se regenera con este script.
const fs = require('fs');
const path = require('path');

const SRC = path.join(__dirname, 'world-map-data.js');
const OUT = path.join(__dirname, '..', 'src', 'data', 'worldMap.ts');

const raw = fs.readFileSync(SRC, 'utf8');
// Se descarta el comentario de cabecera del generador y se exporta cada const.
const body = raw.slice(raw.indexOf('*/') + 2).replace(/^const /gm, 'export const ');

const TYPES = `
export type ContinentCode = 'EU' | 'SA' | 'NA' | 'AS' | 'AF' | 'OC';
export type ViewCode = 'WORLD' | ContinentCode;
export interface CountryMeta { n: string; c: ContinentCode }
export interface Subdivisions { label: string; list: [string, string][] }

export const COUNTRIES = WORLD_COUNTRIES as Record<string, CountryMeta>;
export const SUBDIVISIONS = WORLD_SUBDIVISIONS as unknown as Record<string, Subdivisions>;
export const PATHS = WORLD_PATHS as Record<string, string>;
export const DOTS = WORLD_DOTS as unknown as Record<string, [number, number]>;
export const CONTINENTS = WORLD_CONTINENTS as Record<ContinentCode, string>;
export const VIEWS = WORLD_VIEWS as Record<ViewCode, [number, number, number, number]>;
export const TOTAL_COUNTRIES = Object.keys(COUNTRIES).length;
`;

const header =
  '// GENERADO — no editar a mano. Regenerar con scripts/ (ver scripts/README.md).\n' +
  '// Convertido a módulo ES desde la salida de scripts/build-final.js.\n';

fs.writeFileSync(OUT, header + body.trimStart() + TYPES);
console.error('escrito:', OUT, (fs.statSync(OUT).size / 1024).toFixed(1), 'KB');
