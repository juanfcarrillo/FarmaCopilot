---
type: Session Checkpoint
title: Sesión de propuesta MVP QR Farmaenlace
description: Preparación y gate de aprobación para construir identificación y trazabilidad con QR.
status: draft
generated: { by: agent, at: "2026-10-08T17:32:09.770Z" }
sources:
  - resource: /work/farmaenlace-qr-mvp-20261008.md
goal: Acordar el MVP QR y, después de aprobación, delegar su implementación con contexto completo.
current_step: Usuario aprobó implementación sin auth/login; specs revisadas y gate true; delegación en curso.
next_step: Subagente implementa QR → formulario → código → registro manual en Vendix; principal revisa y valida.
blockers: []
work_item: /work/farmaenlace-qr-mvp-20261008.md
---

Usuario: empezar por identificación/trazabilidad QR; considerar React/Next, Firebase, Vercel y tiempo real. Solo lanzar subagente después de su aprobación. Modelo y effort deben heredarse; usar fork_turns all sin overrides. SmartClub está excluido. El motor de promociones es otro alcance; PromoGo tiene múltiples fuentes. El MVP alimenta el flujo de ventas y el perfil/golden record, sin afirmar integración real con Vendix.

Memoria base: [contexto Farmaenlace](/semantic/farmaenlace-identidad-y-priorizacion.md). Specs en `harness/openspec/changes/farmaenlace-qr-mvp-20261008/`.

Aprobación explícita recibida: sin Firebase Auth, sin login del tendero; registro del cliente después del QR y código para Vendix. El historial completo y specs revisadas deben guiar la implementación, no el diseño anterior de cuentas.
