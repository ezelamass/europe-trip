/* Baja las fotos de portada de los viajes desde Wikimedia Commons y las deja
 * optimizadas en public/covers/. Se corre a mano cuando se agrega un viaje nuevo;
 * las imágenes resultantes SÍ se versionan (la app tiene que abrir sin red). */
import { createRequire } from 'node:module';
import { writeFileSync, mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const sharp = createRequire(join(dirname(fileURLToPath(import.meta.url)), '../package.json'))('sharp');
const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');

/** tripId -> archivo en Commons. Elegidas a mano revisando candidatos. */
const COVERS = {
  'europa-2026': 'Colosseum of Rome, Italy.jpg',
  'brasil-2026': 'Copacabana, Rio de Janeiro, Brazil.jpg',
  'mar-del-plata-2026': 'PlayaVarese-0027.jpg',
  'bariloche-2025': 'NahuelHuapiyBariloche.jpg',
  'brasil-2025': 'Buzios Playa La Tartaruga Rio de Janeiro Brasil - panoramio.jpg',
  'cordoba-2025': 'Nido-de-Aguila Mina Clavero.jpg',
  'uruguay-2024': '" LA MANO".jpg',
  'chile-2025': 'Santiago desde teleférico Pedro de Valdivia.jpg',
  'europa-2015': 'Eiffel Tower and Pont Alexandre III at night.jpg',
};

// 16:9. En un celular de 430px la card mide ~390px, así que 800 alcanza para 2x.
const WIDTH = 800;
const HEIGHT = 450;
const UA = { 'User-Agent': 'eurotrip-planner/1.0 (personal project)' };
const api = 'https://commons.wikimedia.org/w/api.php';
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const strip = (s) => (s ?? '').replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim();

mkdirSync(join(ROOT, 'public/covers'), { recursive: true });
const credits = {};

for (const [id, file] of Object.entries(COVERS)) {
  await sleep(1200); // la API corta si se le pega muy seguido
  const p = new URLSearchParams({
    action: 'query', format: 'json', titles: 'File:' + file,
    prop: 'imageinfo', iiprop: 'url|extmetadata', iiurlwidth: String(WIDTH * 2),
  });
  const d = await (await fetch(`${api}?${p}`, { headers: UA })).json();
  const page = Object.values(d?.query?.pages ?? {})[0];
  const ii = page?.imageinfo?.[0];
  if (!ii) throw new Error('no se encontró en Commons: ' + file);

  const buf = Buffer.from(await (await fetch(ii.thumburl, { headers: UA })).arrayBuffer());
  const out = join(ROOT, 'public/covers', `${id}.webp`);
  await sharp(buf).resize(WIDTH, HEIGHT, { fit: 'cover', position: 'attention' })
    .webp({ quality: 64, effort: 6 }).toFile(out);

  const em = ii.extmetadata ?? {};
  credits[id] = {
    title: file,
    author: strip(em.Artist?.value) || 'desconocido',
    license: strip(em.LicenseShortName?.value) || '?',
    source: `https://commons.wikimedia.org/wiki/${encodeURIComponent('File:' + file)}`,
  };
  console.error(id.padEnd(20), credits[id].license.padEnd(14), file.slice(0, 45));
}

writeFileSync(join(ROOT, 'src/data/covers.json'), JSON.stringify(credits, null, 2) + '\n');
console.error('\ncréditos -> src/data/covers.json');
