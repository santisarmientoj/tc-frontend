// curso-armonia.js
import { auth } from "../firebase-config.js";

const content = document.getElementById("content");
const logoutBtn = document.getElementById("logoutBtn");

// ✅ Backend principal (Render o dominio personalizado)
const BACKEND_URL = "https://api.tutorialescristianos.app";

// 🔹 Cerrar sesión
logoutBtn.addEventListener("click", async () => {
  await auth.signOut();
  window.location.href = "login.html";
});

// 🔹 Verificar autenticación
auth.onAuthStateChanged(async (user) => {
  if (!user) {
    content.innerHTML = `
      <p>Debes iniciar sesión para acceder a este curso.</p>
      <a href="login.html">Ir al inicio de sesión</a>
    `;
    return;
  }

  try {
    // Intentar obtener token (sin forzar refresh todavía)
    let token = await user.getIdToken();
    console.log("Frontend: ID token obtenido:", token?.slice(0, 20) + "...");

    // ✅ Verificar acceso al curso
    const verifyRes = await fetch(`${BACKEND_URL}/api/verifyPurchase`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ courseId: "armonia" }),
    });

    // 🔹 Si el token expira o no tiene acceso
    if (!verifyRes.ok) {
      console.warn("verifyPurchase devolvió", verifyRes.status);
      if (verifyRes.status === 401 || verifyRes.status === 403) {
        console.log("Token expirado o inválido. Refrescando...");
        token = await user.getIdToken(true); // forzar refresh

        const retryRes = await fetch(`${BACKEND_URL}/api/verifyPurchase`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ courseId: "armonia" }),
        });

        if (!retryRes.ok) {
          const text = await retryRes.text().catch(() => null);
          throw new Error(`Backend rechazó después de refrescar: ${retryRes.status} - ${text}`);
        }

        const retryData = await retryRes.json();
        return handleVerificationResult(retryData);
      }

      // Si no es error de token, mostrar mensaje general
      const text = await verifyRes.text().catch(() => null);
      throw new Error(`Error del backend: ${verifyRes.status} - ${text}`);
    }

    const data = await verifyRes.json();
    handleVerificationResult(data);

  } catch (error) {
    console.error("Error en la verificación:", error);
    content.innerHTML = `
      <p>Ocurrió un error al verificar el acceso.</p>
      <a href="dashboard.html">Volver al panel</a>
    `;
  }
});

function handleVerificationResult(data) {
  if (!data || !data.accessGranted) {
    content.innerHTML = `
      <p>No tienes acceso a este curso.</p>
      <a href="dashboard.html">Volver al panel</a>
    `;
    return;
  }

  // ✅ Tiene acceso → cargar video
  //loadVideo();
}

/*async function loadVideo() {
  try {
    const user = auth.currentUser;
    const token = await user.getIdToken();

    const videoRes = await fetch(`${BACKEND_URL}/api/videos/playback-token`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        idToken: token,
        courseId: "armonia",
        videoId: "4yX00InsDRWssYPjr9iMYR014SNiG7tKZ1t381z6NxuI00" // <- reemplaza por el ID real del video
      }),
    });


    if (!videoRes.ok) {
      const txt = await videoRes.text().catch(() => null);
      throw new Error(`Error del endpoint de video ${videoRes.status}: ${txt}`);
    }

    const videoData = await videoRes.json();

    if (!videoData?.playbackId || !videoData?.token) {
      throw new Error("No se pudo obtener el video del curso.");
    }

    content.innerHTML = `
      <h2>Bienvenido al Curso de Armonía</h2>
      <mux-player
        playback-id="${videoData.playbackId}"
        stream-type="on-demand"
        tokens="${videoData.token}"
        style="width:100%; max-width:900px; aspect-ratio:16/9; border-radius:12px; margin-top:20px;"
      ></mux-player>
    `;

    const script = document.createElement("script");
    script.src = "https://cdn.jsdelivr.net/npm/@mux/mux-player";
    document.body.appendChild(script);

  } catch (err) {
    console.error("Error cargando video:", err);
    content.innerHTML = `
      <p>Error cargando video. Revisa la consola.</p>
      <a href="dashboard.html">Volver al panel</a>
    `;
  }
}*/





