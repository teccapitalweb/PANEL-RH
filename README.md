# Evalua RH — Evaluación de ingreso + Panel de Selección

Un solo repo con **dos páginas** que se enlazan entre sí. Hechas en HTML/CSS/JS
puro, listas para **GitHub Pages** (arrastrar todos los archivos a la raíz del repo).

## Qué es

- **Kiosko del aspirante** (`index.html`) — examen estilo kiosko (una pregunta por
  pantalla, mínimo tecleo). 36 reactivos + prueba de reacción. Califica por
  dimensión y guarda al aspirante.
- **Panel de RH** (`panel.html`) — privado. Lista de aspirantes con ranking,
  semáforo y banderas; detalle con calificación por dimensión, entrevista con guía
  "en qué fijarte", respuestas con porqué, y decisión (Contratar / En revisión /
  Descartar) con notas. También edita el mensaje final del kiosko.

## Cómo se entra al panel

En el kiosko, abajo a la izquierda, hay un botón discreto **"Tec Capital Group"**.
Al hacer clic pide **contraseña**; con la correcta salta a `panel.html` (no la
vuelve a pedir en esa sesión). El aspirante nunca ve esto.

### Contraseña

Está en `data.js`:

    const RH_PASS = "teccapital2026"; // CÁMBIALA aquí

> Es una proteccion ligera (va en el codigo del navegador, visible en el codigo
> fuente). Sirve para que un aspirante no entre por error. La seguridad real
> vendra con Firebase Auth (ver pendientes).

## Archivos

| Archivo              | Para qué |
|----------------------|----------|
| `index.html`         | Kiosko del aspirante |
| `styles.css`         | Estilos del kiosko |
| `app.js`             | Lógica del kiosko (flujo, calificación, guardado, acceso RH) |
| `panel.html`         | Panel de RH |
| `panel.css`          | Estilos del panel |
| `panel.js`           | Lógica del panel (lista, detalle, decisión, config) |
| `data.js`            | Banco de preguntas + metadata + contraseña (compartido) |
| `firebase-config.js` | Config de Firebase (placeholder) |

`data.js` y `firebase-config.js` los usan **las dos páginas**.

## Despliegue (GitHub Pages)

1. Sube **todos** los archivos a la raíz del repo.
2. Settings → Pages → Branch `main` / `root`.
3. La URL queda en `index.html` (kiosko). El panel queda en `.../panel.html`.

## Datos de ejemplo

Mientras no se conecte Firebase, el panel muestra **5 aspirantes de ejemplo** para
que se vea funcionando. En cuanto un aspirante real termine el examen en el mismo
sitio, aparecera en el panel (mismo origen -> mismo almacenamiento).

## Pendiente: conectar Firebase

Todo esta marcado en el codigo con `// TODO firebase`:

- **Kiosko** -> al terminar, `addDoc(collection(db,"aspirantes"), registro)`.
- **Panel** -> leer `aspirantes`, actualizar decision/notas, y guardar el mensaje
  final en `config/evaluacion`.
- **Acceso** -> cambiar la contraseña local por **Firebase Auth** (acceso real de RH).

## Notas de diseño

Tipografias Space Grotesk / DM Sans / JetBrains Mono, glassmorphism, iconos SVG,
selects y date pickers propios, modo dia/noche con persistencia.
