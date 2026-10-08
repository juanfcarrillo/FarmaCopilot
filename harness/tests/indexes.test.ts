import assert from 'node:assert/strict'
import { readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import test from 'node:test'
import { fixture, concept } from './helpers.ts'
import { syncIndexes } from '../src/indexes.ts'

test('syncIndexes creates progressive-disclosure indexes without sidecars', () => {
  const root = fixture()
  writeFileSync(join(root, 'knowledge', 'project.md'), concept('Architecture'))
  const written = syncIndexes(root)
  assert.ok(written.includes('knowledge/index.md'))
  assert.match(readFileSync(join(root, 'knowledge/index.md'), 'utf8'), /\[Fixture\]\(project\.md\)/)
  assert.doesNotMatch(written.join('\n'), /graph|tfidf|index\.json/i)
})
