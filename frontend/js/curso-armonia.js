// curso-armonia.js

const content = document.getElementById("content");
const logoutBtn = document.getElementById("logoutBtn");

const BACKEND_URL = "https://tc-backend-qew7.onrender.com";

// 🔹 Cerrar sesión (simplemente redirige)
logoutBtn.addEventListener("click", () => {
  // Aquí asumimos que la sesión se maneja en otra parte
  window.location.href = "login.html";
});

(async () => {
  try {
    // 🔹 Obtener token del almacenamiento local (ya generado en el login)
    const token = localStorage.getItem("userToken");
    console.log("Token obtenido:", token);
    if (!token) {
      content.innerHTML = `
        <p>Tu sesión no es válida o ha expirado.</p>
        <a href="login.html">Iniciar sesión</a>
      `;
      return;
    }

    // 🔹 Verificar acceso al curso
    const res = await fetch(`${BACKEND_URL}/api/services/verify-purchase`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ courseId: "curso-armonia" }),
    });

    const data = await res.json();

    if (!data.accessGranted) {
      content.innerHTML = `
        <p>No tienes acceso a este curso.</p>
        <a href="dashboard.html">Volver al panel</a>
      `;
      return;
    }

    // 🔹 Obtener video
    const videoRes = await fetch(`${BACKEND_URL}/api/videos/playback-token`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ courseId: "curso-armonia" }),
    });

    const videoData = await videoRes.json();

    if (!videoData?.playbackId || !videoData?.token) {
      throw new Error("No se pudo obtener el video del curso");
    }

    // 🔹 Mostrar el video
    content.innerHTML = `
      <h2>Bienvenido al Curso de Armonía</h2>
      <mux-player
        playback-id="${videoData.playbackId}"
        env-key="mux-player"
        tokens="${videoData.token}"
        stream-type="on-demand"
        style="width:100%; max-width:900px; aspect-ratio:16/9; border-radius:12px; margin-top:20px;"
      ></mux-player>
    `;

    // 🔹 Cargar script de Mux
    const script = document.createElement("script");
    script.src = "https://cdn.jsdelivr.net/npm/@mux/mux-player";
    document.body.appendChild(script);
  } catch (error) {
    console.error(error);
    content.innerHTML = `
      <p>Ocurrió un error al verificar el acceso.</p>
      <a href="dashboard.html">Volver al panel</a>
    `;
  }
})();



