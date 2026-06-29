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
  avisoResponsable: "TEC CAPITAL Group",
  avisoContacto: "privacidad@teccapital.com",
  avisoVersion: "1.0",
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
  puesto: "Aptitud para el puesto",
  situaciones: "Situaciones",
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

/* ---------- Preguntas EXTRA exclusivas del examen por fases ----------
   Estas se suman a una copia del banco general para formar el banco
   independiente del examen por fases (ver PREGUNTAS_FASES más abajo). */
const _EXTRAS_FASES = [
  // Fase 1 · Sobre ti (perfil)
  { id: "pf8", dim: "perfil", texto: "¿Cómo te ves de aquí a un par de años?", opciones: [
    { t: "Creciendo dentro de una empresa como esta", v: 3 }, { t: "Con más experiencia y responsabilidades", v: 3 }, { t: "En un trabajo estable", v: 2 }, { t: "Aún no lo tengo claro", v: 1 },
  ]},
  { id: "pf9", dim: "perfil", info: true, texto: "¿Qué ambiente de trabajo prefieres?", opciones: [
    { t: "Dinámico y con retos", v: 2 }, { t: "Tranquilo y ordenado", v: 2 }, { t: "Con mucho trato con gente", v: 2 }, { t: "Con tareas claras y rutina", v: 2 }, { t: "Me adapto a cualquiera", v: 2 },
  ]},
  { id: "pf10", dim: "perfil", texto: "Cuando algo no sale como esperabas, ¿qué sueles hacer?", opciones: [
    { t: "Busco otra forma de lograrlo", v: 3 }, { t: "Pido ayuda o consejo", v: 2 }, { t: "Lo intento una vez más igual", v: 1 }, { t: "Me desanimo fácilmente", v: 0 },
  ]},
  { id: "pf11", dim: "perfil", info: true, porqueLabel: "¿Por qué te interesa eso?", texto: "¿Qué te gustaría aprender o mejorar en este trabajo?", opciones: [
    { t: "Habilidades técnicas", v: 2 }, { t: "Trato con clientes", v: 2 }, { t: "Trabajo en equipo", v: 2 }, { t: "Organización y orden", v: 2 }, { t: "Liderar a otros", v: 2 }, { t: "Otra", v: 2, otro: true },
  ]},

  // Fase 2 · Tu forma de ser (personalidad + social)
  { id: "per4", dim: "personalidad", texto: "Cuando me comprometo a algo, lo cumplo aunque nadie me esté supervisando.", opciones: L },
  { id: "per5", dim: "personalidad", texto: "Me adapto bien cuando cambian las reglas o las prioridades.", opciones: L },
  { id: "per6", dim: "personalidad", texto: "Prefiero adelantarme a los problemas en vez de esperar a que pasen.", opciones: L },
  { id: "soc3", dim: "social", texto: "Cuando hay un desacuerdo en el equipo, ayudo a que lleguen a un acuerdo.", opciones: L },
  { id: "soc4", dim: "social", texto: "Se me facilita pedir ayuda cuando la necesito.", opciones: L },
  { id: "soc5", dim: "social", texto: "Escucho la opinión de los demás aunque no esté de acuerdo.", opciones: L },

  // Fase 3 · Cómo piensas y decides (intelecto + juicio)
  { id: "int4", dim: "intelecto", texto: "Un producto cuesta $80 y tiene 25% de descuento. ¿Cuánto pagas?", opciones: [
    { t: "$60", v: 3, correcta: true }, { t: "$55", v: 0 }, { t: "$65", v: 0 }, { t: "$70", v: 0 },
  ]},
  { id: "int5", dim: "intelecto", texto: "¿Qué número sigue en la serie?  3, 6, 9, 12, ___", opciones: [
    { t: "15", v: 3, correcta: true }, { t: "18", v: 0 }, { t: "14", v: 0 }, { t: "16", v: 0 },
  ]},
  { id: "int6", dim: "intelecto", texto: "Un trabajo se hace en 2 horas con 3 personas. Con más gente al mismo ritmo, el trabajo…", opciones: [
    { t: "Se termina más rápido", v: 3, correcta: true }, { t: "Tarda lo mismo", v: 0 }, { t: "Tarda más", v: 0 }, { t: "No se puede saber", v: 0 },
  ]},
  { id: "int7", dim: "intelecto", texto: "“Ningún empleado puede faltar sin avisar. Juan es empleado.” Entonces Juan…", opciones: [
    { t: "No puede faltar sin avisar", v: 3, correcta: true }, { t: "Puede faltar cuando quiera", v: 0 }, { t: "Solo falta los lunes", v: 0 }, { t: "No es empleado", v: 0 },
  ]},
  { id: "jui4", dim: "juicio", texto: "Ves a un compañero llevarse mercancía sin pagar. ¿Qué haces?", opciones: [
    { t: "Lo reporto a mi supervisor", v: 3 }, { t: "Hablo primero con el compañero", v: 2 }, { t: "Lo comento con otros compañeros", v: 1 }, { t: "Finjo que no vi nada", v: 0 },
  ]},
  { id: "jui5", dim: "juicio", texto: "Tu turno terminó pero queda un cliente esperando y nadie puede atenderlo. ¿Qué haces?", opciones: [
    { t: "Lo atiendo aunque me tome unos minutos extra", v: 3 }, { t: "Busco rápido a alguien que lo atienda", v: 2 }, { t: "Le digo que ya es mi hora de salida", v: 1 }, { t: "Me voy, no es mi responsabilidad", v: 0 },
  ]},
  { id: "jui6", dim: "juicio", texto: "Tu jefe te da una instrucción que crees que está equivocada. ¿Qué haces?", opciones: [
    { t: "Le comento mi duda con respeto antes de hacerla", v: 3 }, { t: "La hago, es la instrucción", v: 2 }, { t: "La hago a mi manera sin avisar", v: 1 }, { t: "No la hago", v: 0 },
  ]},

  // Fase 4 · En el trabajo (servicio, estrés, psicosocial, honestidad, disponibilidad, entrevista)
  { id: "ser3", dim: "servicio", texto: "Hago lo posible para que un cliente se vaya satisfecho, aunque cueste trabajo.", opciones: L },
  { id: "ser4", dim: "servicio", texto: "Una queja de un cliente es una oportunidad para mejorar, no un problema.", opciones: L },
  { id: "est3", dim: "estres", texto: "Aunque tenga un mal día, no lo reflejo con clientes ni compañeros.", opciones: L },
  { id: "est4", dim: "estres", texto: "Me recupero rápido después de una situación difícil o tensa.", opciones: L },
  { id: "psi3", dim: "psicosocial", texto: "Siento que mi esfuerzo en el trabajo vale la pena.", opciones: L },
  { id: "psi4", dim: "psicosocial", texto: "Tengo con quién apoyarme cuando algo me preocupa.", opciones: L },
  { id: "hon4", dim: "honestidad", texto: "Si nadie se va a enterar, romper una regla pequeña está bien.", opciones: [
    { t: "Totalmente en desacuerdo", v: 3 }, { t: "En desacuerdo", v: 2 }, { t: "De acuerdo", v: 1 }, { t: "Totalmente de acuerdo", v: 0 },
  ]},
  { id: "hon5", dim: "honestidad", texto: "Un proveedor te ofrece un regalo a cambio de un trato preferente. ¿Qué haces?", opciones: [
    { t: "Lo rechazo y lo reporto", v: 3 }, { t: "Lo rechazo", v: 2 }, { t: "Lo acepto pero no cambio nada", v: 1 }, { t: "Lo acepto", v: 0 },
  ]},
  { id: "log4", dim: "logistica", texto: "¿Tendrías disponibilidad para quedarte tiempo extra si se necesita (pagado)?", opciones: [
    { t: "Sí, sin problema", v: 3 }, { t: "Sí, avisando con tiempo", v: 2 }, { t: "Ocasionalmente", v: 1 }, { t: "No", v: 0 },
  ]},
  { id: "ab6", dim: "entrevista", tag: "Resolución de conflictos", tipo: "abierta",
    texto: "Cuéntame de una vez que tuviste un desacuerdo fuerte con un compañero o jefe. ¿Cómo lo manejaste y cómo terminó?",
    ayuda: "Cuenta el caso concreto: qué pasó, qué hiciste tú y cómo quedó.",
    fijarte: "Busca madurez: que reconozca su parte, que haya buscado el diálogo y que el cierre haya sido constructivo. Descarta a quien echa toda la culpa al otro." },
];

/* ---------- Banco INDEPENDIENTE del examen por fases ----------
   El examen por fases tiene su PROPIO banco, separado del rápido. Arranca como
   una COPIA del banco general + las preguntas extra, y desde el panel se edita
   aparte ("Editar preguntas por fases"), agrupado por fase. Así, editar el
   banco rápido NO afecta al de fases y viceversa: cada examen tiene sus propias
   preguntas. (Copia profunda para que no compartan referencias.) */
const PREGUNTAS_FASES = PREGUNTAS.concat(_EXTRAS_FASES).map(function (q) { return JSON.parse(JSON.stringify(q)); });

/* ---------- Bloques (sesiones) del examen por fases ----------
   Las 5 fases siguen existiendo por dentro (y el editor las muestra agrupadas),
   pero al aspirante el examen se le divide en BLOQUES: cada bloque es una sesión
   con su freno. RH autoriza por bloque. La reacción (fase 5) va dentro del bloque
   que la contenga. Para volver a 5 sesiones, basta poner una fase por bloque. */
const BLOQUES = [
  { fases: [1, 2], nombre: "Sobre ti y tu forma de ser" },
  { fases: [3], nombre: "Cómo piensas y decides" },
  { fases: [4, 5, 6], nombre: "En el trabajo, situaciones y reacción" },
];

/* Umbrales para clasificar cada dimensión (porcentaje 0-1) */
const NIVEL_DIM = [
  { min: 0.75, label: "Fortaleza", cls: "ok" },
  { min: 0.45, label: "Promedio", cls: "warn" },
  { min: 0,    label: "Área de oportunidad", cls: "bad" },
];

/* Dimensiones críticas: si salen bajas, levantan bandera para RH */
const CRITICAS = ["honestidad", "juicio"];

/* ---------- Control de atención (preguntas trampa) ----------
   Desactivado a pedido: ya no se usan trampas. La validez del examen se basa
   en el ritmo de respuesta y en las preguntas espejo (consistencia). */
const TRAMPAS = [];

/* ---------- Preguntas espejo (índice de consistencia) ---------- */
const ESPEJO_PREGUNTAS = [
  { id: "esp1a", dim: "control", sinPorque: true, texto: "Sigo las reglas del trabajo aunque nadie me esté observando.", opciones: L },
  { id: "esp1b", dim: "control", sinPorque: true, texto: "Si estoy seguro de que nadie se va a enterar, no pasa nada por romper una regla menor.", opciones: L },
  { id: "esp2a", dim: "control", sinPorque: true, texto: "Me gusta ayudar a un cliente aunque no sea exactamente mi tarea.", opciones: L },
  { id: "esp2b", dim: "control", sinPorque: true, texto: "Si algo no me corresponde, no es mi problema atenderlo.", opciones: L },
  { id: "esp3a", dim: "control", sinPorque: true, texto: "Cuando me comprometo a algo en el trabajo, lo cumplo aunque me cueste.", opciones: L },
  { id: "esp3b", dim: "control", sinPorque: true, texto: "A veces dejo cosas a medias si nadie las está esperando de inmediato.", opciones: L },
  { id: "esp4a", dim: "control", sinPorque: true, texto: "Mantengo la calma cuando hay mucha presión o varias cosas al mismo tiempo.", opciones: L },
  { id: "esp4b", dim: "control", sinPorque: true, texto: "Cuando se acumula el trabajo, me frustro y me cuesta concentrarme.", opciones: L },
  { id: "esp5a", dim: "control", sinPorque: true, texto: "Prefiero apoyar a mi equipo aunque eso me dé más trabajo.", opciones: L },
  { id: "esp5b", dim: "control", sinPorque: true, texto: "Cada quien debe resolver lo suyo; no me gusta cargar con el trabajo de otros.", opciones: L },
];
const ESPEJOS = [
  { a: "esp1a", b: "esp1b", inverso: true },
  { a: "esp2a", b: "esp2b", inverso: true },
  { a: "esp3a", b: "esp3b", inverso: true },
  { a: "esp4a", b: "esp4b", inverso: true },
  { a: "esp5a", b: "esp5b", inverso: true },
];

/* =====================================================================
   Preguntas ESPECÍFICAS por puesto. Se agregan después de las generales,
   según el puesto que elija el aspirante. Mismas reglas que las generales:
   cada opción lleva favorabilidad v (0-3). Edítalas/agrégalas aquí.
   La clave debe coincidir EXACTO con el texto del puesto.
   ===================================================================== */
const PREGUNTAS_PUESTO = {
  "Atención a cliente": [
    { id: "ac1", dim: "puesto", texto: "Un cliente llega muy molesto y te grita por algo que no fue tu culpa. ¿Qué haces?", opciones: [
      { t: "Lo escucho con calma, ofrezco una disculpa por la molestia y busco solución", v: 3 }, { t: "Le explico que no fue mi culpa para que entienda", v: 1 }, { t: "Llamo a mi jefe sin intentar nada", v: 1 }, { t: "Le digo que primero se calme", v: 0 },
    ]},
    { id: "ac2", dim: "puesto", texto: "Tienes a varios clientes esperando al mismo tiempo. ¿Cómo te organizas?", opciones: [
      { t: "Atiendo por orden de llegada y aviso a los demás que ya casi", v: 3 }, { t: "Atiendo primero al que se ve más enojado", v: 1 }, { t: "Atiendo al que parece que comprará más", v: 1 }, { t: "Me apuro aunque cometa errores", v: 0 },
    ]},
    { id: "ac3", dim: "puesto", texto: "Un cliente pide algo que no puedes darle (no hay o va contra la política). ¿Qué haces?", opciones: [
      { t: "Le explico con amabilidad por qué no se puede y le ofrezco una alternativa", v: 3 }, { t: "Le digo que no se puede y ya", v: 1 }, { t: "Se lo doy con tal de que no se enoje", v: 0 }, { t: "Lo mando con otra persona", v: 1 },
    ]},
    { id: "ac4", dim: "puesto", texto: "Para ti, dar un buen servicio es…", opciones: [
      { t: "Que el cliente se vaya satisfecho y quiera regresar", v: 3 }, { t: "Atender rápido aunque sea cortante", v: 1 }, { t: "Solo hacer lo que me toca", v: 0 }, { t: "Que no se queje conmigo", v: 1 },
    ]},
  ],
  "Cajero(a)": [
    { id: "caj1", dim: "puesto", texto: "Al cierre te SOBRA dinero en la caja. ¿Qué haces?", opciones: [
      { t: "Lo reporto y lo registro como sobrante", v: 3 }, { t: "Lo guardo por si después falta", v: 0 }, { t: "Me lo quedo, total es poco", v: 0 }, { t: "No digo nada y dejo todo igual", v: 1 },
    ]},
    { id: "caj2", dim: "puesto", texto: "Un cliente paga con $200 una compra de $137. ¿Cuánto es su cambio?", opciones: [
      { t: "$63", v: 3, correcta: true }, { t: "$73", v: 0 }, { t: "$67", v: 0 }, { t: "$53", v: 0 },
    ]},
    { id: "caj3", dim: "puesto", texto: "Hay mucha fila y un cliente te apura. ¿Qué haces?", opciones: [
      { t: "Mantengo el ritmo con cuidado para no equivocarme en el cobro", v: 3 }, { t: "Me apuro aunque pueda dar mal el cambio", v: 0 }, { t: "Le digo de mala gana que se espere", v: 1 }, { t: "Me pongo nervioso y me trabo", v: 1 },
    ]},
    { id: "caj4", dim: "puesto", texto: "Un compañero te pide que le marques de menos un producto a un amigo suyo. ¿Qué haces?", opciones: [
      { t: "Me niego, eso es un robo a la empresa", v: 3 }, { t: "Lo hago una vez, no pasa nada", v: 0 }, { t: "Le digo que mejor lo haga él", v: 1 }, { t: "Lo hago si nadie ve", v: 0 },
    ]},
  ],
  "Ventas": [
    { id: "ven1", dim: "puesto", texto: "Un cliente dice \"está muy caro\". ¿Qué haces?", opciones: [
      { t: "Le muestro el valor y beneficios, y busco la opción que le acomode", v: 3 }, { t: "Le bajo el precio de inmediato", v: 1 }, { t: "Le digo que es lo que hay", v: 0 }, { t: "Dejo que se vaya", v: 0 },
    ]},
    { id: "ven2", dim: "puesto", texto: "Para cerrar una venta, lo más importante es…", opciones: [
      { t: "Entender qué necesita el cliente y ofrecerle lo correcto", v: 3 }, { t: "Insistir hasta que compre", v: 1 }, { t: "Prometer lo que sea con tal de vender", v: 0 }, { t: "Vender siempre lo más caro", v: 1 },
    ]},
    { id: "ven3", dim: "puesto", texto: "No llevas ventas en el día y ya va a cerrar la tienda. ¿Qué haces?", opciones: [
      { t: "Sigo intentando con buena actitud hasta el final", v: 3 }, { t: "Me rindo, ya ni modo", v: 0 }, { t: "Presiono fuerte al primer cliente que entre", v: 1 }, { t: "Me pongo de malas", v: 0 },
    ]},
    { id: "ven4", dim: "puesto", texto: "Un cliente pregunta por algo que tu producto NO hace. ¿Qué haces?", opciones: [
      { t: "Le digo la verdad y le ofrezco lo que sí cubre su necesidad", v: 3 }, { t: "Le digo que sí lo hace con tal de vender", v: 0 }, { t: "Cambio de tema", v: 1 }, { t: "Le digo que pregunte en otro lado", v: 1 },
    ]},
  ],
  "Almacén": [
    { id: "alm1", dim: "puesto", texto: "Recibes mercancía y la cantidad NO cuadra con la nota. ¿Qué haces?", opciones: [
      { t: "Lo reporto y no firmo hasta aclararlo", v: 3 }, { t: "Firmo para no hacer problema", v: 0 }, { t: "Lo acomodo y luego veo", v: 1 }, { t: "No digo nada", v: 0 },
    ]},
    { id: "alm2", dim: "puesto", texto: "Para mantener el almacén, lo más importante es…", opciones: [
      { t: "Orden, limpieza y que todo esté en su lugar", v: 3 }, { t: "Que quepa todo aunque esté revuelto", v: 1 }, { t: "Hacerlo rápido aunque quede desordenado", v: 0 }, { t: "Esperar a que alguien diga qué hacer", v: 1 },
    ]},
    { id: "alm3", dim: "puesto", texto: "El trabajo implica cargar y estar de pie varias horas. ¿Cómo te sientes con eso?", opciones: [
      { t: "Sin problema, estoy acostumbrado al trabajo físico", v: 3 }, { t: "Lo hago pero me cuesta", v: 1 }, { t: "Prefiero evitar cargar", v: 0 }, { t: "No me gusta el esfuerzo físico", v: 0 },
    ]},
    { id: "alm4", dim: "puesto", texto: "Ves que un compañero levanta cajas de forma insegura. ¿Qué haces?", opciones: [
      { t: "Le digo cómo hacerlo seguro para que no se lastime", v: 3 }, { t: "No me meto", v: 1 }, { t: "Me río", v: 0 }, { t: "Lo reporto sin decirle nada", v: 1 },
    ]},
  ],
  "Administrativo": [
    { id: "adm1", dim: "puesto", texto: "Te das cuenta de un error en un registro que YA entregaste. ¿Qué haces?", opciones: [
      { t: "Aviso de inmediato y lo corrijo", v: 3 }, { t: "Lo corrijo callado para que nadie note", v: 1 }, { t: "No digo nada, ya está entregado", v: 0 }, { t: "Espero a ver si alguien lo nota", v: 0 },
    ]},
    { id: "adm2", dim: "puesto", texto: "Tienes varias tareas con la misma fecha límite. ¿Cómo te organizas?", opciones: [
      { t: "Priorizo por importancia y urgencia, y avanzo una por una", v: 3 }, { t: "Hago primero la más fácil", v: 1 }, { t: "Hago todo al mismo tiempo", v: 0 }, { t: "Espero a que me digan cuál primero", v: 1 },
    ]},
    { id: "adm3", dim: "puesto", texto: "Manejas información confidencial de la empresa. ¿Qué haces con ella?", opciones: [
      { t: "La cuido y no la comparto con nadie sin autorización", v: 3 }, { t: "La comento solo con compañeros de confianza", v: 0 }, { t: "No le doy importancia", v: 0 }, { t: "La comparto si me la piden", v: 1 },
    ]},
    { id: "adm4", dim: "puesto", texto: "¿Qué tan cómodo te sientes usando computadora (Excel, correo, etc.)?", opciones: [
      { t: "Muy cómodo, los uso sin problema", v: 3 }, { t: "Me defiendo en lo básico", v: 2 }, { t: "Me cuesta pero aprendo", v: 1 }, { t: "Casi no sé usarlos", v: 0 },
    ]},
  ],
  "Cocina / Producción": [
    { id: "coc1", dim: "puesto", texto: "Antes de empezar a preparar alimentos, lo primero es…", opciones: [
      { t: "Lavarme las manos y revisar que todo esté limpio", v: 3 }, { t: "Empezar rápido para no atrasarme", v: 0 }, { t: "Esperar instrucciones", v: 1 }, { t: "Revisar mi celular", v: 0 },
    ]},
    { id: "coc2", dim: "puesto", texto: "Se te cae al piso un utensilio que necesitas. ¿Qué haces?", opciones: [
      { t: "Tomo otro limpio, o lo lavo y desinfecto antes de usarlo", v: 3 }, { t: "Lo recojo y sigo usándolo", v: 0 }, { t: "Lo limpio con un trapo rápido", v: 1 }, { t: "Lo uso, total se ve limpio", v: 0 },
    ]},
    { id: "coc3", dim: "puesto", texto: "Hay mucho pedido y el ritmo es rápido. ¿Cómo trabajas?", opciones: [
      { t: "Mantengo el ritmo con orden e higiene", v: 3 }, { t: "Me apuro aunque descuide la limpieza", v: 0 }, { t: "Me estreso y me bloqueo", v: 1 }, { t: "Voy a mi paso aunque se atrase todo", v: 1 },
    ]},
    { id: "coc4", dim: "puesto", texto: "Notas que un alimento huele raro o se ve echado a perder. ¿Qué haces?", opciones: [
      { t: "No lo uso y lo reporto", v: 3 }, { t: "Lo uso si no se ve tan mal", v: 0 }, { t: "Lo mezclo con otro para disimular", v: 0 }, { t: "Pregunto a un compañero si lo uso", v: 1 },
    ]},
  ],
};

/* Puente para el panel de RH (lee estos valores) */
if (typeof window !== "undefined") { window.__EVAL = { PREGUNTAS, DIMENSIONES, NIVEL_DIM, CRITICAS, CONFIG, RH_PASS, PUESTOS, PREGUNTAS_PUESTO, PREGUNTAS_FASES, BLOQUES }; }
