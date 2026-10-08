# Harness de desarrollo

Harness reutilizable con CLI, roles, guías SDD/TDD y estructura de conocimiento
OKF. No contiene memoria, sesiones ni especificaciones de un proyecto anterior.

## Uso

Desde esta carpeta:

```sh
npm ci
npm run harness:validate
npm run harness -- resume
npm run test:harness
npm run typecheck
```

`AGENTS.md` describe el flujo de trabajo. `.harness/` contiene configuración,
roles y guías. `knowledge/procedures/` conserva los procedimientos generales;
`knowledge/work/`, `knowledge/episodes/` y `knowledge/semantic/` empiezan vacíos.
`openspec/` ofrece la estructura para futuras especificaciones.

Tras añadir conceptos, regenera los índices con `npm run harness:index`.
Para archivar un Work Item terminado, usa `npm run harness -- archive <change-id>`.

La raíz del workspace tiene un `AGENTS.md` que delega en el del harness.
La [guía de inicio](.harness/guides/session-bootstrap.md) incluye los campos
necesarios para crear un Work Item y un checkpoint sin depender de otro proyecto.

El CLI valida OKF, estados, unicidad de cambios, una sola feature en progreso,
artefactos OpenSpec y aprobación humana de cambios `high`. También retoma sesiones
y archiva trabajo terminado sin sobrescribir episodios.
Los roles y `.harness/config.yml` son instrucciones para el agente: el CLI no
interpreta ese YAML, no lanza agentes ni ejecuta las pruebas del proyecto.
La revisión, el límite de líneas y la evidencia de pruebas se verifican siguiendo
las guías. El entorno verificado usa Node.js 24.7.0 y npm 11.5.1.
