# scripts/ — regeneración del mapa mundial

`src/data/worldMap.ts` (metadata) y `src/data/worldGeometry.ts` (paths SVG) están
**generados**, no se editan a mano. Contiene la
geometría del mapa del Perfil de Viajero, la metadata de los 195 países soberanos y las
subdivisiones (provincias/estados/regiones) de los países cargados.

## Cuándo regenerar

- Para **agregar las subdivisiones de un país nuevo** → editar `SUBS` en `build-final.js`.
- Para cambiar el nivel de detalle del mapa → ajustar `TOL` / `MIN_AREA` en `build-map.js`.
- Para cambiar el recorte de un continente → `CONT_BOUNDS` en `build-final.js`.

Para lo demás (marcar países/regiones como visitados) **no hace falta tocar nada**: eso se
edita desde la app y vive en el `localStorage` del celu.

> Desde la migración a React la salida son **dos** módulos TypeScript, no un script
> global. `to-module.js` hace la conversión y el reparto: la geometría va a
> `worldGeometry.ts` y la metadata a `worldMap.ts`. Están separados a propósito —
> juntos, Rollup arrastra los 65 KB de paths al chunk inicial de la app.

## Cómo

```bash
cd scripts

# 1) bajar las fuentes (no se versionan: pesan ~1.4 MB)
curl -sL https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json -o world110m.json
curl -sL https://cdn.jsdelivr.net/npm/world-countries@5.0.0/countries.json -o countries.json

# 2) geometría -> paths SVG proyectados (genera paths/meta/dots.json)
node build-map.js

# 3) armar el archivo final
node build-final.js

# 4) convertirlo a los dos módulos ES de src/data/
node to-module.js
```

## Detalles del formato

- **Proyección:** equirectangular, viewBox `2000x1000`, recortada a **84°N–58°S** (sin
  Antártida ni casquete ártico: no aportan y se comían ~25% del alto).
- **Antimeridiano:** los países que lo cruzan (Rusia, Aleutianas, Fiji) se "desenrollan" y
  se duplican con offset de 360°, si no dibujan bandas horizontales sobre todo el mapa.
- **Micro-estados:** los 30 países sin geometría a 110m (Vaticano, Mónaco, Singapur,
  Malta...) van en `WORLD_DOTS` como punto, para que se puedan tocar y contar igual.
- **Países soberanos:** 195 = 193 miembros ONU + Vaticano + Palestina. Es el denominador
  del "% del mundo". Los territorios no soberanos (Groenlandia, Sáhara Occidental...) se
  dibujan de fondo pero no son clickeables ni cuentan.
- **Subdivisiones:** nivel administrativo "natural" de cada país, no ISO 3166-2 crudo (que
  para UK y Francia baja a un detalle inservible para contar viajes).

Fuentes: [world-atlas](https://github.com/topojson/world-atlas) (Natural Earth) ·
[world-countries](https://github.com/mledoze/countries).
