---
type: Work Item
title: Agrupar capacidades Farmaenlace e incorporar registro QR y golden record
description: >-
  Actualizar la memoria con las dos capacidades definidas por el usuario y su
  propósito compartido en el flujo de ventas.
status: deprecated
generated:
  by: agent
  at: '2026-10-08T17:15:13Z'
sources:
  - resource: /semantic/farmaenlace-identidad-y-priorizacion.md
project: farmaenlace
change_id: farmaenlace-qr-golden-record-20261008
workflow_state: done
complexity: low
next_step: >-
  Archivar el cambio documental; definir contratos y mecanismo de vinculación QR
  al avanzar al diseño técnico.
blockers: []
---
# Alcance

Cambio documental sobre la memoria existente. Sin implementación de servicios o integración real. El usuario define dos capacidades: motor de recomendación/alineación comercial/display POS; e identificación/trazabilidad/registro de resultados con alta por QR. Ambas alimentan ventas y el perfil de cliente o golden record.

# Plan y aceptación

1. Registrar las dos agrupaciones como organización funcional vigente, conservando las responsabilidades de SmartClub, PromoGo y Vendix.
2. Añadir el flujo cliente escanea QR → completa formulario → dependiente registra/confirma datos en Vendix → compra y resultado vinculados.
3. Explicar el ciclo perfil → recomendación → resultado → perfil, sin asumir que existe hoy un golden record ni definir una nueva base innecesaria.
4. Actualizar el diagrama y revisar consistencia; validar OKF y archivar.

# Validación

- [Memoria actualizada](/semantic/farmaenlace-identidad-y-priorizacion.md) con las dos capacidades, registro QR y propósito explícito de alimentar ventas y golden record.
- Self-review: el dependiente conserva el registro/confirmación en Vendix; beneficios/priorización/display se agrupan funcionalmente; resultados e identificación se agrupan con QR; la arquitectura actual no se presenta como si ya tuviera golden record o un conector QR.
- Diagrama actualizado con dos agrupaciones y el ciclo de enriquecimiento del perfil. La autoridad del perfil y el mecanismo de asociación formulario/venta quedan por definir.
- Se corrigió el entrecomillado de la descripción YAML detectado en la primera validación posterior a la edición.
- `npm --prefix harness run harness:index` y `npm --prefix harness run harness:validate`: correctos después de la corrección, sin advertencias.
- Sin pruebas de software: cambio exclusivamente documental.
