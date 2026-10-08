# Revisión de interfaz QR · 8 de octubre de 2026

Alcance: pantalla de caja y registro del cliente. La tarea es operativa: generar QR, recibir el código e ingresarlo manualmente en Vendix. No cambia autenticación, API, datos, reglas Firebase ni integración de ventas.

## Identidad visual y fuentes

Se inspeccionó el [sitio público oficial de Farmaenlace](https://www.farmaenlace.com/) en navegador. Su logotipo usa azul `#001689`, gris `#868686` y verde lima `#80bc00`; el SVG oficial se sirve ahora localmente desde `public/farmaenlace-logo.svg`, con dimensiones explícitas y texto alternativo. Fuente: [SVG oficial](https://www.farmaenlace.com/wp-content/themes/farmaenlace/images/logo-farmaenlace.svg).

La página pública usa Panton según su CSS calculado. El MVP conserva DM Sans y Manrope como decisión de implementación, con fuentes de sistema de respaldo; no se presentan como tipografía corporativa. No se obtuvo un manual interno, biblioteca de componentes ni design system de Vendix. Se adaptó la identidad pública observable, sin afirmar cumplimiento de un sistema interno no disponible. Los colores oscuros de estado y texto son derivados accesibles de esta implementación; el lima se reserva para acentos y no para texto pequeño sobre blanco.

## Aplicación de Impeccable

Se descargó el [repositorio solicitado](https://github.com/pbakaus/impeccable) a un directorio temporal, commit `778c8a7b71ccd5bfe3ca6ac68c15d9d872d0f87d`, y se leyó el `SKILL.md` real de `plugin/skills/impeccable` (v4.5.0), junto con `distill`, `adapt`, `polish`, `audit`, `mode-operate` y `craft-floor`.

Se aplicaron `distill` y `polish` a la implementación existente, y los criterios técnicos de `audit` y responsive de `adapt`. No se ejecutó el flujo formal `critique` de dos evaluadores ni se atribuyen sus puntuaciones a esta revisión.

El launcher `context --target src/app/pos/page.tsx` no pudo crear su caché predeterminada fuera del workspace. Se siguió su alternativa documentada: leer directamente el contexto existente y conservar el alcance aprobado. El motor se descargó únicamente a `/private/tmp/farma-impeccable-cache`; no se instalaron hooks globales ni dependencias de runtime. Se ejecutó `detect --json` sobre el POS inicial y, después de las correcciones, sobre POS, registro y componente de marca: ambas salidas fueron `[]`. El detector de fuentes no sustituye la observación visual ni una auditoría WCAG completa.

## Hallazgos corregidos

- **P1 · Presentación responsive:** sidebar fijo de 175–248 px y cabeceras repetidas restaban espacio a la tarea. Se eliminaron el sidebar del DOM y sus estilos, breadcrumbs, franja duplicada de pasos, hero y decoración. La cabecera contiene marca y contexto; QR y código comparten el área útil desde tablet.
- **P1 · Legibilidad y acciones:** textos frecuentes de 9–11 px y controles secundarios pequeños. Ahora el cuerpo operativo es de 14–15 px, ayudas de 12–13 px, inputs móviles de 16 px y acciones de al menos 44 px de altura; el checkbox conserva una etiqueta completa pulsable.
- **P1 · Contraste:** texto tenue sobre fondos claros. Los tokens principales comprobados sobre blanco tienen relaciones de 15.05:1 (título), 6.35:1 (cuerpo), 5.16:1 (muted) y 4.51:1 (código de espera); botón azul/blanco 14.23:1. Estados verde sobre claro 6.43:1 y aviso ámbar 6.51:1. No se afirma certificación de todos los estados, dispositivos o WCAG.
- **P2 · Jerarquía:** código repetido dentro de la confirmación QR y el panel de resultado. Se conserva una sola lectura principal del código en caja; en móvil pasa al primer bloque cuando llega el registro. Se mantiene el aviso de ingreso manual y la aclaración de que no confirma una venta desde Vendix.
- **P2 · Accesibilidad y consistencia:** se agregaron enlace para saltar al contenido, estado anunciado y código en región `aria-live`, `aria-invalid` y ayudas/errores asociados al campo de cédula. Se mantienen etiquetas, foco visible y reduced motion. La marca dibujada como cruz verde se reemplazó por el logotipo oficial; el formulario evita afirmar una garantía de seguridad en un badge.

La paleta se centraliza en tokens semánticos. No se añadió modo oscuro fuera del alcance, animación decorativa ni nuevas dependencias. El SVG local evita otra solicitud a la web corporativa; Google Fonts sigue siendo una dependencia de la presentación con fallback local. No se midieron Core Web Vitals en esta revisión.

## Evidencia y límites

Revisión CUA en Chromium con viewports emulados de 1440, 805, 390 y 320 px. POS y registro no generaron scroll horizontal en los tamaños comprobados (`scrollWidth == innerWidth`); el QR mide 228 px con marco a 320 px. En 805 px, QR y código se ven juntos; en 390 px, el resultado precede al QR una vez registrado. Se ejercitaron vacío, carga, QR activo, error de cédula, registro recibido y constancia manual contra Firestore Emulator. Las pruebas existentes cubren además vencimiento, cancelación, red, restauración y aislamiento de cajas.

Capturas con información sintética y emulador, nunca de la sesión del usuario:

- [Caja tablet, 805 px](preview/pos-desktop.jpg).
- [Caja móvil, 390 px](preview/pos-mobile.jpg).
- [Formulario móvil, 390 px](preview/registro-form-mobile.jpg).
- [Resultado cliente, 320 px](preview/registro-mobile.jpg).

Son capturas de desarrollo y pueden incluir el botón de Next DevTools. Se restableció el viewport al terminar. No se probaron hardware físico, Safari/iOS, lector de pantalla real ni gestos táctiles sintetizados; la evidencia acredita composición y controles estándar en Chromium.

Validación final: lint y typecheck correctos; build de producción correcto; 17 pruebas existentes correctas (3 dominio, 9 integración y 5 E2E). El primer intento E2E no lanzó navegador por faltar Chromium 1248; se usó el ejecutable ya instalado de Chromium 1234 mediante la variable de prueba existente. No se modificaron pruebas ni configuración. El diff pasó `git diff --check`; no quedaron estilos o DOM del sidebar, ni cambios de API/credenciales.
