# Evalua RH — Todo lo que hace el sistema

**En una frase:** es una herramienta de evaluación de aspirantes que tiene dos caras — un **examen** que el candidato contesta solo (en una tablet, compu o por link) y un **panel privado** donde Recursos Humanos ve resultados, compara finalistas y decide a quién contratar. Funciona como sitio estático (sin servidor obligatorio) y se puede vender a cualquier empresa poniéndole su marca.

---

## Cómo está armado (los archivos)

| Archivo | Para qué sirve |
|---|---|
| `index.html` + `app.js` + `styles.css` | El **examen** que ve el candidato (kiosko público). |
| `panel.html` + `panel.js` + `panel.css` | El **panel privado** de Recursos Humanos. |
| `data.js` | El "cerebro": banco de preguntas, dimensiones, puestos, textos y configuración por defecto. |
| `store.js` | La capa de datos. Decide si guarda en el navegador (modo demo) o en Firebase (modo nube). |
| `firebase-config.js` | Donde se pegan las llaves de Firebase de cada cliente. Si está vacío, corre en modo demo. |
| `firestore.rules` | Las reglas de seguridad de la base de datos en la nube. |
| `FIREBASE-SETUP.md`, `IA-ENDPOINT.md`, `README.md` | Guías de instalación. |

---

## 1. El examen (lo que ve el candidato)

### El recorrido, paso a paso
1. **Bienvenida** — pantalla de entrada con el nombre/logo de la empresa.
2. **Aviso de privacidad** — el candidato debe marcar que acepta antes de continuar (queda registrado).
3. **Tus datos** — nombre, teléfono, correo, CURP (opcional), fecha de nacimiento, género, escolaridad y **puesto al que aspira**.
4. **Instrucciones** — explicación breve de cómo contestar.
5. **Examen** — las preguntas, organizadas en fases.
6. **Prueba de reacción** — un mini-juego que mide qué tan rápido y atento reacciona.
7. **Fin** — pantalla de "¡Listo!" y se guardan las respuestas.

### Las 6 fases del examen
1. **Sobre ti** — datos de arranque y motivación.
2. **Tu forma de ser** — personalidad laboral.
3. **Cómo piensas y decides** — razonamiento y juicio.
4. **En el trabajo** — servicio, estrés, honestidad, disponibilidad.
5. **Situaciones** — preguntas con imagen donde describe qué ve y qué haría.
6. **Tu reacción** — la prueba de reacción/atención.

### Los 3 tipos de pregunta
- **Escala de acuerdo** — de "Totalmente de acuerdo" a "Totalmente en desacuerdo" (puntúa de 3 a 0).
- **Opción múltiple** — varias opciones, cada una con su valor; algunas (las de intelecto) tienen una respuesta correcta.
- **Pregunta abierta** — el candidato escribe con sus palabras. Si lleva imagen, se convierte en una pregunta de **Situaciones**.

### Las 13 dimensiones que mide
Sobre ti · Personalidad laboral · Habilidades sociales · Intelecto y razonamiento · Juicio situacional · Orientación al servicio · Tolerancia al estrés · Bienestar psicosocial · Honestidad e integridad · Disponibilidad · Aptitud para el puesto · Situaciones · Atención y reacción.

### Detalles que ya trae
- **Preguntas barajadas** — el orden de preguntas y opciones cambia en cada aplicación, para que no se copien.
- **Opción "Otro"** — en varias preguntas el candidato puede escribir una respuesta propia.
- **"¿Por qué?"** — en algunas preguntas se le pide justificar su respuesta (RH lo lee después).
- **Tiempo por pregunta** — el sistema mide cuánto tarda en cada una.
- **Preguntas trampa** — preguntas de control para detectar respuestas inconsistentes o al azar.
- **Imágenes con respaldo** — si una imagen no carga, muestra un aviso y deja seguir.
- **Guarda el avance** — si se interrumpe, puede retomar donde se quedó.
- **Guardado a prueba de fallos** — si no logra enviar (internet flojo), lo reintenta y avisa en pantalla para que nadie crea que se guardó sin haberse guardado.

### Cómo se califica
- Cada dimensión da un porcentaje (0 a 100%).
- Se clasifica en tres niveles: **Fortaleza** (alto), **Promedio** (medio) y **Área de oportunidad** (bajo). Los cortes son configurables.
- Calcula también un **índice de confianza** de qué tan consistente fue el candidato.
- **Honestidad** y **Juicio** son dimensiones **críticas**: si salen bajas, el sistema lo marca como alerta para RH.

---

## 2. Tres formas de aplicar el examen

- **Completo** — el candidato hace todo de corrido. Ideal para aplicación presencial en tablet/compu.
- **Por fases** — el examen se parte en 3 bloques que se pueden aplicar en momentos distintos (ej. un bloque por día), usando un código único por candidato.
- **Por invitación** — se genera un link único para un candidato específico; lo abre desde su celular y lo contesta a distancia.

---

## 3. El panel de Recursos Humanos (lo que ve tu equipo)

### Entrada
- **Login.** En modo demo entra con una contraseña; en modo nube, con correo y contraseña de Firebase (más seguro).

### Vistas principales
- **Tablero (Dashboard)** — resumen general: cuántos candidatos, promedios y números clave de un vistazo.
- **Embudo de candidatos** — la lista de todos los que han contestado, con su nivel y puesto, para filtrar y ordenar.
- **Detalle del candidato** — el reporte completo de una persona: sus datos, el resultado por cada dimensión, todas sus respuestas (incluidos los "¿por qué?"), un espacio para **notas de RH** y para marcar una **decisión**.
- **Comparador de finalistas** — pone a varios candidatos lado a lado para compararlos dimensión por dimensión.
- **Resumen con IA** *(opcional)* — si conectas un endpoint de IA, genera un resumen del candidato y una lista de **preguntas sugeridas para la entrevista**.
- **Invitaciones** — para crear y administrar los links únicos de los candidatos a distancia.
- **Vista de fases** — para seguir a los candidatos que van avanzando por bloques.

### Editor de preguntas (sin tocar código)
RH puede **agregar, editar y borrar preguntas** desde el panel. Permite elegir el tipo (escala, opción múltiple o abierta), la dimensión, una etiqueta, una ayuda para el candidato, una nota interna de "qué observar" y hasta una **imagen** (con un campo que arregla solo los enlaces de Google Drive). Hay **dos bancos independientes**: el del examen rápido y el del examen por fases.

### Configuración
Desde aquí se ajusta todo sin programar: el **nombre y marca de la empresa**, los **cortes de calificación**, los **mensajes finales**, los **datos del aviso de privacidad** y la **lista de puestos**.

### Exportar
- **PDF** — reporte individual de un candidato y reporte del comparador de finalistas.
- **Excel / CSV** — la lista de aspirantes y la de candidatos por fases, lista para abrir en Excel.

---

## 4. Marca / white-label (para venderlo a cada cliente)

Con poner **una sola vez** el "Nombre de la empresa" en Configuración, se personaliza solo: el título de las pestañas, la pantalla de login del panel, el botón de acceso del kiosko, el pie de la bienvenida y el aviso de privacidad. Además se puede ajustar el **color de marca**, el **logo**, el **texto del botón de acceso** y el **responsable y correo** del aviso de privacidad. No hay que editar archivos cliente por cliente.

---

## 5. Dónde se guardan los datos

- **Modo demo (sin internet)** — todo se guarda en el navegador. Perfecto para probar o para aplicación 100% presencial en una sola máquina.
- **Modo nube (Firebase)** — se activa pegando las llaves del cliente en `firebase-config.js`. Usa **Authentication** para el login de RH y **Firestore** para guardar candidatos, configuración, preguntas e invitaciones. Cada cliente tiene su propia base, separada de los demás.

---

## 6. Seguridad y privacidad

- **Aviso de privacidad** con aceptación obligatoria y **consentimiento registrado** (fecha, versión y responsable), alineado a la ley mexicana de datos (LFPDPPP).
- **Protección contra inyección de código (XSS)** — todo lo que escribe el candidato se limpia antes de mostrarse en el panel.
- **Reglas de base de datos** — la configuración es de lectura pública (para personalizar la marca), pero los datos de candidatos solo se ven con sesión iniciada.
- **Validaciones** — correo con formato válido y teléfono de exactamente 10 dígitos.
- **Guardado con reintento y aviso** si algo falla al enviar.

---

## 7. Diseño y experiencia

- **Modo día / noche** en el examen y en el panel.
- Estética **premium con glassmorphism**, menús y calendarios **personalizados** (no los grises del navegador), íconos vectoriales y diseño **adaptable** a celular, tablet y compu.
- Pensado para que un candidato sin experiencia técnica lo use sin tropezar.

---

*Documento de referencia · Evalua RH*
