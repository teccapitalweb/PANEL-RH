(function (PREGUNTAS, DIMENSIONES, NIVEL_DIM, CRITICAS, CONFIG, RH_PASS) {
/* =====================================================================
   panel.js — Panel privado de Recursos Humanos
   Lee los aspirantes guardados por el kiosko (mismo origen / Firestore).
   En este preview no hay datos reales, así que genera ejemplos.
   ===================================================================== */

const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const MESES = ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic"];
const fechaLarga = iso => { if (!iso) return "—"; const [y, m, d] = iso.split("-").map(Number); return `${d} ${MESES[m - 1]} ${y}`; };
const initials = n => n.split(" ").slice(0, 2).map(w => w[0]).join("").toUpperCase();
const pct100 = p => Math.round(p * 100);
const fdRel = n => { const d = new Date(); d.setDate(d.getDate() + n); const z = x => String(x).padStart(2, "0"); return `${d.getFullYear()}-${z(d.getMonth() + 1)}-${z(d.getDate())}`; };

/* ---------- Calificación (igual que el kiosko) ---------- */
function nivelDimObj(pct) { return NIVEL_DIM.find(n => pct >= n.min) || NIVEL_DIM[NIVEL_DIM.length - 1]; }
function clsDePct(pct) { return nivelDimObj(pct).cls; }
function calcularResultado(resp, aten) {
  const dims = {};
  Object.keys(DIMENSIONES).forEach(d => { if (d !== "atencion") dims[d] = { sum: 0, max: 0 }; });
  Object.values(resp).forEach(r => { if (dims[r.dim] && !r.info) { dims[r.dim].sum += r.v; dims[r.dim].max += 3; } });
  const porDim = {};
  Object.keys(dims).forEach(d => { const pct = dims[d].max ? dims[d].sum / dims[d].max : 0; porDim[d] = { pct, nivel: nivelDimObj(pct).label }; });
  if (aten) porDim.atencion = { pct: aten.score / 3, nivel: nivelDimObj(aten.score / 3).label, avgMs: aten.avgMs };
  const vals = Object.values(porDim).map(x => x.pct);
  const global = vals.length ? vals.reduce((a, b) => a + b, 0) / vals.length : 0;
  const aciertos = Object.values(resp).filter(r => r.dim === "intelecto" && r.correcta).length;
  const banderas = CRITICAS.filter(d => porDim[d] && porDim[d].pct < 0.45);
  return { porDim, global, aciertosIntelecto: aciertos, banderas };
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
  const atencion = { avgMs: b.ms, score: b.ms < 320 ? 3 : b.ms < 460 ? 2 : b.ms < 650 ? 1 : 0, intentos: [b.ms - 18, b.ms + 22, b.ms, b.ms + 9, b.ms - 7] };
  const resultado = calcularResultado(respuestas, atencion);
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
    { nombre: "Luis Ángel Torres", puesto: "Almacén", target: 1, generico: true, ms: 620, fecha: fdRel(-4), decision: "descartar" },
  ];
  window.__seed = base.map((b, i) => genAspirante(b, i));
  return window.__seed;
}

/* ---------- Carga / persistencia ---------- */
function cargar() {
  let arr = [];
  try { arr = JSON.parse(localStorage.getItem("examenrh_aspirantes") || "[]"); } catch (e) {}
  let demo = false;
  if (!arr.length) { arr = SEED().map(a => ({ ...a })); demo = true; }
  let evals = {}; try { evals = JSON.parse(localStorage.getItem("examenrh_eval") || "{}"); } catch (e) {}
  arr.forEach(a => { if (evals[a.id]) { a.decision = evals[a.id].decision || ""; a.notas = evals[a.id].notas || ""; } });
  return { arr, demo };
}
function guardarEval(id, decision, notas) {
  let evals = {}; try { evals = JSON.parse(localStorage.getItem("examenrh_eval") || "{}"); } catch (e) {}
  evals[id] = { decision, notas }; try { localStorage.setItem("examenrh_eval", JSON.stringify(evals)); } catch (e) {}
}
function configActual() {
  let c = null; try { c = JSON.parse(localStorage.getItem("examenrh_config") || "null"); } catch (e) {}
  return { titulo: (c && c.mensajeFinTitulo) || CONFIG.mensajeFinTitulo, cuerpo: (c && c.mensajeFinCuerpo) || CONFIG.mensajeFinCuerpo };
}

/* ---------- Estado ---------- */
const state = { aspirantes: [], demo: false, busqueda: "", puesto: "Todos", orden: "score" };
const DEC = { contratar: { t: "Contratar", cls: "ok" }, revision: { t: "En revisión", cls: "warn" }, descartar: { t: "Descartar", cls: "bad" } };

function toast(msg) { const t = document.createElement("div"); t.className = "toast"; t.textContent = msg; document.body.appendChild(t); requestAnimationFrame(() => t.classList.add("is-on")); setTimeout(() => { t.classList.remove("is-on"); setTimeout(() => t.remove(), 300); }, 2400); }

/* ---------- Lista ---------- */
function renderApp() {
  const d = cargar(); state.aspirantes = d.arr; state.demo = d.demo;
  const puestos = ["Todos", ...[...new Set(state.aspirantes.map(a => a.datos.puesto))].sort()];
  $("#wrap").innerHTML = `
    <div class="page-head">
      <h1>Aspirantes</h1>
      <p>Resultados de la evaluación de ingreso. Toca un aspirante para ver su detalle.</p>
      ${state.demo ? `<div class="demo-note"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4M12 8h.01"/></svg>Datos de ejemplo · cuando conectes el kiosko aparecerán aquí los aspirantes reales</div>` : ""}
    </div>
    <div class="toolbar">
      <div class="search"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg><input class="input" id="q" placeholder="Buscar por nombre…" value="${state.busqueda}"></div>
      <div class="sel"><select id="fPuesto">${puestos.map(p => `<option ${p === state.puesto ? "selected" : ""}>${p}</option>`).join("")}</select><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m6 9 6 6 6-6"/></svg></div>
      <div class="sel"><select id="fOrden">
        <option value="score" ${state.orden === "score" ? "selected" : ""}>Mejor puntaje</option>
        <option value="fecha" ${state.orden === "fecha" ? "selected" : ""}>Más recientes</option>
        <option value="nombre" ${state.orden === "nombre" ? "selected" : ""}>Nombre (A-Z)</option>
      </select><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m6 9 6 6 6-6"/></svg></div>
      <span class="tb-count" id="cnt"></span>
    </div>
    <div class="card"><div class="table-wrap"><table>
      <thead><tr><th>#</th><th>Aspirante</th><th>Puesto</th><th>Fecha</th><th>Puntaje</th><th>Señales</th></tr></thead>
      <tbody id="filas"></tbody></table></div></div>`;
  $("#q").addEventListener("input", e => { state.busqueda = e.target.value; pintarFilas(); });
  $("#fPuesto").addEventListener("change", e => { state.puesto = e.target.value; pintarFilas(); });
  $("#fOrden").addEventListener("change", e => { state.orden = e.target.value; pintarFilas(); });
  pintarFilas();
}
function listaFiltrada() {
  let arr = state.aspirantes.filter(a => (state.puesto === "Todos" || a.datos.puesto === state.puesto) && a.datos.nombre.toLowerCase().includes(state.busqueda.toLowerCase()));
  if (state.orden === "score") arr.sort((a, b) => b.resultado.global - a.resultado.global);
  else if (state.orden === "fecha") arr.sort((a, b) => a.fecha < b.fecha ? 1 : -1);
  else arr.sort((a, b) => a.datos.nombre.localeCompare(b.datos.nombre));
  return arr;
}
function pintarFilas() {
  const arr = listaFiltrada();
  $("#cnt").textContent = `${arr.length} aspirante${arr.length === 1 ? "" : "s"}`;
  $("#filas").innerHTML = arr.length ? arr.map((a, i) => {
    const g = a.resultado.global; const cls = clsDePct(g);
    const dec = a.decision ? `<span class="badge badge--${DEC[a.decision].cls}">${DEC[a.decision].t}</span>` : "";
    const flags = a.resultado.banderas.length ? `<span class="flag"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"/><path d="M4 22v-7"/></svg>${a.resultado.banderas.length}</span>` : "";
    return `<tr data-id="${a.id}">
      <td>${state.orden === "score" ? `<span class="rank">${i + 1}</span>` : ""}</td>
      <td><div class="cell-name">${a.datos.nombre}</div><div class="cell-sub">${a.datos.escolaridad || ""}</div></td>
      <td>${a.datos.puesto}</td>
      <td>${fechaLarga(a.fecha)}</td>
      <td><span class="score-chip"><span class="dot dot--${cls}"></span><span class="score-num">${pct100(g)}</span></span></td>
      <td>${flags} ${dec}</td>
    </tr>`;
  }).join("") : `<tr><td colspan="6" class="muted-empty">No hay aspirantes con ese filtro.</td></tr>`;
  $$("#filas tr[data-id]").forEach(tr => tr.addEventListener("click", () => abrirDetalle(tr.dataset.id)));
}

/* ---------- Detalle ---------- */
function abrirDetalle(id) {
  const a = state.aspirantes.find(x => x.id === id); if (!a) return;
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
  ].filter(r => r[1]).map(r => `<div class="d-row"><span class="d-row__k">${r[0]}</span><span class="d-row__v">${r[1]}</span></div>`).join("");

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

  $("#drawer").innerHTML = `
    <div class="drawer__head">
      <div><div class="drawer__name">${a.datos.nombre}</div><div class="drawer__role">${a.datos.puesto} · ${fechaLarga(a.fecha)}</div></div>
      <button class="icon-btn" id="drClose" aria-label="Cerrar"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18M6 6l12 12"/></svg></button>
    </div>
    <div class="drawer__body">
      <div class="score-hero">
        <div class="score-big score-big--${gcls}">${pct100(g)}</div>
        <div class="score-hero__meta">
          <div class="score-hero__lbl">Puntaje global</div>
          <div class="score-hero__nivel">${nivelDimObj(g).label}</div>
          <div class="flags-row">${a.resultado.banderas.length ? a.resultado.banderas.map(d => `<span class="flag"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"/></svg>${DIMENSIONES[d]} baja</span>`).join("") : `<span class="badge badge--ok">Sin banderas</span>`}</div>
        </div>
      </div>

      <div class="sec-title">Contacto y perfil</div>
      ${contacto}

      <div class="sec-title">Calificación por dimensión</div>
      ${dims}
      <div class="d-row"><span class="d-row__k">Aciertos de intelecto</span><span class="d-row__v">${a.resultado.aciertosIntelecto} de 3</span></div>
      <div class="d-row"><span class="d-row__k">Reacción promedio</span><span class="d-row__v"><span class="dot dot--${atCls}"></span> ${at.avgMs || "—"} ms</span></div>

      <div class="sec-title">Entrevista (evalúa tú)</div>
      ${abiertas}

      <div class="sec-title">Respuestas y porqués</div>
      ${botones}

      <div class="sec-title">Decisión</div>
      <div class="dec-grid">
        ${Object.keys(DEC).map(k => `<button class="dec-btn ${a.decision === k ? "is-on" : ""}" data-d="${k}">${DEC[k].t}</button>`).join("")}
      </div>
      <div class="field" style="margin-top:12px"><label class="field__label">Notas de RH</label><textarea class="input" id="drNotas" rows="3" placeholder="Observaciones…">${a.notas || ""}</textarea></div>
    </div>`;

  $("#drawerOverlay").classList.add("is-on");
  $("#drawer").classList.add("is-on");
  const cerrar = () => { $("#drawerOverlay").classList.remove("is-on"); $("#drawer").classList.remove("is-on"); };
  $("#drClose").addEventListener("click", cerrar);
  $("#drawerOverlay").addEventListener("click", cerrar);
  $$("#drawer .dec-btn").forEach(b => b.addEventListener("click", () => {
    const k = b.dataset.d; a.decision = a.decision === k ? "" : k;
    $$("#drawer .dec-btn").forEach(x => x.classList.toggle("is-on", x.dataset.d === a.decision));
    guardarEval(a.id, a.decision, a.notas); pintarFilas();
  }));
  $("#drNotas").addEventListener("input", e => { a.notas = e.target.value; guardarEval(a.id, a.decision, a.notas); });
}

/* ---------- Configuración (texto del popup) ---------- */
function abrirConfig() {
  const c = configActual();
  const ov = document.createElement("div"); ov.className = "modal-overlay";
  ov.innerHTML = `<div class="modal">
    <div class="modal__head"><h3>Mensaje final del examen</h3><button class="icon-btn" data-x><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18M6 6l12 12"/></svg></button></div>
    <div class="modal__body">
      <p style="color:var(--muted);font-size:.86rem;margin-bottom:16px">Esto es lo que ve el aspirante al terminar. Se guarda y el kiosko lo toma.</p>
      <div class="field"><label class="field__label">Título</label><input class="input" id="cfgTit" value="${c.titulo.replace(/"/g, "&quot;")}"></div>
      <div class="field"><label class="field__label">Mensaje</label><textarea class="input" id="cfgCue" rows="4">${c.cuerpo}</textarea></div>
    </div>
    <div class="modal__foot"><button class="btn btn--ghost" data-x>Cancelar</button><button class="btn btn--primary" id="cfgSave">Guardar</button></div>
  </div>`;
  document.body.appendChild(ov); requestAnimationFrame(() => ov.classList.add("is-on"));
  const close = () => { ov.classList.remove("is-on"); setTimeout(() => ov.remove(), 220); };
  $$("[data-x]", ov).forEach(b => b.addEventListener("click", close));
  ov.addEventListener("click", e => { if (e.target === ov) close(); });
  $("#cfgSave", ov).addEventListener("click", () => {
    const tit = $("#cfgTit", ov).value.trim(), cue = $("#cfgCue", ov).value.trim();
    if (!tit || !cue) return;
    try { localStorage.setItem("examenrh_config", JSON.stringify({ mensajeFinTitulo: tit, mensajeFinCuerpo: cue })); } catch (e) {}
    // TODO firebase: setDoc(doc(db,"config","evaluacion"), {...}) para que el kiosko lo lea
    close(); toast("Mensaje actualizado.");
  });
}

/* ---------- Tema / login ---------- */
function applyTheme(t) {
  document.documentElement.setAttribute("data-theme", t);
  $("#iconMoon").style.display = t === "dark" ? "none" : "block";
  $("#iconSun").style.display = t === "dark" ? "block" : "none";
  try { localStorage.setItem("examenrh-theme", t); } catch (e) {}
}
function bootApp() { $("#login").style.display = "none"; $("#app").classList.add("is-on"); $("#hdrName").textContent = "Recursos Humanos"; renderApp(); }

document.addEventListener("DOMContentLoaded", () => {
  try { applyTheme(localStorage.getItem("examenrh-theme") || "light"); } catch (e) { applyTheme("light"); }
  let yaOk = false; try { yaOk = sessionStorage.getItem("examenrh_rh_ok") === "1"; } catch (e) {}
  if (yaOk) bootApp();
  const entrar = () => {
    if ($("#pw").value === RH_PASS) { try { sessionStorage.setItem("examenrh_rh_ok", "1"); } catch (e) {} bootApp(); }
    else { $("#loginHint").textContent = "Contraseña incorrecta."; $("#pw").value = ""; $("#pw").focus(); }
  };
  $("#entrarBtn").addEventListener("click", entrar);
  $("#pw").addEventListener("keydown", e => { if (e.key === "Enter") entrar(); });
  $("#themeBtn").addEventListener("click", () => applyTheme(document.documentElement.getAttribute("data-theme") === "dark" ? "light" : "dark"));
  $("#logoutBtn").addEventListener("click", () => { try { sessionStorage.removeItem("examenrh_rh_ok"); } catch (e) {} $("#app").classList.remove("is-on"); $("#login").style.display = "grid"; const p = $("#pw"); if (p) { p.value = ""; p.focus(); } });
  $("#cfgBtn").addEventListener("click", abrirConfig);
});
})(window.__EVAL.PREGUNTAS, window.__EVAL.DIMENSIONES, window.__EVAL.NIVEL_DIM, window.__EVAL.CRITICAS, window.__EVAL.CONFIG, window.__EVAL.RH_PASS);
