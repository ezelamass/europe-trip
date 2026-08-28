# 07 — Rediseño mobile (implementado, 2026-08-28)

Referencia: la app de **Despegar** (pantallas "Mis Viajes / Pasados" e "Inicio").
La idea no fue copiarla sino tomarle tres cosas que la app no tenía.

## Qué se le tomó a la referencia

**1. La card es la foto.** En Despegar el 70% de la tarjeta es imagen y el destino,
las fechas y el meta van chicos debajo. La versión anterior era todo texto, y por eso
se leía como un dashboard y no como un diario de viajes.

**2. Una decisión por pantalla.** Título grande, un segmented control `Activos | Pasados`,
y una lista. La app tenía **siete tabs** compitiendo arriba.

**3. Barra inferior flotante** con una píldora detrás del ícono activo.

## Qué NO se le tomó

- **La paleta.** Despegar es violeta sobre blanco; acá el fondo sigue siendo casi negro
  y el acento es **lima**, que es la paleta personal de Eze (`perfil/estetica-y-gustos`
  en el segundo cerebro). Una foto a color rinde más sobre fondo oscuro. El acento es un
  token: `colors.accent` en `tailwind.config.js`, cambiarlo ahí lo cambia en toda la app.
- **El meta de la card.** Donde Despegar pone "1 vuelo", acá va **con quién fuiste** y el
  link al álbum de fotos, que es lo que sirve para recordar un viaje.

## Navegación: de 7 tabs a 4

| Tab | Qué muestra |
|---|---|
| **Inicio** | El viaje en curso: foto, progreso, en qué parada estás, la siguiente, y los accesos del viaje. **Si no hay viaje en curso, muestra los viajes pasados.** |
| **Viajes** | `Activos \| Pasados` con las cards |
| **Mi Mundo** | Mapa mundial y perfil de viajero |
| **Métricas** | Estadísticas sobre los viajes documentados |

Las herramientas de Europa 2026 (beneficios, hacks, valija, side quests) **dejaron de ser
tabs globales**: se entra desde Inicio, dentro del viaje. Ahí es donde se usan, y además
sinceran algo que ya señalaba el code review — eran singletons globales disfrazados de
tabs scopeados a un viaje.

El **detalle de un viaje** no es un tab: es una vista apilada que se abre desde una card
y vuelve con la flecha.

## Fotos de portada

Siete imágenes de **Wikimedia Commons**, elegidas a mano revisando candidatos, recortadas
a 16:9 y convertidas a WebP (800×450, q64): **318 KB en total**. Se versionan y se
precachean, porque la pantalla principal sin fotos queda vacía justo cuando más se usa
la app, que es sin señal.

`scripts/fetch-covers.mjs` las baja y `src/data/covers.json` guarda autor, licencia y
origen de cada una — cinco son CC BY / CC BY-SA y ese archivo es su atribución. La tarjeta
de créditos que estaba en Viajes se sacó a pedido de Eze.

## Métricas

Todo se deriva de los viajes, sin datos nuevos que cargar: noches por año, con quién viajó
más, noches por país, kilómetros entre paradas, el más largo y el más corto.

Un detalle que importa: **las noches por país se cuentan parada por parada** cuando el
itinerario dice el país (`src/data/countryOfStop.ts` lo saca del nombre, "Roma (Italia)").
Solo se reparte en partes iguales cuando no hay ese dato. Con el reparto parejo, Chequia
figuraba con 10 noches; con el real, 2.

## Lo que queda pendiente

El modelo sigue teniendo un solo viaje con herramientas de planificación. `sideQuests`,
`luggageItems`, `customFacts` y el presupuesto son globales: si un segundo viaje activa
`hasPlannerTools`, hereda la valija y las quests de Europa 2026. Está descrito en
[02-modelo-de-datos.md](02-modelo-de-datos.md) y es una refactorización aparte, del tamaño
de una feature — no de este rediseño.

También siguen pendientes las **estampas de pasaporte** ([04](04-estampas-de-pasaporte.md))
y dibujar los recorridos de todos los viajes sobre el mapa mundial ([05](05-mapa-mundial.md)).
