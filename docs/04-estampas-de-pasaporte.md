# 04 — Estampas de pasaporte

> Me gustaría también por cada país visitado generar como una estampa personalizada
> y que sea de ese país. Un poquito como la estampa que te ponen en el pasaporte.

## Decisión de diseño: SVG generado, no imágenes

Hay dos caminos posibles y conviene justificar el elegido.

| | Imágenes pre-hechas (PNG/SVG por país) | **Generador SVG (elegido)** |
|---|---|---|
| Países soportados | Sólo los que se dibujen a mano | Todos, gratis |
| Peso | ~15–40 KB × país, y hay que precachearlos | ~3 KB de código, cero assets |
| Offline | Hay que sumarlos a `PRECACHE_URLS` | Se generan en el cliente |
| Personalización (fechas, ciudades) | Rígida | Nativa |
| Estética | Control total | Requiere trabajo para que no se vea genérico |

Se elige **generar SVG en el cliente**. El único costo real es diseñar bien el
generador; a cambio, un viaje a cualquier país nuevo tiene su estampa sin trabajo
adicional, y no se rompe el principio de "un HTML autocontenido".

## Determinismo: la regla crítica

**La estampa de un país tiene que verse siempre igual.** Si cambia entre renders,
deja de ser un recuerdo y pasa a ser ruido.

Por lo tanto: **prohibido `Math.random()` en el generador.** Toda variación (ángulo,
forma, color de tinta, textura) sale de un PRNG sembrado con un hash estable del
identificador de la estampa.

```js
// Hash estable de string (FNV-1a de 32 bits)
function hashSeed(str) {
  let h = 0x811c9dc5;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 0x01000193) >>> 0;
  }
  return h >>> 0;
}

// PRNG determinista (mulberry32)
function makeRng(seed) {
  return function () {
    seed = (seed + 0x6D2B79F5) >>> 0;
    let t = seed;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const rng = makeRng(hashSeed(`${countryCode}:${tripId}`));
```

Como el seed incluye `tripId`, **la misma Italia visitada en dos viajes distintos da
dos estampas distintas** — igual que en un pasaporte real.

## Anatomía de la estampa

```
        ╭───────────────────────╮
       ╱      I T A L I A        ╲        ← nombre del país en arco
      │  ┌───────────────────┐   │
      │  │   21.08 — 30.08   │   │        ← rango de fechas del viaje en ese país
      │  │        IT         │   │        ← código ISO grande, centro
      │  │   ROMA · BARI     │   │        ← ciudades (máx 3, luego "+N")
      │  └───────────────────┘   │
       ╲      2 0 2 6           ╱         ← año
        ╰───────────────────────╯
```

### Variaciones (todas derivadas del seed)

| Propiedad | Valores | Cómo se elige |
|---|---|---|
| Forma | círculo, óvalo, rect. redondeado, festoneado | `rng()` → índice |
| Rotación | −12° a +12° | `rng() * 24 - 12` |
| Tinta | azul `#1e3a8a`, borgoña `#7f1d1d`, verde `#14532d`, negro `#1f2937`, violeta `#4c1d95` | `rng()` → índice de paleta |
| Desgaste | intensidad del filtro de textura | `rng()` acotado |
| Doble borde | sí/no | `rng() > 0.5` |

### Textura de tinta gastada

Un filtro SVG le saca el aspecto de "vector limpio", que es lo que arruinaría el
efecto:

```xml
<filter id="stamp-distress-IT">
  <feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves="3" seed="42" result="noise"/>
  <feDisplacementMap in="SourceGraphic" in2="noise" scale="1.8"
                     xChannelSelector="R" yChannelSelector="G"/>
</filter>
```

El `seed` del `feTurbulence` sale del mismo PRNG. Aplicar con `opacity: 0.82` y
`mix-blend-mode: multiply` para que se sienta tinta sobre papel.

> **Cuidado:** los IDs de filtro tienen que ser únicos por estampa (`stamp-distress-IT-trip-x`).
> Si se repiten, los navegadores aplican el primero a todas.

### Sobre las banderas emoji

Tentador usar 🇮🇹 en el centro, pero **el emoji de bandera renderiza distinto en
cada plataforma** (Android/iOS/Windows), y dentro de `<svg><text>` a veces no renderiza.
Además, una bandera a color rompe la ilusión de tinta monocromática.

**Decisión:** el centro lleva el **código ISO** en tipografía condensada. La bandera
emoji se usa en las listas y cards, no dentro de la estampa.

## La página del pasaporte

Tab nuevo de primer nivel, transversal a todos los viajes.

```
┌─ Pasaporte ──────────────────────────────────┐
│  7 países · 12 estampas · 4 viajes           │
│                                              │
│  ╭────╮   ╭────╮      ╭────╮                 │
│  │ ES │   │ DE │      │ IT │   ← superpuestas
│  ╰────╯ ╭────╮╰────╯  ╰────╯     con ángulos │
│         │ AT │                                │
│         ╰────╯                                │
└──────────────────────────────────────────────┘
```

- Layout tipo página de pasaporte: grilla suelta con superposición leve y ángulos
  distintos. **Cada estampa mantiene un área de toque propia** — no pueden quedar
  tapadas al punto de no poder tocarlas.
- Tocar una estampa abre el detalle: país, viajes en que se visitó, ciudades, fechas,
  noches, links a los álbumes de fotos de ese país.
- Filtro por viaje: "ver sólo las estampas del EuroTrip 90".
- **Accesibilidad:** las estampas son decorativas. Debajo, una lista en texto de
  países + fechas que sea legible por lector de pantalla y buscable.

## Datos que necesita

Depende **enteramente** de que cada parada tenga `countryCode`, que hoy no existe
(ver [02-modelo-de-datos.md](02-modelo-de-datos.md)). Sin eso no hay estampas.

```js
function stampsForTrip(trip) {
  const porPais = new Map();
  for (const stop of trip.stops) {
    if (!stop.countryCode) continue;
    if (!porPais.has(stop.countryCode)) {
      porPais.set(stop.countryCode, { code: stop.countryCode, ciudades: [], noches: 0 });
    }
    const e = porPais.get(stop.countryCode);
    e.ciudades.push(stop.cityName ?? stop.city);
    e.noches += stop.nights;
  }
  // Las fechas salen del rango derivado de las paradas de ese país
  return [...porPais.values()].map(e => ({ ...e, tripId: trip.id, ...dateRangeForCountry(trip, e.code) }));
}
```

### Tabla de países

Hace falta un diccionario `ISO → { nombre en español, emoji }`. Con ~60 entradas de
los países plausibles alcanza; se amplía cuando aparezca uno nuevo. El emoji se puede
derivar del código ISO en vez de hardcodearlo:

```js
const flagEmoji = (cc) => cc.toUpperCase().replace(/./g,
  c => String.fromCodePoint(127397 + c.charCodeAt(0)));
```

## Estampa por país o por país + viaje

**Pregunta abierta**, con recomendación.

- **Una por país** (7 estampas para el EuroTrip): más limpio, pero pierde la gracia de
  que revisitar un país sume una estampa nueva.
- **Una por país + viaje** (recomendada): igual que un pasaporte real. Volver a Italia
  en 2028 estampa de nuevo, con otra forma y otro color porque el seed incluye el
  `tripId`. La página se enriquece con cada viaje, que es exactamente la sensación buscada.

Recomendación: **por país + viaje**, agrupando visualmente por país.

## Qué NO incluir en v1

- Editor de estampas (mover, rotar a mano). El `stampOverrides` del modelo lo permite
  a futuro, pero no hace falta al principio.
- Exportar la página como imagen para compartir. Lindo, pero es otra feature.
- Estampas por región/estado dentro de un país.
