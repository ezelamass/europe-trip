import { launch, BASE, SHOT_DIR, check } from './browser.mjs';
const browser = await launch();
const ctx = await browser.newContext({ viewport: { width: 430, height: 932 } });
const page = await ctx.newPage();
const errors = [];
page.on('pageerror', e => errors.push(e.message));

// Simula el celular de Eze: estado de la app VIEJA, sin estado nuevo.
await page.goto(BASE);
await page.evaluate(() => {
  localStorage.clear();
  localStorage.setItem('eurotrip_state_lego', JSON.stringify({
    dataVersion: '2026-08-28-1',
    travelProfile: {
      AR: { visits: 5, subs: ['caba', 'ba', 'cor'] },
      JP: { visits: 2, subs: [] },      // país que NO está en ningún viaje documentado
      IT: { visits: 1, subs: ['laz', 'tos'] },
    },
    displayCurrency: 'EUR',
    esimPhoneNumber: '+34600111222',
    appliedBenefits: { veranoJoven: false, tse: true, museos: true, abonoMadrid: true, eyca: true },
    luggageItems: [{ id: 'x1', name: 'Item propio de Eze', category: 'Otros', location: 'Mochila' }],
    customFacts: [{ id: 'mio-1', title: 'Hack propio de Eze', cost: 10, saving: 5, category: 'Tip', desc: '', tip: '' }],
    routeStops: [{ id: 'stop-1', city: 'VIEJO Madrid', nights: 99, accommodationCost: 9999,
                   photosAlbumUrl: 'https://photos.app.goo.gl/ALBUM-VIEJO' }],
  }));
});
await page.reload({ waitUntil: 'networkidle' });
await page.waitForTimeout(1200);

await page.locator('nav button:visible:has-text("Mi Mundo")').first().click();
await page.waitForTimeout(1200);

const paises = await page.locator('[data-stat="Países"]').textContent();
check('migra los paises del perfil viejo', /3\/195/.test(paises||''), (paises||'').replace(/\s+/g,' ').trim());

const regiones = await page.locator('[data-stat="Regiones"]').textContent();
check('migra las regiones marcadas', /5/.test(regiones||''), (regiones||'').replace(/\s+/g,' ').trim());

const japon = await page.locator('main button:has-text("Japón")').count();
check('conserva paises que no salen de ningun viaje (Japon)', japon > 0);

const visitasAR = await page.locator('main button:has-text("Argentina")').textContent();
check('conserva el contador de visitas (AR=5)', /5×/.test(visitasAR||''), (visitasAR||'').replace(/\s+/g,' ').trim());

// La sugerencia de sincronizar debe ofrecer los que faltan (BR, ES, DE, ... y FR)
const banner = await page.locator('text=no están en el perfil').count();
check('ofrece sincronizar los paises de los viajes que faltan', banner > 0);

// Ajustes migrados
await page.locator('nav button:visible:has-text("Viajes")').first().click();
await page.waitForTimeout(400);
await page.locator('nav button:visible:has-text("Itinerario")').first().click();
await page.waitForTimeout(500);
const moneda = await page.locator('button[title="Cambiar moneda de visualización"]').textContent();
check('migra la moneda elegida (EUR)', /EUR/.test(moneda||''), (moneda||'').trim());

// El backup del estado viejo quedó guardado
const backup = await page.evaluate(() => localStorage.getItem('eurotrip_state_lego_backup'));
check('guarda respaldo del estado viejo antes de migrar', !!backup && backup.includes('JP'));

// El estado viejo NO se borra (por si hay que volver atrás)
const viejo = await page.evaluate(() => localStorage.getItem('eurotrip_state_lego'));
check('no destruye el estado de la app vieja', !!viejo);

// El itinerario curado NO se pisa con el guardado viejo (la app vieja tampoco lo hacía
// cuando la dataVersion no coincidía), pero sí se rescata el álbum de fotos.
await page.locator('nav button:visible:has-text("Itinerario")').first().click();
await page.waitForTimeout(600);
const primeraParada = await page.locator('main .rounded-2xl h3').first().textContent();
check('no pisa el itinerario curado con el guardado viejo', !/VIEJO/.test(primeraParada||''), (primeraParada||'').trim());
const paradas = await page.locator('main .rounded-2xl h3').count();
check('conserva las 19 paradas curadas', paradas === 19, `${paradas} paradas`);
const album = await page.evaluate(() => {
  const s = JSON.parse(localStorage.getItem('eurotrip-state')||'{}');
  return s.state?.tripStops?.['europa-2026']?.find(x => x.id === 'stop-1')?.photosAlbumUrl;
});
check('rescata el album de fotos de la parada vieja', album === 'https://photos.app.goo.gl/ALBUM-VIEJO', album||'(ninguno)');

// Los hacks predefinidos no pueden desaparecer al migrar los propios
await page.locator('nav button:visible:has-text("Hacks")').first().click();
await page.waitForTimeout(600);
const hacks = await page.locator('main .rounded-2xl h3').allTextContents();
check('repone los hacks predefinidos junto al propio del usuario',
      hacks.length === 4 && hacks.some(h=>/Interrail/.test(h)) && hacks.some(h=>/Hack propio/.test(h)),
      `${hacks.length}: ${hacks.map(h=>h.trim().slice(0,22)).join(' / ')}`);

console.log('\nErrores:', errors.length ? errors.join(' | ') : 'ninguno');
await browser.close();
