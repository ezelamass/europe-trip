# tests

Suites de regresión en navegador real (Chromium vía Playwright). Cubren lo que se
rompió al migrar de HTML puro a React, así que están escritas contra la UI, no contra
funciones sueltas.

| Archivo | Qué cubre |
|---|---|
| `app.mjs` | Que las 7 tarjetas de viaje, el itinerario, el presupuesto y el mapa mundial rendericen con los números correctos |
| `presupuesto.mjs` | Los arreglos del code review: descuento de mamá, desglose del total, Interrail dinámico, coordenadas, respaldo corrupto |
| `migracion.mjs` | El puente desde el `localStorage` de la app vieja — la parte que puede perder datos de Eze |

Los selectores usan `data-stat` y `data-trip`, que existen para esto.

```bash
npm run build
npx http-server dist -p 8099 --silent &
npm test
```

`BASE_URL` cambia el host (default `http://127.0.0.1:8099`); `SHOT_DIR` guarda capturas.

## Nota

`app.mjs` puede reportar un `404` de consola si quedó registrado un service worker de
un build anterior pidiendo un asset con hash viejo. No se reproduce en una carga limpia
y no es un defecto de la app; para evitarlo, servir siempre el `dist/` recién generado.
