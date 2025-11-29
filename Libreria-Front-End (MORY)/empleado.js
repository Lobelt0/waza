const API_BASE = "http://127.0.0.1:8000";


// VALIDAR QUE SOLO UN VENDEDOR PUEDA ESTAR EN ESTA PÁGINA

window.addEventListener("DOMContentLoaded", () => {
  const rol = localStorage.getItem("userRole");

  if (rol !== "vendedor") {
    // Admin NO debe ver esta página
    window.location.href = "index.html";
    return;
  }

  cargarNombreLocal();
  cargarActividadReciente();
});


//CARGAR NOMBRE DEL LOCAL DEL EMPLEADO

async function cargarNombreLocal() {
  const spanLocal = document.getElementById("nombre-local");
  const pvId = localStorage.getItem("puntoVentaId");

  // Si es admin o no tiene local (no debería entrar aquí igual)
  if (!pvId || pvId === "null") {
    spanLocal.textContent = "Sin local";
    return;
  }

  try {
    const res = await fetch(`${API_BASE}/puntos_venta/${pvId}`);
    if (!res.ok) throw new Error("No se pudo cargar el punto de venta");

    const pv = await res.json();
    spanLocal.textContent = pv.nombre;

  } catch (err) {
    console.error(err);
    spanLocal.textContent = "Error";
  }
}


// CARGAR ACTIVIDAD DEL LOCAL (SOLO 5 MOVIMIENTOS)
async function cargarActividadReciente() {
  const ul = document.getElementById("actividad-list");
  if (!ul) return;

  ul.innerHTML = "<li class='muted'>Cargando actividad...</li>";

  const pvId = localStorage.getItem("puntoVentaId");

  try {
    // FILTRAR movimientos SOLO del punto de venta del empleado
    const res = await fetch(`${API_BASE}/movimientos/?punto_venta_id=${pvId}`);
    const movimientos = await res.json();

    if (!Array.isArray(movimientos) || movimientos.length === 0) {
      ul.innerHTML = "<li class='muted'>No hay movimientos recientes.</li>";
      return;
    }

    // Tomamos los 5 más recientes
    const recientes = movimientos.slice(0, 5);

    ul.innerHTML = "";

    recientes.forEach(mov => {
      const fecha = new Date(mov.fecha_movimiento);
      const fechaTexto = fecha.toLocaleString("es-CL", {
        dateStyle: "short",
        timeStyle: "short"
      });

      let tipoTexto = "";
      switch (mov.tipo) {
        case "venta": tipoTexto = "Venta"; break;
        case "entrada": tipoTexto = "Ingreso"; break;
        case "salida": tipoTexto = "Salida"; break;
        case "ajuste": tipoTexto = "Ajuste"; break;
        default: tipoTexto = mov.tipo; break;
      }

      const li = document.createElement("li");
      li.textContent = `${tipoTexto} — Cant: ${mov.cantidad} — ${mov.punto_venta_nombre} — ${fechaTexto}`;
      ul.appendChild(li);
    });

  } catch (err) {
    console.error(err);
    ul.innerHTML = "<li class='muted'>Error al cargar la actividad.</li>";
  }
}
