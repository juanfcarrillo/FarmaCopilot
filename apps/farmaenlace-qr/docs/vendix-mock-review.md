# Mock Vendix: revisión de alcance y comportamiento

Corrección del 8 de octubre de 2026: el cliente recibe un agradecimiento y
continúa con el descuento. El dependiente recibe la identidad automáticamente
en caja o captura cédula/correo dictados, sin login y sin copiar códigos.

## Implementación y límites

- `RegistrationService.register` es la transacción común; la autorización QR
  valida el token, y la captura asistida valida la caja propietaria antes y
  dentro de la transacción. El primer registro confirmado conserva sus datos y
  método incluso al reintentar por el otro canal.
- `assisted-registration` exige origen, cookie HttpOnly, payload acotado y rate
  limits. Responde con el whitelist de estado existente, sin cédula/correo,
  hash ni ID de cliente. No habilita consulta de perfiles o historial.
- Perfil deduplicado por HMAC de cédula, contacto sin verificar y discrepancias
  pendientes, conservando el canónico y su consentimiento.
- La caja muestra un carrito ficticio y beneficio demo del 10%. Cálculo en
  centavos, habilitado solo con estado de registro confirmado por el backend.
- El cierre es local al navegador y no llama a `vendix-record` ni crea eventos
  de ventas reales. Se etiqueta demostración tanto en la caja como en el teléfono.
- Los formularios de dictado no guardan datos personales en storage, URL o logs.
  Se desmontan al confirmar, cambiar de modo o cancelar. Un fallo recuperable
  conserva temporalmente el contenido para reintentar sin dictarlo otra vez.

## Revisión de aceptación

Se revisaron rutas de entrada, estado persistido/restaurado, carrera QR/dictado,
reintentos y límites de integración. Se corrigió un hallazgo: cancelar desde
la captura asistida conservaba el formulario. La prueba primero falló; ahora la
cancelación cambia al modo QR y elimina esos datos de la interfaz.

Marca oficial, tokens de color y tamaños accesibles de la revisión anterior
con Impeccable preservados. Se eliminó el CSS del flujo antiguo de códigos y
constancia manual. La caja mantiene dos columnas en escritorio; en móvil el
resumen de compra pasa primero cuando llega el registro. Nuevos estados de
cliente/beneficio son anunciados con `aria-live`; controles y etiquetas tienen
foco visible, con consentimiento opcional desmarcado.

QA visual manual en Chromium con emulador: escritorio, formulario a 390 px y
beneficio a 320 px, con contenido completo legible y controles sin recorte.
El registro manual y el cierre también se ejercitaron mediante teclado.
Capturas sintéticas locales en `docs/preview/vendix-*.jpg`; pueden mostrar
Next DevTools. No se certifica Safari, lector de pantalla ni dispositivo físico.


Validación: 24 casos únicos correctos (5 dominio/beneficio, 12 integración
Firestore/reglas/HTTP, 7 E2E). Se observó RED por ausencia del método asistido,
del cálculo demo y de la UI dictada; GREEN después de implementarlos. La prueba
de limpieza al cancelar también falló primero y pasó tras corregir el estado.
Lint, TypeScript, build de producción y `git diff --check` correctos. No se
escribieron clientes de prueba en el proyecto cloud.


## Extensión: promociones exclusivas de registrados

El beneficio genérico del mock se presenta ahora como dos promociones de producto
(10% gel y 10% protector solar), con bloqueo explícito antes de registrar. Ambas
se activan automáticamente al confirmar el servidor por QR o captura asistida.
La misma función deriva estado, ahorro por oferta y suma del descuento en el
carrito, sin acumular otro descuento general. El correo opcional no habilita ni
restringe estas ofertas en caja. El teléfono confirma activación y lista ambas.

Self-review: elegibilidad únicamente en estados registered/recorded_manual,
restauración desde servidor, ahorro cero pendiente/vencido/cancelado, reinicio
para siguiente cliente y cierre ficticio sin escrituras de ventas. Catálogo
demo y ayudas explícitas, sin APIs/credenciales/reglas nuevas. Las pruebas
comprueban tarjetas bloqueadas/activas en QR y dictado con marketing=false,
fallo de red, cancelación, recarga y siguiente cliente. QA CUA local a 320 px,
tarjetas completas y ahorro legible; captura sin datos personales.

Validación de la extensión: 6 pruebas de dominio/beneficio y 7 E2E correctas; lint, typecheck, build de producción y git diff --check correctos. Backend sin cambios; ensayos de registro exclusivamente contra emulador.


## Corrección de visibilidad

Por petición explícita posterior, las tarjetas, el estado de promociones y la
fila de descuento no se renderizan antes del registro confirmado. Aparecen ya
aplicadas después de QR o captura asistida. Se retiran al iniciar el siguiente
cliente. Se eliminó el estado visual de candados/bloqueo; elegibilidad y cálculo
permanecen iguales. Las pruebas existentes se adaptan para verificar ausencia
completa del bloque, estado y fila antes del guardado, tras fallo/cancelación y
al reiniciar; dos promociones activas después de guardar y al recargar.

Verificación de visibilidad: 3 E2E relevantes correctas (QR y recarga, dictado/error/siguiente cliente, cancelación), lint, TypeScript y diff sin errores.
