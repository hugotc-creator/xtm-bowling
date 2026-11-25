/* XTM Bowling — utilidades compartidas por todas las páginas.
   Expone el objeto global XTM que usan home.js y catalogo.js. */

(function () {
  "use strict";

  var WHATSAPP = "34600123456";

  var eurEntero = new Intl.NumberFormat("es-ES", {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  });

  var eurDecimal = new Intl.NumberFormat("es-ES", {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });

  /** Formatea un precio: 209 -> "209 €", 19.9 -> "19,90 €". */
  function precio(valor) {
    var n = Number(valor);
    if (!isFinite(n)) return "";
    return (Number.isInteger(n) ? eurEntero : eurDecimal).format(n);
  }

  /** Escapa texto antes de inyectarlo en HTML. */
  function esc(texto) {
    return String(texto == null ? "" : texto)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  var STOCK = {
    disponible: { texto: "En stock en tienda", clase: "stock--in" },
    ultimas: { texto: "Últimas unidades", clase: "stock--low" },
    agotado: { texto: "Agotado — consúltanos la próxima entrada", clase: "stock--out" }
  };

  function stock(clave) {
    return STOCK[clave] || STOCK.disponible;
  }

  /* Solo se aceptan las ilustraciones que existen en assets/img: así un valor
     inesperado en productos.json no puede acabar convertido en una ruta rara. */
  var ILUSTRACIONES = ["ball", "shoe", "bag", "wrist", "care", "pins"];

  function ilustracion(producto) {
    var clave = producto && producto.art;
    if (ILUSTRACIONES.indexOf(clave) === -1) clave = "ball";
    return "assets/img/art-" + clave + ".svg";
  }

  /** Enlace de WhatsApp con el producto ya escrito en el mensaje. */
  function whatsapp(producto) {
    var base = "https://wa.me/" + WHATSAPP;
    if (!producto) return base;
    var texto = "Hola, me interesa el " + producto.nombre + " (" + precio(producto.precio) + ").";
    return base + "?text=" + encodeURIComponent(texto);
  }

  /**
   * Devuelve el HTML de una tarjeta de producto.
   * Con opciones.href se renderiza como enlace; si no, como botón (abre el modal).
   */
  function tarjeta(p, opciones) {
    opciones = opciones || {};
    var etiqueta = p.badge
      ? '<span class="card__badge' +
        (p.badge === "Oferta" ? "" : " card__badge--dark") +
        '">' + esc(p.badge) + "</span>"
      : "";

    var precios = p.precioAnterior
      ? '<span class="is-sale">' + precio(p.precio) + "</span><del>" + precio(p.precioAnterior) + "</del>"
      : "<span>" + precio(p.precio) + "</span>";

    var cuerpo =
      '<span class="card__media">' +
        '<img src="' + esc(ilustracion(p)) + '" alt="' + esc(p.nombre) + '" loading="lazy">' +
        etiqueta +
        '<span class="card__quick">' + esc(opciones.accion || "Ver detalle") + "</span>" +
      "</span>" +
      '<span class="card__brand">' + esc(p.marca) + "</span>" +
      '<span class="card__name">' + esc(p.nombre) + "</span>" +
      '<span class="card__price">' + precios + "</span>";

    if (opciones.href) {
      return '<a class="card" href="' + esc(opciones.href) + '">' + cuerpo + "</a>";
    }
    return (
      '<button class="card" type="button" data-id="' + esc(p.id) + '">' + cuerpo + "</button>"
    );
  }

  /** Carga el catálogo desde data/productos.json. */
  function cargarProductos() {
    return fetch("data/productos.json", { cache: "no-cache" }).then(function (r) {
      if (!r.ok) throw new Error("No se pudo cargar el catálogo (" + r.status + ")");
      return r.json();
    });
  }

  // --- Interacciones comunes del layout ---------------------------------

  function menuMovil() {
    var boton = document.querySelector(".nav-toggle");
    var nav = document.getElementById("nav");
    if (!boton || !nav) return;

    boton.addEventListener("click", function () {
      var abierto = nav.classList.toggle("is-open");
      boton.setAttribute("aria-expanded", String(abierto));
      boton.setAttribute("aria-label", abierto ? "Cerrar menú" : "Abrir menú");
    });
  }

  function anioActual() {
    var anio = String(new Date().getFullYear());
    Array.prototype.forEach.call(document.querySelectorAll("[data-year]"), function (el) {
      el.textContent = anio;
    });
  }

  function boletin() {
    var form = document.getElementById("newsletter-form");
    var nota = document.getElementById("newsletter-note");
    if (!form || !nota) return;

    form.addEventListener("submit", function (evento) {
      evento.preventDefault();
      var campo = document.getElementById("newsletter-email");
      var valido = campo && /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(campo.value.trim());
      if (!valido) {
        nota.textContent = "Revisa el correo: parece que falta algo.";
        if (campo) campo.focus();
        return;
      }
      /* Sitio estático: no hay servidor que reciba el alta, así que en lugar de
         fingir una suscripción abrimos el correo del visitante con la petición
         escrita. Nada sale de su navegador sin que él lo envíe. */
      var correo = campo.value.trim();
      var asunto = "Alta en el boletín de XTM Bowling";
      var cuerpo = "Hola, quiero recibir el boletín de XTM Bowling en esta dirección: " + correo;

      nota.textContent = "Te hemos abierto el correo con el alta preparada: solo tienes que enviarlo.";
      window.location.href =
        "mailto:hola@xtmbowling.es?subject=" + encodeURIComponent(asunto) +
        "&body=" + encodeURIComponent(cuerpo);
      form.reset();
    });
  }

  document.addEventListener("DOMContentLoaded", function () {
    menuMovil();
    anioActual();
    boletin();
  });

  window.XTM = {
    WHATSAPP: WHATSAPP,
    precio: precio,
    esc: esc,
    stock: stock,
    ilustracion: ilustracion,
    whatsapp: whatsapp,
    tarjeta: tarjeta,
    cargarProductos: cargarProductos
  };
})();
