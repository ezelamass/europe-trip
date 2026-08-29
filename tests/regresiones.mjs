/* Cubre los bugs que encontró el code review, para que no vuelvan. */
import { launch, BASE, check, finish } from './browser.mjs';

const browser = await launch();
const ctx = await browser.newContext({ viewport: { width: 430, height: 932 } });
const page = await ctx.newPage();
const errors = [];
page.on('pageerror', (e) => errors.push(e.message));

const nav = (label) => page.locator(`nav button:has-text("${label}")`).first();

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

await page.goto(BASE);
await page.evaluate(() => localStorage.clear());
await page.reload({ waitUntil: 'networkidle' });
await page.waitForTimeout(1000);

// --- El ahorro incluye los beneficios UE, no solo los hacks ---
await abrirViaje('europa-2026');
const ahorro = await page.locator('main span:has-text("Ahorro")').first().textContent();
const monto = Number((ahorro || '').replace(/[^\d]/g, ''));
// 1.414,50 EUR (915 de beneficios + 499,50 de hacks) → ~1.615 USD. Contando solo
// los hacks daban ~570, un tercio.
check('el ahorro suma beneficios y hacks', monto > 1000, (ahorro || '').trim());

// --- Las reservas de tren se pueden cambiar ---
const chip = () => page.locator('main span:has-text("Reservas de tren")').first();
const antes = await chip().textContent();
await page.locator('button[aria-label="Una reserva más"]').click();
await page.waitForTimeout(400);
const despues = await chip().textContent();
check('el contador de reservas ya no está congelado', antes !== despues,
      `${(antes || '').trim()} → ${(despues || '').trim()}`);
await page.locator('button[aria-label="Una reserva menos"]').click();
await page.waitForTimeout(300);

// --- Borrar una parada pide confirmación ---
let preguntó = false;
page.on('dialog', async (d) => { preguntó = true; await d.dismiss(); });
const paradasAntes = await page.locator('main [data-stat="Total estimado"]').count();
await page.locator('button[aria-label="Eliminar parada"]').first().click();
await page.waitForTimeout(500);
check('borrar una parada pide confirmación', preguntó);
check('al cancelar no se borra nada', (await page.locator('main [data-stat="Total estimado"]').count()) === paradasAntes);

// --- El hack del Interrail no muestra etiquetas HTML crudas ---
await nav('Inicio').click();
await page.waitForTimeout(600);
await page.locator('main button:has-text("Hacks")').first().click();
await page.waitForTimeout(800);
const interrail = await page.locator('main .rounded-2xl').filter({ hasText: 'Pase de Interrail' }).first().textContent();
check('el hack no muestra etiquetas HTML crudas', !/<em>|<\/em>|<strong>/.test(interrail || ''),
      /<em>/.test(interrail || '') ? 'se ven los tags' : 'renderiza como markup');

// --- "Agregar país" no borra un país ya cargado ---
await nav('Mi Mundo').click();
await page.waitForTimeout(1500);
const paísesAntes = await page.locator('[data-stat="Países"]').textContent();
await page.locator('main button:has-text("Agregar país")').click();
await page.waitForTimeout(500);
await page.locator('input[placeholder*="Buscar"]').fill('Argentina');
await page.waitForTimeout(400);
await page.locator('.fixed button:has-text("Argentina")').first().click();
await page.waitForTimeout(600);
await page.keyboard.press('Escape');
await page.waitForTimeout(400);
const paísesDespués = await page.locator('[data-stat="Países"]').textContent();
check('el selector no borra un país ya cargado', paísesAntes === paísesDespués,
      `${(paísesAntes || '').trim()} → ${(paísesDespués || '').trim()}`);

// --- Un respaldo con `nights` inválido no produce NaN ---
await nav('Viajes').click();
await page.waitForTimeout(700);
await page.setInputFiles('input[type=file]', {
  name: 'roto.json',
  mimeType: 'application/json',
  buffer: Buffer.from(JSON.stringify({
    travelProfile: { AR: { visits: 1, subs: [] } },
    tripStops: { 'europa-2026': [{ id: 'stop-1', city: 'Madrid' }] },
  })),
});
await page.waitForTimeout(700);
await abrirViaje('europa-2026');
const cuerpo = await page.locator('main').textContent();
check('un respaldo sin `nights` no renderiza NaN', !/NaN/.test(cuerpo || ''),
      /NaN/.test(cuerpo || '') ? 'aparece NaN' : 'sin NaN');

// --- Recorrido animado: una parada cada 3 s ---
// El check anterior dejó el itinerario con una sola parada (importó un respaldo
// roto a propósito), así que se arranca de limpio.
await page.evaluate(() => localStorage.clear());
await page.reload({ waitUntil: 'networkidle' });
await page.waitForTimeout(1000);
await abrirViaje('europa-2026');
await page.locator('button:has-text("Mapa")').click();
await page.waitForTimeout(2500);
const todas = await page.locator('.leaflet-marker-icon').count();

await page.locator('button:has-text("Ver recorrido")').click();
await page.waitForTimeout(1200);
const paso1 = await page.locator('.leaflet-marker-icon').count();
check('el recorrido arranca en la primera parada', paso1 === 1, `${paso1} de ${todas}`);
check('la tarjeta dice en qué parada va',
      /Parada 1 de/.test((await page.locator('text=/Parada \\d+ de \\d+/').first().textContent()) || ''));

// La tarjeta no puede quedar detrás de la barra inferior.
const card = await page.locator('text=/Parada \\d+ de \\d+/').first().boundingBox();
const barra = await page.locator('nav').last().boundingBox();
check('la tarjeta del recorrido no queda tapada por la barra',
      !!card && !!barra && card.y + card.height < barra.y);

await page.waitForTimeout(3000);
const paso2 = await page.locator('.leaflet-marker-icon').count();
check('avanza una parada cada 3 s', paso2 === paso1 + 1, `${paso1} → ${paso2}`);

await page.locator('button:has-text("Detener")').click();
await page.waitForTimeout(1200);
const trasDetener = await page.locator('.leaflet-marker-icon').count();
check('al detener vuelve a la ruta completa', trasDetener === todas, `${trasDetener} de ${todas}`);
check('la tarjeta desaparece al detener',
      (await page.locator('text=/Parada \\d+ de \\d+/').count()) === 0);

await finish(browser, errors);
