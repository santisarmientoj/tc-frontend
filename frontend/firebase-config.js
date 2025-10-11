// firebase-config.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-firestore.js";

// 🔹 Configuración de tu proyecto (copiar desde Firebase Console)
const firebaseConfig = {
  apiKey: "AIzaSyCc6CMb9XEEkPyUJQsQRqpzqvJZelHgzhA",
  authDomain: "tclogin-5881d.firebaseapp.com",
  projectId: "tclogin-5881d",
  storageBucket: "tclogin-5881d.firebasestorage.app",
  messagingSenderId: "976782544606",
  appId: "1:976782544606:web:04746ba41689fd03d5fc4f",
  measurementId: "G-WWJ784H883"
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);

// Exportar servicios
export const auth = getAuth(app);
export const db = getFirestore(app); // 👈 Aquí inicializamos Firestore

