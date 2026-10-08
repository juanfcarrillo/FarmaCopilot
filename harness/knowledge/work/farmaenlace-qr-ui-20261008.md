---
type: Work Item
title: Mejorar interfaz QR sin sidebar con revisión Impeccable
description: >-
  Simplificar la pantalla de caja y adaptar presentación a identidad visual
  pública de Farmaenlace.
status: deprecated
generated:
  by: agent
  at: '2026-10-08T18:44:00Z'
sources:
  - resource: /semantic/farmaenlace-identidad-y-priorizacion.md
project: farmaenlace
change_id: farmaenlace-qr-ui-20261008
workflow_state: done
complexity: low
next_step: >-
  Mejora publicada y verificada; revisión y evidencia disponibles en
  docs/ui-review.md.
blockers: []
---
Solicitud explícita: lanzar subagente, mejorar UI, quitar sidebar y revisar sistema visual Farmaenlace usando https://github.com/pbakaus/impeccable dentro del subagente. Alcance low: presentación, composición, accesibilidad y responsive; conservar flujo, APIs, identidad QR, no login, Vendix manual y Firebase configurado. No modificar secretos ni reglas cloud.

Criterios: sidebar eliminado del DOM; marca y jerarquía claras sin espacio lateral desperdiciado; acción generar QR y código Vendix accesibles en escritorio/móvil; sin overflow horizontal; estados y formulario siguen operativos. Revisar referencias públicas oficiales sin afirmar acceso a sistema interno de diseño inexistente. Aplicar instrucciones pertinentes de Impeccable y registrar hallazgos/fixes con fuentes. Validar visualmente, lint/types/build y pruebas funcionales existentes pertinentes sin añadir tests de implementación para cambios visuales reversibles. Commit/push de app solamente y verificar despliegue automático.

Avance: subagente qr_ui_impeccable leyó Impeccable v4.5 commit 778c8a7 y aplica distill/adapt/polish más audit técnico. Motor descargado temporalmente, sin dependencia de runtime ni instalación global. Detector inicial devuelve lista vacía, por lo que no sustituye inspección manual. Revisión pública de www.farmaenlace.com encontró marca azul/gris y curva lima, distinta del logo provisional cruz verde del MVP. Se reutiliza SVG oficial; Manrope/DM Sans son decisión del MVP, no tipografías corporativas certificadas. No hay acceso ni afirmación sobre sistema interno de diseño.

Primera implementación local: sidebar retirado del DOM, cabecera compacta, título operativo, acciones >=44px, tipografía y contraste reforzados, dos columnas desde tablet y código primero en móvil tras registro. Sin cambios de API ni estado; padre revisó diff, CSS y SVG sin scripts/handlers. QA visual y funcional del subagente en http://localhost:3000 con emulador demo; no interactuar con sesión real del usuario en pestaña producción.

Validación final subagente: lint, typecheck, build y 17 pruebas existentes (3 dominio, 9 integración, 5 E2E) correctos. Primer lanzamiento E2E falló por ejecutable Chromium ausente, resuelto usando binario existente sin cambiar configuración del repo. CUA 1440/805/390/320 px, sin overflow; flujo QR/registro/SSE/constancia manual y error de cédula comprobados con datos sintéticos. Detector final Impeccable sobre tres fuentes JSX devuelve []; informe con límites en apps/farmaenlace-qr/docs/ui-review.md. Capturas actuales JPG, referencias README actualizadas y PNG obsoletos retirados. Next/emulador del subagente detenidos, viewport restablecido.

Revisión independiente padre: DOM y screenshot local desktop, capturas móvil/cliente y diff de código aprobados. Sin cambios en lógica ni credenciales; diff --check correcto, next-env.d.ts sin diff final. Commit app-only bffbbca subido a origin/main. Vercel identificó nuevo despliegue farma-copilot-ac1agv4qx-juanfi444s-projects.vercel.app con SHA correspondiente, en BUILDING. Esperando resultado antes de cerrar.

Resultado final 2026-10-08T18:56:45Z: despliegue dpl_HzQrdwK5ebnL1eyAqKXX9jRU7i4L del commit bffbbca terminó Ready. Alias https://farma-copilot.vercel.app/pos comprobado en pestaña nueva para conservar la sesión existente del usuario. CUA confirmó logo cargado, sidebarCount 0 y scrollWidth 1280 == innerWidth 1280; screenshot de producción guardado en directorio autorizado de visualizaciones, sin DevTools ni datos de cliente. App sin cambios locales pendientes. Bootstrap/index/validate correctos. Se cerrará y archivará este Work Item; no pruebas adicionales tras las ya correctas.

Incidencia de infraestructura de preview: después de apagar Next, la pestaña localhost pasó a data URL de error y CUA bloqueó su navegación/cierre por política. No se eludió esa restricción; se creó pestaña HTTPS nueva en el mismo navegador para verificar producción. La pestaña temporal no se marcó para conservar. La pestaña publicada sí se marcó deliverable. Sin impacto en app ni despliegue.
