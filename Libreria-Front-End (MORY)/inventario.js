const API_BASE = "http://127.0.0.1:8000";

async function cargarInventario(q = "") {
  const tbody = document.getElementById("tabla-libros");
  tbody.innerHTML = "<tr><td colspan='6'>Cargando...</td></tr>";

  const puntoVentaId = localStorage.getItem("puntoVentaId");
  let url = `${API_BASE}/inventario/`;

  if (puntoVentaId && puntoVentaId !== "null") {
    url += `?punto_venta_id=${puntoVentaId}`;
  }

  if (q) {
    url += url.includes("?") ? `&q=${encodeURIComponent(q)}` 
                             : `?q=${encodeURIComponent(q)}`;
  }

  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error("Error al obtener inventario");

    const items = await res.json();
    tbody.innerHTML = "";

    if (!items.length) {
      tbody.innerHTML = "<tr><td colspan='6'>Sin resultados</td></tr>";
      return;
    }

    items.forEach(item => {
      const tr = document.createElement("tr");

      tr.innerHTML = `
        <td>${item.id_inventario}</td>
        <td>${item.nombre}</td>
        <td>${item.punto_venta_nombre ?? "—"}</td>
        <td>${item.stock}</td>
        <td>—</td>
        <td>
          <a class="link" href="#" onclick="venderLibro(${item.id_inventario}); return false;">Vender</a>
        </td>
      `;

      tbody.appendChild(tr);
    });

  } catch (err) {
    console.error(err);
    tbody.innerHTML = "<tr><td colspan='6'>Error al cargar inventario</td></tr>";
  }
}

window.venderLibro = async function (idInventario) {
  const cantidadStr = prompt("¿Cuántas unidades quieres vender?");
  if (!cantidadStr) return;

  const cantidad = parseInt(cantidadStr);
  if (isNaN(cantidad) || cantidad <= 0) {
    alert("Cantidad inválida.");
    return;
  }

  const usuario_id = parseInt(localStorage.getItem("userId"));
  if (!usuario_id) {
    alert("Error: No hay usuario autenticado.");
    window.location.href = "index.html";
    return;
  }

  const movimiento = {
    inventario_id: idInventario,
    tipo: "venta",
    cantidad,
    usuario_id,
    fecha_movimiento: new Date().toISOString(),
    observaciones: "Venta desde inventario"
  };

  try {
    const res = await fetch(`${API_BASE}/movimientos/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(movimiento)
    });

    const data = await res.json();
    if (!res.ok) {
      alert("Error: " + (data.detail || "Error desconocido"));
      return;
    }

    alert("Venta realizada");
    cargarInventario();

  } catch (err) {
    console.error(err);
    alert("Error al conectar al servidor.");
  }
};

document.addEventListener("DOMContentLoaded", () => {
  const rol = localStorage.getItem("userRole");
  if (!rol) {
    window.location.href = "index.html";
    return;
  }

  // Bloqueo por rol
  if (rol === "vendedor") {
    document.querySelector('a[href="usuarios.html"]').style.display = "none";
    document.querySelector('a[href="puntos_venta.html"]').style.display = "none";
    document.querySelector('a[href="libros.html"]').style.display = "none";
  }

  cargarInventario();

  const formFiltro = document.getElementById("formFiltro");
  formFiltro.addEventListener("submit", e => {
    e.preventDefault();
    cargarInventario(formFiltro.q.value.trim());
  });
});
