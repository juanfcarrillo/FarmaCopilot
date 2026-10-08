# Inicio y cierre de sesión

Ejecuta los comandos desde `harness/`. Desde la raíz del workspace, usa
`npm --prefix harness run ...`. Instala las dependencias con `npm ci` si faltan.
Lee `knowledge/index.md` y los procedimientos antes de crear estado.

Los cambios `trivial` no necesitan persistencia. Para `low`, `medium` y `high`,
crea los siguientes conceptos si no existen. Reemplaza `<project>`, `<id>`,
`<timestamp>` y los textos de ejemplo; no escribas los marcadores literalmente.
`project` y `change_id` deben ser identificadores sin barras ni espacios.
El `change_id` debe ser único en todo el bundle, también entre trabajos cerrados.

`knowledge/work/<id>.md`:

```yaml
---
type: Work Item
title: Descripción del cambio
description: Resultado esperado.
status: draft
generated: { by: agent, at: "<timestamp>" }
sources: []
project: <project>
change_id: <id>
workflow_state: pending
complexity: low
next_step: Definir criterios de aceptación.
blockers: []
---
```

`knowledge/work/session-<id>.md`:

```yaml
---
type: Session Checkpoint
title: Sesión del cambio
description: Estado necesario para retomar el trabajo.
status: draft
generated: { by: agent, at: "<timestamp>" }
sources:
  - resource: /work/<id>.md
goal: Resultado esperado.
current_step: Revisar criterios de aceptación.
next_step: Implementar el cambio.
blockers: []
work_item: /work/<id>.md
---
```

Usa timestamps ISO 8601 y actualiza `generated.at` del checkpoint al guardar
avances. Ejecuta `npm run harness:index` después de añadir conceptos y
`npm run harness:validate` antes de implementar y cerrar.

- `low` y `medium`: `pending` → `in_progress` → `done`.
- `high`: `pending` → `spec_ready` → `in_progress` → `done`.
  Crea `proposal.md`, `design.md`, `tasks.md` y deltas Markdown bajo
  `openspec/changes/<id>/specs/` antes de `spec_ready`. Una persona debe aprobar
  explícitamente; registra `human_gate_approved: true` antes de implementar.
- Usa `blocked` cuando una dependencia externa impida avanzar; registra el
  impedimento y el siguiente paso en ambos conceptos.

Antes de `done`, verifica aceptación, revisión y pruebas según la complejidad.
Registra resultados y comandos de prueba en el cuerpo del Work Item; el CLI no
ejecuta ni certifica esas pruebas. Ejecuta `npm run harness -- archive <id>`:
valida el bundle, archiva OpenSpec, crea el episodio, desactiva todos los
checkpoints enlazados y regenera los índices. El archivo es inmutable: no reutilices
un `change_id` ni vuelvas a archivar un cambio ya cerrado.
