import { signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-auth.js";
import { auth } from "./firebase-config.js";

const form = document.getElementById("loginForm");

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  
  console.log("Formulario enviado"); // Debug

  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  console.log("Datos capturados:", email, password); // Debug

  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    console.log("Login exitoso:", userCredential.user);
    window.location.href = "dashboard.html";
  } catch (error) {
    console.error("Error en login:", error.code, error.message);
    alert("Error: " + error.message);
  }
});



