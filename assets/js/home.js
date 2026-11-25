/* XTM Bowling — portada: productos destacados y contadores por categoría. */

(function () {
  "use strict";

  function pintarDestacados(productos) {
    var contenedor = document.getElementById("destacados");
    if (!contenedor) return;

    var destacados = productos.filter(function (p) {
      return p.destacado;
    }).slice(0, 4);

    if (!destacados.length) {
      contenedor.innerHTML = '<p class="empty-state">Pronto publicaremos los destacados.</p>';
      return;
    }

    contenedor.innerHTML = destacados
      .map(function (p) {
        return XTM.tarjeta(p, {
          href: "catalogo.html?producto=" + encodeURIComponent(p.id),
          accion: "Ver detalle"
        });
      })
      .join("");
  }

  /* Los mosaicos de categoría enlazan a catalogo.html?categoria=…;
     de ahí sacamos la categoría para escribir el número real de productos. */
  function pintarContadores(productos) {
    Array.prototype.forEach.call(document.querySelectorAll(".cat-card"), function (card) {
      var etiqueta = card.querySelector(".cat-card__label span");
      if (!etiqueta) return;

      var categoria;
      try {
        categoria = new URL(card.href, location.href).searchParams.get("categoria");
      } catch (error) {
        return;
      }
      if (!categoria) return;

      var total = productos.filter(function (p) {
        return p.categoria === categoria;
      }).length;

      etiqueta.textContent = total === 1 ? "Ver 1 producto" : "Ver " + total + " productos";
    });
  }

  document.addEventListener("DOMContentLoaded", function () {
    XTM.cargarProductos()
      .then(function (productos) {
        pintarDestacados(productos);
        pintarContadores(productos);
      })
      .catch(function (error) {
        var contenedor = document.getElementById("destacados");
        if (contenedor) {
          contenedor.innerHTML =
            '<p class="empty-state">No pudimos cargar el catálogo. ' +
            '<a class="text-link" href="catalogo.html">Abrir catálogo</a></p>';
        }
        console.error(error);
      });
  });
})();
