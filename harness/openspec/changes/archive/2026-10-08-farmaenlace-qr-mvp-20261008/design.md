# Diseño aprobado — QR, código y Vendix sin login

## Interfaz

/pos: consola abierta sin login, sesión de venta, QR/enlace, recepción de código y estado en tiempo real, copiar código, regenerar/cancelar QR y constancia opcional «Registrado manualmente en Vendix». Nunca muestra lista de clientes, cédula, correo ni historial personal.

/registro: formulario móvil abierto por QR con token preferentemente en fragmento; cédula/correo, preferencias opcionales separadas y resultado con código grande/copiar. Éxito solo tras persistencia. Expirado/inválido/cancelado y fallo de red recuperables. No cuenta, login, OTP ni Firebase Authentication.

## Persistencia y permisos limitados

API Next.js Node.js usa Firebase Admin. Firestore queda cerrado a lectura y escritura directa del cliente (deny all); Admin valida todo en dominio/API. La cookie HttpOnly opaca de consola se genera automáticamente, nunca es cuenta o autenticación de usuario. Capacidad aleatoria de al menos 32 bytes por navegador, hash persistido/servidor, cookie Secure en producción y SameSite apropiado. No vincular sesiones únicamente por local/caja informados por el cliente.

Sesión conserva owner capability hash, local/caja, hash de token QR, expiresAt, estado y código emitido. La capacidad privada nunca va en QR. Token QR distinto, de 32 bytes y diez minutos para envío. Código corto aleatorio legible (p. ej. 10 caracteres sin ambiguos, formato FA-XXXX-XXXX-XX); unicidad comprobada y reintentos de colisión. No usar cédula/correo ni customerId como código legible. El código no habilita lectura de PII ni modificación pública.

Estados: awaiting_customer → registered → recorded_manual. Cancelled/expired solo antes de registrar. El servidor valida el vencimiento; TTL no protege permisos. Reintento de envío idéntico devuelve el mismo código; payload diferente sobre token consumido produce conflicto sin filtrar datos anteriores. Sin capacidad de consola no se lee/actualiza sesión.

## Datos

registrationSessions: metadatos/estado/código/hash/perfil interno/tiempos, sin PII en respuestas de consola.
customers: ID interno aleatorio, documento normalizado, correo no verificado, preferencias y fuente/tiempos. Acceso solo servidor; ID público no es la cédula.
customerKeys: HMAC servidor del documento para unicidad; secreto nunca NEXT_PUBLIC. Altas concurrentes mismo documento convergen. No fusionar por correo. Documento existente con correo distinto conserva datos canónicos y registra observación no verificada pendiente; no revelar correo previo ni sobrescribirlo.
registrationCodes: índice único del código → sesión/perfil interno, no consulta pública.
events: ids idempotentes, tipo (session_created, customer_registered, code_issued, vendix_recorded_manual), sesión/perfil si corresponde, fuente/hora; sin PII. No inventar venta ni ticket real.
manualVendixRecords: código/sesión/ticket opcional/timestamp y source manual_unverified. No equivale a callback o venta confirmada.

## API

POST /api/registration-sessions: capacidad autoemitida sin login, crea QR y sesión. Límites contra abuso.
POST /api/registrations: token QR, cédula/correo/preferencias/idempotency key; valida/persiste perfil+registro+código/eventos atómicamente. Respuesta mínima código/recepción.
GET /api/registration-sessions/:id: capacidad de consola requerida; metadatos/estado/código, sin PII.
GET /api/registration-sessions/:id/events: SSE usando cookie, tiempo acotado (por ejemplo 20–25 s), unsubscribe en disconnect, headers sin caché, reconexión al último estado. Backend observa Firestore; no Web SDK abierto ni Firebase Auth oculto. Polling solo como fallback explícito si streaming falla.
POST /api/registration-sessions/:id/cancel: capacidad y estado válido.
POST /api/registration-sessions/:id/vendix-record: capacidad, código y ticket opcional; constancia manual idempotente. Rechazar acceso cruzado y payload no coincidente.

VendixAdapter/DTO documenta el código para futura conexión; implementación inicial manual declara integrationStatus not_connected. No endpoint público que devuelva perfiles por código corto/cédula.

## Validación y comportamiento

Cédula ecuatoriana de persona natural diez dígitos y dígito verificador; validación duplicada servidor/feedback cliente. Email formato/límites. Captura no verifica titularidad. Marketing opcional inicialmente desmarcado. Datos personales/tokens/secretos excluidos de logs, URLs y bundles públicos. Origin/content-type, límites de payload y rate limit de endpoints mutantes; cookies HttpOnly; idempotencia y consumo transaccional QR. No es infraestructura de identidad corporativa ni prueba de quién es el tendero.

Si Firestore no está configurado no fingir éxito cloud. Emulador persistente para desarrollo y E2E; si se incluye modo local alternativo debe estar claramente etiquetado y mantener datos fuera del repo. API serverless no depende de memoria de proceso para estado de negocio ni unicidad; SSE escucha almacenamiento compartido.

## Pruebas y despliegue

TDD dominio y transacciones: QR vence/cancela, colisión, reintento, payload diferente, perfiles concurrentes, correo distinto, códigos opacos, constancia manual idempotente. Reglas emulador: toda lectura/escritura de cliente denegada. API: capacidades aisladas, cookie ausente/falsa, sin PII y abuso. E2E dos contextos (tendero/móvil), recepción SSE sin refresh, código coincidente, ingreso manual simulado etiquetado, dos cajas aisladas.

Next build/types/lint/tests; UI móvil/escritorio y accesibilidad básica. README .env.example sin secretos, Firebase rules/indexes, emuladores, Vercel Node runtime y región cerca de Firestore. Credenciales configuradas de forma segura, nunca impresas; falta de acceso se informa con pasos exactos.
