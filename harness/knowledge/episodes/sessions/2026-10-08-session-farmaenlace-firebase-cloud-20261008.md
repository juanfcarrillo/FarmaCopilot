---
type: Session Checkpoint
title: Sesión de conexión Firebase Farma Copilot
description: >-
  Firestore confirmado en Farma Copilot y configuración Admin pendiente en
  Vercel por el usuario.
status: deprecated
generated:
  by: 'process:development-harness'
  at: '2026-10-08T18:40:43.446Z'
sources:
  - id: original-session
    resource: /work/session-farmaenlace-firebase-cloud-20261008.md
    title: Original session checkpoint
goal: Usar el proyecto farma-copilot-2026 para el MVP QR.
current_step: >-
  Cinco envs de Production listas, redeploy Ready, health true y QR
  creado/cancelado con Firestore real.
next_step: >-
  Archivar configuración completada; no cambiar secreto HMAC ni publicar
  credenciales.
blockers: []
work_item: /work/farmaenlace-firebase-cloud-20261008.md
workflow_state: done
---
El usuario entregó el ID real y URL RTDB, no credenciales. Mantener el MVP sin login de clientes/tendero; la credencial de servidor es independiente de esa condición. Firebase CLI sin sesión válida; ADC ausente. No hay acceso cloud comprobado. Vercel sigue despliegue automático desde repo actual.

Ahora confirmó Firestore operativo en us-central1 y envió configuración pública web. REST a documento aleatorio inexistente respondió 404/NOT_FOUND sin consultar datos reales. Usuario eligió cargar credenciales Admin en Vercel. Plantilla `.env.production.example` lista con FIREBASE_PROJECT_ID real y email/privateKey/HMAC/origen vacíos; no guardar secretos en el chat. Reglas cloud abiertas reportadas; reglas locales deny-all. No declarar backend conectado ni desplegar reglas sin acceso/validación.

El fallo de build `globals.css` se debía a archivos locales sin versionar. Se incluyó la app completa en `30437b7` y se subió a main. Build desde snapshot de los 48 archivos del índice Git pasó sin depender de archivos locales ignorados. Vercel CLI autenticado: proyecto `farma-copilot`, root correcto `apps/farmaenlace-qr`. Falta confirmar estado del nuevo despliegue y configuración Firebase real.

Resultado: despliegue Ready y alias https://farma-copilot.vercel.app; /pos, /registro y CSS HTTP 200. /api/health HTTP 200 pero configured false (validación parcial de FIREBASE_PROJECT_ID y CUSTOMER_KEY_SECRET). Build reparado; completar env privados de Production y redesplegar antes de probar flujo. Sin escrituras cloud ni lecturas de datos personales. Harness validado.

Usuario entregó cuenta de servicio y pidió ayuda con todas las envs. Validado JSON/PEM sin imprimir secretos. Configuradas en Vercel Production FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY, CUSTOMER_KEY_SECRET y APP_BASE_URL. Clave y HMAC como sensitive; secreto generado aleatoriamente, sin guardar valores en workspace/Git/OKF. No había variables previas, no existe FIRESTORE_EMULATOR_HOST. Redeploy en proceso: farma-copilot-a42jzm326-juanfi444s-projects.vercel.app.

Completado: redeploy a42jzm326 Ready. Health configured true. Conexión Admin Firestore comprobada sin datos personales. Generación QR desde producción HTTP 201 y cancelación HTTP 200; sesión/evento sintéticos eliminados. No hay cambios de runtime ni secretos en Git. Solo Production configurado; no se modificaron reglas cloud ni se verificaron perfiles reales. Vendix continúa sin API.
