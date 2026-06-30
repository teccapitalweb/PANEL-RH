# Evalua RH — Evaluación de ingreso + Panel de Selección

Un solo repo con dos páginas (kiosko del aspirante + panel de RH) en HTML/CSS/JS
puro, para GitHub Pages. Funciona en **modo demo** (datos en el navegador) y, al
poner tus llaves de Firebase, pasa a **modo real** (multi-dispositivo) sin tocar
el resto del código.

## Páginas
- **`index.html`** — Kiosko del aspirante. 36 preguntas generales + (si el puesto
  es uno de los 6 predefinidos) 4 del puesto. Califica por dimensión + "Ajuste al
  puesto" y guarda al aspirante.
- **`panel.html`** — Panel de RH (privado). Lista con ranking/semáforo/banderas;
  detalle con calificación, entrevista con guía, bloque del puesto y decisión;
  configuración del mensaje final y de los puestos.

## Acceso al panel
Botón discreto de acceso (muestra el nombre de la empresa) abajo a la izquierda del kiosko.
- **Modo demo**: pide la contraseña `RH_PASS` (en `data.js`, default `evalua2026`).
- **Modo Firebase**: lleva al panel, que pide **correo + contraseña** (cuenta real).

## Archivos
| Archivo              | Para qué |
|----------------------|----------|
| `index.html` / `styles.css` / `app.js` | Kiosko |
| `panel.html` / `panel.css` / `panel.js` | Panel de RH |
| `data.js`            | Preguntas (generales + por puesto) + metadata + contraseña demo |
| `store.js`           | Capa de datos: usa Firebase si está configurado, si no localStorage |
| `firebase-config.js` | Llaves de Firebase (déjalo en TODO para modo demo) |
| `firestore.rules`    | Reglas de seguridad para Firestore |
| `FIREBASE-SETUP.md`  | Guía paso a paso para conectar Firebase |

## Conectar Firebase (modo real)
Ver **`FIREBASE-SETUP.md`**. En resumen: crear proyecto, activar Firestore +
Auth (correo/contraseña), crear el usuario de RH, pegar la config en
`firebase-config.js` y publicar `firestore.rules`. Estructura:

    empresas/{EMPRESA_ID}/aspirantes/{id}     ← registros del examen
    empresas/{EMPRESA_ID}/config/evaluacion   ← mensaje final + puestos

## Despliegue (GitHub Pages)
Sube todos los archivos a la raíz del repo. La URL cae en el kiosko; el panel
queda en `.../panel.html`.

## Modo demo
Sin Firebase configurado, el panel muestra 5 aspirantes de ejemplo y todo se
guarda en el navegador. Útil para probar; en cuanto conectas Firebase, usa datos
reales.
