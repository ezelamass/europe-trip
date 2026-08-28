// Genera world-map-data.js: geometría + metadata + subdivisiones, listo para la app.
const fs = require('fs');
const paths = JSON.parse(fs.readFileSync('paths.json', 'utf8'));
const meta = JSON.parse(fs.readFileSync('meta.json', 'utf8'));
const dots = JSON.parse(fs.readFileSync('dots.json', 'utf8'));

// --- bounding box por continente (para el zoom) ---
const W = 2000, H = 1000, LAT_MAX = 84, LAT_MIN = -58;
const project = ([lon, lat]) => [((lon + 180) / 360) * W, ((LAT_MAX - lat) / (LAT_MAX - LAT_MIN)) * H];


// Los viewBox por continente se definen en lon/lat a mano, no por bounding box de los
// países: Rusia (contada en Europa) llega al antimeridiano y los territorios de ultramar
// de FR/US/NL desparraman la caja por medio planeta. Recuadros geográficos de siempre:
const CONT_BOUNDS = {                 // [lonOeste, latNorte, lonEste, latSur]
  EU: [-25, 72, 45, 34],
  SA: [-82, 13, -34, -56],
  NA: [-170, 72, -52, 7],
  AS: [25, 56, 146, -11],
  AF: [-18, 38, 52, -35],
  OC: [110, 0, 180, -48]
};
const views = { WORLD: [0, 0, 2000, 1000] };
Object.entries(CONT_BOUNDS).forEach(([c, [lonW, latN, lonE, latS]]) => {
  const [x0, y0] = project([lonW, latN]);
  const [x1, y1] = project([lonE, latS]);
  views[c] = [Math.round(x0), Math.round(y0), Math.round(x1 - x0), Math.round(y1 - y0)];
});

// --- subdivisiones curadas (nivel "natural", no ISO crudo) ---
// Solo de los países visitados: el drill-down únicamente aplica donde estuvo.
// Se pueden ir sumando países a medida que viaje.
const SUBS = {
  AR: { label: 'provincias', list: [
    ['caba','Ciudad de Buenos Aires'],['ba','Buenos Aires'],['cat','Catamarca'],['cha','Chaco'],
    ['chu','Chubut'],['cor','Córdoba'],['cte','Corrientes'],['er','Entre Ríos'],['for','Formosa'],
    ['juj','Jujuy'],['lp','La Pampa'],['lr','La Rioja'],['men','Mendoza'],['mis','Misiones'],
    ['neu','Neuquén'],['rn','Río Negro'],['sal','Salta'],['sj','San Juan'],['sl','San Luis'],
    ['sc','Santa Cruz'],['sf','Santa Fe'],['se','Santiago del Estero'],['tf','Tierra del Fuego'],['tuc','Tucumán']
  ]},
  ES: { label: 'comunidades autónomas', list: [
    ['and','Andalucía'],['ara','Aragón'],['ast','Asturias'],['bal','Islas Baleares'],['can','Canarias'],
    ['cnt','Cantabria'],['cle','Castilla y León'],['clm','Castilla-La Mancha'],['cat','Cataluña'],
    ['ext','Extremadura'],['gal','Galicia'],['rio','La Rioja'],['mad','Madrid'],['mur','Murcia'],
    ['nav','Navarra'],['pv','País Vasco'],['val','Comunidad Valenciana'],['ceu','Ceuta'],['mel','Melilla']
  ]},
  IT: { label: 'regiones', list: [
    ['abr','Abruzzo'],['bas','Basilicata'],['cal','Calabria'],['cam','Campania'],['emi','Emilia-Romaña'],
    ['fri','Friuli-Venecia Julia'],['laz','Lacio'],['lig','Liguria'],['lom','Lombardía'],['mar','Marcas'],
    ['mol','Molise'],['pie','Piamonte'],['pug','Apulia (Puglia)'],['sar','Cerdeña'],['sic','Sicilia'],
    ['tos','Toscana'],['tre','Trentino-Alto Adigio'],['umb','Umbría'],['vao','Valle de Aosta'],['ven','Véneto']
  ]},
  DE: { label: 'estados', list: [
    ['bw','Baden-Wurtemberg'],['by','Baviera'],['be','Berlín'],['bb','Brandeburgo'],['hb','Bremen'],
    ['hh','Hamburgo'],['he','Hesse'],['mv','Mecklemburgo-Pomerania'],['ni','Baja Sajonia'],
    ['nw','Renania del Norte-Westfalia'],['rp','Renania-Palatinado'],['sl','Sarre'],['sn','Sajonia'],
    ['st','Sajonia-Anhalt'],['sh','Schleswig-Holstein'],['th','Turingia']
  ]},
  AT: { label: 'estados', list: [
    ['bur','Burgenland'],['car','Carintia'],['baj','Baja Austria'],['alt','Alta Austria'],
    ['sal','Salzburgo'],['est','Estiria'],['tir','Tirol'],['vor','Vorarlberg'],['vie','Viena']
  ]},
  NL: { label: 'provincias', list: [
    ['dre','Drente'],['fle','Flevoland'],['fri','Frisia'],['gel','Güeldres'],['gro','Groninga'],
    ['lim','Limburgo'],['nbr','Brabante Septentrional'],['nh','Holanda Septentrional'],
    ['ove','Overijssel'],['utr','Utrecht'],['zee','Zelanda'],['zh','Holanda Meridional']
  ]},
  BE: { label: 'regiones', list: [
    ['bru','Bruselas-Capital'],['fla','Flandes'],['wal','Valonia']
  ]},
  CZ: { label: 'regiones', list: [
    ['pra','Praga'],['stc','Bohemia Central'],['jhc','Bohemia Meridional'],['plk','Pilsen'],
    ['kaa','Karlovy Vary'],['ust','Ústí nad Labem'],['lib','Liberec'],['hkk','Hradec Králové'],
    ['par','Pardubice'],['vys','Vysočina'],['jhm','Moravia Meridional'],['olk','Olomouc'],
    ['zlk','Zlín'],['msk','Moravia-Silesia']
  ]},
  FR: { label: 'regiones', list: [
    ['ara','Auvernia-Ródano-Alpes'],['bfc','Borgoña-Franco Condado'],['bre','Bretaña'],
    ['cvl','Centro-Valle de Loira'],['cor','Córcega'],['ges','Gran Este'],['hdf','Alta Francia'],
    ['idf','Isla de Francia (París)'],['nor','Normandía'],['naq','Nueva Aquitania'],['occ','Occitania'],
    ['pdl','Países del Loira'],['pac','Provenza-Alpes-Costa Azul'],['gua','Guadalupe'],
    ['mar','Martinica'],['guy','Guayana Francesa'],['reu','Reunión'],['may','Mayotte']
  ]},
  GB: { label: 'naciones', list: [
    ['eng','Inglaterra'],['sct','Escocia'],['wls','Gales'],['nir','Irlanda del Norte']
  ]},
  US: { label: 'estados', list: [
    ['al','Alabama'],['ak','Alaska'],['az','Arizona'],['ar','Arkansas'],['ca','California'],
    ['co','Colorado'],['ct','Connecticut'],['de','Delaware'],['dc','Washington D.C.'],['fl','Florida'],
    ['ga','Georgia'],['hi','Hawái'],['id','Idaho'],['il','Illinois'],['in','Indiana'],['ia','Iowa'],
    ['ks','Kansas'],['ky','Kentucky'],['la','Luisiana'],['me','Maine'],['md','Maryland'],
    ['ma','Massachusetts'],['mi','Míchigan'],['mn','Minnesota'],['ms','Misisipi'],['mo','Misuri'],
    ['mt','Montana'],['ne','Nebraska'],['nv','Nevada'],['nh','Nuevo Hampshire'],['nj','Nueva Jersey'],
    ['nm','Nuevo México'],['ny','Nueva York'],['nc','Carolina del Norte'],['nd','Dakota del Norte'],
    ['oh','Ohio'],['ok','Oklahoma'],['or','Oregón'],['pa','Pensilvania'],['ri','Rhode Island'],
    ['sc','Carolina del Sur'],['sd','Dakota del Sur'],['tn','Tennessee'],['tx','Texas'],['ut','Utah'],
    ['vt','Vermont'],['va','Virginia'],['wa','Washington'],['wv','Virginia Occidental'],
    ['wi','Wisconsin'],['wy','Wyoming']
  ]},
  BR: { label: 'estados', list: [
    ['ac','Acre'],['al','Alagoas'],['ap','Amapá'],['am','Amazonas'],['ba','Bahía'],['ce','Ceará'],
    ['df','Distrito Federal'],['es','Espírito Santo'],['go','Goiás'],['ma','Maranhão'],
    ['mt','Mato Grosso'],['ms','Mato Grosso del Sur'],['mg','Minas Gerais'],['pa','Pará'],
    ['pb','Paraíba'],['pr','Paraná'],['pe','Pernambuco'],['pi','Piauí'],['rj','Río de Janeiro'],
    ['rn','Río Grande del Norte'],['rs','Río Grande del Sur'],['ro','Rondonia'],['rr','Roraima'],
    ['sc','Santa Catarina'],['sp','São Paulo'],['se','Sergipe'],['to','Tocantins']
  ]},
  UY: { label: 'departamentos', list: [
    ['art','Artigas'],['can','Canelones'],['cl','Cerro Largo'],['col','Colonia'],['dur','Durazno'],
    ['flo','Flores'],['fda','Florida'],['lav','Lavalleja'],['mal','Maldonado'],['mvd','Montevideo'],
    ['pay','Paysandú'],['rn','Río Negro'],['riv','Rivera'],['roc','Rocha'],['sal','Salto'],
    ['sj','San José'],['sor','Soriano'],['tt','Tacuarembó'],['tyt','Treinta y Tres']
  ]},
  CL: { label: 'regiones', list: [
    ['ap','Arica y Parinacota'],['ta','Tarapacá'],['an','Antofagasta'],['at','Atacama'],
    ['co','Coquimbo'],['vs','Valparaíso'],['rm','Metropolitana de Santiago'],['li',"O'Higgins"],
    ['ml','Maule'],['nb','Ñuble'],['bi','Biobío'],['ar','La Araucanía'],['lr','Los Ríos'],
    ['ll','Los Lagos'],['ai','Aysén'],['ma','Magallanes']
  ]},
  VA: { label: 'subdivisiones', list: [] }
};

const CONT_NAMES = {
  EU: 'Europa', SA: 'Sudamérica', NA: 'Norteamérica',
  AS: 'Asia', AF: 'África', OC: 'Oceanía'
};

const out = `/* Datos del mapa mundial para el Perfil de Viajero.
 * Generado desde world-atlas 110m (Natural Earth) + world-countries.
 * - PATHS: geometría SVG simplificada, proyección equirectangular, viewBox 2000x1000
 *   (recortado a lat 84°N–58°S: sin Antártida ni casquete ártico).
 * - DOTS: micro-estados sin geometría a esta resolución, dibujados como punto.
 * - COUNTRIES: los 195 países soberanos (193 miembros ONU + Vaticano + Palestina).
 * - SUBDIVISIONS: nivel administrativo "natural" de cada país (no ISO 3166-2 crudo,
 *   que para UK/FR baja a un detalle inútil para contar viajes).
 * No editar a mano: regenerar con scripts/build-map.js si hace falta.
 */
const WORLD_VIEWS = ${JSON.stringify(views)};

const WORLD_CONTINENTS = ${JSON.stringify(CONT_NAMES)};

const WORLD_COUNTRIES = ${JSON.stringify(meta)};

const WORLD_DOTS = ${JSON.stringify(dots)};

const WORLD_SUBDIVISIONS = ${JSON.stringify(SUBS)};

const WORLD_PATHS = ${JSON.stringify(paths)};
`;

fs.writeFileSync('world-map-data.js', out);
console.log('world-map-data.js:', (fs.statSync('world-map-data.js').size / 1024).toFixed(1), 'KB');
console.log('views:', JSON.stringify(views));
Object.entries(SUBS).forEach(([k, v]) => console.log(' ', k, v.list.length, v.label));
