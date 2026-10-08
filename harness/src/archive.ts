import { existsSync, renameSync } from 'node:fs'
import { join } from 'node:path'
import matter from 'gray-matter'
import { appendLog } from './log.ts'
import { concepts, ensureDirectory, knowledgeRoot, writeConcept, writeText } from './fs.ts'
import { syncIndexes } from './indexes.ts'
import type { Concept } from './types.ts'
import { validate } from './validate.ts'

function workItem(root: string, changeId: string): Concept | undefined {
  return concepts(root).find((item) => item.data.type === 'Work Item' && item.data.change_id === changeId)
}

function episodePath(root: string, project: string, changeId: string, date: string): string {
  return join(knowledgeRoot(root), 'episodes', `${date}-${project}-${changeId}.md`)
}

function archiveOpenSpec(root: string, changeId: string, date: string): string | undefined {
  const active = join(root, 'openspec', 'changes', changeId)
  if (!existsSync(active)) return undefined
  const destination = join(root, 'openspec', 'changes', 'archive', `${date}-${changeId}`)
  ensureDirectory(join(root, 'openspec', 'changes', 'archive'))
  renameSync(active, destination)
  return destination
}

function createEpisode(root: string, item: Concept, date: string, archivePath?: string): string {
  const changeId = String(item.data.change_id)
  const project = String(item.data.project)
  const path = episodePath(root, project, changeId, date)
  const data = {
    type: 'Development Episode',
    title: `Closed change: ${project}/${changeId}`,
    description: `Immutable record for ${project} work item ${changeId}.`,
    tags: ['episode', project, String(item.data.complexity ?? 'unknown')],
    status: 'draft',
    generated: { by: 'process:development-harness', at: new Date().toISOString() },
    sources: [{ id: 'work-item', resource: `/${item.relativePath}`, title: 'Closed Work Item' }],
    workflow_state: 'done',
    project,
    change_id: changeId,
    archive_path: archivePath ? archivePath.replace(root, '') : undefined
  }
  const body = `# Outcome\n\n${item.body.trim() || 'No implementation summary was recorded.'}\n\n# Next knowledge action\n\nReview any durable promotion separately with a human.`
  writeText(path, matter.stringify(body, Object.fromEntries(Object.entries(data).filter(([, value]) => value !== undefined)), {}))
  return path
}

function checkpointPath(root: string, session: Concept, date: string): string {
  return join(knowledgeRoot(root), 'episodes', 'sessions', `${date}-${session.relativePath.slice('work/'.length)}`)
}

function archiveCheckpoints(root: string, sessions: Concept[], date: string): void {
  for (const session of sessions) {
    const data = {
      ...session.data,
      status: 'deprecated',
      workflow_state: 'done',
      generated: { by: 'process:development-harness', at: new Date().toISOString() },
      sources: [{ id: 'original-session', resource: `/${session.relativePath}`, title: 'Original session checkpoint' }]
    }
    writeText(checkpointPath(root, session, date), matter.stringify(session.body.trim(), data, {}))
    session.data.status = 'deprecated'
    session.data.workflow_state = 'done'
    writeConcept(session)
  }
}

export function archive(root: string, changeId: string): { episode: string; archivePath?: string } {
  const item = workItem(root, changeId)
  if (!item) throw new Error(`No existe Work Item para ${changeId}.`)
  if (item.data.workflow_state !== 'done') throw new Error(`${changeId} debe tener workflow_state: done.`)
  if (item.data.status === 'deprecated') throw new Error(`${changeId} ya está archivado.`)
  const failures = validate(root).filter((finding) => finding.level === 'fail')
  if (failures.length > 0) throw new Error(`Falló la validación: ${failures.map((finding) => finding.message).join('; ')}`)
  const date = new Date().toISOString().slice(0, 10)
  const sessions = concepts(root).filter((session) => session.relativePath.startsWith('work/') && session.data.type === 'Session Checkpoint' && session.data.work_item === `/${item.relativePath}`)
  const destinations = [
    episodePath(root, String(item.data.project), changeId, date),
    ...sessions.map((session) => checkpointPath(root, session, date))
  ]
  if (existsSync(join(root, 'openspec', 'changes', changeId))) destinations.push(join(root, 'openspec', 'changes', 'archive', `${date}-${changeId}`))
  for (const destination of destinations) if (existsSync(destination)) throw new Error(`Ya existe un archivo inmutable: ${destination}`)
  const archivePath = archiveOpenSpec(root, changeId, date)
  const episode = createEpisode(root, item, date, archivePath)
  item.data.status = 'deprecated'
  writeConcept(item)
  archiveCheckpoints(root, sessions, date)
  const project = String(item.data.project)
  appendLog(join(knowledgeRoot(root), 'episodes', 'log.md'), date, 'Closure', `Recorded [${project}/${changeId}](${date}-${project}-${changeId}.md).`)
  appendLog(join(knowledgeRoot(root), 'log.md'), date, 'Closure', `Archived work item ${project}/${changeId}.`)
  syncIndexes(root)
  return { episode, archivePath }
}
