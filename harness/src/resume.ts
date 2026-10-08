import { concepts } from './fs.ts'
import type { Concept } from './types.ts'

export interface ResumeResult {
  found: boolean
  goal?: string
  currentStep?: string
  nextStep?: string
  blockers: string[]
}

export function resume(root: string): ResumeResult {
  const checkpoints = concepts(root).filter((item) => item.data.type === 'Session Checkpoint' && item.data.status !== 'deprecated' && item.data.workflow_state !== 'done')
  if (checkpoints.length === 0) return { found: false, blockers: [] }
  const timestamp = (item: Concept): number => {
    const generated = item.data.generated as { at?: unknown } | undefined
    const at = generated?.at
    const time = at instanceof Date ? at.getTime() : Date.parse(String(at ?? ''))
    return Number.isFinite(time) ? time : 0
  }
  const session = checkpoints.sort((a, b) => timestamp(b) - timestamp(a))[0]
  return {
    found: true,
    goal: typeof session.data.goal === 'string' ? session.data.goal : undefined,
    currentStep: typeof session.data.current_step === 'string' ? session.data.current_step : undefined,
    nextStep: typeof session.data.next_step === 'string' ? session.data.next_step : undefined,
    blockers: Array.isArray(session.data.blockers) ? session.data.blockers.filter((item): item is string => typeof item === 'string') : []
  }
}
