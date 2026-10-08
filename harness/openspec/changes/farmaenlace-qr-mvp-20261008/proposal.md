# MVP QR Farmaenlace — alcance aprobado sin login

Aprobación: el usuario indicó «Dale hazlo pls. No vamos a usar auth. El tendero, no hace login, el user registra sus datos despues de scannear el qr y el codigo se registra en vendix» el 8 de octubre de 2026. Esta revisión reemplaza la propuesta anterior con Firebase Auth y confirmación de datos por staff.

## Flujo aprobado

1. Tendero abre la consola sin cuenta/login y genera un QR de sesión de venta.
2. Cliente escanea desde su teléfono, registra cédula/correo y preferencias opcionales.
3. Servidor valida y persiste el registro/perfil y genera un código de registro legible, sin datos personales.
4. Cliente y consola reciben el código; la consola se actualiza en tiempo real y muestra estado, no cédula/correo/historial.
5. Tendero introduce el código en Vendix manualmente. Puede dejar constancia manual en la consola, con referencia de ticket opcional.
6. Se conservan eventos de registro, código emitido y constancia manual. Solo una integración real futura podrá confirmar automáticamente un vínculo/venta en Vendix.

## Stack y entrega

Next.js/React/TypeScript, API Node.js en Vercel, Firestore mediante Firebase Admin solo en servidor. Sin Firebase Auth, login, cuentas, SDK de cliente que lea PII ni colecciones abiertas. Tiempo real por SSE de la API respaldado por Firestore, conexiones acotadas y reconexión. QR único por sesión de diez minutos para enviar; código de registro distinto del token QR y de la capacidad privada de consola.

Aplicación en apps/farmaenlace-qr/, UI española móvil/escritorio, configuración Firebase/Vercel, emulador, tests de dominio/reglas/flujo E2E y README. Identidad básica es perfil inicial, no golden record corporativo integrado. Correo/documento no verificados por captura. SmartClub y el motor promocional quedan fuera del alcance.

## Acceso sin login

La consola obtiene una capacidad opaca por navegador/sesión mediante cookie HttpOnly; no corresponde a una cuenta ni identifica al tendero. Solo permite observar/operar sus propias sesiones, sin leer datos personales. El QR es un permiso temporal limitado a enviar el formulario. El código corto únicamente es referencia para Vendix; no abre perfiles ni permite enumerar personas. Toda lectura/escritura Firestore del navegador se deniega.

## Integración

Vendix se usa para ingreso manual del código. Sin contrato ni credenciales no se afirma escritura automática ni venta confirmada por Vendix. Entregar DTO/adaptador preparado, estado not_connected y constancia explícitamente manual. No construir un POS de cobro ni exigir monto/ticket para dar el código.

## Delegación

Aprobado un único subagente con fork_turns all, heredando modelo/esfuerzo sin overrides. Principal supervisa/revisa y conserva control del harness. TDD estricto, revisión y validación antes de cerrar. Despliegue real requiere acceso efectivo a Firebase/Vercel; completar localmente con emuladores si falta.

## Fuentes técnicas

- https://firebase.google.com/docs/firestore/query-data/listen
- https://firebase.google.com/docs/admin/setup
- https://vercel.com/docs/functions/streaming-functions
- https://nextjs.org/docs/app/api-reference/file-conventions/route
