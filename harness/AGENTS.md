# Harness de desarrollo

El conocimiento durable compartido vive en el bundle OKF `knowledge/`. Antes de trabajar:

1. Desde esta carpeta ejecuta `npm run harness -- resume` y `npm run harness:validate`.
2. Lee `knowledge/index.md`, sigue solo los enlaces necesarios y lee `knowledge/procedures/development-flow.md`.
3. Lee el `Work Item` activo, si existe, y confirma su campo `project`. Para un cambio `high`, no escribas código sin que esté en `spec_ready` y tenga `human_gate_approved: true`.
4. Usa `npm run harness:validate` antes de cerrar un cambio y `npm run harness -- archive <change-id>` al archivarlo.

Cuando la complejidad requiera persistencia y no exista un Work Item para la
solicitud, créalo con `project`, un `change_id` único y un Session Checkpoint OKF.
Usa [la guía de inicio](.harness/guides/session-bootstrap.md) para los campos y
transiciones. Los cambios `trivial` y las preguntas no crean estado persistente.
No esperes que la persona replique ese contexto en el prompt.

## Límites

- `knowledge/` es la fuente de memoria. No crees índices laterales, vectores, rankings ni archivos de memoria fuera de OKF.
- Los agentes solo proponen promociones a procedimientos, decisiones o conceptos verificados; una persona las aprueba.
- Una sola feature puede tener `workflow_state: in_progress` en todo el workspace compartido.
- Cada Work Item debe declarar el proyecto que modifica. El harness no decide la arquitectura de ningún proyecto.
- Los roles de `.harness/agents/` y `config.yml` guían al agente; no son un motor de ejecución automática ni lanzan subagentes.

## Mapa

- `.harness/`: roles y guías de ejecución.
- `knowledge/`: procedimientos, conocimiento semántico, work items y episodios OKF.
- `openspec/`: especificaciones de cambios de alta complejidad.
- `src/`: CLI del harness.
- `tests/`: pruebas del harness.
