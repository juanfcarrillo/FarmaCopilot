---
type: Work Item
title: MVP de identificación y trazabilidad QR Farmaenlace
description: Implementar el alcance aprobado sin login, registro móvil por QR, código para Vendix, tiempo real y perfil de referencia.
status: draft
generated: { by: agent, at: "2026-10-08T17:22:55Z" }
sources:
  - resource: /semantic/farmaenlace-identidad-y-priorizacion.md
  - resource: ../../openspec/changes/farmaenlace-qr-mvp-20261008/proposal.md
project: farmaenlace
change_id: farmaenlace-qr-mvp-20261008
workflow_state: in_progress
complexity: high
human_gate_approved: true
next_step: Subagente qr_mvp_builder implementa; principal revisa, verifica UI/pruebas y prepara entrega.
blockers: []
---

# Alcance y clasificación

El usuario aprobó la segunda capacidad y autorizó un subagente con el mismo modelo/esfuerzo y contexto completo. Se lanzó qr_mvp_builder; las specs revisadas excluyen auth/login y definen código para ingreso manual en Vendix. La implementación está en curso.

Aunque es la capacidad más sencilla del proyecto, el cambio cruza datos personales, sesiones QR, sincronización, persistencia y despliegue. Se clasifica high para la implementación y sigue OpenSpec con gate humano ya aprobado para el alcance revisado.

# Plan

Implementar specs revisadas de QR, identidad, códigos/trazabilidad, acceso por capacidades sin login, tiempo real SSE y despliegue. Next.js + Firestore Admin server-only + Vercel, sin Firebase Auth. Subagente construye; principal supervisa TDD, revisa, valida flujo y entrega.

# Verificación de la propuesta

- Proposal, design, tasks y cinco deltas de dominio completos; self-review de alcance, estados, permisos, idempotencia y límites de integración.
- `npm --prefix harness run harness:index` y `npm --prefix harness run harness:validate`: correctos antes de pasar a spec_ready.
- Documentación técnica oficial de Firebase, Next.js y Vercel consultada; realtime vía Firestore, API en Node.js.
- Aprobación explícita recibida con corrección sin auth; `human_gate_approved: true`. Subagente lanzado e implementación en curso.
- No existen credenciales Firebase/Vercel confirmadas ni contrato técnico de Vendix. Desarrollo verificable con emuladores; despliegue real condicionado a acceso y configuración.

# Aprobación humana y revisión de alcance — 8 de octubre de 2026

El usuario aprobó explícitamente «Dale hazlo pls» con corrección: sin auth/login del tendero; cliente escanea QR, registra datos y el código se registra en Vendix. Specs sustituidas para ese flujo. Cookie de capacidad de consola sin cuenta; PII solo en servidor, Firestore deny-all, SSE de código/estado. Código distinto de datos personales/token QR. Integración inicial manual en Vendix; no afirmar API real. Esta aprobación reemplaza la restricción previa pendiente; el gate está aprobado para las specs revisadas.

# Delegación iniciada

Subagente `/root/qr_mvp_builder` lanzado con historial completo (fork_turns all), modelo/esfuerzo heredados y alcance de código restringido a apps/farmaenlace-qr/. Principal conserva memoria/harness, revisión y entrega.
