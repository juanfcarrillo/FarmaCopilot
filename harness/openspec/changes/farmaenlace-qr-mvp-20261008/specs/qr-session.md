# QR y formulario sin login

QR-1: tendero crea sesión sin cuenta/login; QR por venta con token aleatorio de 32 bytes y diez minutos de vigencia.
QR-2: capacidad privada de consola distinta del token QR y del código legible; ninguno contiene PII.
QR-3: cliente completa cédula/correo y preferencias opcionales desde móvil, sin login.
QR-4: envío persiste registro y devuelve código único legible; reintento idéntico devuelve mismo código, payload diferente no reemplaza registro.
QR-5: expirado/cancelado no registra; API valida payload y estados; error de red no se presenta como éxito.

Escenarios: QR A actualiza solo sesión A; envío concurrente produce un código; vencimiento servidor se aplica aun sin TTL; payload inválido rechazado server; códigos en teléfono y consola coinciden.
