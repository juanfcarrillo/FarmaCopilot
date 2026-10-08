---
type: Development Episode
title: 'Closed change: farmaenlace/farmaenlace-qr-mvp-20261008'
description: Immutable record for farmaenlace work item farmaenlace-qr-mvp-20261008.
tags:
  - episode
  - farmaenlace
  - high
status: draft
generated:
  by: 'process:development-harness'
  at: '2026-10-08T18:04:42.176Z'
sources:
  - id: work-item
    resource: /work/farmaenlace-qr-mvp-20261008.md
    title: Closed Work Item
workflow_state: done
project: farmaenlace
change_id: farmaenlace-qr-mvp-20261008
archive_path: /openspec/changes/archive/2026-10-08-farmaenlace-qr-mvp-20261008
---
# Outcome

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

# Despliegue acordado

El usuario usará el repositorio actual con despliegue automático en Vercel y proporcionará Firebase después. La entrega de esta fase consiste en implementación probada con emulador y configuración documentada; conexión Firebase y verificación cloud quedan pendientes de esos datos. No crear proyectos ni publicar manualmente.

# Implementación y revisión final

Aplicación completa en `apps/farmaenlace-qr/`: Next.js 16.4/React 19.3/TypeScript, Firestore Admin servidor, QR por sesión, formulario móvil sin auth y código único en caja/cliente mediante SSE. Cookie de capacidad sin cuenta aísla consolas; DTO no entrega PII. Perfil opaco y HMAC por cédula; correo diferente queda pendiente sin sobrescribir; constancia Vendix manual, ticket opcional. README, ejemplo env, .npmrc, lockfile, reglas/emulador y Vercel listos. Sin SmartClub ni recomendador.

Principal revisó dominio, transacciones, HTTP/API, SSE y límites de integración. Hallazgos corregidos: copy de privacidad inexacto, pérdida de código al recargar, randomUUID no disponible en HTTP LAN, cambio de hash entre QR, carrera al restaurar POS y pérdida de referencia ante error de red. Sin hallazgos bloqueantes restantes en el alcance local. Principal comprobó manualmente el flujo con datos sintéticos y código coincidente sin refresh; recarga cliente y constancia manual correctas.

# Evidencia de validación

- TDD: RED dominio por módulo no implementado; GREEN dominio 3 pruebas. RED E2E de refresh, navegación QR y restauración ante red; correcciones y GREEN final.
- `npm test`: dominio 3 correctas.
- `npm run test:integration` contra Firestore Emulator: Firestore 5, reglas 1 y HTTP 3 correctas.
- `npm run test:e2e`: 5 correctas (1,4 minutos), contextos/cajas separados, mismo código en vivo, refresh, expiración/cancelación/reintento, HTTP/SSE acotado y recuperación de red.
- `npm run lint`: 0 errores/advertencias; `npm run typecheck`: correcto; `npm run build`: correcto, Next genera 7 páginas y APIs dinámicas.
- `npm ci --dry-run --ignore-scripts --offline --no-audit --no-fund`: correcto con lockfile y .npmrc.
- Capturas verificadas en `apps/farmaenlace-qr/docs/preview/`.
- No despliegue cloud ni API Vendix verificados: diferidos explícitamente por el usuario, configuración y contrato documentados. El perfil no es todavía el maestro corporativo ni valida identidad.

# Next knowledge action

Review any durable promotion separately with a human.
