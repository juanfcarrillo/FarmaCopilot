import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, join, relative, resolve } from 'node:path'
import matter from 'gray-matter'
import type { Concept, Data } from './types.ts'

const RESERVED = new Set(['index.md', 'log.md'])

export function findRoot(start = process.cwd()): string {
  let current = resolve(start)
  while (current !== dirname(current)) {
    if (existsSync(join(current, 'knowledge', 'index.md'))) return current
    if (existsSync(join(current, 'harness', 'knowledge', 'index.md'))) return join(current, 'harness')
    current = dirname(current)
  }
  throw new Error('No se encontró un bundle knowledge/ OKF.')
}

export function knowledgeRoot(root: string): string {
  return join(root, 'knowledge')
}

export function markdownFiles(directory: string): string[] {
  const entries = readdirSync(directory, { withFileTypes: true })
  return entries.flatMap((entry) => {
    const path = join(directory, entry.name)
    if (entry.isDirectory()) return markdownFiles(path)
    return entry.isFile() && entry.name.endsWith('.md') ? [path] : []
  })
}

export function conceptFiles(root: string): string[] {
  return markdownFiles(knowledgeRoot(root)).filter((path) => !RESERVED.has(path.split('/').pop() ?? ''))
}

export function readConcept(root: string, path: string): Concept {
  const raw = readFileSync(path, 'utf8')
  // gray-matter's default cache shares mutable metadata between identical files.
  const parsed = matter(raw, {})
  return { path, relativePath: relative(knowledgeRoot(root), path), data: parsed.data as Data, body: parsed.content }
}

export function concepts(root: string): Concept[] {
  return conceptFiles(root).map((path) => readConcept(root, path))
}

export function writeConcept(concept: Concept): void {
  writeFileSync(concept.path, matter.stringify(concept.body.trimStart(), concept.data, {}), 'utf8')
}

export function ensureDirectory(path: string): void {
  mkdirSync(path, { recursive: true })
}

export function writeText(path: string, content: string): void {
  ensureDirectory(dirname(path))
  writeFileSync(path, content.endsWith('\n') ? content : `${content}\n`, 'utf8')
}

export function isReserved(path: string): boolean {
  return RESERVED.has(path.split('/').pop() ?? '')
}
