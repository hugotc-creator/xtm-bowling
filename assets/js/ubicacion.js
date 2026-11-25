/* XTM Bowling — página de ubicación: marca el día de hoy y calcula
   si la tienda está abierta usando siempre la hora de Madrid. */

(function () {
  "use strict";

  // Minutos desde medianoche. null = cerrado. Índices: 0 domingo … 6 sábado.
  var HORARIO = {
    0: null,
    1: [11 * 60, 21 * 60],
    2: [11 * 60, 21 * 60],
    3: [11 * 60, 21 * 60],
    4: [11 * 60, 22 * 60],
    5: [11 * 60, 22 * 60],
    6: [10 * 60, 20 * 60]
  };

  var DIAS = ["domingo", "lunes", "martes", "miércoles", "jueves", "viernes", "sábado"];

  /** Día y minutos actuales en Europe/Madrid, sin depender del reloj del visitante. */
  function ahoraEnMadrid() {
    var partes;
    try {
      partes = new Intl.DateTimeFormat("en-US", {
        timeZone: "Europe/Madrid",
        weekday: "short",
        hour: "2-digit",
        minute: "2-digit",
        hour12: false
      }).formatToParts(new Date());
    } catch (error) {
      var local = new Date();
      return { dia: local.getDay(), minutos: local.getHours() * 60 + local.getMinutes() };
    }

    var valor = {};
    partes.forEach(function (parte) {
      valor[parte.type] = parte.value;
    });

    var semana = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].indexOf(valor.weekday);
    var hora = parseInt(valor.hour, 10) % 24;
    var minuto = parseInt(valor.minute, 10);

    return { dia: semana === -1 ? new Date().getDay() : semana, minutos: hora * 60 + minuto };
  }

  function hhmm(minutos) {
    var h = Math.floor(minutos / 60);
    var m = minutos % 60;
    return (h < 10 ? "0" + h : h) + ":" + (m < 10 ? "0" + m : m);
  }

  /** Siguiente día con horario, a partir de uno dado. */
  function proximaApertura(dia) {
    for (var salto = 1; salto <= 7; salto++) {
      var siguiente = (dia + salto) % 7;
      if (HORARIO[siguiente]) {
        return { dia: siguiente, apertura: HORARIO[siguiente][0], salto: salto };
      }
    }
    return null;
  }

  function mensajeEstado(momento) {
    var hoy = HORARIO[momento.dia];

    if (hoy && momento.minutos >= hoy[0] && momento.minutos < hoy[1]) {
      return { texto: "Abierto ahora · cierra a las " + hhmm(hoy[1]), clase: "stock--in" };
    }

    if (hoy && momento.minutos < hoy[0]) {
      return { texto: "Cerrado · abre hoy a las " + hhmm(hoy[0]), clase: "stock--low" };
    }

    var siguiente = proximaApertura(momento.dia);
    if (!siguiente) return { texto: "Consulta el horario", clase: "stock--low" };

    var cuando = siguiente.salto === 1 ? "mañana" : "el " + DIAS[siguiente.dia];
    return {
      texto: "Cerrado · abre " + cuando + " a las " + hhmm(siguiente.apertura),
      clase: "stock--out"
    };
  }

  /* El mapa es un iframe de openstreetmap.org: cargarlo de entrada enviaría la
     IP del visitante a un tercero sin que lo haya pedido, así que solo se
     inserta cuando pulsa el botón. */
  function mapaBajoDemanda() {
    var boton = document.getElementById("map-load");
    var aviso = document.getElementById("map-consent");
    var marco = document.getElementById("map-frame");
    if (!boton || !aviso || !marco) return;

    boton.addEventListener("click", function () {
      var iframe = document.createElement("iframe");
      iframe.title = "Mapa con la ubicación de XTM Bowling en Madrid";
      iframe.loading = "lazy";
      iframe.referrerPolicy = "no-referrer";
      iframe.src =
        "https://www.openstreetmap.org/export/embed.html" +
        "?bbox=-3.7074%2C40.4512%2C-3.6934%2C40.4602&layer=mapnik&marker=40.4557%2C-3.7004";

      aviso.remove();
      marco.appendChild(iframe);
    });
  }

  document.addEventListener("DOMContentLoaded", function () {
    mapaBajoDemanda();

    var momento = ahoraEnMadrid();

    var fila = document.querySelector('.hours tr[data-day="' + momento.dia + '"]');
    if (fila) fila.classList.add("is-today");

    var estado = document.getElementById("estado-tienda");
    if (estado) {
      var info = mensajeEstado(momento);
      estado.textContent = info.texto;
      estado.className = "stock " + info.clase;
    }
  });
})();
