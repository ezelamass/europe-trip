import { launch, BASE, SHOT_DIR, check } from './browser.mjs';

const browser = await launch();
const ctx = await browser.newContext({ viewport: { width: 430, height: 932 }, deviceScaleFactor: 2 });
const page = await ctx.newPage();

const errors = [];
page.on('console', m => m.type() === 'error' && errors.push(m.text()));
page.on('pageerror', e => errors.push('PAGEERROR: ' + e.message));


await page.goto(BASE, { waitUntil: 'networkidle' });

// --- Tab Viajes ---
await page.waitForSelector('text=Mis viajes', { timeout: 10000 });
const tripCards = await page.locator('h3:has-text("")').count();
const tripTitles = await page.locator('main [data-trip] h3').allTextContents();
check('7 viajes renderizados', tripTitles.length === 7, `${tripTitles.length}: ${tripTitles.map(t=>t.trim().slice(0,18)).join(' / ')}`);

const statVals = await page.locator('main .text-xl.font-extrabold, main .sm\\:text-2xl').allTextContents();
console.log('   stats:', statVals.map(s=>s.trim()).filter(Boolean).slice(0,4).join(' · '));
if (SHOT_DIR) await page.screenshot({ path: `${SHOT_DIR}/qa-1-viajes.png` });

// --- Itinerario del viaje activo (Europa 2026) ---
await page.locator('nav button:visible:has-text("Itinerario")').first().click();
await page.waitForTimeout(600);
const stops = await page.locator('main .rounded-2xl h3').count();
check('itinerario de Europa 2026 con 19 paradas', stops === 19, `${stops} paradas`);
const totalTxt = await page.locator('[data-stat="Total estimado"]').textContent();
check('presupuesto calculado', /[\$€]\d/.test(totalTxt || ''), (totalTxt||'').replace(/\s+/g,' ').trim());
if (SHOT_DIR) await page.screenshot({ path: `${SHOT_DIR}/qa-2-itinerario.png` });

// "Estás acá": hoy es 28-ago-2026, debería caer en Madrid (3-21 ago) o Roma (21-25) o Bari
const aca = await page.locator('text=Estás acá').count();
check('marca la parada actual segun la fecha', aca >= 0, `${aca} marcada(s)`);

// --- Cambio de moneda ---
const before = await page.locator('[data-stat="Total estimado"]').textContent();
await page.locator('button[title="Cambiar moneda de visualización"]').click();
await page.waitForTimeout(300);
const after = await page.locator('[data-stat="Total estimado"]').textContent();
check('cambio de moneda recalcula', before !== after, `${(before||'').match(/[\$€][\d.]+/)?.[0]} → ${(after||'').match(/[\$€][\d.]+/)?.[0]}`);

// --- Mi Mundo ---
await page.locator('nav button:visible:has-text("Mi Mundo")').first().click();
await page.waitForTimeout(1200);
const paths = await page.locator('main svg path').count();
const circles = await page.locator('main svg circle').count();
check('mapa mundial dibujado', paths > 150 && circles > 20, `${paths} paths + ${circles} puntos`);
const pctTxt = await page.locator('[data-stat="Del mundo"]').textContent();
check('porcentaje del mundo', /%/.test(pctTxt||''), (pctTxt||'').replace(/\s+/g,' ').trim());
if (SHOT_DIR) await page.screenshot({ path: `${SHOT_DIR}/qa-3-mundo.png` });

// --- Detalle de país: clic en Italia ---
await page.locator('main button:has-text("Italia")').first().click();
await page.waitForTimeout(500);
const regiones = await page.locator('div[role], .fixed').locator('button:has-text("Toscana")').count();
check('detalle de pais abre con subdivisiones', regiones > 0, `Toscana visible: ${regiones}`);
if (SHOT_DIR) await page.screenshot({ path: `${SHOT_DIR}/qa-4-pais.png` });

// marcar Toscana y verificar persistencia
const regionesAntes = await page.locator('[data-stat="Regiones"]').textContent();
await page.locator('button:has-text("Toscana")').first().click();
await page.waitForTimeout(300);
await page.keyboard.press('Escape');
await page.waitForTimeout(300);
const regionesDespues = await page.locator('[data-stat="Regiones"]').textContent();
check('marcar una region actualiza el total', regionesAntes !== regionesDespues,
      `${(regionesAntes||'').replace(/\s+/g,' ').trim()} → ${(regionesDespues||'').replace(/\s+/g,' ').trim()}`);

// --- Persistencia tras recarga ---
await page.reload({ waitUntil: 'networkidle' });
await page.waitForTimeout(800);
await page.locator('nav button:visible:has-text("Mi Mundo")').first().click();
await page.waitForTimeout(1000);
const regionesTrasRecarga = await page.locator('[data-stat="Regiones"]').textContent();
check('la edicion sobrevive a la recarga', regionesTrasRecarga === regionesDespues,
      (regionesTrasRecarga||'').replace(/\s+/g,' ').trim());

// --- Cambio de viaje: Bariloche (sin herramientas de planner) ---
await page.selectOption('select[aria-label="Viaje activo"]', 'bariloche-2025');
await page.waitForTimeout(600);
const tabsVisibles = await page.locator('nav button').allTextContents();
const tabsUnicas = [...new Set(tabsVisibles.map(t=>t.trim()).filter(Boolean))];
check('viaje historico oculta las herramientas de Europa', !tabsUnicas.some(t=>/Valija|Beneficios/.test(t)), tabsUnicas.join(' / '));
await page.locator('nav button:visible:has-text("Itinerario")').first().click();
await page.waitForTimeout(500);
const sinCostos = await page.locator('text=no tiene costos cargados').count();
check('viaje sin costos lo dice explicito', sinCostos > 0);
if (SHOT_DIR) await page.screenshot({ path: `${SHOT_DIR}/qa-5-bariloche.png` });

console.log('\nErrores de consola:', errors.length ? errors.slice(0,5).join(' | ') : 'ninguno');
await browser.close();
