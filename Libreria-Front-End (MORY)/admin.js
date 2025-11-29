const API_BASE = "http://127.0.0.1:8000";


// VALIDAR ACCESO SOLO PARA ADMIN
window.addEventListener("DOMContentLoaded", () => {
  const rol = localStorage.getItem("userRole");

  if (rol !== "admin") {
    window.location.href = "index.html";
    return;
  }

  cargarResumenAdmin();
  cargarMovimientosGlobales();
});


//CARGAR RESUMEN GENERAL DEL SISTEMA

async function cargarResumenAdmin() {
  const totalLibrosSpan = document.getElementById("total-libros");
  const totalTiendasSpan = document.getElementById("total-tiendas");
  const totalStockSpan = document.getElementById("stock-total");
  const stockBajoSpan = document.getElementById("stock-bajo");
  const materiasPrimasSpan = document.getElementById("total-materias");

  try {
    // ---- LIBROS ----
    const librosRes = await fetch(`${API_BASE}/libros/`);
    const libros = await librosRes.json();
    totalLibrosSpan.textContent = libros.length;

    // ---- TIENDAS ----
    const tiendasRes = await fetch(`${API_BASE}/puntos_venta/`);
    const tiendas = await tiendasRes.json();
    totalTiendasSpan.textContent = tiendas.length;

    // ---- INVENTARIO ----
    const invRes = await fetch(`${API_BASE}/inventario/`);
    const inventario = await invRes.json();

    const totalStock = inventario.reduce((sum, item) => sum + item.stock, 0);
    totalStockSpan.textContent = totalStock;

    // Stock bajo (por ahora = 0)
    const bajo = inventario.filter(i => i.stock <= 0).length;
    stockBajoSpan.textContent = bajo;

    // ---- MATERIAS PRIMAS ----
    const mpRes = await fetch(`${API_BASE}/materias_primas/`);
    const mp = await mpRes.json();
    materiasPrimasSpan.textContent = mp.length;

  } catch (err) {
    console.error(err);
    alert("❌ Error al cargar el resumen del administrador.");
  }
}


// CARGAR ÚLTIMOS 5 MOVIMIENTOS GLOBALES

async function cargarMovimientosGlobales() {
  const ul = document.getElementById("movimientos-globales");
  ul.innerHTML = "<li class='muted'>Cargando actividad...</li>";

  try {
    const res = await fetch(`${API_BASE}/movimientos/`);
    const movimientos = await res.json();

    if (!Array.isArray(movimientos) || movimientos.length === 0) {
      ul.innerHTML = "<li class='muted'>No hay actividad reciente.</li>";
      return;
    }

    ul.innerHTML = "";
    movimientos.slice(0, 5).forEach(mov => {
      const fecha = new Date(mov.fecha_movimiento).toLocaleString("es-CL");

      const li = document.createElement("li");
      li.textContent = `${mov.tipo.toUpperCase()} — Cant: ${mov.cantidad} — ${mov.punto_venta_nombre} — ${fecha}`;
      ul.appendChild(li);
    });

  } catch (err) {
    console.error(err);
    ul.innerHTML = "<li class='muted'>Error al cargar.</li>";
  }
}

