console.log("user.js cargado correctamente");

const API_BASE = "http://127.0.0.1:8000";

// === 1. OBTENER EL PUNTO DE VENTA DEL USUARIO ===
const puntoVentaID = localStorage.getItem("userPV");

if (!puntoVentaID) {
  alert("Error: No se encontró el Punto de Venta del usuario.");
  window.location.href = "index.html";
}

// === 2. CARGAR INFO DEL PUNTO DE VENTA ===

async function cargarInfoPV() {
  try {
    const res = await fetch(`${API_BASE}/puntos-venta/${puntoVentaID}`);
    const pv = await res.json();

    document.getElementById("info-pv").innerHTML = `
      <strong>Punto de Venta:</strong> ${pv.nombre}<br>
      <strong>Ubicación:</strong> ${pv.ubicacion}<br>
      <strong>Tipo:</strong> ${pv.tipo}
    `;
  } catch (e) {
    document.getElementById("info-pv").innerText =
      "Error cargando información del punto de venta";
  }
}

// === 3. CARGAR INVENTARIO SOLO DEL PUNTO DE VENTA ===

async function cargarInventarioPV() {
  const tbody = document.getElementById("tabla-inv-user");
  tbody.innerHTML = "<tr><td colspan='3'>Cargando inventario...</td></tr>";

  try {
    const res = await fetch(`${API_BASE}/inventario/?punto_venta_id=${puntoVentaID}`);

    if (!res.ok) {
      tbody.innerHTML = "<tr><td colspan='3'>Error al cargar inventario</td></tr>";
      return;
    }

    const items = await res.json();
    tbody.innerHTML = "";

    if (!items.length) {
      tbody.innerHTML = "<tr><td colspan='3'>No hay libros en inventario</td></tr>";
      return;
    }

    items.forEach(item => {
      const tr = document.createElement("tr");

      tr.innerHTML = `
        <td>${item.libro_nombre}</td>
        <td>${item.stock}</td>
        <td>
          <button class="btn-sm" onclick="venderUno(${item.id_inventario})">Vender -1</button>
        </td>
      `;

      tbody.appendChild(tr);
    });

  } catch (e) {
    console.error(e);
    tbody.innerHTML = "<tr><td colspan='3'>Error al conectar</td></tr>";
  }
}

// === 4. RESTAR 1 AL STOCK (REGISTRAR VENTA) ===

async function venderUno(idInventario) {
  if (!confirm("¿Registrar venta y reducir stock?")) return;

  try {
    const res = await fetch(`${API_BASE}/movimientos/venta/${idInventario}`, {
      method: "POST",
    });

    if (!res.ok) {
      alert("Error al registrar venta.");
      return;
    }

    alert("Venta registrada correctamente.");
    cargarInventarioPV();

  } catch (e) {
    console.error(e);
    alert("Error de conexión.");
  }
}

// === 5. INICIALIZAR PÁGINA ===

document.addEventListener("DOMContentLoaded", () => {
  cargarInfoPV();
  cargarInventarioPV();
});
