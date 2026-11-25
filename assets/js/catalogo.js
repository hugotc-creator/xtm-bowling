/* XTM Bowling — catálogo: filtros, orden, búsqueda y modal de detalle. */

(function () {
  "use strict";

  var productos = [];
  var ultimoFoco = null;

  var el = {
    grupos: document.getElementById("filter-groups"),
    filtros: document.getElementById("filters"),
    toggle: document.getElementById("filters-toggle"),
    reset: document.getElementById("filters-reset"),
    rango: document.getElementById("price-range"),
    rangoSalida: document.getElementById("price-output"),
    soloStock: document.getElementById("only-stock"),
    busqueda: document.getElementById("search"),
    orden: document.getElementById("sort"),
    grid: document.getElementById("grid"),
    vacio: document.getElementById("empty"),
    contador: document.getElementById("result-count"),
    modal: document.getElementById("modal")
  };

  var ORDEN_CATEGORIAS = ["Bolas", "Zapatos", "Bolsas", "Accesorios"];

  // --- Filtros ----------------------------------------------------------

  /** Valores únicos de un campo, con el número de productos de cada uno. */
  function opcionesDe(campo, orden) {
    var cuenta = {};
    productos.forEach(function (p) {
      cuenta[p[campo]] = (cuenta[p[campo]] || 0) + 1;
    });

    return Object.keys(cuenta)
      .sort(function (a, b) {
        if (orden) {
          var ia = orden.indexOf(a);
          var ib = orden.indexOf(b);
          if (ia !== -1 || ib !== -1) return (ia === -1 ? 99 : ia) - (ib === -1 ? 99 : ib);
        }
        return a.localeCompare(b, "es");
      })
      .map(function (valor) {
        return { valor: valor, total: cuenta[valor] };
      });
  }

  function grupoHTML(titulo, campo, opciones, marcados) {
    return (
      '<div class="filter-group">' +
      "<h3>" + XTM.esc(titulo) + "</h3>" +
      opciones
        .map(function (o) {
          var activo = marcados.indexOf(o.valor) !== -1 ? " checked" : "";
          return (
            '<label class="check">' +
            '<input type="checkbox" name="' + campo + '" value="' + XTM.esc(o.valor) + '"' + activo + ">" +
            "<span>" + XTM.esc(o.valor) + "</span>" +
            '<span class="check__count">' + o.total + "</span>" +
            "</label>"
          );
        })
        .join("") +
      "</div>"
    );
  }

  function construirFiltros(params) {
    var categorias = (params.getAll("categoria") || []).filter(Boolean);
    var marcas = (params.getAll("marca") || []).filter(Boolean);

    el.grupos.innerHTML =
      grupoHTML("Categoría", "categoria", opcionesDe("categoria", ORDEN_CATEGORIAS), categorias) +
      grupoHTML("Marca", "marca", opcionesDe("marca"), marcas);
  }

  function seleccionados(campo) {
    return Array.prototype.map.call(
      el.filtros.querySelectorAll('input[name="' + campo + '"]:checked'),
      function (input) {
        return input.value;
      }
    );
  }

  function configurarRango() {
    var maximo = productos.reduce(function (max, p) {
      return Math.max(max, p.precio);
    }, 0);
    var techo = Math.ceil(maximo / 10) * 10;

    el.rango.max = String(techo);
    el.rango.value = String(techo);
    el.rangoSalida.textContent = XTM.precio(techo);
  }

  // --- Listado ----------------------------------------------------------

  function aplicar() {
    var categorias = seleccionados("categoria");
    var marcas = seleccionados("marca");
    var tope = Number(el.rango.value);
    var texto = el.busqueda.value.trim().toLowerCase();

    var visibles = productos.filter(function (p) {
      if (categorias.length && categorias.indexOf(p.categoria) === -1) return false;
      if (marcas.length && marcas.indexOf(p.marca) === -1) return false;
      if (p.precio > tope) return false;
      if (el.soloStock.checked && p.stock === "agotado") return false;
      if (texto) {
        var buscable = (p.nombre + " " + p.marca + " " + p.categoria).toLowerCase();
        if (buscable.indexOf(texto) === -1) return false;
      }
      return true;
    });

    ordenar(visibles, el.orden.value);
    pintar(visibles);
    sincronizarURL(categorias, marcas, texto);
  }

  function ordenar(lista, criterio) {
    if (criterio === "precio-asc") {
      lista.sort(function (a, b) { return a.precio - b.precio; });
    } else if (criterio === "precio-desc") {
      lista.sort(function (a, b) { return b.precio - a.precio; });
    } else if (criterio === "nombre") {
      lista.sort(function (a, b) { return a.nombre.localeCompare(b.nombre, "es"); });
    } else {
      // Destacados primero y, dentro de cada grupo, por categoría y precio.
      lista.sort(function (a, b) {
        if (!!b.destacado !== !!a.destacado) return b.destacado ? 1 : -1;
        var ca = ORDEN_CATEGORIAS.indexOf(a.categoria);
        var cb = ORDEN_CATEGORIAS.indexOf(b.categoria);
        if (ca !== cb) return ca - cb;
        return b.precio - a.precio;
      });
    }
  }

  function pintar(lista) {
    el.grid.innerHTML = lista
      .map(function (p) {
        return XTM.tarjeta(p, { accion: "Ver detalle" });
      })
      .join("");

    el.vacio.hidden = lista.length > 0;
    el.contador.textContent =
      lista.length === 1 ? "1 producto" : lista.length + " productos";
  }

  /** Deja los filtros activos en la barra de direcciones (enlaces compartibles). */
  function sincronizarURL(categorias, marcas, texto) {
    var params = new URLSearchParams();
    categorias.forEach(function (c) { params.append("categoria", c); });
    marcas.forEach(function (m) { params.append("marca", m); });
    if (texto) params.set("q", texto);

    var consulta = params.toString();
    history.replaceState(null, "", consulta ? "?" + consulta : location.pathname);
  }

  // --- Modal ------------------------------------------------------------

  function abrirModal(id) {
    var p = productos.filter(function (item) { return item.id === id; })[0];
    if (!p) return;

    var info = XTM.stock(p.stock);

    document.getElementById("modal-brand").textContent = p.marca;
    document.getElementById("modal-title").textContent = p.nombre;
    document.getElementById("modal-desc").textContent = p.descripcion;

    var img = document.getElementById("modal-img");
    img.src = XTM.ilustracion(p);
    img.alt = p.nombre;

    document.getElementById("modal-price").innerHTML = p.precioAnterior
      ? '<span class="is-sale">' + XTM.precio(p.precio) + "</span><del>" + XTM.precio(p.precioAnterior) + "</del>"
      : "<span>" + XTM.precio(p.precio) + "</span>";

    var stockEl = document.getElementById("modal-stock");
    stockEl.textContent = info.texto;
    stockEl.className = "stock " + info.clase;

    document.getElementById("modal-specs").innerHTML = Object.keys(p.especificaciones || {})
      .map(function (clave) {
        return (
          "<tr><th scope=\"row\">" + XTM.esc(clave) + "</th>" +
          "<td>" + XTM.esc(p.especificaciones[clave]) + "</td></tr>"
        );
      })
      .join("");

    var cta = document.getElementById("modal-cta");
    cta.href = XTM.whatsapp(p);
    cta.textContent = p.stock === "agotado" ? "Avisarme cuando llegue" : "Consultar por WhatsApp";

    ultimoFoco = document.activeElement;
    el.modal.hidden = false;
    document.body.style.overflow = "hidden";
    document.getElementById("modal-close").focus();
  }

  function cerrarModal() {
    el.modal.hidden = true;
    document.body.style.overflow = "";
    if (ultimoFoco && typeof ultimoFoco.focus === "function") ultimoFoco.focus();
  }

  // --- Eventos ----------------------------------------------------------

  function conectarEventos() {
    el.filtros.addEventListener("change", function (evento) {
      if (evento.target.type === "checkbox") aplicar();
    });

    el.rango.addEventListener("input", function () {
      el.rangoSalida.textContent = XTM.precio(Number(el.rango.value));
      aplicar();
    });

    el.busqueda.addEventListener("input", aplicar);
    el.orden.addEventListener("change", aplicar);

    el.filtros.addEventListener("submit", function (evento) {
      evento.preventDefault();
    });

    el.reset.addEventListener("click", function () {
      // El reset del formulario ocurre después del click: esperamos un tick.
      setTimeout(function () {
        el.rango.value = el.rango.max;
        el.rangoSalida.textContent = XTM.precio(Number(el.rango.max));
        el.busqueda.value = "";
        aplicar();
      }, 0);
    });

    el.toggle.addEventListener("click", function () {
      var oculto = el.filtros.classList.toggle("is-collapsed");
      el.toggle.setAttribute("aria-expanded", String(!oculto));
      el.toggle.textContent = oculto ? "Mostrar filtros" : "Ocultar filtros";
    });

    el.grid.addEventListener("click", function (evento) {
      var tarjeta = evento.target.closest(".card");
      if (tarjeta && tarjeta.dataset.id) abrirModal(tarjeta.dataset.id);
    });

    document.getElementById("modal-close").addEventListener("click", cerrarModal);
    document.getElementById("modal-backdrop").addEventListener("click", cerrarModal);

    document.addEventListener("keydown", function (evento) {
      if (evento.key === "Escape" && !el.modal.hidden) cerrarModal();
    });
  }

  // --- Arranque ---------------------------------------------------------

  document.addEventListener("DOMContentLoaded", function () {
    var params = new URLSearchParams(location.search);

    XTM.cargarProductos()
      .then(function (datos) {
        productos = datos;

        construirFiltros(params);
        configurarRango();

        if (params.get("q")) el.busqueda.value = params.get("q");
        if (window.innerWidth <= 1040) {
          el.filtros.classList.add("is-collapsed");
          el.toggle.setAttribute("aria-expanded", "false");
        }

        conectarEventos();
        aplicar();

        if (params.get("producto")) abrirModal(params.get("producto"));
      })
      .catch(function (error) {
        el.contador.textContent = "Catálogo no disponible";
        el.grid.innerHTML =
          '<p class="empty-state">No pudimos cargar el catálogo. Recarga la página o ' +
          '<a class="text-link" href="https://wa.me/' + XTM.WHATSAPP + '">escríbenos por WhatsApp</a>.</p>';
        console.error(error);
      });
  });
})();
