# Farmaenlace · Registro QR

MVP de identificación y trazabilidad en caja, sin cuentas ni login. Next.js,
React y TypeScript; Firestore mediante Firebase Admin en el servidor; preparado
para el despliegue automático del repositorio en Vercel.

## Flujo actual: mock Vendix

1. El dependiente abre `/pos`, sin login, e identifica al cliente por QR o con
   **Datos dictados** (cédula y correo ingresados en caja).
2. El QR tiene vigencia de diez minutos. El cliente completa el formulario en
   su teléfono; el consentimiento de promociones es opcional y desmarcado.
3. Firebase guarda el registro y la caja recibe automáticamente la confirmación.
   El teléfono agradece y permite continuar con el beneficio de demostración.
   No se muestra un código para copiar o introducir en Vendix.
4. El mock presenta dos productos con precios ficticios. Tras confirmar el registro muestra promociones
   exclusivas: **10% demo en gel limpiador** y **10% demo en protector
   solar**. Aparecen activas y se aplican automáticamente al confirmar el registro. El
   ahorro se calcula por producto y no depende de aceptar correos promocionales.
5. **Finalizar venta simulada** crea un comprobante local en el navegador;
   **Siguiente cliente** limpia el contexto y permite una nueva atención.

La identidad se guarda en el Firestore configurado. El carrito, descuento y
comprobante son ficticios: no hay cobro, factura, compra real ni conexión con
Vendix/PromoGo. El comprobante se conserva en esta pestaña tras recargar y no se
incorpora como historial de compra al perfil. La API mantiene códigos internos
opacos y el endpoint legacy de constancia manual por compatibilidad; la UI ya
no los solicita. `src/lib/vendix.ts` conserva el contrato del adaptador futuro.
SmartClub está excluido.

La captura dictada usa la misma transacción y deduplicación que el QR, pero exige
la capacidad HttpOnly de la caja propietaria. QR y dictado concurrentes no
reemplazan el primer registro confirmado. Se guarda `registrationMethod` y el
origen `pos_qr`/`pos_assisted` para medir ambos caminos; no se devuelve PII a la
caja. Cédula/correo del formulario asistido permanecen únicamente en memoria y
se limpian al guardar, cambiar de método o cancelar. El registro no acredita la
identidad del cliente ni del dependiente.

## Ejecutar localmente

Requisitos: Node.js 24, npm y Java 21 para el emulador. Los datos de las pruebas
son sintéticos y se guardan en el proyecto local `demo-farmaenlace`.

Desde la raíz del workspace:

```sh
cd apps/farmaenlace-qr
npm ci
cp .env.example .env.local
npm run emulators
```

En otra terminal, dentro de `apps/farmaenlace-qr`:

```sh
npm run dev
```

Abrir [la consola](http://localhost:3000/pos). El emulador escucha únicamente en
`127.0.0.1:8085`; no requiere un proyecto Firebase real ni Firebase Auth.
Detener ambos procesos con Ctrl+C. Por defecto los datos del emulador se pierden
al detenerlo; la persistencia cloud se configura por separado.

Para probar con un teléfono, usar la misma red y abrir la consola mediante la
IP del equipo, por ejemplo `http://192.168.1.20:3000/pos`. Cambiar `APP_BASE_URL`
en `.env.local` al mismo origen y reiniciar Next. El QR utiliza el origen desde
el que se abre la consola; no abrirla mediante `localhost` para ese ensayo.
El teléfono solo accede a Next, nunca al emulador. La confirmación llega a caja
automáticamente; no depende del portapapeles.

## Validación

Con el emulador y Next activos, ejecutar desde la carpeta de la aplicación:

```sh
npm test
npm run test:integration
npm run test:e2e
npm run typecheck
npm run lint
npm run build
```

Si falta Chromium para Playwright, instalarlo con `npx playwright install chromium`.
También se admite `PLAYWRIGHT_CHROMIUM_EXECUTABLE` para un Chromium local existente.
`npm run test:emulator` inicia un emulador temporal y ejecuta la integración;
usar esa alternativa cuando no haya otro emulador escuchando en el puerto 8085.

Las pruebas de integración vacían el proyecto **del emulador** entre casos.
No ejecutarlas durante una demostración que deba conservar sesiones locales.
Cubren concurrencia, códigos únicos, perfiles duplicados, discrepancias de
correo, aislamiento de cajas, QR cancelado/vencido, reintentos, reglas y límites
HTTP. E2E usa contextos separados para caja y cliente y verifica agradecimiento,
beneficio, captura asistida, cancelación, aislamiento, reintentos y recarga.
El cierre demo no escribe una venta ni una constancia manual en Firestore.

## Conectar Firebase después

Proyecto indicado: **`farma-copilot-2026` (Farma Copilot)**. El usuario confirmó
Firestore creado en `us-central1`; mantenemos el backend Firestore del MVP.
[Configuración del proyecto y estado de acceso](docs/firebase-project.md).

El usuario configurará las credenciales Admin en Vercel. El backend
necesita una cuenta de servicio con acceso a los documentos de esta aplicación.
Configurar en el entorno del servidor, mediante el gestor de secretos de Vercel:

- `FIREBASE_PROJECT_ID`: ID del proyecto real.
- `FIREBASE_CLIENT_EMAIL`: correo de la cuenta de servicio.
- `FIREBASE_PRIVATE_KEY`: clave PEM; admite saltos reales o `\n` escapados.
- `CUSTOMER_KEY_SECRET`: secreto aleatorio propio de al menos 32 caracteres.
- `APP_BASE_URL`: origen público exacto, por ejemplo `https://registro.example.com`.

Usar `.env.production.example` como referencia de variables. Ese archivo no
contiene secretos ni se carga automáticamente. Después de configurar las
variables en Vercel, ejecutar un nuevo despliegue del repositorio para aplicarlas.

**Eliminar `FIRESTORE_EMULATOR_HOST` del entorno cloud.** No copiar el secreto
de desarrollo. No poner estas variables bajo `NEXT_PUBLIC_` ni subir `.env.local`
o archivos de credenciales. No enviar claves por el chat. Para desarrollo con
credenciales administradas se admite `GOOGLE_APPLICATION_CREDENTIALS` en lugar
del par correo/clave.

Desplegar las reglas e índices en el proyecto seleccionado, usando su ID real:

```sh
npx firebase deploy --only firestore:rules,firestore:indexes --project ID_DEL_PROYECTO
```

Las reglas incluidas deniegan todo acceso del SDK cliente. Si el proyecto ya
contiene aplicaciones, integrar estas reglas con sus reglas existentes antes
del despliegue; no reemplazar reglas de otras aplicaciones sin revisarlas.
Firebase Admin usa permisos del servidor y no depende de login del usuario.
Las reglas cloud abiertas en modo prueba, reportadas por el usuario, aún no se
han sustituido por las reglas de este repositorio. Publicar las reglas cerradas
antes de usar registros reales, una vez verificado el acceso Admin del backend.
Opcional: habilitar TTL en `rateLimits.deleteAfter` para limpiar contadores;
la validez del QR se comprueba en servidor y no depende de TTL.

`CUSTOMER_KEY_SECRET` deriva el índice único por cédula. Mantenerlo estable;
cambiarlo requiere migrar índices para evitar perfiles duplicados.

## Vercel con despliegue automático

En el proyecto del repositorio actual seleccionar **Root Directory:
`apps/farmaenlace-qr`**, framework Next.js y Node.js 24. Mantener `npm run build`
como comando de compilación y el directorio de salida automático de Next.
Subir el lockfile y `.npmrc` junto al código. No configurar exportación estática:
la aplicación necesita sus rutas de servidor.

Asignar las variables anteriores al entorno correcto. Producción y Preview
deben tener su propio `APP_BASE_URL` coherente con el origen que se abre; una
Preview con origen distinto al configurado rechazará los envíos. Tras agregar
las variables, lanzar un nuevo despliegue desde el flujo habitual del repositorio.

La UI compila sin Firebase. Sin configuración, registrar devuelve un error
explícito y no simula datos guardados. `/api/health` informa la presencia de
configuración y el tipo de almacenamiento; no demuestra conectividad real.
Las pruebas de registro se ejecutan contra el emulador. La aceptación con un
cliente en cloud se puede realizar desde el teléfono y confirmar el estado en
la caja; los ensayos automáticos no escriben perfiles en producción.

## Datos y límites de integración

- `customers`: perfil opaco con cédula/correo **no verificados**.
- `customerKeys`: índice HMAC por cédula; un correo compartido no fusiona personas.
- `customerObservations`: diferencias pendientes sin sobrescribir el correo ni
  preferencias canónicas. No hay corrección de identidad pública.
- `registrationSessions` y `registrationCodes`: sesión, código y vínculo interno.
- `events`: creación, registro, código y constancia manual para trazabilidad.
- `manualVendixRecords`: endpoint legacy, `manual_unverified`; el mock actual no lo invoca.

Es una base para alimentar el perfil de referencia. No sincroniza todavía el
maestro corporativo, historial de ventas, devoluciones ni promociones. Tampoco
envía correos o verifica titularidad de la cédula. Las discrepancias necesitan
un proceso posterior de resolución antes de activar acciones comerciales.

La consola recibe estado y referencias opacas, sin mostrar el código interno. Una cookie opaca HttpOnly, emitida sin
login, vincula el navegador con sus sesiones; no es una identidad verificada del
dependiente. Para probar dos cajas aisladas usar perfiles/contextos de navegador
distintos. El token QR y el código no contienen datos personales. No existe
búsqueda pública por cédula o código. SSE observa Firestore en servidor, cierra
en 24 segundos y reconecta; la UI indica si usa polling de respaldo.

`idempotencyKey` identifica el intento del formulario. La consistencia se decide
con el HMAC del contenido normalizado: repetir el mismo contenido devuelve el
mismo código; cambiar la key no permite reemplazar un registro ya emitido.

## Evidencia inicial · 8 de octubre de 2026 (flujo anterior)

17 pruebas correctas: dominio 3, integración Firestore/reglas/HTTP 9 y E2E 5.
Lint sin errores/advertencias, TypeScript y build de producción correctos.
Revisión manual en navegador completó QR, registro, actualización de caja,
recarga del código y constancia manual con datos sintéticos.
Instalación reproducible revisada con `npm ci --dry-run --ignore-scripts --offline`.
Capturas de la interfaz actual: [caja tablet](docs/preview/pos-desktop.jpg),
[caja móvil](docs/preview/pos-mobile.jpg), [formulario móvil](docs/preview/registro-form-mobile.jpg)
y [resultado móvil](docs/preview/registro-mobile.jpg).
[Revisión UI con Impeccable e identidad pública](docs/ui-review.md).
Firebase real y despliegue Vercel verificados. Esta evidencia corresponde al flujo anterior; la corrección posterior elimina el ingreso de códigos de la UI.

Referencias: [Next.js en Vercel](https://vercel.com/docs/frameworks/full-stack/nextjs),
[duración de funciones](https://vercel.com/docs/functions/configuring-functions/duration),
[Firebase Admin](https://firebase.google.com/docs/admin/setup),
[emulador Firestore](https://firebase.google.com/docs/emulator-suite/connect_firestore).

## Corrección posterior: mock Vendix y captura asistida

TDD de transacciones asistidas y beneficio en centavos, con pruebas de
concurrencia QR/dictado, permisos de caja, origen HTTP y consentimiento. Pruebas
E2E de agradecimiento, actualización sin recargar, beneficio automático,
comprobante solo local y limpieza al cancelar. Ver [revisión del mock](docs/vendix-mock-review.md).

- [Caja con comprobante demo](docs/preview/vendix-desktop.jpg).
- [Beneficio en pantalla de 320 px](docs/preview/vendix-mobile.jpg).

- [Agradecimiento del cliente](docs/preview/vendix-customer-thanks.jpg).


## Promociones exclusivas por registro

El catálogo ficticio de `src/lib/demo-sale.ts` es la fuente de las tarjetas y
el cálculo en centavos. Estado sin registro/pendiente/vencido/cancelado oculta
las promociones, el estado de ahorro y la fila de descuento. El descuento es cero. Registro confirmado por QR o datos
dictados desbloquea ambas, aplica $0,85 + $1,59 y actualiza el total de la compra
demo a $21,96. El teléfono confirma que las promociones están activas. Siguiente
cliente reinicia la elegibilidad y oculta las promociones; el consentimiento por correo es independiente.
No se conectaron campañas reales de PromoGo ni se conceden descuentos reales.
[Vista móvil de promociones aplicadas](docs/preview/promociones-registrados-mobile.jpg).
