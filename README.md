# XTM Bowling

Sitio web del pro shop **XTM Bowling** (Madrid): catálogo de productos, servicios del
taller y ubicación de la tienda. Es un sitio **estático** (HTML + CSS + JavaScript, sin
frameworks ni compilación) pensado para GitHub Pages.

## Estructura

```
index.html            Portada: hero, categorías, destacados, taller
catalogo.html         Catálogo con filtros, búsqueda, orden y detalle en modal
ubicacion.html        Dirección, mapa, horario y cómo llegar
data/productos.json   ← TODO el catálogo vive aquí
assets/css/styles.css Estilos (un solo archivo, por secciones)
assets/js/main.js     Utilidades comunes: precios, tarjetas, menú, boletín
assets/js/home.js     Portada: destacados y contadores por categoría
assets/js/catalogo.js Filtros, orden, búsqueda y modal
assets/js/ubicacion.js Marca el día de hoy y calcula si está abierto (hora de Madrid)
assets/img/*.svg      Ilustraciones propias (sin dependencias externas)
```

## Ver el sitio en local

El catálogo se carga con `fetch`, así que hay que servirlo por HTTP (abrir el archivo
con doble clic no funciona):

```bash
cd xtm-bowling
python3 -m http.server 8000
# abrir http://localhost:8000
```

## Editar el catálogo

Todo el catálogo está en [`data/productos.json`](data/productos.json). Cada producto es
un objeto con estos campos:

| Campo             | Qué es                                                                 |
| ----------------- | ---------------------------------------------------------------------- |
| `id`              | Identificador único en minúsculas y con guiones (se usa en los enlaces) |
| `nombre`          | Nombre comercial que se muestra                                         |
| `marca`           | Genera automáticamente el filtro de marcas                              |
| `categoria`       | `Bolas`, `Zapatos`, `Bolsas` o `Accesorios`                             |
| `precio`          | Número en euros, sin símbolo (`209` o `19.9`)                           |
| `precioAnterior`  | Precio tachado para ofertas, o `null`                                   |
| `art`             | Ilustración: `ball`, `shoe`, `bag`, `wrist`, `care` o `pins`            |
| `badge`           | Etiqueta sobre la foto (`Nuevo`, `Oferta`, `Pro Shop`…) o `null`        |
| `destacado`       | `true` para que aparezca en la portada                                  |
| `stock`           | `disponible`, `ultimas` o `agotado`                                     |
| `descripcion`     | Párrafo del detalle                                                     |
| `especificaciones`| Pares `"Etiqueta": "Valor"` que forman la tabla del detalle             |

Añadir un producto = añadir un objeto más al array. Los filtros, los contadores de
categoría y el rango de precio se recalculan solos.

> Los precios, descripciones e ilustraciones actuales son **contenido de ejemplo**.
> Sustitúyelos por los datos reales de la tienda.

### Fotos reales en lugar de las ilustraciones

1. Copia las imágenes en `assets/img/` (formato cuadrado, 800×800 px va bien).
2. En `assets/js/main.js`, en la función `ilustracion()`, devuelve la ruta de la foto
   (por ejemplo usando un campo nuevo `imagen` del JSON).

## Datos de la tienda

Son **datos de ejemplo** y hay que cambiarlos en estos sitios:

- **Dirección, horario, metro y buses:** `ubicacion.html`
- **Coordenadas del mapa:** el `src` del `<iframe>` y los enlaces de "Cómo llegar" en
  `ubicacion.html` (`bbox`, `marker`, `mlat`/`mlon`)
- **Horario que calcula "Abierto ahora":** la constante `HORARIO` en
  `assets/js/ubicacion.js` (debe coincidir con la tabla del HTML)
- **Teléfono y correo:** barra superior y pie de las tres páginas
- **WhatsApp:** la constante `WHATSAPP` en `assets/js/main.js` y los enlaces `wa.me`
  del HTML

## Publicación

El sitio se publica con GitHub Pages desde la rama `main`. Cada `git push` actualiza la
web en un par de minutos. El archivo `.nojekyll` evita que GitHub procese el proyecto
con Jekyll.

## Pendiente

- Sustituir el catálogo de ejemplo por los nombres y precios reales
- Fotografías de producto
- El formulario del boletín no envía nada: hace falta un servicio externo
  (Formspree, Mailchimp…) porque GitHub Pages no ejecuta código de servidor
