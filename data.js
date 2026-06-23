/* =====================================================================
   data.js — Datos de demostración del Panel RH
   ---------------------------------------------------------------------
   Simula lo que vendrá de Firestore. Multi-tenant: cada colaborador
   pertenece a una empresa (tenant). jefeId = a quién reporta (organigrama).
   ===================================================================== */

const DEMO_EMPRESAS = [
  { id: "tec-capital",  nombre: "TEC CAPITAL Group", rfc: "TCG230101AB1", plan: "Pro" },
  { id: "dermalysse",   nombre: "Dermalysse",        rfc: "DER220615XY2", plan: "Esencial" },
  { id: "fisioteck",    nombre: "FisioTeck",         rfc: "FIT210908QR3", plan: "Pro" },
];

const DEMO_KPIS = {
  "tec-capital": { activos: 24, asistenciaHoy: 21, incidencias: 3, nom035: "Vigente" },
  "dermalysse":  { activos: 9,  asistenciaHoy: 8,  incidencias: 1, nom035: "Pendiente" },
  "fisioteck":   { activos: 14, asistenciaHoy: 12, incidencias: 2, nom035: "Vigente" },
};

const DEMO_COLABORADORES = [
  { id: "c001", empresaId: "tec-capital", jefeId: "", foto: "", nombre: "Miguel Ángel Ruiz", puesto: "Líder de Desarrollo", area: "Tecnología", ingreso: "2023-02-01", estatus: "Activo",
    curp: "RUMM900315HPLZGL05", rfc: "RUMM900315J27", nss: "12089012345", nacimiento: "1990-03-15", genero: "Masculino", estadoCivil: "Casado/a",
    email: "miguel@teccapital.mx", tel: "238 111 2233", domicilio: "Av. Reforma 145, Centro, Tehuacán, Pue.", emergenciaNombre: "Laura Ruiz", emergenciaTel: "238 145 9080",
    tipoContrato: "Indeterminado", jornada: "Diurna", salario: 28000, antiguedad: "3 a 4 m" },
  { id: "c002", empresaId: "tec-capital", jefeId: "c001", foto: "", nombre: "Britney Salas", puesto: "Coordinadora Dev", area: "Tecnología", ingreso: "2023-05-15", estatus: "Activo",
    curp: "SABB920708MPLLRR02", rfc: "SABB920708K15", nss: "13109223456", nacimiento: "1992-07-08", genero: "Femenino", estadoCivil: "Soltero/a",
    email: "britney@teccapital.mx", tel: "238 222 3344", domicilio: "Calle 3 Norte 220, San Diego, Tehuacán, Pue.", emergenciaNombre: "Mario Salas", emergenciaTel: "238 220 7711",
    tipoContrato: "Indeterminado", jornada: "Diurna", salario: 24000, antiguedad: "3 a 1 m" },
  { id: "c003", empresaId: "tec-capital", jefeId: "c002", foto: "", nombre: "Jesús Hernández", puesto: "Desarrollador", area: "Tecnología", ingreso: "2024-01-09", estatus: "Activo",
    curp: "HEJJ950122HPLRSS08", rfc: "HEJJ950122L93", nss: "14209534567", nacimiento: "1995-01-22", genero: "Masculino", estadoCivil: "Soltero/a",
    email: "jesus.h@teccapital.mx", tel: "238 333 4455", domicilio: "Priv. Hidalgo 12, La Purísima, Tehuacán, Pue.", emergenciaNombre: "Rosa Hernández", emergenciaTel: "238 333 1290",
    tipoContrato: "Determinado", jornada: "Diurna", salario: 19000, antiguedad: "2 a 5 m" },
  { id: "c004", empresaId: "tec-capital", jefeId: "c001", foto: "", nombre: "Ricardo Olmos", puesto: "Soporte IPCI", area: "Operación", ingreso: "2022-09-08", estatus: "Activo",
    curp: "OOLR880930HPLLMC04", rfc: "OOLR880930H44", nss: "11088845678", nacimiento: "1988-09-30", genero: "Masculino", estadoCivil: "Casado/a",
    email: "ricardo@teccapital.mx", tel: "238 444 5566", domicilio: "Av. Independencia 78, Centro, Tehuacán, Pue.", emergenciaNombre: "Ana Olmos", emergenciaTel: "238 444 6655",
    tipoContrato: "Indeterminado", jornada: "Mixta", salario: 17500, antiguedad: "3 a 9 m" },
  { id: "c005", empresaId: "tec-capital", jefeId: "c001", foto: "", nombre: "Laura Mendoza", puesto: "Administración", area: "Finanzas", ingreso: "2023-11-20", estatus: "Vacaciones",
    curp: "MELA910412MPLNRA07", rfc: "MELA910412M68", nss: "13009145679", nacimiento: "1991-04-12", genero: "Femenino", estadoCivil: "Casado/a",
    email: "laura@teccapital.mx", tel: "238 555 6677", domicilio: "Calle 5 Sur 340, El Carmen, Tehuacán, Pue.", emergenciaNombre: "Pedro Mendoza", emergenciaTel: "238 555 9922",
    tipoContrato: "Indeterminado", jornada: "Diurna", salario: 16000, antiguedad: "2 a 7 m" },
  { id: "c006", empresaId: "tec-capital", jefeId: "c001", foto: "", nombre: "Carlos Vega", puesto: "Ventas", area: "Comercial", ingreso: "2024-03-04", estatus: "Activo",
    curp: "VECA960825HPLGRL01", rfc: "VECA960825N31", nss: "14309656780", nacimiento: "1996-08-25", genero: "Masculino", estadoCivil: "Unión libre",
    email: "carlos.v@teccapital.mx", tel: "238 666 7788", domicilio: "Blvd. Hnos. Serdán 410, Tehuacán, Pue.", emergenciaNombre: "Diana Vega", emergenciaTel: "238 666 3344",
    tipoContrato: "Determinado", jornada: "Diurna", salario: 15000, antiguedad: "2 a 3 m" },
  { id: "c007", empresaId: "dermalysse", jefeId: "", foto: "", nombre: "Ana Sofía Torres", puesto: "Dermoconsultora", area: "Clínica", ingreso: "2023-07-01", estatus: "Activo",
    curp: "TOSA930219MPLRRN09", rfc: "TOSA930219P52", nss: "13109367891", nacimiento: "1993-02-19", genero: "Femenino", estadoCivil: "Soltero/a",
    email: "ana@dermalysse.mx", tel: "238 777 8899", domicilio: "Av. Juárez 56, Centro, Tehuacán, Pue.", emergenciaNombre: "Sofía Torres", emergenciaTel: "238 777 1234",
    tipoContrato: "Indeterminado", jornada: "Diurna", salario: 18000, antiguedad: "2 a 11 m" },
  { id: "c008", empresaId: "dermalysse", jefeId: "c007", foto: "", nombre: "Paola Ríos", puesto: "Recepción", area: "Operación", ingreso: "2024-02-19", estatus: "Activo",
    curp: "RIPP980605MPLSLL03", rfc: "RIPP980605Q19", nss: "14209478902", nacimiento: "1998-06-05", genero: "Femenino", estadoCivil: "Soltero/a",
    email: "paola@dermalysse.mx", tel: "238 888 9900", domicilio: "Calle 7 Pte 88, San Pablo, Tehuacán, Pue.", emergenciaNombre: "Jorge Ríos", emergenciaTel: "238 888 5566",
    tipoContrato: "Capacitación inicial", jornada: "Diurna", salario: 11000, antiguedad: "2 a 4 m" },
  { id: "c009", empresaId: "fisioteck", jefeId: "", foto: "", nombre: "David Castro", puesto: "Fisioterapeuta", area: "Clínica", ingreso: "2022-12-12", estatus: "Activo",
    curp: "CADD890717HPLSVV06", rfc: "CADD890717R88", nss: "11089089013", nacimiento: "1989-07-17", genero: "Masculino", estadoCivil: "Casado/a",
    email: "david@fisioteck.mx", tel: "238 999 0011", domicilio: "Av. Tecnológico 300, Tehuacán, Pue.", emergenciaNombre: "Mónica Castro", emergenciaTel: "238 999 7788",
    tipoContrato: "Indeterminado", jornada: "Mixta", salario: 20000, antiguedad: "3 a 6 m" },
  { id: "c010", empresaId: "fisioteck", jefeId: "c009", foto: "", nombre: "Mariana López", puesto: "Recepción", area: "Operación", ingreso: "2024-04-22", estatus: "Incidencia",
    curp: "LOMM000128MPLPRR05", rfc: "LOMM000128T20", nss: "15209190124", nacimiento: "2000-01-28", genero: "Femenino", estadoCivil: "Soltero/a",
    email: "mariana@fisioteck.mx", tel: "238 100 1122", domicilio: "Calle 9 Nte 15, Centro, Tehuacán, Pue.", emergenciaNombre: "Rosa López", emergenciaTel: "238 100 9988",
    tipoContrato: "Periodo de prueba", jornada: "Diurna", salario: 10500, antiguedad: "2 a 2 m" },
];

/* Historial laboral y documentos demo (algunos colaboradores).
   Los que no tienen historial muestran una entrada "Alta" derivada del ingreso. */
const _h = (id, hist) => { const c = DEMO_COLABORADORES.find(x => x.id === id); if (c) c.historial = hist; };
const _d = (id, docs) => { const c = DEMO_COLABORADORES.find(x => x.id === id); if (c) c.documentos = docs; };

_h("c001", [
  { fecha: "2023-02-01", tipo: "Alta", detalle: "Ingreso como Desarrollador" },
  { fecha: "2023-09-01", tipo: "Salario", detalle: "$22,000 MXN → $25,000 MXN" },
  { fecha: "2024-03-15", tipo: "Puesto", detalle: "Desarrollador → Líder de Desarrollo" },
  { fecha: "2024-06-01", tipo: "Salario", detalle: "$25,000 MXN → $28,000 MXN" },
]);
_d("c001", [
  { tipo: "INE", nombre: "INE_MiguelRuiz.pdf", fecha: "2023-02-01" },
  { tipo: "CURP", nombre: "CURP_MiguelRuiz.pdf", fecha: "2023-02-01" },
  { tipo: "Contrato firmado", nombre: "Contrato_MiguelRuiz.pdf", fecha: "2023-02-01" },
]);
_h("c002", [
  { fecha: "2023-05-15", tipo: "Alta", detalle: "Ingreso como Coordinadora Dev" },
  { fecha: "2024-01-10", tipo: "Salario", detalle: "$20,000 MXN → $24,000 MXN" },
]);
_h("c007", [
  { fecha: "2023-07-01", tipo: "Alta", detalle: "Ingreso como Dermoconsultora" },
  { fecha: "2024-02-01", tipo: "Salario", detalle: "$15,000 MXN → $18,000 MXN" },
]);
_d("c007", [
  { tipo: "INE", nombre: "INE_AnaTorres.pdf", fecha: "2023-07-01" },
  { tipo: "Comprobante de domicilio", nombre: "Domicilio_AnaTorres.pdf", fecha: "2023-07-01" },
]);
_h("c009", [
  { fecha: "2022-12-12", tipo: "Alta", detalle: "Ingreso como Fisioterapeuta" },
  { fecha: "2023-12-01", tipo: "Salario", detalle: "$17,000 MXN → $20,000 MXN" },
]);

const DEMO_TIPOS_INCIDENCIA = ["Falta", "Retardo", "Permiso con goce", "Permiso sin goce", "Incapacidad"];

/* =====================================================================
   FASE 2 — Asistencia: turnos, geo de sucursal y ledger semilla
   ===================================================================== */

/* Geo de sucursal por empresa (para la geo-cerca del checador) */
DEMO_EMPRESAS.find(e => e.id === "tec-capital").geo = { lat: 18.4621, lng: -97.3928, radio: 60, sucursal: "Matriz Tehuacán" };
DEMO_EMPRESAS.find(e => e.id === "dermalysse").geo  = { lat: 18.4589, lng: -97.4012, radio: 50, sucursal: "Clínica Centro" };
DEMO_EMPRESAS.find(e => e.id === "fisioteck").geo   = { lat: 18.4655, lng: -97.3880, radio: 50, sucursal: "Sucursal Tecnológico" };

/* Turnos por empresa */
const DEMO_TURNOS = [
  { id: "t-tec-mat",  empresaId: "tec-capital", nombre: "Matutino",   entrada: "09:00", salida: "18:00", tolerancia: 10 },
  { id: "t-tec-vesp", empresaId: "tec-capital", nombre: "Vespertino", entrada: "14:00", salida: "22:00", tolerancia: 10 },
  { id: "t-der",      empresaId: "dermalysse",  nombre: "Clínica",    entrada: "09:00", salida: "18:00", tolerancia: 15 },
  { id: "t-fis-am",   empresaId: "fisioteck",   nombre: "Clínica AM", entrada: "08:00", salida: "16:00", tolerancia: 15 },
  { id: "t-fis-pm",   empresaId: "fisioteck",   nombre: "Clínica PM", entrada: "14:00", salida: "21:00", tolerancia: 15 },
];

/* Asignación de turno por colaborador */
const _turno = (ids, tId) => ids.forEach(id => { const c = DEMO_COLABORADORES.find(x => x.id === id); if (c) c.turnoId = tId; });
_turno(["c001", "c002", "c003", "c004", "c006"], "t-tec-mat");
_turno(["c005"], "t-tec-vesp");
_turno(["c007", "c008"], "t-der");
_turno(["c009"], "t-fis-am");
_turno(["c010"], "t-fis-pm");

/* Eventos de asistencia de HOY (semilla cruda; app.js arma la cadena con hashes).
   hora en formato HH:MM; el ledger les pone el timestamp de hoy al arrancar. */
const DEMO_ASISTENCIA_SEED = [
  { empresaId: "tec-capital", colaboradorId: "c004", tipo: "entrada", hora: "08:45" },
  { empresaId: "tec-capital", colaboradorId: "c001", tipo: "entrada", hora: "08:58" },
  { empresaId: "tec-capital", colaboradorId: "c002", tipo: "entrada", hora: "09:02" },
  { empresaId: "tec-capital", colaboradorId: "c003", tipo: "entrada", hora: "09:18" },
  { empresaId: "tec-capital", colaboradorId: "c004", tipo: "salida",  hora: "16:10" },
  { empresaId: "tec-capital", colaboradorId: "c001", tipo: "salida",  hora: "18:05" },
  { empresaId: "dermalysse",  colaboradorId: "c007", tipo: "entrada", hora: "09:00" },
  { empresaId: "dermalysse",  colaboradorId: "c008", tipo: "entrada", hora: "09:25" },
  { empresaId: "dermalysse",  colaboradorId: "c007", tipo: "salida",  hora: "18:00" },
  { empresaId: "fisioteck",   colaboradorId: "c009", tipo: "entrada", hora: "08:00" },
  { empresaId: "fisioteck",   colaboradorId: "c009", tipo: "salida",  hora: "16:00" },
];

/* =====================================================================
   FASE 2 · Parte 2 — Incidencias (con flujo de aprobación)
   ===================================================================== */

/* Fechas relativas a hoy para que la demo siempre esté vigente */
const _hoyBase = new Date();
const _fd = n => { const d = new Date(_hoyBase); d.setDate(d.getDate() + n); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`; };

/* Semilla de incidencias. app.js arma la auditoría (cadena de hashes) al arrancar.
   creadaDiasAtras / decisionDiasAtras: hace cuántos días ocurrió cada acción. */
const DEMO_INCIDENCIAS = [
  // TEC CAPITAL
  { id: "inc2", empresaId: "tec-capital", colaboradorId: "c003", tipo: "Retardo",           inicio: _fd(0),  fin: _fd(0),   motivo: "Retardo por tráfico en la entrada.", estatus: "Pendiente", creadaDiasAtras: 0 },
  { id: "inc3", empresaId: "tec-capital", colaboradorId: "c002", tipo: "Permiso con goce",  inicio: _fd(2),  fin: _fd(2),   motivo: "Trámite personal (medio día).", estatus: "Pendiente", creadaDiasAtras: 1 },
  { id: "inc4", empresaId: "tec-capital", colaboradorId: "c004", tipo: "Permiso sin goce",  inicio: _fd(-10), fin: _fd(-10), motivo: "Asunto familiar.", estatus: "Aprobada",  creadaDiasAtras: 12, decisionDiasAtras: 11, decisionNota: "OK." },
  { id: "inc5", empresaId: "tec-capital", colaboradorId: "c006", tipo: "Falta",             inicio: _fd(-3), fin: _fd(-3),  motivo: "No se presentó ni avisó.", estatus: "Rechazada", creadaDiasAtras: 3, decisionDiasAtras: 2, decisionNota: "Falta injustificada, sin documento." },
  // DERMALYSSE
  { id: "inc6", empresaId: "dermalysse", colaboradorId: "c008", tipo: "Incapacidad",        inicio: _fd(-1), fin: _fd(2),   motivo: "Incapacidad IMSS (cuadro gripal).", estatus: "Aprobada", creadaDiasAtras: 2, decisionDiasAtras: 1, decisionNota: "Folio IMSS recibido." },
  { id: "inc7", empresaId: "dermalysse", colaboradorId: "c007", tipo: "Permiso con goce",   inicio: _fd(5),  fin: _fd(5),   motivo: "Capacitación externa.", estatus: "Pendiente", creadaDiasAtras: 0 },
  // FISIOTECK
  { id: "inc8", empresaId: "fisioteck",  colaboradorId: "c010", tipo: "Incapacidad",        inicio: _fd(-2), fin: _fd(1),   motivo: "Incapacidad IMSS.", estatus: "Aprobada", creadaDiasAtras: 3, decisionDiasAtras: 2, decisionNota: "Documento validado." },
];

/* =====================================================================
   FASE 2 · Parte 3 — Vacaciones (saldos LFT + solicitud/aprobación)
   ===================================================================== */
const DEMO_VACACIONES = [
  // TEC CAPITAL
  { id: "vac1", empresaId: "tec-capital", colaboradorId: "c005", inicio: _fd(-1),  fin: _fd(3),   motivo: "Vacaciones anuales.", estatus: "Aprobada",  creadaDiasAtras: 7,  decisionDiasAtras: 6,  decisionNota: "Autorizado por dirección." },
  { id: "vac2", empresaId: "tec-capital", colaboradorId: "c001", inicio: _fd(-45), fin: _fd(-41), motivo: "Puente vacacional.", estatus: "Aprobada",  creadaDiasAtras: 60, decisionDiasAtras: 58, decisionNota: "OK." },
  { id: "vac3", empresaId: "tec-capital", colaboradorId: "c002", inicio: _fd(20),  fin: _fd(24),  motivo: "Viaje familiar.", estatus: "Pendiente", creadaDiasAtras: 1 },
  { id: "vac4", empresaId: "tec-capital", colaboradorId: "c004", inicio: _fd(-120),fin: _fd(-114),motivo: "Vacaciones.", estatus: "Aprobada",  creadaDiasAtras: 130, decisionDiasAtras: 128 },
  // DERMALYSSE
  { id: "vac5", empresaId: "dermalysse", colaboradorId: "c007", inicio: _fd(30),  fin: _fd(34),  motivo: "Vacaciones programadas.", estatus: "Pendiente", creadaDiasAtras: 0 },
  // FISIOTECK
  { id: "vac6", empresaId: "fisioteck",  colaboradorId: "c009", inicio: _fd(-30), fin: _fd(-23), motivo: "Vacaciones.", estatus: "Aprobada",  creadaDiasAtras: 40, decisionDiasAtras: 38 },
  { id: "vac7", empresaId: "fisioteck",  colaboradorId: "c009", inicio: _fd(7),   fin: _fd(11),  motivo: "Vacaciones programadas.", estatus: "Pendiente", creadaDiasAtras: 1 },
];

/* =====================================================================
   FASE 3 — Cumplimiento: NOM-035 (cuestionario oficial) + Vencimientos
   ---------------------------------------------------------------------
   Cuestionario basado en la Guía de Referencia II de la NOM-035-STPS-2018
   (categorías y dominios oficiales; conjunto representativo de reactivos).
   Escala Likert de 5 niveles. Reactivos "inverso: true" están redactados
   en positivo (a mayor frecuencia, menor riesgo).
   ===================================================================== */

const NOM035_OPCIONES = ["Siempre", "Casi siempre", "Algunas veces", "Casi nunca", "Nunca"];

const NOM035_CUESTIONARIO = [
  { categoria: "Ambiente de trabajo", items: [
    { id: "q1", texto: "El espacio donde trabajo me permite realizar mis actividades de manera segura e higiénica.", inverso: true },
    { id: "q2", texto: "El ruido, la temperatura o la iluminación del lugar me dificultan concentrarme.", inverso: false },
    { id: "q3", texto: "Cuento con el equipo y las herramientas necesarias para hacer mi trabajo.", inverso: true },
  ]},
  { categoria: "Factores propios de la actividad", items: [
    { id: "q4", texto: "Mi carga de trabajo es excesiva para el tiempo del que dispongo.", inverso: false },
    { id: "q5", texto: "Debo atender varias tareas o asuntos urgentes al mismo tiempo.", inverso: false },
    { id: "q6", texto: "Puedo decidir cómo organizar y realizar mi trabajo.", inverso: true },
    { id: "q7", texto: "Recibo la capacitación necesaria para realizar bien mis funciones.", inverso: true },
  ]},
  { categoria: "Organización del tiempo de trabajo", items: [
    { id: "q8", texto: "Trabajo tiempo extra con frecuencia más allá de mi jornada.", inverso: false },
    { id: "q9", texto: "Mi trabajo me impide atender asuntos familiares o personales.", inverso: false },
    { id: "q10", texto: "Puedo tomar pausas o descansos durante mi jornada.", inverso: true },
  ]},
  { categoria: "Liderazgo y relaciones en el trabajo", items: [
    { id: "q11", texto: "Mi jefe me da instrucciones claras y me apoya cuando lo necesito.", inverso: true },
    { id: "q12", texto: "Recibo reconocimiento cuando hago bien mi trabajo.", inverso: true },
    { id: "q13", texto: "Existe buena comunicación y colaboración con mis compañeros.", inverso: true },
    { id: "q14", texto: "Cuando hay conflictos en el trabajo, se resuelven de forma respetuosa.", inverso: true },
    { id: "q15", texto: "He presenciado o sufrido malos tratos, hostigamiento o acoso en el trabajo.", inverso: false },
  ]},
];

/* Campaña de evaluación por empresa (fecha de aplicación y de reevaluación) */
const DEMO_NOM035_CAMPANAS = [
  { empresaId: "tec-capital", guia: "Guía de Referencia II", aplicada: _fd(-95),  vence: _fd(270) },
  { empresaId: "dermalysse",  guia: "Guía de Referencia II", aplicada: _fd(-340), vence: _fd(22)  },
  { empresaId: "fisioteck",   guia: "Guía de Referencia II", aplicada: _fd(-60),  vence: _fd(305) },
];

/* Respuestas sembradas (app.js genera el vector de respuestas según el perfil de riesgo) */
const DEMO_NOM035_SEED = [
  { empresaId: "tec-capital", colaboradorId: "c001", target: "Bajo" },
  { empresaId: "tec-capital", colaboradorId: "c002", target: "Medio" },
  { empresaId: "tec-capital", colaboradorId: "c003", target: "Alto" },
  { empresaId: "tec-capital", colaboradorId: "c004", target: "Bajo" },
  { empresaId: "tec-capital", colaboradorId: "c005", target: "Medio" },
  // c006 queda pendiente de responder
  { empresaId: "dermalysse",  colaboradorId: "c007", target: "Medio" },
  { empresaId: "dermalysse",  colaboradorId: "c008", target: "Bajo" },
  { empresaId: "fisioteck",   colaboradorId: "c009", target: "Bajo" },
  { empresaId: "fisioteck",   colaboradorId: "c010", target: "Alto" },
];

/* Vencimientos (la reevaluación NOM-035 se agrega automáticamente desde la campaña) */
const DEMO_VENCIMIENTOS = [
  { id: "v1", empresaId: "tec-capital", tipo: "Contrato determinado", colaboradorId: "c006", titulo: "Fin de contrato determinado", fecha: _fd(12) },
  { id: "v2", empresaId: "tec-capital", tipo: "Contrato determinado", colaboradorId: "c003", titulo: "Fin de contrato determinado", fecha: _fd(-5) },
  { id: "v3", empresaId: "tec-capital", tipo: "Examen médico", colaboradorId: null, titulo: "Exámenes médicos periódicos (equipo)", fecha: _fd(25) },
  { id: "v4", empresaId: "tec-capital", tipo: "Capacitación", colaboradorId: null, titulo: "Curso de protección civil", fecha: _fd(70) },
  { id: "v5", empresaId: "dermalysse",  tipo: "Contrato capacitación", colaboradorId: "c008", titulo: "Fin de contrato de capacitación inicial", fecha: _fd(8) },
  { id: "v6", empresaId: "fisioteck",   tipo: "Periodo de prueba", colaboradorId: "c010", titulo: "Fin de periodo de prueba", fecha: _fd(-2) },
  { id: "v7", empresaId: "fisioteck",   tipo: "Capacitación", colaboradorId: null, titulo: "Curso de primeros auxilios", fecha: _fd(40) },
];
