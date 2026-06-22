/* =====================================================================
   firebase-config.js — Conexión a Firebase (PLACEHOLDER)
   ---------------------------------------------------------------------
   El shell corre en modo DEMO sin Firebase. Para producción:

   1) Crea el proyecto en Firebase (Auth + Firestore).
   2) Pega aquí tu firebaseConfig real.
   3) Descomenta el bloque de inicialización (usa el SDK modular v10+).
   4) En app.js, cambia AUTH.modo y DATA.modo de "demo" a "firebase".

   Estructura Firestore sugerida (multi-tenant):
     empresas/{empresaId}
     empresas/{empresaId}/colaboradores/{colaboradorId}
     empresas/{empresaId}/incidencias/{incidenciaId}
     empresas/{empresaId}/eventos/{eventoId}   ← ledger inmutable (auditoría)
   Reglas: aislar por empresaId vía custom claims del usuario.
   ===================================================================== */

const firebaseConfig = {
  apiKey: "TU_API_KEY",
  authDomain: "TU_PROYECTO.firebaseapp.com",
  projectId: "TU_PROYECTO",
  storageBucket: "TU_PROYECTO.appspot.com",
  messagingSenderId: "000000000000",
  appId: "1:000000000000:web:xxxxxxxxxxxx",
};

/*  ── Descomenta para activar Firebase ──
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

export const app  = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db   = getFirestore(app);
*/
