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
| UI | **React 18 + TypeScript** | 7 viajes comparten la misma UI: los componentes se amortizan solos. |
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
```

## Estructura

```
src/
  data/
    trips.ts        # los 7 viajes — espejo de viajes/ del segundo cerebro
    europa2026.ts   # data curada de ese viaje (beneficios, quests, valija, itinerario)
    worldMap.ts     # GENERADO — geometría y metadata de los 195 países (ver scripts/)
  store/
    useStore.ts     # estado + persistencia + export/import
    legacy.ts       # migración one-shot desde el localStorage de la app vieja
  tabs/             # una tab por pantalla
  components/       # Modal, StatTile, WorldMap, RouteMap, BackupPanel
  lib/format.ts     # moneda, fechas, banderas, distancias
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
viajero, los ajustes y el itinerario de Europa 2026. Sin ese puente, la primera apertura
de esta versión habría borrado los países y regiones cargados a mano.

El razonamiento completo de la migración está en
`perfil/decision-migrar-planner-react.md` del segundo cerebro.

## Mapa mundial

`src/data/worldMap.ts` está generado. Para regenerarlo o agregar las subdivisiones de un
país nuevo, ver [`scripts/README.md`](scripts/README.md).
