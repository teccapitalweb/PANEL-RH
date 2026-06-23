# Evalua RH — Evaluación de Ingreso

Herramienta de **exámenes de selección** para que Recursos Humanos evalúe aspirantes y facilite la decisión de contratación.

## Dos partes (mismo backend de Firebase)
1. **Kiosko del aspirante** (este repo, público) — `index.html`. El aspirante responde tipo cajero de comida rápida: una pregunta por pantalla, puro botón, mínimo tecleo. Captura sus datos, contesta el examen y recibe un popup de "evaluación concluida · te contactamos en 2-3 días hábiles".
2. **Panel de RH** (privado, con login) — *siguiente entrega*. Verá las respuestas, calificará por dimensión y mostrará fortalezas / áreas de oportunidad y banderas. El texto del popup final será editable desde ahí.

## Dimensiones evaluadas
Personalidad laboral · Juicio situacional · Honestidad e integridad · Orientación al servicio · Tolerancia al estrés · Bienestar psicosocial · Intelecto y razonamiento · Atención y reacción (prueba cronometrada) · Disponibilidad.

## Estructura
- `index.html` — kiosko (barra + progreso + escenario).
- `styles.css` — tokens del estándar TEC CAPITAL (Space Grotesk / DM Sans, glass, día/noche), escala kiosko.
- `data.js` — `CONFIG` (textos editables), catálogos, `DIMENSIONES` y banco de `PREGUNTAS` con metadata de calificación (cada opción trae su favorabilidad `v`).
- `app.js` — flujo bienvenida → datos → instrucciones → preguntas → reacción → fin. Al concluir **calcula el resultado por dimensión** y lo guarda.
- `firebase-config.js` — misma config para kiosko y panel.

## Calificación (ya lista para el panel)
Cada respuesta aporta `v` (0-3, más alto = mejor) a su dimensión. `calcularResultado()` saca el porcentaje por dimensión, lo clasifica (Fortaleza / Promedio / Área de oportunidad) y levanta banderas si Honestidad o Juicio salen bajos. La prueba de reacción promedia los tiempos y los convierte a puntaje.

## Demo → producción
Hoy en demo: el resultado se guarda en `localStorage` (clave `examenrh_aspirantes`) para que el panel lo lea en un mismo despliegue. En producción se reemplaza por `addDoc` a la colección `aspirantes` (marcado con `// TODO firebase`). Deploy: GitHub Pages.
