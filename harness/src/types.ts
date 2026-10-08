export type Data = Record<string, unknown>

export type FindingLevel = 'ok' | 'warn' | 'fail'

export interface Finding {
  level: FindingLevel
  message: string
}

export interface Concept {
  path: string
  relativePath: string
  data: Data
  body: string
}

export const WORKFLOW_STATES = ['pending', 'spec_ready', 'in_progress', 'blocked', 'done'] as const
export const COMPLEXITIES = ['trivial', 'low', 'medium', 'high'] as const
export const LIFECYCLE_STATUSES = ['draft', 'stable', 'deprecated'] as const

export type WorkflowState = typeof WORKFLOW_STATES[number]
export type Complexity = typeof COMPLEXITIES[number]
