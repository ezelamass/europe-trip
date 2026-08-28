import { launch, BASE, SHOT_DIR, check, finish } from './browser.mjs';

const browser = await launch();
const ctx = await browser.newContext({ viewport: { width: 430, height: 932 } });
const page = await ctx.newPage();
const errors = [];
page.on('pageerror', e => errors.push(e.message));

const nav = (label) => page.locator(`nav button:has-text("${label}")`).first();
const n = (s) => Number((s || '').replace(/[^\d]/g, ''));

/** El itinerario dejó de ser un tab: se entra por la card del viaje. */
async function abrirViaje(id) {
  await nav('Viajes').click();
  await page.waitForTimeout(600);
  if (!(await page.locator(`[data-trip="${id}"]`).count())) {
    await page.locator('button:has-text("Pasados")').click();
    await page.waitForTimeout(700);
  }
  await page.locator(`[data-trip="${id}"] button`).first().click();
  await page.waitForTimeout(900);
}

/** Las herramientas del viaje se abren desde Inicio. */
async function irAHerramienta(label) {
  await nav('Inicio').click();
  await page.waitForTimeout(600);
  await page.locator(`main button:has-text("${label}")`).first().click();
  await page.waitForTimeout(800);
}

await page.goto(BASE);
await page.evaluate(() => localStorage.clear());
await page.reload({ waitUntil: 'networkidle' });
await page.waitForTimeout(1000);

// --- El toggle de mamá descuenta su tramo ---
await abrirViaje('europa-2026');
const antes = await page.locator('[data-stat="Alojamiento"]').textContent();
await page.locator('label:has-text("Mamá paga su tramo") input').check();
await page.waitForTimeout(400);
const despues = await page.locator('[data-stat="Alojamiento"]').textContent();
check('el toggle de mamá descuenta el alojamiento de su tramo', n(despues) < n(antes),
      `${antes?.trim()} → ${despues?.trim()} (−$${n(antes) - n(despues)})`);
await page.locator('label:has-text("Mamá paga su tramo") input').uncheck();
await page.waitForTimeout(400);

// --- El total incluye hacks / reservas / quests ---
const chips = await page.locator('main span:has-text("Hacks $"), main span:has-text("Reservas de tren")').count();
check('el desglose muestra lo que el total incluye además del itinerario', chips >= 2, `${chips} chips`);

// --- El Interrail se mueve con Verano Joven ---
const tarjetaInterrail = () =>
  page.locator('main .rounded-2xl').filter({ hasText: 'Pase de Interrail' }).first();
await irAHerramienta('Hacks');
const conBeneficio = await tarjetaInterrail().textContent();
await irAHerramienta('Beneficios');
await page.locator('button[aria-label="Desactivar"]').first().click();
await page.waitForTimeout(400);
await irAHerramienta('Hacks');
const sinBeneficio = await tarjetaInterrail().textContent();
const costo = (s) => (s || '').match(/Cuesta \$(\d+)/)?.[1];
check('el Interrail se encarece al apagar Verano Joven',
      costo(conBeneficio) !== costo(sinBeneficio),
      `$${costo(conBeneficio)} → $${costo(sinBeneficio)}`);

// --- Los viajes sudamericanos dibujan su mapa ---
await abrirViaje('brasil-2026');
await page.locator('button:has-text("Mapa")').click();
await page.waitForTimeout(2500);
const marcadores = await page.locator('.leaflet-marker-icon').count();
const sinCoords = await page.locator('text=sin coordenadas cargadas').count();
check('Brasil dibuja sus paradas en el mapa', marcadores === 2 && sinCoords === 0,
      `${marcadores} marcadores, ${sinCoords} avisos`);
if (SHOT_DIR) await page.screenshot({ path: `${SHOT_DIR}/mapa-brasil.png` });

await abrirViaje('europa-2026');
await page.locator('button:has-text("Mapa")').click();
await page.waitForTimeout(2500);
const faltanEu = await page.locator('text=sin coordenadas cargadas').count();
const marcadoresEu = await page.locator('.leaflet-marker-icon').count();
check('Europa 2026 resuelve las 19 paradas (Mallorca incluida)', faltanEu === 0 && marcadoresEu === 19,
      `${marcadoresEu} marcadores`);

// --- Un respaldo corrupto no puede romper la app ---
await nav('Viajes').click();
await page.waitForTimeout(700);
await page.setInputFiles('input[type=file]', {
  name: 'roto.json', mimeType: 'application/json',
  buffer: Buffer.from(JSON.stringify({ travelProfile: { AR: { visits: 1, subs: [] } }, tripStops: null })),
});
await page.waitForTimeout(700);
check('un respaldo con tripStops:null no rompe la app', (await page.locator('text=Mis viajes').count()) > 0);
await abrirViaje('europa-2026');
check('el itinerario sigue renderizando tras el import inválido',
      (await page.locator('[data-stat="Total estimado"]').count()) > 0);

await finish(browser, errors);
