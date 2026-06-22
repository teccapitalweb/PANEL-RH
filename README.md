# Panel RH · TEC CAPITAL

Shell base del SaaS de Recursos Humanos. Primera rebanada: la fundación del panel
(login + dashboard + navegación de módulos + expediente) con tu design language
y lista para conectar Firebase.

## Cómo correrlo
Abre `index.html` en el navegador. No necesita servidor ni build.
- Corre en modo **DEMO** con datos de ejemplo (`data.js`).
- Pulsa **Entrar** (credenciales precargadas) para ver el panel.

## Archivos
| Archivo | Qué es |
|---|---|
| `index.html` | Estructura: login + shell (sidebar, topbar, vistas) |
| `styles.css` | Design system: light/dark, glassmorphism, blue glow, scrollbar fina |
| `app.js` | Lógica: auth, navegación, render, filtros, slide-over, tema |
| `data.js` | Datos demo (empresas/tenants, colaboradores, KPIs) → futuro Firestore |
| `firebase-config.js` | Placeholder de conexión Firebase con TODOs |

## Conectar Firebase (cuando quieras salir de demo)
1. Pega tu `firebaseConfig` real en `firebase-config.js` y descomenta el init.
2. En `app.js`, cambia `AUTH.modo` y `DATA.modo` de `"demo"` a `"firebase"`.
3. Rellena los `// TODO firebase` en las capas `AUTH` y `DATA`.

Estructura Firestore sugerida (multi-tenant, aislado por empresa):
```
empresas/{empresaId}
empresas/{empresaId}/colaboradores/{colaboradorId}
empresas/{empresaId}/incidencias/{incidenciaId}
empresas/{empresaId}/eventos/{eventoId}   ← ledger inmutable (auditoría)
```

## Lo que YA trae
- Login premium con glassmorphism + blue glow.
- Multi-tenant: selector de empresa que filtra todo por tenant.
- Toggle día/noche (persiste) con dark mode futurista.
- Módulo **Colaboradores** funcional: **alta, edición y baja (CRUD)** con formulario premium — selects glass, date picker custom (calendario) y confirmación de baja propia (sin diálogos nativos). Más tabla, filtros por estatus, búsqueda y slide-over de expediente.
- Dashboard con KPIs por empresa.
- Navegación de los módulos del MVP (Asistencia, Incidencias, Vacaciones, NOM-035) como placeholders.
- Responsive hasta 375px (sidebar en drawer).

## Lo que NO se tocó / sigue
- Nómina (marcada "Pronto") — fase 2, vía PAC con el `TimbradoProvider`.
- Módulos en placeholder: pendientes de construir sobre este shell.
- Auth/datos reales: hoy en modo demo.

Orden sugerido de construcción: Asistencia → Incidencias/Vacaciones → NOM-035 → (fase 2) Nómina.
