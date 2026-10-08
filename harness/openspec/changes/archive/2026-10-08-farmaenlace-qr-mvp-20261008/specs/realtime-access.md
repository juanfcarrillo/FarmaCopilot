# Tiempo real sin Auth

RT-1: no Firebase Auth, login, registro de tendero ni autenticación anónima oculta. Consola sin cuenta.
RT-2: capacidad opaca autoemitida en cookie HttpOnly vincula consola con sus sesiones; acceso cruzado denegado. No permite acceder a PII.
RT-3: Firestore cliente deny-all; API Admin valida tokens/capacidades/payload/estado por operación.
RT-4: SSE server-only observa Firestore y transmite código/estado sin PII; cierre acotado/unsubscribe y reconexión sin duplicación. Fallback polling explícito si se necesita.
RT-5: errores de red muestran estado recuperable; sin conexión no fingir recepción. Estado de negocio compartido en Firestore, no memoria de proceso serverless.
RT-6: tamaño/payload/origin/rate limits, secretos de servidor fuera del bundle/logs; código corto no es llave de lectura de datos personales.

Escenarios: móvil envía y consola recibe sin refresh; consola B no lee/actualiza A; token de QR no accede consola; reglas bloquean acceso directo; endpoints rechazan payload grande/abuso; SSE no incluye cédula/correo.
