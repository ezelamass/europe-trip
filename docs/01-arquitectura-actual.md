# 01 — Arquitectura actual (diagnóstico)

Estado del código al commit `2986f03`. Este documento describe **cómo funciona la
app hoy**, sin idealizar, y marca exactamente qué bloquea el salto a multi-viaje.

## Layout de archivos

```
index.html      4.784 líneas (~330 KB)  — TODA la app: markup + Tailwind CDN + un <script> gigante
sw.js              84 líneas            — service worker (PWA offline)
manifest.json      20 líneas
icon.svg
```

No hay build, ni dependencias npm, ni módulos. Tailwind, Font Awesome, Leaflet y
las fuentes entran por CDN. Se despliega en Vercel como sitio estático.

## Estado en memoria

Un único objeto plano (`index.html:2099`):

```js
let state = {
  customFacts: [], routeStops: [], sideQuests: [], catalogCities: [], luggageItems: [],
  highSpeedReservations: 3, reservationAvgCost: 15,
  countdownDate: new Date("2026-06-24T00:00:00"),
  baseFlightUSD: 1076, includeBaseFlight: true,
  usdToEurRate: 0.8757, displayCurrency: 'USD',
  backpackExpanded, backpackUsbConnected, mamaPaysMomTrip, routeFullScreen, esimPhoneNumber,
  appliedBenefits: { veranoJoven, tse, museos, abonoMadrid, eyca }
};
```

**Acá está el problema de fondo del multi-viaje:** este objeto mezcla, sin ninguna
separación, tres cosas distintas:

| Tipo | Campos | Debería ser |
|---|---|---|
| Contenido del viaje | `routeStops`, `sideQuests`, `luggageItems`, `customFacts`, `appliedBenefits`, `countdownDate` | por viaje |
| Presupuesto del viaje | `baseFlightUSD`, `includeBaseFlight`, `highSpeedReservations`, `mamaPaysMomTrip` | por viaje |
| Preferencias globales | `displayCurrency`, `usdToEurRate`, `routeFullScreen`, `esimPhoneNumber` | global |

Todas las funciones de render leen `state.routeStops` directo. Son **~20 funciones**
las que habría que reapuntar a "el viaje activo".

## Persistencia y el contrato de `DATA_VERSION`

Una sola clave: `localStorage['eurotrip_state_lego']`. La lógica de carga
(`index.html:2127`) es:

1. Sembrar **siempre** desde los arrays hardcodeados (`DEFAULT_ROUTE_STOPS`,
   `DEFAULT_SIDE_QUESTS`, `DEFAULT_LUGGAGE_ITEMS`, `BASE_CATALOG_CITIES`).
2. Leer lo guardado.
3. **Si `dataVersion` coincide** → restaurar contenido del usuario encima.
4. **Si NO coincide** → descartar el contenido guardado; mandan los hardcodeados.
5. Las preferencias de UI se restauran siempre, coincida o no la versión.

El comentario en el código lo dice explícitamente:

> ⚠️ FUENTE DE VERDAD: estos datos hardcodeados mandan sobre lo guardado en el celu.

### Por qué esto no sobrevive al multi-viaje

Es un contrato de **"el HTML gana, el dispositivo pierde"**. Sirve mientras el
contenido sea regenerable — un itinerario futuro que se edita pidiéndole cambios a
Claude. Deja de servir en cuanto haya:

- **Viajes archivados**: fotos, notas y estampas de un viaje terminado son
  recuerdos irreemplazables. Un bump de versión los borraría.
- **Viajes creados por el usuario**: no existen en los datos hardcodeados, así que
  el paso 4 los borra enteros y no hay nada que los reponga.

Ya existe **un parche puntual** (`index.html:2156`): al no coincidir la versión, se
rescatan los `photosAlbumUrl` guardados y se re-inyectan por id de parada. Funciona,
pero es una excepción hecha a mano para un campo. No escala: cada campo nuevo que el
usuario pueda editar necesitaría su propia excepción.

**Conclusión:** hay que reemplazar el modelo entero por migraciones versionadas con
propiedad de campos explícita. Ver [02-modelo-de-datos.md](02-modelo-de-datos.md).

## Cómo se calculan las fechas

No hay fechas por parada. Se **derivan acumulando noches** desde `countdownDate`:

```js
// index.html:3291
let preAccumulator = 0;
const stopDateRanges = state.routeStops.map(stop => {
  const s = new Date(state.countdownDate);
  s.setDate(s.getDate() + preAccumulator);
  preAccumulator += stop.nights;
  ...
});
```

Consecuencias prácticas:

- Cambiar `nights` de una parada **desplaza todas las siguientes**. Es cómodo para
  planificar, pero significa que las fechas no son datos, son un cálculo.
- Un viaje **necesita una fecha de inicio y de fin reales** para decidir si está
  activo o archivado. Hoy el fin es implícito (inicio + suma de noches).
- No se puede representar un hueco entre paradas (un día sin alojamiento cargado).
  El caso que lo puso a prueba fue Bari, que figura 25–30 aunque la reserva dice
  check-in el 26: resultó **no ser un hueco** sino una noche en tránsito (bus nocturno
  Roma→Bari), y se modela dentro del tramo de destino. Ver
  [02-modelo-de-datos.md](02-modelo-de-datos.md#noches-en-tránsito-caso-resuelto-bari).
  La limitación sigue existiendo para una noche que de verdad no pertenezca a ningún
  tramo, pero todavía no apareció ese caso.

Los tramos ya pasados se detectan comparando esas fechas derivadas contra hoy
(`index.html:3288`) y se colapsan en un resumen "N tramos completados". **Esa lógica
es el germen del archivo** y se puede reusar.

## Navegación

Dos niveles, ambos con IDs hardcodeados:

- **Tabs principales** (`switchTab`, `index.html:2304`): `benefits`, `hacks`,
  `itinerary`, `quests`, `luggage`. La función referencia cada botón y cada panel
  por `getElementById` uno por uno, y repite los strings de clases de Tailwind.
  Agregar un tab hoy implica tocar 4 lugares.
- **Sub-vistas del itinerario** (`switchRouteView`, `index.html:3691`):
  `constructor`, `calendar`, `map`.

Para el multi-viaje hace falta un nivel más arriba (viaje activo vs archivo), y
conviene que `switchTab` pase a manejar los tabs por data en vez de por IDs
enumerados a mano.

## Mapa y resolución de coordenadas

Leaflet + tiles de OpenStreetMap. `renderMapView` (`index.html:4556`) dibuja una
polilínea continua entre paradas consecutivas y marcadores numerados. El color del
marcador codifica **el tipo de tramo** (inicio, fin, con Mamá, con Dani, confirmado).

Las coordenadas salen de `getStopCoordinates` (`index.html:3728`):

1. Si la parada tiene `lat`/`lng` propios, los usa. **Ninguna parada los tiene hoy.**
2. Si no, hace *fuzzy match* del nombre de la ciudad contra el diccionario
   `CITY_COORDINATES` (39 entradas), después de sacar emojis con un regex fijo:
   `/🇪🇺|🇨🇿|🇩🇪|🇦🇹|🇧🇪|🇳🇱|🏝️|🗺️/g`
3. Si no matchea, devuelve `null` y **la parada simplemente no se dibuja**, sin aviso.

### Bug confirmado: hay una parada que hoy desaparece del mapa

El regex de emojis no incluye 🇪🇸 ni 🇮🇹, y el diccionario no tiene ninguna entrada de
Mallorca. Ejecutando la lógica real contra los datos reales:

```
Total paradas: 15
SIN coordenadas (no se dibujan en el mapa):
  ✗ 3. Palma de Mallorca (España) 🇪🇸
```

Seis noches del viaje no aparecen en el mapa y nada lo indica. El fallo es
**silencioso por diseño** (el `return null` fue una corrección de un bug peor, donde
las paradas sin coords caían erróneamente en Madrid).

Esto es un bug hoy, pero es un **bloqueante** para el mapa mundial: con más viajes,
más ciudades y más países, el matching por nombre va a fallar cada vez más seguido.
Las coordenadas tienen que ser **datos explícitos en cada parada**, no una inferencia.

## Motor de presupuesto

`renderAll` (`index.html:2861`) recalcula todo en cada render: beneficios UE
aplicados, hechos predefinidos, hechos custom, costo de alojamiento + presupuesto
diario × noches por parada, transporte, y side quests incluidas.

Está fuertemente atado a **este** viaje: los `EUROPEAN_BENEFITS` son beneficios de la
UE para un pasaporte español, `PREDEFINED_FACTS` incluye el Interrail Global Pass,
y hay lógica específica de "mamá paga el tramo con mamá".

Para el archivo hay una pregunta de producto: **un viaje terminado no necesita
"presupuesto restante"**. Ver [03-viajes-y-archivo.md](03-viajes-y-archivo.md).

## PWA / service worker

`sw.js` usa network-first para el shell (así las ediciones del HTML se ven enseguida)
y cache-first para assets de CDN. `CACHE_VERSION = 'eurotrip-cache-v2'` se sube a
mano cuando cambian los assets.

Si se parten datos a archivos separados (`data/*.js`), hay que **agregarlos a
`PRECACHE_URLS` y subir `CACHE_VERSION`**, o la app rompe offline.

## Deuda técnica menor detectada

Cosas chicas encontradas durante el análisis, no bloqueantes, para arreglar de paso:

| Dónde | Qué |
|---|---|
| `index.html:3627` | `"Múnich y Alpes (Alemania) 🇩🇪"` quedó en `CITY_COORDINATES` pero ninguna parada lo usa (sobró del tramo de Alpes que se reemplazó) |
| `getStopCoordinates` | El regex de emojis es una lista fija de banderas; hay que reemplazarlo por un rango Unicode de *regional indicators* o, mejor, eliminarlo usando coords explícitas |
| `switchTab` | Repite strings largos de clases Tailwind por tab; conviene tabla de config |
| `renderMapView` | `lastMapSignature` memoiza sobre `[city, nights, transport, isConfirmed]`; si se agregan filtros por viaje hay que incluirlos en la firma o el mapa no se redibuja |

## Resumen: qué bloquea el multi-viaje

En orden de gravedad:

1. **`state` es un solo viaje mezclado con preferencias globales** → hay que partirlo
   en `settings` + `trips[]` y reapuntar ~20 funciones de render.
2. **`DATA_VERSION` borra contenido del usuario a propósito** → hay que reemplazarlo
   por migraciones con propiedad de campos.
3. **No hay fechas reales de viaje** (sólo noches acumuladas) → hace falta
   `startDate`/`endDate` por viaje para derivar activo vs archivado.
4. **No hay concepto de país** → el país está embebido en un string de display
   (`"Bari / Puglia (Italia) 🇮🇹"`). Las estampas necesitan `countryCode` real.
5. **Las coordenadas se adivinan por nombre y fallan en silencio** → el mapa mundial
   necesita `lat`/`lng` explícitos y validados.
6. **La data vive en un solo `localStorage`** → sin durabilidad ni backup para un
   archivo que pretende durar años.
