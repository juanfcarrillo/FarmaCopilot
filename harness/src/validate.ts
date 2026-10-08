import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs'
import { join, resolve } from 'node:path'
import matter from 'gray-matter'
import { conceptFiles, knowledgeRoot, markdownFiles, readConcept } from './fs.ts'
import { COMPLEXITIES, LIFECYCLE_STATUSES, WORKFLOW_STATES, type Concept, type Finding } from './types.ts'

const requiredHighArtifacts = ['proposal.md', 'design.md', 'tasks.md']

function isString(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0
}

function isTimestamp(value: unknown): boolean {
  return isString(value) || value instanceof Date
}

function conceptFindings(concept: Concept): Finding[] {
  const findings: Finding[] = []
  if (!isString(concept.data.type)) findings.push({ level: 'fail', message: `${concept.relativePath}: falta type` })
  if ('status' in concept.data && !LIFECYCLE_STATUSES.includes(String(concept.data.status) as never)) {
    findings.push({ level: 'fail', message: `${concept.relativePath}: status inválido` })
  }
  for (const field of ['title', 'description', 'generated', 'sources']) {
    if (!(field in concept.data)) findings.push({ level: 'warn', message: `${concept.relativePath}: falta ${field}` })
  }
  if (concept.data.generated && (typeof concept.data.generated !== 'object' || !isString((concept.data.generated as Record<string, unknown>).by) || !isTimestamp((concept.data.generated as Record<string, unknown>).at))) {
    findings.push({ level: 'fail', message: `${concept.relativePath}: generated requiere by y at` })
  }
  if (concept.data.sources && (!Array.isArray(concept.data.sources) || concept.data.sources.some((source) => typeof source !== 'object' || !isString((source as Record<string, unknown>).resource)))) {
    findings.push({ level: 'fail', message: `${concept.relativePath}: cada source requiere resource` })
  }
  return findings
}

function reservedFindings(root: string): Finding[] {
  const bundle = knowledgeRoot(root)
  const findings: Finding[] = []
  if (!existsSync(join(bundle, 'index.md'))) findings.push({ level: 'fail', message: 'index.md: falta el índice raíz OKF' })
  for (const path of markdownFiles(bundle).filter((item) => /\/(index|log)\.md$/.test(item))) {
    const raw = readFileSync(path, 'utf8')
    const relativePath = path.slice(bundle.length + 1)
    let parsed: ReturnType<typeof matter>
    try { parsed = matter(raw, {}) }
    catch {
      findings.push({ level: 'fail', message: `${relativePath}: frontmatter YAML inválido` })
      continue
    }
    if (path.endsWith('index.md')) {
      const rootIndex = path === join(bundle, 'index.md')
      if (!rootIndex && Object.keys(parsed.data).length > 0) findings.push({ level: 'fail', message: `${relativePath}: index no puede tener frontmatter` })
      if (rootIndex && parsed.data.okf_version !== '0.2') findings.push({ level: 'fail', message: 'index.md: falta okf_version 0.2' })
    }
    if (path.endsWith('log.md')) {
      if (Object.keys(parsed.data).length > 0) findings.push({ level: 'fail', message: `${relativePath}: log no puede tener frontmatter` })
      if ([...parsed.content.matchAll(/^## (.+)$/gm)].some((match) => !/^\d{4}-\d{2}-\d{2}$/.test(match[1]))) {
        findings.push({ level: 'fail', message: `${relativePath}: fecha de log inválida` })
      }
    }
  }
  return findings
}

function workflowFindings(root: string, items: Concept[]): Finding[] {
  const findings: Finding[] = []
  const workItems = items.filter((item) => item.relativePath.startsWith('work/') && item.data.type === 'Work Item')
  const inProgress = workItems.filter((item) => item.data.workflow_state === 'in_progress')
  if (inProgress.length > 1) findings.push({ level: 'fail', message: 'hay más de un Work Item in_progress' })
  const changeIds = new Set<string>()
  for (const item of workItems) {
    if (!WORKFLOW_STATES.includes(String(item.data.workflow_state) as never)) findings.push({ level: 'fail', message: `${item.relativePath}: workflow_state inválido` })
    if (!COMPLEXITIES.includes(String(item.data.complexity) as never)) findings.push({ level: 'fail', message: `${item.relativePath}: complexity inválida` })
    for (const field of ['project', 'change_id', 'next_step']) if (!isString(item.data[field])) findings.push({ level: 'fail', message: `${item.relativePath}: falta ${field}` })
    for (const field of ['project', 'change_id']) {
      if (isString(item.data[field]) && !/^[a-zA-Z0-9][a-zA-Z0-9._-]*$/.test(String(item.data[field]))) {
        findings.push({ level: 'fail', message: `${item.relativePath}: ${field} debe ser un identificador sin rutas` })
      }
    }
    const changeId = String(item.data.change_id)
    if (changeIds.has(changeId)) findings.push({ level: 'fail', message: `${item.relativePath}: change_id duplicado ${changeId}` })
    changeIds.add(changeId)
    if (!Array.isArray(item.data.blockers)) findings.push({ level: 'fail', message: `${item.relativePath}: blockers debe ser lista` })
    if (item.data.complexity === 'high' && ['spec_ready', 'in_progress', 'done'].includes(String(item.data.workflow_state))) {
      const active = join(root, 'openspec', 'changes', changeId)
      const archived = join(root, 'openspec', 'changes', 'archive')
      const candidates = item.data.workflow_state === 'done' && existsSync(archived)
        ? readdirSync(archived, { withFileTypes: true }).filter((entry) => entry.isDirectory() && /^\d{4}-\d{2}-\d{2}-/.test(entry.name) && entry.name.slice(11) === changeId)
        : []
      if (candidates.length > 1) findings.push({ level: 'fail', message: `${item.relativePath}: hay múltiples archivos OpenSpec para ${changeId}` })
      const path = existsSync(active) ? active : candidates.length === 1 ? join(archived, candidates[0].name) : active
      for (const artifact of requiredHighArtifacts) {
        const artifactPath = join(path, artifact)
        if (!existsSync(artifactPath) || !statSync(artifactPath).isFile()) findings.push({ level: 'fail', message: `${item.relativePath}: falta ${artifact}` })
      }
      const specs = join(path, 'specs')
      if (!existsSync(specs) || !statSync(specs).isDirectory() || markdownFiles(specs).length === 0) {
        findings.push({ level: 'fail', message: `${item.relativePath}: faltan deltas de dominio en specs/` })
      }
      if (['in_progress', 'done'].includes(String(item.data.workflow_state)) && item.data.human_gate_approved !== true) {
        findings.push({ level: 'fail', message: `${item.relativePath}: high requiere human_gate_approved` })
      }
    }
  }
  return findings
}

function linkFindings(root: string, items: Concept[]): Finding[] {
  const bundle = knowledgeRoot(root)
  const findings: Finding[] = []
  for (const item of items) {
    for (const match of item.body.matchAll(/\[[^\]]+\]\(([^)]+)\)/g)) {
      const target = match[1]
      if (/^[a-z]+:/i.test(target) || target.startsWith('#')) continue
      const targetPath = target.startsWith('/') ? join(bundle, target) : resolve(item.path, '..', target)
      if (!existsSync(targetPath) && !existsSync(join(targetPath, 'index.md'))) {
        findings.push({ level: 'warn', message: `${item.relativePath}: enlace no resuelto ${target}` })
      }
    }
  }
  return findings
}

export function validate(root: string): Finding[] {
  const findings: Finding[] = []
  const files = conceptFiles(root)
  const items: Concept[] = []
  for (const path of files) {
    try {
      const concept = readConcept(root, path)
      items.push(concept)
      findings.push(...conceptFindings(concept))
    }
    catch { findings.push({ level: 'fail', message: `${path}: frontmatter YAML inválido` }) }
  }
  findings.push(...reservedFindings(root), ...workflowFindings(root, items), ...linkFindings(root, items))
  if (findings.length === 0) findings.push({ level: 'ok', message: 'bundle OKF y workflow válidos' })
  return findings
}
