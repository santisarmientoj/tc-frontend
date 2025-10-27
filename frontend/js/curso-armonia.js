// curso-armonia.js
import { auth } from "../firebase-config.js";

const content = document.getElementById("content");
const logoutBtn = document.getElementById("logoutBtn");

const BACKEND_URL = "https://tc-backend-qew7.onrender.com";

logoutBtn.addEventListener("click", async () => {
  await auth.signOut();
  window.location.href = "login.html";
});

auth.onAuthStateChanged(async (user) => {
  if (!user) {
    content.innerHTML = `
      <p>Debes iniciar sesión para acceder a este curso.</p>
      <a href="login.html">Ir al inicio de sesión</a>
    `;
    return;
  }

  try {
    // Intentamos obtener token; forzar refresh si falla luego
    let token = await user.getIdToken();
    console.log("Frontend: ID token obtenido (long):", token?.slice(0, 20) + "...");

    // Petición al backend para verificar compra
    const verifyRes = await fetch(`${BACKEND_URL}/api/verify-purchase`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ courseId: "armonia" }),
    });

    // Si no es ok, intentar forzar refresh del token una vez
    if (!verifyRes.ok) {
      console.warn("verify-purchase returned status", verifyRes.status);
      // Si es 401/403 puede ser token expirado; refrescamos y reintentamos
      if (verifyRes.status === 401 || verifyRes.status === 403) {
        console.log("Forzando refresh del ID token y reintentando...");
        token = await user.getIdToken(true); // forzar refresh
        console.log("Nuevo token:", token?.slice(0, 20) + "...");
        const retry = await fetch(`${BACKEND_URL}/api/verify-purchase`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ courseId: "armonia" }),
        });

        if (!retry.ok) {
          const text = await retry.text().catch(()=>null);
          console.error("Retry failed:", retry.status, text);
          throw new Error(`Backend rejected (after refresh): ${retry.status}`);
        }

        const data = await retry.json();
        handleVerificationResult(data);
      } else {
        const text = await verifyRes.text().catch(()=>null);
        throw new Error(`Backend error: ${verifyRes.status} - ${text}`);
      }
    } else {
      const data = await verifyRes.json();
      handleVerificationResult(data);
    }

  } catch (error) {
    console.error("Error en flujo de verificación:", error);
    content.innerHTML = `
      <p>Ocurrió un error al verificar el acceso. Revisa la consola.</p>
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

  // Si tiene acceso, solicitamos playback token
  loadVideo();
}

async function loadVideo() {
  try {
    const user = auth.currentUser;
    const token = await user.getIdToken();

    const videoRes = await fetch(`${BACKEND_URL}/api/videos/playback-token`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ courseId: "armonia" }),
    });

    if (!videoRes.ok) {
      const txt = await videoRes.text().catch(()=>null);
      throw new Error(`Video endpoint error ${videoRes.status}: ${txt}`);
    }

    const videoData = await videoRes.json();

    if (!videoData?.playbackId || !videoData?.token) {
      throw new Error("No se pudo obtener el video del curso");
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
    content.innerHTML = `<p>Error cargando video. Revisa la consola.</p><a href="dashboard.html">Volver al panel</a>`;
  }
}




