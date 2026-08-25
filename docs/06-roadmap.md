# 06 — Roadmap, riesgos y preguntas abiertas

## Principio de secuenciación

Las tres features que se pidieron (multi-viaje, estampas, mapa) **comparten los
mismos cimientos**: modelo de datos por viaje, países y coordenadas. Si se empieza por
cualquiera de las tres, hay que construir esos cimientos igual — pero mezclados con
la feature, y por lo tanto más difíciles de verificar.

Por eso el plan separa **fundaciones** de **features**, y cada fase se puede publicar
sola sin dejar la app a medias.

```
Fase 0  Fundaciones invisibles      ← nada cambia en pantalla, todo cambia abajo
   ↓
Fase 1  Modelo multi-viaje          ← sigue habiendo un solo viaje, pero ya es "trips[0]"
   ↓
Fase 2  Home condicional + archivo  ← acá se ve la funcionalidad pedida
   ↓
   ├── Fase 3  Pasaporte / estampas    ┐ independientes entre sí,
   └── Fase 4  Mapa mundial            ┘ ambas dependen de la Fase 1
   ↓
Fase 5  Pulido
```

---

## Fase 0 — Fundaciones invisibles

**Objetivo:** que sea seguro cambiar el modelo de datos. Cero cambios visibles.

| # | Entregable | Tamaño |
|---|---|---|
| 0.1 | Botón **Exportar viajes** (baja el estado como JSON) e **Importar** | S |
| 0.2 | Backup automático a `eurotrip_backup_v<N>` antes de cualquier migración | S |
| 0.3 | Runner de migraciones (`schemaVersion` + `MIGRATIONS[]`) con rollback ante excepción | M |
| 0.4 | Backfill de `countryCode`, `cityName`, `lat`, `lng` en las 15 paradas actuales | M |
| 0.5 | `getStopCoordinates` prioriza coords propias; aviso visible si una parada no tiene | S |
| 0.6 | Arreglar Mallorca (hoy desaparece del mapa) y limpiar la entrada muerta de "Múnich y Alpes" | S |

**Por qué primero:** 0.1 es la red de seguridad que hoy no existe. Sin export, cualquier
error en las fases siguientes es pérdida de datos irrecuperable. Es lo más barato y lo
más valioso del plan entero.

**Cómo se verifica:** la app se ve y se comporta idéntica; el mapa pasa a mostrar 15 de
15 paradas en vez de 14.

---

## Fase 1 — Modelo multi-viaje (refactor)

**Objetivo:** `state` pasa a `{ settings, trips[] }`. Sigue habiendo un solo viaje y la
UI no cambia.

| # | Entregable | Tamaño |
|---|---|---|
| 1.1 | Migración v2: envolver el viaje actual en `trips[0]`, separar `settings` | M |
| 1.2 | Helpers `activeTrip()`, `tripById()`, `archivedTrips()`, `allStops()` | S |
| 1.3 | Reapuntar ~20 funciones de render de `state.routeStops` a `activeTrip().stops` | L |
| 1.4 | Propiedad de campos + `reseedTrip()` reemplazando el borrado de `DATA_VERSION` | M |
| 1.5 | Separar datos a `data/viajes.js` (script clásico, no módulo) + actualizar `PRECACHE_URLS` y `CACHE_VERSION` | M |

**Riesgo: es la fase más peligrosa del plan.** Toca casi todas las funciones del
archivo, sin nada nuevo que mostrar a cambio. Mitigaciones:

- Va **sola**, sin features encima, para que cualquier regresión se atribuya sin dudas.
- Test de humo en navegador real recorriendo los 5 tabs y las 3 sub-vistas, comparando
  contra `main` (ya se usó esta técnica en las PRs #19 y #20 y funcionó bien).
- Invariante verificable: el presupuesto total y la cantidad de paradas tienen que dar
  **exactamente igual** que antes del refactor.

**Cómo se verifica:** la app se ve idéntica; `state.trips[0].stops.length === 15`.

---

## Fase 2 — Home condicional y archivo

**Objetivo:** la funcionalidad que se pidió, ya visible.

| # | Entregable | Tamaño |
|---|---|---|
| 2.1 | `deriveStatus()` + `statusOverride` + desempate por `activeTripId` | S |
| 2.2 | Navegación de primer nivel (Viaje actual / Mis viajes / …) + selector en el header | M |
| 2.3 | Galería de viajes con cards, agrupada, con estados vacíos | M |
| 2.4 | Modo sólo-lectura para viajes archivados (fotos y notas sí editables) | M |
| 2.5 | Flujo "tu viaje terminó, ¿lo archivamos?" + `trip.summary` congelado | M |
| 2.6 | Crear / editar / duplicar viaje | M |

**Cómo se verifica:** al forzar `endDate` en el pasado, el EuroTrip se ofrece para
archivar; al archivarlo, el home pasa a ser la galería.

---

## Fase 3 — Pasaporte y estampas

Depende de Fase 1 (necesita `countryCode`). Independiente de la Fase 4.

| # | Entregable | Tamaño |
|---|---|---|
| 3.1 | Tabla ISO → nombre en español; emoji derivado del código | S |
| 3.2 | Generador de estampas SVG determinista (hash + PRNG + filtro de desgaste) | M |
| 3.3 | Tab Pasaporte: grilla superpuesta, detalle al tocar, filtro por viaje | M |
| 3.4 | Lista accesible en texto debajo de las estampas | S |
| 3.5 | Estampas nuevas en la pantalla de resumen al archivar (engancha con 2.5) | S |

**Riesgo estético:** una estampa generada puede quedar genérica. Conviene iterar el
generador con las 7 estampas reales del EuroTrip a la vista antes de darlo por bueno.

---

## Fase 4 — Mapa mundial

Depende de Fase 1 y del backfill de coordenadas de Fase 0.

| # | Entregable | Tamaño |
|---|---|---|
| 4.1 | `colorIndex` por viaje + paleta fija | S |
| 4.2 | Generalizar `renderMapView` a N viajes | M |
| 4.3 | Filtros por viaje + `fitBounds` según selección | S |
| 4.4 | Firma de memoización que incluya el filtro | S |
| 4.5 | Desplazamiento determinista de marcadores en ciudades repetidas | S |
| 4.6 | Métricas del encabezado (viajes, países, ciudades, km) | S |

---

## Fase 5 — Pulido

Nada de esto es necesario para que funcione; se hace si sobra ganas.

- Fotos de portada por viaje.
- Estadísticas: país más visitado, viaje más largo, km por año.
- Filtro por país en el mapa (fila de banderas).
- Exportar la página del pasaporte como imagen.
- Mapa coroplético con GeoJSON bajo demanda.

---

## Riesgos principales

| Riesgo | Impacto | Mitigación |
|---|---|---|
| **Pérdida de datos al migrar** | Alto — recuerdos irrecuperables | Export (0.1) y backup (0.2) **antes** de cualquier otra cosa |
| **La Fase 1 rompe algo en silencio** | Alto | Fase aislada, test de humo contra `main`, invariantes de presupuesto y cantidad de paradas |
| **`index.html` se vuelve inmanejable** | Medio — ya son 4.784 líneas y el plan las duplicaría | Sacar datos a `data/*.js` en 1.5; no partir la lógica todavía |
| **Datos personales en repo público** | Medio y creciente | Decisión pendiente del usuario (ver abajo) |
| **Romper el offline** | Medio | Cada archivo nuevo entra a `PRECACHE_URLS` **y** se sube `CACHE_VERSION` |
| **Límite de ~5 MB de localStorage** | Bajo con texto | Regla firme: fotos siempre por link, nunca base64 |

---

## Preguntas abiertas

Necesitan decisión antes de arrancar la fase correspondiente.

### 1. ¿El repo pasa a privado? — *bloquea Fase 0/1*

El repo es **público** y ya publica 10 links de álbumes de Google Photos ("cualquiera
con el link"). Con cada viaje se suman fechas, alojamientos y fotos.

- **Recomendación:** pasarlo a privado y mover la data a `data/viajes.json` versionado
  en git. Resuelve durabilidad y privacidad juntas, y encaja con el flujo actual de
  cargar datos pidiéndoselos a Claude. Vercel sirve repos privados sin problema.
- **Alternativa:** dejarlo público y que la data viva sólo en `localStorage` + export
  manual. Más frágil y sigue publicando los links ya commiteados.

### 2. ¿Estampa por país, o por país + viaje? — *bloquea Fase 3*

Recomendación: **por país + viaje**. Volver a Italia estampa de nuevo, como en un
pasaporte real, y la página se enriquece con cada viaje.

### 3. ¿Un viaje archivado conserva el presupuesto? — *bloquea Fase 2*

Recomendación: **no**. Se reemplaza por `trip.summary` (países, km, noches, costo real,
estampas). "Presupuesto restante" no significa nada en un viaje terminado.

### 4. ¿Qué se hace con los beneficios UE en viajes futuros? — *bloquea Fase 2*

`EUROPEAN_BENEFITS`, el Interrail y "Verano Joven" son específicos de un europeo de 21
años viajando por Europa en 2026. En un viaje a Japón no aplican, y el descuento por
edad caduca.

Opciones: (a) que el tab de Beneficios sólo aparezca en viajes con países UE;
(b) que los beneficios sean parte del contenido de cada viaje, editables.
Recomendación: **(a) para v1**, (b) si aparece un segundo viaje europeo.

### 5. ¿Cuánto vale arreglar el hueco de fechas de Bari? — *afecta Fase 0*

Hoy el itinerario muestra Bari 25–30 pero la reserva confirmada dice check-in el 26,
porque el modelo de noches encadenadas no admite huecos. Sigue sin confirmarse dónde
se durmió la noche del 25.

Recomendación: **aceptar la aproximación** (la parada es el tramo en la región; el
alojamiento tiene sus fechas exactas en el modal) salvo que aparezcan más casos así.
