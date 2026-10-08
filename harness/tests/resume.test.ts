import assert from 'node:assert/strict'
import { writeFileSync } from 'node:fs'
import { join } from 'node:path'
import test from 'node:test'
import { fixture, concept } from './helpers.ts'
import { resume } from '../src/resume.ts'

test('resume reads the OKF Session Checkpoint', () => {
  const root = fixture()
  const checkpoint = 'goal: Develop safely\ncurrent_step: inspect\nnext_step: plan\nblockers: [sdk]\nwork_item: /work/sample-change.md\n'
  writeFileSync(join(root, 'knowledge/work/session.md'), concept('Session Checkpoint', checkpoint))
  assert.deepEqual(resume(root), {
    found: true,
    goal: 'Develop safely',
    currentStep: 'inspect',
    nextStep: 'plan',
    blockers: ['sdk']
  })
})

test('resume selects the newest checkpoint by generated.at', () => {
  const root = fixture()
  for (const [name, date, goal] of [
    ['a-old.md', '2000-01-01T00:00:00Z', 'Old goal'],
    ['z-new.md', '2000-01-02T00:00:00Z', 'New goal']
  ]) {
    const text = concept('Session Checkpoint', `goal: ${goal}\nblockers: []\n`)
      .replace('at: 2000-01-01T00:00:00Z', `at: ${date}`)
    writeFileSync(join(root, 'knowledge/work', name), text)
  }
  assert.equal(resume(root).goal, 'New goal')
})

test('resume ignores completed checkpoints even if not deprecated', () => {
  const root = fixture()
  writeFileSync(join(root, 'knowledge/work/session.md'), concept('Session Checkpoint',
    'workflow_state: done\ngoal: Completed\nblockers: []\n'))
  assert.deepEqual(resume(root), { found: false, blockers: [] })
})
