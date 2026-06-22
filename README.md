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
- **Fase 1 — Personas (completa):**
  - **Organigrama**: árbol jerárquico por "reporta a", navegable (clic abre expediente).
  - **Foto del colaborador**: subir/quitar desde el formulario (vista previa al instante).
  - **Documentos adjuntos**: INE, CURP, contrato, comprobantes — agregar/quitar desde el expediente.
  - **Historial laboral**: línea de tiempo que registra **automáticamente** los cambios de puesto y salario con fecha.
  - **Exportar**: lista completa a **Excel (CSV)** y expediente individual a **PDF**.
- **Fase 2 · Parte 1 — Asistencia:**
  - **Reloj checador** tipo kiosko: hora en vivo, Entrada/Salida, selección de colaborador, validación de **geo-cerca** y **QR** de sucursal.
  - **Turnos** configurables (entrada/salida/tolerancia) con asignación por colaborador.
  - **Ledger inmutable**: cada checada genera un evento encadenado por hash; bitácora de auditoría que **verifica la integridad** de la cadena.
  - **Tabla de asistencia del día** con estatus calculado contra el turno: A tiempo / Retardo (min) / Falta, respetando Vacaciones e Incidencia.
- Dashboard con KPIs por empresa.
- Navegación de los módulos restantes (Incidencias, Vacaciones, NOM-035) como placeholders.
- Responsive hasta 375px (sidebar en drawer).

## Lo que NO se tocó / sigue
- **Fase 2 pendiente**: Incidencias (faltas/permisos/incapacidades con aprobación) → Vacaciones (saldos LFT) → Calendario de ausencias.
- Nómina (marcada "Pronto") — fase final, vía PAC con el `TimbradoProvider`.
- Módulos en placeholder (Incidencias, Vacaciones, NOM-035): pendientes de construir sobre este shell.
- Auth/datos reales: hoy en modo demo. Foto y documentos viven en memoria; el QR es representativo y la geo se simula dentro del radio. En producción → Firebase (Storage, Geolocation real + haversine, eventos append-only). Todo marcado con TODO.

Orden sugerido: **Incidencias → Vacaciones → Calendario → NOM-035 → (al final) Nómina**.


