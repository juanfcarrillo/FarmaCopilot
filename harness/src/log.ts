import { existsSync, readFileSync } from 'node:fs'
import { writeText } from './fs.ts'

export function appendLog(path: string, date: string, action: string, detail: string): void {
  const entry = `* **${action}**: ${detail}`
  const current = existsSync(path) ? readFileSync(path, 'utf8') : '# Directory Update Log\n'
  const heading = `## ${date}`
  const content = current.includes(heading) ? current.replace(heading, `${heading}\n\n${entry}`) : `${current.trimEnd()}\n\n${heading}\n\n${entry}\n`
  writeText(path, content)
}
