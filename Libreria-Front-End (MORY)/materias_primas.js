const API_BASE = "http://127.0.0.1:8000";

// Carga el inventario desde el backend
async function cargarMateriasPrimas(q = "") {
  const tbody = document.getElementById("tabla-materias-primas");

  tbody.innerHTML = "<tr><td colspan='5'>Cargando...</td></tr>";

  let url = `${API_BASE}/materias_primas/`;
  if (q) {
    url += `?q=${encodeURIComponent(q)}`;
  }

  try {
    const res = await fetch(url);
    if (!res.ok) {
      throw new Error("Error al obtener materias primas");
    }

    const items = await res.json();
    mostrarMateriasPrimas(items, tbody);

  } catch (err) {
    console.error(err);
    tbody.innerHTML = "<tr><td colspan='5'>Error al cargar materias primas</td></tr>";
  }
}

// Carga y muestra la lista de materias primas
async function cargarMateriasPrimas(q = "") {
  const tbody = document.getElementById("tabla-materias-primas");
  // 5 columnas: ID, Nombre, Stock, Stock Mínimo, Acciones
  tbody.innerHTML = "<tr><td colspan='5'>Cargando...</td></tr>";

  // En un entorno real, harías un fetch a `${API_BASE}/materias_primas/?q=${encodeURIComponent(q)}`

  // Usamos los datos de ejemplo y aplicamos filtro simple en el frontend
  

  if (q) {
    const query = q.toLowerCase();
    items = MOCK_MATERIAS_PRIMAS.filter(mp => 
        mp.nombre.toLowerCase().includes(query)
    );
  }
  
  // Renderizar la tabla
  mostrarMateriasPrimas(items, tbody);
}

// Función auxiliar para renderizar los datos
function mostrarMateriasPrimas(items, tbody) {
  tbody.innerHTML = "";

  if (!items.length) {
    tbody.innerHTML = "<tr><td colspan='5'>No hay materias primas registradas</td></tr>";
    return;
  }

  items.forEach((mp) => {
    const stockBajo = mp.stock < mp.stock_minimo;
    const color = stockBajo ? 'style="color:#dc2626; font-weight:600;"' : "";

    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${mp.id_materia}</td>
      <td>${mp.nombre} (${mp.unidad})</td>
      <td ${color}>${mp.stock.toLocaleString()}</td>
      <td>${mp.stock_minimo.toLocaleString()}</td>
      <td>
        <a class="link" href="#" onclick="ajustarMateria(${mp.id_materia}); return false;">Ajustar</a>
      </td>
    `;
    tbody.appendChild(tr);
  });
}

// Cuando carga la página
document.addEventListener("DOMContentLoaded", () => {
  // Cargar materias primas inicial
  cargarMateriasPrimas();

  // Listener para el formulario de filtro/búsqueda
  const formFiltro = document.getElementById("filterFormMP");

  if (formFiltro) {
    formFiltro.addEventListener("submit", function (e) {
      e.preventDefault();
      const q = this.q.value.trim();
      cargarMateriasPrimas(q);
    });
  }
});

window.ajustarMateria = async function(idMateria) {
  const value = prompt("Ingrese el ajuste (positivo o negativo):");

  if (!value) return;

  const cantidad = parseInt(value, 10);

  if (isNaN(cantidad)) {
    alert("Debe ingresar un número válido.");
    return;
  }

  try {
    const res = await fetch(`${API_BASE}/materias_primas/${idMateria}/ajustar?cantidad=${cantidad}`, {
      method: "POST"
    });

    const data = await res.json();

    if (!res.ok) {
      alert("❌ Error: " + (data.detail || "No se pudo ajustar el stock."));
      return;
    }

    alert("✅ Stock ajustado correctamente.");

    // Recargar tabla con los datos actualizados
    cargarMateriasPrimas();

  } catch (err) {
    console.error(err);
    alert("⚠️ Error al conectar con el servidor.");
  }
};