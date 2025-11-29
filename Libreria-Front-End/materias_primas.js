const API_BASE = "http://127.0.0.1:8000";

// Datos de ejemplo para la simulación (ya que el API /materias_primas/ no existe)
const MOCK_MATERIAS_PRIMAS = [
    { id: 1, nombre: "Papel Bond (80g)", stock: 150000, stock_minimo: 200000, unidad: "páginas" },
    { id: 2, nombre: "Tinta Negra", stock: 4, stock_minimo: 5, unidad: "litros" },
    { id: 3, nombre: "Pegamento (Lomo)", stock: 15, stock_minimo: 10, unidad: "unidades" },
    { id: 4, nombre: "Cartón Tapa Dura", stock: 800, stock_minimo: 1000, unidad: "unidades" },
];

// Carga y muestra la lista de materias primas
async function cargarMateriasPrimas(q = "") {
  const tbody = document.getElementById("tabla-materias-primas");
  // 5 columnas: ID, Nombre, Stock, Stock Mínimo, Acciones
  tbody.innerHTML = "<tr><td colspan='5'>Cargando...</td></tr>";

  // En un entorno real, harías un fetch a `${API_BASE}/materias_primas/?q=${encodeURIComponent(q)}`

  // Usamos los datos de ejemplo y aplicamos filtro simple en el frontend
  let items = MOCK_MATERIAS_PRIMAS;

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
      tbody.innerHTML = "<tr><td colspan='5'>No hay materias primas registradas que coincidan con la búsqueda</td></tr>";
      return;
    }

    items.forEach((mp) => {
      // Determinar si el stock está bajo el mínimo para marcarlo
      const stockColor = mp.stock < mp.stock_minimo ? 'style="color: #dc2626; font-weight: 600;"' : '';
      
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${mp.id}</td>
        <td>${mp.nombre}</td>
        <td ${stockColor}>${mp.stock.toLocaleString()} ${mp.unidad}</td>
        <td>${mp.stock_minimo.toLocaleString()} ${mp.unidad}</td>
        <td>
          <a class="link" href="#" onclick="alert('Ajustar/Editar ${mp.nombre}')">Ajustar</a>
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
