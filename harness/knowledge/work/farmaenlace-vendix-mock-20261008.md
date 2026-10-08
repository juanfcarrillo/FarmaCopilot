---
type: Work Item
title: Mock Vendix con agradecimiento y registro asistido
description: >-
  Sustituir copia de códigos por confirmación y beneficio demo, con captura por
  QR o dictado manual.
status: deprecated
generated:
  by: agent
  at: '2026-10-08T19:08:39Z'
sources:
  - resource: /semantic/farmaenlace-identidad-y-priorizacion.md
project: farmaenlace
change_id: farmaenlace-vendix-mock-20261008
workflow_state: done
complexity: medium
next_step: Cerrado; integración real Vendix/PromoGo queda como alcance futuro.
blockers: []
---
Corrección del usuario: no mostrar copiar código para Vendix; agradecer registro y facilitar continuación con descuento. Añadir fallback de cédula/correo dictados al dependiente y mock de Vendix para simular atención/registro de cliente. Interpretación: el dependiente atiende al cliente, no onboarding ni login de operadores. Se mantiene condición previa sin Auth. Consulta opcional pendiente sobre cómo representar el beneficio; propuesta demo configurable sin campaña real.

Clasificación medium: capacidad acotada dentro del dominio de identidad existente; sin nueva arquitectura, permisos cloud, motor comercial, cobros ni integración a Vendix/PromoGo reales. La captura asistida usa autorización de la misma caja mediante capability cookie existente, misma deduplicación/transacción y sin consultas públicas de PII. Ticket/descuento son simulación de navegador, no ventas reales ni eventos de compra en el golden record. Identidad sigue guardándose en Firestore existente. Cualquier integración real de promociones/ventas o acceso nuevo a perfiles exige otro alcance.

Plan escrito y aceptación:
1. RED: pruebas de captura asistida (propietario, concurrencia QR/manual, fuente y deduplicación) y beneficio demo (solo tras registro confirmado, cálculo en centavos y límites).
2. GREEN: método asistido y endpoint con cookie, origen y rate limits existentes; metadata qr/assisted sin PII en respuestas. Clientes canónicos no sobrescritos ni consentimiento inferido.
3. UI: éxito cliente agradece y permite continuar en caja, sin código ni copiar código. POS simula Vendix con carrito ficticio, estado de cliente, QR y captura dictada validada; descuento demo automático solo tras persistencia confirmada. Consentimiento opcional y desmarcado. Al cambiar/terminar captura, limpiar PII en memoria; nunca guardarla en storage/URL/logs.
4. Cierre de venta solo simulado y etiquetado, sin llamar constancia de ingreso en Vendix real ni crear compras reales. Estados de red/cancelación/vencimiento/restauración deben conservarse. Mantener endpoints legacy compatibles, aunque el nuevo flujo ya no pida ingreso manual de código.
5. TDD UI: adaptar pruebas de flujo a agradecimiento/beneficio y añadir registro asistido/aislamiento. Review de implementación, lint/types/build, pruebas pertinentes y QA responsive con emulador. No escribir perfiles de prueba en cloud.
6. Publicar app-only en repo automático, verificar Vercel Ready y apariencia pública, actualizar memoria vigente y documentación.


Implementación y revisión completadas: transacción común QR/asistido, endpoint con caja propietaria/origen/rate limits, método/origen sin PII en respuestas. POS mock de Vendix y agradecimiento en teléfono, sin copiar códigos; beneficio demo 10% y comprobante solo local. Cancelar limpia campos; identidad canónica y preferencias conservadas. Sin auth ni integración real de promociones/ventas. Consulta opcional sin respuesta: se adoptó beneficio ficticio 10%, anunciado al usuario.

TDD observado: RED de submitAssisted inexistente, módulo demo inexistente, UI dictada inexistente; GREEN transacción y flujo. RED adicional de limpieza al cancelar; corregido al volver al modo QR. 24 casos únicos correctos: 5 dominio/beneficio, 12 Firestore/reglas/HTTP, 7 E2E. Comandos: vitest run tests/domain.test.ts tests/demo-sale.test.ts tests/firestore.test.ts tests/http.test.ts tests/rules.test.ts; playwright test (6) y foco cancelar captura/dos cajas (2, uno repetido); npm run lint, npm run typecheck, npm run build; git diff --check. Solo emulador, sin perfiles de prueba cloud. Review manual de aceptación/carreras/whitelist/permisos/limpieza/demo local documentado en apps/farmaenlace-qr/docs/vendix-mock-review.md. QA CUA escritorio, móvil 390/320, registro QR y dictado, beneficio y cierre con teclado; capturas sin PII. Procesos/pestañas temporales se cierran antes de entrega.


Entrega: commit 87219a34e03d47fb71693cb09ecdbca310080c05 publicado por push main, auto-deploy Vercel dpl_6R8SFs4whMKsN6T7h6znx6mAyR9t Ready en 31 s, alias https://farma-copilot.vercel.app/pos. CUA verificó UI pública QR y datos dictados sin generar perfiles cloud; captura final vendix-mock-publicado.jpg en visualizaciones del chat. Memoria semántica actualizada, evidencia histórica conservada. No se cambiaron credenciales, reglas, permisos cloud ni APIs reales de Vendix/PromoGo. App worktree limpio tras commit; cambios previos del harness preservados.
