---
type: Work Item
title: Concretar modelo de identificación y oferta en mostrador Farmaenlace
description: >-
  Incorporar la dirección del usuario inspirada en referentes farmacéuticos y
  verificar sus afirmaciones específicas.
status: deprecated
generated:
  by: agent
  at: '2026-10-08T17:09:22Z'
sources:
  - resource: /semantic/farmaenlace-identidad-y-priorizacion.md
project: farmaenlace
change_id: farmaenlace-modelo-mostrador-20261008
workflow_state: done
complexity: low
next_step: >-
  Archivar el cambio documental; validar contratos de identidad, candidatos y
  pantalla de Vendix cuando se avance al diseño técnico.
blockers: []
---
# Alcance y aceptación

Actualización documental de memoria, sin implementación de servicios. Conservar la intención del usuario: identificación sencilla en mostrador, beneficios vinculados, continuidad entre canales y una oferta prioritaria en pantalla de caja. Separar evidencia pública de referencias aportadas por el usuario todavía sin confirmar. Explicar cómo se conecta con Vendix, SmartClub, PromoGo y el repositorio; tratar logística desde tiendas como extensión posterior.

# Plan

1. Contrastar CPF, cobertura de identificación, ship-from-store, myWalgreens y Monedero en fuentes primarias.
2. Actualizar el mismo concepto de memoria, sin duplicar contexto ni alterar la arquitectura declarativa original.
3. Self-review de atribuciones, validar OKF y archivar.

# Validación

- [Memoria actualizada](/semantic/farmaenlace-identidad-y-priorizacion.md) con la dirección explícita del usuario y el flujo de identificación, beneficios y oferta principal en Vendix.
- Self-review: CPF y ship-from-store respaldados por fuentes oficiales; 93 % de ingresos en 2017 distinguido de porcentaje de tickets identificados; tokenización, NBA en pantallas Walgreens y recompra programada de Farmacias del Ahorro conservados como afirmaciones pendientes de corroboración.
- Logística desde tiendas separada como evolución opcional; precio final sujeto a PromoGo e integraciones marcadas como propuestas.
- `npm --prefix harness run harness:validate`: correcto, sin advertencias.
- Sin pruebas de software: cambio exclusivamente documental.
