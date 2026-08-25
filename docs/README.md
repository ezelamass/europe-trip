# Documentación de producto — Diario de Viajes

> **Estado: PLANIFICACIÓN. Nada de esto está implementado todavía.**
> Estos documentos describen hacia dónde va la app. El código actual en
> `index.html` sigue siendo la app de un solo viaje (EuroTrip 90).

## De qué se trata

Hoy `index.html` es un planificador de **un** viaje: el EuroTrip 90 de 2026, con
sus paradas, presupuesto, valija y beneficios UE hardcodeados.

La idea es convertirlo en un **diario de viajes permanente**: un lugar donde cada
viaje se planifica, se usa durante el viaje, y al terminar queda **archivado**
como recuerdo — con sus fotos, su recorrido y sus estampas de pasaporte.

Tres funcionalidades nuevas definen el salto:

| # | Funcionalidad | Doc |
|---|---|---|
| 1 | Varios viajes, con viaje activo y archivo de viajes pasados | [03-viajes-y-archivo.md](03-viajes-y-archivo.md) |
| 2 | Estampa de pasaporte personalizada por país visitado | [04-estampas-de-pasaporte.md](04-estampas-de-pasaporte.md) |
| 3 | Mapa mundial con todos los viajes y sus recorridos | [05-mapa-mundial.md](05-mapa-mundial.md) |

## Cómo leer estos documentos

Están pensados para leerse en orden, pero cada uno se sostiene solo.

| Doc | Qué contiene | Para quién |
|---|---|---|
| [01-arquitectura-actual.md](01-arquitectura-actual.md) | Cómo funciona la app hoy y **qué exactamente bloquea** el multi-viaje | Leer primero. Es el diagnóstico honesto. |
| [02-modelo-de-datos.md](02-modelo-de-datos.md) | Esquemas destino, propiedad de campos, migraciones y dónde vive la data | El corazón técnico del plan |
| [03-viajes-y-archivo.md](03-viajes-y-archivo.md) | Viaje activo vs archivado, home condicional, navegación | Spec de producto |
| [04-estampas-de-pasaporte.md](04-estampas-de-pasaporte.md) | Generador de estampas SVG determinista | Spec de producto |
| [05-mapa-mundial.md](05-mapa-mundial.md) | Mapa de todos los viajes | Spec de producto |
| [06-roadmap.md](06-roadmap.md) | Fases, orden, riesgos y **preguntas abiertas** | Para decidir qué se hace primero |

## Los dos hallazgos que condicionan todo el plan

Al analizar el código actual aparecieron dos cosas que hay que resolver **antes**
de construir cualquier funcionalidad nueva. Están detalladas en
[01-arquitectura-actual.md](01-arquitectura-actual.md), pero valen el resumen:

### 1. El modelo de persistencia actual borra contenido a propósito

`DATA_VERSION` funciona así hoy: si cambia, **se descarta todo lo guardado en el
dispositivo** y mandan los datos hardcodeados del HTML. Eso es razonable para un
viaje que se edita pidiéndole cambios a Claude, pero es **inaceptable para un
archivo de viajes pasados**: las fotos, notas y estampas de un viaje terminado son
recuerdos irreemplazables, no datos regenerables.

Ya hubo un parche puntual para esto (los links de fotos se rescatan al subir la
versión), pero es una excepción, no un modelo. Hay que reemplazarlo por
migraciones reales con propiedad de campos explícita.

### 2. La data vive sólo en un `localStorage`, en un repo público

Dos problemas distintos, uno arriba del otro:

- **Durabilidad:** todo está en la clave `eurotrip_state_lego` de un solo
  navegador. Borrar datos del sitio, cambiar de teléfono o usar otro navegador
  = se pierde todo. Para un diario de años, eso no alcanza.
- **Privacidad:** el repo `ezelamass/europe-trip` es **público**, y ya contiene 10
  links de álbumes de Google Photos. A medida que se acumulen viajes, fotos y
  fechas, esto es cada vez más información personal publicada.

La recomendación (detallada en [02-modelo-de-datos.md](02-modelo-de-datos.md)) es
mover la data a `data/viajes.json` versionado en git **y pasar el repo a privado**.
Eso resuelve durabilidad y privacidad de una, y encaja con cómo ya se trabaja:
los datos se cargan pidiéndoselos a Claude, que los commitea.

## Principios que el plan respeta

Estos salen de cómo está construida la app hoy, y conviene no romperlos:

1. **Sin build step.** Es un `.html` que se abre y anda. Nada de bundlers, npm ni
   compilación. Si hace falta dividir archivos, se usan `<script src>` clásicos,
   no ES modules (evita problemas de CORS y mantiene el service worker simple).
2. **Offline primero.** Es una PWA que se usa viajando, con conexión mala o nula.
   Nada crítico puede depender de una request en vivo.
3. **Las fotos son links, no blobs.** Los álbumes viven en Google Photos. Nunca
   guardar imágenes en base64 en el estado: reventaría el límite de ~5 MB de
   `localStorage`.
4. **Cada fase se puede publicar sola.** Nada de refactors gigantes de meses. Ver
   [06-roadmap.md](06-roadmap.md).
