/* =====================================================================
   data.js — Datos de demostración del Panel RH
   ---------------------------------------------------------------------
   Esto simula lo que vendrá de Firestore. Cuando conectes Firebase,
   reemplaza las lecturas de DEMO_* por queries reales (ver app.js → DATA).
   Estructura multi-tenant: cada colaborador pertenece a una empresa (tenant).
   ===================================================================== */

const DEMO_EMPRESAS = [
  { id: "tec-capital",  nombre: "TEC CAPITAL Group", rfc: "TCG230101AB1", plan: "Pro" },
  { id: "dermalysse",   nombre: "Dermalysse",        rfc: "DER220615XY2", plan: "Esencial" },
  { id: "fisioteck",    nombre: "FisioTeck",         rfc: "FIT210908QR3", plan: "Pro" },
];

/* KPIs por empresa (demo). En producción: agregaciones de Firestore. */
const DEMO_KPIS = {
  "tec-capital": { activos: 24, asistenciaHoy: 21, incidencias: 3, nom035: "Vigente" },
  "dermalysse":  { activos: 9,  asistenciaHoy: 8,  incidencias: 1, nom035: "Pendiente" },
  "fisioteck":   { activos: 14, asistenciaHoy: 12, incidencias: 2, nom035: "Vigente" },
};

/* Colaboradores (expediente). En producción: colección `colaboradores`
   filtrada por empresaId con reglas de seguridad por tenant. */
const DEMO_COLABORADORES = [
  { id: "c001", empresaId: "tec-capital", nombre: "Miguel Ángel Ruiz",    puesto: "Líder de Desarrollo", area: "Tecnología", ingreso: "2023-02-01", estatus: "Activo",   email: "miguel@teccapital.mx",   tel: "238 111 2233", antiguedad: "3 a 4 m" },
  { id: "c002", empresaId: "tec-capital", nombre: "Britney Salas",        puesto: "Coordinadora Dev",    area: "Tecnología", ingreso: "2023-05-15", estatus: "Activo",   email: "britney@teccapital.mx",  tel: "238 222 3344", antiguedad: "3 a 1 m" },
  { id: "c003", empresaId: "tec-capital", nombre: "Jesús Hernández",      puesto: "Desarrollador",       area: "Tecnología", ingreso: "2024-01-09", estatus: "Activo",   email: "jesus.h@teccapital.mx",  tel: "238 333 4455", antiguedad: "2 a 5 m" },
  { id: "c004", empresaId: "tec-capital", nombre: "Ricardo Olmos",        puesto: "Soporte IPCI",        area: "Operación",  ingreso: "2022-09-08", estatus: "Activo",   email: "ricardo@teccapital.mx",  tel: "238 444 5566", antiguedad: "3 a 9 m" },
  { id: "c005", empresaId: "tec-capital", nombre: "Laura Mendoza",        puesto: "Administración",      area: "Finanzas",   ingreso: "2023-11-20", estatus: "Vacaciones", email: "laura@teccapital.mx",  tel: "238 555 6677", antiguedad: "2 a 7 m" },
  { id: "c006", empresaId: "tec-capital", nombre: "Carlos Vega",          puesto: "Ventas",              area: "Comercial",  ingreso: "2024-03-04", estatus: "Activo",   email: "carlos.v@teccapital.mx", tel: "238 666 7788", antiguedad: "2 a 3 m" },
  { id: "c007", empresaId: "dermalysse",  nombre: "Ana Sofía Torres",     puesto: "Dermoconsultora",     area: "Clínica",    ingreso: "2023-07-01", estatus: "Activo",   email: "ana@dermalysse.mx",      tel: "238 777 8899", antiguedad: "2 a 11 m" },
  { id: "c008", empresaId: "dermalysse",  nombre: "Paola Ríos",           puesto: "Recepción",           area: "Operación",  ingreso: "2024-02-19", estatus: "Activo",   email: "paola@dermalysse.mx",    tel: "238 888 9900", antiguedad: "2 a 4 m" },
  { id: "c009", empresaId: "fisioteck",   nombre: "David Castro",         puesto: "Fisioterapeuta",      area: "Clínica",    ingreso: "2022-12-12", estatus: "Activo",   email: "david@fisioteck.mx",     tel: "238 999 0011", antiguedad: "3 a 6 m" },
  { id: "c010", empresaId: "fisioteck",   nombre: "Mariana López",        puesto: "Recepción",           area: "Operación",  ingreso: "2024-04-22", estatus: "Incidencia", email: "mariana@fisioteck.mx", tel: "238 100 1122", antiguedad: "2 a 2 m" },
];

/* Catálogo de incidencias (para futuros módulos). */
const DEMO_TIPOS_INCIDENCIA = ["Falta", "Retardo", "Permiso con goce", "Permiso sin goce", "Incapacidad", "Vacaciones"];
