import { readdirSync } from 'node:fs'
import { join, relative } from 'node:path'
import { concepts, knowledgeRoot, writeText } from './fs.ts'

function titleFor(path: string): string {
  return path.split('/').pop()?.replace(/[-_]/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()) ?? 'Knowledge'
}

function renderDirectory(root: string, directory: string): string {
  const bundle = knowledgeRoot(root)
  const children = readdirSync(directory, { withFileTypes: true })
  const ownConcepts = concepts(root).filter((item) => join(bundle, item.relativePath).startsWith(`${directory}/`) && item.relativePath.split('/').length === relative(bundle, directory).split('/').filter(Boolean).length + 1)
  const lines = [`# ${titleFor(relative(bundle, directory) || 'Harness Knowledge Bundle')}`, '']
  for (const item of ownConcepts.sort((a, b) => a.relativePath.localeCompare(b.relativePath))) {
    const description = typeof item.data.description === 'string' ? item.data.description : 'Knowledge concept.'
    lines.push(`* [${String(item.data.title ?? titleFor(item.relativePath))}](${item.relativePath.split('/').pop()}) - ${description}`)
  }
  for (const child of children.filter((entry) => entry.isDirectory()).sort((a, b) => a.name.localeCompare(b.name))) {
    lines.push(`* [${titleFor(child.name)}](${child.name}/) - Knowledge directory.`)
  }
  if (lines.length === 2) lines.push('No concepts have been recorded yet.')
  return `${lines.join('\n')}\n`
}

function directories(directory: string): string[] {
  return [directory, ...readdirSync(directory, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .flatMap((entry) => directories(join(directory, entry.name)))]
}

export function syncIndexes(root: string): string[] {
  const bundle = knowledgeRoot(root)
  const written: string[] = []
  for (const directory of directories(bundle)) {
    const indexPath = join(directory, 'index.md')
    const body = renderDirectory(root, directory)
    const content = directory === bundle ? `---\nokf_version: "0.2"\n---\n\n${body}` : body
    writeText(indexPath, content)
    written.push(relative(root, indexPath))
  }
  return written
}
