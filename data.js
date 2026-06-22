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

const DEMO_TIPOS_INCIDENCIA = ["Falta", "Retardo", "Permiso con goce", "Permiso sin goce", "Incapacidad", "Vacaciones"];
