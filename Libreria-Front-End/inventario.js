const API_BASE = "http://127.0.0.1:8000";

// Carga el inventario desde el backend
async function cargarInventario(q = "") {
  const tbody = document.getElementById("tabla-libros");
  // Ahora son 6 columnas: ID Inv., Libro, Punto de Venta, Stock, Stock Mínimo, Acciones
  tbody.innerHTML = "<tr><td colspan='6'>Cargando...</td></tr>"; // <-- Colspan ajustado

  let url = `${API_BASE}/inventario/`;
  if (q) {
    url += `?q=${encodeURIComponent(q)}`;
  }

  try {
    const res = await fetch(url);
    if (!res.ok) {
      throw new Error("Error al obtener el inventario");
    }

    const items = await res.json();
    tbody.innerHTML = "";

    if (!items.length) {
      tbody.innerHTML = "<tr><td colspan='6'>Sin resultados</td></tr>"; // <-- Colspan ajustado
      return;
    }

    // Valores de ejemplo, ya que estos datos no se devuelven actualmente por la API /inventario
    const puntoVentaEjemplo = "Librería Central";
    const stockMinimoEjemplo = 10;

    items.forEach((item) => {
      // Nota: asumimos que el campo 'nombre' del libro está disponible en el objeto 'item'
      // Esto requiere una modificación del backend (inventario.py y schemas.py) para funcionar correctamente.
      const nombreLibro = item.nombre || "Libro ID: " + item.libro_id;
      
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${item.id_inventario}</td>
        <td>${nombreLibro}</td>
        <td>${puntoVentaEjemplo}</td>
        <td>${item.stock}</td>
        <td>${stockMinimoEjemplo}</td>
        <td>
          <a class="link" href="#" onclick="venderLibro(${item.id_inventario}); return false;">Vender</a>
        </td>
      `; // Ahora son 6 <td>
      tbody.appendChild(tr);
    });
  } catch (e) {
    console.error(e);
    tbody.innerHTML = "<tr><td colspan='6'>Error al cargar inventario</td></tr>"; // <-- Colspan ajustado
  }
}

// Esta función se llama cuando haces click en "Vender"
window.venderLibro = async function (idInventario) {
  // 1) Pedir cantidad
  const cantidadStr = prompt("¿Cuántas unidades quieres vender?");
  if (!cantidadStr) {
    // Usuario canceló
    return;
  }

  const cantidad = parseInt(cantidadStr, 10);
  if (isNaN(cantidad) || cantidad <= 0) {
    alert("La cantidad debe ser un número mayor que 0.");
    return;
  }

  // 2) Determinar el usuario_id
  // De momento usamos un ID fijo (1). Más adelante podemos guardar el id real en localStorage.
  const userIdStr = localStorage.getItem("userId");
  const usuario_id = userIdStr ? parseInt(userIdStr, 10) : 1;

  // 3) Armar el cuerpo del movimiento (MovimientoCreate)
  const movimiento = {
    inventario_id: idInventario,
    tipo: "venta",
    cantidad: cantidad,
    usuario_id: usuario_id,
    fecha_movimiento: new Date().toISOString(),
    observaciones: "Venta registrada desde el panel de inventario"
  };

  try {
    const res = await fetch(`${API_BASE}/movimientos/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(movimiento)
    });

    const data = await res.json();

    if (!res.ok) {
      const msg = data.detail || "No se pudo registrar la venta.";
      alert("❌ " + msg);
      return;
    }

    alert("✅ Venta registrada correctamente.");

    // 4) Volver a cargar el inventario para ver el nuevo stock
    cargarInventario();
  } catch (error) {
    console.error(error);
    alert("⚠️ Error al conectar con el servidor.");
  }
};

// Cuando carga la página
document.addEventListener("DOMContentLoaded", () => {
  // Cargar inventario inicial
  cargarInventario();

  // Buscar formulario de filtro (acepta dos posibles IDs por si tu HTML tiene uno u otro)
  const formFiltro =
    document.getElementById("formFiltro") ||
    document.getElementById("filterForm");

  if (formFiltro) {
    formFiltro.addEventListener("submit", function (e) {
      e.preventDefault();
      const q = this.q.value.trim();
      cargarInventario(q);
    });
  }
});