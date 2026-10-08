# Proyecto Firebase del MVP

Configuración indicada por el usuario el 8 de octubre de 2026:

- ID: `farma-copilot-2026`.
- Nombre visible: Farma Copilot.
- Realtime Database: `https://farma-copilot-2026-default-rtdb.firebaseio.com`.
- Ubicación declarada de RTDB y Firestore: `us-central1`.
- [Consola del proyecto](https://console.firebase.google.com/project/farma-copilot-2026/overview).
- [Realtime Database](https://console.firebase.google.com/u/0/project/farma-copilot-2026/database/farma-copilot-2026-default-rtdb/data).

## Estado de conexión

`.firebaserc` apunta al proyecto real para los comandos de Firebase. Los scripts
de pruebas y emulador siguen apuntando explícitamente a `demo-farmaenlace`.
Este alias no cambia por sí solo las variables del servidor Next.js/Vercel.

El usuario confirmó **Cloud Firestore** creado y operativo mediante una escritura
y borrado de prueba sin login. Se conserva la implementación Firestore actual.
Realtime Database existe en el mismo proyecto y no se utiliza para este MVP.
La configuración web enviada identifica la app Firebase, pero el backend usa
Firebase Admin y necesita una credencial de servidor.

Una consulta REST sin autenticación a un documento aleatorio inexistente devolvió
404/NOT_FOUND. No se consultaron colecciones ni datos de clientes ni se escribieron
registros. Esto comprueba una respuesta del endpoint, no una conexión del backend
Admin. La comprobación CLI anterior falló por autenticación; no hay credencial
Admin/ADC en el entorno local. La aplicación local sigue usando el emulador.

El usuario reportó reglas cloud abiertas en modo prueba con vencimiento «jueves
15/10 a medianoche, hora de Ecuador». No se verificó esa condición exacta en las
reglas publicadas. El archivo `firestore.rules` de este repositorio mantiene
deny-all para clientes y no se ha desplegado al proyecto. No almacenar datos
reales bajo las reglas abiertas: permitirían lectura/escritura directa, fuera de
los controles del MVP. Con Admin autorizado y reglas cerradas, el backend no
depende del vencimiento del modo prueba.

## Configuración privada pendiente

El usuario eligió configurar las credenciales en **Vercel**. En Settings →
Environment Variables del proyecto, completar las variables de servidor
indicadas en `.env.production.example`:

```dotenv
FIREBASE_PROJECT_ID=farma-copilot-2026
FIREBASE_CLIENT_EMAIL=<correo de cuenta de servicio autorizada>
FIREBASE_PRIVATE_KEY=<clave privada de esa cuenta>
CUSTOMER_KEY_SECRET=<secreto aleatorio propio estable de al menos 32 caracteres>
APP_BASE_URL=<origen de la aplicación>
```

Retirar `FIRESTORE_EMULATOR_HOST` únicamente al activar la conexión real.
Los marcadores anteriores no son credenciales válidas. Una sesión de Firebase
CLI permite administrar el proyecto, pero no configura el runtime de Vercel.
El backend necesita su propia credencial de servidor. Esto no requiere Firebase
Auth ni login del dependiente/cliente, y no requiere abrir las reglas al público.

`CUSTOMER_KEY_SECRET` se puede generar en una terminal local con
`openssl rand -hex 32`; guardar el resultado en Vercel y mantenerlo estable.
`APP_BASE_URL` debe ser el origen exacto desde el que se abre la aplicación,
sin `/pos`, y corresponder al entorno Production o Preview utilizado. Después de
guardar variables, generar un nuevo despliegue para aplicarlas. Nunca pegar
credenciales privadas en el chat ni guardarlas en archivos versionados.

Para revalidar la sesión local, el responsable puede ejecutar desde esta carpeta:

```sh
npx firebase login --reauth
```

Después de configurar la credencial, verificar el backend con un registro
sintético completo contra Firestore real, incluido el mismo código en cliente/caja.
Publicar las reglas cerradas del MVP antes de usar datos reales, manteniendo las
reglas y datos de otras aplicaciones si el proyecto es compartido. La conexión
completa sigue pendiente hasta que el usuario configure Vercel y se pruebe el flujo.

Referencia: [Firestore y Realtime Database](https://firebase.google.com/docs/database/rtdb-vs-firestore),
[credenciales Admin en servidor](https://firebase.google.com/docs/admin/setup).
