# Código de registro y vínculo Vendix

TR-1: registro emite código único legible sin PII, vinculado internamente a sesión/perfil; el tendero lo ingresa manualmente en Vendix.
TR-2: registrar eventos session_created/customer_registered/code_issued y constancia opcional vendix_recorded_manual; no inventar venta confirmada ni monto/ticket obligatorio.
TR-3: constancia manual requiere capacidad de sesión y código correspondiente; idempotencia evita duplicados; fuente manual_unverified.
TR-4: contrato/adapter Vendix declara not_connected hasta disponer de API real; el código permite la futura asociación con un ticket por ese contrato.
TR-5: ni código corto ni formulario público permiten leer perfil o marcar otra sesión.

Escenarios: registro guarda perfil/código/eventos una vez; doble reintento retorna mismo resultado; constancia duplicada no duplica eventos; codigo de otra sesión rechazado; UI aclara qué es ingreso manual y qué no es integración automática.
