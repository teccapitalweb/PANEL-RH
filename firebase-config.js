/* =====================================================================
   firebase-config.js — Evalua RH
   ---------------------------------------------------------------------
   Llena firebaseConfig con los datos de TU proyecto (consola de Firebase
   → Configuración del proyecto → Tus apps → Web). Si lo dejas en "TODO",
   la app corre en MODO DEMO (localStorage) y nada se rompe.
   El kiosko y el panel comparten el MISMO proyecto.
   ===================================================================== */
var firebaseConfig = {
  apiKey: "TODO",
  authDomain: "TODO.firebaseapp.com",
  projectId: "TODO",
  storageBucket: "TODO.appspot.com",
  messagingSenderId: "TODO",
  appId: "TODO",
};

/* El asistente "Conectar a la nube" del panel puede guardar aquí la configuración
   sin que tengas que editar este archivo (queda en este navegador). Para que
   funcione en TODAS las tablets, el asistente también te genera este archivo ya
   lleno para subirlo a GitHub. */
try {
  var _fbSaved = JSON.parse(localStorage.getItem("examenrh_fbconfig") || "null");
  if (_fbSaved && _fbSaved.apiKey && _fbSaved.apiKey !== "TODO") firebaseConfig = _fbSaved;
} catch (e) {}

/* ID del espacio de la empresa (tenant). Para una sola empresa déjalo así.
   Si luego sirves a varias, usa un ID distinto por cliente. */
const EMPRESA_ID = "default";

/* (Opcional) Endpoint de IA para el resumen ejecutivo. Déjalo vacío para usar
   el generador por reglas (sin costo, sin backend). Ver IA-ENDPOINT.md. */
const AI_ENDPOINT = "";

(function () {
  var on = false, db = null, auth = null;
  var real = firebaseConfig.apiKey && firebaseConfig.apiKey !== "TODO";
  if (real && typeof firebase !== "undefined") {
    try {
      firebase.initializeApp(firebaseConfig);
      db = firebase.firestore();
      auth = firebase.auth();
      on = true;
    } catch (e) { console.warn("Firebase no inició; modo demo:", e && e.message); }
  }
  if (typeof window !== "undefined") {
    window.db = db; window.auth = auth; window.FIREBASE_ON = on; window.EMPRESA_ID = EMPRESA_ID; window.AI_ENDPOINT = AI_ENDPOINT;
  }
})();
