---
type: Session Checkpoint
title: Sesión visibilidad de promociones
description: Ocultar catálogo hasta registro exitoso.
status: deprecated
generated:
  by: 'process:development-harness'
  at: '2026-10-08T20:13:10.569Z'
sources:
  - id: original-session
    resource: /work/session-farmaenlace-promociones-visibilidad-20261008.md
    title: Original session checkpoint
goal: Promociones visibles exclusivamente tras registro confirmado.
current_step: 'Entregado, producción Ready y ausencia de promociones previa verificada.'
next_step: Archivar checkpoint.
blockers: []
work_item: /work/farmaenlace-promociones-visibilidad-20261008.md
workflow_state: done
---
App apps/farmaenlace-qr en main 975fcd5; flujo actual muestra bloqueadas antes de registrar. Usuario pide ocultarlas completamente. Nuevo estado reemplaza visibilidad anterior; descuento demo y perfil Firebase permanecen.

Build correcto, commit d136166 publicado; pendiente Ready y captura pública.

Producción Ready dpl_7FReGnkab5TosrJ7VRBQTjhaHhyD, alias principal actualizado y UI observada sin bloque/estado/fila. Build y 3 E2E pertinentes correctos.
