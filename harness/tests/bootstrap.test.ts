import assert from 'node:assert/strict'
import { spawnSync } from 'node:child_process'
import { cpSync, existsSync, mkdirSync, mkdtempSync, readFileSync, readdirSync, rmSync, symlinkSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import test from 'node:test'
import matter from 'gray-matter'
import { findRoot, readConcept } from '../src/fs.ts'
import { WORKFLOW_STATES } from '../src/types.ts'
import { concept, fixture } from './helpers.ts'

const shippedRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..')

test('both AGENTS files resolve their local links and bootstrap commands', () => {
  const rootAgent = readFileSync(join(shippedRoot, '../AGENTS.md'), 'utf8')
  const harnessAgent = readFileSync(join(shippedRoot, 'AGENTS.md'), 'utf8')
  assert.match(rootAgent, /npm --prefix harness run harness -- resume/)
  assert.match(rootAgent, /npm --prefix harness run harness:validate/)
  assert.match(rootAgent, /harness\/AGENTS\.md/)
  assert.match(harnessAgent, /session-bootstrap\.md/)
  for (const [directory, text] of [[dirname(shippedRoot), rootAgent], [shippedRoot, harnessAgent]]) {
    for (const match of text.matchAll(/\[[^\]]+\]\(([^)]+)\)/g)) {
      assert.ok(existsSync(resolve(directory, match[1])), `Missing instruction target: ${match[1]}`)
    }
  }
  const guide = readFileSync(join(shippedRoot, '.harness/guides/session-bootstrap.md'), 'utf8')
  for (const state of ['pending', 'spec_ready', 'in_progress', 'done', 'blocked']) {
    assert.ok(guide.includes(`\`${state}\``))
    assert.ok(WORKFLOW_STATES.includes(state as never))
  }
  const examples = [...guide.matchAll(/```yaml\n([\s\S]*?)```/g)]
  assert.equal(examples.length, 2)
  assert.equal(matter(examples[0][1], {}).data.type, 'Work Item')
  assert.equal(matter(examples[1][1], {}).data.type, 'Session Checkpoint')
})

test('concept metadata stays independent between identical files and rereads', () => {
  const root = fixture()
  const path = join(root, 'knowledge/work/one.md')
  const other = join(root, 'knowledge/work/two.md')
  writeFileSync(path, concept('Session Checkpoint'))
  writeFileSync(other, concept('Session Checkpoint'))
  const first = readConcept(root, path)
  first.data.status = 'deprecated'
  assert.equal(readConcept(root, path).data.status, 'draft')
  assert.equal(readConcept(root, other).data.status, 'draft')
})

test('npm bootstrap, high gate, resume, indexing and archive work end to end', (t) => {
  const workspace = mkdtempSync(join(tmpdir(), 'harness-e2e-'))
  t.after(() => rmSync(workspace, { recursive: true, force: true }))
  const root = join(workspace, 'harness')
  mkdirSync(root)
  for (const name of ['src', 'package.json', 'AGENTS.md', 'knowledge', '.harness', 'openspec']) {
    cpSync(join(shippedRoot, name), join(root, name), { recursive: true })
  }
  cpSync(join(shippedRoot, '../AGENTS.md'), join(workspace, 'AGENTS.md'))
  symlinkSync(join(shippedRoot, 'node_modules'), join(root, 'node_modules'), 'dir')
  const nested = join(workspace, 'project/src')
  mkdirSync(nested, { recursive: true })
  assert.equal(findRoot(workspace), root)
  assert.equal(findRoot(root), root)
  assert.equal(findRoot(nested), root)

  const run = (args: string[], status = 0): string => {
    const result = spawnSync('npm', ['--prefix', 'harness', 'run', ...args], {
      cwd: workspace,
      encoding: 'utf8',
      timeout: 15000,
      env: { ...process.env, npm_config_cache: join(workspace, '.npm-cache') }
    })
    assert.ifError(result.error)
    const output = result.stdout + result.stderr
    assert.equal(result.status, status, output)
    return output
  }
  assert.match(run(['harness:validate']), /\[OK\]/)
  assert.match(run(['harness', '--', 'resume']), /No hay Session Checkpoint/)
  const workPath = join(root, 'knowledge/work/sample-change.md')
  const work = (state: string, approved: boolean) => writeFileSync(workPath, concept('Work Item',
    `project: fixture-project\nworkflow_state: ${state}\ncomplexity: high\nchange_id: sample-change\nhuman_gate_approved: ${approved}\nnext_step: continue\nblockers: []\n`))
  work('pending', false)
  writeFileSync(join(root, 'knowledge/work/session-sample-change.md'), concept('Session Checkpoint',
    'goal: Exercise full workflow\ncurrent_step: plan\nnext_step: implement\nblockers: []\nwork_item: /work/sample-change.md\n'))
  assert.match(run(['harness', '--', 'resume']), /Exercise full workflow/)
  work('spec_ready', false)
  assert.match(run(['harness:validate'], 1), /falta proposal\.md/)
  const change = join(root, 'openspec/changes/sample-change')
  mkdirSync(join(change, 'specs/domain'), { recursive: true })
  for (const name of ['proposal.md', 'design.md', 'tasks.md', 'specs/domain/spec.md']) {
    writeFileSync(join(change, name), '# Acceptance criteria\n')
  }
  run(['harness:validate'])
  work('in_progress', false)
  assert.match(run(['harness:validate'], 1), /human_gate_approved/)
  work('in_progress', true)
  run(['harness:validate'])
  assert.match(run(['harness:index']), /knowledge\/work\/index.md/)
  assert.match(readFileSync(join(root, 'knowledge/work/index.md'), 'utf8'), /sample-change.md/)
  work('done', true)
  run(['harness', '--', 'archive', 'sample-change'])
  run(['harness:validate'])
  assert.match(run(['harness', '--', 'resume']), /No hay Session Checkpoint/)
  assert.equal(existsSync(change), false)
  const archived = readdirSync(join(root, 'openspec/changes/archive')).filter((name) => name.endsWith('-sample-change'))
  assert.equal(archived.length, 1)
  assert.ok(existsSync(join(root, 'openspec/changes/archive', archived[0], 'specs/domain/spec.md')))
  const snapshots = readdirSync(join(root, 'knowledge/episodes/sessions'))
  assert.equal(snapshots.length, 2) // index.md and the archived checkpoint
  const snapshot = snapshots.find((name) => name !== 'index.md')!
  assert.equal(matter(readFileSync(join(root, 'knowledge/episodes/sessions', snapshot), 'utf8'), {}).data.goal, 'Exercise full workflow')
  assert.match(run(['harness', '--', 'archive', 'sample-change'], 1), /ya está archivado/)
  assert.match(run(['harness', '--', 'unknown'], 1), /Uso:/)
})
