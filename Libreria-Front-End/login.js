document.getElementById("loginForm").addEventListener("submit", async function (e) {
  e.preventDefault();

  const email = document.querySelector("input[name='email']").value;
  const contrasena = document.querySelector("input[name='password']").value;

  try {
    const response = await fetch("http://127.0.0.1:8000/usuarios/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, contrasena })   // 👈 mismos nombres que en FastAPI
    });

    const data = await response.json();

    if (response.ok) {
      alert("✅ " + data.message);

      // Guardar rol
      localStorage.setItem("userRole", data.role);

      // Redirigir según el rol
      if (data.role === "admin") {
        window.location.href = "admin.html";
      } else {
        window.location.href = "user.html";
      }
    } else {
      alert("❌ " + (data.detail || data.message || "Error de inicio de sesión"));
    }
  } catch (error) {
    alert("⚠️ Error al conectar con el servidor.");
    console.error(error);
  }
});
