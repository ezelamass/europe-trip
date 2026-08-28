import { launch, BASE, SHOT_DIR, check } from './browser.mjs';
const browser = await launch();
const ctx = await browser.newContext({ viewport: { width: 430, height: 932 } });
const page = await ctx.newPage();
const errors = [];
page.on('pageerror', e => errors.push(e.message));

await page.goto(BASE);
await page.evaluate(() => localStorage.clear());
await page.reload({ waitUntil: 'networkidle' });
await page.waitForTimeout(800);

// --- 1. "Mamá paga su tramo" vuelve a existir y descuenta ---
await page.locator('nav button:visible:has-text("Itinerario")').first().click();
await page.waitForTimeout(500);
const antes = await page.locator('[data-stat="Alojamiento"]').textContent();
await page.locator('label:has-text("Mamá paga su tramo") input').check();
await page.waitForTimeout(300);
const despues = await page.locator('[data-stat="Alojamiento"]').textContent();
const n = s => Number((s||'').replace(/[^\d]/g,''));
check('el toggle de mama descuenta el alojamiento de su tramo',
      n(despues) < n(antes), `${antes?.trim()} → ${despues?.trim()} (−$${n(antes)-n(despues)})`);
await page.locator('label:has-text("Mamá paga su tramo") input').uncheck();
await page.waitForTimeout(300);

// --- 2. El total incluye hacks / reservas / quests (desglose visible) ---
const desglose = await page.locator('main span:has-text("Hacks $"), main span:has-text("Reservas de tren")').count();
check('el desglose muestra lo que el total incluye ademas del itinerario', desglose >= 2, `${desglose} chips`);

// --- 3. Interrail se mueve con Verano Joven ---
await page.locator('nav button:visible:has-text("Hacks")').first().click();
await page.waitForTimeout(500);
const interrailCard = () => page.locator('main .rounded-2xl').filter({ hasText: 'Pase de Interrail' }).first();
const interrailOn = await interrailCard().textContent();
await page.locator('nav button:visible:has-text("Beneficios")').first().click();
await page.waitForTimeout(400);
await page.locator('button[aria-label="Desactivar"]').first().click();  // Verano Joven
await page.waitForTimeout(400);
await page.locator('nav button:visible:has-text("Hacks")').first().click();
await page.waitForTimeout(500);
const interrailOff = await interrailCard().textContent();
const costo = s => (s||'').match(/Cuesta \$(\d+)/)?.[1];
check('el Interrail se encarece al apagar Verano Joven',
      costo(interrailOn) !== costo(interrailOff), `$${costo(interrailOn)} → $${costo(interrailOff)}`);

// --- 4. El mapa de un viaje sudamericano ya no sale vacio ---
await page.selectOption('select[aria-label="Viaje activo"]', 'brasil-2026');
await page.waitForTimeout(500);
await page.locator('nav button:visible:has-text("Itinerario")').first().click();
await page.waitForTimeout(400);
await page.locator('button:has-text("Mapa")').click();
await page.waitForTimeout(2500);
const marcadores = await page.locator('.leaflet-marker-icon').count();
const sinCoords = await page.locator('text=sin coordenadas cargadas').count();
check('Brasil dibuja sus paradas en el mapa', marcadores === 2 && sinCoords === 0,
      `${marcadores} marcadores, ${sinCoords} avisos de falta`);
if (SHOT_DIR) await page.screenshot({ path: `${SHOT_DIR}/shot.png` });

// --- 5. Mallorca (que fallaba por el emoji en la clave) ---
await page.selectOption('select[aria-label="Viaje activo"]', 'europa-2026');
await page.waitForTimeout(600);
await page.locator('button:has-text("Mapa")').click();
await page.waitForTimeout(2500);
const marcadoresEu = await page.locator('.leaflet-marker-icon').count();
const faltanEu = await page.locator('text=sin coordenadas cargadas').count();
check('Europa 2026 resuelve todas sus paradas (incl. Mallorca)', faltanEu === 0, `${marcadoresEu} marcadores`);

// --- 6. Un respaldo corrupto no rompe la app ---
await page.locator('nav button:visible:has-text("Viajes")').first().click();
await page.waitForTimeout(500);
const roto = await page.evaluate(() => {
  const store = JSON.parse(localStorage.getItem('eurotrip-state') || '{}');
  return typeof store === 'object';
});
await page.setInputFiles('input[type=file]', {
  name: 'roto.json', mimeType: 'application/json',
  buffer: Buffer.from(JSON.stringify({ travelProfile: { AR: { visits: 1, subs: [] } }, tripStops: null })),
});
await page.waitForTimeout(600);
const sigueViva = await page.locator('text=Mis viajes').count();
check('un respaldo con tripStops:null no rompe la app', sigueViva > 0 && roto);
await page.locator('nav button:visible:has-text("Itinerario")').first().click();
await page.waitForTimeout(600);
const itinerarioVivo = await page.locator('[data-stat="Total estimado"]').count();
check('el itinerario sigue renderizando tras el import invalido', itinerarioVivo > 0);

console.log('\nErrores:', errors.length ? errors.slice(0,3).join(' | ') : 'ninguno');
await browser.close();
