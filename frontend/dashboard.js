import { auth, db } from "./firebase-config.js";
import { 
  onAuthStateChanged, 
  signOut 
} from "https://www.gstatic.com/firebasejs/11.0.1/firebase-auth.js";
import { 
  setDoc, 
  doc, 
  getDoc, 
  updateDoc, 
  arrayUnion 
} from "https://www.gstatic.com/firebasejs/11.0.1/firebase-firestore.js";

// Referencias a elementos del DOM
const logoutBtn = document.getElementById("logout");
const cursosSection = document.getElementById("cursos");

// Lista de cursos disponibles en la plataforma
const cursosDisponibles = [
  { 
    id: "armonia", 
    titulo: "Curso de Armonía", 
    url: "curso-armonia.html", 
    priceId: "price_1SDH61CL7DbPoSIwYMB3xA1D" 
  },
  { 
    id: "tecnica", 
    titulo: "Curso de Técnica Vocal", 
    url: "curso-tecnica.html", 
    priceId: "price_1SDH8dCL7DbPoSIwmCR8DT8y" 
  },
  { 
    id: "ritmo", 
    titulo: "Curso de Ritmo", 
    url: "curso-ritmo.html", 
    priceId: "price_1SDHBwCL7DbPoSIwi0G3x0xq" 
  }
];

// Verificar autenticación
onAuthStateChanged(auth, async (user) => {
  if (!user) {
    window.location.href = "login.html";
  } else {
    console.log("Usuario logueado:", user.uid);
    await cargarCursos(user.uid);
  }
});

// Cargar cursos comprados
async function cargarCursos(uid) {
  try {
    const userDoc = await getDoc(doc(db, "users", uid));
    let coursesPurchased = [];

    if (userDoc.exists()) {
      coursesPurchased = userDoc.data().coursesPurchased || [];
    }

    mostrarCursos(coursesPurchased);
  } catch (error) {
    console.error("Error cargando cursos:", error);
  }
}

// Mostrar cursos en pantalla
function mostrarCursos(coursesPurchased) {
  if (!cursosSection) {
    console.error("⚠️ No se encontró el contenedor de cursos en el HTML.");
    return;
  }

  cursosSection.innerHTML = "";
  cursosDisponibles.forEach(curso => {
    const div = document.createElement("div");
    div.classList.add("curso-card");

    const titulo = document.createElement("h3");
    titulo.textContent = curso.titulo;

    const btn = document.createElement("button");

    if (coursesPurchased.includes(curso.id)) {
      btn.textContent = "Entrar";
      btn.classList.add("txt-btn-entrar", "btn-entrar");
      btn.onclick = () => window.location.href = curso.url;
    } else {
      btn.textContent = "Comprar";
      btn.classList.add("txt-btn-comprar", "btn-comprar");
      btn.onclick = () => iniciarCompra(curso);
    }

    div.appendChild(titulo);
    div.appendChild(btn);
    cursosSection.appendChild(div);
  });
}

// Función separada para manejar la compra
async function iniciarCompra(curso) {
  const user = auth.currentUser;
  if (!user) return alert("Debes iniciar sesión para comprar un curso.");

  try {
    console.log("Iniciando compra:", {
      userId: user.uid,
      courseId: curso.id,
      priceId: curso.priceId
    });

    const response = await fetch("https://api.tutorialescristianos.app/create-checkout-session", {
      method: "POST",
      headers: { 
        "Content-Type": "application/json",
        "Accept": "application/json"
      },
      body: JSON.stringify({
        priceId: curso.priceId,
        courseId: curso.id,
        userId: user.uid        
      }),
    });

    const responseText = await response.text();
    console.log("Respuesta del servidor:", responseText);

    if (!response.ok) {
      let errorMessage = `Error del servidor: ${response.status}`;
      try {
        const errorData = JSON.parse(responseText);
        errorMessage = errorData.error || errorData.details || errorMessage;
      } catch (e) {
        errorMessage = responseText || errorMessage;
      }
      throw new Error(errorMessage);
    }

    const data = JSON.parse(responseText);
    console.log("✅ Sesión creada:", data.id);

    // Redirigir a Stripe Checkout
    const stripe = Stripe("pk_test_51SAf44CL7DbPoSIwdF0piDsEKCv8VVWChFNGDOJITjW3tnUL9QYSYbxTPVB2Vk3YjPELiAGggoXL1TZ6rmf8fZGB00HGZN4ViF");
    
    const { error } = await stripe.redirectToCheckout({ 
      sessionId: data.id 
    });

    if (error) {
      console.error("Error redirigiendo a Stripe:", error);
      alert("Error al redirigir al pago: " + error.message);
    }

  } catch (error) {
    console.error("❌ Error iniciando compra:", error);
    alert("Error al iniciar la compra: " + error.message);
  }
}

// Logout
if (logoutBtn) {
  logoutBtn.addEventListener("click", async () => {
    await signOut(auth);
    window.location.href = "login.html";
  });
}

