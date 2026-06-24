# Resumen con IA (endpoint opcional)

El botón **"Resumen IA"** del detalle siempre funciona:

- **Sin endpoint configurado** → genera el resumen + preguntas **a partir de los
  puntajes** (reglas, sin costo, sin backend).
- **Con endpoint** (`AI_ENDPOINT` en `firebase-config.js`) → consulta tu servicio
  de IA y muestra un resumen escrito por IA.

> ⚠️ Nunca pongas la API key en el frontend. Va en tu backend (Railway), como tus
> webhooks. El panel solo llama a TU endpoint.

## Contrato del endpoint
El panel hace `POST` con este JSON:

    {
      "nombre": "...", "puesto": "...",
      "global": 78, "nivel": "Promedio",
      "ajustePuesto": 65,
      "dimensiones": [{ "nombre": "Honestidad e integridad", "pct": 40, "nivel": "Área de oportunidad" }],
      "banderas": ["Honestidad e integridad"],
      "decision": "En revisión"
    }

Y debe responder SOLO con:

    { "resumen": "texto...", "preguntas": ["pregunta 1", "pregunta 2", "..."] }

Luego pon la URL en `firebase-config.js`:

    const AI_ENDPOINT = "https://tu-servicio.up.railway.app/resumen";

## Ejemplo de proxy (Node + Express, para Railway)
La API key vive en variables de entorno de Railway (`ANTHROPIC_API_KEY`).

    const express = require("express");
    const cors = require("cors");
    const app = express();
    app.use(cors());           // o restringe a tu dominio de GitHub Pages
    app.use(express.json());

    app.post("/resumen", async (req, res) => {
      const a = req.body;
      const prompt = `Eres analista de RH. Con estos resultados de una evaluación
    de ingreso escribe en español: 1) un "resumen" ejecutivo de 3-4 frases
    (fortalezas, áreas de oportunidad, banderas y una recomendación) y
    2) "preguntas": 5 preguntas de entrevista enfocadas en las áreas débiles y el
    puesto. Responde SOLO en JSON {"resumen":"...","preguntas":["..."]}.
    Datos: ${JSON.stringify(a)}`;
      try {
        const r = await fetch("https://api.anthropic.com/v1/messages", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-api-key": process.env.ANTHROPIC_API_KEY,
            "anthropic-version": "2023-06-01",
          },
          body: JSON.stringify({
            model: "claude-sonnet-4-6",   // o el modelo que prefieras
            max_tokens: 700,
            messages: [{ role: "user", content: prompt }],
          }),
        });
        const data = await r.json();
        const txt = (data.content || []).map(b => b.text || "").join("");
        res.json(JSON.parse(txt.replace(/```json|```/g, "").trim()));
      } catch (e) { res.status(500).json({ error: "fallo" }); }
    });

    app.listen(process.env.PORT || 3000);

Sirve igual con OpenAI u otro proveedor: solo cambia la llamada interna; el
contrato de entrada/salida con el panel es el mismo.
