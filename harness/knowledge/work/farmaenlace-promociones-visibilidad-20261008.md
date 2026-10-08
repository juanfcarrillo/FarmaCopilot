---
type: Work Item
title: Mostrar promociones solo tras guardar el registro
description: Ocultar ofertas y fila de ahorro hasta confirmación del registro.
status: deprecated
generated:
  by: agent
  at: '2026-10-08T20:10:46Z'
sources:
  - resource: /semantic/farmaenlace-identidad-y-priorizacion.md
project: farmaenlace
change_id: farmaenlace-promociones-visibilidad-20261008
workflow_state: done
complexity: low
next_step: Cerrado; promociones aparecen únicamente después del registro confirmado.
blockers: []
---
Corrección explícita: promociones no deben aparecer antes de que el usuario entregue sus datos y el servidor confirme guardado. Reemplaza mostrar ofertas bloqueadas del cambio anterior. Cambio UI acotado low: ocultar sección completa, estado de promociones y fila de descuento antes del registro; mostrar aplicadas tras QR/asistido; volver a ocultar en siguiente cliente/error/cancelación. Sin cambios de elegibilidad, Firebase, auth, campañas reales ni cálculo demo. Self-review y pruebas existentes de QR/dictado/cancelación, lint/types/build, captura pública y auto-deploy app-only. Preservar cambios de harness fuera del commit.

Self-review: condicional de render usa estado registrado confirmado existente; no se renderizan catálogo/estado/fila antes. Cálculo/eligibilidad y backend intactos. Adaptadas pruebas existentes (sin añadir suites): 3 E2E de QR/refresh, dictado/error/red/siguiente cliente y cancelación correctas en emulador; lint y tipos correctos. git diff --check correcto. Next y emulador detenidos. Build de producción correcto. README y memoria actualizados para sustituir candados por ausencia previa.

Commit app-only d136166a0ba999db7b890b0b6806ecdc85692161 publicado en main. Auto-deploy farma-copilot-5vl83g7p3-juanfi444s-projects.vercel.app en curso; app worktree limpio.

Entrega: commit d136166, Vercel dpl_7FReGnkab5TosrJ7VRBQTjhaHhyD Ready, alias principal verificado por CUA. Antes del registro no aparecen sección de promociones, candados, estado ni fila de ahorro; solo subtotal y total base. Captura pública promos-ocultas-antes-registro.jpg en visualizaciones del chat, sin PII/perfiles de prueba cloud. Pestaña de entrega conservada. Sin procesos locales y app limpia; cambios del harness preservados.
