# 05 — Mapa mundial de todos los viajes

> Me gustaría que se pueda haber un mapa donde se marquen todos los lugares en los
> que fui y todos los viajes que hice con el recorrido que hice en ese viaje marcado
> en el mapa.

## Qué existe hoy y qué falta

Ya hay un mapa Leaflet funcionando (`renderMapView`, `index.html:4556`) que dibuja el
recorrido del viaje único: polilínea punteada entre paradas consecutivas, marcadores
numerados, distancias Haversine y lista de conexiones.

**La mecánica de dibujo se reusa casi entera.** Lo que cambia es que pasa de un viaje
a N viajes, y que el color deja de codificar el tipo de tramo para codificar **de qué
viaje es**.

## Bloqueante: las coordenadas

Hoy las coordenadas se adivinan por nombre contra un diccionario de 39 entradas
(`CITY_COORDINATES`), y **si no matchea la parada desaparece del mapa sin aviso**.

Verificado corriendo la lógica real contra los datos reales:

```
Total paradas: 15
SIN coordenadas (no se dibujan en el mapa):
  ✗ 3. Palma de Mallorca (España) 🇪🇸
```

Seis noches del viaje no están en el mapa y nada lo indica. Con un solo viaje europeo
ya falla; con viajes a más países va a fallar mucho más seguido.

**Esto se arregla antes de construir el mapa mundial, no después:**

1. Backfill de `lat`/`lng` explícitos en las 15 paradas actuales (migración v3).
2. `getStopCoordinates` pasa a devolver las coords propias de la parada; el matching
   por nombre queda **sólo como fallback de la migración**, no en runtime.
3. Una parada sin coords se muestra **visiblemente** como "sin ubicación" en el
   constructor, con botón para cargarla. Nunca más un fallo silencioso.

## Diseño de la vista

```
┌─ Mapa ───────────────────────────────────────────────┐
│  ☑ EuroTrip 90 2026   ☑ Japón 2027   ☑ Perú 2025      │  ← filtros por viaje
│                                                       │
│         [ mapa Leaflet a pantalla casi completa ]     │
│                                                       │
│  4 viajes · 12 países · 38 ciudades · 41.230 km       │
└──────────────────────────────────────────────────────┘
```

### Color por viaje

Cada viaje recibe un color de una paleta cualitativa fija, asignado por índice
estable (no por orden de render, para que no cambie al filtrar):

```js
const TRIP_COLORS = [
  '#6366f1', // indigo
  '#ec4899', // rosa
  '#14b8a6', // teal
  '#f59e0b', // ámbar
  '#8b5cf6', // violeta
  '#ef4444', // rojo
  '#22c55e', // verde
  '#0ea5e9'  // celeste
];
const tripColor = (trip) => TRIP_COLORS[trip.colorIndex % TRIP_COLORS.length];
```

`colorIndex` se asigna al crear el viaje y se persiste. Así el EuroTrip es siempre
indigo, aunque después se agreguen viajes anteriores.

> La paleta actual del mapa de un solo viaje codifica compañía (rosa = con Mamá, teal
> = con Dani). Eso **se mueve al popup**: en el mapa mundial el color significa viaje.
> Dentro de la vista de un viaje individual se puede mantener el esquema de hoy.

### Capas

| Capa | Contenido | Notas |
|---|---|---|
| Recorridos | Una polilínea por viaje, color del viaje | Reusa el dibujo actual |
| Marcadores | Círculo numerado por parada, color del viaje | Número = orden dentro de **su** viaje |
| Popup | Ciudad, viaje, fechas, noches, hotel, link al álbum de fotos | Extiende el popup actual |

Cuando una ciudad se repite entre viajes (Madrid en dos viajes), se dibujan **dos
marcadores levemente desplazados**, no uno solo — el punto es ver cada recorrido
completo. Un desplazamiento de ~200 m en función del `tripId` alcanza y es determinista.

### Ajuste de encuadre

- Al abrir: `fitBounds` de todos los viajes visibles.
- Al filtrar a un solo viaje: `fitBounds` de ese viaje.
- Tocar un viaje en la leyenda: hace zoom a ese viaje sin ocultar los demás.

## Rendimiento

Con la escala real (decenas de viajes, cientos de paradas) Leaflet no tiene problema:
son cientos de marcadores, no miles. No hace falta clustering.

Sí hay que **extender la memoización**. Hoy:

```js
const signature = JSON.stringify(state.routeStops.map(s => [s.city, s.nights, s.transport, s.isConfirmed]));
```

Para el mapa mundial la firma tiene que incluir **qué viajes están visibles**, o al
filtrar no se redibuja:

```js
const signature = JSON.stringify({
  visibles: visibleTripIds.slice().sort(),
  paradas: allStops().map(s => [s.tripId, s.id, s.lat, s.lng])
});
```

## Pintar los países visitados: por qué no en v1

Sería lindo pintar los países enteros (mapa coroplético). Se descarta por ahora:

- Necesita un GeoJSON de fronteras. El de resolución baja pesa ~250 KB, el de media
  ~2 MB. Hay que precachearlo para offline y sube bastante el peso de la PWA.
- Con pocos países visitados, el mapa queda más ruidoso que informativo.
- Las estampas del pasaporte ya cubren la sensación de "conquisté este país".

**Alternativa barata para v1:** una fila de banderas arriba del mapa con los países
visitados, que al tocarlas filtran los marcadores de ese país. Cero peso adicional.

Si más adelante se quiere el coroplético, se puede cargar el GeoJSON **bajo demanda**
al entrar al tab del mapa (no en el precache), aceptando que esa capa no funcione
offline.

## Métricas del encabezado

Todas derivables, ninguna nueva de guardar:

| Métrica | Cálculo |
|---|---|
| Viajes | `state.trips.length` |
| Países | `countryCode` únicos de todas las paradas |
| Ciudades | Cantidad de paradas (o `cityName` únicos si se prefiere) |
| Distancia total | Suma de Haversine dentro de cada viaje (no entre viajes) |

**Importante:** la distancia se acumula *dentro* de cada viaje. Encadenar el final de
un viaje con el inicio del siguiente daría un número sin sentido.

## Impacto en el código

| Función | Cambio | Tamaño |
|---|---|---|
| `getStopCoordinates` | Priorizar coords propias; degradar el fuzzy match | S |
| `renderMapView` | Generalizar a N viajes, color por viaje, filtros | M |
| `CITY_COORDINATES` | Pasa a ser sólo tabla de apoyo para la migración | S |
| HTML | Panel nuevo del mapa mundial + leyenda de filtros | S |
| Migración v3 | Backfill de `lat`/`lng`/`countryCode` | M |

La mayor parte del trabajo real está en la **migración de datos**, no en el mapa.
