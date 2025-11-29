const API_BASE = "http://127.0.0.1:8000";

async function cargarLibros(q = "") {
  const tbody = document.getElementById("tabla-libros-gestion");
  tbody.innerHTML = "<tr><td colspan='5'>Cargando...</td></tr>";

  let url = `${API_BASE}/libros/inventario_total`;
  if (q) url += `?q=${encodeURIComponent(q)}`;

  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error("Error");

    const libros = await res.json();
    tbody.innerHTML = "";

    if (!libros.length) {
      tbody.innerHTML = "<tr><td colspan='5'>No hay libros registrados</td></tr>";
      return;
    }

    libros.forEach(libro => {
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${libro.id_libro}</td>
        <td>${libro.nombre}</td>
        <td>${libro.stock_total}</td>
        <td>${libro.precio}</td>
        <td>
          <a class="link" href="#" onclick="editarLibro(${libro.id_libro})">Editar</a>
          <a class="link" href="#" onclick="eliminarLibro(${libro.id_libro}); return false;">Eliminar</a>
        </td>
      `;
      tbody.appendChild(tr);
    });

  } catch (err) {
    console.error(err);
    tbody.innerHTML = "<tr><td colspan='5'>Error al cargar libros</td></tr>";
  }
}

document.addEventListener("DOMContentLoaded", () => {
  cargarLibros();

  const form = document.getElementById("filterFormLibros");
  if (form) {
    form.addEventListener("submit", e => {
      e.preventDefault();
      cargarLibros(form.q.value.trim());
    });
  }
});
