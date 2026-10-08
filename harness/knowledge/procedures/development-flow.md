---
type: Playbook
title: Development flow
description: Complexity-driven workflow for development changes.
tags: [harness, sdd, tdd, workflow]
status: draft
generated: { by: process:development-harness, at: 2026-10-08T14:08:26Z }
sources:
  - id: local-guidance
    resource: ../../.harness/guides/complexity-routing.md
    title: Local routing guide
---

# Classification

Classify each request as `trivial`, `low`, `medium`, or `high` by scope,
abstraction, risk, and ambiguity. When the complexity requires persistence,
record the result in its [Work Item](/work/) and declare the target `project`.

# Flow

`trivial` changes build directly. `low` changes receive self-review. `medium`
changes require a written plan, strict TDD, and review. `high` changes require
an OpenSpec proposal, design, tasks, a human gate at `spec_ready`, strict TDD,
and review.

# Work Item metadata

Every Work Item declares `project`, a workspace-unique `change_id`,
`workflow_state`, `complexity`, `next_step`, and `blockers`. The shared harness
validates these fields before work is closed or archived.

# Session bootstrap

On the first actionable request in a chat, follow `AGENTS.md`: run resume and
validation, read the relevant indexes, and create the Work Item plus Session
Checkpoint when none exists and the complexity requires persistence.
Informational questions do not create workflow state. The person only needs to
state the desired outcome.

# Closure

Close only after validation. Archive the change and create an [episode](/episodes/)
through the harness CLI. Durable knowledge promotions require human approval.
