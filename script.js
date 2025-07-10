document.addEventListener("DOMContentLoaded", function () {
  const form = document.getElementById("formularioLuz");
  const modal = document.getElementById("modal");
  const closeModal = document.querySelector(".close");
  const tablaBody = document.querySelector("#tablaResultados tbody");
  const periodoSelect = document.getElementById("periodo");
  const modalPeriodo = document.getElementById("modalPeriodo");
  const fechaHora = document.getElementById("fechaHora");

  const montoInput = document.getElementById("montoTotal");
  montoInput.addEventListener("blur", () => {
    let valor = parseFloat(montoInput.value);
    if (!isNaN(valor)) {
      montoInput.value = valor.toFixed(2);
    }
  });

  // Calcular automáticamente consumo
  ["A", "B", "C"].forEach((letra) => {
    const lecturaAnterior = document.getElementById(`lecturaAnterior${letra}`);
    const lecturaActual = document.getElementById(`lecturaActual${letra}`);
    const consumo = document.getElementById(`consumo${letra}`);

    function actualizarConsumo() {
      const anterior = parseInt(lecturaAnterior.value) || 0;
      const actual = parseInt(lecturaActual.value) || 0;
      const resultado = Math.max(0, actual - anterior);
      consumo.value = resultado + " kWh";
    }

    lecturaAnterior.addEventListener("input", actualizarConsumo);
    lecturaActual.addEventListener("input", actualizarConsumo);
  });

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    const consumoA = parseInt(document.getElementById("consumoA").value) || 0;
    const consumoB = parseInt(document.getElementById("consumoB").value) || 0;
    const consumoC = parseInt(document.getElementById("consumoC").value) || 0;
    const totalConsumo = consumoA + consumoB + consumoC;

    const montoTotal = parseFloat(montoInput.value);
    if (isNaN(montoTotal) || totalConsumo === 0) return alert("Complete los campos correctamente.");

    const factor = montoTotal / totalConsumo;

    let pagoA = consumoA * factor;
    let pagoB = consumoB * factor;
    let pagoC = consumoC * factor;

    // Compensación simbólica para quien paga el recibo (Medidor C)
    let descuento = 1;
    let repartido = 0;

    if (consumoA >= 2 && consumoB === 0) {
      pagoA += descuento;
      repartido = descuento;
    } else if (consumoB >= 2 && consumoA === 0) {
      pagoB += descuento;
      repartido = descuento;
    } else if (consumoA >= 2 && consumoB >= 2) {
      pagoA += 0.50;
      pagoB += 0.50;
      repartido = 1;
    }

    pagoC -= repartido;

    // Redondeo a dos decimales
    pagoA = Math.round(pagoA * 10) / 10;
    pagoB = Math.round(pagoB * 10) / 10;
    pagoC = Math.round(pagoC * 10) / 10;

    // Ajuste final para mantener sumatoria igual al monto total
    const suma = pagoA + pagoB + pagoC;
    const diferencia = Math.round((montoTotal - suma) * 10) / 10;
    pagoC += diferencia;

    // Mostrar resultados
    const porcentajes = [
      { nombre: "A", kwh: consumoA, pago: pagoA },
      { nombre: "B", kwh: consumoB, pago: pagoB },
      { nombre: "C", kwh: consumoC, pago: pagoC }
    ];

    tablaBody.innerHTML = "";
    porcentajes.forEach((medidor) => {
      const row = document.createElement("tr");
      const porcentaje = totalConsumo > 0 ? ((medidor.kwh / totalConsumo) * 100).toFixed(1) + "%" : "0%";

      row.innerHTML = `
        <td>${medidor.nombre}</td>
        <td>${medidor.kwh} kWh</td>
        <td>${porcentaje}</td>
        <td>${medidor.pago.toFixed(2)}</td>
      `;
      tablaBody.appendChild(row);
    });

    // Fecha actual
    const ahora = new Date();
    const dia = ahora.getDate().toString().padStart(2, "0");
    const mes = (ahora.getMonth() + 1).toString().padStart(2, "0");
    const año = ahora.getFullYear();
    const hora = ahora.toLocaleTimeString("es-PE");

    fechaHora.textContent = `Fecha: ${dia}/${mes}/${año} | Hora: ${hora}`;

    // Calcular año del periodo
    const periodo = periodoSelect.value;
    const esDicEne = periodo === "Diciembre - Enero";
    const periodoTexto = `${periodo} de ${esDicEne ? año - 1 : año}`;

    modalPeriodo.textContent = periodoTexto;
    modal.style.display = "block";
  });

  closeModal.addEventListener("click", () => {
    modal.style.display = "none";
  });

  window.addEventListener("click", (e) => {
    if (e.target === modal) {
      modal.style.display = "none";
    }
  });
});
