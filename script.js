document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('formulario');
  const modal = document.getElementById('modal');
  const cerrar = document.querySelector('.cerrar');
  const tablaResultados = document.getElementById('tabla-resultados');
  const mesAnio = document.querySelector('.mes-anio');
  const fechaHora = document.querySelector('.fecha-hora');

  // Referencias a campos de lectura
  const aAnt = document.getElementById('aAnt');
  const aAct = document.getElementById('aAct');
  const aCons = document.getElementById('aCons');
  const bAnt = document.getElementById('bAnt');
  const bAct = document.getElementById('bAct');
  const bCons = document.getElementById('bCons');
  const cAnt = document.getElementById('cAnt');
  const cAct = document.getElementById('cAct');
  const cCons = document.getElementById('cCons');
  const montoInput = document.getElementById('monto');

  // 🔄 Calcular consumo automáticamente al llenar lecturas
  [aAnt, aAct, bAnt, bAct, cAnt, cAct].forEach(input => {
    input.addEventListener('input', () => {
      calcularConsumo(aAnt, aAct, aCons);
      calcularConsumo(bAnt, bAct, bCons);
      calcularConsumo(cAnt, cAct, cCons);
    });
  });

  // 🧠 Autocompletar decimales al salir del campo de monto
  montoInput.addEventListener('blur', () => {
    let val = parseFloat(montoInput.value);
    if (!isNaN(val)) {
      montoInput.value = val.toFixed(2);
    }
  });

  function calcularConsumo(ant, act, cons) {
    const anterior = parseInt(ant.value);
    const actual = parseInt(act.value);
    if (!isNaN(anterior) && !isNaN(actual) && actual >= anterior) {
      cons.value = `${actual - anterior} kWh`;
    } else {
      cons.value = '';
    }
  }

  // 🧮 Evento principal al enviar el formulario
  form.addEventListener('submit', function (e) {
    e.preventDefault();

    const mesSeleccionado = document.getElementById('mes').value;
    const total = parseFloat(montoInput.value);
    const consumoA = parseInt(aCons.value) || 0;
    const consumoB = parseInt(bCons.value) || 0;
    const consumoC = parseInt(cCons.value) || 0;
    const totalConsumo = consumoA + consumoB + consumoC;

    if (totalConsumo === 0 || isNaN(total)) {
      alert("Verifica que todos los campos estén correctamente llenados.");
      return;
    }

    // Calcular proporciones
    const porcA = consumoA / totalConsumo;
    const porcB = consumoB / totalConsumo;
    const porcC = consumoC / totalConsumo;

    // Calcular montos preliminares
    let montoA = round(total * porcA);
    let montoB = round(total * porcB);
    let montoC = round(total * porcC);

    // Ajuste de "compensación" para quien paga
    let compensacion = 1.00;
    let ajusteA = 0, ajusteB = 0;

    if (consumoA >= 2 && consumoB >= 2) {
      ajusteA = round(compensacion / 2);
      ajusteB = round(compensacion / 2);
    } else if (consumoA >= 2 && consumoB < 2) {
      ajusteA = compensacion;
    } else if (consumoB >= 2 && consumoA < 2) {
      ajusteB = compensacion;
    }

    montoA = consumoA > 0 ? round(montoA + ajusteA) : 0;
    montoB = consumoB > 0 ? round(montoB + ajusteB) : 0;
    montoC = round(total - montoA - montoB);

    // Generar tabla
    tablaResultados.innerHTML = '';
    const data = [
      { medidor: 'A', consumo: consumoA, porc: porcA * 100, monto: montoA },
      { medidor: 'B', consumo: consumoB, porc: porcB * 100, monto: montoB },
      { medidor: 'C', consumo: consumoC, porc: porcC * 100, monto: montoC },
    ];

    data.forEach(d => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${d.medidor}</td>
        <td>${d.consumo} kWh</td>
        <td>${(d.porc).toFixed(0)}%</td>
        <td>S/ ${d.monto.toFixed(2)}</td>
      `;
      tablaResultados.appendChild(tr);
    });

    // Fecha y periodo
    const hoy = new Date();
    const anio = hoy.getFullYear();
    const periodoFinal = mesSeleccionado === "Diciembre - Enero" ? anio - 1 : anio;
    const hora = hoy.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const fecha = hoy.toLocaleDateString('es-PE');

    mesAnio.textContent = `${mesSeleccionado} de ${periodoFinal}`;
    fechaHora.textContent = `Fecha y hora de lectura: ${fecha} - ${hora}`;

    modal.style.display = 'block';
  });

  cerrar.onclick = () => {
    modal.style.display = 'none';
  };

  window.onclick = e => {
    if (e.target === modal) {
      modal.style.display = 'none';
    }
  };

  function round(num) {
    return Math.round(num * 10) / 10;
  }
});
