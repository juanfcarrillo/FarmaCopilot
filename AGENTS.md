# Workspace de desarrollo

El harness compartido vive en [`harness/AGENTS.md`](harness/AGENTS.md). Lee ese
archivo antes de trabajar en cualquiera de los proyectos de este workspace.

## Bootstrap automático de sesión

En la primera solicitud accionable de cada chat, realiza este bootstrap antes de
responder o modificar código:

1. Ejecuta `npm --prefix harness run harness -- resume` y `npm --prefix harness run harness:validate`.
2. Lee [el índice OKF](harness/knowledge/index.md),
   [el flujo de desarrollo](harness/knowledge/procedures/development-flow.md)
   y cualquier `Session Checkpoint` o `Work Item` activo.
3. Clasifica la complejidad. Para cambios `low`, `medium` y `high` sin Work Item
   activo para la solicitud, crea el Work Item y su checkpoint siguiendo
   [la guía de inicio](harness/.harness/guides/session-bootstrap.md).
4. Aplica el flujo correspondiente y continúa la tarea. No implementes cambios
   `high` sin specs completas y `human_gate_approved: true`.

No crees Work Items ni checkpoints para preguntas informativas o cambios
`trivial`. Si el proyecto no puede inferirse de la petición, pide una aclaración
breve antes de persistir estado. Las rutas de este archivo parten de la raíz del
workspace; los comandos de `harness/AGENTS.md` parten de `harness/`.
