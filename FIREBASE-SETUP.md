# Conectar Evalua RH a Firebase (pasar de demo a real)

Mientras `firebase-config.js` tenga `"TODO"`, la app corre en **modo demo**
(datos en el navegador). Para que sea real y multi-dispositivo:

## 1. Proyecto y servicios (consola de Firebase)
1. Entra a https://console.firebase.google.com y crea (o usa) un proyecto.
2. **Firestore Database** → *Crear base de datos* → modo producción.
3. **Authentication** → *Comenzar* → habilita **Correo electrónico/contraseña**.
4. **Authentication → Users → Agregar usuario**: crea la cuenta de RH
   (correo + contraseña). Con esa cuenta entrará al panel.

## 2. Pegar la configuración
1. Configuración del proyecto (engrane) → *Tus apps* → ícono Web `</>` →
   registra una app web y copia el objeto `firebaseConfig`.
2. Pégalo en **`firebase-config.js`** reemplazando los `"TODO"`.
3. (Opcional) Si vas a servir a **varias empresas**, cambia `EMPRESA_ID` por
   un id distinto por cliente.

## 3. Publicar las reglas
En **Firestore → Reglas**, pega el contenido de **`firestore.rules`** y publica.
Resumen de lo que hacen:
- El kiosko (sin login) **solo puede crear** aspirantes, no leerlos.
- RH (con login) **lee y actualiza** (decisión/notas).
- La config (mensaje + puestos) la **lee cualquiera** (el kiosko la necesita) y
  **solo RH la escribe**.

## 4. Subir a GitHub Pages
Sube los archivos como siempre. Listo.

## Cómo se comporta ya conectado
- **Kiosko**: el aspirante hace el examen y su registro se guarda en
  `empresas/{EMPRESA_ID}/aspirantes`. El botón "Tec Capital Group" lleva al panel.
- **Panel**: RH entra con **correo + contraseña** (Firebase Auth), ve los
  aspirantes reales, califica, y edita el mensaje final y los puestos
  (se guardan en `empresas/{EMPRESA_ID}/config/evaluacion`, que el kiosko lee).
- La contraseña demo (`RH_PASS`) deja de usarse cuando Firebase está activo;
  el acceso es por la cuenta real.

## Estructura en Firestore
    empresas/{EMPRESA_ID}/aspirantes/{id}     ← registros del examen
    empresas/{EMPRESA_ID}/config/evaluacion   ← mensaje final + puestos

## Invitaciones por enlace (nuevo)
Cuando RH genera un enlace único para un aspirante, se guarda en:

    empresas/{EMPRESA_ID}/invitaciones/{token}

Las reglas (`firestore.rules`) ya lo contemplan: el aspirante **lee** su enlace y lo
**marca como completado** (el token es un código secreto largo, así que solo quien
tiene el enlace puede tocar ese documento); **solo RH autenticado** puede crearlas o
borrarlas. Cada enlace es de un solo uso: al terminar el examen queda "completada".

> El "guardar progreso" del examen vive solo en el navegador del aspirante
> (localStorage), no en Firebase: sirve para que retome si cierra la pestaña.
