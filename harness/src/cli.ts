#!/usr/bin/env tsx
import { archive } from './archive.ts'
import { findRoot } from './fs.ts'
import { syncIndexes } from './indexes.ts'
import { resume } from './resume.ts'
import { validate } from './validate.ts'

function printHelp(): void {
  console.log('Uso: npm run harness -- <validate|sync-index|resume|archive <change-id>>')
}

function printValidation(root: string): number {
  const findings = validate(root)
  for (const finding of findings) console.log(`[${finding.level.toUpperCase()}] ${finding.message}`)
  return findings.some((finding) => finding.level === 'fail') ? 1 : 0
}

function run(): number {
  const root = findRoot()
  const [command, argument] = process.argv.slice(2)
  if (command === 'validate') return printValidation(root)
  if (command === 'sync-index') {
    for (const path of syncIndexes(root)) console.log(`[OK] ${path}`)
    return 0
  }
  if (command === 'resume') {
    const session = resume(root)
    if (!session.found) console.log('[OK] No hay Session Checkpoint activo.')
    else console.log(JSON.stringify(session, null, 2))
    return 0
  }
  if (command === 'archive' && argument) {
    const result = archive(root, argument)
    console.log(`[OK] episodio: ${result.episode}`)
    if (result.archivePath) console.log(`[OK] OpenSpec: ${result.archivePath}`)
    return 0
  }
  printHelp()
  return 1
}

try { process.exitCode = run() } catch (error) {
  console.error(`[FAIL] ${(error as Error).message}`)
  process.exitCode = 1
}
