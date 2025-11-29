const API_BASE = "http://127.0.0.1:8000";

let tiendasCache = {}; // Mapa id → nombre

//Cargar Tiendas (para mostrar nombres y para selects)

async function cargarTiendas() {
  try {
    const res = await fetch(`${API_BASE}/puntos_venta/`);
    const tiendas = await res.json();
    tiendasCache = {};
    tiendas.forEach(t => tiendasCache[t.id_punto_venta] = t.nombre);
  } catch (e) {
    console.error("Error cargando tiendas:", e);
  }
}


// Cargar lista de usuarios
async function cargarUsuarios(q = "") {
  const tbody = document.getElementById("tabla-usuarios");
  tbody.innerHTML = "<tr><td colspan='6'>Cargando...</td></tr>";

  let url = `${API_BASE}/usuarios/`;
  if (q) url += `?q=${encodeURIComponent(q)}`;

  try {
    const res = await fetch(url);
    const usuarios = await res.json();
    tbody.innerHTML = "";

    if (!usuarios.length) {
      tbody.innerHTML = "<tr><td colspan='6'>No hay usuarios registrados</td></tr>";
      return;
    }

    usuarios.forEach(user => {
      const tr = document.createElement("tr");

      const pv = user.punto_venta_id 
        ? (tiendasCache[user.punto_venta_id] || user.punto_venta_id)
        : "Global";

      tr.innerHTML = `
        <td>${user.id_usuario}</td>
        <td>${user.nombre}</td>
        <td>${user.email || "—"}</td>
        <td>${user.rol}</td>
        <td>${pv}</td>
        <td>
          <a class="link" href="#" onclick="abrirModalEditar(${user.id_usuario})">Editar</a>
          <a class="link" href="#" onclick="eliminarUsuario(${user.id_usuario})">Eliminar</a>
        </td>
      `;
      tbody.appendChild(tr);
    });

  } catch (e) {
    console.error(e);
    tbody.innerHTML = "<tr><td colspan='6'>Error al cargar usuarios</td></tr>";
  }
}

//Eliminar usuario
 
async function eliminarUsuario(id) {
  if (!confirm("¿Eliminar usuario?")) return;

  try {
    const res = await fetch(`${API_BASE}/usuarios/${id}`, { method: "DELETE" });

    if (res.status === 204) {
      alert("Usuario eliminado");
      cargarUsuarios();
    } else {
      const data = await res.json();
      alert(data.detail || "Error");
    }
  } catch (err) {
    alert("Error de conexión");
  }
}

//MODAL CREAR USUARIO
 
function abrirModalCrear() {
  document.getElementById("modal-crear").classList.remove("hidden");
  cargarPuntosVentaEnSelect();
}

function cerrarModal() {
  document.getElementById("modal-crear").classList.add("hidden");
}

async function cargarPuntosVentaEnSelect() {
  const sel = document.getElementById("crear-pv");
  sel.innerHTML = `<option value="">Seleccionar...</option>`;
  
  try {
    const res = await fetch(`${API_BASE}/puntos_venta/`);
    const tiendas = await res.json();
    tiendas.forEach(t => {
      sel.innerHTML += `<option value="${t.id_punto_venta}">${t.nombre}</option>`;
    });
  } catch (e) {}
}

//Guardar NUEVO usuario

document.addEventListener("DOMContentLoaded", async () => {
  const tablaUsuarios = document.getElementById("tabla-usuarios");

  if (tablaUsuarios) {
    await cargarTiendas();
    cargarUsuarios();

    const formFiltro = document.getElementById("filterFormUsuarios");
    if (formFiltro) {
      formFiltro.addEventListener("submit", e => {
        e.preventDefault();
        cargarUsuarios(formFiltro.q.value.trim());
      });
    }

    const formCrear = document.getElementById("form-crear-usuario");
    formCrear.addEventListener("submit", async e => {
      e.preventDefault();

      const payload = {
        nombre: crear-nombre.value.trim(),
        email: crear-email.value.trim(),
        contrasena: crear-pass.value.trim(),
        rol: crear-rol.value
      };

      if (payload.rol === "vendedor") {
        payload.punto_venta_id = parseInt(document.getElementById("crear-pv").value);
      } else {
        payload.punto_venta_id = null;
      }

      try {
        const res = await fetch(`${API_BASE}/usuarios/`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload)
        });

        if (!res.ok) {
          alert("Error al crear usuario");
          return;
        }

        alert("Usuario creado");
        cerrarModal();
        cargarUsuarios();

      } catch (err) {
        alert("Error de conexión");
      }
    });
  }
});

// MODAL EDITAR USUARIO

function abrirModalEditar(id) {
  document.getElementById("modal-editar").classList.remove("hidden");
  cargarPuntosVentaEnSelectEditar();
  cargarUsuarioParaEditar(id);
}

function cerrarModalEditar() {
  document.getElementById("modal-editar").classList.add("hidden");
}

async function cargarPuntosVentaEnSelectEditar() {
  const sel = document.getElementById("editar-pv");
  sel.innerHTML = `<option value="">Seleccionar...</option>`;

  try {
    const res = await fetch(`${API_BASE}/puntos_venta/`);
    const tiendas = await res.json();
    tiendas.forEach(t => {
      sel.innerHTML += `<option value="${t.id_punto_venta}">${t.nombre}</option>`;
    });
  } catch (e) {}
}

async function cargarUsuarioParaEditar(id) {
  try {
    const res = await fetch(`${API_BASE}/usuarios/${id}`);
    const user = await res.json();

    document.getElementById("editar-id").value = user.id_usuario;
    document.getElementById("editar-nombre").value = user.nombre;
    document.getElementById("editar-email").value = user.email;
    document.getElementById("editar-rol").value = user.rol;

    if (user.rol === "vendedor") {
      document.getElementById("editar-pv").value = user.punto_venta_id;
    } else {
      document.getElementById("editar-pv").value = "";
    }

  } catch (err) {
    alert("Error cargando usuario");
  }
}

//Guardar CAMBIOS usuario

document.addEventListener("DOMContentLoaded", () => {
  const formEditar = document.getElementById("form-editar-usuario");

  if (formEditar) {
    formEditar.addEventListener("submit", async e => {
      e.preventDefault();

      const id = editar-id.value;
      const payload = {
        nombre: editar-nombre.value.trim(),
        email: editar-email.value.trim(),
        rol: editar-rol.value
      };

      const pass = editar-pass.value.trim();
      if (pass !== "") payload.contrasena = pass;

      if (payload.rol === "vendedor") {
        payload.punto_venta_id = parseInt(editar-pv.value);
      } else {
        payload.punto_venta_id = null;
      }

      try {
        const res = await fetch(`${API_BASE}/usuarios/${id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload)
        });

        if (!res.ok) {
          alert("Error al actualizar");
          return;
        }

        alert("Usuario actualizado");
        cerrarModalEditar();
        cargarUsuarios();

      } catch (err) {
        alert("Error de conexión");
      }
    });
  }
});
