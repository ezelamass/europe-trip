# 03 — Viajes, viaje activo y archivo

Spec de la funcionalidad principal: la app deja de ser "un viaje" y pasa a ser
"mis viajes", con un viaje activo al frente y los pasados archivados.

## La regla que pidió el usuario

> Esto me va a servir durante el viaje, pero luego cuando llegue termine y llegue a
> su fin tiene que quedar archivado como viajes pasados. Si no hay ningún viaje
> activo, se tienen que ver todos los viajes anteriores. Si hay algún viaje activo se
> tiene que ver como la principal y en una pestaña aparte me oculta lo archivado.

Traducido a comportamiento:

| Situación | Qué se ve al abrir la app |
|---|---|
| **Hay viaje activo** | El viaje activo, como está hoy la app. Lo archivado vive en un tab aparte. |
| **No hay viaje activo** | La galería de viajes pasados **es** el home. |

Es un **home condicional**: la pantalla de entrada cambia según haya o no viaje en curso.

## Estados de un viaje

Se derivan de las fechas, con override manual:

```js
function deriveStatus(trip) {
  if (trip.statusOverride) return trip.statusOverride;   // el usuario manda
  const hoy = todayISO();                                 // 'YYYY-MM-DD', comparación por string
  if (hoy < trip.startDate) return 'planned';
  if (trip.endDate && hoy > trip.endDate) return 'archived';
  return 'active';
}
```

| Estado | Cuándo | Cómo se muestra |
|---|---|---|
| `planned` | Todavía no empezó | Home, con cuenta regresiva (lo que hoy hace la card de countdown) |
| `active` | Estamos dentro de las fechas | Home, vista completa actual |
| `archived` | Ya terminó | Galería de archivo, sólo lectura |

### Por qué hace falta el override manual

Las fechas solas no alcanzan en casos reales:

- El viaje terminó pero faltan cargar fotos y notas → conviene mantenerlo activo unos días.
- Un viaje se cortó antes de tiempo.
- Dos viajes se solapan (volviste de uno y arrancaste otro el mismo día).

**Regla de desempate:** si hay más de un viaje en estado `active`, manda
`settings.activeTripId`. Los otros se muestran en el selector de viajes pero no son
el home. Nunca puede haber dos "principales".

### Transición a archivado

No es automática y silenciosa. Cuando `deriveStatus` da `archived` por primera vez,
la app muestra un aviso en el home:

> **Tu viaje EuroTrip 90 terminó.** ¿Lo archivamos?
> [Archivar viaje] [Mantener activo unos días]

Al archivar:

1. Se congela `endDate` explícito.
2. Se marca `statusOverride: 'archived'`.
3. Se genera el resumen del viaje (países, km, noches, paradas, estampas ganadas).
4. `settings.activeTripId` pasa al siguiente viaje `planned`, o a `null`.
5. **A partir de acá el viaje es intocable para el proceso de siembra**
   (ver [02-modelo-de-datos.md](02-modelo-de-datos.md)).

El paso 3 es un buen momento de producto: es la pantalla de "resumen del viaje", con
las estampas nuevas. Vale la pena que se sienta como una recompensa.

## Navegación

### Estructura propuesta

```
┌─ Header ─────────────────────────────────────────────┐
│  🧭  EuroTrip 90            [selector de viaje ▾]     │
│      24 jun – 22 sep 2026 · Activo                    │
└──────────────────────────────────────────────────────┘

  CON viaje activo:
  [ Viaje actual ] [ Mis viajes ] [ Pasaporte ] [ Mapa ]
    └─ tabs actuales: Beneficios / Hacks / Itinerario / Quests / Valija

  SIN viaje activo:
  [ Mis viajes ] [ Pasaporte ] [ Mapa ]
    └─ "Mis viajes" es el home, abre en la galería
```

Decisiones:

- **Los 5 tabs actuales no se tocan.** Quedan anidados dentro de "Viaje actual".
  Esto mantiene chico el cambio y respeta la app que ya funciona.
- **"Mis viajes"** es la galería: activo + planificados + archivados.
- **"Pasaporte"** y **"Mapa"** son transversales a todos los viajes, por eso están al
  nivel de arriba y no dentro de un viaje.
- El **selector de viaje** en el header permite saltar a ver cualquier viaje sin
  cambiar cuál es el activo. Ver un viaje archivado ≠ activarlo.

### Modo "viendo un viaje archivado"

Al abrir un viaje archivado se reusa la vista de itinerario, pero:

- Banner fijo arriba: `📦 Viaje archivado · 24 jun – 22 sep 2026` + botón "Volver al archivo".
- **Sólo lectura**: sin botones de +/− noches, sin agregar/quitar paradas, sin
  reordenar. Excepción: **sí** se pueden editar fotos y notas (son recuerdos que se
  siguen cargando después del viaje).
- **Sin la maquinaria de presupuesto.** Un viaje terminado no necesita "presupuesto
  restante" ni "beneficios aplicados". Ver abajo.

## Qué muestra un viaje archivado en vez del presupuesto

El motor de presupuesto de `renderAll` está pensado para planificar: cuánto va a
costar, cuánto ahorrás con beneficios UE, cuánto te queda. Para un viaje terminado eso
no significa nada.

Se reemplaza por un **resumen del viaje**, calculado una vez al archivar:

| Métrica | De dónde sale |
|---|---|
| Duración | `endDate − startDate` |
| Países | `stops[].countryCode` únicos |
| Ciudades | `stops.length` |
| Distancia recorrida | Suma de Haversine entre paradas (ya existe `calculateDistance`) |
| Costo total real | Suma de `accommodationCost + cost + nights × dailyBudget` |
| Álbumes de fotos | Cantidad de `photosAlbumUrl` cargados |
| Estampas ganadas | Países únicos del viaje |

Se guarda como `trip.summary` al archivar, para no recalcularlo en cada render y para
que quede congelado aunque cambie el motor de cálculo más adelante.

## La galería de viajes

Grilla de cards, ordenada por `startDate` descendente (lo más reciente primero).

Cada card:

```
┌──────────────────────────────┐
│ [foto de portada]            │
│ ● Activo                     │   ← badge de estado
│ EuroTrip 90                  │
│ 24 jun – 22 sep 2026         │
│ 🇪🇸🇩🇪🇳🇱🇧🇪🇨🇿🇦🇹🇮🇹  · 15 paradas │
│ 90 noches · 8.420 km         │
└──────────────────────────────┘
```

Agrupación: `En curso` → `Próximos` → `Archivo` (por año).

### Estados vacíos

Importan porque el usuario va a ver el vacío antes que el lleno:

| Situación | Qué mostrar |
|---|---|
| Sin viajes | "Todavía no cargaste ningún viaje." + [Crear mi primer viaje] |
| Sin viaje activo, con archivo | La galería directo (es el home). Arriba: [Planificar próximo viaje] |
| Viaje activo sin paradas | La vista de constructor actual, ya funciona |

## Crear y editar viajes

Formulario mínimo — nombre, fecha de inicio, fecha de fin estimada, foto de portada
opcional. Al crear:

- `id`: slug del nombre + año (`trip-japon-2027`), verificando que no exista.
- `userCreated: true` → **nunca lo toca la siembra**.
- Arranca sin paradas; se cargan con el constructor Lego que ya existe.
- Si no hay viaje activo y el nuevo empieza hoy o antes → se vuelve el activo.

**Duplicar viaje** es útil (una ruta parecida el año siguiente) pero no es v1.

### Borrar un viaje

Con confirmación explícita escribiendo el nombre, porque **es contenido
irrecuperable** si no está commiteado en git. Mejor todavía: "archivar y ocultar" en
vez de borrar de verdad.

## Impacto en el código

| Archivo/función | Cambio | Tamaño |
|---|---|---|
| `state` + `window.onload` | Migración a `settings` + `trips[]` | L |
| ~20 funciones de render | `state.routeStops` → `activeTrip().stops`, tolerar `null` | L |
| `switchTab` | Nivel de navegación nuevo; pasar a tabla de config | M |
| `renderAll` | Separar cálculo de presupuesto (activo) de resumen (archivado) | M |
| HTML | Panels nuevos: galería, pasaporte, mapa mundial | M |
| `saveToStorage` | Guardar el árbol nuevo | S |

El grueso es mecánico (reapuntar lecturas de `state`), pero toca casi todo el
archivo. Por eso en [06-roadmap.md](06-roadmap.md) va **solo en su propia fase**, sin
features nuevas encima, para poder verificar que nada se rompió.
