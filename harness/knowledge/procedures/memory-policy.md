---
type: Playbook
title: OKF memory policy
description: Rules for navigating, creating, validating, and promoting project memory.
tags: [harness, memory, okf]
status: draft
generated: { by: process:development-harness, at: 2026-10-08T14:08:26Z }
sources:
  - id: okf-spec
    resource: https://github.com/GoogleCloudPlatform/knowledge-catalog/blob/main/okf/SPEC.md
    title: Open Knowledge Format v0.2
---

# Navigation

Start from [the bundle index](/index.md), open the narrowest relevant directory
index, and follow concept links. Do not create retrieval rankings, vector stores,
TF-IDF indexes, graph sidecars, or usage-score files.

# Persistence

Work state is a `Work Item`; an active checkpoint is a `Session Checkpoint`; a
completed change is a `Development Episode`. All are OKF concepts. `index.md`
and `log.md` are the only reserved supporting files.

# Trust and governance

Generated content starts `draft` without `verified`. The agent may propose a
promotion, but only a human may add a verification event or promote a durable
procedure, decision, or semantic concept to `stable`.
