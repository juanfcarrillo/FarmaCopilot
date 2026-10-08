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
