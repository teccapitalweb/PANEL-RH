/* =====================================================================
   store.js — capa de datos
   ---------------------------------------------------------------------
   Si Firebase está configurado, usa Firestore. Si no, usa localStorage
   (modo demo). Lo usan el kiosko (index.html) y el panel (panel.html).
   Estructura en Firestore:
     empresas/{EMPRESA_ID}/aspirantes/{id}     ← registros del examen
     empresas/{EMPRESA_ID}/config/evaluacion   ← mensaje final + puestos
   ===================================================================== */
(function () {
  function on() { return !!window.FIREBASE_ON; }
  function col() { return window.db.collection("empresas").doc(window.EMPRESA_ID || "default").collection("aspirantes"); }
  function cfgDoc() { return window.db.collection("empresas").doc(window.EMPRESA_ID || "default").collection("config").doc("evaluacion"); }
  function lsGet(k, d) { try { var v = localStorage.getItem(k); return v == null ? d : JSON.parse(v); } catch (e) { return d; } }
  function lsSet(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} }

  window.Store = {
    get on() { return on(); },

    guardarAspirante: function (reg) {
      if (on()) return col().add(reg).then(function (ref) { return Object.assign({}, reg, { id: ref.id }); });
      var arr = lsGet("examenrh_aspirantes", []); arr.push(reg); lsSet("examenrh_aspirantes", arr); return Promise.resolve(reg);
    },

    leerAspirantes: function () {
      if (on()) return col().orderBy("fecha", "desc").get().then(function (s) { return s.docs.map(function (d) { return Object.assign({}, d.data(), { id: d.id }); }); });
      return Promise.resolve(lsGet("examenrh_aspirantes", []));
    },

    leerConfig: function () {
      if (on()) return cfgDoc().get().then(function (s) { return s.exists ? s.data() : null; });
      var c = lsGet("examenrh_config", null), p = lsGet("examenrh_puestos", null);
      if (!c && !p) return Promise.resolve(null);
      var out = c ? Object.assign({}, c) : {};
      if (Array.isArray(p)) out.puestos = p;
      return Promise.resolve(out);
    },

    guardarConfig: function (cfg) {
      if (on()) return cfgDoc().set(cfg, { merge: true });
      var copy = Object.assign({}, cfg), puestos = copy.puestos; delete copy.puestos;
      lsSet("examenrh_config", copy);
      if (Array.isArray(puestos)) lsSet("examenrh_puestos", puestos);
      return Promise.resolve();
    },

    guardarEval: function (id, ev) {
      if (on()) return col().doc(id).set({ decision: ev.decision || "", notas: ev.notas || "" }, { merge: true });
      var evals = lsGet("examenrh_eval", {}); evals[id] = ev; lsSet("examenrh_eval", evals); return Promise.resolve();
    },

    evalsLocal: function () { return lsGet("examenrh_eval", {}); },
    login: function (email, pass) { if (on()) return window.auth.signInWithEmailAndPassword(email, pass); return Promise.reject(new Error("demo")); },
    logout: function () { if (on() && window.auth) return window.auth.signOut(); return Promise.resolve(); },
  };
})();
