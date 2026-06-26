(function (PREGUNTAS, DIMENSIONES, NIVEL_DIM, CRITICAS, CONFIG, RH_PASS, PUESTOS, PREGUNTAS_PUESTO) {
/* =====================================================================
   panel.js — Panel privado de Recursos Humanos
   Lee los aspirantes guardados por el kiosko (mismo origen / Firestore).
   En este preview no hay datos reales, así que genera ejemplos.
   ===================================================================== */

const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const MESES = ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic"];
const fechaLarga = iso => { if (!iso) return "—"; const [y, m, d] = iso.slice(0, 10).split("-").map(Number); return `${d} ${MESES[m - 1]} ${y}`; };
const initials = n => n.split(" ").slice(0, 2).map(w => w[0]).join("").toUpperCase();
const pct100 = p => Math.round(p * 100);
const fdRel = n => { const d = new Date(); d.setDate(d.getDate() + n); const z = x => String(x).padStart(2, "0"); return `${d.getFullYear()}-${z(d.getMonth() + 1)}-${z(d.getDate())}`; };

/* ---------- White-label (marca) ---------- */
var MARCA = { nombre: "", logo: "", color: "" };
function aplicarColor(hex) {
  if (!hex || !/^#[0-9a-fA-F]{6}$/.test(hex)) return;
  var r = parseInt(hex.slice(1, 3), 16), g = parseInt(hex.slice(3, 5), 16), b = parseInt(hex.slice(5, 7), 16);
  var s = document.documentElement.style;
  s.setProperty("--accent", hex); s.setProperty("--accent-2", hex); s.setProperty("--accent-soft", "rgba(" + r + "," + g + "," + b + ",.14)");
}
function aplicarMarcaPanel(m) {
  if (!m) return;
  MARCA = m;
  if (m.color) aplicarColor(m.color);
  var b = document.getElementById("appBrand");
  if (b) {
    var ic = m.logo ? '<img class="brand__logo" src="' + m.logo + '" alt="">' : '<span class="mark"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 11l3 3 8-8"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg></span>';
    b.innerHTML = ic + " " + (m.nombre || "Panel de Selección");
  }
}

/* ---------- Calificación (igual que el kiosko) ---------- */
var UMBRALES = { fortaleza: 0.75, promedio: 0.45, bandera: 0.45 };
function nivelDimObj(pct) { return pct >= UMBRALES.fortaleza ? { label: "Fortaleza", cls: "ok" } : pct >= UMBRALES.promedio ? { label: "Promedio", cls: "warn" } : { label: "Área de oportunidad", cls: "bad" }; }
function clsDePct(pct) { return nivelDimObj(pct).cls; }
function reaplicarUmbrales(r) {
  if (!r || !r.porDim) return r;
  Object.keys(r.porDim).forEach(d => { if (r.porDim[d]) r.porDim[d].nivel = nivelDimObj(r.porDim[d].pct).label; });
  r.banderas = CRITICAS.filter(d => r.porDim[d] && r.porDim[d].pct < UMBRALES.bandera);
  if (r.puesto) r.puesto.nivel = nivelDimObj(r.puesto.pct).label;
  return r;
}
function calcularResultado(resp, aten) {
  const dims = {};
  Object.keys(DIMENSIONES).forEach(d => { if (d !== "atencion") dims[d] = { sum: 0, max: 0 }; });
  Object.values(resp).forEach(r => { if (dims[r.dim] && !r.info) { dims[r.dim].sum += r.v; dims[r.dim].max += 3; } });
  const porDim = {};
  Object.keys(dims).forEach(d => { if (dims[d].max > 0) { const pct = dims[d].sum / dims[d].max; porDim[d] = { pct, nivel: nivelDimObj(pct).label }; } });
  if (aten) porDim.atencion = { pct: aten.score / 3, nivel: nivelDimObj(aten.score / 3).label, avgMs: aten.avgMs };
  const vals = Object.values(porDim).map(x => x.pct);
  const global = vals.length ? vals.reduce((a, b) => a + b, 0) / vals.length : 0;
  const aciertos = Object.values(resp).filter(r => r.dim === "intelecto" && r.correcta).length;
  const banderas = CRITICAS.filter(d => porDim[d] && porDim[d].pct < UMBRALES.bandera);
  const rResp = Object.values(resp).filter(r => r.dim === "puesto" && !r.info);
  const rmax = rResp.length * 3, rsum = rResp.reduce((s, r) => s + r.v, 0);
  const puesto = rmax ? { pct: rsum / rmax, nivel: nivelDimObj(rsum / rmax).label, n: rResp.length } : null;
  return { porDim, global, aciertosIntelecto: aciertos, banderas, puesto };
}

/* ---------- Datos de ejemplo ---------- */
const TXT_OK = {
  ab1: "Vi que tienen proyectos recientes de capacitación y certificación; me gustó ese enfoque, no solo el discurso de la misión.",
  ab2: "Tuve que decidir entre cumplir una entrega a tiempo o frenar por un error que detecté. Avisé al cliente, reajustamos el plazo dos días y entregamos sin fallas. Resultado: el cliente quedó conforme.",
  ab3: "No alcancé una meta de ventas trimestral. Me faltó organizar mi tiempo y dar seguimiento. Aprendí a planear por semana y a pedir apoyo a tiempo; el trimestre siguiente sí la cumplí.",
  ab4: "El mejor jefe daba indicaciones claras y confianza para decidir. Con el que me costó, cambiaba mucho las prioridades; aprendí a confirmar por escrito lo acordado.",
  ab5: "¿Cuáles son los objetivos de los primeros 90 días y cómo miden el éxito en este puesto?",
};
const TXT_GEN = {
  ab1: "Pues me gustó la empresa y queda cerca.",
  ab2: "Yo siempre resuelvo todo hablando, no tengo problemas con nadie.",
  ab3: "El cliente nunca sabía lo que quería, por eso no se logró.",
  ab4: "Todos mis jefes han sido buenos, no tengo queja.",
  ab5: "¿Cuánto pagan y qué prestaciones dan?",
};
function pickByFav(opciones, target) { let bi = 0, bd = Infinity; opciones.forEach((o, i) => { const d = Math.abs(o.v - target); if (d < bd) { bd = d; bi = i; } }); return bi; }
function genAspirante(b, idx) {
  const respuestas = {};
  PREGUNTAS.forEach(q => {
    if (q.tipo === "abierta") { respuestas[q.id] = { tipo: "abierta", texto: (b.generico ? TXT_GEN : TXT_OK)[q.id] || "Respuesta de ejemplo.", dim: q.dim, tag: q.tag, abierta: true }; return; }
    let i;
    if (q.info) i = idx % q.opciones.length;
    else { const t = (b.overrides && b.overrides[q.dim] != null) ? b.overrides[q.dim] : b.target; i = pickByFav(q.opciones, t); }
    const opt = q.opciones[i];
    respuestas[q.id] = { optIdx: i, v: opt.v, dim: q.dim, correcta: !!opt.correcta, info: !!q.info, otro: !!opt.otro, otroTexto: opt.otro ? "Un conocido que ya trabaja aquí" : "", porque: q.info ? "" : "Porque va con mi forma de ser y mi experiencia." };
  });
  ((PREGUNTAS_PUESTO && PREGUNTAS_PUESTO[b.puesto]) || []).forEach(q => {
    const t = (b.overrides && b.overrides[q.dim] != null) ? b.overrides[q.dim] : b.target;
    const i = pickByFav(q.opciones, t); const opt = q.opciones[i];
    respuestas[q.id] = { optIdx: i, v: opt.v, dim: q.dim, correcta: !!opt.correcta, info: false, otro: false, otroTexto: "", porque: "Por mi experiencia en ese tipo de trabajo." };
  });
  const atencion = { avgMs: b.ms, score: b.ms < 320 ? 3 : b.ms < 460 ? 2 : b.ms < 650 ? 1 : 0, intentos: [b.ms - 18, b.ms + 22, b.ms, b.ms + 9, b.ms - 7] };
  const resultado = calcularResultado(respuestas, atencion);
  resultado.calidad = (b.conf && b.conf.calidad) || { rapidas: 2, total: 30, medianaMs: 3400, bandera: false };
  resultado.control = (b.conf && b.conf.control) || null;
  resultado.consistencia = (b.conf && b.conf.consistencia) || { pares: 5, consistentes: 5, pct: 1, bandera: false };
  const first = b.nombre.split(" ")[0].toLowerCase();
  const nac = ["1996-03-12", "1998-07-05", "1993-11-20", "2000-01-15", "1991-09-09"][idx % 5];
  const datos = { nombre: b.nombre, tel: "238 123 45" + (10 + idx), correo: first + idx + "@correo.com", curp: "", nacimiento: nac, genero: idx % 2 ? "Femenino" : "Masculino", escolaridad: ["Secundaria", "Preparatoria", "Técnico", "Licenciatura"][idx % 4], puesto: b.puesto };
  return { id: "demo" + idx, fecha: b.fecha, datos, respuestas, atencion, resultado, decision: b.decision || "", notas: b.notas || "" };
}
function SEED() {
  if (window.__seed) return window.__seed;
  const base = [
    { nombre: "María Fernanda Soto", puesto: "Cajero(a)", target: 3, ms: 285, fecha: fdRel(-1) },
    { nombre: "José Luis Ramírez", puesto: "Ventas", target: 2.4, ms: 360, fecha: fdRel(-1) },
    { nombre: "Diana Patricia Cruz", puesto: "Atención a cliente", target: 2, ms: 430, fecha: fdRel(-2), decision: "revision" },
    { nombre: "Carlos Méndez Vargas", puesto: "Cajero(a)", target: 2.2, overrides: { honestidad: 0 }, ms: 400, fecha: fdRel(-3), notas: "Revisar respuestas de honestidad." },
    { nombre: "Luis Ángel Torres", puesto: "Almacén", target: 1, generico: true, ms: 620, fecha: fdRel(-4), decision: "descartar", conf: { calidad: { rapidas: 19, total: 30, medianaMs: 680, bandera: true }, consistencia: { pares: 5, consistentes: 1, pct: 0.2, bandera: true } } },
  ];
  window.__seed = base.map((b, i) => genAspirante(b, i));
  return window.__seed;
}

/* ---------- Carga / persistencia ---------- */
function cargar() {
  return window.Store.leerAspirantes().then(function (arr) {
    var demo = false;
    if (!arr.length && !window.Store.on) { arr = SEED().map(function (a) { return Object.assign({}, a); }); demo = true; }
    if (!window.Store.on) {
      var evals = window.Store.evalsLocal();
      arr.forEach(function (a) { var e = evals[a.id]; if (e) { if (e.estado) a.estado = e.estado; else if (e.decision) a.decision = e.decision; a.notas = e.notas || ""; } });
    }
      arr.forEach(function (a) { reaplicarUmbrales(a.resultado); });
    return { arr: arr, demo: demo };
  });
}
function guardarEval(id, estado, notas) { window.Store.guardarEval(id, { estado: estado, notas: notas }).catch(function () {}); }
function configActual() {
  let c = null; try { c = JSON.parse(localStorage.getItem("examenrh_config") || "null"); } catch (e) {}
  return { titulo: (c && c.mensajeFinTitulo) || CONFIG.mensajeFinTitulo, cuerpo: (c && c.mensajeFinCuerpo) || CONFIG.mensajeFinCuerpo };
}

/* ---------- Estado ---------- */
const state = { aspirantes: [], demo: false, busqueda: "", puesto: "Todos", orden: "score", estado: "Todos", comparar: [], vista: "aspirantes" };
const DEC = { contratar: { t: "Contratar", cls: "ok" }, revision: { t: "En revisión", cls: "warn" }, descartar: { t: "Descartar", cls: "bad" } };
const ESTADOS = {
  nuevo: { t: "Nuevo", cls: "muted" },
  evaluado: { t: "Evaluado", cls: "info" },
  entrevista: { t: "Entrevista", cls: "warn" },
  contratado: { t: "Contratado", cls: "ok" },
  descartado: { t: "Descartado", cls: "bad" },
};
const ORDEN_ESTADOS = ["nuevo", "evaluado", "entrevista", "contratado", "descartado"];
function estadoDe(a) { return a.estado || ({ contratar: "contratado", descartar: "descartado", revision: "evaluado" }[a.decision]) || "nuevo"; }

function toast(msg) { const t = document.createElement("div"); t.className = "toast"; t.textContent = msg; document.body.appendChild(t); requestAnimationFrame(() => t.classList.add("is-on")); setTimeout(() => { t.classList.remove("is-on"); setTimeout(() => t.remove(), 300); }, 2400); }

/* ---------- Lista ---------- */
function navTabs() {
  return `<div class="vtabs">
    <button class="vtab ${state.vista !== "fases" ? "is-on" : ""}" data-v="aspirantes">Aspirantes</button>
    <button class="vtab ${state.vista === "fases" ? "is-on" : ""}" data-v="fases">Evaluación por fases</button>
  </div>`;
}
function wireTabs() {
  $$(".vtab").forEach(b => b.addEventListener("click", () => { if (state.vista === b.dataset.v) return; state.vista = b.dataset.v; renderApp(); }));
}
function renderApp() {
  if (state.vista === "fases") return renderFasesView();
  $("#wrap").innerHTML = '<div class="page-head"><p style="color:var(--muted)">Cargando aspirantes…</p></div>';
  cargar().then(function (d) { state.aspirantes = d.arr; state.demo = d.demo; _renderAppUI(); })
    .catch(function () { $("#wrap").innerHTML = '<div class="page-head"><p>No se pudieron cargar los aspirantes.</p></div>'; });
}

/* ---------- Apartado "Evaluación por fases" (embudo multi-sesión) ---------- */
const FASES_NOM = ["Sobre ti", "Tu forma de ser", "Cómo piensas y decides", "En el trabajo", "Tu reacción"];
const FASE_DIM_P = { perfil: 1, personalidad: 2, social: 2, intelecto: 3, juicio: 3, servicio: 4, estres: 4, logistica: 4, honestidad: 4, psicosocial: 4, entrevista: 4, puesto: 4, control: 4 };
function copiarTexto(txt) {
  const done = () => toast("Enlace copiado.");
  if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(txt).then(done).catch(done);
  else { try { const ta = document.createElement("textarea"); ta.value = txt; document.body.appendChild(ta); ta.select(); document.execCommand("copy"); ta.remove(); done(); } catch (e) {} }
}
function renderFasesView() {
  $("#wrap").innerHTML = `${navTabs()}<div class="page-head"><h1>Evaluación por fases</h1><p style="color:var(--muted)">Cargando candidatos…</p></div>`;
  wireTabs();
  window.Store.leerCandidatosFases().then(function (arr) { _renderFasesUI(arr || []); }).catch(function () { _renderFasesUI([]); });
}
function _renderFasesUI(arr) {
  const card = (cf) => {
    const fc = cf.faseCompletada || 0, fa = cf.faseActual || 1, fin = cf.estado === "finalizado";
    const steps = [1, 2, 3, 4, 5].map(n => {
      let cls = "locked";
      if (fin || n <= fc) cls = "done"; else if (n === fa) cls = "current";
      return `<div class="cf-step cf-step--${cls}" title="Fase ${n}: ${FASES_NOM[n - 1]}"><span class="cf-step__n">${n}</span><span class="cf-step__l">${FASES_NOM[n - 1]}</span></div>`;
    }).join("");
    let estadoTxt, accion = "";
    if (fin) {
      estadoTxt = `<span class="cf-badge cf-badge--ok">Finalizado</span> Evaluación completa.`;
      accion = `<button class="btn btn--sm btn--primary" data-ver="${cf.token}">Ver resultado</button>`;
    } else if (fc >= fa && fc < 5) {
      estadoTxt = `<span class="cf-badge cf-badge--warn">Por revisar</span> Terminó la Fase ${fc}. Revisa sus respuestas y autoriza la siguiente.`;
      accion = `<button class="btn btn--sm btn--primary" data-aut="${cf.token}" data-next="${fc + 1}">Autorizar Fase ${fc + 1}</button><button class="btn btn--sm" data-resp="${cf.token}">Ver respuestas</button>`;
    } else {
      estadoTxt = fc === 0 ? `<span class="cf-badge">Sin empezar</span> Aún no contesta la Fase 1.` : `<span class="cf-badge cf-badge--info">En curso</span> Contestando la Fase ${fa}.`;
      accion = fc > 0 ? `<button class="btn btn--sm" data-resp="${cf.token}">Ver respuestas</button>` : "";
    }
    const link = linkBase() + "?inv=" + cf.token;
    const faseMostrar = fin ? 5 : fc;
    return `<div class="cf-card">
      <div class="cf-card__head">
        <div><div class="cf-card__name">${cf.nombre || "Sin nombre"}</div><div class="cf-card__sub">${cf.puesto || "Sin puesto"} · ${fechaLarga(cf.creada)}</div></div>
        <div class="cf-card__prog">Fase ${faseMostrar} de 5</div>
      </div>
      <div class="cf-steps">${steps}</div>
      <div class="cf-card__estado">${estadoTxt}</div>
      <div class="cf-card__actions">${accion}<button class="btn btn--sm btn--ghost" data-copy="${link}">Copiar enlace</button><button class="btn btn--sm btn--ghost cf-del" data-del="${cf.token}">Eliminar</button></div>
    </div>`;
  };
  const demo = !window.Store.on;
  $("#wrap").innerHTML = `
    ${navTabs()}
    <div class="page-head">
      <h1>Evaluación por fases</h1>
      <p>El candidato contesta una fase por sesión. Al terminar cada fase se detiene; tú revisas y autorizas la siguiente. Siempre usa el mismo enlace.</p>
      ${demo ? `<div class="demo-note"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4M12 8h.01"/></svg>Modo demo · para que el candidato continúe desde otro día o dispositivo necesitas Firebase conectado</div>` : ""}
    </div>
    <div class="toolbar"><button class="btn btn--sm btn--primary" id="cfNew"><svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 5v14M5 12h14"/></svg>Nuevo candidato por fases</button></div>
    ${arr.length ? `<div class="cf-list">${arr.map(card).join("")}</div>` : `<div class="card"><p class="inv-empty" style="padding:26px">Aún no hay candidatos por fases. Crea uno con el botón de arriba, o activa el modo "Por fases" en Configuración para que los del kiosko aparezcan aquí.</p></div>`}`;
  wireTabs();
  $("#cfNew").addEventListener("click", nuevoCandidatoFases);
  $$("[data-copy]").forEach(b => b.addEventListener("click", () => copiarTexto(b.dataset.copy)));
  $$("[data-aut]").forEach(b => b.addEventListener("click", () => autorizarFaseCF(b.dataset.aut, Number(b.dataset.next))));
  $$("[data-resp]").forEach(b => b.addEventListener("click", () => verRespuestasCF(b.dataset.resp)));
  $$("[data-ver]").forEach(b => b.addEventListener("click", () => verResultadoCF(b.dataset.ver)));
  $$("[data-del]").forEach(b => b.addEventListener("click", () => eliminarCF(b.dataset.del)));
}
function autorizarFaseCF(token, next) {
  window.Store.actualizarCandidatoFases(token, { faseActual: next }).then(function () { toast(`Fase ${next} habilitada.`); renderFasesView(); }).catch(function () { toast("No se pudo autorizar."); });
}
function eliminarCF(token) {
  if (!confirm("¿Eliminar este candidato por fases? Se borran sus respuestas.")) return;
  window.Store.eliminarCandidatoFases(token).then(function () { toast("Candidato eliminado."); renderFasesView(); }).catch(function () {});
}
function verResultadoCF(token) {
  window.Store.leerCandidatoFases(token).then(function (cf) {
    if (!cf || !cf.resultado) { toast("Aún no hay resultado."); return; }
    abrirDetalleObj({ id: cf.token, datos: cf.datos || {}, respuestas: cf.respuestas || {}, atencion: cf.atencion, resultado: cf.resultado, consentimiento: { aceptado: true, fecha: cf.creada }, fecha: cf.finalizada || cf.creada }, { sinEstado: true });
  });
}
function bancoTodo() {
  const m = {};
  (PREGUNTAS || []).forEach(q => { m[q.id] = q; });
  Object.keys(PREGUNTAS_PUESTO || {}).forEach(k => (PREGUNTAS_PUESTO[k] || []).forEach(q => { m[q.id] = q; }));
  return m;
}
function verRespuestasCF(token) {
  window.Store.leerCandidatoFases(token).then(function (cf) {
    if (!cf) return;
    const mapa = bancoTodo(), resp = cf.respuestas || {}, porFase = { 1: [], 2: [], 3: [], 4: [] };
    Object.keys(resp).forEach(id => {
      const q = mapa[id], r = resp[id];
      const fase = q ? (FASE_DIM_P[q.dim] || 4) : 4;
      let ans = "—";
      if (q && q.opciones && r && typeof r.optIdx === "number" && q.opciones[r.optIdx]) ans = q.opciones[r.optIdx].t;
      else if (r && (r.texto || r.valor || r.respuesta)) ans = r.texto || r.valor || r.respuesta;
      porFase[fase].push({ texto: q ? q.texto : "Pregunta de control", ans: ans, porque: r && r.porque, otro: r && r.otroTexto });
    });
    let cuerpo = [1, 2, 3, 4].map(f => {
      if (!porFase[f].length) return "";
      return `<div class="sec-title">Fase ${f} · ${FASES_NOM[f - 1]}</div>` + porFase[f].map(it => `<div class="ans-item"><div class="ans-q">${it.texto}</div><div class="ans-a">${it.ans}</div>${it.otro ? `<div class="ans-otro">Otro: ${it.otro}</div>` : ""}${it.porque ? `<div class="ans-why"><span>Porqué:</span> ${it.porque}</div>` : ""}</div>`).join("");
    }).join("");
    if (cf.atencion) cuerpo += `<div class="sec-title">Fase 5 · ${FASES_NOM[4]}</div><div class="ans-item"><div class="ans-q">Reacción promedio</div><div class="ans-a">${cf.atencion.avgMs || "—"} ms</div></div>`;
    if (!cuerpo) cuerpo = `<p class="inv-empty">Sin respuestas todavía.</p>`;
    const ov = document.createElement("div"); ov.className = "modal-overlay";
    ov.innerHTML = `<div class="modal modal--editor"><div class="resumen-head"><h3>Respuestas · ${cf.nombre || "Sin nombre"}</h3><button class="icon-btn" data-x><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18M6 6l12 12"/></svg></button></div><div class="cf-resp">${cuerpo}</div></div>`;
    document.body.appendChild(ov); requestAnimationFrame(() => ov.classList.add("is-on"));
    const close = () => { ov.classList.remove("is-on"); setTimeout(() => ov.remove(), 220); };
    $$("[data-x]", ov).forEach(b => b.addEventListener("click", close));
    ov.addEventListener("click", e => { if (e.target === ov) close(); });
  });
}
function nuevoCandidatoFases() {
  const ov = document.createElement("div"); ov.className = "modal-overlay";
  const puestos = puestosActuales();
  ov.innerHTML = `<div class="modal modal--inv">
    <div class="resumen-head"><h3>Nuevo candidato por fases</h3><button class="icon-btn" data-x><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18M6 6l12 12"/></svg></button></div>
    <p class="inv-intro">Genera un enlace para el embudo. El candidato contestará la Fase 1 y se detendrá hasta que tú autorices la siguiente.</p>
    <div class="field"><label class="field__label">Nombre (opcional)</label><input class="input" id="cfNom" placeholder="Nombre del candidato"></div>
    <div class="field"><label class="field__label">Puesto (opcional)</label><div class="sel"><select id="cfPue"><option value="">Sin especificar</option>${puestos.map(p => `<option>${p}</option>`).join("")}</select><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m6 9 6 6 6-6"/></svg></div></div>
    <button class="btn btn--primary" id="cfGen" style="margin-top:4px">Generar enlace</button>
    <div id="cfRes" hidden style="margin-top:16px"><label class="field__label">Enlace del candidato</label><div class="inv-linkrow"><input class="input" id="cfLink" readonly><button class="btn btn--sm" id="cfCopy">Copiar</button></div></div>
  </div>`;
  document.body.appendChild(ov); requestAnimationFrame(() => ov.classList.add("is-on"));
  const close = () => { ov.classList.remove("is-on"); setTimeout(() => ov.remove(), 220); renderFasesView(); };
  $$("[data-x]", ov).forEach(b => b.addEventListener("click", close));
  ov.addEventListener("click", e => { if (e.target === ov) close(); });
  $("#cfGen", ov).addEventListener("click", () => {
    const token = "cf_" + Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
    const cf = { token: token, nombre: $("#cfNom", ov).value.trim(), puesto: $("#cfPue", ov).value, datos: {}, faseActual: 1, faseCompletada: 0, respuestas: {}, atencion: null, estado: "en_curso", creada: new Date().toISOString() };
    window.Store.crearCandidatoFases(cf).then(function () { $("#cfLink", ov).value = linkBase() + "?inv=" + token; $("#cfRes", ov).hidden = false; }).catch(function () { toast("No se pudo crear."); });
  });
  $("#cfCopy", ov).addEventListener("click", () => copiarTexto($("#cfLink", ov).value));
}
function _renderAppUI() {
  const puestos = ["Todos", ...[...new Set(state.aspirantes.map(a => a.datos.puesto))].sort()];
  $("#wrap").innerHTML = `
    ${navTabs()}
    <div class="page-head">
      <h1>Aspirantes</h1>
      <p>Resultados de la evaluación de ingreso. Toca un aspirante para ver su detalle.</p>
      ${state.demo ? `<div class="demo-note"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4M12 8h.01"/></svg>Datos de ejemplo · cuando conectes el kiosko aparecerán aquí los aspirantes reales</div>` : ""}
    </div>
    <div class="dash" id="dash"></div>
    <div class="pipeline" id="pipeline"></div>
    <div class="toolbar">
      <div class="search"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg><input class="input" id="q" placeholder="Buscar por nombre…" value="${state.busqueda}"></div>
      <div class="sel"><select id="fPuesto">${puestos.map(p => `<option ${p === state.puesto ? "selected" : ""}>${p}</option>`).join("")}</select><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m6 9 6 6 6-6"/></svg></div>
      <div class="sel"><select id="fOrden">
        <option value="score" ${state.orden === "score" ? "selected" : ""}>Mejor puntaje</option>
        <option value="fecha" ${state.orden === "fecha" ? "selected" : ""}>Más recientes</option>
        <option value="nombre" ${state.orden === "nombre" ? "selected" : ""}>Nombre (A-Z)</option>
      </select><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m6 9 6 6 6-6"/></svg></div>
      <button class="btn btn--sm btn--primary" id="cmpBtn" disabled>Comparar</button>
      <button class="btn btn--sm" id="invBtn"><svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m22 2-7 20-4-9-9-4z"/><path d="M22 2 11 13"/></svg>Invitar</button>
      <span class="tb-count" id="cnt"></span>
    </div>
    <div class="card"><div class="table-wrap"><table>
      <thead><tr><th class="col-chk"></th><th>#</th><th>Aspirante</th><th>Puesto</th><th>Fecha</th><th>Puntaje</th><th>Estado · señales</th></tr></thead>
      <tbody id="filas"></tbody></table></div></div>`;
  $("#q").addEventListener("input", e => { state.busqueda = e.target.value; pintarFilas(); });
  $("#fPuesto").addEventListener("change", e => { state.puesto = e.target.value; pintarFilas(); });
  $("#fOrden").addEventListener("change", e => { state.orden = e.target.value; pintarFilas(); });
  $("#cmpBtn").addEventListener("click", () => abrirComparador(state.comparar.slice()));
  $("#invBtn").addEventListener("click", abrirInvitaciones);
  wireTabs();
  renderDashboard();
  renderPipeline();
  pintarFilas();
}
function renderDashboard() {
  const cont = $("#dash"); if (!cont) return;
  const arr = state.aspirantes;
  const total = arr.length;
  const conR = arr.filter(a => a.resultado);
  const prom = conR.length ? Math.round(conR.reduce((s, a) => s + a.resultado.global, 0) / conR.length * 100) : 0;
  const conB = arr.filter(a => a.resultado && a.resultado.banderas && a.resultado.banderas.length).length;
  const aRev = arr.filter(a => { const cf = a.resultado || {}; return (cf.calidad && cf.calidad.bandera) || (cf.control && cf.control.bandera) || (cf.consistencia && cf.consistencia.bandera); }).length;
  const contr = arr.filter(a => estadoDe(a) === "contratado").length;
  const counts = {}; ORDEN_ESTADOS.forEach(k => counts[k] = 0); arr.forEach(a => counts[estadoDe(a)]++);
  const card = (num, lbl, cls) => `<div class="dash-card"><div class="dash-num ${cls || ""}">${num}</div><div class="dash-lbl">${lbl}</div></div>`;
  const seg = ORDEN_ESTADOS.filter(k => counts[k]).map(k => `<div class="dash-seg dash-seg--${ESTADOS[k].cls}" style="width:${(counts[k] / total * 100).toFixed(1)}%" title="${ESTADOS[k].t}: ${counts[k]}"></div>`).join("");
  cont.innerHTML = `
    <div class="dash-cards">
      ${card(total, "Aspirantes")}
      ${card(total ? prom + "%" : "—", "Promedio global", "dash-num--" + clsDePct(prom / 100))}
      ${card(conB, "Con banderas", conB ? "dash-num--bad" : "")}
      ${card(aRev, "A revisar", aRev ? "dash-num--warn" : "")}
      ${card(contr, "Contratados", contr ? "dash-num--ok" : "")}
    </div>
    ${total ? `<div class="dash-bar">${seg}</div>` : ""}`;
}
function renderPipeline() {
  const cont = $("#pipeline"); if (!cont) return;
  const counts = {}; ORDEN_ESTADOS.forEach(k => counts[k] = 0);
  state.aspirantes.forEach(a => { counts[estadoDe(a)]++; });
  const chips = [`<button class="pipe-chip ${state.estado === "Todos" ? "is-on" : ""}" data-e="Todos">Todos <span class="pipe-n">${state.aspirantes.length}</span></button>`]
    .concat(ORDEN_ESTADOS.map(k => `<button class="pipe-chip pipe-chip--${ESTADOS[k].cls} ${state.estado === k ? "is-on" : ""}" data-e="${k}">${ESTADOS[k].t} <span class="pipe-n">${counts[k]}</span></button>`));
  cont.innerHTML = chips.join("");
  $$("#pipeline .pipe-chip").forEach(c => c.addEventListener("click", () => { state.estado = c.dataset.e; renderPipeline(); pintarFilas(); }));
}
function actualizarCmpBtn() {
  const btn = $("#cmpBtn"); if (!btn) return;
  const n = state.comparar.length; btn.disabled = n < 2;
  btn.textContent = n >= 2 ? `Comparar (${n})` : "Comparar";
}
function toggleComparar(id, on) {
  const i = state.comparar.indexOf(id);
  if (on && i < 0) {
    if (state.comparar.length >= 3) { const chk = $(`#filas .cmp-chk[data-id="${id}"]`); if (chk) chk.checked = false; toast("Puedes comparar hasta 3 a la vez."); return; }
    state.comparar.push(id);
  } else if (!on && i >= 0) state.comparar.splice(i, 1);
  actualizarCmpBtn();
}
function listaFiltrada() {
  let arr = state.aspirantes.filter(a => (state.puesto === "Todos" || a.datos.puesto === state.puesto) && (state.estado === "Todos" || estadoDe(a) === state.estado) && a.datos.nombre.toLowerCase().includes(state.busqueda.toLowerCase()));
  if (state.orden === "score") arr.sort((a, b) => b.resultado.global - a.resultado.global);
  else if (state.orden === "fecha") arr.sort((a, b) => a.fecha < b.fecha ? 1 : -1);
  else arr.sort((a, b) => a.datos.nombre.localeCompare(b.datos.nombre));
  return arr;
}
function pintarFilas() {
  const arr = listaFiltrada();
  $("#cnt").textContent = `${arr.length} aspirante${arr.length === 1 ? "" : "s"}`;
  $("#filas").innerHTML = arr.length ? arr.map((a, i) => {
    const g = a.resultado.global; const cls = clsDePct(g); const est = estadoDe(a); const cf = a.resultado;
    const estBadge = `<span class="badge badge--${ESTADOS[est].cls}">${ESTADOS[est].t}</span>`;
    const flags = a.resultado.banderas.length ? `<span class="flag"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"/><path d="M4 22v-7"/></svg>${a.resultado.banderas.length}</span>` : "";
    const confAl = ((cf.calidad && cf.calidad.bandera) || (cf.control && cf.control.bandera) || (cf.consistencia && cf.consistencia.bandera)) ? `<span class="flag flag--conf" title="Revisar confiabilidad"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z"/><path d="M12 9v4M12 17h.01"/></svg></span>` : "";
    const checked = state.comparar.includes(a.id) ? "checked" : "";
    return `<tr data-id="${a.id}">
      <td class="col-chk"><input type="checkbox" class="cmp-chk" data-id="${a.id}" ${checked} aria-label="Comparar"></td>
      <td>${state.orden === "score" ? `<span class="rank">${i + 1}</span>` : ""}</td>
      <td><div class="cell-name">${a.datos.nombre}</div><div class="cell-sub">${a.datos.escolaridad || ""}</div></td>
      <td>${a.datos.puesto}</td>
      <td>${fechaLarga(a.fecha)}</td>
      <td><span class="score-chip"><span class="dot dot--${cls}"></span><span class="score-num">${pct100(g)}</span></span></td>
      <td><div class="cell-flags">${estBadge}${flags}${confAl}</div></td>
    </tr>`;
  }).join("") : `<tr><td colspan="7" class="muted-empty">No hay aspirantes con ese filtro.</td></tr>`;
  $$("#filas tr[data-id]").forEach(tr => tr.addEventListener("click", e => { if (e.target.closest(".col-chk")) return; abrirDetalle(tr.dataset.id); }));
  $$("#filas .cmp-chk").forEach(chk => chk.addEventListener("click", e => { e.stopPropagation(); toggleComparar(chk.dataset.id, chk.checked); }));
  actualizarCmpBtn();
}

/* ---------- Comparador de finalistas ---------- */
function svgBarrasAgrupadas(grupos, series, cols) {
  const nC = series.length;
  const barW = nC <= 1 ? 26 : nC === 2 ? 18 : 14, barGap = 4, groupPad = 28;
  const innerW = nC * barW + (nC - 1) * barGap, groupW = innerW + groupPad;
  const leftPad = 34, rightPad = 14, topPad = 14, plotH = 220, labelH = 86;
  const W = leftPad + grupos.length * groupW + rightPad, H = topPad + plotH + labelH;
  const yBase = topPad + plotH;
  let s = `<svg viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" role="img" class="cmp-svg">`;
  [0, 20, 40, 60, 80, 100].forEach(g => { const y = (yBase - (g / 100) * plotH).toFixed(1); s += `<line class="cmp-gridline" x1="${leftPad}" y1="${y}" x2="${W - rightPad}" y2="${y}"/><text class="cmp-ylabel" x="${leftPad - 6}" y="${(+y + 3).toFixed(1)}" text-anchor="end">${g}</text>`; });
  s += `<line class="cmp-axis" x1="${leftPad}" y1="${yBase}" x2="${W - rightPad}" y2="${yBase}"/>`;
  grupos.forEach((gr, i) => {
    const gx = leftPad + i * groupW + groupPad / 2, cx = (gx + innerW / 2).toFixed(1);
    gr.vals.forEach((v, j) => {
      if (v == null) return;
      const bx = (gx + j * (barW + barGap)).toFixed(1), bh = (v / 100) * plotH, by = (yBase - bh).toFixed(1);
      s += `<rect x="${bx}" y="${by}" width="${barW}" height="${bh.toFixed(1)}" rx="2" fill="${cols[j]}"><title>${series[j]} · ${gr.label}: ${v}%</title></rect>`;
      s += `<text class="cmp-vlabel" x="${(+bx + barW / 2).toFixed(1)}" y="${(+by - 3).toFixed(1)}" text-anchor="middle">${v}</text>`;
    });
    s += `<text class="cmp-glabel" x="${cx}" y="${yBase + 13}" text-anchor="end" transform="rotate(-32 ${cx} ${yBase + 13})">${gr.label}</text>`;
  });
  return s + `</svg>`;
}

function exportarComparadorPDF(sel) {
  const DIM_CORTO = { perfil: "Sobre ti", personalidad: "Personalidad", social: "Sociales", intelecto: "Intelecto", juicio: "Juicio", servicio: "Servicio", estres: "Estrés", psicosocial: "Psicosocial", honestidad: "Honestidad", logistica: "Disponib.", atencion: "Atención", puesto: "Puesto", entrevista: "Entrevista" };
  const corto = d => DIM_CORTO[d] || DIMENSIONES[d] || d;
  const COLS = ["#3B82F6", "#F59E0B", "#22C55E"];
  const dimKeys = Object.keys(DIMENSIONES).filter(d => d !== "atencion" && sel.some(a => a.resultado.porDim[d]));
  const gVals = sel.map(a => pct100(a.resultado.global));
  const ajVals = sel.map(a => a.resultado.puesto ? pct100(a.resultado.puesto.pct) : null);
  const series = sel.map(a => a.datos.nombre);
  const grupos = [{ label: "Global", vals: gVals }];
  if (ajVals.some(v => v != null)) grupos.push({ label: "Ajuste", vals: ajVals });
  dimKeys.forEach(d => grupos.push({ label: corto(d), vals: sel.map(a => a.resultado.porDim[d] ? pct100(a.resultado.porDim[d].pct) : null) }));
  const svg = svgBarrasAgrupadas(grupos, series, COLS);
  const legend = series.map((n, i) => `<span class="prc-leg"><i style="background:${COLS[i]}"></i>${n}</span>`).join("");

  const banVals = sel.map(a => a.resultado.banderas.length);
  const confVals = sel.map(a => { const cf = a.resultado; return ((cf.calidad && cf.calidad.bandera) || (cf.control && cf.control.bandera) || (cf.consistencia && cf.consistencia.bandera)) ? "Revisar" : "OK"; });
  const reacVals = sel.map(a => (a.atencion && a.atencion.avgMs) || null);
  const estVals = sel.map(a => ESTADOS[estadoDe(a)].t);
  const rowTxt = (label, vals, fmt) => `<tr><th>${label}</th>${vals.map(v => `<td>${fmt ? fmt(v) : (v == null ? "—" : v)}</td>`).join("")}</tr>`;
  const pctF = v => v == null ? "—" : v + "%";
  const filas = [
    rowTxt("Puntaje global", gVals, v => v),
    ajVals.some(v => v != null) ? rowTxt("Ajuste al puesto", ajVals, pctF) : "",
    ...dimKeys.map(d => rowTxt(DIMENSIONES[d], sel.map(a => a.resultado.porDim[d] ? pct100(a.resultado.porDim[d].pct) : null), pctF)),
    rowTxt("Banderas críticas", banVals, v => v),
    rowTxt("Confiabilidad", confVals),
    rowTxt("Reacción", reacVals, v => v == null ? "—" : v + " ms"),
    rowTxt("Estado", estVals),
  ].join("");
  const resp = CONFIG.avisoResponsable || CONFIG.empresa;
  const hoy = fechaLarga(new Date().toISOString());

  const prev = document.getElementById("printRoot"); if (prev) prev.remove();
  const root = document.createElement("div"); root.id = "printRoot";
  root.innerHTML = `
    <div class="pr-head"><div><div class="pr-head__t">${resp}</div><div class="pr-head__sub">Comparativo de finalistas</div></div><div class="pr-head__date">Generado: ${hoy}</div></div>
    <div class="pr-name">${series.length} finalistas comparados</div>
    <div class="pr-role">${sel.map(a => `${a.datos.nombre} (${a.datos.puesto})`).join(" · ")}</div>
    <div class="pr-sec">Comparativo por dimensión</div>
    <div class="prc-legend">${legend}</div>
    <div class="prc-chart">${svg}</div>
    <div class="pr-sec">Detalle</div>
    <table class="prc-table"><thead><tr><th></th>${series.map(n => `<th>${n}</th>`).join("")}</tr></thead><tbody>${filas}</tbody></table>
    <div class="pr-foot">Evalua RH · ${resp} · Documento confidencial para uso interno de Recursos Humanos.</div>`;
  document.body.appendChild(root);
  const limpiar = () => { const r = document.getElementById("printRoot"); if (r) r.remove(); window.removeEventListener("afterprint", limpiar); };
  window.addEventListener("afterprint", limpiar);
  setTimeout(() => { try { window.print(); } catch (e) {} }, 60);
  setTimeout(limpiar, 60000);
}

function abrirComparador(ids) {
  const sel = ids.map(id => state.aspirantes.find(a => a.id === id)).filter(Boolean);
  if (sel.length < 2) return;
  const idxMax = arr => { const nums = arr.filter(v => typeof v === "number" && v >= 0); if (nums.length < 2) return -1; const mx = Math.max(...nums); return arr.filter(v => v === mx).length > 1 ? -1 : arr.indexOf(mx); };
  const idxMin = arr => { if (arr.length < 2) return -1; const mn = Math.min(...arr); return arr.filter(v => v === mn).length > 1 ? -1 : arr.indexOf(mn); };
  const fila = (label, valores, fmt, mejorIdx) => `<tr><th>${label}</th>${valores.map((v, i) => `<td class="${mejorIdx === i ? "cmp-best" : ""}">${fmt ? fmt(v) : (v == null ? "—" : v)}</td>`).join("")}</tr>`;

  const DIM_CORTO = { perfil: "Sobre ti", personalidad: "Personalidad", social: "Sociales", intelecto: "Intelecto", juicio: "Juicio", servicio: "Servicio", estres: "Estrés", psicosocial: "Psicosocial", honestidad: "Honestidad", logistica: "Disponib.", atencion: "Atención", puesto: "Puesto", entrevista: "Entrevista" };
  const corto = d => DIM_CORTO[d] || DIMENSIONES[d] || d;
  const COLS = ["#3B82F6", "#F59E0B", "#22C55E"];

  const dimKeys = Object.keys(DIMENSIONES).filter(d => d !== "atencion" && sel.some(a => a.resultado.porDim[d]));
  const gVals = sel.map(a => pct100(a.resultado.global));
  const ajVals = sel.map(a => a.resultado.puesto ? pct100(a.resultado.puesto.pct) : null);
  const banVals = sel.map(a => a.resultado.banderas.length);
  const confVals = sel.map(a => { const cf = a.resultado; return ((cf.calidad && cf.calidad.bandera) || (cf.control && cf.control.bandera) || (cf.consistencia && cf.consistencia.bandera)) ? "Revisar" : "OK"; });
  const reacVals = sel.map(a => (a.atencion && a.atencion.avgMs) || null);
  const estVals = sel.map(a => `<span class="badge badge--${ESTADOS[estadoDe(a)].cls}">${ESTADOS[estadoDe(a)].t}</span>`);
  const series = sel.map(a => a.datos.nombre);

  const grupos = [{ label: "Global", vals: gVals }];
  if (ajVals.some(v => v != null)) grupos.push({ label: "Ajuste", vals: ajVals });
  dimKeys.forEach(d => grupos.push({ label: corto(d), vals: sel.map(a => a.resultado.porDim[d] ? pct100(a.resultado.porDim[d].pct) : null) }));
  const legend = `<div class="cmp-legend">${series.map((n, i) => `<span class="cmp-leg"><i style="background:${COLS[i]}"></i>${n}</span>`).join("")}</div>`;

  const ov = document.createElement("div"); ov.className = "modal-overlay";
  ov.innerHTML = `<div class="modal modal--cmp" role="dialog" aria-modal="true">
    <div class="resumen-head"><h3>Comparar finalistas</h3><div class="cmp-actions"><button class="btn btn--sm btn--ghost" id="cmpPDF"><svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 9V2h12v7"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="8" rx="1"/></svg>Exportar PDF</button><button class="icon-btn" id="cmpClose" aria-label="Cerrar"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18M6 6l12 12"/></svg></button></div></div>
    ${legend}
    <div class="cmp-chart">${svgBarrasAgrupadas(grupos, series, COLS)}</div>
    <div class="cmp-wrap"><table class="cmp-table">
      <thead><tr><th></th>${sel.map(a => `<th><div class="cmp-name">${a.datos.nombre}</div><div class="cmp-role">${a.datos.puesto}</div></th>`).join("")}</tr></thead>
      <tbody>
        ${fila("Banderas críticas", banVals, v => `${v}`, idxMin(banVals))}
        ${fila("Confiabilidad", confVals, null, -1)}
        ${fila("Reacción", reacVals, v => v == null ? "—" : `${v} ms`, -1)}
        ${fila("Estado", estVals, null, -1)}
      </tbody>
    </table></div>
    <div class="cmp-foot">Cada barra es un finalista; la más alta de cada grupo es la mejor. Comparas ${sel.length} de un máximo de 3.</div>
  </div>`;
  document.body.appendChild(ov); requestAnimationFrame(() => ov.classList.add("is-on"));
  const close = () => { ov.classList.remove("is-on"); setTimeout(() => ov.remove(), 220); };
  $("#cmpClose", ov).addEventListener("click", close);
  $("#cmpPDF", ov).addEventListener("click", () => exportarComparadorPDF(sel));
  ov.addEventListener("click", e => { if (e.target === ov) close(); });
}

/* ---------- Invitaciones (enlace único por aspirante) ---------- */
function linkBase() { return location.href.replace(/[#?].*$/, "").replace(/panel\.html$/, "index.html"); }
function abrirInvitaciones() {
  window.Store.leerConfig().then(function (cfg) {
    var puestos = (cfg && Array.isArray(cfg.puestos) && cfg.puestos.length) ? cfg.puestos : PUESTOS;
    _abrirInvitacionesUI(puestos);
  });
}
function _abrirInvitacionesUI(puestos) {
  const ov = document.createElement("div"); ov.className = "modal-overlay";
  ov.innerHTML = `<div class="modal modal--inv" role="dialog" aria-modal="true">
    <div class="resumen-head"><h3>Invitar a un aspirante</h3><button class="icon-btn" id="invClose" aria-label="Cerrar"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18M6 6l12 12"/></svg></button></div>
    <p class="inv-intro">Genera un enlace único para que conteste desde su casa. Cada enlace es de un solo uso.</p>
    <div class="inv-form">
      <div class="field"><label class="field__label">Nombre (opcional)</label><input class="input" id="invNombre" placeholder="Nombre del aspirante"></div>
      <div class="field"><label class="field__label">Puesto (opcional)</label><div class="sel"><select id="invPuesto"><option value="">Sin especificar</option>${puestos.map(p => `<option>${p}</option>`).join("")}</select><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m6 9 6 6 6-6"/></svg></div></div>
      <button class="btn btn--primary" id="invGen">Generar enlace</button>
    </div>
    <div class="inv-result" id="invResult" hidden>
      <label class="field__label">Enlace generado</label>
      <div class="inv-link"><input class="input" id="invLink" readonly><button class="btn btn--sm btn--primary" id="invCopy">Copiar</button></div>
    </div>
    <div class="inv-listwrap"><div class="sec-title">Invitaciones</div><div id="invList" class="inv-list"><p class="inv-empty">Cargando…</p></div></div>
  </div>`;
  document.body.appendChild(ov); requestAnimationFrame(() => ov.classList.add("is-on"));
  const close = () => { ov.classList.remove("is-on"); setTimeout(() => ov.remove(), 220); };
  $("#invClose", ov).addEventListener("click", close);
  ov.addEventListener("click", e => { if (e.target === ov) close(); });

  const copiar = (txt) => {
    const done = () => toast("Enlace copiado.");
    if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(txt).then(done).catch(done);
    else { try { const ta = document.createElement("textarea"); ta.value = txt; document.body.appendChild(ta); ta.select(); document.execCommand("copy"); ta.remove(); done(); } catch (e) {} }
  };
  const pintarLista = () => {
    window.Store.leerInvitaciones().then(function (arr) {
      const cont = $("#invList", ov);
      if (!arr.length) { cont.innerHTML = `<p class="inv-empty">Aún no hay invitaciones.</p>`; return; }
      cont.innerHTML = arr.map(function (iv) {
        const usada = iv.estado === "completada"; const link = linkBase() + "?inv=" + iv.token;
        return `<div class="inv-row">
          <div class="inv-row__main"><div class="inv-row__name">${iv.nombre || "Sin nombre"}</div><div class="inv-row__sub">${iv.puesto || "Sin puesto"} · ${fechaLarga(iv.fecha)}</div></div>
          <span class="badge badge--${usada ? "ok" : "info"}">${usada ? "Completada" : "Pendiente"}</span>
          <button class="btn btn--sm inv-rowcopy" data-link="${link}" ${usada ? "disabled" : ""}>Copiar</button>
        </div>`;
      }).join("");
      $$(".inv-rowcopy", ov).forEach(b => b.addEventListener("click", () => copiar(b.dataset.link)));
    }).catch(function () { $("#invList", ov).innerHTML = `<p class="inv-empty">No se pudo cargar.</p>`; });
  };
  $("#invGen", ov).addEventListener("click", () => {
    const token = "inv_" + Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
    const inv = { token: token, nombre: $("#invNombre", ov).value.trim(), puesto: $("#invPuesto", ov).value, estado: "pendiente", fecha: new Date().toISOString() };
    window.Store.crearInvitacion(inv).then(function () {
      $("#invLink", ov).value = linkBase() + "?inv=" + token; $("#invResult", ov).hidden = false;
      $("#invNombre", ov).value = ""; $("#invPuesto", ov).value = "";
      pintarLista();
    }).catch(function () { toast("No se pudo generar."); });
  });
  $("#invCopy", ov).addEventListener("click", () => copiar($("#invLink", ov).value));
  pintarLista();
}

/* ---------- Detalle ---------- */
const GUIA_DIM = {
  honestidad: { pregunta: "Cuéntame de una vez que viste a un compañero hacer algo incorrecto en el trabajo. ¿Qué hiciste?" },
  juicio: { pregunta: "Descríbeme una decisión difícil que tomaste sin poder consultar a nadie. ¿Cómo la resolviste?" },
  servicio: { pregunta: "Háblame de un cliente molesto que hayas atendido. ¿Qué hiciste para resolverlo?" },
  estres: { pregunta: "Cuéntame de un día de mucha carga o presión. ¿Cómo lo manejaste?" },
  social: { pregunta: "Dame un ejemplo de un conflicto con un compañero y cómo lo resolviste." },
  personalidad: { pregunta: "¿Qué tipo de situaciones te sacan de balance en el trabajo y cómo las manejas?" },
  intelecto: { pregunta: "Si te doy un problema sin solución obvia, ¿cómo lo abordarías paso a paso?" },
  psicosocial: { pregunta: "¿Cómo describes el equilibrio entre tu vida personal y el trabajo?" },
  logistica: { pregunta: "¿Qué tan flexible es tu disponibilidad de horarios y traslados?" },
  atencion: { pregunta: "Cuéntame de un error por un detalle pequeño que se te haya pasado. ¿Qué cambiaste después?" },
  perfil: { pregunta: "¿Por qué te interesa este puesto y qué esperas de él?" },
};
const PREG_PUESTO = {
  "Atención a cliente": "Un cliente exige algo que va contra la política. ¿Cómo lo manejas sin perderlo?",
  "Cajero(a)": "Si tu caja no cuadra al cierre del turno, ¿qué pasos sigues?",
  "Ventas": "¿Cómo conviertes a un cliente que dice 'solo estoy viendo'?",
  "Almacén": "¿Cómo te aseguras de que el inventario físico coincida con el sistema?",
  "Administrativo": "Si tu jefe y otra área te piden algo urgente al mismo tiempo, ¿cómo priorizas?",
  "Cocina / Producción": "¿Cómo mantienes higiene y velocidad cuando hay mucha demanda?",
};

function generarResumen(a) {
  const r = a.resultado, g = r.global, nombre = a.datos.nombre, puesto = a.datos.puesto;
  const dims = Object.keys(DIMENSIONES).filter(d => d !== "puesto" && r.porDim[d]).map(d => ({ d, pct: r.porDim[d].pct }));
  const desc = dims.slice().sort((x, y) => y.pct - x.pct);
  const fuertes = desc.filter(x => x.pct >= UMBRALES.fortaleza).slice(0, 2);
  const debiles = desc.filter(x => x.pct < UMBRALES.promedio).sort((x, y) => x.pct - y.pct);
  const nom = d => (DIMENSIONES[d] || d).toLowerCase();

  const S = [];
  S.push(`${nombre} obtuvo un puntaje global de ${pct100(g)}/100 (${nivelDimObj(g).label}) para el puesto de ${puesto}.`);
  if (r.puesto) S.push(`Su ajuste específico al puesto es de ${pct100(r.puesto.pct)}% (${r.puesto.nivel}).`);
  if (fuertes.length) S.push(`Destaca en ${fuertes.map(f => nom(f.d)).join(" y ")}.`);
  if (debiles.length) S.push(`Principales áreas de oportunidad: ${debiles.slice(0, 3).map(f => nom(f.d)).join(", ")}.`);
  if (r.banderas && r.banderas.length) S.push(`Atención: señales bajas en ${r.banderas.map(d => nom(d)).join(" y ")}; conviene profundizar en la entrevista antes de decidir.`);
  const alertasConf = [];
  if (r.calidad && r.calidad.bandera) alertasConf.push("respuestas apresuradas");
  if (r.control && r.control.bandera) alertasConf.push("falló el control de atención");
  if (r.consistencia && r.consistencia.bandera) alertasConf.push("respuestas inconsistentes");
  if (alertasConf.length) S.push(`Confiabilidad: el patrón de respuesta muestra ${alertasConf.join(", ")}; conviene tomar el puntaje con cautela.`);
  const estR = estadoDe(a);
  if (estR === "contratado") S.push("RH marcó este perfil como contratado.");
  else if (estR === "descartado") S.push("RH descartó este perfil.");
  else if (estR === "entrevista") S.push("Este perfil está en etapa de entrevista.");
  else if (estR === "evaluado") S.push("Este perfil ya fue evaluado y está pendiente de avanzar.");
  else S.push("Se recomienda validar en entrevista las áreas señaladas antes de avanzarlo en el proceso.");

  const preguntas = [], usados = {};
  const add = q => { if (q && !usados[q]) { usados[q] = 1; preguntas.push(q); } };
  (r.banderas || []).forEach(d => { if (GUIA_DIM[d]) add(GUIA_DIM[d].pregunta); });
  debiles.forEach(f => { if (GUIA_DIM[f.d]) add(GUIA_DIM[f.d].pregunta); });
  if (PREG_PUESTO[puesto]) add(PREG_PUESTO[puesto]);
  add(GUIA_DIM.perfil.pregunta);
  if (preguntas.length < 4) desc.slice().reverse().forEach(f => { if (preguntas.length < 4 && GUIA_DIM[f.d]) add(GUIA_DIM[f.d].pregunta); });

  return { resumen: S.join(" "), preguntas: preguntas.slice(0, 6), fuente: "reglas" };
}

function pedirResumenIA(a) {
  const r = a.resultado;
  const payload = {
    nombre: a.datos.nombre, puesto: a.datos.puesto,
    global: pct100(r.global), nivel: nivelDimObj(r.global).label,
    ajustePuesto: r.puesto ? pct100(r.puesto.pct) : null,
    dimensiones: Object.keys(DIMENSIONES).filter(d => d !== "puesto" && r.porDim[d]).map(d => ({ nombre: DIMENSIONES[d], pct: pct100(r.porDim[d].pct), nivel: r.porDim[d].nivel })),
    banderas: (r.banderas || []).map(d => DIMENSIONES[d]),
    estado: ESTADOS[estadoDe(a)].t,
  };
  return fetch(window.AI_ENDPOINT, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) })
    .then(res => { if (!res.ok) throw new Error("endpoint"); return res.json(); })
    .then(d => ({ resumen: d.resumen || "", preguntas: Array.isArray(d.preguntas) ? d.preguntas : [], fuente: "ia" }));
}

function abrirResumenIA(a) {
  const ov = document.createElement("div"); ov.className = "modal-overlay";
  ov.innerHTML = `<div class="modal modal--resumen" role="dialog" aria-modal="true">
    <div class="resumen-head"><h3>Resumen ejecutivo</h3><button class="icon-btn" id="rsClose" aria-label="Cerrar"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18M6 6l12 12"/></svg></button></div>
    <div class="resumen-body" id="rsBody"><div class="resumen-load">Generando…</div></div>
    <div class="resumen-foot"><span class="resumen-src" id="rsSrc"></span><div class="resumen-actions"><button class="btn btn--sm btn--ghost" id="rsCopy">Copiar</button><button class="btn btn--sm btn--primary" id="rsOk">Cerrar</button></div></div>
  </div>`;
  document.body.appendChild(ov); requestAnimationFrame(() => ov.classList.add("is-on"));
  const close = () => { ov.classList.remove("is-on"); setTimeout(() => ov.remove(), 220); };
  $("#rsClose", ov).addEventListener("click", close);
  $("#rsOk", ov).addEventListener("click", close);
  ov.addEventListener("click", e => { if (e.target === ov) close(); });

  const pintar = (data) => {
    const qs = data.preguntas.map(q => `<li>${q}</li>`).join("");
    $("#rsBody", ov).innerHTML = `
      <p class="resumen-text">${data.resumen}</p>
      <div class="resumen-sub">Preguntas sugeridas para la entrevista</div>
      <ol class="resumen-qs">${qs}</ol>`;
    $("#rsSrc", ov).textContent = data.fuente === "ia" ? "Generado con IA" : "Generado a partir de los puntajes";
    $("#rsCopy", ov).addEventListener("click", () => {
      const txt = `${a.datos.nombre} — ${a.datos.puesto}\n\n${data.resumen}\n\nPreguntas de entrevista:\n${data.preguntas.map((q, i) => `${i + 1}. ${q}`).join("\n")}`;
      const done = () => toast("Resumen copiado.");
      if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(txt).then(done).catch(done);
      else { try { const ta = document.createElement("textarea"); ta.value = txt; document.body.appendChild(ta); ta.select(); document.execCommand("copy"); ta.remove(); done(); } catch (e) {} }
    });
  };
  const fallback = () => pintar(generarResumen(a));
  if (window.AI_ENDPOINT) pedirResumenIA(a).then(pintar).catch(fallback);
  else fallback();
}

function exportarReportePDF(a) {
  const g = a.resultado.global, gcls = clsDePct(g);
  const dimOrden = Object.keys(DIMENSIONES).filter(d => a.resultado.porDim[d]);
  const dimsHTML = dimOrden.map(d => {
    const o = a.resultado.porDim[d]; const cls = clsDePct(o.pct);
    return `<div class="pr-dim"><div class="pr-dim__top"><span>${DIMENSIONES[d]}</span><span class="pr-badge pr-badge--${cls}">${o.nivel} · ${pct100(o.pct)}%</span></div><div class="pr-bar"><div class="pr-bar__fill pr-bar__fill--${cls}" style="width:${pct100(o.pct)}%"></div></div></div>`;
  }).join("");
  const banderasHTML = a.resultado.banderas.length
    ? a.resultado.banderas.map(d => `<span class="pr-flag">${DIMENSIONES[d]} baja</span>`).join("")
    : `<span class="pr-okflag">Sin banderas críticas</span>`;
  const ajuste = a.resultado.puesto
    ? `<div class="pr-score__box"><div class="pr-score__lbl">Ajuste al puesto</div><div class="pr-score__val pr-${clsDePct(a.resultado.puesto.pct)}">${pct100(a.resultado.puesto.pct)}<span>%</span></div><div class="pr-score__nv">${a.resultado.puesto.nivel}</div></div>`
    : "";
  const estPdf = estadoDe(a);
  const prCls = { nuevo: "none", evaluado: "none", entrevista: "warn", contratado: "ok", descartado: "bad" }[estPdf] || "none";
  const dec = `<span class="pr-dec pr-dec--${prCls}">${ESTADOS[estPdf].t}</span>`;
  const at = a.atencion || {};
  const cf = a.resultado;
  const confLineas = [];
  if (cf.calidad) confLineas.push(`<div class="pr-row"><span>Ritmo de respuesta</span><span>${cf.calidad.bandera ? "Apresurado" : "Normal"} (${cf.calidad.rapidas}/${cf.calidad.total} rápidas)</span></div>`);
  if (cf.control) confLineas.push(`<div class="pr-row"><span>Control de atención</span><span>${cf.control.fallidas === 0 ? "Aprobado" : cf.control.fallidas + " fallida(s)"}</span></div>`);
  if (cf.consistencia) confLineas.push(`<div class="pr-row"><span>Consistencia</span><span>${pct100(cf.consistencia.pct)}% (${cf.consistencia.consistentes}/${cf.consistencia.pares})</span></div>`);
  const confPR = confLineas.length ? `<div class="pr-sec">Confianza en la respuesta</div><div class="pr-rows">${confLineas.join("")}</div>` : "";
  const resp = CONFIG.avisoResponsable || CONFIG.empresa;
  const contacto = [a.datos.tel, a.datos.correo, a.datos.curp].filter(Boolean).join("&nbsp;&nbsp;·&nbsp;&nbsp;");
  const consent = a.consentimiento && a.consentimiento.aceptado
    ? `Aceptó el aviso de privacidad el ${fechaLarga((a.consentimiento.fecha || "").slice(0, 10))}`
    : "No registrado";
  const hoy = fechaLarga(new Date().toISOString());

  const prev = document.getElementById("printRoot"); if (prev) prev.remove();
  const root = document.createElement("div"); root.id = "printRoot";
  root.innerHTML = `
    <div class="pr-head">
      <div><div class="pr-head__t">${resp}</div><div class="pr-head__sub">Reporte de evaluación de ingreso</div></div>
      <div class="pr-head__date">Generado: ${hoy}</div>
    </div>
    <div class="pr-name">${a.datos.nombre}</div>
    <div class="pr-role">${a.datos.puesto} · evaluado el ${fechaLarga(a.fecha)}</div>
    ${contacto ? `<div class="pr-contact">${contacto}</div>` : ""}

    <div class="pr-sec">Resultado</div>
    <div class="pr-score">
      <div class="pr-score__box"><div class="pr-score__lbl">Puntaje global</div><div class="pr-score__val pr-${gcls}">${pct100(g)}</div><div class="pr-score__nv">${nivelDimObj(g).label}</div></div>
      ${ajuste}
    </div>
    <div class="pr-flags">${banderasHTML}</div>

    <div class="pr-sec">Calificación por dimensión</div>
    ${dimsHTML}
    <div class="pr-rows">
      <div class="pr-row"><span>Aciertos de intelecto</span><span>${a.resultado.aciertosIntelecto} de 3</span></div>
      <div class="pr-row"><span>Reacción promedio</span><span>${at.avgMs || "—"} ms</span></div>
    </div>

    <div class="pr-sec">Estado en el proceso</div>
    <div class="pr-decline">${dec}</div>
    ${a.notas ? `<div class="pr-notas"><b>Notas:</b> ${a.notas}</div>` : ""}

    ${confPR}
    <div class="pr-sec">Privacidad</div>
    <div class="pr-rows"><div class="pr-row"><span>Consentimiento (LFPDPPP)</span><span>${consent}</span></div></div>

    <div class="pr-foot">Evalua RH · ${resp} · Documento confidencial para uso interno de Recursos Humanos.</div>`;
  document.body.appendChild(root);

  const limpiar = () => { const r = document.getElementById("printRoot"); if (r) r.remove(); window.removeEventListener("afterprint", limpiar); };
  window.addEventListener("afterprint", limpiar);
  setTimeout(() => { try { window.print(); } catch (e) {} }, 60);
  setTimeout(limpiar, 60000);
}

function abrirDetalle(id) { const a = state.aspirantes.find(x => x.id === id); if (a) abrirDetalleObj(a); }
function abrirDetalleObj(a, opts) {
  opts = opts || {};
  const g = a.resultado.global, gcls = clsDePct(g);
  const dimOrden = Object.keys(DIMENSIONES).filter(d => a.resultado.porDim[d]);
  const dims = dimOrden.map(d => {
    const o = a.resultado.porDim[d]; const cls = clsDePct(o.pct);
    return `<div class="dimrow"><div class="dimrow__top"><span class="dimrow__name">${DIMENSIONES[d]}</span><span class="badge badge--${cls}">${o.nivel}</span></div>
      <div class="dimbar"><div class="dimfill dimfill--${cls}" style="width:${pct100(o.pct)}%"></div></div></div>`;
  }).join("");
  const contacto = [
    ["Teléfono", a.datos.tel ? `<a href="tel:${a.datos.tel.replace(/\s/g, "")}">${a.datos.tel}</a>` : ""],
    ["Correo", a.datos.correo ? `<a href="mailto:${a.datos.correo}">${a.datos.correo}</a>` : ""],
    ["CURP", a.datos.curp], ["Nacimiento", a.datos.nacimiento ? fechaLarga(a.datos.nacimiento) : ""],
    ["Género", a.datos.genero], ["Escolaridad", a.datos.escolaridad], ["Puesto", a.datos.puesto],
    ["Consentimiento", a.consentimiento && a.consentimiento.aceptado ? `Aceptó el aviso de privacidad · ${fechaLarga((a.consentimiento.fecha || "").slice(0, 10))}` : ""],
  ].filter(r => r[1]).map(r => `<div class="d-row"><span class="d-row__k">${r[0]}</span><span class="d-row__v">${r[1]}</span></div>`).join("");

  const bloquePuesto = ((PREGUNTAS_PUESTO && PREGUNTAS_PUESTO[a.datos.puesto]) || []).map(q => {
    const r = a.respuestas[q.id]; if (!r) return "";
    const opt = q.opciones[r.optIdx]; const txt = opt ? opt.t : "—";
    const marca = q.opciones.some(o => o.correcta) ? (r.correcta ? `<span class="ok">✓</span>` : `<span class="bad">✕</span>`) : "";
    return `<div class="ans-item"><div class="ans-q">${q.texto}</div><div class="ans-a">${marca}${txt}</div>${r.porque ? `<div class="ans-why"><span>Porqué:</span> ${r.porque}</div>` : ""}</div>`;
  }).join("");
  const botones = PREGUNTAS.filter(q => q.tipo !== "abierta").map(q => {
    const r = a.respuestas[q.id]; if (!r) return "";
    const opt = q.opciones[r.optIdx]; const txt = opt ? opt.t : "—";
    const marca = q.dim === "intelecto" ? (r.correcta ? `<span class="ok">✓</span>` : `<span class="bad">✕</span>`) : "";
    return `<div class="ans-item">
      <div class="ans-q">${q.tag || DIMENSIONES[q.dim]} · ${q.texto}</div>
      <div class="ans-a">${marca}${txt}</div>
      ${r.otro && r.otroTexto ? `<div class="ans-otro">Otro: ${r.otroTexto}</div>` : ""}
      ${r.porque ? `<div class="ans-why"><span>Porqué:</span> ${r.porque}</div>` : ""}
    </div>`;
  }).join("");

  const abiertas = PREGUNTAS.filter(q => q.tipo === "abierta").map(q => {
    const r = a.respuestas[q.id];
    return `<div class="open-item">
      <div class="open-q">${q.tag} · ${q.texto}</div>
      <div class="open-a">${r && r.texto ? r.texto : "—"}</div>
      ${q.fijarte ? `<div class="fijarte"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg><div><b>En qué fijarte:</b> ${q.fijarte}</div></div>` : ""}
    </div>`;
  }).join("");

  const at = a.atencion || {}; const atCls = clsDePct((at.score || 0) / 3);
  const cf = a.resultado;
  const confRows = [];
  if (cf.calidad) confRows.push(`<div class="dimrow"><div class="dimrow__top"><span class="dimrow__name">Ritmo de respuesta</span><span class="badge badge--${cf.calidad.bandera ? "bad" : "ok"}">${cf.calidad.bandera ? "Apresurado" : "Normal"}</span></div><div class="conf-sub">${cf.calidad.rapidas} de ${cf.calidad.total} respuestas muy rápidas · mediana ${cf.calidad.medianaMs} ms</div></div>`);
  if (cf.control) confRows.push(`<div class="dimrow"><div class="dimrow__top"><span class="dimrow__name">Control de atención</span><span class="badge badge--${cf.control.bandera ? "bad" : "ok"}">${cf.control.fallidas === 0 ? "Aprobado" : cf.control.fallidas + " fallida(s)"}</span></div><div class="conf-sub">${cf.control.total - cf.control.fallidas} de ${cf.control.total} preguntas de control correctas</div></div>`);
  if (cf.consistencia) confRows.push(`<div class="dimrow"><div class="dimrow__top"><span class="dimrow__name">Consistencia</span><span class="badge badge--${cf.consistencia.bandera ? "bad" : "ok"}">${pct100(cf.consistencia.pct)}%</span></div><div class="conf-sub">${cf.consistencia.consistentes} de ${cf.consistencia.pares} pares de preguntas espejo coinciden</div></div>`);
  const confSection = confRows.length ? `<div class="sec-title">Confianza en la respuesta</div>${confRows.join("")}` : "";
  const confAlerta = (cf.calidad && cf.calidad.bandera) || (cf.control && cf.control.bandera) || (cf.consistencia && cf.consistencia.bandera);
  const confChip = confAlerta ? `<span class="flag flag--conf"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z"/><path d="M12 9v4M12 17h.01"/></svg>Revisar confiabilidad</span>` : "";

  $("#drawer").innerHTML = `
    <div class="drawer__head">
      <div><div class="drawer__name">${a.datos.nombre}</div><div class="drawer__role">${a.datos.puesto} · ${fechaLarga(a.fecha)}</div></div>
      <div class="drawer__actions">
        <button class="btn btn--sm btn--ghost" id="drResumen"><svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 18h6"/><path d="M10 22h4"/><path d="M12 2a7 7 0 0 0-4 12.7c.5.4.8 1 .9 1.6h6.2c.1-.6.4-1.2.9-1.6A7 7 0 0 0 12 2z"/></svg>Resumen IA</button>
        <button class="btn btn--sm btn--ghost" id="drPDF"><svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 9V2h12v7"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="8" rx="1"/></svg>Exportar PDF</button>
        <button class="icon-btn" id="drClose" aria-label="Cerrar"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18M6 6l12 12"/></svg></button>
      </div>
    </div>
    <div class="drawer__body">
      <div class="score-hero">
        <div class="score-big score-big--${gcls}">${pct100(g)}</div>
        <div class="score-hero__meta">
          <div class="score-hero__lbl">Puntaje global</div>
          <div class="score-hero__nivel">${nivelDimObj(g).label}</div>
          <div class="flags-row">${a.resultado.banderas.length ? a.resultado.banderas.map(d => `<span class="flag"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"/></svg>${DIMENSIONES[d]} baja</span>`).join("") : `<span class="badge badge--ok">Sin banderas</span>`}${confChip}</div>
        </div>
      </div>

      <div class="sec-title">Contacto y perfil</div>
      ${contacto}

      <div class="sec-title">Calificación por dimensión</div>
      ${dims}
      <div class="d-row"><span class="d-row__k">Aciertos de intelecto</span><span class="d-row__v">${a.resultado.aciertosIntelecto} de 3</span></div>
      <div class="d-row"><span class="d-row__k">Reacción promedio</span><span class="d-row__v"><span class="dot dot--${atCls}"></span> ${at.avgMs || "—"} ms</span></div>
      ${confSection}

      <div class="sec-title">Entrevista (evalúa tú)</div>
      ${abiertas}

      <div class="sec-title">Respuestas y porqués</div>
      ${botones}

      ${bloquePuesto ? `<div class="sec-title">Preguntas del puesto · ${a.datos.puesto}</div>${a.resultado.puesto ? `<div class="dimrow"><div class="dimrow__top"><span class="dimrow__name">Ajuste al puesto</span><span class="badge badge--${clsDePct(a.resultado.puesto.pct)}">${a.resultado.puesto.nivel} · ${pct100(a.resultado.puesto.pct)}%</span></div><div class="dimbar"><div class="dimfill dimfill--${clsDePct(a.resultado.puesto.pct)}" style="width:${pct100(a.resultado.puesto.pct)}%"></div></div></div>` : ""}${bloquePuesto}` : ""}

      ${opts.sinEstado ? "" : `<div class="sec-title">Estado en el proceso</div>
      <div class="dec-grid dec-grid--estados">
        ${ORDEN_ESTADOS.map(k => `<button class="dec-btn dec-btn--${ESTADOS[k].cls} ${estadoDe(a) === k ? "is-on" : ""}" data-d="${k}">${ESTADOS[k].t}</button>`).join("")}
      </div>
      <div class="field" style="margin-top:12px"><label class="field__label">Notas de RH</label><textarea class="input" id="drNotas" rows="3" placeholder="Observaciones…">${a.notas || ""}</textarea></div>`}
    </div>`;

  $("#drawerOverlay").classList.add("is-on");
  $("#drawer").classList.add("is-on");
  const cerrar = () => { $("#drawerOverlay").classList.remove("is-on"); $("#drawer").classList.remove("is-on"); };
  $("#drClose").addEventListener("click", cerrar);
  $("#drResumen").addEventListener("click", () => abrirResumenIA(a));
  $("#drPDF").addEventListener("click", () => exportarReportePDF(a));
  $("#drawerOverlay").addEventListener("click", cerrar);
  if (!opts.sinEstado) {
    $$("#drawer .dec-btn").forEach(b => b.addEventListener("click", () => {
      const k = b.dataset.d; a.estado = k;
      $$("#drawer .dec-btn").forEach(x => x.classList.toggle("is-on", x.dataset.d === k));
      guardarEval(a.id, a.estado, a.notas); pintarFilas(); if (typeof renderPipeline === "function") renderPipeline(); if (typeof renderDashboard === "function") renderDashboard();
    }));
    $("#drNotas").addEventListener("input", e => { a.notas = e.target.value; guardarEval(a.id, estadoDe(a), a.notas); });
  }
}

/* ---------- Configuración (texto del popup) ---------- */
function puestosActuales() {
  try { const p = JSON.parse(localStorage.getItem("examenrh_puestos") || "null"); if (Array.isArray(p) && p.length) return p; } catch (e) {}
  return PUESTOS;
}

function abrirConfig() {
  window.Store.leerConfig().then(function (cfg) {
    var c = {
      titulo: (cfg && cfg.mensajeFinTitulo) || CONFIG.mensajeFinTitulo,
      cuerpo: (cfg && cfg.mensajeFinCuerpo) || CONFIG.mensajeFinCuerpo,
      avisoResp: (cfg && cfg.avisoResponsable) || CONFIG.avisoResponsable || "",
      avisoCont: (cfg && cfg.avisoContacto) || CONFIG.avisoContacto || "",
      umbrales: (cfg && cfg.umbrales) || UMBRALES,
      marca: (cfg && cfg.marca) || MARCA,
      modo: (cfg && cfg.modoExamen) || "rapida",
    };
    var pl = ((cfg && Array.isArray(cfg.puestos) && cfg.puestos.length) ? cfg.puestos : PUESTOS).slice();
    _abrirConfigUI(c, pl);
  });
}
function _abrirConfigUI(c, pl) {
  const ov = document.createElement("div"); ov.className = "modal-overlay";
  ov.innerHTML = `<div class="modal">
    <div class="modal__head"><h3>Configuración</h3><button class="icon-btn" data-x><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18M6 6l12 12"/></svg></button></div>
    <div class="modal__body">
      <div class="sec-title" style="margin-top:0">Modo de evaluación</div>
      <p style="color:var(--muted);font-size:.84rem;margin-bottom:12px">Elige cómo contestan los aspirantes. Puedes cambiarlo cuando quieras.</p>
      <div class="modo-seg" id="cfgModo">
        <button type="button" class="modo-opt ${c.modo === "rapida" ? "is-on" : ""}" data-modo="rapida">
          <span class="modo-opt__t">Contratación rápida</span>
          <span class="modo-opt__d">Todas las preguntas de corrido, en una sola sesión.</span>
        </button>
        <button type="button" class="modo-opt ${c.modo === "fases" ? "is-on" : ""}" data-modo="fases">
          <span class="modo-opt__t">Por fases</span>
          <span class="modo-opt__d">Una fase por sesión; al terminar cada fase se detiene para evaluarla antes de seguir.</span>
        </button>
      </div>

      <div class="sec-title">Preguntas del examen</div>
      <p style="color:var(--muted);font-size:.84rem;margin-bottom:12px">Agrega, edita o quita las preguntas del banco general sin tocar código. Los espejos y las del puesto se administran aparte.</p>
      <button class="btn btn--sm" id="cfgEditQ" style="margin-bottom:6px"><svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.12 2.12 0 0 1 3 3L12 15l-4 1 1-4Z"/></svg>Editar preguntas</button>

      <div class="sec-title">Puestos del examen</div>
      <p style="color:var(--muted);font-size:.84rem;margin-bottom:12px">Son los botones de "Puesto al que aspiras" que ve el aspirante. Agrega o quita los que necesites.</p>
      <div class="tags" id="cfgPuestos"></div>
      <div class="add-row"><input class="input" id="cfgPuestoNew" placeholder="Nuevo puesto…"><button class="btn btn--sm" id="cfgPuestoAdd">Agregar</button></div>

      <div class="sec-title">Mensaje final del examen</div>
      <p style="color:var(--muted);font-size:.84rem;margin-bottom:12px">Lo que ve el aspirante al terminar.</p>
      <div class="field"><label class="field__label">Título</label><input class="input" id="cfgTit" value="${c.titulo.replace(/"/g, "&quot;")}"></div>
      <div class="field"><label class="field__label">Mensaje</label><textarea class="input" id="cfgCue" rows="4">${c.cuerpo}</textarea></div>

      <div class="sec-title">Aviso de privacidad</div>
      <p style="color:var(--muted);font-size:.84rem;margin-bottom:12px">Responsable y correo para derechos ARCO. Aparecen en el aviso que el aspirante acepta antes de empezar.</p>
      <div class="field"><label class="field__label">Responsable (empresa)</label><input class="input" id="cfgResp" value="${(c.avisoResp || "").replace(/"/g, "&quot;")}"></div>
      <div class="field"><label class="field__label">Correo de contacto (ARCO)</label><input class="input" id="cfgCont" type="email" value="${(c.avisoCont || "").replace(/"/g, "&quot;")}"></div>

      <div class="sec-title">Umbrales de calificación</div>
      <p style="color:var(--muted);font-size:.84rem;margin-bottom:12px">Define desde qué porcentaje una dimensión cuenta como Fortaleza o como Área de oportunidad, y cuándo se levanta una bandera en las dimensiones críticas (honestidad y juicio). Aplica a todos los resultados al instante.</p>
      <div class="umb-grid">
        <div class="field"><label class="field__label">Fortaleza desde (%)</label><input class="input" id="cfgUFort" type="number" min="1" max="100" value="${Math.round((c.umbrales.fortaleza || 0.75) * 100)}"></div>
        <div class="field"><label class="field__label">Promedio desde (%)</label><input class="input" id="cfgUProm" type="number" min="1" max="100" value="${Math.round((c.umbrales.promedio || 0.45) * 100)}"></div>
        <div class="field"><label class="field__label">Bandera si baja de (%)</label><input class="input" id="cfgUBand" type="number" min="1" max="100" value="${Math.round((c.umbrales.bandera || 0.45) * 100)}"></div>
      </div>

      <div class="sec-title">Marca (white-label)</div>
      <p style="color:var(--muted);font-size:.84rem;margin-bottom:12px">Pon el logo y el color de la empresa. Se aplican al examen del aspirante y a este panel.</p>
      <div class="field"><label class="field__label">Nombre de la empresa</label><input class="input" id="cfgMarcaNom" value="${(c.marca.nombre || "").replace(/"/g, "&quot;")}" placeholder="Ej. Grupo Acme"></div>
      <div class="field"><label class="field__label">Color de marca</label><div class="marca-color"><input type="color" id="cfgMarcaColor" value="${c.marca.color || "#4B4FE6"}"><span class="marca-hex" id="cfgMarcaHex">${c.marca.color || "#4B4FE6"}</span></div></div>
      <div class="field"><label class="field__label">Logo</label>
        <div class="marca-logo">
          <img id="cfgMarcaPrev" class="marca-prev" src="${c.marca.logo || ""}" alt="" ${c.marca.logo ? "" : "hidden"}>
          <label class="btn btn--sm" for="cfgMarcaFile">Subir logo</label>
          <input type="file" id="cfgMarcaFile" accept="image/png,image/jpeg,image/webp,image/svg+xml" hidden>
          <button type="button" class="btn btn--sm" id="cfgMarcaDel" ${c.marca.logo ? "" : "hidden"}>Quitar</button>
        </div>
        <p class="ed-hint">PNG, JPG o SVG, máximo 200 KB. Se ve mejor horizontal.</p>
      </div>
      <p class="cfg-error" id="cfgErr"></p>
    </div>
    <div class="modal__foot"><button class="btn btn--ghost" data-x>Cancelar</button><button class="btn btn--primary" id="cfgSave">Guardar</button></div>
  </div>`;
  document.body.appendChild(ov); requestAnimationFrame(() => ov.classList.add("is-on"));
  const close = () => { ov.classList.remove("is-on"); setTimeout(() => ov.remove(), 220); };
  const pintar = () => {
    $("#cfgPuestos", ov).innerHTML = pl.length
      ? pl.map((p, i) => `<span class="tag">${p}<button class="tag__x" data-i="${i}" aria-label="Quitar ${p}">×</button></span>`).join("")
      : `<span style="color:var(--faint);font-size:.85rem">Sin puestos aún</span>`;
    $$(".tag__x", ov).forEach(b => b.addEventListener("click", () => { pl.splice(Number(b.dataset.i), 1); $("#cfgErr", ov).textContent = ""; pintar(); }));
  };
  pintar();
  const agregar = () => {
    const v = $("#cfgPuestoNew", ov).value.trim();
    if (!v) return;
    if (pl.some(p => p.toLowerCase() === v.toLowerCase())) { $("#cfgErr", ov).textContent = "Ese puesto ya está en la lista."; return; }
    pl.push(v); $("#cfgPuestoNew", ov).value = ""; $("#cfgErr", ov).textContent = ""; pintar(); $("#cfgPuestoNew", ov).focus();
  };
  $("#cfgPuestoAdd", ov).addEventListener("click", agregar);
  $("#cfgPuestoNew", ov).addEventListener("keydown", e => { if (e.key === "Enter") { e.preventDefault(); agregar(); } });
  $$("[data-x]", ov).forEach(b => b.addEventListener("click", close));
  ov.addEventListener("click", e => { if (e.target === ov) close(); });
  var _eq = $("#cfgEditQ", ov); if (_eq) _eq.addEventListener("click", abrirEditorPreguntas);

  var modoSel = c.modo || "rapida";
  $$("#cfgModo .modo-opt", ov).forEach(b => b.addEventListener("click", () => {
    modoSel = b.dataset.modo;
    $$("#cfgModo .modo-opt", ov).forEach(x => x.classList.toggle("is-on", x === b));
  }));
  var logoData = c.marca.logo || "";
  var fileInp = $("#cfgMarcaFile", ov), prev = $("#cfgMarcaPrev", ov), delLogo = $("#cfgMarcaDel", ov);
  var colInp = $("#cfgMarcaColor", ov), hexEl = $("#cfgMarcaHex", ov);
  colInp.addEventListener("input", () => { hexEl.textContent = colInp.value; });
  fileInp.addEventListener("change", () => {
    const f = fileInp.files && fileInp.files[0]; if (!f) return;
    if (f.size > 200 * 1024) { $("#cfgErr", ov).textContent = "El logo pesa más de 200 KB. Usa uno más ligero."; fileInp.value = ""; return; }
    const rd = new FileReader();
    rd.onload = () => { logoData = rd.result; prev.src = logoData; prev.hidden = false; delLogo.hidden = false; $("#cfgErr", ov).textContent = ""; };
    rd.readAsDataURL(f);
  });
  delLogo.addEventListener("click", () => { logoData = ""; prev.src = ""; prev.hidden = true; delLogo.hidden = true; fileInp.value = ""; });

  $("#cfgSave", ov).addEventListener("click", () => {
    const tit = $("#cfgTit", ov).value.trim(), cue = $("#cfgCue", ov).value.trim();
    const resp = $("#cfgResp", ov).value.trim(), cont = $("#cfgCont", ov).value.trim();
    if (!pl.length) { $("#cfgErr", ov).textContent = "Deja al menos un puesto."; return; }
    if (!tit || !cue) { $("#cfgErr", ov).textContent = "El título y el mensaje no pueden quedar vacíos."; return; }
    const uf = parseInt($("#cfgUFort", ov).value), up = parseInt($("#cfgUProm", ov).value), ub = parseInt($("#cfgUBand", ov).value);
    if ([uf, up, ub].some(x => isNaN(x) || x < 1 || x > 100)) { $("#cfgErr", ov).textContent = "Los umbrales deben ser porcentajes entre 1 y 100."; return; }
    if (up >= uf) { $("#cfgErr", ov).textContent = "El umbral de Promedio debe ser menor que el de Fortaleza."; return; }
    const umbrales = { fortaleza: uf / 100, promedio: up / 100, bandera: ub / 100 };
    const marca = { nombre: $("#cfgMarcaNom", ov).value.trim(), logo: logoData, color: colInp.value };
    window.Store.guardarConfig({ mensajeFinTitulo: tit, mensajeFinCuerpo: cue, puestos: pl, avisoResponsable: resp, avisoContacto: cont, umbrales: umbrales, marca: marca, modoExamen: modoSel })
      .then(function () { Object.assign(UMBRALES, umbrales); aplicarMarcaPanel(marca); close(); toast("Configuración guardada."); renderApp(); })
      .catch(function () { $("#cfgErr", ov).textContent = "No se pudo guardar."; });
  });
}

/* ---------- Editor de preguntas ---------- */
const LIKERT_ED = [{ t: "Totalmente de acuerdo", v: 3 }, { t: "De acuerdo", v: 2 }, { t: "En desacuerdo", v: 1 }, { t: "Totalmente en desacuerdo", v: 0 }];
const CHEV = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m6 9 6 6 6-6"/></svg>`;
function escED(s) { return (s == null ? "" : String(s)).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;"); }
function clonarQ(q) { return JSON.parse(JSON.stringify(q)); }
function esLikertED(q) { return q.opciones && q.opciones.length === 4 && q.opciones[0] && q.opciones[0].t === "Totalmente de acuerdo" && q.opciones[3] && q.opciones[3].t === "Totalmente en desacuerdo"; }
function tipoED(q) { if (q.tipo === "abierta") return "abierta"; if (q.tipo === "likert" || esLikertED(q)) return "likert"; return "opcion"; }
function genIdED() { return "rh_" + Date.now().toString(36) + Math.random().toString(36).slice(2, 6); }

function abrirEditorPreguntas() {
  window.Store.leerPreguntas().then(function (lista) {
    const bank = (Array.isArray(lista) && lista.length) ? lista.map(clonarQ) : PREGUNTAS.map(clonarQ);
    _editorUI(bank);
  }).catch(function () { _editorUI(PREGUNTAS.map(clonarQ)); });
}
function _editorUI(bank) {
  const DIMS = Object.keys(DIMENSIONES).filter(d => d !== "atencion" && d !== "puesto");
  const ov = document.createElement("div"); ov.className = "modal-overlay";
  ov.innerHTML = `<div class="modal modal--editor" role="dialog" aria-modal="true"><div id="edBody"></div></div>`;
  document.body.appendChild(ov); requestAnimationFrame(() => ov.classList.add("is-on"));
  const close = () => { ov.classList.remove("is-on"); setTimeout(() => ov.remove(), 220); };
  ov.addEventListener("click", e => { if (e.target === ov) close(); });
  const body = ov.querySelector("#edBody");
  const q = s => body.querySelector(s), qq = s => [...body.querySelectorAll(s)];
  const guardar = () => window.Store.guardarPreguntas(bank).catch(() => toast("No se pudo guardar."));

  function pintarLista() {
    body.innerHTML = `
      <div class="resumen-head"><h3>Editar preguntas del examen</h3><button class="icon-btn" id="edClose" aria-label="Cerrar"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18M6 6l12 12"/></svg></button></div>
      <p class="inv-intro">${bank.length} preguntas en el banco general. Los cambios se guardan solos.</p>
      <div class="ed-actions"><button class="btn btn--primary btn--sm" id="edAdd">+ Agregar pregunta</button><button class="btn btn--sm" id="edReset">Restaurar originales</button></div>
      <div class="ed-list">${bank.map((it, i) => {
        const tp = tipoED(it); const tl = tp === "likert" ? "Escala" : tp === "abierta" ? "Abierta" : "Opción";
        const dl = tp === "abierta" ? (it.tag || "Entrevista") : (DIMENSIONES[it.dim] || it.dim);
        return `<div class="ed-row"><div class="ed-row__main"><div class="ed-row__top"><span class="ed-chip ed-chip--${tp}">${tl}</span><span class="ed-dim">${escED(dl)}</span>${it.info ? '<span class="ed-flag">no califica</span>' : ''}</div><div class="ed-row__txt">${escED((it.texto || "").slice(0, 95))}${(it.texto || "").length > 95 ? "…" : ""}</div></div><div class="ed-row__btns"><button class="icon-btn ed-edit" data-i="${i}" aria-label="Editar"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.12 2.12 0 0 1 3 3L12 15l-4 1 1-4Z"/></svg></button><button class="icon-btn ed-del" data-i="${i}" aria-label="Eliminar"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2m3 0v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/></svg></button></div></div>`;
      }).join("")}</div>`;
    q("#edClose").addEventListener("click", close);
    q("#edAdd").addEventListener("click", () => pintarForm(null));
    q("#edReset").addEventListener("click", () => { if (confirm("¿Restaurar las preguntas originales? Se perderán los cambios que hayas hecho.")) { bank.length = 0; PREGUNTAS.forEach(p => bank.push(clonarQ(p))); guardar(); pintarLista(); toast("Preguntas restauradas."); } });
    qq(".ed-edit").forEach(b => b.addEventListener("click", () => pintarForm(parseInt(b.dataset.i))));
    qq(".ed-del").forEach(b => b.addEventListener("click", () => { if (confirm("¿Eliminar esta pregunta?")) { bank.splice(parseInt(b.dataset.i), 1); guardar(); pintarLista(); } }));
  }

  function pintarForm(idx) {
    const edit = idx != null; const base = edit ? bank[idx] : null;
    let tp = base ? tipoED(base) : "opcion";
    let dim = base ? (base.dim || DIMS[0]) : DIMS[0];
    let texto = base ? (base.texto || "") : "";
    let sinPorque = base ? !!base.sinPorque : false, info = base ? !!base.info : false;
    let tag = base ? (base.tag || "") : "", ayuda = base ? (base.ayuda || "") : "", fijarte = base ? (base.fijarte || "") : "";
    let opts = (base && tipoED(base) === "opcion" && base.opciones) ? base.opciones.map(o => ({ t: o.t, v: o.v == null ? 2 : o.v, correcta: !!o.correcta, otro: !!o.otro })) : [{ t: "", v: 3, correcta: false }, { t: "", v: 0, correcta: false }];
    if (DIMS.indexOf(dim) < 0 && tp !== "abierta") dim = DIMS[0];

    function harvest() {
      const t = q("#edTexto"); if (t) texto = t.value;
      const d = q("#edDim"); if (d) dim = d.value;
      const sp = q("#edSinPorque"); if (sp) sinPorque = sp.checked;
      const inf = q("#edInfo"); if (inf) info = inf.checked;
      const tg = q("#edTag"); if (tg) tag = tg.value;
      const ay = q("#edAyuda"); if (ay) ayuda = ay.value;
      const fj = q("#edFijarte"); if (fj) fijarte = fj.value;
      qq(".edopt").forEach((row, i) => { if (opts[i]) { opts[i].t = row.querySelector(".edopt-t").value; opts[i].v = parseInt(row.querySelector(".edopt-v").value); const c = row.querySelector(".edopt-c"); opts[i].correcta = c ? c.checked : false; } });
    }
    function render() {
      let cuerpo = "";
      if (tp === "likert") cuerpo = `<div class="ed-note">Usa la escala estándar: Totalmente de acuerdo (3) → Totalmente en desacuerdo (0). No necesitas escribir opciones.</div>`;
      else if (tp === "opcion") cuerpo = `<div class="field"><label class="field__label">Opciones</label><div class="ed-opts">${opts.map((o, i) => `<div class="edopt"><input class="input edopt-t" placeholder="Opción ${i + 1}" value="${escED(o.t)}"><div class="sel sel--mini"><select class="edopt-v">${[3, 2, 1, 0].map(v => `<option ${o.v === v ? "selected" : ""}>${v}</option>`).join("")}</select>${CHEV}</div><label class="edopt-ck"><input type="checkbox" class="edopt-c" ${o.correcta ? "checked" : ""}><span>correcta</span></label>${opts.length > 2 ? `<button type="button" class="icon-btn edopt-del" data-i="${i}" aria-label="Quitar"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18M6 6l12 12"/></svg></button>` : ""}</div>`).join("")}</div><button type="button" class="btn btn--sm" id="edOptAdd">+ Opción</button><p class="ed-hint">Valor 3 = mejor respuesta, 0 = peor. Marca "correcta" solo en preguntas de intelecto con una respuesta correcta.</p></div>`;
      const flags = tp !== "abierta" ? `<label class="ck"><input type="checkbox" id="edSinPorque" ${sinPorque ? "checked" : ""}><span>No pedir "¿por qué?"</span></label><label class="ck"><input type="checkbox" id="edInfo" ${info ? "checked" : ""}><span>Informativa (no califica)</span></label>` : "";
      const dimBlock = tp === "abierta"
        ? `<div class="field"><label class="field__label">Etiqueta / área</label><input class="input" id="edTag" value="${escED(tag)}" placeholder="Ej. Motivación"></div><div class="field"><label class="field__label">Ayuda para el aspirante (opcional)</label><input class="input" id="edAyuda" value="${escED(ayuda)}" placeholder="Una pista breve"></div><div class="field"><label class="field__label">Qué observar (nota para RH)</label><textarea class="input" id="edFijarte" rows="2" placeholder="Qué distingue una buena respuesta">${escED(fijarte)}</textarea></div>`
        : `<div class="field"><label class="field__label">Dimensión</label><div class="sel"><select id="edDim">${DIMS.map(d => `<option value="${d}" ${d === dim ? "selected" : ""}>${DIMENSIONES[d]}</option>`).join("")}</select>${CHEV}</div></div>`;
      body.innerHTML = `
        <div class="resumen-head"><h3>${edit ? "Editar pregunta" : "Nueva pregunta"}</h3><button class="icon-btn" id="edBack" aria-label="Volver"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18M6 6l12 12"/></svg></button></div>
        <div class="ed-form">
          <div class="field"><label class="field__label">Tipo de pregunta</label><div class="ed-types">${["likert", "opcion", "abierta"].map(t => `<button type="button" class="ed-type ${t === tp ? "is-on" : ""}" data-t="${t}">${t === "likert" ? "Escala de acuerdo" : t === "opcion" ? "Opción múltiple" : "Pregunta abierta"}</button>`).join("")}</div></div>
          <div class="field"><label class="field__label">Pregunta</label><textarea class="input" id="edTexto" rows="2" placeholder="Escribe la pregunta">${escED(texto)}</textarea></div>
          ${dimBlock}
          ${cuerpo}
          ${flags ? `<div class="ed-flags">${flags}</div>` : ""}
          <p class="form-error" id="edErr"></p>
          <div class="ed-formbtns"><button class="btn" id="edCancel">Cancelar</button><button class="btn btn--primary" id="edSave">Guardar pregunta</button></div>
        </div>`;
      qq(".ed-type").forEach(b => b.addEventListener("click", () => { harvest(); tp = b.dataset.t; if (tp === "opcion" && opts.length < 2) opts = [{ t: "", v: 3, correcta: false }, { t: "", v: 0, correcta: false }]; render(); }));
      const add = q("#edOptAdd"); if (add) add.addEventListener("click", () => { harvest(); opts.push({ t: "", v: 2, correcta: false }); render(); });
      qq(".edopt-del").forEach(b => b.addEventListener("click", () => { harvest(); if (opts.length > 2) { opts.splice(parseInt(b.dataset.i), 1); render(); } }));
      q("#edBack").addEventListener("click", pintarLista);
      q("#edCancel").addEventListener("click", pintarLista);
      q("#edSave").addEventListener("click", () => { harvest(); guardarPregunta(); });
    }
    function guardarPregunta() {
      const err = q("#edErr");
      if (!texto.trim()) { err.textContent = "Escribe la pregunta."; return; }
      let nq;
      if (tp === "abierta") {
        nq = { id: (base && base.id) || genIdED(), dim: "entrevista", tipo: "abierta", texto: texto.trim(), tag: tag.trim() || "Entrevista", ayuda: ayuda.trim(), fijarte: fijarte.trim() };
      } else if (tp === "likert") {
        nq = { id: (base && base.id) || genIdED(), dim: dim, tipo: "likert", texto: texto.trim(), opciones: LIKERT_ED.map(o => ({ t: o.t, v: o.v })) };
        if (sinPorque) nq.sinPorque = true; if (info) nq.info = true;
        if (base && base.porqueLabel) nq.porqueLabel = base.porqueLabel;
      } else {
        const limpio = opts.map(o => { const x = { t: (o.t || "").trim(), v: isNaN(o.v) ? 2 : o.v }; if (o.correcta) x.correcta = true; if (o.otro) x.otro = true; return x; }).filter(o => o.t);
        if (limpio.length < 2) { err.textContent = "Agrega al menos 2 opciones con texto."; return; }
        nq = { id: (base && base.id) || genIdED(), dim: dim, texto: texto.trim(), opciones: limpio };
        if (sinPorque) nq.sinPorque = true; if (info) nq.info = true;
        if (base && base.porqueLabel) nq.porqueLabel = base.porqueLabel;
      }
      if (edit) bank[idx] = nq; else bank.push(nq);
      guardar(); pintarLista();
    }
    render();
  }
  pintarLista();
}

/* ---------- Tema / login ---------- */
function applyTheme(t) {
  document.documentElement.setAttribute("data-theme", t);
  $("#iconMoon").style.display = t === "dark" ? "none" : "block";
  $("#iconSun").style.display = t === "dark" ? "block" : "none";
  try { localStorage.setItem("examenrh-theme", t); } catch (e) {}
}
function bootApp() { $("#login").style.display = "none"; $("#app").classList.add("is-on"); $("#hdrName").textContent = "Recursos Humanos"; window.Store.leerConfig().then(function (cfg) { if (cfg) { if (cfg.umbrales) Object.assign(UMBRALES, cfg.umbrales); if (cfg.marca) aplicarMarcaPanel(cfg.marca); } }).catch(function () {}).then(function () { renderApp(); }); }

document.addEventListener("DOMContentLoaded", () => {
  try { applyTheme(localStorage.getItem("examenrh-theme") || "light"); } catch (e) { applyTheme("light"); }
  const FON = !!window.FIREBASE_ON;
  let entrar;
  if (FON) {
    const ef = $("#emailField"); if (ef) ef.hidden = false;
    $("#loginHint").textContent = "Acceso con tu cuenta de Recursos Humanos.";
    if (window.auth) window.auth.onAuthStateChanged(function (u) { if (u) bootApp(); });
    entrar = function () {
      window.Store.login(($("#email").value || "").trim(), $("#pw").value)
        .catch(function () { $("#loginHint").textContent = "Correo o contraseña incorrectos."; $("#pw").value = ""; });
    };
  } else {
    let yaOk = false; try { yaOk = sessionStorage.getItem("examenrh_rh_ok") === "1"; } catch (e) {}
    if (yaOk) bootApp();
    entrar = function () {
      if ($("#pw").value === RH_PASS) { try { sessionStorage.setItem("examenrh_rh_ok", "1"); } catch (e) {} bootApp(); }
      else { $("#loginHint").textContent = "Contraseña incorrecta."; $("#pw").value = ""; $("#pw").focus(); }
    };
  }
  $("#entrarBtn").addEventListener("click", entrar);
  $("#pw").addEventListener("keydown", e => { if (e.key === "Enter") entrar(); });
  $("#themeBtn").addEventListener("click", () => applyTheme(document.documentElement.getAttribute("data-theme") === "dark" ? "light" : "dark"));
  $("#logoutBtn").addEventListener("click", () => { window.Store.logout(); try { sessionStorage.removeItem("examenrh_rh_ok"); } catch (e) {} $("#app").classList.remove("is-on"); $("#login").style.display = "grid"; const p = $("#pw"); if (p) { p.value = ""; p.focus(); } });
  $("#cfgBtn").addEventListener("click", abrirConfig);
});
})(window.__EVAL.PREGUNTAS, window.__EVAL.DIMENSIONES, window.__EVAL.NIVEL_DIM, window.__EVAL.CRITICAS, window.__EVAL.CONFIG, window.__EVAL.RH_PASS, window.__EVAL.PUESTOS, window.__EVAL.PREGUNTAS_PUESTO);
