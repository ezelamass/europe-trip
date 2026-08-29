import { launch, BASE, SHOT_DIR, check, finish } from './browser.mjs';

const browser = await launch();
const ctx = await browser.newContext({ viewport: { width: 430, height: 932 }, deviceScaleFactor: 2 });
const page = await ctx.newPage();

const errors = [];
page.on('pageerror', e => errors.push('PAGEERROR: ' + e.message));

const nav = (label) => page.locator(`nav button:has-text("${label}")`).first();

await page.goto(BASE, { waitUntil: 'networkidle' });
await page.waitForTimeout(1200);

// --- Inicio: hay un viaje en curso, así que abre en el hero de ese viaje ---
check('Inicio abre en el viaje en curso', await page.locator('text=En curso').count() > 0);
const progreso = await page.locator('text=/Día \\d+ de \\d+/').first().textContent();
check('muestra el progreso del viaje', /Día \d+ de 76/.test(progreso || ''), (progreso || '').trim());
const estasEn = await page.locator('text=Estás en').locator('..').textContent();
check('dice en qué parada estás hoy', /\w/.test(estasEn || ''),
      (estasEn || '').replace(/\s+/g, ' ').trim().slice(0, 60));
if (SHOT_DIR) await page.screenshot({ path: `${SHOT_DIR}/inicio.png` });

// --- las 4 tabs de la barra ---
const tabs = (await page.locator('nav button').allTextContents()).map(t => t.trim()).filter(Boolean);
check('la barra tiene 4 destinos', tabs.length === 4, tabs.join(' / '));

// --- Viajes: segmented control y cards con foto ---
await nav('Viajes').click();
await page.waitForTimeout(800);
const activos = await page.locator('[data-trip]').count();
check('Activos muestra el viaje en curso', activos === 1, `${activos} card(s)`);

const pestanas = await page.locator('main .rounded-full button').allTextContents();
check('hay una pestaña de Futuros', pestanas.some((x) => /Futuros/.test(x)),
      pestanas.map((x) => x.trim()).join(' / '));

await page.locator('button:has-text("Futuros")').click();
await page.waitForTimeout(900);
const futuros = await page.locator('[data-trip]').count();
check('Futuros muestra el viaje planificado', futuros === 1, `${futuros} card(s)`);

const cardFutura = (await page.locator('[data-trip="brasil-2027"]').textContent()) || '';
check('la card futura dice cuánto falta, no cuántas noches',
      /faltan \d+ días/.test(cardFutura), cardFutura.match(/faltan \d+ días/)?.[0] || '(no)');
check('y está marcada como planificada', /Planificado/i.test(cardFutura));

await page.locator('button:has-text("Pasados")').click();
await page.waitForTimeout(1000);
const pasados = await page.locator('[data-trip]').count();
check('Pasados muestra los 8 viajes terminados', pasados === 8, `${pasados} cards`);

const conFoto = await page.locator('[data-trip] img').count();
check('cada card pasada tiene su foto de portada', conFoto === 8, `${conFoto}/8 con imagen`);

// Las portadas son `loading="lazy"`: hay que llegar hasta abajo para que las
// últimas se pidan. Medir sin scrollear daba una falla falsa.
await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
await page.waitForTimeout(1500);
const cargadas = await page.locator('[data-trip] img').evaluateAll(
  imgs => imgs.filter(i => i.complete && i.naturalWidth > 0).length);
check('las portadas cargan de verdad', cargadas === 8, `${cargadas}/8 decodificadas`);
await page.evaluate(() => window.scrollTo(0, 0));
await page.waitForTimeout(400);

const compa = await page.locator('[data-trip="bariloche-2025"]').textContent();
check('la card dice con quién fuiste', /Mati Baigorria/.test(compa || ''));
check('la card linkea el álbum de fotos', /álbum de fotos/i.test(compa || ''));
if (SHOT_DIR) await page.screenshot({ path: `${SHOT_DIR}/viajes.png` });

// --- Detalle de un viaje ---
await page.locator('[data-trip="bariloche-2025"] button').first().click();
await page.waitForTimeout(900);
check('abre el detalle del viaje', (await page.locator('h1:has-text("Bariloche")').count()) > 0);
const paradas = await page.locator('text=/\\d+ parada/').first().textContent();
check('pluraliza bien las paradas', /1 parada$/.test((paradas || '').trim()), (paradas || '').trim());
await page.locator('button[aria-label="Volver"]').click();
await page.waitForTimeout(600);
check('vuelve a la lista', (await page.locator('[data-trip]').count()) > 0);

// --- Métricas ---
await nav('Métricas').click();
await page.waitForTimeout(900);
const noches = await page.locator('[data-stat="Noches de viaje"]').textContent();
check('total de noches sobre los 9 viajes', /141/.test(noches || ''), (noches || '').trim());
// 44 = 37 noches reales en España dentro de Europa 2026 (contadas parada por
// parada) + 7 estimadas de Europa 2015, que no tiene reparto por ciudad y cae al
// promedio entre sus dos países. Con el reparto parejo anterior daban 17.
const esp = await page.locator('text=/España/').first().locator('../..').textContent();
check('noches por país usa el dato real por parada', /44/.test(esp || ''),
      (esp || '').replace(/\s+/g, ' ').trim().slice(0, 40));
if (SHOT_DIR) await page.screenshot({ path: `${SHOT_DIR}/metricas.png`, fullPage: true });

// --- Mi Mundo ---
await nav('Mi Mundo').click();
await page.waitForTimeout(1500);
const paths = await page.locator('main svg path').count();
check('el mapa mundial sigue dibujándose', paths > 150, `${paths} paths`);
const pct = await page.locator('[data-stat="Del mundo"]').textContent();
check('porcentaje del mundo', /%/.test(pct || ''), (pct || '').trim());

await finish(browser, errors);
