/* =====================================================================
   firebase-config.js — Evaluación de Ingreso
   ---------------------------------------------------------------------
   El kiosko del aspirante y el panel privado de RH comparten el MISMO
   proyecto de Firebase. El aspirante (sin login) solo crea su registro
   en la colección "aspirantes"; RH (con login) lo lee y califica.
   ===================================================================== */
const firebaseConfig = {
  apiKey: "TODO",
  authDomain: "TODO.firebaseapp.com",
  projectId: "TODO",
  storageBucket: "TODO.appspot.com",
  messagingSenderId: "TODO",
  appId: "TODO",
};
/* Reglas sugeridas:
   - aspirantes: create público (el kiosko escribe), read/update solo RH autenticado.
   - El texto del popup final vive en config/evaluacion (editable por RH). */
