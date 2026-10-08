# Entrega y despliegue

DEP-1: Next.js/React/TypeScript en apps/farmaenlace-qr, UI española móvil/escritorio, API Node en Vercel.
DEP-2: Firestore Admin exclusivamente servidor; sin Firebase Auth, Cloud Functions o Edge obligatorios.
DEP-3: Firebase Emulator Suite reproducible, rules deny-all, .env.example sin secretos, estado sin configurar explícito.
DEP-4: README ejecución/tests/Firebase/Vercel, configuración de secretos segura y contrato de ingreso manual a Vendix.
DEP-5: build/types/lint/tests verdes y E2E dos contextos con datos sintéticos. Configurar cloud solo con acceso efectivo; no afirmar despliegue sin URL verificada.
DEP-6: Según indicación posterior del usuario, Vercel despliega automáticamente desde su repositorio actual. Firebase será proporcionado después; en esta fase entregar configuración y validación local sin crear proyectos o publicar manualmente.

Escenarios: levantar emulador/app y completar flujo; no requiere crear cuentas; refresh conserva el registro; ausencia de Firebase no finge persistencia cloud; Vendix se declara manual/not_connected.
