---
type: Work Item
title: Promociones exclusivas para clientes registrados
description: Mostrar y activar promociones demo al confirmar registro QR o asistido.
status: deprecated
generated:
  by: agent
  at: '2026-10-08T19:53:26Z'
sources:
  - resource: /semantic/farmaenlace-identidad-y-priorizacion.md
project: farmaenlace
change_id: farmaenlace-promociones-registrados-20261008
workflow_state: done
complexity: low
next_step: Cerrado; conectar campañas reales de PromoGo requiere alcance posterior.
blockers: []
---
Usuario pide promociones que se activen únicamente tras registrar los datos del cliente. Alcance low: catálogo estático de demostración sobre el mock existente; sin motor real PromoGo, nuevas APIs, permisos ni ventas reales. Se mantiene registro confirmado en servidor como condición y consentimiento de correos opcional e independiente.

Plan y aceptación: catálogo de dos promociones demo por producto del carrito (10% gel y 10% protector solar), visibles bloqueadas antes del registro y activas/aplicadas después. Un único cálculo en centavos deriva el total de esas promociones, sin duplicar el beneficio previo. QR y datos dictados activan el mismo catálogo; errores/vencimiento/cancelación y siguiente cliente no habilitan promociones. Agradecimiento confirma desbloqueo. Pruebas de dominio y navegador primero, self-review, lint/typecheck/build y QA responsive; push app-only al despliegue Vercel existente. No pruebas de clientes en cloud.


Implementado catálogo estático y cálculo único por producto, tarjetas de bloqueo/aplicación, confirmación y listado en teléfono. Sin cambios de backend, credenciales ni reglas. Self-review de elegibilidad/restauración, consentimiento independiente, suma del descuento y datos personales correcto. RED observado en pruebas de catálogo inexistente; GREEN con 6 pruebas de dominio/beneficio y 7 E2E correctas. npm test, playwright test, lint y typecheck correctos; build de producción correcto. Integración backend sin cambios: no se amplía ejecución Firestore aparte de E2E usando emulador. QA CUA en escritorio y 320 px, registro asistido con datos ficticios/marketing=false; promociones activas visibles sin PII. Pestaña QA cerrada, viewport restaurado, Next y emulador detenidos.

Commit app-only 975fcd568dd0d71be44cce6e868b8630ab2385a7 publicado en main. Auto-deploy farma-copilot-4izjup5ob-juanfi444s-projects.vercel.app en curso. App sin cambios pendientes.

Entrega: Vercel dpl_7FHE93qQfStUSBFsEjYfMfb25H14 Ready, build 31 s. CUA confirmó catálogo bloqueado y nuevo texto en https://farma-copilot.vercel.app/pos, sin registrar clientes cloud de prueba. Se conserva pestaña de entrega y captura pública en visualizaciones del chat. Memoria actualizada y app worktree limpio.
