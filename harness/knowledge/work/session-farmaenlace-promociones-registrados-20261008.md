---
type: Session Checkpoint
title: Sesión promociones por registro
description: Activar catálogo demo tras registro confirmado en caja.
status: deprecated
generated:
  by: agent
  at: '2026-10-08T19:57:37Z'
sources:
  - resource: /work/farmaenlace-promociones-registrados-20261008.md
goal: Promociones exclusivas de registrados por QR y datos dictados.
current_step: Entregado en producción Ready; UI pública confirmada.
next_step: Archivar Work Item y checkpoint.
blockers: []
work_item: /work/farmaenlace-promociones-registrados-20261008.md
workflow_state: done
---
App apps/farmaenlace-qr en main 87219a3, producción Ready. Extender el mock conservando Firebase/no Auth, sin códigos visibles y sin integración real PromoGo. Preservar cambios previos de harness fuera del commit app.

Commit 975fcd5 ya publicado; build local correcto. Pendiente únicamente Ready y UI pública.

Commit 975fcd5 desplegado Ready dpl_7FHE93qQfStUSBFsEjYfMfb25H14 y alias principal verificado visualmente. Sin procesos locales ni cambios de credenciales/reglas/backend.
