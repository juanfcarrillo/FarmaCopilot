# Identidad y perfil

ID-1: envío válido crea/reutiliza perfil interno por documento normalizado, sin confirmación/login del tendero.
ID-2: customer_id opaco y unicidad transaccional bajo concurrencia; no fusionar documentos diferentes por correo compartido.
ID-3: documento/correo quedan no verificados; guardar origen/preferencias/tiempos.
ID-4: correo distinto para documento existente no sobrescribe canónico ni revela el anterior; conservar observación pendiente, con prueba del caso.
ID-5: no hay endpoint público de búsqueda por cédula/código, ni historial de clientes en consola.

Escenarios: segundo registro del mismo documento reutiliza perfil; dos registros concurrentes convergen; mismo correo con documentos distintos mantiene perfiles separados; discrepancia queda pendiente; DTO público solo muestra código y estado.
