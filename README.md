# Mis Viajes

Planner y diario de viajes personal. Una sola persona lo usa (Eze), en el celular,
muchas veces **sin señal** — de ahí que sea una PWA que precachea todo y funciona offline.

La versión narrativa de cada viaje vive en la carpeta `viajes/` del segundo cerebro
(repo `elamas-second-brain`). Esta app es la parte operativa: itinerarios, presupuesto,
mapa y perfil de viajero.

## Stack

| Qué | Con qué | Por qué |
|---|---|---|
| Build | **Vite** | Estático puro. La app no necesita servidor. |
| UI | **React 18 + TypeScript** | 10 viajes comparten la misma UI: los componentes se amortizan solos. |
| Estado | **Zustand** + `persist` | Reemplaza el `renderAll()` manual de la versión anterior. |
| Estilos | **Tailwind** (compilado) | Antes venía del CDN; compilarlo lo hace confiable offline. |
| Offline | **vite-plugin-pwa** (Workbox) | Precachea el bundle; los tiles del mapa van cache-first. |
| Mapas | **Leaflet** (ruta) + SVG propio (mundo) | El mapa mundial es geometría generada, sin librería. |

Fuentes e iconos son **self-hosted**: la versión anterior los traía de Google Fonts y
FontAwesome por CDN y offline se rompían.

```bash
npm install
npm run dev        # desarrollo
npm run build      # -> dist/
npm run typecheck

# tests de regresión en navegador real (ver tests/README.md)
npx http-server dist -p 8099 --silent &
npm test
```

## Navegación

Cuatro destinos en la barra inferior: **Inicio**, **Viajes** (`Activos | Futuros | Pasados`),
**Mi Mundo** (mapa) y **Métricas**.

**Inicio** muestra el viaje en curso; si no hay ninguno, el próximo planificado con su cuenta
regresiva; y recién si tampoco hay eso, el archivo. Un viaje **planificado** no suma a las
métricas —noches, kilómetros, compañeros— porque todavía no pasó: eso lo decide
`happenedTrips()` en `src/data/trips.ts`.
Las herramientas de un viaje —beneficios, hacks, valija, side quests— se abren desde
Inicio, no desde la barra. El detalle de un viaje es una vista apilada, no un tab.

El diseño y de dónde sale cada decisión están en
[`docs/07-rediseno-mobile.md`](docs/07-rediseno-mobile.md).

## Estructura

```
src/
  data/
    trips.ts        # los 10 viajes — espejo de viajes/ del segundo cerebro
    europa2026.ts   # data curada de ese viaje (beneficios, quests, valija, itinerario)
    worldMap.ts     # GENERADO — metadata de los 195 países y sus subdivisiones
    worldGeometry.ts# GENERADO — solo los paths SVG; separado para que no entren
                    #   al chunk inicial (ver la nota de bundle abajo)
    coordinates.ts  # coordenadas por ciudad, única fuente para el mapa de ruta
    countryOfStop.ts# saca el país del nombre de la parada ("Roma (Italia)")
    covers.ts       # portadas de los viajes + créditos (public/covers/)
  store/
    useStore.ts     # estado + persistencia + export/import
    legacy.ts       # migración one-shot desde el localStorage de la app vieja
  tabs/             # una tab por pantalla
  views/            # pantallas apiladas (detalle de viaje)
  components/       # Modal, StatTile, TripCard, BottomNav, WorldMap, RouteMap…
  lib/
    format.ts       # moneda, fechas, banderas, distancias
    budget.ts       # el cálculo del presupuesto, en un solo lugar
    stats.ts        # las métricas, derivadas de los viajes
    useMoney.ts     # formateador ligado a la moneda elegida
tests/              # suites de regresión en Chromium (ver tests/README.md)
```

## Modelo de datos

`Trip` es la entidad de primer nivel. Cada viaje trae sus paradas, países, compañía y
links (fotos, alojamiento). Las **herramientas de planificación** (beneficios UE, hacks,
side quests, valija) están scopeadas al viaje que las usa vía `hasPlannerTools`: en un
viaje histórico esas tabs directamente no aparecen.

**Perfil de viajero** (`travelProfile`) es dato del usuario, separado de los viajes. Los
viajes *sugieren* países mediante un banner de sincronización, pero nunca escriben solos
sobre lo que el usuario cargó a mano.

## Reglas de persistencia

Dos clases de datos con reglas opuestas, y la distinción importa:

- **Contenido de la app** (itinerarios, valija, quests, catálogo): al subir `DATA_VERSION`
  en `src/store/useStore.ts`, lo hardcodeado **pisa** lo guardado en el celular. Es como
  se publican correcciones de datos.
- **Datos del usuario** (`travelProfile`): **nunca** se pisan, pase lo que pase con la
  versión. Los cargó una persona; la app no tiene derecho a borrarlos.

Además hay **export/import** en la tab Viajes. Todo vive en el `localStorage` del
dispositivo, así que si se limpian los datos del navegador se pierde: el respaldo es la
única red. La app también guarda una copia del estado de la versión vieja en
`eurotrip_state_lego_backup` antes de migrarlo, y no borra el original.

## Migración desde la versión HTML

La versión anterior era un solo `index.html` de 368 KB y guardaba en la clave
`eurotrip_state_lego`. La nueva usa `eurotrip-state`, así que `src/store/legacy.ts` lee el
estado viejo **una sola vez** (solo si todavía no hay estado nuevo) y trae el perfil de
viajero, los ajustes, la valija y los hacks propios. Sin ese puente, la primera apertura
de esta versión habría borrado los países y regiones cargados a mano.

Del itinerario viejo se rescatan **solo los álbumes de fotos**, no las paradas: la app
anterior restauraba `routeStops` únicamente cuando la `dataVersion` guardada coincidía, y
si no volvía al dato curado. Copiarlo entero habría pisado con datos viejos las
correcciones publicadas después.

El razonamiento completo de la migración está en
`perfil/decision-migrar-planner-react.md` del segundo cerebro.

## Recorrido animado

En la vista de mapa de un viaje, **Ver recorrido** revela las paradas de a una cada 3 s
(`MS_POR_PARADA` en `src/components/RouteMap.tsx`), encuadrando cada tramo entre la parada
anterior y la nueva, con una tarjeta encima del mapa que dice dónde va. Al terminar —o al
tocar Detener— vuelve a la ruta completa. Solo entran al recorrido las paradas que tienen
coordenadas en `src/data/coordinates.ts`.

## Fotos de portada

Diez imágenes de Wikimedia Commons en `public/covers/` (WebP 800×450, 468 KB en total),
precacheadas para que la pantalla principal no quede vacía sin señal.
`npm run covers` las regenera. Ocho de las diez son **CC BY / CC BY-SA**, que exigen
atribución: autor, licencia y origen de cada una están en `src/data/covers.json` y ese archivo
es la atribución del proyecto. La app no la muestra en pantalla (la tarjeta de créditos se sacó
a pedido); si en algún momento se quiere una app sin ninguna obligación de atribuir, hay que
reemplazar esas cinco por imágenes CC0.

## Bundle

El mapa mundial son ~65 KB de geometría SVG y Leaflet otros ~157 KB, y ninguno de los
dos hace falta para abrir la app. Los dos viven en chunks lazy, pero eso **solo funciona
si ningún módulo eager los importa**: `worldMap.ts` (metadata de países) y
`worldGeometry.ts` (los paths) están separados justamente porque `format.ts` y
`TripsTab` necesitan el primero, y si compartieran archivo Rollup arrastraría el segundo
al chunk inicial. Si al tocar imports el `index-*.js` crece de golpe ~65 KB, es esto.

## Mapa mundial

`src/data/worldMap.ts` y `src/data/worldGeometry.ts` están generados. Para regenerarlos o agregar las subdivisiones de un
país nuevo, ver [`scripts/README.md`](scripts/README.md).
