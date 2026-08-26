# 02 — Modelo de datos, migraciones y durabilidad

Este es el documento central del plan. Define el esquema destino, quién es dueño de
cada campo, cómo se migra sin perder recuerdos, y dónde vive la data.

## Esquema destino

```js
{
  schemaVersion: 3,          // versión ESTRUCTURAL (no de contenido). Dispara migraciones.

  settings: {                // global, transversal a todos los viajes
    displayCurrency: 'USD',
    usdToEurRate: 0.8757,
    activeTripId: 'trip-europa-2026',   // null si no hay viaje activo
    esimPhoneNumber: '',
    routeFullScreen: false,
    lastBackupAt: '2026-08-25T10:00:00Z'
  },

  trips: [
    {
      id: 'trip-europa-2026',
      nombre: 'EuroTrip 90',
      subtitulo: 'Tres meses por Europa',
      startDate: '2026-06-24',          // ISO date, SIN hora. Ancla del cálculo de fechas.
      endDate: '2026-09-22',            // explícito. Ver "Fechas" abajo.
      statusOverride: null,             // null = derivar de fechas | 'active' | 'archived' | 'planned'
      coverPhotoUrl: null,
      photosAlbumUrl: null,             // álbum general del viaje (además del de cada parada)

      stops: [ /* Stop */ ],
      sideQuests: [ /* sin cambios de forma */ ],
      luggageItems: [ /* sin cambios de forma */ ],
      customFacts: [ /* sin cambios de forma */ ],

      appliedBenefits: { veranoJoven: true, tse: true, ... },
      budget: {
        baseFlightUSD: 1076,
        includeBaseFlight: true,
        highSpeedReservations: 3,
        reservationAvgCost: 15,
        mamaPaysMomTrip: false
      },

      seedRevision: 4,        // versión del contenido sembrado de ESTE viaje
      createdAt: '2026-05-23T00:00:00Z',
      userCreated: false      // true = lo creó el usuario, nunca se re-siembra
    }
  ]
}
```

### Stop (parada)

Campos nuevos en **negrita**:

```js
{
  id: 'stop-bari',
  city: 'Bari / Puglia (Italia) 🇮🇹',   // string de display, se mantiene
  **cityName: 'Bari'**,                 // nombre limpio, para mapa/estampas/listas
  **countryCode: 'IT'**,                // ISO 3166-1 alpha-2. Requerido.
  **lat: 41.117143**,                   // Requerido. Se acabó el matching por nombre.
  **lng: 16.871871**,

  nights: 5,
  transport: 'Tren',
  cost: 0,
  dailyBudget: 30,
  category: 'Aventura y Naturaleza',
  costLvl: 'Medio',
  core: 'Paisaje',
  hack: '...',

  isConfirmed: true, isFixed: true, isMomTrip: false, isDaniTrip: false, cashAlert: false,
  hotelName, address, accommodationCost, confirmationNumber, flightDetails,
  lodgingCheckIn, lodgingCheckOut, lodgingHost, lodgingContact, lodgingCostNote, lodgingConfirmation,
  photosAlbumUrl,
  itineraryQuestIds: []
}
```

`countryCode` y `lat`/`lng` son los dos campos que habilitan estampas y mapa
mundial. Sin ellos no se puede construir ninguna de las dos features.

> **Nota sobre países múltiples:** una parada puede cubrir más de un país (por
> ejemplo el tramo original "Múnich y Alpes" incluía Baviera y Tirol → DE + AT).
> Se resuelve con un campo opcional `extraCountryCodes: ['AT']`. El país principal
> sigue siendo `countryCode`.

### Stamp (estampa) — derivada, no almacenada

Las estampas **no se guardan en el estado**. Se calculan al vuelo desde
`trips[].stops[].countryCode`. Guardarlas sería duplicar la fuente de verdad y
abrir la puerta a que queden desincronizadas.

Lo único que sí se persiste es la personalización manual, si el usuario la toca:

```js
settings.stampOverrides: {
  'IT:trip-europa-2026': { label: 'Puglia y Roma', ink: '#7f1d1d', rotation: -4 }
}
```

Detalle del generador en [04-estampas-de-pasaporte.md](04-estampas-de-pasaporte.md).

## Fechas: qué se guarda y qué se deriva

Hoy las fechas se derivan acumulando noches desde `countdownDate`. Ese modelo se
**mantiene para editar** (mover una parada corre las siguientes, que es cómodo),
pero el viaje pasa a tener fechas reales:

| Campo | Origen | Por qué |
|---|---|---|
| `trip.startDate` | Explícito | Ancla del cálculo. Ya existe como `countdownDate`. |
| `trip.endDate` | Explícito, con default derivado | Necesario para decidir archivado. Al editar noches se recalcula el default, pero el usuario puede fijarlo. |
| `stop.arrivalDate` / `departureDate` | **Derivado en runtime**, nunca persistido | Evita que se desincronice de `nights`. |

**Regla:** un viaje archivado **congela** sus fechas. Al pasar a `archived` se
escribe `endDate` explícito y no se vuelve a derivar. Un recuerdo no se recalcula.

### Noches en tránsito (caso resuelto: Bari)

El modelo de noches encadenadas no admite huecos, y durante un tiempo pareció que
Bari tenía uno: figuraba 25–30 aunque la reserva dice check-in el 26.

**No era un hueco.** La noche del 25 se pasó a bordo del bus nocturno Itabus de Roma
a Bari (sale 25 ago 23:25, llega 26 ago 05:20). El tramo arranca cuando sale el bus;
el alojamiento empieza al día siguiente. Cargado en `main` (`635b171`).

**Patrón a seguir:** una noche en tránsito (bus o tren nocturno, vuelo con escala
larga) se modela como **parte del tramo de destino**, usando los campos de transporte
que ya existen:

| Campo | Qué lleva |
|---|---|
| `transport` | `"Bus nocturno Itabus (Roma Tiburtina 23:25 → Bari 05:20)"` |
| `cost` | Precio del pasaje, en EUR |
| `flightDetails` | Detalle completo: servicio, terminales, horarios, asiento, equipaje |
| `confirmationNumber` | Código del pasaje |
| `hack` | Aclaración de que esa noche fue a bordo |

> **Ojo con `confirmationNumber`:** los modales lo asignan según haya o no
> `flightDetails` (`index.html:3983` y `:4039`). Con `flightDetails` presente el
> código se muestra como **pasaje**; sin él, como **reserva de alojamiento**. Si un
> tramo tuviera ambos códigos, haría falta separarlos en dos campos.

Por lo tanto **no hace falta** un `stop.gapBefore`, que habría obligado a tocar todo
el cálculo de fechas y el calendario. Se revisa sólo si aparece una noche que de
verdad no pertenezca a ningún tramo.

## Propiedad de campos: quién gana en un conflicto

Este es el reemplazo del contrato "el HTML siempre gana". Cada campo tiene un dueño:

| Propiedad | Qué campos | Regla al re-sembrar |
|---|---|---|
| **SEED** (manda el HTML/JSON) | `city`, `nights`, `transport`, `cost`, `dailyBudget`, `category`, `hotelName`, `address`, `accommodationCost`, `confirmationNumber`, `flightDetails`, `lodging*`, `hack`, `lat`, `lng`, `countryCode` | Sobrescribe siempre |
| **USER** (manda el dispositivo) | `photosAlbumUrl`, `coverPhotoUrl`, notas personales, `stampOverrides`, ítems de valija marcados, quests marcadas | **Nunca** se sobrescribe |
| **MERGE** | `sideQuests`, `luggageItems`, `customFacts` | Unión por `id`: se agregan los nuevos del seed, se conservan los del usuario, no se borra nada |
| **INMUTABLE** | Todo viaje con `userCreated: true` o `status === 'archived'` | El seed **no lo toca jamás** |

La última fila es la más importante: **un viaje archivado es de sólo lectura para el
proceso de siembra.** Es lo que hace seguro seguir editando el HTML sin miedo a
romper recuerdos.

### Implementación sugerida

```js
const FIELD_OWNERSHIP = {
  photosAlbumUrl: 'USER',
  coverPhotoUrl:  'USER',
  notes:          'USER',
  // ...el resto default 'SEED'
};

function reseedTrip(current, seed) {
  if (current.userCreated || deriveStatus(current) === 'archived') return current; // intocable
  if (current.seedRevision >= seed.seedRevision) return current;                   // ya al día

  const merged = { ...current };
  for (const [key, value] of Object.entries(seed)) {
    if (FIELD_OWNERSHIP[key] === 'USER' && current[key] != null) continue;
    merged[key] = value;
  }
  merged.stops = mergeStops(current.stops, seed.stops);  // por id, respetando USER
  merged.seedRevision = seed.seedRevision;
  return merged;
}
```

## Migraciones

`schemaVersion` es **estructural** y sube sólo cuando cambia la forma de los datos.
Es independiente de `seedRevision`, que es de **contenido** y sube por viaje.

```js
const MIGRATIONS = {
  // v1 (actual, plano) -> v2: envolver el viaje único en trips[]
  2: (old) => ({
    schemaVersion: 2,
    settings: {
      displayCurrency: old.displayCurrency ?? 'USD',
      usdToEurRate:    old.usdToEurRate ?? 0.8757,
      esimPhoneNumber: old.esimPhoneNumber ?? '',
      routeFullScreen: old.routeFullScreen ?? false,
      activeTripId: 'trip-europa-2026'
    },
    trips: [{
      id: 'trip-europa-2026',
      nombre: 'EuroTrip 90',
      startDate: '2026-06-24',
      endDate: null,                      // se deriva en el primer render
      stops: old.routeStops ?? [],
      sideQuests: old.sideQuests ?? [],
      luggageItems: old.luggageItems ?? [],
      customFacts: old.customFacts ?? [],
      appliedBenefits: old.appliedBenefits ?? {},
      budget: {
        baseFlightUSD: old.baseFlightUSD ?? 1076,
        includeBaseFlight: old.includeBaseFlight ?? true,
        highSpeedReservations: old.highSpeedReservations ?? 3,
        reservationAvgCost: old.reservationAvgCost ?? 15,
        mamaPaysMomTrip: old.mamaPaysMomTrip ?? false
      },
      seedRevision: 0,
      userCreated: false
    }]
  }),

  // v2 -> v3: countryCode + lat/lng + cityName en cada parada
  3: (s) => ({
    ...s,
    schemaVersion: 3,
    trips: s.trips.map(t => ({
      ...t,
      stops: t.stops.map(st => ({ ...st, ...resolveGeo(st) }))   // usa CITY_COORDINATES + tabla manual
    }))
  })
};

function runMigrations(stored) {
  let s = stored;
  const from = s.schemaVersion ?? 1;
  for (let v = from + 1; v <= CURRENT_SCHEMA_VERSION; v++) {
    if (MIGRATIONS[v]) s = MIGRATIONS[v](s);
  }
  return s;
}
```

**Reglas no negociables:**

1. **Backup antes de migrar.** Guardar el estado crudo en
   `localStorage['eurotrip_backup_v<N>']` antes de correr nada. Si la migración
   tira una excepción, restaurar el backup y mostrar un aviso — jamás dejar al
   usuario con estado a medias.
2. **Las migraciones son puras y se corren una sola vez**, en orden, sin saltear.
3. **Nunca se editan migraciones ya publicadas.** Si una tiene un bug, se agrega la
   siguiente que lo corrige.
4. **`resolveGeo` es de mejor esfuerzo.** Lo que no resuelva queda con
   `lat: null` y se marca en la UI como "parada sin ubicación", visible — nunca
   silencioso como hoy.

## Dónde vive la data (la decisión importante)

Hoy: una clave de `localStorage` en un navegador. Para un diario de años, eso tiene
dos problemas serios.

### El problema

- **Durabilidad:** borrar datos del sitio, cambiar de teléfono o abrir en otro
  navegador = se pierde todo. No hay backup, ni export, ni sincronización.
- **Límite:** `localStorage` ronda los 5 MB. Sólo texto y links, alcanza de sobra
  para decenas de viajes. Pero **hay que mantener la regla de no guardar imágenes
  en base64**, o se rompe.
- **Visibilidad:** el repo es **público por decisión explícita del usuario**. Todo el
  contenido del viaje ya es públicamente legible hoy, porque está hardcodeado en
  `index.html`: álbumes de fotos, direcciones de alojamiento, fechas y códigos de
  reserva. Ver "Nota sobre el repo público" abajo.

### Opciones

| Opción | Durabilidad | Esfuerzo | Offline |
|---|---|---|---|
| **A.** Sólo `localStorage` (hoy) | ✗ Se pierde | — | ✓ |
| **B.** `localStorage` + botón Export/Import JSON | ~ Manual, depende de acordarse | S | ✓ |
| **C.** `data/viajes.json` en el repo + `localStorage` como capa de trabajo | ✓ Versionado en git | M | ✓ (precacheado) |
| **D.** Backend (Supabase, etc.) | ✓ | L | ✗ Necesita red |

La columna de privacidad se sacó de la tabla: con el repo público, **A, B y C exponen
exactamente lo mismo**, porque los datos ya viven en `index.html`. No es un criterio
que distinga entre las opciones.

### Recomendación: C, con B como red de seguridad

**Mover la data a `data/viajes.json` versionado en git.**

Por qué encaja:

- **Coincide con cómo ya se trabaja.** Los datos del viaje se cargan pidiéndoselos a
  Claude, que los commitea. Con C ese flujo pasa a ser el mecanismo de guardado real,
  no un parche.
- **Git es el backup.** Cada cambio queda con historial y se puede revertir. Es
  exactamente lo que un archivo de recuerdos necesita.
- **No cambia la exposición.** Los datos ya están en `index.html`, que es público.
  Moverlos a un JSON del mismo repo no publica nada nuevo.
- **Sigue andando offline.** El JSON entra en `PRECACHE_URLS` del service worker.

Cómo quedaría el flujo de carga:

```
1. fetch('data/viajes.json')        → seed durable (cae al cache si no hay red)
2. runMigrations(seed)
3. Aplicar overlay de localStorage  → ediciones hechas en el celu, respetando propiedad
4. Render
5. Ediciones del celu → localStorage (inmediato)
6. Periódicamente: exportar JSON y commitearlo → vuelve a ser durable
```

El paso 6 es manual y está bien que lo sea: un botón **"Exportar viajes"** que baja
el JSON listo para commitear. **Ese botón (opción B) conviene construirlo primero**,
en la Fase 0, incluso si C se pospone: es la red de seguridad más barata que existe y
hoy no hay ninguna.

### Nota sobre el repo público

**Decisión tomada: el repo queda público.** Queda registrada acá para que no se
vuelva a discutir en cada cambio, y para que sea consciente qué implica:

- Lo que hoy es públicamente legible: links de álbumes de Google Photos ("cualquiera
  con el link"), nombres y direcciones de alojamientos, fechas exactas de estadía,
  presupuestos, y **códigos de reserva** (`OX3D7N`, `AOAI-1-5200897`, `QHH4X`, …).
  Los códigos de reserva son el dato más sensible del conjunto: en algunos operadores
  alcanzan, con el apellido, para consultar o modificar una reserva.
- Con cada viaje nuevo, ese conjunto crece.

**Qué implica para el plan:** nada bloqueante. La opción C sigue siendo la
recomendada, porque la exposición no cambia respecto de hoy.

Si en algún momento se quiere acotar sin pasar el repo a privado, la vía más simple
es sacar del repo sólo los códigos de reserva y los links de fotos —dejándolos vivir
únicamente en `localStorage` y en el JSON exportado— y mantener en git el resto del
itinerario. Es una variante de C, no un cambio de rumbo.

## Funciones de acceso que hay que introducir

Para no repetir `state.trips.find(...)` por todos lados:

```js
function activeTrip()   { return state.trips.find(t => t.id === state.settings.activeTripId) ?? null; }
function tripById(id)   { return state.trips.find(t => t.id === id) ?? null; }
function archivedTrips(){ return state.trips.filter(t => deriveStatus(t) === 'archived')
                                            .sort((a,b) => b.startDate.localeCompare(a.startDate)); }
function allStops()     { return state.trips.flatMap(t => t.stops.map(s => ({ ...s, tripId: t.id }))); }
function visitedCountries() {
  const map = new Map();   // countryCode -> { visits, tripIds, firstDate }
  ...
  return map;
}
```

`activeTrip()` es el punto de corte del refactor: **toda función de render que hoy
lee `state.routeStops` pasa a leer `activeTrip().stops`**, y tiene que tolerar
`null` (no hay viaje activo).
