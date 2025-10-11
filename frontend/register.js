// register.js
import { auth, db } from "./firebase-config.js";
import { createUserWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-auth.js";
import { doc, setDoc } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-firestore.js";

document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("registerForm");
  const errorMsg = document.getElementById("error-msg");

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const name = document.getElementById("name").value.trim();
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value;
    const countryCode = document.getElementById("countryCode").value;
    const phoneNumber = document.getElementById("phoneNumber").value;
    const fullPhone = `${countryCode} ${phoneNumber}`;

    try {
      // 1. Crear usuario en Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // 2. Crear documento en Firestore con el UID
      await setDoc(doc(db, "users", user.uid), {
        name: name,
        email: user.email,
        phone: fullPhone, // 👈 aquí se guarda el número completo
        createdAt: new Date(),
        role: "student",
        coursesPurchased: []
      });

      alert("Registro exitoso 🎉");
      window.location.href = "login.html"; // Redirige al login
    } catch (error) {
      console.error("Error en el registro:", error);
      errorMsg.textContent = error.message;
    }
  });
});


