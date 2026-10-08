import { mkdtempSync, mkdirSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { after } from 'node:test'

export function fixture(): string {
  const root = mkdtempSync(join(tmpdir(), 'development-harness-'))
  after(() => rmSync(root, { recursive: true, force: true }))
  for (const directory of ['knowledge', 'knowledge/work', 'knowledge/episodes', 'openspec/changes/archive']) {
    mkdirSync(join(root, directory), { recursive: true })
  }
  writeFileSync(join(root, 'knowledge/index.md'), '---\nokf_version: "0.2"\n---\n\n# Knowledge\n', 'utf8')
  writeFileSync(join(root, 'knowledge/log.md'), '# Directory Update Log\n\n## 2000-01-01\n\n* **Initialization**: Fixture.\n', 'utf8')
  for (const directory of ['work', 'episodes']) {
    writeFileSync(join(root, 'knowledge', directory, 'index.md'), `# ${directory}\n`, 'utf8')
    writeFileSync(join(root, 'knowledge', directory, 'log.md'), '# Directory Update Log\n\n## 2000-01-01\n\n* **Initialization**: Fixture.\n', 'utf8')
  }
  return root
}

export function concept(type: string, extra = '', body = '# Context\n'): string {
  return `---\ntype: ${type}\ntitle: Fixture\ndescription: Fixture concept.\ntags: [fixture]\nstatus: draft\ngenerated: { by: process:test, at: 2000-01-01T00:00:00Z }\nsources:\n  - id: source\n    resource: fixture:test\n    title: Fixture\n${extra}---\n\n${body}`
}
