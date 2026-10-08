import assert from 'node:assert/strict'
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import test from 'node:test'
import { fixture, concept } from './helpers.ts'
import { archive } from '../src/archive.ts'
import { resume } from '../src/resume.ts'

test('archive records an OKF episode and moves an OpenSpec change', () => {
  const root = fixture()
  const work = 'project: fixture-project\nworkflow_state: done\ncomplexity: low\nchange_id: sample-change\nnext_step: archived\nblockers: []\n'
  writeFileSync(join(root, 'knowledge/work/sample-change.md'), concept('Work Item', work, '# Outcome\n\nCompleted.\n'))
  const change = join(root, 'openspec/changes/sample-change')
  mkdirSync(change, { recursive: true })
  writeFileSync(join(change, 'proposal.md'), '# Proposal\n')
  const result = archive(root, 'sample-change')
  assert.ok(existsSync(result.episode))
  assert.ok(existsSync(result.archivePath ?? ''))
  assert.ok(existsSync(join(root, 'knowledge/episodes/log.md')))
})

test('archive does not leave its historical checkpoint resumable', () => {
  const root = fixture()
  const work = 'project: fixture-project\nworkflow_state: done\ncomplexity: low\nchange_id: sample-change\nnext_step: archived\nblockers: []\n'
  const checkpoint = 'goal: Archive safely\ncurrent_step: close\nnext_step: archive\nblockers: []\nwork_item: /work/sample-change.md\n'
  writeFileSync(join(root, 'knowledge/work/sample-change.md'), concept('Work Item', work))
  writeFileSync(join(root, 'knowledge/work/session.md'), concept('Session Checkpoint', checkpoint))

  archive(root, 'sample-change')

  assert.deepEqual(resume(root), { found: false, blockers: [] })
})

test('archive refuses a high change without approval before writing anything', () => {
  const root = fixture()
  writeFileSync(join(root, 'knowledge/work/sample-change.md'), concept('Work Item',
    'project: fixture-project\nworkflow_state: done\ncomplexity: high\nchange_id: sample-change\nnext_step: archive\nblockers: []\n'))
  const change = join(root, 'openspec/changes/sample-change')
  mkdirSync(change, { recursive: true })
  const before = readFileSync(join(root, 'knowledge/work/sample-change.md'), 'utf8')
  assert.throws(() => archive(root, 'sample-change'), /validaci[oó]n|human_gate_approved/i)
  assert.ok(existsSync(change))
  assert.equal(readFileSync(join(root, 'knowledge/work/sample-change.md'), 'utf8'), before)
})

test('archive deprecates all checkpoints linked to the actual Work Item path', () => {
  const root = fixture()
  writeFileSync(join(root, 'knowledge/work/custom-name.md'), concept('Work Item',
    'project: fixture-project\nworkflow_state: done\ncomplexity: low\nchange_id: sample-change\nnext_step: archive\nblockers: []\n'))
  for (const name of ['session-one', 'session-two']) {
    writeFileSync(join(root, `knowledge/work/${name}.md`), concept('Session Checkpoint',
      'goal: Finish\nblockers: []\nwork_item: /work/custom-name.md\n'))
  }
  archive(root, 'sample-change')
  assert.deepEqual(resume(root), { found: false, blockers: [] })
})

test('archive refuses to overwrite an existing immutable episode', () => {
  const root = fixture()
  writeFileSync(join(root, 'knowledge/work/sample-change.md'), concept('Work Item',
    'project: fixture-project\nworkflow_state: done\ncomplexity: low\nchange_id: sample-change\nnext_step: archive\nblockers: []\n'))
  const result = archive(root, 'sample-change')
  const original = readFileSync(result.episode, 'utf8')
  assert.throws(() => archive(root, 'sample-change'), /archivad|existe/i)
  assert.equal(readFileSync(result.episode, 'utf8'), original)
})
