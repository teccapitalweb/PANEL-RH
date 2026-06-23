/* =====================================================================
   data.js — Evaluación de Ingreso (kiosko del aspirante)
   ---------------------------------------------------------------------
   Banco de preguntas con metadata de calificación. Cada opción lleva un
   valor de favorabilidad (v: 0 a 3, más alto = mejor). El panel de RH
   usará esta misma metadata para calificar y comparar fortalezas/áreas
   débiles por dimensión. En producción se guarda en Firestore.
   ===================================================================== */

/* Texto del popup final — EDITABLE por RH desde su panel */
const CONFIG = {
  titulo: "Evaluación de ingreso",
  empresa: "TEC CAPITAL",
  mensajeFinTitulo: "¡Listo! Concluiste tu evaluación",
  mensajeFinCuerpo: "Gracias por tu tiempo. El área de Recursos Humanos revisará tus respuestas y te contactará en un plazo de 2 a 3 días hábiles.",
};

/* Contraseña de acceso al panel de RH — CÁMBIALA aquí.
   Nota: es una protección ligera (visible en el código). La seguridad real
   vendrá con Firebase Auth; esto solo evita que un aspirante entre por error. */
const RH_PASS = "teccapital2026";

/* Catálogos para la captura de datos (estilo botón, mínimo tecleo) */
const PUESTOS = ["Atención a cliente", "Cajero(a)", "Ventas", "Almacén", "Administrativo", "Cocina / Producción"];
const ESCOLARIDAD = ["Secundaria", "Preparatoria", "Técnico", "Licenciatura", "Posgrado"];
const GENEROS = ["Masculino", "Femenino", "Otro"];

/* Dimensiones evaluadas (en el orden del examen) */
const DIMENSIONES = {
  perfil: "Sobre ti",
  personalidad: "Personalidad laboral",
  social: "Habilidades sociales",
  intelecto: "Intelecto y razonamiento",
  juicio: "Juicio situacional",
  servicio: "Orientación al servicio",
  estres: "Tolerancia al estrés",
  psicosocial: "Bienestar psicosocial",
  honestidad: "Honestidad e integridad",
  logistica: "Disponibilidad",
  atencion: "Atención y reacción",
};

/* Opciones Likert reutilizables (favorabilidad ya codificada) */
const L = [
  { t: "Totalmente de acuerdo", v: 3 },
  { t: "De acuerdo", v: 2 },
  { t: "En desacuerdo", v: 1 },
  { t: "Totalmente en desacuerdo", v: 0 },
];

/* Banco de preguntas EN ORDEN (la dimensión "atencion" se mide con una tarea aparte).
   Las marcadas con info:true son solo de perfil: se capturan (opción + porqué) pero NO califican. */
const PREGUNTAS = [
  // 1) Sobre ti — calentamiento
  { id: "pf0", dim: "perfil", info: true, sinPorque: true, texto: "¿Cómo te enteraste de esta vacante?", opciones: [
    { t: "Bolsa de trabajo o internet", v: 2 }, { t: "Redes sociales", v: 2 }, { t: "Me la recomendaron", v: 2 }, { t: "Pasé por el lugar", v: 2 }, { t: "Ya conocía la empresa", v: 2 }, { t: "Otro medio", v: 2, otro: true },
  ]},
  { id: "pf1", dim: "perfil", info: true, texto: "¿Qué tipo de actividades disfrutas más?", opciones: [
    { t: "Trabajar en equipo", v: 2 }, { t: "Resolver problemas", v: 2 }, { t: "Atender y ayudar a personas", v: 2 }, { t: "Tareas prácticas o manuales", v: 2 }, { t: "Organizar y planear", v: 2 }, { t: "Otra", v: 2, otro: true },
  ]},
  { id: "pf2", dim: "perfil", info: true, texto: "¿Qué te apasiona o disfrutas fuera del trabajo?", opciones: [
    { t: "El deporte", v: 2 }, { t: "La familia", v: 2 }, { t: "Aprender cosas nuevas", v: 2 }, { t: "El arte o la música", v: 2 }, { t: "Los negocios", v: 2 }, { t: "Otra cosa", v: 2, otro: true },
  ]},
  { id: "pf3", dim: "perfil", texto: "¿Qué es lo más importante para ti en un trabajo?", opciones: [
    { t: "Crecer y aprender", v: 3 }, { t: "Un buen ambiente y equipo", v: 3 }, { t: "Estabilidad y seguridad", v: 2 }, { t: "Principalmente el sueldo", v: 1 },
  ]},
  { id: "pf4", dim: "perfil", texto: "¿Por qué te interesa este puesto?", opciones: [
    { t: "Quiero desarrollarme aquí", v: 3 }, { t: "Me gusta este giro o trabajo", v: 3 }, { t: "Necesito ingresos ahora", v: 2 }, { t: "Me queda cerca de casa", v: 1 },
  ]},
  { id: "pf5", dim: "perfil", texto: "¿Cómo te describirías?", opciones: [
    { t: "Siempre busco mejorar", v: 3 }, { t: "Cumplo bien con lo que me piden", v: 2 }, { t: "Hago lo necesario para salir del paso", v: 1 },
  ]},
  { id: "pf6", dim: "perfil", info: true, porqueLabel: "Cuéntanos un ejemplo de cómo la usas.", texto: "¿Cuál dirías que es tu mayor fortaleza?", opciones: [
    { t: "Responsabilidad", v: 2 }, { t: "Trabajo en equipo", v: 2 }, { t: "Aprendo rápido", v: 2 }, { t: "Trato con la gente", v: 2 }, { t: "Organización", v: 2 }, { t: "Resolver problemas", v: 2 }, { t: "Otra", v: 2, otro: true },
  ]},
  { id: "pf7", dim: "perfil", info: true, porqueLabel: "¿Cómo la estás trabajando o mejorando?", texto: "¿Y una debilidad o algo que estés mejorando?", opciones: [
    { t: "Me cuesta delegar", v: 2 }, { t: "Soy impaciente", v: 2 }, { t: "Me distraigo a veces", v: 2 }, { t: "Me cuesta decir que no", v: 2 }, { t: "Hablar en público", v: 2 }, { t: "Soy muy autocrítico(a)", v: 2 }, { t: "Otra", v: 2, otro: true },
  ]},

  // 1.5) Filtro inicial — motivación y preparación (abierta)
  { id: "ab1", dim: "entrevista", tag: "Motivación", tipo: "abierta",
    texto: "¿Qué te llamó la atención de nuestra cultura o modelo de negocio que no encontraras en otras empresas?",
    ayuda: "Sé específico: menciona algo concreto que conozcas de nosotros.",
    fijarte: "El promedio repite la misión de la web. El sobresaliente menciona un proyecto reciente, un valor específico o un reto del sector." },

  // 2) Personalidad laboral
  { id: "per1", dim: "personalidad", texto: "Termino lo que empiezo, aunque se complique.", opciones: L },
  { id: "per2", dim: "personalidad", texto: "Me gusta aprender cosas nuevas de forma constante.", opciones: L },
  { id: "per3", dim: "personalidad", texto: "Soy puntual y cumplo con los horarios que me asignan.", opciones: L },

  // 2.5) Habilidades sociales
  { id: "soc1", dim: "social", texto: "Me gusta convivir y socializar con mis compañeros de trabajo.", opciones: L },
  { id: "soc2", dim: "social", texto: "Se me facilita relacionarme y hacer equipo con gente nueva.", opciones: L },

  // 3) Intelecto y razonamiento (tienen respuesta correcta)
  { id: "int1", dim: "intelecto", texto: "¿Qué número sigue en la serie?  2, 4, 8, 16, ___", opciones: [
    { t: "32", v: 3, correcta: true }, { t: "24", v: 0 }, { t: "20", v: 0 }, { t: "30", v: 0 },
  ]},
  { id: "int2", dim: "intelecto", texto: "Si 3 cajas iguales pesan 12 kg, ¿cuánto pesan 5 cajas?", opciones: [
    { t: "20 kg", v: 3, correcta: true }, { t: "15 kg", v: 0 }, { t: "24 kg", v: 0 }, { t: "18 kg", v: 0 },
  ]},
  { id: "int3", dim: "intelecto", texto: "“Todos los lunes hay junta. Hoy es lunes.” Entonces…", opciones: [
    { t: "Hoy hay junta", v: 3, correcta: true }, { t: "Hoy no hay junta", v: 0 }, { t: "No se puede saber", v: 0 }, { t: "La junta es mañana", v: 0 },
  ]},

  // 4) Juicio situacional
  { id: "jui1", dim: "juicio", texto: "Un cliente te reclama molesto por algo que no fue tu culpa. ¿Qué haces?", opciones: [
    { t: "Lo escucho, me disculpo por la molestia y busco una solución", v: 3 },
    { t: "Pido apoyo a mi supervisor para resolverlo bien", v: 2 },
    { t: "Le explico que no fue mi culpa", v: 1 },
    { t: "Le pido que espere y sigo con lo mío", v: 0 },
  ]},
  { id: "jui2", dim: "juicio", texto: "Tienes mucho trabajo y llega una tarea urgente. ¿Qué haces?", opciones: [
    { t: "Priorizo lo urgente y reorganizo lo demás", v: 3 },
    { t: "Pido apoyo para no atrasarme", v: 2 },
    { t: "Sigo mi orden y dejo la urgente al final", v: 1 },
    { t: "Me bloqueo y no sé por dónde empezar", v: 0 },
  ]},
  { id: "jui3", dim: "juicio", texto: "Cometiste un error que afecta a tu equipo. ¿Qué haces?", opciones: [
    { t: "Lo informo de inmediato y propongo cómo corregirlo", v: 3 },
    { t: "Trato de corregirlo yo solo antes de que se note", v: 2 },
    { t: "Espero a ver si alguien lo nota", v: 1 },
    { t: "No digo nada", v: 0 },
  ]},

  // 5) Orientación al servicio
  { id: "ser1", dim: "servicio", texto: "Atender bien a un cliente difícil es parte de mi trabajo.", opciones: L },
  { id: "ser2", dim: "servicio", texto: "Disfruto un trabajo donde trato con personas todo el día.", opciones: L },

  // 6) Tolerancia al estrés
  { id: "est1", dim: "estres", texto: "Cuando hay mucha carga, mantengo la calma y sigo adelante.", opciones: L },
  { id: "est2", dim: "estres", texto: "La presión me motiva más de lo que me estresa.", opciones: L },

  // 7) Bienestar psicosocial
  { id: "psi1", dim: "psicosocial", texto: "En general me siento con energía y ánimo para trabajar.", opciones: L },
  { id: "psi2", dim: "psicosocial", texto: "Puedo separar los problemas personales del trabajo.", opciones: L },

  // 8) Honestidad e integridad
  { id: "hon1", dim: "honestidad", texto: "Quedarse con dinero de la caja si nadie lo nota está...", opciones: [
    { t: "Nunca justificado", v: 3 }, { t: "Casi nunca justificado", v: 2 }, { t: "A veces justificado", v: 1 }, { t: "Bien si es poco", v: 0 },
  ]},
  { id: "hon2", dim: "honestidad", texto: "Si te dan cambio de más en una compra, ¿qué haces?", opciones: [
    { t: "Lo regreso siempre", v: 3 }, { t: "Depende del monto", v: 1 }, { t: "Me lo quedo", v: 0 },
  ]},
  { id: "hon3", dim: "honestidad", texto: "Reportar una falta propia, aunque me perjudique, es lo correcto.", opciones: L },

  // 9) Disponibilidad / logística (cierre)
  { id: "log1", dim: "logistica", texto: "¿Qué turnos puedes cubrir?", opciones: [
    { t: "Cualquier turno", v: 3 }, { t: "Matutino y vespertino", v: 2 }, { t: "Solo matutino", v: 1 }, { t: "Solo fines de semana", v: 1 },
  ]},
  { id: "log2", dim: "logistica", texto: "¿Cómo te trasladarías al trabajo?", opciones: [
    { t: "Transporte propio", v: 3 }, { t: "Transporte público", v: 2 }, { t: "Aún no lo sé", v: 1 },
  ]},
  { id: "log3", dim: "logistica", texto: "¿Cuándo podrías iniciar?", opciones: [
    { t: "De inmediato", v: 3 }, { t: "En una semana", v: 2 }, { t: "En un mes", v: 1 }, { t: "Aún no sé", v: 0 },
  ]},

  // 10) Entrevista a profundidad (abiertas — las evalúa RH)
  { id: "ab2", dim: "entrevista", tag: "Tu experiencia (STAR)", tipo: "abierta",
    texto: "Cuéntame sobre la decisión más difícil que tomaste en tu empleo anterior. ¿Qué alternativas tenías y cuál fue el resultado?",
    ayuda: "Cuenta el caso concreto: la situación, las opciones que tenías, qué hiciste y el resultado.",
    fijarte: "Busca estructura STAR (Situación, Tarea, Acción, Resultado). Si responde con generalidades, repregunta por el caso específico; sin un ejemplo real, no posee la competencia." },
  { id: "ab3", dim: "entrevista", tag: "Aprendizaje y resiliencia", tipo: "abierta",
    texto: "Háblame de un proyecto o meta que no hayas logrado. ¿Qué factor falló y qué aprendiste de esa experiencia?",
    ayuda: "Enfócate en qué falló, en tu parte y en qué aprendiste.",
    fijarte: "Descarta a quienes se victimizan o usan falsos defectos ('soy perfeccionista'). Busca responsabilidad propia y un aprendizaje aplicado y medible." },
  { id: "ab4", dim: "entrevista", tag: "Trabajo en equipo", tipo: "abierta",
    texto: "Describe al mejor jefe que has tenido: ¿qué hacía para motivarte? Y ahora, describe al jefe con el que más te ha costado trabajar.",
    ayuda: "Describe ambos perfiles y por qué.",
    fijarte: "Compara con el estilo del líder de la vacante. Si su 'jefe ideal' choca con ese estilo (p. ej. micro-gestor vs delegativo), el candidato frustrará el proceso." },
  { id: "ab5", dim: "entrevista", tag: "Tus preguntas", tipo: "abierta",
    texto: "¿Qué preguntas tienes sobre el equipo, el puesto o los retos de la empresa?",
    ayuda: "Escribe las dudas reales que tengas; no solo sueldo o prestaciones.",
    fijarte: "El destacado pregunta por los objetivos de los primeros 90 días, la estructura del equipo o las métricas de éxito; no solo por los beneficios." },
];

/* Umbrales para clasificar cada dimensión (porcentaje 0-1) */
const NIVEL_DIM = [
  { min: 0.75, label: "Fortaleza", cls: "ok" },
  { min: 0.45, label: "Promedio", cls: "warn" },
  { min: 0,    label: "Área de oportunidad", cls: "bad" },
];

/* Dimensiones críticas: si salen bajas, levantan bandera para RH */
const CRITICAS = ["honestidad", "juicio"];

/* Puente para el panel de RH (lee estos valores) */
if (typeof window !== "undefined") { window.__EVAL = { PREGUNTAS, DIMENSIONES, NIVEL_DIM, CRITICAS, CONFIG, RH_PASS, PUESTOS }; }
