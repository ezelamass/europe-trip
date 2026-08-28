import { existsSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { chromium } from 'playwright';

/** Lanza Chromium tolerando entornos donde los browsers de Playwright ya están
 *  preinstalados (`PLAYWRIGHT_BROWSERS_PATH`) en una build distinta de la que espera
 *  la versión del paquete. `CHROMIUM_PATH` fuerza un binario concreto. */
export async function launch() {
  if (process.env.CHROMIUM_PATH) {
    return chromium.launch({ executablePath: process.env.CHROMIUM_PATH });
  }
  try {
    return await chromium.launch();
  } catch (err) {
    const found = findInstalledChromium();
    if (!found) throw err;
    return chromium.launch({ executablePath: found });
  }
}

function findInstalledChromium() {
  const root = process.env.PLAYWRIGHT_BROWSERS_PATH;
  if (!root || !existsSync(root)) return null;
  for (const dir of readdirSync(root)) {
    if (!dir.startsWith('chromium')) continue;
    for (const rel of ['chrome-linux/chrome', 'chrome-linux/headless_shell']) {
      const p = join(root, dir, rel);
      if (existsSync(p)) return p;
    }
  }
  return null;
}

export const BASE = process.env.BASE_URL ?? 'http://127.0.0.1:8099';
export const SHOT_DIR = process.env.SHOT_DIR;

export const check = (name, ok, extra = '') =>
  console.log(`${ok ? 'PASS' : 'FALLA'}  ${name}${extra ? ' → ' + extra : ''}`);
