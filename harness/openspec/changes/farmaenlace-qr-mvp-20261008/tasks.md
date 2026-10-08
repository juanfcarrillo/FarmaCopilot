# Tareas del alcance aprobado

- [x] Registrar aprobación explícita y revisión sin auth/login; actualizar specs y validar gate antes de código.
- [ ] Lanzar un subagente fork_turns all, sin overrides de modelo/esfuerzo; principal gestiona harness.
- [ ] Scaffold Next.js/TypeScript en apps/farmaenlace-qr/ y emuladores/config/scripts, sin Firebase Auth ni login.
- [ ] RED → GREEN → REFACTOR: dominio QR/capacidad de consola/estados/expiración/validación/código único/idempotencia.
- [ ] RED → GREEN → REFACTOR: perfiles únicos por documento, discrepancias no verificadas sin sobrescritura, persistencia Firestore transaccional y eventos.
- [ ] RED → GREEN → REFACTOR: API server-only, reglas deny-all, aislamiento entre consolas y protección de PII/rate-limit.
- [ ] Consola QR sin login, formulario móvil y resultado con código; SSE con Firestore y reconexión; constancia Vendix manual opcional.
- [ ] E2E dos contextos y dos cajas: registro → mismo código cliente/tendero sin refresh → constancia manual; expiración/reintentos/aislamiento.
- [ ] Build/typecheck/lint/tests, revisión UI y seguridad; principal revisa hallazgos y corrige.
- [ ] README, .env.example, Firebase/Vercel y contrato Vendix manual, URL local funcionando; despliegue cloud si hay acceso configurado.
- [ ] Actualizar memoria/checkpoint/evidencias y cerrar/archivar solo con alcance y validación completos.
