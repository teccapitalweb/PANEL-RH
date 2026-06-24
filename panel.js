(function (PREGUNTAS, DIMENSIONES, NIVEL_DIM, CRITICAS, CONFIG, RH_PASS, PUESTOS, PREGUNTAS_PUESTO) {
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
  Object.keys(dims).forEach(d => { if (dims[d].max > 0) { const pct = dims[d].sum / dims[d].max; porDim[d] = { pct, nivel: nivelDimObj(pct).label }; } });
  if (aten) porDim.atencion = { pct: aten.score / 3, nivel: nivelDimObj(aten.score / 3).label, avgMs: aten.avgMs };
  const vals = Object.values(porDim).map(x => x.pct);
  const global = vals.length ? vals.reduce((a, b) => a + b, 0) / vals.length : 0;
  const aciertos = Object.values(resp).filter(r => r.dim === "intelecto" && r.correcta).length;
  const banderas = CRITICAS.filter(d => porDim[d] && porDim[d].pct < 0.45);
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
  resultado.control = (b.conf && b.conf.control) || { total: 2, fallidas: 0, bandera: false };
  resultado.consistencia = (b.conf && b.conf.consistencia) || { pares: 2, consistentes: 2, pct: 1, bandera: false };
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
    { nombre: "Luis Ángel Torres", puesto: "Almacén", target: 1, generico: true, ms: 620, fecha: fdRel(-4), decision: "descartar", conf: { calidad: { rapidas: 19, total: 30, medianaMs: 680, bandera: true }, control: { total: 2, fallidas: 1, bandera: true }, consistencia: { pares: 2, consistentes: 0, pct: 0, bandera: true } } },
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
      arr.forEach(function (a) { if (evals[a.id]) { a.decision = evals[a.id].decision || ""; a.notas = evals[a.id].notas || ""; } });
    }
    return { arr: arr, demo: demo };
  });
}
function guardarEval(id, decision, notas) { window.Store.guardarEval(id, { decision: decision, notas: notas }).catch(function () {}); }
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
  $("#wrap").innerHTML = '<div class="page-head"><p style="color:var(--muted)">Cargando aspirantes…</p></div>';
  cargar().then(function (d) { state.aspirantes = d.arr; state.demo = d.demo; _renderAppUI(); })
    .catch(function () { $("#wrap").innerHTML = '<div class="page-head"><p>No se pudieron cargar los aspirantes.</p></div>'; });
}
function _renderAppUI() {
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
  const fuertes = desc.filter(x => x.pct >= 0.75).slice(0, 2);
  const debiles = desc.filter(x => x.pct < 0.45).sort((x, y) => x.pct - y.pct);
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
  if (a.decision === "contratar") S.push("RH marcó este perfil como candidato a contratar.");
  else if (a.decision === "descartar") S.push("RH marcó este perfil para descartar.");
  else if (a.decision === "revision") S.push("RH dejó este perfil en revisión.");
  else S.push("Se recomienda validar en entrevista las áreas señaladas antes de tomar una decisión.");

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
    decision: a.decision ? DEC[a.decision].t : null,
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
  const dec = a.decision
    ? `<span class="pr-dec pr-dec--${DEC[a.decision].cls}">${DEC[a.decision].t}</span>`
    : `<span class="pr-dec pr-dec--none">Sin decisión registrada</span>`;
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

    <div class="pr-sec">Decisión de Recursos Humanos</div>
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
  $("#drResumen").addEventListener("click", () => abrirResumenIA(a));
  $("#drPDF").addEventListener("click", () => exportarReportePDF(a));
  $("#drawerOverlay").addEventListener("click", cerrar);
  $$("#drawer .dec-btn").forEach(b => b.addEventListener("click", () => {
    const k = b.dataset.d; a.decision = a.decision === k ? "" : k;
    $$("#drawer .dec-btn").forEach(x => x.classList.toggle("is-on", x.dataset.d === a.decision));
    guardarEval(a.id, a.decision, a.notas); pintarFilas();
  }));
  $("#drNotas").addEventListener("input", e => { a.notas = e.target.value; guardarEval(a.id, a.decision, a.notas); });
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
      <div class="sec-title" style="margin-top:0">Puestos del examen</div>
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
  $("#cfgSave", ov).addEventListener("click", () => {
    const tit = $("#cfgTit", ov).value.trim(), cue = $("#cfgCue", ov).value.trim();
    const resp = $("#cfgResp", ov).value.trim(), cont = $("#cfgCont", ov).value.trim();
    if (!pl.length) { $("#cfgErr", ov).textContent = "Deja al menos un puesto."; return; }
    if (!tit || !cue) { $("#cfgErr", ov).textContent = "El título y el mensaje no pueden quedar vacíos."; return; }
    window.Store.guardarConfig({ mensajeFinTitulo: tit, mensajeFinCuerpo: cue, puestos: pl, avisoResponsable: resp, avisoContacto: cont })
      .then(function () { close(); toast("Configuración guardada."); })
      .catch(function () { $("#cfgErr", ov).textContent = "No se pudo guardar."; });
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
