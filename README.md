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
- **Fase 2 · Parte 2 — Incidencias:**
  - Registro de **faltas, retardos, permisos (con/sin goce), incapacidades y vacaciones** con periodo y motivo.
  - **Flujo de aprobación**: Pendiente → Aprobada / Rechazada, con nota de resolución.
  - **Rastro de auditoría inmutable** por incidencia (cadena de hashes, verificable como íntegra).
  - **Resumen** (pendientes/aprobadas/rechazadas) y filtros por estatus.
  - **Enlace con Asistencia**: una incapacidad/permiso aprobada que cubra el día se refleja en la tabla de asistencia.
- **Fase 2 · Parte 3 — Vacaciones:**
  - **Saldos por colaborador conforme al Art. 76 LFT** (reforma 2023): 12 días al primer año, +2 por año hasta el quinto, luego +2 por quinquenio. Cálculo automático desde la antigüedad.
  - **Solicitud y aprobación** (Pendiente → Aprobada / Rechazada) con el mismo rastro de auditoría inmutable y aviso de saldo disponible.
  - **Resumen del equipo** (días por ley / tomados / disponibles / pendientes) y barra de avance por persona.
  - **Enlace con Asistencia**: una vacación aprobada que cubra el día aparece en la tabla de asistencia y descuenta del saldo.
- **Fase 2 · Parte 4 — Calendario de ausencias:**
  - **Vista de mes** que agrega vacaciones, permisos e incapacidades de todo el equipo, día por día.
  - Chips por colaborador con **color según el tipo** (vacaciones, incapacidad, permiso, falta, retardo) y las **pendientes** marcadas aparte.
  - **Navegación de mes** (anterior/siguiente/hoy), filtro por origen y leyenda.
  - **Clic en un día** → lista las ausencias de esa fecha; clic en una ausencia abre su detalle con el rastro de auditoría.
- Dashboard con KPIs por empresa.
- Navegación del módulo restante (NOM-035) como placeholder.
- Responsive hasta 375px (sidebar en drawer; el calendario colapsa los chips a puntos).

## Fase 2 — COMPLETA ✓
Asistencia (checador + ledger + turnos) · Incidencias (aprobación + auditoría) · Vacaciones (saldos LFT) · Calendario de ausencias. Todo multi-tenant y sobre el principio de bitácora inmutable.

## Fase 3 — Cumplimiento ✓
- **NOM-035-STPS-2018**: campaña de evaluación con el **cuestionario oficial (Guía de Referencia II)** — escala Likert de 5 niveles y las 4 categorías de la norma. Motor de calificación que normaliza a la escala 0-184 y clasifica el **nivel de riesgo** (Nulo / Bajo / Medio / Alto / Muy alto) global y por categoría, con la **acción sugerida** que marca la norma. Tablero del centro de trabajo (distribución de riesgo + promedio por categoría), tabla por colaborador y aplicación del cuestionario en línea.
- **Vencimientos**: alertas de reevaluación NOM-035, fin de contratos, exámenes médicos y capacitaciones, con estatus **Vencido / Próximo (30 días) / Vigente** y filtros.

## Lo que NO se tocó / sigue
- **Fase 4 — Portal del colaborador** (vista propia del empleado: sus datos, recibos, saldo de vacaciones, solicitudes).
- **Fase 5 — Nómina** (vía PAC con el `TimbradoProvider`, al final).
- Auth/datos reales: hoy en modo demo. Foto/documentos en memoria; QR representativo; geo simulada; ledger, incidencias, vacaciones y respuestas NOM-035 en memoria. En producción → Firebase (Storage, Geolocation + haversine, colecciones append-only). Todo marcado con TODO.
- Nota NOM-035: el cuestionario incluye un conjunto representativo de reactivos con la estructura y escala oficiales; el banco completo de la Guía II (46) / Guía III (72) se carga igual.

Orden sugerido: **Portal del colaborador → conectar Firebase → (al final) Nómina**.






