/* =====================================================================
   app.js — Evaluación de Ingreso (flujo del aspirante, tipo kiosko)
   Modo DEMO. Al concluir calcula el resultado por dimensión y lo guarda
   (localStorage + // TODO firebase) para que RH lo vea en su panel.
   ===================================================================== */

const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const MESES = ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic"];
const fechaLarga = iso => { if (!iso) return ""; const [y, m, d] = iso.split("-").map(Number); return `${d} ${MESES[m - 1]} ${y}`; };
const esEmail = v => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
const soloDigitos = v => v.replace(/\D/g, "");
const esc = s => (s == null ? "" : String(s)).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

/* ---------- Date picker (nacimiento) ---------- */
const DIAS = ["L", "M", "M", "J", "V", "S", "D"];
const MESES_LARGO = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];
function datepickHTML(name, value, openDef) {
  return `<div class="datepick" data-name="${name}" data-value="${value || ""}" data-open="${openDef || ""}">
    <button type="button" class="datepick__btn"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/></svg>
      <span class="datepick__val">${value ? fechaLarga(value) : "Seleccionar"}</span></button>
    <div class="datepick__pop"></div></div>`;
}
function renderCalendar(dp, vy, vm) {
  const startDow = (new Date(vy, vm, 1).getDay() + 6) % 7;
  const dim = new Date(vy, vm + 1, 0).getDate();
  const sel = dp.dataset.value;
  let cells = "";
  for (let i = 0; i < startDow; i++) cells += `<span class="dp-cell dp-empty"></span>`;
  for (let d = 1; d <= dim; d++) {
    const iso = `${vy}-${String(vm + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
    cells += `<button type="button" class="dp-cell ${iso === sel ? "is-sel" : ""}" data-iso="${iso}">${d}</button>`;
  }
  const pop = $(".datepick__pop", dp);
  pop.innerHTML = `<div class="dp-nav">
      <button type="button" class="dp-arrow" data-nav="-12" title="Año anterior"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m11 17-5-5 5-5M18 17l-5-5 5-5"/></svg></button>
      <button type="button" class="dp-arrow" data-nav="-1"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m15 18-6-6 6-6"/></svg></button>
      <span class="dp-month">${MESES_LARGO[vm]} ${vy}</span>
      <button type="button" class="dp-arrow" data-nav="1"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m9 18 6-6-6-6"/></svg></button>
      <button type="button" class="dp-arrow" data-nav="12" title="Año siguiente"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m13 17 5-5-5-5M6 17l5-5-5-5"/></svg></button>
    </div>
    <div class="dp-dows">${DIAS.map(d => `<span>${d}</span>`).join("")}</div>
    <div class="dp-grid">${cells}</div>`;
  dp._vy = vy; dp._vm = vm;
  $$(".dp-arrow", pop).forEach(a => a.addEventListener("click", e => {
    e.stopPropagation();
    let total = dp._vy * 12 + dp._vm + Number(a.dataset.nav);
    renderCalendar(dp, Math.floor(total / 12), ((total % 12) + 12) % 12);
  }));
  $$(".dp-cell[data-iso]", pop).forEach(c => c.addEventListener("click", () => {
    dp.dataset.value = c.dataset.iso;
    $(".datepick__val", dp).textContent = fechaLarga(c.dataset.iso);
    dp.classList.remove("is-open");
  }));
}
function bindDatepick(root) {
  $$(".datepick", root).forEach(dp => {
    $(".datepick__btn", dp).addEventListener("click", e => {
      e.stopPropagation();
      $$(".datepick").forEach(x => { if (x !== dp) x.classList.remove("is-open"); });
      if (dp.classList.toggle("is-open")) {
        const base = dp.dataset.value || dp.dataset.open || "2000-01";
        const p = base.split("-").map(Number);
        renderCalendar(dp, p[0], (p[1] || 1) - 1);
      }
    });
  });
}

/* ---------- Estado ---------- */
const FASES = ["bienvenida", "datos", "instrucciones", "examen", "reaccion", "fin"];
const state = { fase: "bienvenida", qIdx: 0, datos: {}, respuestas: {}, atencion: null };

/* ---------- Render principal ---------- */
function render() {
  const f = state.fase;
  if (f === "bienvenida") return renderBienvenida();
  if (f === "datos") return renderDatos();
  if (f === "instrucciones") return renderInstrucciones();
  if (f === "examen") return renderPregunta();
  if (f === "reaccion") return renderReaccion();
  if (f === "fin") return renderFin();
}
function setProgreso(pct, txt) {
  const bar = $("#kbarFill"), lab = $("#kstep");
  if (bar) bar.style.width = (pct * 100) + "%";
  if (lab) lab.textContent = txt || "";
  $("#kprogress").style.visibility = pct > 0 && pct < 1 ? "visible" : "hidden";
}

function aplicarColor(hex) {
  if (!hex || !/^#[0-9a-fA-F]{6}$/.test(hex)) return;
  const r = parseInt(hex.slice(1, 3), 16), g = parseInt(hex.slice(3, 5), 16), b = parseInt(hex.slice(5, 7), 16);
  const s = document.documentElement.style;
  s.setProperty("--accent", hex); s.setProperty("--accent-2", hex); s.setProperty("--accent-soft", `rgba(${r},${g},${b},.14)`);
}
function aplicarMarca(m) {
  if (!m) return;
  window.__MARCA = m;
  try { document.title = m.nombre ? ("Evaluación de ingreso · " + m.nombre) : "Evaluación de ingreso"; } catch (e) {}
  if (m.color) aplicarColor(m.color);
  const b = document.getElementById("kioskBrand");
  if (b) {
    const ic = m.logo ? `<img class="brand__logo" src="${m.logo}" alt="">` : `<span class="mark"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 11l3 3 8-8"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg></span>`;
    b.innerHTML = ic + " " + (m.nombre || "Evalua RH");
  }
  const rl = document.getElementById("rhAccessLabel");
  if (rl) rl.textContent = m.acceso || m.nombre || "Acceso RH";
}
function renderBienvenida() {
  setProgreso(0, "");
  const M = window.__MARCA || {};
  const marca = M.logo
    ? `<img class="welcome__logo" src="${M.logo}" alt="">`
    : `<div class="welcome__mark"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M9 11l3 3 8-8"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg></div>`;
  $("#stage").innerHTML = `
    <div class="screen screen--center">
      <div class="welcome">
        ${marca}
        <h1 class="welcome__title">${CONFIG.titulo}</h1>
        <p class="welcome__sub">Bienvenido(a). Esta evaluación toma alrededor de 10 minutos. Solo toca la opción que mejor te describa — la mayoría de preguntas no tienen respuesta correcta o incorrecta.</p>
        <label class="consent" for="consent"><input type="checkbox" id="consent"><span>He leído y acepto el <button type="button" class="linklike" id="verAviso">aviso de privacidad</button>.</span></label>
        <button class="btn btn--xl btn--primary" id="goStart" disabled>Comenzar</button>
        <p class="welcome__foot">${(M.nombre || CONFIG.empresa)} · Recursos Humanos</p>
      </div>
    </div>`;
  const cb = $("#consent"), gs = $("#goStart");
  cb.addEventListener("change", () => { gs.disabled = !cb.checked; });
  $("#verAviso").addEventListener("click", abrirAviso);
  gs.addEventListener("click", () => { if (!cb.checked) return; state.fase = "datos"; render(); });
}

function textoAviso() {
  const r = CONFIG.avisoResponsable || (window.__MARCA && window.__MARCA.nombre) || CONFIG.empresa, c = CONFIG.avisoContacto || "";
  return `
    <p><strong>Responsable.</strong> ${r} es responsable del tratamiento de tus datos personales, conforme a la Ley Federal de Protección de Datos Personales en Posesión de los Particulares (LFPDPPP).</p>
    <p><strong>Datos que recabamos.</strong> Nombre, teléfono, correo, CURP, fecha de nacimiento, género, escolaridad, puesto de interés y tus respuestas a esta evaluación.</p>
    <p><strong>Finalidad.</strong> Evaluar tu perfil dentro de un proceso de selección de personal. No usamos tus datos para fines distintos ni los compartimos con terceros sin tu consentimiento, salvo obligación legal.</p>
    <p><strong>Derechos ARCO.</strong> Puedes Acceder, Rectificar, Cancelar u Oponerte al tratamiento de tus datos${c ? `, escribiendo a <strong>${c}</strong>` : ""}.</p>
    <p><strong>Consentimiento.</strong> Al marcar la casilla y comenzar la evaluación, aceptas este aviso de privacidad.</p>`;
}

function abrirAviso() {
  const ov = document.createElement("div"); ov.className = "modal-overlay";
  ov.innerHTML = `<div class="modal modal--aviso" role="dialog" aria-modal="true">
    <h3>Aviso de privacidad</h3>
    <div class="aviso-body">${textoAviso()}</div>
    <div class="pw-actions"><button class="btn btn--primary" id="avClose">Entendido</button></div>
  </div>`;
  document.body.appendChild(ov); requestAnimationFrame(() => ov.classList.add("is-on"));
  const close = () => { ov.classList.remove("is-on"); setTimeout(() => ov.remove(), 220); };
  $("#avClose", ov).addEventListener("click", close);
  ov.addEventListener("click", e => { if (e.target === ov) close(); });
}

function puestosActuales() { return (window.__PUESTOS_REMOTOS && window.__PUESTOS_REMOTOS.length) ? window.__PUESTOS_REMOTOS : PUESTOS; }

function renderDatos() {
  setProgreso(0.05, "Tus datos");
  const d = state.datos;
  const PU = puestosActuales();
  const chips = (name, arr, val) => `<div class="choices" data-name="${name}">${arr.map(o => `<button type="button" class="choice ${val === o ? "is-sel" : ""}" data-v="${o}">${o}</button>`).join("")}</div>`;
  $("#stage").innerHTML = `
    <div class="screen">
      <div class="k-head"><h2>Cuéntanos de ti</h2><p>Usaremos estos datos solo para contactarte.</p></div>
      <div class="form">
        <div class="form-section">Datos de contacto</div>
        <div class="field"><label class="field__label">Nombre completo *</label><input class="input" id="fNombre" value="${esc(d.nombre)}" placeholder="Tu nombre" maxlength="80"></div>
        <div class="form-grid">
          <div class="field"><label class="field__label">Teléfono *</label><input class="input" id="fTel" inputmode="numeric" value="${esc(d.tel)}" placeholder="10 dígitos"></div>
          <div class="field"><label class="field__label">Correo *</label><input class="input" id="fMail" type="email" value="${esc(d.correo)}" placeholder="tu@correo.com"></div>
        </div>
        <div class="form-grid">
          <div class="field"><label class="field__label">CURP</label><input class="input" id="fCurp" value="${esc(d.curp)}" placeholder="Opcional" maxlength="18" style="text-transform:uppercase"></div>
          <div class="field"><label class="field__label">Fecha de nacimiento</label>${datepickHTML("fNac", d.nacimiento, "2000-01")}</div>
        </div>
        <div class="form-section">Perfil</div>
        <div class="field"><label class="field__label">Género</label>${chips("genero", GENEROS, d.genero)}</div>
        <div class="field"><label class="field__label">Escolaridad</label>${chips("escolaridad", ESCOLARIDAD, d.escolaridad)}</div>
        <div class="field"><label class="field__label">Puesto al que aspiras *</label>
          ${chips("puesto", [...PU, "Otro"], PU.includes(d.puesto) ? d.puesto : (d.puesto ? "Otro" : ""))}
          <input class="input" id="puestoOtro" placeholder="¿Cuál puesto?" value="${esc((!PU.includes(d.puesto) && d.puesto) ? d.puesto : "")}" ${(!PU.includes(d.puesto) && d.puesto) ? "" : "hidden"} style="margin-top:9px"></div>
        <p class="form-error" id="dErr"></p>
      </div>
      <div class="k-actions">
        <button class="btn btn--ghost" id="dBack">Atrás</button>
        <button class="btn btn--primary btn--lg" id="dNext">Continuar</button>
      </div>
    </div>`;
  bindDatepick($("#stage"));
  $$(".choices").forEach(g => $$(".choice", g).forEach(c => c.addEventListener("click", () => {
    $$(".choice", g).forEach(x => x.classList.toggle("is-sel", x === c));
    if (g.dataset.name === "puesto") { const po = $("#puestoOtro"); if (po) { const esOtro = c.dataset.v === "Otro"; po.hidden = !esOtro; if (esOtro) po.focus(); } }
  })));
  $("#dBack").addEventListener("click", () => { state.fase = "bienvenida"; render(); });
  $("#dNext").addEventListener("click", () => {
    const get = n => { const g = $(`.choices[data-name='${n}'] .choice.is-sel`); return g ? g.dataset.v : ""; };
    const nombre = $("#fNombre").value.trim(), tel = soloDigitos($("#fTel").value), correo = $("#fMail").value.trim();
    let puesto = get("puesto");
    if (!nombre) return err("Escribe tu nombre completo.");
    if (tel.length !== 10) return err("El teléfono debe tener exactamente 10 dígitos.");
    if (!esEmail(correo)) return err("Escribe un correo válido.");
    if (!puesto) return err("Elige el puesto al que aspiras.");
    if (puesto === "Otro") { const po = $("#puestoOtro").value.trim(); if (!po) return err("Escribe el puesto al que aspiras."); puesto = po; }
    state.datos = {
      nombre, tel, correo, curp: $("#fCurp").value.trim().toUpperCase(),
      nacimiento: $(".datepick[data-name='fNac']").dataset.value || "",
      genero: get("genero"), escolaridad: get("escolaridad"), puesto,
    };
    state.fase = "instrucciones"; render();
  });
  function err(m) { $("#dErr").textContent = m; $("#stage").scrollTop = 0; }
}

function renderInstrucciones() {
  setProgreso(0.1, "Instrucciones");
  $("#stage").innerHTML = `
    <div class="screen screen--center">
      <div class="welcome">
        <div class="welcome__mark welcome__mark--soft"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4M12 8h.01"/></svg></div>
        <h1 class="welcome__title">Antes de empezar</h1>
        <ul class="tips">
          <li>Responde con sinceridad: buscamos el puesto que mejor va contigo.</li>
          <li>Una pregunta por pantalla. Solo toca tu respuesta.</li>
          <li>Al final hay una prueba rápida de atención y reacción.</li>
          <li>No puedes pausar; toma unos 10 minutos.</li>
        </ul>
        <button class="btn btn--xl btn--primary" id="goExam">Comenzar evaluación</button>
      </div>
    </div>`;
  $("#goExam").addEventListener("click", () => {
    const ex = construirExamen(state.datos.puesto);
    // Rápida = todo de corrido (sin pantallas de fase). Por fases = conserva las transiciones.
    state.preguntas = esModoFases() ? ex : ex.filter(x => !x.__intro);
    state.fase = "examen"; state.qIdx = 0; render();
  });
}

function barajar(a) { const r = a.slice(); for (let i = r.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); const t = r[i]; r[i] = r[j]; r[j] = t; } return r; }
function ordenOpciones(q) {
  if (!q.opciones) return null;
  if (q.opciones === L || q.tipo === "likert" || q.tipo === "trampa") return q.opciones.map((_, i) => i); // escala Likert y trampas: orden fijo
  const normales = [], otros = [];
  q.opciones.forEach((o, i) => { (o.otro ? otros : normales).push(i); });
  return barajar(normales).concat(otros); // baraja distractores, "Otro" siempre al final
}
function ordenarExtras() {
  // Coloca trampas y espejos de modo que los pares espejo queden SEPARADOS:
  // primero los "a" de cada par (intercalados con trampas), luego los "b".
  const espP = (typeof ESPEJO_PREGUNTAS !== "undefined" ? ESPEJO_PREGUNTAS : []);
  const pares = (typeof ESPEJOS !== "undefined" ? ESPEJOS : []);
  const byId = {}; espP.forEach(q => { byId[q.id] = q; });
  const aMembers = pares.map(p => byId[p.a]).filter(Boolean);
  const bMembers = pares.map(p => byId[p.b]).filter(Boolean);
  const traps = (typeof TRAMPAS !== "undefined" ? TRAMPAS : []).slice();
  const head = [];
  const n = Math.max(aMembers.length, traps.length);
  for (let i = 0; i < n; i++) { if (aMembers[i]) head.push(aMembers[i]); if (traps[i]) head.push(traps[i]); }
  return head.concat(bMembers);
}
function intercalar(cuerpo, extras) {
  const out = cuerpo.slice();
  if (!extras.length) return out;
  const total = out.length + extras.length;
  const paso = total / (extras.length + 1);
  extras.forEach((q, k) => {
    let at = Math.round(paso * (k + 1));
    at = Math.max(1, Math.min(out.length, at));
    out.splice(at, 0, q);
  });
  return out;
}
function bancoPreguntas() { return (window.__PREGUNTAS_REMOTAS && window.__PREGUNTAS_REMOTAS.length) ? window.__PREGUNTAS_REMOTAS : PREGUNTAS; }
function bancoFases() { return (window.__PREGUNTAS_FASES_REMOTAS && window.__PREGUNTAS_FASES_REMOTAS.length) ? window.__PREGUNTAS_FASES_REMOTAS : (typeof PREGUNTAS_FASES !== "undefined" ? PREGUNTAS_FASES : []); }

/* ---------- Fases del examen ---------- */
const TOTAL_FASES = 6; // 5 de preguntas (incl. Situaciones) + la ronda de reacción
const ETAPAS = [
  { n: 1, titulo: "Sobre ti", desc: "Empecemos por conocerte un poco." },
  { n: 2, titulo: "Tu forma de ser", desc: "Cómo te relacionas y trabajas con los demás." },
  { n: 3, titulo: "Cómo piensas y decides", desc: "Un par de retos de razonamiento y criterio." },
  { n: 4, titulo: "En el trabajo", desc: "Tu manera de actuar en el día a día." },
  { n: 5, titulo: "Situaciones", desc: "Mira cada imagen con calma y cuéntanos qué ves y qué harías." },
];
const FASE_DIM = { perfil: 1, personalidad: 2, social: 2, intelecto: 3, juicio: 3, servicio: 4, estres: 4, logistica: 4, honestidad: 4, psicosocial: 4, entrevista: 4, puesto: 4, control: 4, situaciones: 5 };
function faseDeDim(d) { return FASE_DIM[d] || 4; }
function faseInfo(n) { return ETAPAS.find(f => f.n === n) || ETAPAS[ETAPAS.length - 1]; }
// Bloques (sesiones): agrupan fases. El aspirante avanza por bloque; RH autoriza por bloque.
const TOTAL_BLOQUES = (typeof BLOQUES !== "undefined" ? BLOQUES.length : 1);
function fasesDeBloque(b) { return (typeof BLOQUES !== "undefined" && BLOQUES[b - 1] && BLOQUES[b - 1].fases) || []; }
function bloqueDeFase(f) { if (typeof BLOQUES === "undefined") return 1; for (var i = 0; i < BLOQUES.length; i++) { if (BLOQUES[i].fases.indexOf(f) >= 0) return i + 1; } return BLOQUES.length; }
function bloqueTieneReaccion(b) { return fasesDeBloque(b).indexOf(TOTAL_FASES) >= 0; }
// Convierte un enlace de Google Drive (compartir/abrir/uc) al formato que SÍ carga como imagen.
// Si no es de Drive, devuelve la URL tal cual. Se aplica al mostrar, no al guardar.
function normalizarURLImagen(url) {
  if (!url) return "";
  url = String(url).trim();
  var id = "", m;
  if ((m = url.match(/\/d\/([a-zA-Z0-9_-]{16,})/))) id = m[1];                 // .../file/d/ID/... y lh3.../d/ID
  else if ((m = url.match(/[?&]id=([a-zA-Z0-9_-]{16,})/))) id = m[1];          // open?id=ID, uc?id=ID, thumbnail?id=ID
  if (id) return "https://drive.google.com/thumbnail?id=" + id + "&sz=w1600";
  return url;
}
var MODO_EXAMEN = "rapida"; // "rapida" = todo de corrido · "fases" = una fase por sesión (frena al terminar cada fase)
// El embudo por fases aplica a: candidatos del apartado "Por fases" (window.__CF) y al kiosko presencial si el modo global es "fases".
// Las invitaciones simples (desde casa, window.__INV) SIEMPRE son de corrido.
function esModoFases() { if (window.__CF) return true; if (window.__INV) return false; return MODO_EXAMEN === "fases"; }

function construirExamen(puesto) {
  // Bancos INDEPENDIENTES: el rápido usa el general; el por fases usa el suyo
  // (copia de generales + extra, editable aparte). Editar uno no afecta al otro.
  let BANCO = esModoFases() ? bancoFases() : bancoPreguntas();
  const rol = (typeof PREGUNTAS_PUESTO !== "undefined" && PREGUNTAS_PUESTO[puesto]) || [];
  // 1) Banco general agrupado por fase (conserva su orden; "Sobre ti" queda en la fase 1).
  const FASES_PREG = []; for (let i = 1; i < TOTAL_FASES; i++) FASES_PREG.push(i); // 1..5 (la última, TOTAL_FASES, es la reacción)
  const porFase = {}; FASES_PREG.forEach(f => { porFase[f] = []; });
  BANCO.forEach(q => { const f = faseDeDim(q.dim); (porFase[f] || (porFase[f] = [])).push(q); });
  // 2) Espejos: cada par reparte sus mitades en fases distintas, así quedan separadas.
  const espP = (typeof ESPEJO_PREGUNTAS !== "undefined" ? ESPEJO_PREGUNTAS : []);
  const pares = (typeof ESPEJOS !== "undefined" ? ESPEJOS : []);
  const byId = {}; espP.forEach(q => { byId[q.id] = q; });
  const espFase = { 2: [], 3: [], 4: [] };
  pares.forEach((p, k) => {
    const a = byId[p.a], b = byId[p.b];
    if (a) espFase[[2, 3, 4][k % 3]].push(a);
    if (b) espFase[[2, 3, 4][(k + 1) % 3]].push(b);
  });
  // 3) Ensamblar: fase 1 sin intro (va tras "tus datos"); fases 2-4 con pantalla de transición.
  //    Las preguntas del puesto cierran la fase 4. Los espejos se intercalan dentro de su fase.
  const lista = [];
  FASES_PREG.forEach(f => {
    let reales = (porFase[f] || []).slice();
    if (f === 4) reales = reales.concat(rol);
    const esp = espFase[f] || [];
    if (!reales.length && !esp.length) return; // fase vacía: se omite
    const qs = (f === 1) ? reales : intercalar(reales, esp);
    if (f !== 1) lista.push({ __intro: true, fase: f });
    qs.forEach(q => { const nq = Object.assign({}, q); if (nq.opciones) nq.__ord = ordenOpciones(nq); nq.__fase = f; lista.push(nq); });
  });
  return lista;
}

function renderFaseIntro(faseN, pct) {
  const fi = faseInfo(faseN);
  setProgreso(pct, fi.titulo);
  $("#stage").innerHTML = `
    <div class="screen screen--center">
      <div class="welcome">
        <div class="welcome__badge">Siguiente sección</div>
        <h1 class="welcome__title">${fi.titulo}</h1>
        <p class="welcome__sub">${fi.desc}</p>
        <button class="btn btn--xl btn--primary" id="faseGo">Continuar</button>
        <button class="btn btn--ghost" id="faseBack" style="margin-top:10px">Anterior</button>
      </div>
    </div>`;
  $("#faseGo").addEventListener("click", () => avanzarPregunta());
  $("#faseBack").addEventListener("click", () => { if (state.qIdx === 0) { state.fase = "instrucciones"; } else { state.qIdx--; } render(); });
}
function renderPregunta() {
  const lista = state.preguntas && state.preguntas.length ? state.preguntas : PREGUNTAS;
  const q = lista[state.qIdx];
  const totalReales = lista.filter(x => !x.__intro).length;
  const hechas = lista.slice(0, state.qIdx).filter(x => !x.__intro).length;
  if (q.__intro) return renderFaseIntro(q.fase, hechas / (totalReales + 1));
  state.qStart = Date.now();
  const tag = q.tag || DIMENSIONES[q.dim] || "";
  const hayFases = lista.some(x => x.__intro);
  setProgreso((hechas + 1) / (totalReales + 1), hayFases ? faseInfo(q.__fase).titulo : `Pregunta ${hechas + 1} de ${totalReales}`);
  const prev = state.respuestas[q.id];
  if (q.tipo === "abierta") return renderAbierta(q, tag, prev);
  const orden = q.__ord || q.opciones.map((_, i) => i);
  $("#stage").innerHTML = `
    <div class="screen">
      <div class="q-tag">${tag}</div>
      ${q.imagen ? `<img class="q-img" src="${normalizarURLImagen(q.imagen)}" alt="Imagen de la pregunta" loading="lazy" onerror="this.style.display='none';var n=this.nextElementSibling;if(n)n.hidden=false;"><div class="q-img-rota" hidden>No se pudo cargar la imagen. Continúa con lo que se te indica o avísale a quien aplica el examen.</div>` : ""}
      <div class="q-text">${q.texto}</div>
      <div class="optgrid">
        ${orden.map(i => { const o = q.opciones[i]; return `<button type="button" class="opt ${prev && prev.optIdx === i ? "is-sel" : ""}" data-i="${i}" data-otro="${o.otro ? 1 : 0}">
          <span class="opt__dot"></span><span class="opt__t">${o.t}</span></button>`; }).join("")}
      </div>
      <div class="otro" id="otroBox" ${prev && prev.otro ? "" : "hidden"}>
        <label class="porque__label" for="otroTA">Especifica tu respuesta</label>
        <input class="input" id="otroTA" placeholder="Escribe aquí…" value="${prev && prev.otroTexto ? prev.otroTexto.replace(/"/g, "&quot;") : ""}">
      </div>
      ${q.sinPorque ? "" : `<div class="porque" id="porqueBox" ${prev ? "" : "hidden"}>
        <label class="porque__label" for="porqueTA">${q.porqueLabel || "¿Por qué elegiste esa respuesta?"}</label>
        <textarea class="input porque__ta" id="porqueTA" rows="3" placeholder="Cuéntanos en pocas palabras (opcional).">${prev && prev.porque ? prev.porque : ""}</textarea>
      </div>`}
      <p class="form-error" id="qErr"></p>
      <div class="k-actions">
        <button class="btn btn--ghost" id="qBack">${state.qIdx === 0 ? "Atrás" : "Anterior"}</button>
        <button class="btn btn--primary btn--lg" id="qNext" ${prev ? "" : "hidden"}>Continuar</button>
        <span class="q-hint" id="qHint" ${prev ? "hidden" : ""}>Toca una opción para responder</span>
      </div>
    </div>`;
  const seleccionar = b => {
    $$("#stage .opt").forEach(x => x.classList.toggle("is-sel", x === b));
    $("#qNext").hidden = false; $("#qHint").hidden = true; $("#qErr").textContent = "";
    const esOtro = b.dataset.otro === "1";
    const ob = $("#otroBox"); if (ob) { ob.hidden = !esOtro; if (esOtro) { const t = $("#otroTA"); if (t) t.focus(); } }
    const pb = $("#porqueBox"); if (pb) pb.hidden = false;
  };
  $$("#stage .opt").forEach(b => b.addEventListener("click", () => seleccionar(b)));
  $("#qNext").addEventListener("click", () => {
    const sel = $("#stage .opt.is-sel"); if (!sel) return;
    const i = Number(sel.dataset.i); const opt = q.opciones[i];
    let otroTexto = "";
    if (opt.otro) {
      otroTexto = ($("#otroTA").value || "").trim();
      if (!otroTexto) { $("#qErr").textContent = "Escribe tu respuesta en 'Otro'."; return; }
    }
    state.respuestas[q.id] = { optIdx: i, v: opt.v, dim: q.dim, correcta: !!opt.correcta, info: !!q.info, otro: !!opt.otro, otroTexto, porque: $("#porqueTA") ? $("#porqueTA").value.trim() : "", ms: Date.now() - (state.qStart || Date.now()), esTrampa: q.tipo === "trampa", correctaTrampa: q.tipo === "trampa" ? (i === q.correctaIdx) : undefined };
    avanzarPregunta();
  });
  $("#qBack").addEventListener("click", () => {
    if (state.qIdx === 0) { state.fase = "instrucciones"; render(); }
    else { state.qIdx--; render(); }
  });
}

function renderAbierta(q, tag, prev) {
  $("#stage").innerHTML = `
    <div class="screen">
      <div class="q-tag q-tag--open">${tag}</div>
      ${q.imagen ? `<img class="q-img" src="${normalizarURLImagen(q.imagen)}" alt="Imagen de la situación" loading="lazy" onerror="this.style.display='none';var n=this.nextElementSibling;if(n)n.hidden=false;"><div class="q-img-rota" hidden>No se pudo cargar la imagen. Describe lo que se te indica con tus palabras, o avísale a quien aplica el examen.</div>` : ""}
      <div class="q-text">${q.texto}</div>
      <textarea class="input abierta-ta" id="abiertaTA" rows="6" placeholder="Escribe tu respuesta…">${prev && prev.texto ? prev.texto : ""}</textarea>
      ${q.ayuda ? `<p class="abierta-hint">${q.ayuda}</p>` : ""}
      <p class="form-error" id="abErr"></p>
      <div class="k-actions">
        <button class="btn btn--ghost" id="qBack">${state.qIdx === 0 ? "Atrás" : "Anterior"}</button>
        <button class="btn btn--primary btn--lg" id="qNext">Continuar</button>
      </div>
    </div>`;
  const ta = $("#abiertaTA"); if (ta) ta.focus();
  $("#qNext").addEventListener("click", () => {
    const t = $("#abiertaTA").value.trim();
    if (!t) { $("#abErr").textContent = "Escribe tu respuesta para continuar."; return; }
    state.respuestas[q.id] = { tipo: "abierta", texto: t, dim: q.dim, tag, abierta: true, ms: Date.now() - (state.qStart || Date.now()) };
    avanzarPregunta();
  });
  $("#qBack").addEventListener("click", () => {
    if (state.qIdx === 0) { state.fase = "instrucciones"; render(); }
    else { state.qIdx--; render(); }
  });
}
function avanzarPregunta() {
  const lista = state.preguntas && state.preguntas.length ? state.preguntas : PREGUNTAS;
  const actual = lista[state.qIdx];
  const sig = lista[state.qIdx + 1];
  if (esModoFases()) {
    const faseAct = (actual && actual.__fase) || 1;
    const blq = bloqueDeFase(faseAct);
    if (!sig) {
      // última pregunta del examen: si este bloque incluye la reacción, ve a ella; si no, frena.
      if (bloqueTieneReaccion(blq)) { state.fase = "reaccion"; guardarProgreso(); return render(); }
      guardarBloqueEnServidor(blq); return renderPausaBloque(blq);
    }
    // lo que sigue es otra sección: si pertenece a OTRO bloque, frena (fin de sesión).
    if (sig.__intro && bloqueDeFase(sig.fase) !== blq) {
      guardarBloqueEnServidor(blq); return renderPausaBloque(blq);
    }
    // si es otra fase del MISMO bloque, sigue de corrido (muestra su intro sin frenar).
  }
  if (state.qIdx < lista.length - 1) { state.qIdx++; } else { state.fase = "reaccion"; }
  guardarProgreso(); render();
}
function guardarBloqueEnServidor(bloque) {
  // Si aún no existe el candidato por fases (kiosko presencial / primera sesión), créalo.
  // Nota: faseActual/faseCompletada guardan el número de BLOQUE (1..TOTAL_BLOQUES).
  if (!window.__CF) {
    var token = "cf_" + Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
    window.__CF = { token: token, nombre: (state.datos && state.datos.nombre) || "", puesto: (state.datos && state.datos.puesto) || "", datos: state.datos || {}, faseActual: 1, faseCompletada: 0, respuestas: {}, atencion: null, estado: "en_curso", creada: new Date().toISOString() };
    window.Store.crearCandidatoFases(window.__CF).catch(function () {});
  }
  var cf = window.__CF;
  cf.faseCompletada = bloque; cf.respuestas = state.respuestas; cf.atencion = state.atencion; cf.datos = state.datos;
  if (state.datos && state.datos.nombre) cf.nombre = state.datos.nombre;
  if (state.datos && state.datos.puesto) cf.puesto = state.datos.puesto;
  window.Store.actualizarCandidatoFases(cf.token, { faseCompletada: bloque, respuestas: state.respuestas, atencion: state.atencion, datos: state.datos, nombre: cf.nombre || "", puesto: cf.puesto || "" }).catch(function () {});
  limpiarProgreso();
}
function finalizarCF() {
  var cf = window.__CF; if (!cf) return;
  var resultado = calcularResultado(state.respuestas, state.atencion);
  Object.assign(resultado, calcularConfianza(state.respuestas));
  cf.estado = "finalizado"; cf.faseCompletada = TOTAL_BLOQUES; cf.resultado = resultado; cf.respuestas = state.respuestas; cf.atencion = state.atencion; cf.datos = state.datos;
  window.Store.actualizarCandidatoFases(cf.token, { estado: "finalizado", faseCompletada: TOTAL_BLOQUES, resultado: resultado, respuestas: state.respuestas, atencion: state.atencion, datos: state.datos, nombre: (state.datos && state.datos.nombre) || cf.nombre || "", puesto: (state.datos && state.datos.puesto) || cf.puesto || "", finalizada: new Date().toISOString() }).catch(function () {});
  limpiarProgreso();
}
function renderPausaBloque(bloque) {
  setProgreso(0, "");
  $("#stage").innerHTML = `
    <div class="screen screen--center">
      <div class="welcome welcome--done">
        <div class="done-check"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"/></svg></div>
        <div class="welcome__badge">Parte ${bloque} de ${TOTAL_BLOQUES} completada</div>
        <h1 class="welcome__title">¡Listo! Terminaste esta parte</h1>
        <p class="welcome__sub">Gracias por tu tiempo y por compartir tus respuestas con nosotros. Nuestro equipo las revisará y te avisaremos muy pronto sobre los siguientes pasos.</p>
        <p class="pausa-hint">Ya puedes cerrar esta ventana.</p>
      </div>
    </div>`;
}

/* ---------- Prueba de atención / reacción ---------- */
const RX = {
  rondas: 5, hechas: 0, tiempos: [], esperando: false, verdeEn: 0, _t: null, fase: "intro",
  intro() {
    setProgreso(0.95, "Atención y reacción");
    $("#stage").innerHTML = `
      <div class="screen screen--center">
        <div class="welcome">
          <div class="welcome__mark welcome__mark--soft"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M13 2 3 14h9l-1 8 10-12h-9z"/></svg></div>
          <h1 class="welcome__title">Prueba de reacción</h1>
          <p class="welcome__sub">Verás un círculo gris. <strong>En cuanto se ponga verde, tócalo lo más rápido que puedas.</strong> Son ${this.rondas} rondas. No toques antes del verde.</p>
          <button class="btn btn--xl btn--primary" id="rxStart">Empezar prueba</button>
        </div>
      </div>`;
    $("#rxStart").addEventListener("click", () => this.start());
  },
  start() { this.hechas = 0; this.tiempos = []; this.pantalla(); this.siguiente(); },
  pantalla() {
    $("#stage").innerHTML = `
      <div class="screen screen--center">
        <div class="rx-wrap">
          <div class="rx-prog" id="rxProg">Ronda 1 de ${this.rondas}</div>
          <button type="button" class="rx-target rx-state-wait" id="rxTarget">Espera…</button>
          <div class="rx-hint" id="rxHint">Prepárate…</div>
        </div>
      </div>`;
    $("#rxTarget").addEventListener("click", () => this.tap());
  },
  siguiente() {
    if (this.hechas >= this.rondas) return this.fin();
    const t = $("#rxTarget"); if (!t) return;
    t.className = "rx-target rx-state-wait"; t.textContent = "Espera…";
    $("#rxHint").textContent = "Prepárate…";
    $("#rxProg").textContent = `Ronda ${this.hechas + 1} de ${this.rondas}`;
    this.esperando = false;
    clearTimeout(this._t);
    this._t = setTimeout(() => this.verde(), 900 + Math.random() * 1900);
  },
  verde() {
    const t = $("#rxTarget"); if (!t) return;
    t.className = "rx-target rx-state-go"; t.textContent = "¡TOCA!";
    $("#rxHint").textContent = "";
    this.esperando = true; this.verdeEn = Date.now();
  },
  tap() {
    const t = $("#rxTarget"); if (!t) return;
    if (!this.esperando) {
      clearTimeout(this._t);
      t.className = "rx-target rx-state-early"; t.textContent = "Muy pronto";
      $("#rxHint").textContent = "Espera a que se ponga verde";
      setTimeout(() => this.siguiente(), 800);
      return;
    }
    const ms = Date.now() - this.verdeEn;
    this.tiempos.push(ms); this.hechas++; this.esperando = false;
    t.className = "rx-target rx-state-done"; t.textContent = ms + " ms";
    $("#rxHint").textContent = "¡Bien!";
    if (this.hechas >= this.rondas) setTimeout(() => this.fin(), 700);
    else setTimeout(() => this.siguiente(), 700);
  },
  fin() {
    const avg = this.tiempos.length ? Math.round(this.tiempos.reduce((a, b) => a + b, 0) / this.tiempos.length) : 0;
    const score = avg && avg < 320 ? 3 : avg < 460 ? 2 : avg < 650 ? 1 : 0;
    state.atencion = { avgMs: avg, score, intentos: this.tiempos.slice() };
    state.fase = "fin"; render();
  },
};
function renderReaccion() { RX.intro(); }

/* ---------- Cálculo del resultado (lo usa el panel de RH) ---------- */
var UMBRALES = { fortaleza: 0.75, promedio: 0.45, bandera: 0.45 };
function calcularResultado(resp, aten) {
  const dims = {};
  Object.keys(DIMENSIONES).forEach(d => { if (d !== "atencion") dims[d] = { sum: 0, max: 0 }; });
  Object.values(resp).forEach(r => { if (dims[r.dim] && !r.info) { dims[r.dim].sum += r.v; dims[r.dim].max += 3; } });
  const porDim = {};
  Object.keys(dims).forEach(d => {
    if (dims[d].max > 0) { const pct = dims[d].sum / dims[d].max; porDim[d] = { pct, nivel: nivelDim(pct) }; }
  });
  if (aten) porDim.atencion = { pct: aten.score / 3, nivel: nivelDim(aten.score / 3), avgMs: aten.avgMs };
  const vals = Object.values(porDim).map(x => x.pct);
  const global = vals.length ? vals.reduce((a, b) => a + b, 0) / vals.length : 0;
  const aciertos = Object.values(resp).filter(r => r.dim === "intelecto" && r.correcta).length;
  const banderas = CRITICAS.filter(d => porDim[d] && porDim[d].pct < UMBRALES.bandera);
  const rResp = Object.values(resp).filter(r => r.dim === "puesto" && !r.info);
  const rmax = rResp.length * 3, rsum = rResp.reduce((s, r) => s + r.v, 0);
  const puesto = rmax ? { pct: rsum / rmax, nivel: nivelDim(rsum / rmax), n: rResp.length } : null;
  return { porDim, global, aciertosIntelecto: aciertos, banderas, puesto };
}
function nivelDim(pct) { return pct >= UMBRALES.fortaleza ? "Fortaleza" : pct >= UMBRALES.promedio ? "Promedio" : "Área de oportunidad"; }

function calcularConfianza(resp) {
  const arr = Object.values(resp);
  // Velocidad: respuestas contestadas demasiado rápido (no abiertas)
  const conMs = arr.filter(r => typeof r.ms === "number" && !r.abierta);
  const UMBRAL = 1500;
  const rapidas = conMs.filter(r => r.ms < UMBRAL).length;
  const tiempos = conMs.map(r => r.ms).sort((a, b) => a - b);
  const medianaMs = tiempos.length ? tiempos[Math.floor(tiempos.length / 2)] : null;
  const calidad = conMs.length ? { rapidas, total: conMs.length, medianaMs, bandera: conMs.length >= 5 && (rapidas / conMs.length) >= 0.4 } : null;
  // Control de atención (trampas)
  const traps = arr.filter(r => r.esTrampa);
  const fallidas = traps.filter(r => !r.correctaTrampa).length;
  const control = traps.length ? { total: traps.length, fallidas, bandera: fallidas > 0 } : null;
  // Consistencia (preguntas espejo)
  let pares = 0, consistentes = 0;
  (typeof ESPEJOS !== "undefined" ? ESPEJOS : []).forEach(p => {
    const a = resp[p.a], b = resp[p.b];
    if (a && b && typeof a.v === "number" && typeof b.v === "number") {
      pares++;
      const objetivo = p.inverso ? (3 - b.v) : b.v;
      if (Math.abs(a.v - objetivo) <= 1) consistentes++;
    }
  });
  const consistencia = pares ? { pares, consistentes, pct: consistentes / pares, bandera: (consistentes / pares) < 0.5 } : null;
  return { calidad, control, consistencia };
}

/* ---------- Invitación por enlace + guardar progreso ---------- */
var PROG_KEY = "examenrh_progreso";
var FASES_EXAMEN = ["datos", "instrucciones", "examen", "reaccion"];
function invActual() { return window.__INV ? window.__INV.token : null; }
function guardarProgreso() {
  try {
    if (FASES_EXAMEN.indexOf(state.fase) < 0) return;
    localStorage.setItem(PROG_KEY, JSON.stringify({ ts: Date.now(), fase: state.fase, qIdx: state.qIdx, datos: state.datos, respuestas: state.respuestas, atencion: state.atencion, preguntas: state.preguntas, inv: invActual() }));
  } catch (e) {}
}
function limpiarProgreso() { try { localStorage.removeItem(PROG_KEY); } catch (e) {} }
function leerProgreso() { try { return JSON.parse(localStorage.getItem(PROG_KEY) || "null"); } catch (e) { return null; } }
function hayProgreso(invToken) {
  var p = leerProgreso();
  if (!p || FASES_EXAMEN.indexOf(p.fase) < 0) return null;
  if (Date.now() - (p.ts || 0) > 24 * 3600 * 1000) return null;
  if ((p.inv || "") !== (invToken || "")) return null;
  return p;
}
function restaurarProgreso(p) {
  state.fase = p.fase; state.qIdx = p.qIdx || 0; state.datos = p.datos || {};
  state.respuestas = p.respuestas || {}; state.atencion = p.atencion || null; state.preguntas = p.preguntas || null;
}
function parseInv() { try { return new URLSearchParams(location.search).get("inv"); } catch (e) { return null; } }
function arrancar(invToken) {
  var seguir = function () { var p = hayProgreso(invToken); if (p) return renderReanudar(p); render(); };
  if (invToken && invToken.indexOf("cf_") === 0) return arrancarFases(invToken);
  if (invToken) {
    window.Store.leerInvitacion(invToken).then(function (inv) {
      if (!inv) return seguir();
      if (inv.estado === "completada") return renderInvUsada();
      window.__INV = inv;
      if (inv.nombre) state.datos.nombre = inv.nombre;
      if (inv.puesto) state.datos.puesto = inv.puesto;
      seguir();
    }).catch(seguir);
  } else seguir();
}
function arrancarFases(token) {
  window.Store.leerCandidatoFases(token).then(function (cf) {
    if (!cf) return render();
    window.__CF = cf;
    if (cf.estado === "finalizado") return renderCFFin();
    var ba = cf.faseActual || 1, bc = cf.faseCompletada || 0;   // bloque actual / bloque completado
    state.datos = Object.assign({}, cf.datos || {});
    if (cf.nombre && !state.datos.nombre) state.datos.nombre = cf.nombre;
    if (cf.puesto && !state.datos.puesto) state.datos.puesto = cf.puesto;
    state.respuestas = Object.assign({}, cf.respuestas || {});
    state.atencion = cf.atencion || null;
    if (bc >= ba) return renderCFEspera(bc);   // ya hizo el bloque desbloqueado: espera autorización
    iniciarBloque(ba);
  }).catch(function () { render(); });
}
function iniciarBloque(b) {
  var fases = fasesDeBloque(b);
  var primera = fases.length ? fases[0] : b;
  if (primera <= 1) { render(); return; }   // bloque 1: bienvenida → datos → examen (corre fases 1 y 2)
  if (primera >= TOTAL_FASES) { state.fase = "reaccion"; state.qIdx = 0; render(); return; } // bloque solo de reacción
  // bloque 2+: ya tiene datos; construye el examen y salta a la intro de su primera fase
  state.preguntas = construirExamen(state.datos.puesto);
  var idx = state.preguntas.findIndex(function (x) { return x.__intro && x.fase === primera; });
  state.fase = "examen"; state.qIdx = (idx >= 0 ? idx : 0); render();
}
function renderCFEspera(bc) {
  setProgreso(0, "");
  $("#stage").innerHTML = `
    <div class="screen screen--center">
      <div class="welcome">
        <div class="welcome__badge">Parte ${bc} de ${TOTAL_BLOQUES} completada</div>
        <h1 class="welcome__title">Vas muy bien</h1>
        <p class="welcome__sub">Ya completaste esta parte. Nuestro equipo está revisando tus respuestas; en cuanto se habilite la siguiente podrás continuar desde este mismo enlace.</p>
        <p class="pausa-hint">Te avisaremos cuando esté lista.</p>
      </div>
    </div>`;
}
function renderCFFin() {
  setProgreso(0, "");
  $("#stage").innerHTML = `
    <div class="screen screen--center">
      <div class="welcome welcome--done">
        <div class="done-check"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"/></svg></div>
        <div class="welcome__badge">Evaluación completada</div>
        <h1 class="welcome__title">Ya completaste tu evaluación</h1>
        <p class="welcome__sub">Gracias por tu tiempo. Nuestro equipo revisará tus resultados y te contactará sobre los siguientes pasos.</p>
      </div>
    </div>`;
}
function renderCFTermino() {
  setProgreso(1, "");
  $("#stage").innerHTML = `
    <div class="screen screen--center">
      <div class="welcome welcome--done">
        <div class="done-check"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"/></svg></div>
        <div class="welcome__badge">Última fase completada</div>
        <h1 class="welcome__title">¡Terminaste toda la evaluación!</h1>
        <p class="welcome__sub">Gracias por tu tiempo y dedicación. Nuestro equipo revisará tus resultados y te avisaremos sobre los siguientes pasos del proceso.</p>
      </div>
    </div>`;
}
function renderReanudar(p) {
  var reales = (p.preguntas || []).filter(x => !x.__intro);
  var pos = Math.min((p.preguntas || []).slice(0, p.qIdx || 0).filter(x => !x.__intro).length + 1, reales.length);
  var ctx = (p.fase === "examen" && reales.length) ? `Vas en la pregunta ${pos} de ${reales.length}.` : "Dejaste un examen a medias.";
  if (p.datos && p.datos.puesto) ctx = `Puesto: ${p.datos.puesto}. ` + ctx;
  $("#stage").innerHTML = `
    <div class="screen screen--center">
      <div class="welcome">
        <div class="welcome__badge">Examen sin terminar</div>
        <h1 class="welcome__title">¿Continuamos donde lo dejaste?</h1>
        <p class="welcome__sub">${ctx}</p>
        <button class="btn btn--xl btn--primary" id="resumeGo">Continuar</button>
        <button class="btn btn--ghost" id="resumeNew" style="margin-top:10px">Empezar de nuevo</button>
      </div>
    </div>`;
  $("#resumeGo").addEventListener("click", () => { restaurarProgreso(p); render(); });
  $("#resumeNew").addEventListener("click", () => { limpiarProgreso(); state.fase = "bienvenida"; state.qIdx = 0; state.respuestas = {}; state.atencion = null; state.preguntas = null; if (!(window.__INV && window.__INV.nombre)) state.datos = {}; render(); });
}
function renderInvUsada() {
  $("#stage").innerHTML = `
    <div class="screen screen--center">
      <div class="welcome">
        <div class="welcome__badge">Enlace utilizado</div>
        <h1 class="welcome__title">Este enlace ya fue usado</h1>
        <p class="welcome__sub">Esta invitación ya se completó. Si crees que es un error, contacta a Recursos Humanos.</p>
      </div>
    </div>`;
}

function guardarAspirante() {
  const resultado = calcularResultado(state.respuestas, state.atencion);
  Object.assign(resultado, calcularConfianza(state.respuestas));
  const invTok = window.__INV ? window.__INV.token : null;
  const registro = { id: "asp" + Date.now(), fecha: new Date().toISOString(), datos: state.datos, respuestas: state.respuestas, atencion: state.atencion, resultado, consentimiento: { aceptado: true, fecha: new Date().toISOString(), version: CONFIG.avisoVersion, responsable: CONFIG.avisoResponsable }, invitacion: invTok };
  const intento = function () { return window.Store.guardarAspirante(registro); };
  intento().catch(function () { return new Promise(function (r) { setTimeout(r, 1500); }).then(intento); })
    .catch(function (e) {
      console.warn("No se pudo guardar el aspirante:", e && e.message);
      var av = document.getElementById("finWarn");
      if (av) av.hidden = false;
    });
  if (invTok) window.Store.completarInvitacion(invTok, registro.id).catch(function () {});
  limpiarProgreso();
  return registro;
}

function renderFin() {
  setProgreso(1, "");
  if (window.__CF) { finalizarCF(); return renderCFTermino(); }
  guardarAspirante();
  $("#stage").innerHTML = `
    <div class="screen screen--center">
      <div class="welcome welcome--done">
        <div class="done-check"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"/></svg></div>
        <h1 class="welcome__title">${CONFIG.mensajeFinTitulo}</h1>
        <p class="welcome__sub">${CONFIG.mensajeFinCuerpo}</p>
        <p class="form-error" id="finWarn" hidden>No pudimos enviar tus respuestas. Por favor avísale a quien aplica el examen antes de cerrar.</p>
      </div>
    </div>`;
  // Popup de confirmación
  const ov = document.createElement("div");
  ov.className = "modal-overlay";
  ov.innerHTML = `
    <div class="modal" role="dialog" aria-modal="true">
      <div class="modal__icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><path d="M22 4 12 14.01l-3-3"/></svg></div>
      <h3>${CONFIG.mensajeFinTitulo}</h3>
      <p>${CONFIG.mensajeFinCuerpo}</p>
      <button class="btn btn--primary btn--lg" id="finOk">Entendido</button>
    </div>`;
  document.body.appendChild(ov);
  requestAnimationFrame(() => ov.classList.add("is-on"));
  $("#finOk", ov).addEventListener("click", () => {
    ov.classList.remove("is-on"); setTimeout(() => ov.remove(), 220);
    limpiarProgreso(); window.__INV = null;
    state.fase = "bienvenida"; state.qIdx = 0; state.datos = {}; state.respuestas = {}; state.atencion = null; state.preguntas = null;
    render();
  });
}

/* ---------- Tema ---------- */
function applyTheme(t) {
  document.documentElement.setAttribute("data-theme", t);
  $("#iconMoon").style.display = t === "dark" ? "none" : "block";
  $("#iconSun").style.display = t === "dark" ? "block" : "none";
  try { localStorage.setItem("examenrh-theme", t); } catch (e) {}
}

document.addEventListener("DOMContentLoaded", () => {
  try { applyTheme(localStorage.getItem("examenrh-theme") || "light"); } catch (e) { applyTheme("light"); }
  // Carga de datos remotos. Defensiva: si falta un método (deploy a medias) o
  // una llamada truena, NO debe cortar el arranque (botones + examen).
  function _cargar(metodo, aplica) {
    try { if (window.Store && typeof window.Store[metodo] === "function") window.Store[metodo]().then(aplica).catch(function () {}); } catch (e) {}
  }
  // Config (mensaje final + puestos) desde Firebase o localStorage
  _cargar("leerConfig", function (cfg) {
    if (!cfg) return;
    if (cfg.mensajeFinTitulo) CONFIG.mensajeFinTitulo = cfg.mensajeFinTitulo;
    if (cfg.mensajeFinCuerpo) CONFIG.mensajeFinCuerpo = cfg.mensajeFinCuerpo;
    if (cfg.avisoResponsable) CONFIG.avisoResponsable = cfg.avisoResponsable;
    if (cfg.avisoContacto) CONFIG.avisoContacto = cfg.avisoContacto;
    if (Array.isArray(cfg.puestos) && cfg.puestos.length) window.__PUESTOS_REMOTOS = cfg.puestos;
    if (cfg.umbrales) Object.assign(UMBRALES, cfg.umbrales);
    if (cfg.modoExamen) MODO_EXAMEN = cfg.modoExamen;
    if (cfg.marca) { aplicarMarca(cfg.marca); if (state.fase === "bienvenida") render(); }
  });
  _cargar("leerPreguntas", function (lista) { if (Array.isArray(lista) && lista.length) window.__PREGUNTAS_REMOTAS = lista; });
  _cargar("leerPreguntasFases", function (lista) { if (Array.isArray(lista) && lista.length) window.__PREGUNTAS_FASES_REMOTAS = lista; });
  const _th = $("#themeBtn"); if (_th) _th.addEventListener("click", () => applyTheme(document.documentElement.getAttribute("data-theme") === "dark" ? "light" : "dark"));
  const _rh = $("#rhAccess"); if (_rh) _rh.addEventListener("click", function () { window.location.href = "panel.html"; });
  document.addEventListener("click", () => $$(".datepick").forEach(d => d.classList.remove("is-open")));
  window.addEventListener("beforeunload", guardarProgreso);
  arrancar(parseInv());
});
