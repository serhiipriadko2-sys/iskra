import { readFile, readdir, stat } from 'node:fs/promises'
import { resolve, relative, sep } from 'node:path'
import process from 'node:process'

const ROOT = resolve(import.meta.dirname, '..')
const registryPath = 'governance/registries/fractal-compatibility-v1.json'
const skillRegistryPath = 'docs/skills/registry-v1.json'
const sourceRoots = ['packages', 'runtime/src', 'runtime/iskraSpace', 'supabase/functions']
const rawIdentifier = /\bcalculate(?:HFD|DFA|FractalIndicators)\b/
const ignoredDirectories = new Set([
  '.git',
  'coverage',
  'dist',
  'node_modules',
  'reference',
  'test-results',
  'Versions',
])

async function readJson(relativePath) {
  return JSON.parse(await readFile(resolve(ROOT, relativePath), 'utf8'))
}

async function collectSourceFiles(relativeRoot) {
  const absoluteRoot = resolve(ROOT, relativeRoot)
  const result = []

  async function walk(directory) {
    for (const entry of await readdir(directory)) {
      if (ignoredDirectories.has(entry)) continue
      const absolutePath = resolve(directory, entry)
      const entryStat = await stat(absolutePath)
      if (entryStat.isDirectory()) {
        await walk(absolutePath)
      } else if (/\.(?:ts|tsx)$/.test(entry)) {
        result.push(relative(ROOT, absolutePath).split(sep).join('/'))
      }
    }
  }

  await walk(absoluteRoot)
  return result
}

function requireCondition(condition, message) {
  if (!condition) throw new Error(message)
}

function addDays(timestamp, days) {
  const date = new Date(timestamp)
  requireCondition(!Number.isNaN(date.valueOf()), `invalid timestamp: ${timestamp}`)
  date.setUTCDate(date.getUTCDate() + days)
  return date.toISOString()
}

const registry = await readJson(registryPath)
requireCondition(registry.adr_id === 'ADR-20260729-02', 'registry ADR mismatch')
requireCondition(registry.authorization_issue === 324, 'authorization issue mismatch')
requireCondition(registry.sunset_days === 30, 'sunset must remain exactly 30 days')

if (registry.status === 'pre_activation') {
  requireCondition(registry.activated_at === null, 'pre-activation activated_at must be null')
  requireCondition(
    registry.compatibility_sunset_at === null,
    'pre-activation compatibility_sunset_at must be null',
  )
  requireCondition(registry.activation_receipt === null, 'pre-activation receipt must be null')
} else if (registry.status === 'active') {
  requireCondition(typeof registry.activated_at === 'string', 'active registry needs activated_at')
  requireCondition(
    typeof registry.compatibility_sunset_at === 'string',
    'active registry needs compatibility_sunset_at',
  )
  const expectedSunset = addDays(registry.activated_at, registry.sunset_days)
  requireCondition(
    new Date(registry.compatibility_sunset_at).toISOString() === expectedSunset,
    'compatibility_sunset_at must equal activated_at + 30 calendar days',
  )
  requireCondition(
    typeof registry.activation_receipt === 'string',
    'active registry needs activation receipt path',
  )

  if (Date.now() >= new Date(registry.compatibility_sunset_at).valueOf()) {
    requireCondition(
      registry.compatibility_surfaces.length === 0,
      'compatibility surfaces remain after sunset',
    )
  }
} else {
  throw new Error(`unsupported compatibility status: ${registry.status}`)
}

const allowedRawFiles = new Set([
  ...registry.compatibility_surfaces,
  ...registry.compatibility_test_surfaces,
  'packages/math/src/index.ts',
  'runtime/src/index.ts',
])
const violations = []
for (const root of sourceRoots) {
  for (const file of await collectSourceFiles(root)) {
    const content = await readFile(resolve(ROOT, file), 'utf8')
    if (rawIdentifier.test(content) && !allowedRawFiles.has(file)) {
      violations.push(file)
    }
  }
}
requireCondition(
  violations.length === 0,
  `raw fractal API used outside compatibility boundary: ${violations.join(', ')}`,
)

const mathIndex = await readFile(resolve(ROOT, 'packages/math/src/index.ts'), 'utf8')
const runtimeIndex = await readFile(resolve(ROOT, 'runtime/src/index.ts'), 'utf8')
requireCondition(
  !mathIndex.includes("export * from './fractal.js'"),
  'math package root must not wildcard-export legacy fractal APIs',
)
requireCondition(
  !runtimeIndex.includes('  calculateHFD,') &&
    !runtimeIndex.includes('  calculateDFA,') &&
    !runtimeIndex.includes('  calculateFractalIndicators,'),
  'runtime root must not first-class export raw fractal APIs',
)
requireCondition(
  mathIndex.includes('fractalCompatibility'),
  'math root must expose a bounded compatibility namespace',
)
requireCondition(
  runtimeIndex.includes('fractalCompatibility'),
  'runtime root must expose a bounded compatibility namespace',
)

for (const consumer of registry.authority_path_consumers) {
  const content = await readFile(resolve(ROOT, consumer), 'utf8')
  if (consumer !== 'runtime/src/index.ts') {
    requireCondition(
      !/\bcalculate(?:HFD|DFA|FractalIndicators)\b/.test(content),
      `authority-path raw consumer remains: ${consumer}`,
    )
  }
  requireCondition(
    !/\?\s*1\.5\s*:|:\s*1\.5\b|\?\s*0\.5\s*:|:\s*0\.5\b/.test(content),
    `authority-path numeric stand-in remains: ${consumer}`,
  )
}

const documentationContracts = [
  {
    path: 'CLAUDE.md',
    required: ['calculateHFDMetric()', 'calculateDFAMetric()', 'compatibility-only'],
    forbidden: ['| Higuchi Fractal Dimension | `calculateHFD()`', '| Detrended Fluctuation Analysis | `calculateDFA()`'],
  },
  {
    path: 'docs/specs/SPEC-001_FRACTAL_METRICS.md',
    required: ['computed | unavailable | invalid | numerical_failure', 'implementation candidate'],
    forbidden: ['return 1.5', 'return 0.5'],
  },
  {
    path: 'system/fractal_monitoring.md',
    required: ['calculateHFDMetric()', 'calculateDFAMetric()', 'compatibility-only'],
    forbidden: ['function calculateHFD(timeSeries', 'function calculateDFA(timeSeries'],
  },
]
for (const contract of documentationContracts) {
  const content = await readFile(resolve(ROOT, contract.path), 'utf8')
  for (const required of contract.required) {
    requireCondition(content.includes(required), `documentation drift: ${contract.path} lacks ${required}`)
  }
  for (const forbidden of contract.forbidden) {
    requireCondition(!content.includes(forbidden), `documentation drift: ${contract.path} contains ${forbidden}`)
  }
}

const skillRegistry = await readJson(skillRegistryPath)
const byName = new Map(skillRegistry.skills.map((entry) => [entry.skill, entry]))
const metricRunner = byName.get('metric-runner')
const evaluator = byName.get('iskra-metrics-evaluator')
requireCondition(metricRunner?.status === 'ACTIVE', 'metric-runner status drift')
requireCondition(metricRunner?.readiness === 'TRANSITIONAL', 'metric-runner readiness drift')
requireCondition(evaluator?.status === 'ABSORB', 'iskra-metrics-evaluator status drift')
requireCondition(
  evaluator?.readiness === 'TRANSITION_ALIAS',
  'iskra-metrics-evaluator readiness drift',
)

console.log(
  JSON.stringify(
    {
      status: 'pass',
      adr_id: registry.adr_id,
      compatibility_status: registry.status,
      scanned_roots: sourceRoots,
      raw_allowlist_count: allowedRawFiles.size,
      transition_registry: {
        'metric-runner': `${metricRunner.status}/${metricRunner.readiness}`,
        'iskra-metrics-evaluator': `${evaluator.status}/${evaluator.readiness}`,
      },
      activation_claimed: false,
    },
    null,
    2,
  ),
)
