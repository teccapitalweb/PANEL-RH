/* =====================================================================
   app.js — Panel RH
   Modo DEMO (sin Firebase). Las capas AUTH y DATA están aisladas para
   que conectar Firebase sea cambiar `modo` y rellenar los TODO.
   ===================================================================== */

/* ---------- Capa de autenticación ---------- */
const AUTH = {
  modo: "demo", // ← cambia a "firebase" cuando conectes firebase-config.js
  async login(email, pass) {
    if (this.modo === "demo") return { ok: true, user: { email } };
    // TODO firebase: return signInWithEmailAndPassword(auth, email, pass)
  },
  logout() {
    if (this.modo === "demo") return;
    // TODO firebase: signOut(auth)
  },
};

/* ---------- Capa de datos (multi-tenant) ---------- */
const DATA = {
  modo: "demo",
  empresas() {
    if (this.modo === "demo") return DEMO_EMPRESAS;
    // TODO firebase: getDocs(collection(db,"empresas"))
  },
  kpis(empresaId) {
    if (this.modo === "demo") return DEMO_KPIS[empresaId];
    // TODO firebase: agregaciones por empresa
  },
  colaboradores(empresaId) {
    if (this.modo === "demo") return DEMO_COLABORADORES.filter(c => c.empresaId === empresaId);
    // TODO firebase: query(collection(db,`empresas/${empresaId}/colaboradores`))
  },
  turnos(empresaId) {
    if (this.modo === "demo") return DEMO_TURNOS.filter(t => t.empresaId === empresaId);
    // TODO firebase: getDocs(collection(db,`empresas/${empresaId}/turnos`))
  },
  asistencia(empresaId) {
    if (this.modo === "demo") return LEDGER.eventos(empresaId);
    // TODO firebase: query(collection(db,`empresas/${empresaId}/eventos`))
  },
};

/* ---------- Estado ---------- */
const state = { empresa: DATA.empresas()[0], filtro: "Todos", busqueda: "" };

/* ---------- Helpers ---------- */
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];

const initials = n => n.split(" ").slice(0, 2).map(w => w[0]).join("").toUpperCase();

const MESES = ["ene","feb","mar","abr","may","jun","jul","ago","sep","oct","nov","dic"];
function fechaLarga(iso) {
  const [y, m, d] = iso.split("-").map(Number);
  return `${d} ${MESES[m - 1]} ${y}`;
}
const dineroMX = n => (n && Number(n) > 0) ? "$" + Number(n).toLocaleString("es-MX") + " MXN" : "";
const avatarInner = c => (c && c.foto) ? `<img src="${c.foto}" alt="">` : initials(c && c.nombre ? c.nombre : "?");
const hoyISO = () => { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`; };
const colabById = id => DEMO_COLABORADORES.find(c => c.id === id);

function badge(estatus) {
  const map = {
    "Activo":     ["badge--ok", "Activo"],
    "Vacaciones": ["badge--off", "Vacaciones"],
    "Incidencia": ["badge--alert", "Incidencia"],
  };
  const [cls, txt] = map[estatus] || ["badge--off", estatus];
  return `<span class="badge ${cls}">${txt}</span>`;
}

function personCell(c) {
  return `<div class="cell-person">
            <div class="avatar">${avatarInner(c)}</div>
            <div><div class="cell-person__name">${c.nombre}</div>
                 <div class="cell-person__sub">${c.email}</div></div>
          </div>`;
}

/* ---------- Render: KPIs ---------- */
function renderKpis() {
  const k = DATA.kpis(state.empresa.id);
  const cards = [
    { icon: `<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/>`, val: k.activos, label: "Colaboradores activos", delta: "+2 este mes", dcls: "good" },
    { icon: `<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>`, val: `${k.asistenciaHoy}/${k.activos}`, label: "Asistencia de hoy", delta: `${Math.round(k.asistenciaHoy / k.activos * 100)}%`, dcls: "good" },
    { icon: `<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6"/>`, val: k.incidencias, label: "Incidencias pendientes", delta: "Por revisar", dcls: "warn" },
    { icon: `<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="m9 12 2 2 4-4"/>`, val: k.nom035, label: "Estatus NOM-035", delta: k.nom035 === "Vigente" ? "OK" : "Acción", dcls: k.nom035 === "Vigente" ? "good" : "warn" },
  ];
  $("#kpis").innerHTML = cards.map(c => `
    <div class="kpi">
      <div class="kpi__top">
        <div class="kpi__icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${c.icon}</svg></div>
        <span class="kpi__delta kpi__delta--${c.dcls}">${c.delta}</span>
      </div>
      <div class="kpi__val">${c.val}</div>
      <div class="kpi__label">${c.label}</div>
    </div>`).join("");
}

/* ---------- Render: tablas ---------- */
function rowHTML(c) {
  return `<tr data-id="${c.id}">
    <td>${personCell(c)}</td>
    <td>${c.puesto}</td>
    <td>${c.area}</td>
    <td>${fechaLarga(c.ingreso)}</td>
    <td>${badge(c.estatus)}</td>
  </tr>`;
}
const TABLE_HEAD = `<thead><tr><th>Colaborador</th><th>Puesto</th><th>Área</th><th>Ingreso</th><th>Estatus</th></tr></thead>`;

function renderRecent() {
  const rows = DATA.colaboradores(state.empresa.id).slice(0, 5).map(rowHTML).join("");
  $("#recentTable").innerHTML = TABLE_HEAD + `<tbody>${rows}</tbody>`;
  bindRows("#recentTable");
}

function renderColab() {
  let list = DATA.colaboradores(state.empresa.id);
  if (state.filtro !== "Todos") list = list.filter(c => c.estatus === state.filtro);
  if (state.busqueda) {
    const q = state.busqueda.toLowerCase();
    list = list.filter(c => (c.nombre + c.puesto + c.area).toLowerCase().includes(q));
  }
  const body = list.length
    ? list.map(rowHTML).join("")
    : `<tr><td colspan="5" style="text-align:center;color:var(--muted);padding:34px">Sin resultados.</td></tr>`;
  $("#colabTable").innerHTML = TABLE_HEAD + `<tbody>${body}</tbody>`;
  bindRows("#colabTable");
}

function bindRows(sel) {
  $$(`${sel} tbody tr[data-id]`).forEach(tr =>
    tr.addEventListener("click", () => openSheet(tr.dataset.id)));
}

/* ---------- Slide-over: expediente ---------- */
function openSheet(id) {
  const c = DEMO_COLABORADORES.find(x => x.id === id);
  if (!c) return;
  const I = {
    id: `<rect x="2" y="4" width="20" height="16" rx="2"/><path d="M7 9h4M7 13h7M15 8.5h2"/>`,
    shield: `<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>`,
    cal: `<rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/>`,
    user: `<path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>`,
    heart: `<path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.29 1.51 4.04 3 5.5l7 7Z"/>`,
    work: `<rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/>`,
    bld: `<rect x="3" y="3" width="18" height="18" rx="2"/><path d="M9 22v-4h6v4M8 6h.01M16 6h.01M8 10h.01M16 10h.01M8 14h.01M16 14h.01"/>`,
    clock: `<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>`,
    doc: `<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6"/>`,
    sun: `<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/>`,
    money: `<rect x="2" y="6" width="20" height="12" rx="2"/><circle cx="12" cy="12" r="2.4"/><path d="M6 12h.01M18 12h.01"/>`,
    mail: `<path d="M4 4h16a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z"/><path d="m22 6-10 7L2 6"/>`,
    phone: `<path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.91.34 1.85.57 2.81.7A2 2 0 0 1 22 16.92z"/>`,
    pin: `<path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>`,
    alert: `<path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><path d="M12 9v4M12 17h.01"/>`,
  };
  const has = v => v !== undefined && v !== null && v !== "";
  const row = (icon, k, v) => has(v) ? `<div class="detail-row">
      <span class="detail-row__k"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${icon}</svg>${k}</span>
      <span class="detail-row__v">${v}</span></div>` : "";
  const section = (title, body) => body.trim() ? `<div class="sheet__section-title">${title}</div>${body}` : "";
  const emer = c.emergenciaNombre && c.emergenciaTel ? `${c.emergenciaNombre} · ${c.emergenciaTel}` : (c.emergenciaNombre || c.emergenciaTel || "");
  const jefe = c.jefeId ? colabById(c.jefeId) : null;
  const turno = c.turnoId ? turnoById(c.turnoId) : null;

  const hist = (c.historial && c.historial.length)
    ? c.historial.slice().sort((a, b) => a.fecha < b.fecha ? 1 : -1)
    : [{ fecha: c.ingreso, tipo: "Alta", detalle: "Ingreso a la empresa" }];
  const histCls = t => t === "Salario" ? "money" : (t === "Alta" ? "alta" : "job");
  const histHTML = `<div class="timeline">${hist.map(h => `
      <div class="tl-item tl-item--${histCls(h.tipo)}">
        <div class="tl-top"><span class="tl-tipo">${h.tipo}</span><span class="tl-fecha">${fechaLarga(h.fecha)}</span></div>
        <div class="tl-detalle">${h.detalle}</div>
      </div>`).join("")}</div>`;

  const docs = c.documentos || [];
  const docIco = `<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6"/>`;
  const docsHTML = (docs.length
      ? `<div class="doc-list">${docs.map((d, i) => `
          <div class="doc-item">
            <div class="doc-item__ico"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${docIco}</svg></div>
            <div class="doc-item__meta"><div class="doc-item__name">${d.nombre}</div><div class="doc-item__sub">${d.tipo} · ${fechaLarga(d.fecha)}</div></div>
            <button class="doc-item__del" data-doc="${i}" title="Quitar"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18M6 6l12 12"/></svg></button>
          </div>`).join("")}</div>`
      : `<p class="muted-empty">Sin documentos. Agrega INE, CURP, contrato, etc.</p>`)
    + `<button class="btn btn--ghost btn--sm" id="docAdd" style="width:100%;margin-top:10px"><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 5v14M5 12h14"/></svg> Agregar documento</button>`;

  $("#sheet").innerHTML = `
    <div class="sheet__head">
      <div class="avatar">${avatarInner(c)}</div>
      <div><div class="sheet__name">${c.nombre}</div><div class="sheet__role">${c.puesto} · ${c.area}</div></div>
      <button class="icon-btn sheet__close" id="sheetClose" aria-label="Cerrar">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18M6 6l12 12"/></svg>
      </button>
    </div>
    <div class="sheet__body">
      <div style="margin-bottom:4px">${badge(c.estatus)}</div>
      ${section("Datos personales",
        row(I.id, "CURP", c.curp) +
        row(I.id, "RFC", c.rfc) +
        row(I.shield, "NSS (IMSS)", c.nss) +
        row(I.cal, "Nacimiento", c.nacimiento ? fechaLarga(c.nacimiento) : "") +
        row(I.user, "Género", c.genero) +
        row(I.heart, "Estado civil", c.estadoCivil)
      )}
      ${section("Datos laborales",
        row(I.work, "Puesto", c.puesto) +
        row(I.bld, "Área", c.area) +
        row(I.user, "Reporta a", jefe ? jefe.nombre : "") +
        row(I.clock, "Turno", turno ? `${turno.nombre} · ${turno.entrada}-${turno.salida}` : "") +
        row(I.cal, "Fecha de ingreso", c.ingreso ? fechaLarga(c.ingreso) : "") +
        row(I.clock, "Antigüedad", c.antiguedad) +
        row(I.doc, "Tipo de contrato", c.tipoContrato) +
        row(I.sun, "Jornada", c.jornada) +
        row(I.money, "Salario mensual", dineroMX(c.salario))
      )}
      ${section("Contacto",
        row(I.mail, "Correo", c.email) +
        row(I.phone, "Teléfono", c.tel) +
        row(I.pin, "Domicilio", c.domicilio) +
        row(I.alert, "Emergencia", emer)
      )}
      <div class="sheet__section-title">Historial laboral</div>
      ${histHTML}
      <div class="sheet__section-title">Documentos</div>
      ${docsHTML}
    </div>
    <div class="sheet__foot">
      <button class="btn btn--ghost" id="sheetDelete" style="flex:none;width:46px;padding:0" title="Eliminar">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${ICON_TRASH}</svg>
      </button>
      <button class="btn btn--ghost" id="sheetPdf" style="flex:none;width:46px;padding:0" title="Exportar a PDF">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><path d="M7 10l5 5 5-5"/><path d="M12 15V3"/></svg>
      </button>
      <button class="btn btn--primary" id="sheetEdit" style="flex:1">Editar</button>
    </div>`;
  $("#sheet").classList.add("is-on");
  $("#overlay").classList.add("is-on");
  $("#sheetClose").addEventListener("click", closeSheet);
  $("#sheetEdit").addEventListener("click", () => { closeSheet(); openForm("edit", id); });
  $("#sheetDelete").addEventListener("click", () => deleteColab(id));
  $("#sheetPdf").addEventListener("click", () => exportarPDF(id));
  $("#docAdd")?.addEventListener("click", () => openDocModal(id));
  $$("#sheet .doc-item__del").forEach(b => b.addEventListener("click", () => {
    (c.documentos || []).splice(Number(b.dataset.doc), 1);
    openSheet(id);
  }));
}
function closeSheet() {
  $("#sheet").classList.remove("is-on");
  $("#overlay").classList.remove("is-on");
}

/* =====================================================================
   CRUD Colaboradores — formulario premium (selects glass + date picker custom)
   Demo: muta DEMO_COLABORADORES en memoria. Producción:
   addDoc / updateDoc / deleteDoc en empresas/{id}/colaboradores.
   ===================================================================== */
const AREAS = ["Tecnología", "Operación", "Finanzas", "Comercial", "Clínica", "Administración", "Recursos Humanos"];
const ESTATUS = ["Activo", "Vacaciones", "Incidencia"];
const GENEROS = ["Femenino", "Masculino", "Otro"];
const EDO_CIVIL = ["Soltero/a", "Casado/a", "Unión libre", "Divorciado/a", "Viudo/a"];
const CONTRATOS = ["Indeterminado", "Determinado", "Por obra o tiempo determinado", "Capacitación inicial", "Periodo de prueba"];
const JORNADAS = ["Diurna", "Nocturna", "Mixta"];
let _seqId = 100;
const nuevoId = () => "c" + (++_seqId);

const ICON_TRASH = `<path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2m2 0v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/><path d="M10 11v6M14 11v6"/>`;

function calcAntiguedad(iso) {
  const [y, m, d] = iso.split("-").map(Number);
  const hoy = new Date();
  let meses = (hoy.getFullYear() - y) * 12 + (hoy.getMonth() - (m - 1));
  if (hoy.getDate() < d) meses -= 1;
  if (meses < 0) meses = 0;
  return `${Math.floor(meses / 12)} a ${meses % 12} m`;
}

/* ---- Custom select (glass) ---- */
function selectHTML(name, value, opts) {
  const norm = opts.map(o => typeof o === "string" ? { v: o, label: o } : o);
  const cur = norm.find(o => o.v === value) || norm[0];
  return `<div class="select" data-name="${name}" data-value="${cur.v}">
    <button type="button" class="select__btn">
      <span class="select__val">${cur.label}</span>
      <svg class="chev" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m6 9 6 6 6-6"/></svg>
    </button>
    <div class="select__menu">
      ${norm.map(o => `<button type="button" class="select__opt ${o.v === cur.v ? "is-sel" : ""}" data-v="${o.v}">${o.label}</button>`).join("")}
    </div>
  </div>`;
}
function bindSelect(root) {
  $$(".select", root).forEach(sel => {
    $(".select__btn", sel).addEventListener("click", e => {
      e.stopPropagation();
      $$(".select").forEach(s => { if (s !== sel) s.classList.remove("is-open"); });
      $$(".datepick").forEach(d => d.classList.remove("is-open"));
      sel.classList.toggle("is-open");
    });
    $$(".select__opt", sel).forEach(opt => opt.addEventListener("click", () => {
      sel.dataset.value = opt.dataset.v;
      $(".select__val", sel).textContent = opt.textContent;
      $$(".select__opt", sel).forEach(o => o.classList.toggle("is-sel", o === opt));
      sel.classList.remove("is-open");
    }));
  });
}

/* ---- Custom date picker (calendario) ---- */
const DIAS = ["L", "M", "M", "J", "V", "S", "D"];
const MESES_LARGO = ["Enero","Febrero","Marzo","Abril","Mayo","Junio","Julio","Agosto","Septiembre","Octubre","Noviembre","Diciembre"];
function datepickHTML(name, value) {
  return `<div class="datepick" data-name="${name}" data-value="${value}">
    <button type="button" class="datepick__btn">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/></svg>
      <span class="datepick__val">${value ? fechaLarga(value) : "Seleccionar"}</span>
    </button>
    <div class="datepick__pop"></div>
  </div>`;
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
  pop.innerHTML = `
    <div class="dp-nav">
      <button type="button" class="dp-arrow" data-nav="-1"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m15 18-6-6 6-6"/></svg></button>
      <span class="dp-month">${MESES_LARGO[vm]} ${vy}</span>
      <button type="button" class="dp-arrow" data-nav="1"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m9 18 6-6-6-6"/></svg></button>
    </div>
    <div class="dp-dows">${DIAS.map(d => `<span>${d}</span>`).join("")}</div>
    <div class="dp-grid">${cells}</div>`;
  dp._vy = vy; dp._vm = vm;
  $$(".dp-arrow", pop).forEach(a => a.addEventListener("click", e => {
    e.stopPropagation();
    let m = dp._vm + Number(a.dataset.nav), y = dp._vy;
    if (m < 0) { m = 11; y--; } if (m > 11) { m = 0; y++; }
    renderCalendar(dp, y, m);
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
      $$(".select").forEach(s => s.classList.remove("is-open"));
      const open = dp.classList.toggle("is-open");
      if (open) {
        const b = dp.dataset.value ? dp.dataset.value.split("-").map(Number) : [new Date().getFullYear(), new Date().getMonth() + 1, 1];
        renderCalendar(dp, b[0], b[1] - 1);
      }
    });
  });
}

/* ---- Modal alta / edición ---- */
function openForm(mode, id) {
  const c = mode === "edit" ? DEMO_COLABORADORES.find(x => x.id === id) : null;
  const v = f => (c ? c[f] : "");
  let fotoData = c ? (c.foto || "") : "";
  const jefeOpts = [{ v: "", label: "— Sin jefe directo —" }]
    .concat(DATA.colaboradores(state.empresa.id).filter(o => o.id !== id).map(o => ({ v: o.id, label: o.nombre })));
  const turnoOpts = [{ v: "", label: "— Sin turno —" }]
    .concat(DATA.turnos(state.empresa.id).map(t => ({ v: t.id, label: `${t.nombre} (${t.entrada}-${t.salida})` })));
  $$(".modal-overlay").forEach(o => o.remove()); // un solo modal a la vez (sin IDs duplicados)
  const ov = document.createElement("div");
  ov.className = "modal-overlay";
  ov.innerHTML = `
    <div class="modal" role="dialog" aria-modal="true">
      <div class="modal__head">
        <h3>${mode === "edit" ? "Editar colaborador" : "Nuevo colaborador"}</h3>
        <button class="icon-btn" id="modalClose" aria-label="Cerrar"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18M6 6l12 12"/></svg></button>
      </div>
      <div class="modal__body">
        <div class="photo-row">
          <div class="avatar avatar--xl" id="photoPreview">${avatarInner(c || {})}</div>
          <div class="photo-actions">
            <button type="button" class="btn btn--ghost btn--sm" id="photoBtn">Subir foto</button>
            <button type="button" class="btn btn--ghost btn--sm" id="photoClear"${(c && c.foto) ? "" : ' style="display:none"'}>Quitar</button>
            <input type="file" id="photoInput" accept="image/*" hidden />
            <div class="photo-hint">JPG o PNG, de preferencia cuadrada.</div>
          </div>
        </div>
        <div class="form-grid">
          <div class="form-section">Datos personales</div>
          <div class="field field--full"><label class="field__label">Nombre completo *</label><input class="input" id="f-nombre" value="${v("nombre")}" placeholder="Nombre y apellidos" /></div>
          <div class="field"><label class="field__label">CURP</label><input class="input up" id="f-curp" value="${v("curp")}" placeholder="18 caracteres" maxlength="18" /></div>
          <div class="field"><label class="field__label">RFC</label><input class="input up" id="f-rfc" value="${v("rfc")}" placeholder="Con homoclave" maxlength="13" /></div>
          <div class="field"><label class="field__label">NSS (IMSS)</label><input class="input" id="f-nss" value="${v("nss")}" placeholder="11 dígitos" inputmode="numeric" maxlength="11" /></div>
          <div class="field"><label class="field__label">Fecha de nacimiento</label>${datepickHTML("nacimiento", v("nacimiento") || "")}</div>
          <div class="field"><label class="field__label">Género</label>${selectHTML("genero", v("genero") || GENEROS[0], GENEROS)}</div>
          <div class="field"><label class="field__label">Estado civil</label>${selectHTML("estadoCivil", v("estadoCivil") || EDO_CIVIL[0], EDO_CIVIL)}</div>

          <div class="form-section">Contacto</div>
          <div class="field"><label class="field__label">Correo</label><input class="input" id="f-email" type="email" value="${v("email")}" placeholder="correo@empresa.mx" /></div>
          <div class="field"><label class="field__label">Teléfono</label><input class="input" id="f-tel" value="${v("tel")}" placeholder="238 000 0000" /></div>
          <div class="field field--full"><label class="field__label">Domicilio</label><input class="input" id="f-domicilio" value="${v("domicilio")}" placeholder="Calle, número, colonia, ciudad" /></div>
          <div class="field"><label class="field__label">Contacto de emergencia</label><input class="input" id="f-emerNombre" value="${v("emergenciaNombre")}" placeholder="Nombre" /></div>
          <div class="field"><label class="field__label">Tel. de emergencia</label><input class="input" id="f-emerTel" value="${v("emergenciaTel")}" placeholder="238 000 0000" /></div>

          <div class="form-section">Datos laborales</div>
          <div class="field"><label class="field__label">Puesto *</label><input class="input" id="f-puesto" value="${v("puesto")}" placeholder="Ej. Desarrollador" /></div>
          <div class="field"><label class="field__label">Área</label>${selectHTML("area", v("area") || AREAS[0], AREAS)}</div>
          <div class="field"><label class="field__label">Reporta a</label>${selectHTML("jefe", v("jefeId") || "", jefeOpts)}</div>
          <div class="field"><label class="field__label">Turno</label>${selectHTML("turno", v("turnoId") || "", turnoOpts)}</div>
          <div class="field"><label class="field__label">Fecha de ingreso *</label>${datepickHTML("ingreso", v("ingreso") || "")}</div>
          <div class="field"><label class="field__label">Tipo de contrato</label>${selectHTML("contrato", v("tipoContrato") || CONTRATOS[0], CONTRATOS)}</div>
          <div class="field"><label class="field__label">Jornada</label>${selectHTML("jornada", v("jornada") || JORNADAS[0], JORNADAS)}</div>
          <div class="field"><label class="field__label">Salario mensual</label><div class="money"><span class="money__sign">$</span><input class="input input--money" id="f-salario" inputmode="numeric" value="${v("salario") || ""}" placeholder="0" /><span class="money__cur">MXN</span></div></div>
          <div class="field"><label class="field__label">Estatus</label>${selectHTML("estatus", v("estatus") || ESTATUS[0], ESTATUS)}</div>
        </div>
        <p class="form-error" id="formError"></p>
      </div>
      <div class="modal__foot">
        <button class="btn btn--ghost" id="modalCancel">Cancelar</button>
        <button class="btn btn--primary" id="modalSave">${mode === "edit" ? "Guardar cambios" : "Agregar colaborador"}</button>
      </div>
    </div>`;
  document.body.appendChild(ov);
  requestAnimationFrame(() => ov.classList.add("is-on"));
  bindSelect(ov); bindDatepick(ov);
  $("#photoBtn", ov).addEventListener("click", () => $("#photoInput", ov).click());
  $("#photoInput", ov).addEventListener("change", e => {
    const file = e.target.files[0]; if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      fotoData = reader.result;
      $("#photoPreview", ov).innerHTML = `<img src="${fotoData}" alt="">`;
      $("#photoClear", ov).style.display = "inline-flex";
    };
    reader.readAsDataURL(file);
  });
  $("#photoClear", ov).addEventListener("click", () => {
    fotoData = "";
    $("#photoPreview", ov).innerHTML = initials($("#f-nombre", ov).value || "?");
    $("#photoClear", ov).style.display = "none";
  });
  const close = () => { ov.classList.remove("is-on"); setTimeout(() => ov.remove(), 220); };
  $("#modalClose", ov).addEventListener("click", close);
  $("#modalCancel", ov).addEventListener("click", close);
  ov.addEventListener("click", e => { if (e.target === ov) close(); });
  $("#modalSave", ov).addEventListener("click", () => {
    const nombre = $("#f-nombre", ov).value.trim();
    const puesto = $("#f-puesto", ov).value.trim();
    const ingreso = $(".datepick[data-name='ingreso']", ov).dataset.value;
    const err = $("#formError", ov);
    if (!nombre || !puesto) { err.textContent = "Nombre y puesto son obligatorios."; return; }
    if (!ingreso) { err.textContent = "Selecciona la fecha de ingreso."; return; }
    const datos = {
      nombre, puesto,
      curp: $("#f-curp", ov).value.trim().toUpperCase(),
      rfc: $("#f-rfc", ov).value.trim().toUpperCase(),
      nss: $("#f-nss", ov).value.trim(),
      nacimiento: $(".datepick[data-name='nacimiento']", ov).dataset.value,
      genero: $(".select[data-name='genero']", ov).dataset.value,
      estadoCivil: $(".select[data-name='estadoCivil']", ov).dataset.value,
      email: $("#f-email", ov).value.trim(),
      tel: $("#f-tel", ov).value.trim(),
      domicilio: $("#f-domicilio", ov).value.trim(),
      emergenciaNombre: $("#f-emerNombre", ov).value.trim(),
      emergenciaTel: $("#f-emerTel", ov).value.trim(),
      area: $(".select[data-name='area']", ov).dataset.value,
      ingreso,
      tipoContrato: $(".select[data-name='contrato']", ov).dataset.value,
      jornada: $(".select[data-name='jornada']", ov).dataset.value,
      salario: Number(($("#f-salario", ov).value || "").replace(/[^\d]/g, "")) || "",
      estatus: $(".select[data-name='estatus']", ov).dataset.value,
      jefeId: $(".select[data-name='jefe']", ov).dataset.value,
      turnoId: $(".select[data-name='turno']", ov).dataset.value,
      foto: fotoData,
      antiguedad: calcAntiguedad(ingreso),
    };
    if (mode === "edit") {
      c.historial = c.historial || [];
      if (c.puesto !== datos.puesto) c.historial.push({ fecha: hoyISO(), tipo: "Puesto", detalle: `${c.puesto} → ${datos.puesto}` });
      if ((c.salario || 0) !== (datos.salario || 0)) c.historial.push({ fecha: hoyISO(), tipo: "Salario", detalle: `${dineroMX(c.salario) || "—"} → ${dineroMX(datos.salario) || "—"}` });
      Object.assign(c, datos);
      // TODO firebase: updateDoc(doc(db,`empresas/${state.empresa.id}/colaboradores/${id}`), datos)
    } else {
      DEMO_COLABORADORES.push({
        id: nuevoId(), empresaId: state.empresa.id, ...datos,
        documentos: [], historial: [{ fecha: datos.ingreso, tipo: "Alta", detalle: "Ingreso a la empresa" }],
      });
      // TODO firebase: addDoc(collection(db,`empresas/${state.empresa.id}/colaboradores`), datos)
    }
    close();
    renderColab();
  });
}

/* ---- Confirmación de baja (custom, sin confirm nativo) ---- */
function confirmDialog(msg, onYes) {
  $$(".modal-overlay").forEach(o => o.remove());
  const ov = document.createElement("div");
  ov.className = "modal-overlay";
  ov.innerHTML = `
    <div class="modal modal--sm" role="dialog" aria-modal="true">
      <div class="modal__body" style="padding-top:26px">
        <div class="confirm-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><path d="M12 9v4M12 17h.01"/></svg></div>
        <p class="confirm-msg">${msg}</p>
      </div>
      <div class="modal__foot" style="justify-content:center">
        <button class="btn btn--ghost" data-no>Cancelar</button>
        <button class="btn btn--danger" data-yes>Eliminar</button>
      </div>
    </div>`;
  document.body.appendChild(ov);
  requestAnimationFrame(() => ov.classList.add("is-on"));
  const close = () => { ov.classList.remove("is-on"); setTimeout(() => ov.remove(), 220); };
  $("[data-no]", ov).addEventListener("click", close);
  $("[data-yes]", ov).addEventListener("click", () => { close(); onYes(); });
  ov.addEventListener("click", e => { if (e.target === ov) close(); });
}

function deleteColab(id) {
  const c = DEMO_COLABORADORES.find(x => x.id === id);
  if (!c) return;
  confirmDialog(`¿Eliminar a ${c.nombre}? Esta acción no se puede deshacer.`, () => {
    const i = DEMO_COLABORADORES.indexOf(c);
    if (i > -1) DEMO_COLABORADORES.splice(i, 1);
    // TODO firebase: deleteDoc(doc(db,`empresas/${state.empresa.id}/colaboradores/${id}`))
    closeSheet();
    renderColab();
  });
}

/* =====================================================================
   Organigrama (jerarquía por "reporta a")
   ===================================================================== */
function orgNodeHTML(c, childrenMap) {
  const kids = childrenMap[c.id] || [];
  return `<li class="org-node">
    <div class="org-card" data-id="${c.id}">
      <div class="avatar avatar--sm">${avatarInner(c)}</div>
      <div class="org-card__info"><div class="org-card__name">${c.nombre}</div><div class="org-card__role">${c.puesto}</div></div>
    </div>
    ${kids.length ? `<ul class="org-children">${kids.map(k => orgNodeHTML(k, childrenMap)).join("")}</ul>` : ""}
  </li>`;
}
function renderOrganigrama() {
  const list = DATA.colaboradores(state.empresa.id);
  const byId = {}; list.forEach(c => byId[c.id] = c);
  const childrenMap = {};
  list.forEach(c => {
    const parent = (c.jefeId && byId[c.jefeId]) ? c.jefeId : "__root__";
    (childrenMap[parent] = childrenMap[parent] || []).push(c);
  });
  const roots = childrenMap["__root__"] || [];
  const tree = roots.length
    ? `<ul class="org-tree">${roots.map(r => orgNodeHTML(r, childrenMap)).join("")}</ul>`
    : `<p class="muted-empty">Sin colaboradores en esta empresa.</p>`;
  $("#view-organigrama").innerHTML = `
    <div class="page-head"><h1>Organigrama</h1><p>Estructura jerárquica de ${state.empresa.nombre}. Haz clic en alguien para abrir su expediente.</p></div>
    <div class="card" style="padding:26px;overflow-x:auto">${tree}</div>`;
  $$("#view-organigrama .org-card").forEach(card => card.addEventListener("click", () => openSheet(card.dataset.id)));
}

/* =====================================================================
   Documentos del expediente (modal de alta)
   ===================================================================== */
const DOC_TIPOS = ["INE", "CURP", "Acta de nacimiento", "Comprobante de domicilio", "Contrato firmado", "Constancia de situación fiscal", "Comprobante de estudios", "Otro"];
function openDocModal(id) {
  const c = colabById(id); if (!c) return;
  $$(".modal-overlay").forEach(o => o.remove());
  const ov = document.createElement("div");
  ov.className = "modal-overlay";
  ov.innerHTML = `
    <div class="modal modal--sm" role="dialog" aria-modal="true" style="text-align:left">
      <div class="modal__head"><h3>Agregar documento</h3>
        <button class="icon-btn" id="dmClose" aria-label="Cerrar"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18M6 6l12 12"/></svg></button>
      </div>
      <div class="modal__body">
        <div class="field"><label class="field__label">Tipo de documento</label>${selectHTML("doctipo", DOC_TIPOS[0], DOC_TIPOS)}</div>
        <div class="field" style="margin-top:14px"><label class="field__label">Archivo</label>
          <button type="button" class="filepick" id="dmPick"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><path d="M17 8l-5-5-5 5"/><path d="M12 3v12"/></svg><span id="dmName">Seleccionar archivo…</span></button>
          <input type="file" id="dmFile" hidden />
        </div>
      </div>
      <div class="modal__foot"><button class="btn btn--ghost" id="dmCancel">Cancelar</button><button class="btn btn--primary" id="dmSave">Agregar</button></div>
    </div>`;
  document.body.appendChild(ov);
  requestAnimationFrame(() => ov.classList.add("is-on"));
  bindSelect(ov);
  let file = null;
  const close = () => { ov.classList.remove("is-on"); setTimeout(() => ov.remove(), 220); };
  $("#dmClose", ov).addEventListener("click", close);
  $("#dmCancel", ov).addEventListener("click", close);
  ov.addEventListener("click", e => { if (e.target === ov) close(); });
  $("#dmPick", ov).addEventListener("click", () => $("#dmFile", ov).click());
  $("#dmFile", ov).addEventListener("change", e => { file = e.target.files[0]; if (file) $("#dmName", ov).textContent = file.name; });
  $("#dmSave", ov).addEventListener("click", () => {
    const tipo = $(".select[data-name='doctipo']", ov).dataset.value;
    c.documentos = c.documentos || [];
    c.documentos.push({ tipo, nombre: file ? file.name : `${tipo}.pdf`, fecha: hoyISO() });
    // TODO firebase: subir archivo a Storage empresas/${state.empresa.id}/colaboradores/${id}/docs
    close();
    openSheet(id);
    toast("Documento agregado.");
  });
}

/* =====================================================================
   Exportar — Excel (CSV) del listado y PDF del expediente
   ===================================================================== */
function exportarCSV() {
  let list = DATA.colaboradores(state.empresa.id);
  if (state.filtro !== "Todos") list = list.filter(c => c.estatus === state.filtro);
  const cols = ["Nombre", "Puesto", "Área", "Estatus", "CURP", "RFC", "NSS", "Nacimiento", "Género", "Estado civil", "Correo", "Teléfono", "Domicilio", "Ingreso", "Antigüedad", "Tipo de contrato", "Jornada", "Salario", "Turno", "Reporta a", "Emergencia", "Tel. emergencia"];
  const esc = v => { v = (v === undefined || v === null) ? "" : String(v); return /[",\n]/.test(v) ? `"${v.replace(/"/g, '""')}"` : v; };
  const filas = list.map(c => {
    const jefe = c.jefeId ? colabById(c.jefeId) : null;
    const turno = c.turnoId ? turnoById(c.turnoId) : null;
    return [c.nombre, c.puesto, c.area, c.estatus, c.curp, c.rfc, c.nss, c.nacimiento, c.genero, c.estadoCivil, c.email, c.tel, c.domicilio, c.ingreso, c.antiguedad, c.tipoContrato, c.jornada, c.salario, turno ? turno.nombre : "", jefe ? jefe.nombre : "", c.emergenciaNombre, c.emergenciaTel].map(esc).join(",");
  });
  const csv = "\uFEFF" + [cols.join(","), ...filas].join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = `colaboradores_${state.empresa.id}.csv`;
  document.body.appendChild(a); a.click(); a.remove();
  URL.revokeObjectURL(url);
  toast(`Exportados ${list.length} colaboradores a Excel.`);
}

function exportarPDF(id) {
  const c = colabById(id); if (!c) return;
  if (!(window.jspdf && window.jspdf.jsPDF)) { toast("La exportación a PDF requiere conexión (se carga en tu sitio publicado)."); return; }
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF({ unit: "pt", format: "a4" });
  let y = 56;
  doc.setFontSize(18); doc.setFont(undefined, "bold"); doc.text(c.nombre, 56, y);
  y += 18; doc.setFontSize(11); doc.setFont(undefined, "normal"); doc.setTextColor(120); doc.text(`${c.puesto} · ${c.area}`, 56, y); doc.setTextColor(0);
  const jefe = c.jefeId ? colabById(c.jefeId) : null;
  const line = (k, val) => { if (!val) return; doc.setFont(undefined, "bold"); doc.setFontSize(10); doc.text(k + ":", 56, y); doc.setFont(undefined, "normal"); doc.text(String(val), 190, y); y += 17; if (y > 790) { doc.addPage(); y = 56; } };
  const head = t => { y += 12; doc.setFontSize(12); doc.setFont(undefined, "bold"); doc.setTextColor(75, 79, 230); doc.text(t, 56, y); doc.setTextColor(0); y += 16; };
  head("Datos personales");
  line("CURP", c.curp); line("RFC", c.rfc); line("NSS", c.nss); line("Nacimiento", c.nacimiento ? fechaLarga(c.nacimiento) : ""); line("Género", c.genero); line("Estado civil", c.estadoCivil);
  head("Datos laborales");
  line("Puesto", c.puesto); line("Área", c.area); line("Reporta a", jefe ? jefe.nombre : ""); line("Ingreso", c.ingreso ? fechaLarga(c.ingreso) : ""); line("Antigüedad", c.antiguedad); line("Tipo de contrato", c.tipoContrato); line("Jornada", c.jornada); line("Salario mensual", dineroMX(c.salario));
  head("Contacto");
  line("Correo", c.email); line("Teléfono", c.tel); line("Domicilio", c.domicilio); line("Emergencia", c.emergenciaNombre ? `${c.emergenciaNombre} ${c.emergenciaTel || ""}` : "");
  doc.save(`Expediente_${c.nombre.replace(/\s+/g, "_")}.pdf`);
  toast("PDF generado.");
}

/* ---------- Toast ---------- */
function toast(msg) {
  const t = document.createElement("div");
  t.className = "toast"; t.textContent = msg;
  document.body.appendChild(t);
  requestAnimationFrame(() => t.classList.add("is-on"));
  setTimeout(() => { t.classList.remove("is-on"); setTimeout(() => t.remove(), 300); }, 2600);
}

/* =====================================================================
   FASE 2 — Asistencia: ledger inmutable, turnos, checador
   ===================================================================== */

/* Hash encadenado (demo, determinista — para auditar la cadena) */
function hashStr(s) {
  let h = 0x811c9dc5;
  for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 0x01000193); }
  return (h >>> 0).toString(16).padStart(8, "0");
}

/* Ledger append-only por empresa (cadena de hashes).
   Producción: empresas/{id}/eventos con reglas que prohíben update/delete. */
const LEDGER = {
  _chain: [],
  _seq: 0,
  init() {
    this._chain = []; this._seq = 0;
    DEMO_ASISTENCIA_SEED.forEach(s => this._push(s.empresaId, s.colaboradorId, s.tipo, { ok: true, dist: 20 }, `${hoyISO()}T${s.hora}:00`));
  },
  _push(empresaId, colaboradorId, tipo, geo, ts) {
    const prev = [...this._chain].reverse().find(e => e.empresaId === empresaId);
    const prevHash = prev ? prev.hash : "0".repeat(8);
    const id = "ev" + (++this._seq);
    const hash = hashStr(prevHash + empresaId + colaboradorId + tipo + ts);
    this._chain.push({ id, empresaId, colaboradorId, tipo, ts, geo, prevHash, hash });
    return this._chain[this._chain.length - 1];
  },
  registrar(empresaId, colaboradorId, tipo, geo) {
    const ev = this._push(empresaId, colaboradorId, tipo, geo, new Date().toISOString());
    // TODO firebase: addDoc(collection(db,`empresas/${empresaId}/eventos`), ev)  ← append-only
    return ev;
  },
  eventos(empresaId) { return this._chain.filter(e => e.empresaId === empresaId); },
  hoy(empresaId) { const h = hoyISO(); return this.eventos(empresaId).filter(e => e.ts.slice(0, 10) === h); },
  verificar(empresaId) {
    const evs = this.eventos(empresaId);
    let prevHash = "0".repeat(8);
    for (const e of evs) {
      if (e.prevHash !== prevHash) return { ok: false, en: e.id };
      if (e.hash !== hashStr(prevHash + e.empresaId + e.colaboradorId + e.tipo + e.ts)) return { ok: false, en: e.id };
      prevHash = e.hash;
    }
    return { ok: true, total: evs.length };
  },
};

/* Helpers de asistencia */
const turnoById = id => DEMO_TURNOS.find(t => t.id === id);
const toMin = hhmm => { const [h, m] = hhmm.split(":").map(Number); return h * 60 + m; };
const horaMin = ts => { const d = new Date(ts); return d.getHours() * 60 + d.getMinutes(); };
const horaTxt = ts => { const d = new Date(ts); return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`; };
const horaActual = () => { const d = new Date(); return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`; };

function evaluarAsistencia(c, eventos) {
  if (c.estatus === "Vacaciones") return { clase: "vac", txt: "Vacaciones", entrada: "—", salida: "—" };
  if (c.estatus === "Incidencia") return { clase: "inc", txt: "Incidencia", entrada: "—", salida: "—" };
  const evs = eventos.filter(e => e.colaboradorId === c.id);
  const entrada = evs.filter(e => e.tipo === "entrada").sort((a, b) => a.ts < b.ts ? -1 : 1)[0];
  const salidas = evs.filter(e => e.tipo === "salida").sort((a, b) => a.ts < b.ts ? -1 : 1);
  const salida = salidas[salidas.length - 1];
  if (!entrada) return { clase: "falta", txt: "Falta", entrada: "—", salida: "—" };
  const turno = turnoById(c.turnoId);
  let est = { clase: "ok", txt: "A tiempo" };
  if (turno) {
    const retraso = horaMin(entrada.ts) - toMin(turno.entrada);
    if (retraso > (turno.tolerancia || 0)) est = { clase: "ret", txt: `Retardo ${retraso} min` };
  }
  return { ...est, entrada: horaTxt(entrada.ts), salida: salida ? horaTxt(salida.ts) : "—" };
}

/* Geo-cerca (demo simula dentro del radio; producción: navigator.geolocation + haversine) */
function validarGeo(empresa) {
  const radio = (empresa.geo && empresa.geo.radio) || 60;
  const dist = Math.floor(12 + Math.random() * (radio - 18));
  return { ok: dist <= radio, dist };
}

/* Reloj en vivo */
let _clockTimer = null;
function tickReloj() {
  const el = $("#checadorClock"); if (!el) return;
  const d = new Date();
  el.textContent = `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}:${String(d.getSeconds()).padStart(2, "0")}`;
}

/* QR de sucursal (representativo en demo; en producción encodea el token de check-in) */
function qrSVG(seed) {
  const N = 25, cell = 7, pad = 14, size = N * cell + pad * 2;
  let s = 0; for (let i = 0; i < seed.length; i++) s = (s * 31 + seed.charCodeAt(i)) >>> 0;
  const rnd = () => { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; };
  const finder = (gx, gy) => `M${pad + gx * cell} ${pad + gy * cell} h${cell * 7} v${cell * 7} h${-cell * 7} z M${pad + (gx + 1) * cell} ${pad + (gy + 1) * cell} h${cell * 5} v${cell * 5} h${-cell * 5} z M${pad + (gx + 2) * cell} ${pad + (gy + 2) * cell} h${cell * 3} v${cell * 3} h${-cell * 3} z`;
  const inFinder = (x, y) => (x < 8 && y < 8) || (x >= N - 8 && y < 8) || (x < 8 && y >= N - 8);
  let mods = "";
  for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) {
    if (inFinder(x, y)) continue;
    if (rnd() > 0.55) mods += `<rect x="${pad + x * cell}" y="${pad + y * cell}" width="${cell}" height="${cell}"/>`;
  }
  return `<svg viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg" class="qr-svg">
    <rect width="${size}" height="${size}" rx="14" fill="#ffffff"/>
    <g fill="#0b1020">${mods}
      <path fill-rule="evenodd" d="${finder(0, 0)}"/>
      <path fill-rule="evenodd" d="${finder(N - 7, 0)}"/>
      <path fill-rule="evenodd" d="${finder(0, N - 7)}"/>
    </g>
  </svg>`;
}

/* Render principal de Asistencia */
function renderAsistencia() {
  if (_clockTimer) { clearInterval(_clockTimer); _clockTimer = null; }
  const emp = state.empresa;
  const cols = DATA.colaboradores(emp.id);
  const turnos = DATA.turnos(emp.id);
  const checaOpts = cols.map(c => ({ v: c.id, label: c.nombre }));

  const turnoCards = turnos.length
    ? `<div class="turno-grid">${turnos.map(t => `
        <div class="turno-card">
          <div class="turno-card__name">${t.nombre}</div>
          <div class="turno-card__time">${t.entrada} – ${t.salida}</div>
          <div class="turno-card__tol">Tolerancia ${t.tolerancia} min · ${cols.filter(c => c.turnoId === t.id).length} colaborador(es)</div>
        </div>`).join("")}</div>`
    : `<p class="muted-empty">Sin turnos. Crea el primero.</p>`;

  $("#view-asistencia").innerHTML = `
    <div class="page-head"><h1>Asistencia</h1><p>Checador, turnos y bitácora inmutable de ${emp.nombre}.</p></div>
    <div class="asist-top">
      <div class="card checador">
        <div class="checador__head">
          <span class="checador__date">${fechaLarga(hoyISO())}</span>
          <span class="geo-chip is-ok" id="geoChip"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>${emp.geo ? emp.geo.sucursal : "Sucursal"}</span>
        </div>
        <div class="checador__clock" id="checadorClock">--:--:--</div>
        <label class="field__label">Colaborador</label>
        ${selectHTML("checaColab", checaOpts.length ? checaOpts[0].v : "", checaOpts.length ? checaOpts : [{ v: "", label: "Sin colaboradores" }])}
        <div class="checador__btns">
          <button class="btn check-in" id="btnEntrada"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/><path d="M10 17l5-5-5-5M15 12H3"/></svg>Entrada</button>
          <button class="btn check-out" id="btnSalida"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><path d="M16 17l5-5-5-5M21 12H9"/></svg>Salida</button>
        </div>
      </div>
      <div class="card qr-card">
        <div class="qr-wrap">${qrSVG(emp.id + hoyISO())}</div>
        <div class="qr-card__title">QR de la sucursal</div>
        <div class="qr-card__sub">Escanéalo desde la app del colaborador para checar.</div>
      </div>
    </div>
    <div class="section-head" style="margin-top:26px"><h2>Asistencia de hoy</h2></div>
    <div class="card"><div class="table-wrap" id="asistTablaWrap"></div></div>
    <div class="asist-bottom">
      <div>
        <div class="section-head"><h2>Turnos</h2><button class="chip" id="btnNuevoTurno" style="background:var(--surface);box-shadow:var(--shadow)">+ Nuevo turno</button></div>
        ${turnoCards}
      </div>
      <div>
        <div class="section-head"><h2>Bitácora · ledger inmutable</h2></div>
        <div class="card" id="bitacoraWrap"></div>
      </div>
    </div>`;

  renderAsistTabla();
  renderBitacora();
  tickReloj();
  _clockTimer = setInterval(tickReloj, 1000);
  bindSelect($("#view-asistencia"));
  $("#btnEntrada").addEventListener("click", () => checar("entrada"));
  $("#btnSalida").addEventListener("click", () => checar("salida"));
  $("#btnNuevoTurno").addEventListener("click", openTurnoModal);
}

function renderAsistTabla() {
  const emp = state.empresa;
  const cols = DATA.colaboradores(emp.id);
  const evs = LEDGER.hoy(emp.id);
  const rows = cols.map(c => {
    const a = evaluarAsistencia(c, evs);
    const turno = turnoById(c.turnoId);
    return `<tr>
      <td>${personCell(c)}</td>
      <td>${turno ? `${turno.nombre} · ${turno.entrada}-${turno.salida}` : "—"}</td>
      <td>${a.entrada}</td>
      <td>${a.salida}</td>
      <td><span class="badge badge--${a.clase}">${a.txt}</span></td>
    </tr>`;
  }).join("");
  $("#asistTablaWrap").innerHTML = `<table>
    <thead><tr><th>Colaborador</th><th>Turno</th><th>Entrada</th><th>Salida</th><th>Estatus</th></tr></thead>
    <tbody>${rows}</tbody></table>`;
}

function renderBitacora() {
  const emp = state.empresa;
  const evs = [...LEDGER.hoy(emp.id)].reverse().slice(0, 10);
  const ver = LEDGER.verificar(emp.id);
  const items = evs.length ? evs.map(e => {
    const c = colabById(e.colaboradorId);
    return `<div class="ledger-row">
      <span class="ledger-row__dot ledger-row__dot--${e.tipo}"></span>
      <div class="ledger-row__meta">
        <div class="ledger-row__main">${c ? c.nombre.split(" ").slice(0, 2).join(" ") : e.colaboradorId} · <span class="ledger-row__tipo">${e.tipo}</span></div>
        <div class="ledger-row__sub">${horaTxt(e.ts)} · <span class="mono">#${e.hash}</span></div>
      </div>
    </div>`;
  }).join("") : `<p class="muted-empty">Sin eventos hoy.</p>`;
  $("#bitacoraWrap").innerHTML = `
    <div class="ledger-status ${ver.ok ? "is-ok" : "is-bad"}">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${ver.ok ? '<path d="M20 6 9 17l-5-5"/>' : '<path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><path d="M12 9v4M12 17h.01"/>'}</svg>
      ${ver.ok ? `Cadena íntegra · ${ver.total} eventos` : `Cadena alterada en ${ver.en}`}
    </div>
    <div class="ledger-list">${items}</div>`;
}

function checar(tipo) {
  const sel = $(".select[data-name='checaColab']");
  const colId = sel ? sel.dataset.value : "";
  const c = colabById(colId);
  if (!c) { toast("Selecciona un colaborador."); return; }
  const geo = validarGeo(state.empresa);
  const chip = $("#geoChip");
  if (chip) { chip.classList.toggle("is-bad", !geo.ok); chip.classList.toggle("is-ok", geo.ok); }
  if (!geo.ok) { toast(`Fuera de rango (${geo.dist} m). No se registró.`); return; }
  LEDGER.registrar(state.empresa.id, colId, tipo, geo);
  renderAsistTabla();
  renderBitacora();
  toast(`${tipo === "entrada" ? "Entrada" : "Salida"} registrada · ${c.nombre.split(" ")[0]} · ${horaActual()} · ${geo.dist} m`);
}

/* Modal nuevo turno */
function openTurnoModal() {
  $$(".modal-overlay").forEach(o => o.remove());
  const horas = [];
  for (let h = 6; h <= 23; h++) for (const m of ["00", "30"]) horas.push(`${String(h).padStart(2, "0")}:${m}`);
  const horaOpts = horas.map(h => ({ v: h, label: h }));
  const tolOpts = [5, 10, 15, 20, 30].map(t => ({ v: String(t), label: `${t} min` }));
  const ov = document.createElement("div");
  ov.className = "modal-overlay";
  ov.innerHTML = `
    <div class="modal modal--sm" role="dialog" aria-modal="true" style="text-align:left">
      <div class="modal__head"><h3>Nuevo turno</h3>
        <button class="icon-btn" id="tmClose" aria-label="Cerrar"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18M6 6l12 12"/></svg></button>
      </div>
      <div class="modal__body">
        <div class="field"><label class="field__label">Nombre del turno *</label><input class="input" id="tm-nombre" placeholder="Ej. Matutino" /></div>
        <div class="form-grid" style="margin-top:12px">
          <div class="field"><label class="field__label">Entrada</label>${selectHTML("tmEntrada", "09:00", horaOpts)}</div>
          <div class="field"><label class="field__label">Salida</label>${selectHTML("tmSalida", "18:00", horaOpts)}</div>
          <div class="field"><label class="field__label">Tolerancia</label>${selectHTML("tmTol", "10", tolOpts)}</div>
        </div>
        <p class="form-error" id="tmError"></p>
      </div>
      <div class="modal__foot"><button class="btn btn--ghost" id="tmCancel">Cancelar</button><button class="btn btn--primary" id="tmSave">Crear turno</button></div>
    </div>`;
  document.body.appendChild(ov);
  requestAnimationFrame(() => ov.classList.add("is-on"));
  bindSelect(ov);
  const close = () => { ov.classList.remove("is-on"); setTimeout(() => ov.remove(), 220); };
  $("#tmClose", ov).addEventListener("click", close);
  $("#tmCancel", ov).addEventListener("click", close);
  ov.addEventListener("click", e => { if (e.target === ov) close(); });
  $("#tmSave", ov).addEventListener("click", () => {
    const nombre = $("#tm-nombre", ov).value.trim();
    if (!nombre) { $("#tmError", ov).textContent = "Ponle nombre al turno."; return; }
    DEMO_TURNOS.push({
      id: "t-" + Date.now(), empresaId: state.empresa.id, nombre,
      entrada: $(".select[data-name='tmEntrada']", ov).dataset.value,
      salida: $(".select[data-name='tmSalida']", ov).dataset.value,
      tolerancia: Number($(".select[data-name='tmTol']", ov).dataset.value),
    });
    // TODO firebase: addDoc(collection(db,`empresas/${state.empresa.id}/turnos`), turno)
    close();
    renderAsistencia();
    toast("Turno creado.");
  });
}

/* ---------- Placeholders de módulos ---------- */
const MODS = {
  incidencias: ["Incidencias", "Faltas, retardos, permisos e incapacidades con flujo de aprobación sobre el ledger inmutable.", `<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6"/><path d="M9 13h6M9 17h6"/>`],
  vacaciones:  ["Vacaciones", "Saldos conforme a la LFT, solicitudes y aprobaciones con trazabilidad.", `<rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/>`],
  nom035:      ["NOM-035", "Cuestionarios oficiales, aplicación, resultados y evidencia descargable. Tu diferenciador de cumplimiento — el know-how ya está en tus consultoras.", `<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="m9 12 2 2 4-4"/>`],
  config:      ["Configuración", "Empresas, roles, usuarios y conexión con Firebase.", `<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>`],
};
function renderPlaceholder(view) {
  const m = MODS[view]; if (!m) return;
  $(`#view-${view}`).innerHTML = `
    <div class="page-head"><h1>${m[0]}</h1></div>
    <div class="card"><div class="placeholder">
      <div class="placeholder__icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">${m[2]}</svg></div>
      <h3>${m[0]}</h3><p>${m[1]}</p>
    </div></div>`;
}

/* ---------- Navegación ---------- */
function go(view) {
  if (_clockTimer && view !== "asistencia") { clearInterval(_clockTimer); _clockTimer = null; }
  $$(".view").forEach(v => v.classList.remove("is-on"));
  $(`#view-${view}`)?.classList.add("is-on");
  $$(".nav-item").forEach(n => n.classList.toggle("is-active", n.dataset.view === view));
  if (view === "dashboard") { renderKpis(); renderRecent(); }
  if (view === "colaboradores") renderColab();
  if (view === "organigrama") renderOrganigrama();
  if (view === "asistencia") renderAsistencia();
  if (MODS[view]) renderPlaceholder(view);
  $("#sidebar").classList.remove("is-open");
  $("#scrim").classList.remove("is-on");
  $(".content").scrollTop = 0;
}

/* ---------- Empresa selector ---------- */
function renderEmpresaMenu() {
  $("#empresaMenu").innerHTML = DATA.empresas().map(e => `
    <button class="dropdown__item ${e.id === state.empresa.id ? "is-sel" : ""}" data-id="${e.id}">
      <span class="empresa__dot"></span>
      <span><div style="font-weight:600">${e.nombre}</div><div style="font-size:.72rem;color:var(--muted)">${e.rfc} · ${e.plan}</div></span>
      <svg class="dropdown__check" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"/></svg>
    </button>`).join("");
  $$("#empresaMenu .dropdown__item").forEach(b => b.addEventListener("click", () => {
    state.empresa = DATA.empresas().find(e => e.id === b.dataset.id);
    $("#empresaName").textContent = state.empresa.nombre;
    $("#empresaPlan").textContent = "· " + state.empresa.plan;
    $("#dashSub").textContent = `Resumen de tu personal en ${state.empresa.nombre}.`;
    $("#empresa").classList.remove("is-open");
    renderEmpresaMenu();
    const active = $(".nav-item.is-active")?.dataset.view || "dashboard";
    go(active);
  }));
}

/* ---------- Tema ---------- */
function applyTheme(t) {
  document.documentElement.setAttribute("data-theme", t);
  $("#iconMoon").style.display = t === "dark" ? "none" : "block";
  $("#iconSun").style.display = t === "dark" ? "block" : "none";
  try { localStorage.setItem("panelrh-theme", t); } catch (e) {}
}

/* ---------- Init ---------- */
function bootApp() {
  $("#login").style.display = "none";
  $("#app").classList.add("is-on");
  LEDGER.init();
  renderEmpresaMenu();
  go("dashboard");
}

document.addEventListener("DOMContentLoaded", () => {
  try { applyTheme(localStorage.getItem("panelrh-theme") || "light"); } catch (e) { applyTheme("light"); }

  $("#loginBtn").addEventListener("click", async () => {
    const r = await AUTH.login($("#email").value, $("#pass").value);
    if (r?.ok) bootApp();
  });
  $("#pass").addEventListener("keydown", e => { if (e.key === "Enter") $("#loginBtn").click(); });

  $("#logoutBtn").addEventListener("click", () => {
    AUTH.logout();
    $("#app").classList.remove("is-on");
    $("#login").style.display = "grid";
  });

  $("#themeBtn").addEventListener("click", () =>
    applyTheme(document.documentElement.getAttribute("data-theme") === "dark" ? "light" : "dark"));

  $$(".nav-item[data-view]").forEach(n => n.addEventListener("click", () => go(n.dataset.view)));
  $$("[data-view='colaboradores'].chip, .chip[data-view]").forEach(b => b.addEventListener("click", () => go("colaboradores")));

  $("#empresaBtn").addEventListener("click", e => { e.stopPropagation(); $("#empresa").classList.toggle("is-open"); });
  document.addEventListener("click", () => {
    $("#empresa").classList.remove("is-open");
    $$(".select").forEach(s => s.classList.remove("is-open"));
    $$(".datepick").forEach(d => d.classList.remove("is-open"));
  });

  $("#newColabBtn")?.addEventListener("click", () => openForm("new"));
  $("#exportBtn")?.addEventListener("click", exportarCSV);

  $$("#statusFilter .chip").forEach(c => c.addEventListener("click", () => {
    $$("#statusFilter .chip").forEach(x => x.classList.remove("is-active"));
    c.classList.add("is-active");
    state.filtro = c.dataset.f;
    renderColab();
  }));
  $("#search").addEventListener("input", e => { state.busqueda = e.target.value; go("colaboradores"); });

  $("#overlay").addEventListener("click", closeSheet);
  $("#menuBtn").addEventListener("click", () => { $("#sidebar").classList.add("is-open"); $("#scrim").classList.add("is-on"); });
  $("#scrim").addEventListener("click", () => { $("#sidebar").classList.remove("is-open"); $("#scrim").classList.remove("is-on"); });
});
