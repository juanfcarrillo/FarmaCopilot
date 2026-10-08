---
type: Development Episode
title: 'Closed change: farmaenlace/farmaenlace-firebase-cloud-20261008'
description: >-
  Immutable record for farmaenlace work item
  farmaenlace-firebase-cloud-20261008.
tags:
  - episode
  - farmaenlace
  - low
status: draft
generated:
  by: 'process:development-harness'
  at: '2026-10-08T18:40:43.443Z'
sources:
  - id: work-item
    resource: /work/farmaenlace-firebase-cloud-20261008.md
    title: Closed Work Item
workflow_state: done
project: farmaenlace
change_id: farmaenlace-firebase-cloud-20261008
---
# Outcome

El usuario indicó usar proyecto `farma-copilot-2026`, nombre «Farma Copilot», Realtime Database `https://farma-copilot-2026-default-rtdb.firebaseio.com`, ubicación declarada `us-central1`. Consola `https://console.firebase.google.com/project/farma-copilot-2026/overview`.

La implementación aprobada usa Firestore Admin. Realtime Database es otro producto y su URL no conecta el SDK Firestore. Se preguntó de forma asíncrona si conservar Firestore en el mismo proyecto (menos cambios) o adaptar a la RTDB existente. La adaptación se reclasificará high y tendrá specs completas si se elige. Este Work Item inicial solo cubre configuración y diagnóstico.

Verificación de acceso: Firebase CLI `projects:list --json`, tanto sandbox como con red habilitada, falla «Failed to authenticate». No ADC ni credenciales Admin en el entorno del proceso. No leer/imprimir/transferir tokens de CLI. ID y URL no son credenciales de servidor. No publicar reglas ni modificar bases cloud sin acceso verificado.

Plan: persistir proyecto y alias de CLI; actualizar ejemplos con el ID real conservando emulador demo para pruebas; documentar discrepancia de producto y configuración privada pendiente. No abrir datos personales ni habilitar acceso público para evitar credenciales.

Configuración concreta completada: `.firebaserc` con proyecto real por defecto y alias local demo; `.env.example` con ID real comentado y diferencia RTDB/Firestore explícita; README y `docs/firebase-project.md` con datos del proyecto, guía de credencial privada y estado sin conexión. Comprobación Node de JSON/aliases y scripts confirma que los emuladores/pruebas conservan `demo-farmaenlace`. No cambios en código de runtime ni necesidad de repetir las 17 pruebas del MVP. Revisión sin hallazgos de configuración. No marcar conexión cloud completada hasta verificar una operación con credencial válida.

Actualización: usuario confirmó Firestore creado en `us-central1` con escritura/borrado anónimos de prueba y reglas abiertas temporalmente hasta «jueves 15/10 a medianoche, hora de Ecuador» (declaración, fecha/regla publicada no verificadas). Envió firebaseConfig del SDK web; no equivale a credencial Firebase Admin. `firebase-config.js` no existe en este checkout y `firestore.rules` local sigue deny-all. No se sustituyeron reglas ni se cambiaron permisos cloud.

Se verificó mediante REST una lectura sin autenticación de documento aleatorio inexistente: 404/NOT_FOUND. Sin leer colecciones/PII ni escribir registros. No certifica acceso del backend Admin. Se mantiene Firestore y se descarta migración RTDB. El usuario respondió que configurará credenciales Admin en Vercel. Se preparó `.env.production.example` (valores privados vacíos, ID real) y whitelist en gitignore, y se actualizaron ejemplos/README/guía. No se modifica el emulador local ni se depende de reglas abiertas para el diseño.

Corrección de entrega a Vercel (low, dentro de esta configuración): el usuario reportó `Module not found: Can't resolve './globals.css'`. El archivo existía localmente, pero el commit `961df6e` solo incluía parte del MVP; también faltaban formulario, API y servicios. Se versionó la app completa, conservando secretos y artefactos locales ignorados. `npm run build` pasó tanto en el workspace como en un snapshot temporal compuesto exclusivamente por los 48 archivos del índice Git, sin `.env.local` ni `.next` previos. Revisión del índice y `git diff --cached --check` sin hallazgos. No fue necesario modificar el import CSS ni actualizar dependencias para este error. Commit `30437b7` subido a `origin/main` de `juanfcarrillo/FarmaCopilot`; despliegue automático pendiente de verificar. Vercel CLI confirma proyecto `farma-copilot`, root `apps/farmaenlace-qr`, Node 24.x y build Next.js. No se cerró la conexión cloud, pendiente de comprobar credenciales y flujo real.

Verificación posterior, 2026-10-08T18:26:24Z: Vercel terminó el despliegue `dpl_CV3WPcfPe8W4K5D28tcRgX4ir2No` del commit `30437b7` con estado Ready. Alias de producción `https://farma-copilot.vercel.app`. GET `/pos`, `/registro`, `/api/health` y CSS publicado respondieron HTTP 200. Health devuelve `configured: false`, `storage: firestore`, `vendix: not_connected`; ese indicador solo comprueba ID de proyecto y secreto HMAC >=32 caracteres, no certifica credenciales Admin. Faltan variables de producción antes de probar registro. No se escribieron perfiles ni se consultaron datos personales. Fallo de build resuelto en producción; conexión Firebase permanece pendiente. `harness:validate` correcto.

El usuario entregó un JSON de cuenta de servicio del proyecto para ayudar a completar todas las envs. Se verificaron tipo, proyecto, dominio de cuenta y validez PEM sin imprimir clave. Se retoma configuración low: subir secretos vía stdin a CLI autenticada de Vercel, sin persistirlos en Git ni OKF; conservar secreto HMAC si ya existe. Alcance Production del proyecto farma-copilot verificado por ID y root. El JSON permanece en Downloads bajo control del usuario. No requiere Auth ni cambios de arquitectura.

Resultado final 2026-10-08T18:40:12Z: Vercel Production tenía cero envs. Se configuraron FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY, CUSTOMER_KEY_SECRET y APP_BASE_URL mediante stdin de CLI autenticada. La carga por lote falló sin crear variables; las cargas individuales funcionaron. Clave PEM y HMAC con tipo sensitive; HMAC aleatorio de 64 caracteres, sin copias locales ni valores en logs/Git/OKF. No se configuró emulador. Se conservó el JSON original bajo control del usuario.

Redeploy `dpl_3K6KxvDRJJ8fBpANe5p9CiHoE1zo`, URL `farma-copilot-a42jzm326-juanfi444s-projects.vercel.app`, terminó Ready y mantiene alias `https://farma-copilot.vercel.app`. Admin SDK autenticó y leyó una ruta aleatoria inexistente, sin consultar clientes. App publicada: GET health 200 con configured true; POST creación QR 201; POST cancelación 200. Sesión y evento creados por esa prueba se eliminaron mediante Admin, verificando primero etiqueta QA-ENV, estado cancelado y ausencia de customerId. Solo quedan contadores efímeros normales de rate limit. Sin registros de clientes ni ventas.

Revisión low: proyecto, root, Production y cinco nombres correctos; ningún secreto en código ni prefijo público. No se modificaron archivos de runtime ni se requirieron nuevas pruebas unitarias; verificación operativa real satisfactoria. Reglas cloud no modificadas ni certificadas por esta tarea de envs; reglas locales siguen deny-all. Vendix continúa manual, sin API. Configuración y conectividad completadas; seguridad de reglas publicadas y flujo con perfiles no se afirman verificados por estos checks.

# Next knowledge action

Review any durable promotion separately with a human.
