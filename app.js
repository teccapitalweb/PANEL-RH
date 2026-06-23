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

function renderBienvenida() {
  setProgreso(0, "");
  $("#stage").innerHTML = `
    <div class="screen screen--center">
      <div class="welcome">
        <div class="welcome__mark"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M9 11l3 3 8-8"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg></div>
        <h1 class="welcome__title">${CONFIG.titulo}</h1>
        <p class="welcome__sub">Bienvenido(a). Esta evaluación toma alrededor de 10 minutos. Solo toca la opción que mejor te describa — la mayoría de preguntas no tienen respuesta correcta o incorrecta.</p>
        <button class="btn btn--xl btn--primary" id="goStart">Comenzar</button>
        <p class="welcome__foot">${CONFIG.empresa} · Recursos Humanos</p>
      </div>
    </div>`;
  $("#goStart").addEventListener("click", () => { state.fase = "datos"; render(); });
}

function renderDatos() {
  setProgreso(0.05, "Tus datos");
  const d = state.datos;
  const chips = (name, arr, val) => `<div class="choices" data-name="${name}">${arr.map(o => `<button type="button" class="choice ${val === o ? "is-sel" : ""}" data-v="${o}">${o}</button>`).join("")}</div>`;
  $("#stage").innerHTML = `
    <div class="screen">
      <div class="k-head"><h2>Cuéntanos de ti</h2><p>Usaremos estos datos solo para contactarte.</p></div>
      <div class="form">
        <div class="field"><label class="field__label">Nombre completo *</label><input class="input" id="fNombre" value="${d.nombre || ""}" placeholder="Tu nombre"></div>
        <div class="form-grid">
          <div class="field"><label class="field__label">Teléfono *</label><input class="input" id="fTel" inputmode="numeric" value="${d.tel || ""}" placeholder="10 dígitos"></div>
          <div class="field"><label class="field__label">Correo *</label><input class="input" id="fMail" type="email" value="${d.correo || ""}" placeholder="tu@correo.com"></div>
        </div>
        <div class="field"><label class="field__label">CURP</label><input class="input" id="fCurp" value="${d.curp || ""}" placeholder="Opcional" maxlength="18" style="text-transform:uppercase"></div>
        <div class="field"><label class="field__label">Fecha de nacimiento</label>${datepickHTML("fNac", d.nacimiento, "2000-01")}</div>
        <div class="field"><label class="field__label">Género</label>${chips("genero", GENEROS, d.genero)}</div>
        <div class="field"><label class="field__label">Escolaridad</label>${chips("escolaridad", ESCOLARIDAD, d.escolaridad)}</div>
        <div class="field"><label class="field__label">Puesto al que aspiras *</label>${chips("puesto", PUESTOS, d.puesto)}</div>
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
  })));
  $("#dBack").addEventListener("click", () => { state.fase = "bienvenida"; render(); });
  $("#dNext").addEventListener("click", () => {
    const get = n => { const g = $(`.choices[data-name='${n}'] .choice.is-sel`); return g ? g.dataset.v : ""; };
    const nombre = $("#fNombre").value.trim(), tel = soloDigitos($("#fTel").value), correo = $("#fMail").value.trim();
    const puesto = get("puesto");
    if (!nombre) return err("Escribe tu nombre completo.");
    if (tel.length < 10) return err("El teléfono debe tener 10 dígitos.");
    if (!esEmail(correo)) return err("Escribe un correo válido.");
    if (!puesto) return err("Elige el puesto al que aspiras.");
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
  $("#goExam").addEventListener("click", () => { state.fase = "examen"; state.qIdx = 0; render(); });
}

function renderPregunta() {
  const total = PREGUNTAS.length;
  const q = PREGUNTAS[state.qIdx];
  const tag = q.tag || DIMENSIONES[q.dim] || "";
  setProgreso((state.qIdx + 1) / (total + 1), `Pregunta ${state.qIdx + 1} de ${total}`);
  const prev = state.respuestas[q.id];
  if (q.tipo === "abierta") return renderAbierta(q, tag, prev);
  $("#stage").innerHTML = `
    <div class="screen">
      <div class="q-tag">${tag}</div>
      <div class="q-text">${q.texto}</div>
      <div class="optgrid">
        ${q.opciones.map((o, i) => `<button type="button" class="opt ${prev && prev.optIdx === i ? "is-sel" : ""}" data-i="${i}">
          <span class="opt__dot"></span><span class="opt__t">${o.t}</span></button>`).join("")}
      </div>
      <div class="porque" id="porqueBox" ${prev ? "" : "hidden"}>
        <label class="porque__label" for="porqueTA">¿Por qué elegiste esa respuesta?</label>
        <textarea class="input porque__ta" id="porqueTA" rows="3" placeholder="Cuéntanos en pocas palabras (opcional).">${prev && prev.porque ? prev.porque : ""}</textarea>
      </div>
      <div class="k-actions">
        <button class="btn btn--ghost" id="qBack">${state.qIdx === 0 ? "Atrás" : "Anterior"}</button>
        <button class="btn btn--primary btn--lg" id="qNext" ${prev ? "" : "hidden"}>Continuar</button>
        <span class="q-hint" id="qHint" ${prev ? "hidden" : ""}>Toca una opción para responder</span>
      </div>
    </div>`;
  const mostrarPorque = () => { $("#porqueBox").hidden = false; $("#qNext").hidden = false; $("#qHint").hidden = true; };
  $$("#stage .opt").forEach(b => b.addEventListener("click", () => {
    $$("#stage .opt").forEach(x => x.classList.toggle("is-sel", x === b));
    mostrarPorque();
    const ta = $("#porqueTA"); if (ta) ta.focus();
  }));
  $("#qNext").addEventListener("click", () => {
    const sel = $("#stage .opt.is-sel"); if (!sel) return;
    const i = Number(sel.dataset.i);
    state.respuestas[q.id] = { optIdx: i, v: q.opciones[i].v, dim: q.dim, correcta: !!q.opciones[i].correcta, info: !!q.info, porque: $("#porqueTA").value.trim() };
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
    state.respuestas[q.id] = { tipo: "abierta", texto: t, dim: q.dim, tag, abierta: true };
    avanzarPregunta();
  });
  $("#qBack").addEventListener("click", () => {
    if (state.qIdx === 0) { state.fase = "instrucciones"; render(); }
    else { state.qIdx--; render(); }
  });
}
function avanzarPregunta() {
  if (state.qIdx < PREGUNTAS.length - 1) { state.qIdx++; render(); }
  else { state.fase = "reaccion"; render(); }
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
function calcularResultado(resp, aten) {
  const dims = {};
  Object.keys(DIMENSIONES).forEach(d => { if (d !== "atencion") dims[d] = { sum: 0, max: 0 }; });
  Object.values(resp).forEach(r => { if (dims[r.dim] && !r.info) { dims[r.dim].sum += r.v; dims[r.dim].max += 3; } });
  const porDim = {};
  Object.keys(dims).forEach(d => {
    const pct = dims[d].max ? dims[d].sum / dims[d].max : 0;
    porDim[d] = { pct, nivel: nivelDim(pct) };
  });
  if (aten) porDim.atencion = { pct: aten.score / 3, nivel: nivelDim(aten.score / 3), avgMs: aten.avgMs };
  const vals = Object.values(porDim).map(x => x.pct);
  const global = vals.length ? vals.reduce((a, b) => a + b, 0) / vals.length : 0;
  const aciertos = Object.values(resp).filter(r => r.dim === "intelecto" && r.correcta).length;
  const banderas = CRITICAS.filter(d => porDim[d] && porDim[d].pct < 0.45);
  return { porDim, global, aciertosIntelecto: aciertos, banderas };
}
function nivelDim(pct) { return (NIVEL_DIM.find(n => pct >= n.min) || NIVEL_DIM[NIVEL_DIM.length - 1]).label; }

function guardarAspirante() {
  const resultado = calcularResultado(state.respuestas, state.atencion);
  const registro = { id: "asp" + Date.now(), fecha: new Date().toISOString(), datos: state.datos, respuestas: state.respuestas, atencion: state.atencion, resultado };
  try {
    const k = "examenrh_aspirantes";
    const arr = JSON.parse(localStorage.getItem(k) || "[]");
    arr.push(registro); localStorage.setItem(k, JSON.stringify(arr));
  } catch (e) {}
  // TODO firebase: addDoc(collection(db,"aspirantes"), registro) → aparece en el panel de RH
  return registro;
}

function renderFin() {
  setProgreso(1, "");
  guardarAspirante();
  $("#stage").innerHTML = `
    <div class="screen screen--center">
      <div class="welcome welcome--done">
        <div class="done-check"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"/></svg></div>
        <h1 class="welcome__title">${CONFIG.mensajeFinTitulo}</h1>
        <p class="welcome__sub">${CONFIG.mensajeFinCuerpo}</p>
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
    state.fase = "bienvenida"; state.qIdx = 0; state.datos = {}; state.respuestas = {}; state.atencion = null;
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
  $("#themeBtn").addEventListener("click", () => applyTheme(document.documentElement.getAttribute("data-theme") === "dark" ? "light" : "dark"));
  document.addEventListener("click", () => $$(".datepick").forEach(d => d.classList.remove("is-open")));
  render();
});
