import { auth } from "../firebase-config.js";

const content = document.getElementById("content");
const logoutBtn = document.getElementById("logoutBtn");

// 🔹 URL del backend (Render)
const BACKEND_URL = "https://tc-backend-qew7.onrender.com";

// 🔹 Cerrar sesión
logoutBtn.addEventListener("click", async () => {
  await auth.signOut();
  window.location.href = "login.html";
});

// 🔹 Detectar usuario autenticado
auth.onAuthStateChanged(async (user) => {
  if (!user) {
    content.innerHTML = `
      <p>Debes iniciar sesión para acceder a este curso.</p>
      <a href="login.html">Ir al inicio de sesión</a>
    `;
    return;
  }

  try {
    // 🔸 Obtener el ID token de Firebase (para verificar en backend)
    const token = await user.getIdToken();

    // 🔸 Validar si el usuario compró el curso
    let res = await fetch(`${BACKEND_URL}/api/services/verify-purchase`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        userId: user.uid,
        courseId: "curso-armonia",
      }),
    });



    const data = await res.json();

    if (!data.accessGranted) {
      content.innerHTML = `
        <p>No tienes acceso a este curso.</p>
        <a href="dashboard.html">Volver al panel</a>
      `;
      return;
    }

    // 🔸 Si el usuario tiene acceso, cargar el video desde Mux con playback token
    const videoRes = await fetch(`${BACKEND_URL}/api/videos/playback-token`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ courseId: "curso-armonia" }),
    });

    const videoData = await videoRes.json();

    if (!videoData || !videoData.playbackId || !videoData.token) {
      throw new Error("No se pudo obtener el video del curso");
    }

    // 🔹 Insertar el reproductor Mux
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

    // Agregar el script del reproductor de Mux
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
});
