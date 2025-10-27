import { auth, db } from "../firebase-config.js";
import { doc, getDoc } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-firestore.js";

const content = document.getElementById("content");
const logoutBtn = document.getElementById("logoutBtn");

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
    // 🔸 Obtener los datos del usuario desde Firestore
    const userRef = doc(db, "users", user.uid);
    const userSnap = await getDoc(userRef);

    if (!userSnap.exists()) {
      content.innerHTML = `
        <p>No se encontraron tus datos de usuario.</p>
        <a href="dashboard.html">Volver al panel</a>
      `;
      return;
    }

    const userData = userSnap.data();

    // 🔸 Verificar si el usuario tiene comprado el curso
    const purchasedCourses = userData.purchasedCourses || [];
    const hasAccess = purchasedCourses.includes("curso-armonia");

    if (!hasAccess) {
      content.innerHTML = `
        <p>No tienes acceso a este curso.</p>
        <a href="dashboard.html">Volver al panel</a>
      `;
      return;
    }

    // 🔸 Si el usuario tiene acceso, mostrar el contenido del curso
    content.innerHTML = `
      <h2>Bienvenido al Curso de Armonía</h2>
      <mux-player
        playback-id="TU_PLAYBACK_ID_AQUI"
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

