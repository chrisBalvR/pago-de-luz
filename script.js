document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("luzForm");
  const modal = document.getElementById("modal");
  const closeModal = document.getElementById("closeModal");
  const resultado = document.getElementById("resultado");
  const periodoTitulo = document.getElementById("periodoTitulo");
  const montoTotalInput = document.getElementById("montoTotal");

  // 🔹 Forzar 2 decimales al salir del campo del monto
  montoTotalInput.addEventListener("blur", () => {
    let val = parseFloat(montoTotalInput.value);
    if (!isNaN(val)) {
      montoTotalInput.value = val.toFixed(2);
    }
  });

  function formatDecimal(value) {
    return parseFloat(value).toFixed(2);
  }

  function calcularConsumo(idAnterior, idActual, idResultado) {
    const anterior = parseInt(document.getElementById(idAnterior).value) || 0;
    const actual = parseInt(document.getElementById(idActual).value) || 0;
    const consumo = Math.max(actual - anterior, 0);
    document.getElementById(idResultado).value = consumo;
    return consumo;
  }

  // 🔹 Calcular consumo automático por medidor
  ["A", "B", "C"].forEach((letra) => {
    document.getElementById(`lectura${letra}Anterior`).addEventListener("input", () =>
      calcularConsumo(`lectura${letra}Anterior`, `lectura${letra}Actual`, `consumo${letra}`)
    );
    document.getElementById(`lectura${letra}Actual`).addEventListener("input", () =>
      calcularConsumo(`lectura${letra}Anterior`, `lectura${letra}Actual`, `consumo${letra}`)
    );
  });

  form.addEventListener("submit", (e) => {
    e.preventDefault();

    const montoTotal = parseFloat(montoTotalInput.value);
    const periodo = document.getElementById("periodo").value;

    const consumoA = calcularConsumo("lecturaAAnterior", "lecturaAActual", "consumoA");
    const consumoB = calcularConsumo("lecturaBAnterior", "lecturaBActual", "consumoB");
    const consumoC = calcularConsumo("lecturaCAnterior", "lecturaCActual", "consumoC");

    const totalConsumo = consumoA + consumoB + consumoC;

    let pagoA = 0, pagoB = 0, pagoC = 0;

    if (totalConsumo > 0) {
      pagoA = (montoTotal * consumoA) / totalConsumo;
      pagoB = (montoTotal * consumoB) / totalConsumo;
      pagoC = (montoTotal * consumoC) / totalConsumo;

      // 🔹 Ajuste por redondeo (bono por pagar el recibo)
      let compensacion = 1.00;

      if (consumoA >= 2 && consumoB === 0) {
        pagoA += compensacion;
      } else if (consumoB >= 2 && consumoA === 0) {
        pagoB += compensacion;
      } else if (consumoA >= 2 && consumoB >= 2) {
        pagoA += compensacion / 2;
        pagoB += compensacion / 2;
      }

      pagoC = montoTotal - (pagoA + pagoB);
    } else {
      pagoC = montoTotal;
    }

    // 🔹 Redondear a máximo 1 decimal
    pagoA = Math.round(pagoA * 10) / 10;
    pagoB = Math.round(pagoB * 10) / 10;
    pagoC = Math.round(pagoC * 10) / 10;

    // 🔹 Porcentajes de consumo
    const porcA = totalConsumo > 0 ? ((consumoA / totalConsumo) * 100).toFixed(1) : "0.0";
    const porcB = totalConsumo > 0 ? ((consumoB / totalConsumo) * 100).toFixed(1) : "0.0";
    const porcC = totalConsumo > 0 ? ((consumoC / totalConsumo) * 100).toFixed(1) : "0.0";

    // 🔹 Año de referencia
    const hoy = new Date();
    let anio = hoy.getFullYear();
    if (periodo === "Diciembre - Enero") {
      anio -= 1;
    }

    // 🔹 Mostrar resultados en modal
    periodoTitulo.textContent = `correspondiente a: ${periodo} de ${anio}`;
    resultado.innerHTML = `
      <p><strong>Fecha actual:</strong> ${hoy.toLocaleDateString()}</p>
      <p><strong>Hora:</strong> ${hoy.toLocaleTimeString()}</p>
      <table>
        <thead>
          <tr>
            <th>Departamento</th>
            <th>Consumo (kWh)</th>
            <th>% del consumo</th>
            <th>Monto a Pagar (S/)</th>
          </tr>
        </thead>
        <tbody>
          <tr><td>A</td><td>${consumoA}</td><td>${porcA}%</td><td>${formatDecimal(pagoA)}</td></tr>
          <tr><td>B</td><td>${consumoB}</td><td>${porcB}%</td><td>${formatDecimal(pagoB)}</td></tr>
          <tr><td>C</td><td>${consumoC}</td><td>${porcC}%</td><td>${formatDecimal(pagoC)}</td></tr>
        </tbody>
      </table>
    `;

    modal.style.display = "block";
  });

  closeModal.addEventListener("click", () => {
    modal.style.display = "none";
  });
});
