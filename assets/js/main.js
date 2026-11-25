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

  function ilustracion(producto) {
    return "assets/img/art-" + (producto.art || "ball") + ".svg";
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
        '<img src="' + ilustracion(p) + '" alt="' + esc(p.nombre) + '" loading="lazy">' +
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
      // Sitio estático: aún no hay backend que reciba la suscripción.
      nota.textContent = "¡Listo! Te escribiremos a " + campo.value.trim() + " con las novedades.";
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
