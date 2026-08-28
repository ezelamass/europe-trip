// Convierte world-atlas TopoJSON (110m) a paths SVG proyectados, keyed por ISO alpha-2.
const fs = require('fs');
const topo = JSON.parse(fs.readFileSync('world110m.json', 'utf8'));
const countries = JSON.parse(fs.readFileSync('countries.json', 'utf8'));

// --- decodificar arcos (delta-encoded + cuantizados) ---
const { scale, translate } = topo.transform;
const arcs = topo.arcs.map(arc => {
  let x = 0, y = 0;
  return arc.map(([dx, dy]) => {
    x += dx; y += dy;
    return [x * scale[0] + translate[0], y * scale[1] + translate[1]];
  });
});

function arcPoints(i) {
  if (i < 0) return arcs[~i].slice().reverse();
  return arcs[i];
}
function ringPoints(ring) {
  const pts = [];
  ring.forEach((ai, idx) => {
    const a = arcPoints(ai);
    pts.push(...(idx === 0 ? a : a.slice(1)));
  });
  return pts;
}

// --- proyección equirectangular (plate carrée), W x H en unidades de viewBox ---
const W = 2000, H = 1000;
// Recorte vertical: la Antártida y el extremo ártico se descartan (nadie viaja ahí y
// desperdician ~25% del alto). Rango util: lat 84 (norte) a -58 (sur).
const LAT_MAX = 84, LAT_MIN = -58;
const project = ([lon, lat]) => [
  ((lon + 180) / 360) * W,
  ((LAT_MAX - lat) / (LAT_MAX - LAT_MIN)) * H
];

// --- simplificación Douglas-Peucker ---
function perpDist(p, a, b) {
  const dx = b[0] - a[0], dy = b[1] - a[1];
  const den = dx * dx + dy * dy;
  if (den === 0) return Math.hypot(p[0] - a[0], p[1] - a[1]);
  const t = ((p[0] - a[0]) * dx + (p[1] - a[1]) * dy) / den;
  const tc = Math.max(0, Math.min(1, t));
  return Math.hypot(p[0] - (a[0] + tc * dx), p[1] - (a[1] + tc * dy));
}
function simplify(pts, tol) {
  if (pts.length <= 3) return pts;
  let maxD = 0, idx = 0;
  for (let i = 1; i < pts.length - 1; i++) {
    const d = perpDist(pts[i], pts[0], pts[pts.length - 1]);
    if (d > maxD) { maxD = d; idx = i; }
  }
  if (maxD <= tol) return [pts[0], pts[pts.length - 1]];
  return [
    ...simplify(pts.slice(0, idx + 1), tol).slice(0, -1),
    ...simplify(pts.slice(idx), tol)
  ];
}

const TOL = 2.4;        // tolerancia de simplificación en unidades de viewBox
const MIN_AREA = 9.0;   // descartar islas/polígonos diminutos

function ringArea(pts) {
  let a = 0;
  for (let i = 0, j = pts.length - 1; i < pts.length; j = i++) {
    a += (pts[j][0] + pts[i][0]) * (pts[j][1] - pts[i][1]);
  }
  return Math.abs(a / 2);
}

// Los anillos que cruzan el antimeridiano (Rusia/Chukotka, Aleutianas, Fiji) vienen
// con saltos de ~360° en longitud: al proyectarlos crudos generan bandas horizontales
// que atraviesan todo el mapa. Se "desenrollan" a longitudes continuas y, si quedan
// fuera de [-180,180], se emite además una copia desplazada 360° para cubrir el otro
// borde. El viewBox recorta lo que sobra.
function unwrapLon(lonlats) {
  const out = [lonlats[0].slice()];
  for (let i = 1; i < lonlats.length; i++) {
    const prev = out[i - 1][0];
    let lon = lonlats[i][0];
    while (lon - prev > 180) lon -= 360;
    while (prev - lon > 180) lon += 360;
    out.push([lon, lonlats[i][1]]);
  }
  return out;
}

function ptsToPath(pts) {
  pts = simplify(pts, TOL);
  if (pts.length < 4) return null;
  if (ringArea(pts) < MIN_AREA) return null;
  const r = n => Math.round(n * 10) / 10;
  let d = `M${r(pts[0][0])} ${r(pts[0][1])}`;
  for (let i = 1; i < pts.length; i++) d += `L${r(pts[i][0])} ${r(pts[i][1])}`;
  return d + 'Z';
}

function ringToPath(ring) {
  const raw = unwrapLon(ringPoints(ring));
  const lons = raw.map(p => p[0]);
  const minLon = Math.min(...lons), maxLon = Math.max(...lons);

  const shifts = [0];
  if (minLon < -180) shifts.push(360);   // parte que se fue por el borde oeste
  if (maxLon > 180) shifts.push(-360);   // ídem por el este

  const out = [];
  shifts.forEach(sh => {
    const pts = raw.map(([lon, lat]) => project([lon + sh, lat]));
    // descartar la copia si queda completamente fuera del lienzo
    if (Math.max(...pts.map(p => p[0])) < 0 || Math.min(...pts.map(p => p[0])) > W) return;
    const d = ptsToPath(pts);
    if (d) out.push(d);
  });
  return out.length ? out.join('') : null;
}

// --- construir paths por país ---
const byNum = {};
countries.forEach(c => { byNum[String(parseInt(c.ccn3, 10))] = c; });

// Alias para ids que world-atlas nombra distinto o que no matchean por ccn3
const NAME_FIX = { 'Kosovo': 'XK', 'Somaliland': null, 'N. Cyprus': null };

const paths = {};
const unmatched = [];
topo.objects.countries.geometries.forEach(g => {
  const meta = byNum[String(parseInt(g.id, 10))];
  const name = g.properties && g.properties.name;
  let iso = meta ? meta.cca2 : (NAME_FIX.hasOwnProperty(name) ? NAME_FIX[name] : undefined);
  if (iso === undefined) { unmatched.push(name + ' (' + g.id + ')'); return; }
  if (iso === null) return; // territorio deliberadamente omitido
  if (iso === 'AQ') return;  // Antártida: fuera del recorte vertical

  const polys = g.type === 'Polygon' ? [g.arcs] : g.arcs;
  const ds = [];
  polys.forEach(poly => {
    poly.forEach(ring => {           // ring 0 = exterior, resto = huecos (los incluimos, fill-rule evenodd)
      const d = ringToPath(ring);
      if (d) ds.push(d);
    });
  });
  if (!ds.length) return;
  paths[iso] = (paths[iso] ? paths[iso] + ds.join('') : ds.join(''));
});

console.error('sin match:', unmatched.join(', ') || 'ninguno');
console.error('paises con path:', Object.keys(paths).length);

// --- metadata: nombre ES, continente ---
const CONT = { 'South America': 'SA', 'North America': 'NA', 'Central America': 'NA', 'Caribbean': 'NA' };
const REG2CONT = { Africa: 'AF', Asia: 'AS', Europe: 'EU', Oceania: 'OC' };

const meta = {};
countries.forEach(c => {
  const isSovereign = c.unMember || c.cca2 === 'PS';
  if (!isSovereign) return;
  const cont = c.region === 'Americas' ? CONT[c.subregion] : REG2CONT[c.region];
  if (!cont) return;
  meta[c.cca2] = {
    n: (c.translations && c.translations.spa && c.translations.spa.common) || c.name.common,
    c: cont
  };
});
console.error('paises soberanos:', Object.keys(meta).length);
const counts = {};
Object.values(meta).forEach(m => counts[m.c] = (counts[m.c] || 0) + 1);
console.error('por continente:', JSON.stringify(counts));

// --- micro-estados: sin geometría a esta resolución, se dibujan como punto ---
const dots = {};
countries.forEach(c => {
  if (!meta[c.cca2] || paths[c.cca2]) return;
  if (!c.latlng || c.latlng.length !== 2) return;
  const [x, y] = project([c.latlng[1], c.latlng[0]]);
  dots[c.cca2] = [Math.round(x * 10) / 10, Math.round(y * 10) / 10];
});
console.error('micro-estados con punto:', Object.keys(dots).length);

fs.writeFileSync('paths.json', JSON.stringify(paths));
fs.writeFileSync('meta.json', JSON.stringify(meta));
fs.writeFileSync('dots.json', JSON.stringify(dots));
console.error('paths.json:', (fs.statSync('paths.json').size / 1024).toFixed(1), 'KB');
