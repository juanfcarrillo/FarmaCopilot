import assert from 'node:assert/strict'
import { mkdirSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import test from 'node:test'
import { fixture, concept } from './helpers.ts'
import { validate } from '../src/validate.ts'

test('validate accepts a conformant OKF concept', () => {
  const root = fixture()
  writeFileSync(join(root, 'knowledge', 'project.md'), concept('Architecture'))
  const findings = validate(root)
  assert.equal(findings.some((finding) => finding.level === 'fail'), false)
})

test('validate rejects a concept without a type', () => {
  const root = fixture()
  writeFileSync(join(root, 'knowledge', 'broken.md'), '---\ntitle: Broken\n---\n')
  const findings = validate(root)
  assert.ok(findings.some((finding) => finding.message.includes('falta type')))
})

test('validate reports malformed YAML without aborting the remaining checks', () => {
  const root = fixture()
  writeFileSync(join(root, 'knowledge', 'broken.md'), '---\ntitle: [\n---\n')
  const findings = validate(root)
  assert.ok(findings.some((finding) => finding.message.includes('frontmatter YAML inválido')))
})

test('validate enforces a single active Work Item and the high gate', () => {
  const root = fixture()
  const work = 'project: fixture-project\nworkflow_state: in_progress\ncomplexity: high\nchange_id: sample-change\nnext_step: implement\nblockers: []\n'
  writeFileSync(join(root, 'knowledge/work/one.md'), concept('Work Item', work))
  writeFileSync(join(root, 'knowledge/work/two.md'), concept('Work Item', work.replace('sample-change', 'sample-change-two')))
  const findings = validate(root)
  assert.ok(findings.some((finding) => finding.message.includes('más de un Work Item')))
  assert.ok(findings.some((finding) => finding.message.includes('human_gate_approved')))
})

test('validate rejects a high change whose OpenSpec directory is missing', () => {
  const root = fixture()
  writeFileSync(join(root, 'knowledge/work/sample-change.md'), concept('Work Item',
    'project: fixture-project\nworkflow_state: spec_ready\ncomplexity: high\nchange_id: sample-change\nnext_step: approval\nblockers: []\n'))
  assert.ok(validate(root).some((finding) => finding.level === 'fail' && finding.message.includes('proposal.md')))
})

test('validate checks archived artifacts of completed high changes', () => {
  const root = fixture()
  writeFileSync(join(root, 'knowledge/work/sample-change.md'), concept('Work Item',
    'project: fixture-project\nworkflow_state: done\ncomplexity: high\nchange_id: sample-change\nhuman_gate_approved: true\nnext_step: archived\nblockers: []\n'))
  const archived = join(root, 'openspec/changes/archive/2000-01-01-sample-change')
  mkdirSync(archived, { recursive: true })
  writeFileSync(join(archived, 'proposal.md'), '# Proposal\n')
  assert.ok(validate(root).some((finding) => finding.level === 'fail' && finding.message.includes('design.md')))
  for (const name of ['design.md', 'tasks.md']) writeFileSync(join(archived, name), '# Artifact\n')
  mkdirSync(join(archived, 'specs/domain'), { recursive: true })
  writeFileSync(join(archived, 'specs/domain/spec.md'), '# Domain\n')
  assert.equal(validate(root).some((finding) => finding.level === 'fail'), false)
})

test('validate rejects active high changes backed only by an archive', () => {
  const root = fixture()
  writeFileSync(join(root, 'knowledge/work/sample-change.md'), concept('Work Item',
    'project: fixture-project\nworkflow_state: in_progress\ncomplexity: high\nchange_id: sample-change\nhuman_gate_approved: true\nnext_step: implement\nblockers: []\n'))
  const archived = join(root, 'openspec/changes/archive/2000-01-01-sample-change')
  mkdirSync(archived, { recursive: true })
  for (const name of ['proposal.md', 'design.md', 'tasks.md']) writeFileSync(join(archived, name), '# Artifact\n')
  assert.ok(validate(root).some((finding) => finding.level === 'fail'))
})

test('validate reports malformed reserved YAML as a finding', () => {
  const root = fixture()
  writeFileSync(join(root, 'knowledge/index.md'), '---\nokf_version: [\n---\n')
  assert.ok(validate(root).some((finding) => finding.level === 'fail' && finding.message.includes('YAML')))
})
