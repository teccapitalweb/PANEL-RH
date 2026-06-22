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
            <div class="avatar">${initials(c.nombre)}</div>
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
  const row = (icon, k, v) => `<div class="detail-row">
      <span class="detail-row__k"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${icon}</svg>${k}</span>
      <span class="detail-row__v">${v}</span></div>`;
  $("#sheet").innerHTML = `
    <div class="sheet__head">
      <div class="avatar">${initials(c.nombre)}</div>
      <div><div class="sheet__name">${c.nombre}</div><div class="sheet__role">${c.puesto} · ${c.area}</div></div>
      <button class="icon-btn sheet__close" id="sheetClose" aria-label="Cerrar">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18M6 6l12 12"/></svg>
      </button>
    </div>
    <div class="sheet__body">
      <div style="margin-bottom:4px">${badge(c.estatus)}</div>
      <div class="sheet__section-title">Datos laborales</div>
      ${row(`<rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/>`, "Fecha de ingreso", fechaLarga(c.ingreso))}
      ${row(`<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>`, "Antigüedad", c.antiguedad)}
      ${row(`<rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/>`, "Área", c.area)}
      <div class="sheet__section-title">Contacto</div>
      ${row(`<path d="M4 4h16a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z"/><path d="m22 6-10 7L2 6"/>`, "Correo", c.email)}
      ${row(`<path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.91.34 1.85.57 2.81.7A2 2 0 0 1 22 16.92z"/>`, "Teléfono", c.tel)}
    </div>
    <div class="sheet__foot">
      <button class="btn btn--ghost" id="sheetDelete" style="flex:none;width:46px;padding:0" title="Eliminar">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${ICON_TRASH}</svg>
      </button>
      <button class="btn btn--primary" id="sheetEdit" style="flex:1">Editar colaborador</button>
    </div>`;
  $("#sheet").classList.add("is-on");
  $("#overlay").classList.add("is-on");
  $("#sheetClose").addEventListener("click", closeSheet);
  $("#sheetEdit").addEventListener("click", () => { closeSheet(); openForm("edit", id); });
  $("#sheetDelete").addEventListener("click", () => deleteColab(id));
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
  return `<div class="select" data-name="${name}" data-value="${value}">
    <button type="button" class="select__btn">
      <span class="select__val">${value}</span>
      <svg class="chev" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m6 9 6 6 6-6"/></svg>
    </button>
    <div class="select__menu">
      ${opts.map(o => `<button type="button" class="select__opt ${o === value ? "is-sel" : ""}" data-v="${o}">${o}</button>`).join("")}
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
      $(".select__val", sel).textContent = opt.dataset.v;
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
        <div class="form-grid">
          <div class="field field--full"><label class="field__label">Nombre completo</label><input class="input" id="f-nombre" value="${v("nombre")}" placeholder="Nombre y apellidos" /></div>
          <div class="field"><label class="field__label">Puesto</label><input class="input" id="f-puesto" value="${v("puesto")}" placeholder="Ej. Desarrollador" /></div>
          <div class="field"><label class="field__label">Área</label>${selectHTML("area", v("area") || AREAS[0], AREAS)}</div>
          <div class="field"><label class="field__label">Correo</label><input class="input" id="f-email" type="email" value="${v("email")}" placeholder="correo@empresa.mx" /></div>
          <div class="field"><label class="field__label">Teléfono</label><input class="input" id="f-tel" value="${v("tel")}" placeholder="238 000 0000" /></div>
          <div class="field"><label class="field__label">Fecha de ingreso</label>${datepickHTML("ingreso", v("ingreso") || "")}</div>
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
      area: $(".select[data-name='area']", ov).dataset.value,
      email: $("#f-email", ov).value.trim(),
      tel: $("#f-tel", ov).value.trim(),
      ingreso, estatus: $(".select[data-name='estatus']", ov).dataset.value,
      antiguedad: calcAntiguedad(ingreso),
    };
    if (mode === "edit") {
      Object.assign(c, datos);
      // TODO firebase: updateDoc(doc(db,`empresas/${state.empresa.id}/colaboradores/${id}`), datos)
    } else {
      DEMO_COLABORADORES.push({ id: nuevoId(), empresaId: state.empresa.id, ...datos });
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

/* ---------- Placeholders de módulos ---------- */
const MODS = {
  organigrama: ["Organigrama", "Visualiza la estructura jerárquica de cada empresa. Próximo en construcción.", `<rect x="9" y="2" width="6" height="6" rx="1"/><rect x="2" y="16" width="6" height="6" rx="1"/><rect x="16" y="16" width="6" height="6" rx="1"/><path d="M12 8v4M12 12H5v4M12 12h7v4"/>`],
  asistencia:  ["Asistencia", "Reloj checador con QR y geo-cerca, turnos y tolerancia configurable. Recicla el check-in del member app de Gymvexa.", `<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>`],
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
  $$(".view").forEach(v => v.classList.remove("is-on"));
  $(`#view-${view}`)?.classList.add("is-on");
  $$(".nav-item").forEach(n => n.classList.toggle("is-active", n.dataset.view === view));
  if (view === "dashboard") { renderKpis(); renderRecent(); }
  if (view === "colaboradores") renderColab();
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
