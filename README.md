# XTM Bowling

Sitio web del pro shop **XTM Bowling** (Madrid): catálogo de productos, servicios del
taller y ubicación de la tienda. Es un sitio **estático** (HTML + CSS + JavaScript, sin
frameworks ni compilación) pensado para GitHub Pages.

## Estructura

```
index.html            Portada: hero, categorías, destacados, taller
catalogo.html         Catálogo con filtros, búsqueda, orden y detalle en modal
ubicacion.html        Dirección, mapa, horario y cómo llegar
aviso-legal.html      Aviso legal (LSSI-CE) — con huecos por rellenar
privacidad.html       Política de privacidad (RGPD) — con huecos por rellenar
data/productos.json   ← TODO el catálogo vive aquí
assets/css/styles.css Estilos (un solo archivo, por secciones)
assets/css/fonts.css  @font-face de las tipografías autoalojadas
assets/fonts/*.woff2  Archivo e Inter (variables, subconjuntos latinos)
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
   (por ejemplo usando un campo nuevo `imagen` del JSON). Ojo: esa función valida
   el valor contra la lista `ILUSTRACIONES` justo encima; si cambias el sistema,
   mantén alguna comprobación equivalente para que el JSON no pueda inyectar
   rutas arbitrarias en el HTML.

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

## Seguridad y privacidad

Decisiones ya aplicadas, por si hay que mantenerlas:

- **Sin cookies, sin analítica, sin almacenamiento local.** Por eso la web no
  necesita banner de cookies. Si algún día añades analítica, deja de ser cierto.
- **Tipografías autoalojadas.** No se usa Google Fonts, para no enviar la IP de
  cada visitante a un tercero. Si cambias de tipografía, descárgala y sírvela
  desde `assets/fonts/` en lugar de enlazar a un CDN.
- **Mapa bajo demanda.** El iframe de OpenStreetMap solo se inserta cuando el
  visitante pulsa el botón (`mapaBajoDemanda()` en `assets/js/ubicacion.js`).
- **Content-Security-Policy** declarada con `<meta>` en cada página: solo se
  cargan recursos del propio dominio, más el iframe de openstreetmap.org. Si
  añades un script, una fuente o un servicio externo, **hay que añadirlo también
  a la CSP de las cinco páginas** o el navegador lo bloqueará sin avisar.
- **Nada de HTML construido con datos sin escapar:** el texto de producto pasa
  por `esc()` o por `textContent`, y el campo `art` se valida contra una lista
  blanca de ilustraciones en `assets/js/main.js`.
- **Límite conocido:** GitHub Pages no permite enviar cabeceras propias, y
  `frame-ancestors` / `X-Frame-Options` se ignoran cuando van en `<meta>`. Es
  decir, no se puede impedir que alguien embeba la web en un iframe. Para
  cerrarlo haría falta servirla detrás de Cloudflare o de un hosting propio.

## Publicación

El sitio se publica con GitHub Pages desde la rama `main`. Cada `git push` actualiza la
web en un par de minutos. El archivo `.nojekyll` evita que GitHub procese el proyecto
con Jekyll.

## Pendiente

- Sustituir el catálogo de ejemplo por los nombres y precios reales
- Fotografías de producto
- **Rellenar los huecos legales:** en `aviso-legal.html` y `privacidad.html`
  busca `dato-pendiente` (salen resaltados en amarillo en la página) y sustituye
  razón social, NIF, dirección fiscal, datos registrales y fecha. Conviene que un
  asesor revise el texto final
- El boletín no tiene servidor: al enviar abre el correo del visitante con el
  alta escrita. Si quieres altas automáticas hace falta un servicio externo
  (Formspree, Mailchimp…) y entonces habrá que añadir su dominio a la CSP y
  revisar la política de privacidad
