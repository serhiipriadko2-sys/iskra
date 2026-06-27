import { execSync } from 'node:child_process';
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { dirname, join, basename } from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const repoRoot = join(__filename, '..', '..', '..', '..');
const outPath = join(__filename, '..', '..', 'src', 'data', 'canon-index.json');
const catalogPath = join(__filename, '..', '..', 'src', 'data', 'canonCatalog.json');

const SENSITIVE_PATTERNS = [
  /(^|\/)\.env/i,
  /(^|\/)\.env\./i,
  /\.key$/i,
  /\.pem$/i,
  /\.p12$/i,
  /\.pfx$/i,
  /secret/i,
  /password/i,
  /token/i,
  /private/i,
  /\.npmrc$/i,
];

const LAYER_RULES = [
  { prefix: 'core/', layer: 'canon' },
  { prefix: 'system/', layer: 'system' },
  { prefix: 'packages/core/', layer: 'engine-core' },
  { prefix: 'packages/engine/', layer: 'engine' },
  { prefix: 'packages/math/', layer: 'math' },
  { prefix: 'apps/iskra-site/', layer: 'site' },
  { prefix: 'apps/iskra-web/', layer: 'web' },
  { prefix: 'runtime/', layer: 'runtime' },
  { prefix: 'governance/', layer: 'governance' },
  { prefix: 'ledger/', layer: 'ledger' },
  { prefix: 'metrics/', layer: 'metrics' },
  { prefix: 'mind/', layer: 'mind' },
  { prefix: 'docs/', layer: 'docs' },
  { prefix: 'tools/', layer: 'tools' },
  { prefix: 'supabase/', layer: 'backend' },
  { prefix: 'dist/agent-builder/', layer: 'builder' },
  { prefix: 'reference/', layer: 'reference' },
  { prefix: 'ingest/', layer: 'ingest' },
  { prefix: 'appendix/', layer: 'appendix' },
  { prefix: 'ScienceAndTests/', layer: 'research' },
  { prefix: 'skills/', layer: 'skills' },
  { prefix: '.github/', layer: 'ci' },
  { prefix: '.devcontainer/', layer: 'devcontainer' },
  { prefix: '.agents/', layer: 'agents' },
  { prefix: '.gitignore', layer: 'root' },
];

function detectLayer(path) {
  for (const rule of LAYER_RULES) {
    if (path === rule.prefix || path.startsWith(rule.prefix)) return rule.layer;
  }
  return 'root';
}

function detectRole(path, kind) {
  if (kind === 'directory') return 'container';
  const ext = path.split('.').pop()?.toLowerCase();
  switch (ext) {
    case 'md':
      return 'documentation';
    case 'ts':
    case 'tsx':
    case 'js':
    case 'jsx':
    case 'mjs':
      return 'code';
    case 'json':
      return 'config';
    case 'yaml':
    case 'yml':
      return 'config';
    case 'css':
    case 'scss':
      return 'style';
    case 'py':
      return 'script';
    case 'sh':
      return 'script';
    case 'txt':
      return 'text';
    case 'html':
      return 'markup';
    case 'png':
    case 'jpg':
    case 'jpeg':
    case 'svg':
    case 'webp':
    case 'ico':
    case 'gif':
      return 'asset';
    default:
      return 'data';
  }
}

function isSensitive(path) {
  return SENSITIVE_PATTERNS.some((p) => p.test(path));
}

function loadCatalog() {
  if (!existsSync(catalogPath)) return {};
  try {
    return JSON.parse(readFileSync(catalogPath, 'utf-8'));
  } catch {
    return {};
  }
}

function main() {
  const isCheck = process.argv.includes('--check');
  const raw = execSync('git -c core.quotePath=0 ls-files', { cwd: repoRoot, encoding: 'utf-8' });
  const trackedPaths = raw
    .split('\n')
    .map((p) => p.trim())
    .filter(Boolean)
    .filter((p) => !isSensitive(p));

  const catalog = loadCatalog();
  const catalogByPath = new Map();
  for (const entry of catalog.entries || []) {
    catalogByPath.set(entry.path, entry);
  }

  /** @type {Map<string, import('../src/types.ts').RepoIndexNode>} */
  const nodeMap = new Map();

  for (const path of trackedPaths) {
    const catalogEntry = catalogByPath.get(path);
    const node = {
      path,
      name: basename(path),
      kind: 'file',
      layer: detectLayer(path),
      role: detectRole(path, 'file'),
      coverage: catalogEntry ? 'curated' : 'indexed',
      sourceRef: path,
      related: catalogEntry?.related ?? [],
      simpleExplanation: catalogEntry?.simpleExplanation,
      technicalExplanation: catalogEntry?.technicalExplanation,
      parent: dirname(path),
    };
    if (node.parent === '.') node.parent = undefined;
    nodeMap.set(path, node);

    // Ensure all parent directories exist as nodes
    let dir = dirname(path);
    while (dir && dir !== '.') {
      if (!nodeMap.has(dir)) {
        const dirCatalog = catalogByPath.get(dir);
        nodeMap.set(dir, {
          path: dir,
          name: basename(dir),
          kind: 'directory',
          layer: detectLayer(dir),
          role: 'container',
          coverage: dirCatalog ? 'curated' : 'indexed',
          sourceRef: dir,
          related: dirCatalog?.related ?? [],
          simpleExplanation: dirCatalog?.simpleExplanation,
          technicalExplanation: dirCatalog?.technicalExplanation,
          parent: dirname(dir) === '.' ? undefined : dirname(dir),
          children: [],
        });
      }
      dir = dirname(dir);
    }
  }

  // Fill children arrays
  for (const node of nodeMap.values()) {
    if (!node.parent) continue;
    const parent = nodeMap.get(node.parent);
    if (parent && parent.children) {
      parent.children.push(node.path);
    }
  }

  // Sort children
  for (const node of nodeMap.values()) {
    if (node.children) {
      node.children.sort((a, b) => {
        const na = nodeMap.get(a);
        const nb = nodeMap.get(b);
        if (!na || !nb) return a.localeCompare(b);
        if (na.kind !== nb.kind) return na.kind === 'directory' ? -1 : 1;
        return a.localeCompare(b);
      });
    }
  }

  const nodes = Array.from(nodeMap.values()).sort((a, b) => a.path.localeCompare(b.path));

  const layers = {};
  for (const node of nodes) {
    layers[node.layer] = (layers[node.layer] ?? 0) + 1;
  }

  const index = {
    generatedAt: new Date().toISOString(),
    total: nodes.length,
    curated: nodes.filter((n) => n.coverage === 'curated').length,
    layers,
    nodes,
  };

  const output = JSON.stringify(index, null, 2);

  if (isCheck) {
    if (!existsSync(outPath)) {
      console.error(`Index file missing: ${outPath}`);
      process.exit(1);
    }
    const existing = JSON.parse(readFileSync(outPath, 'utf-8'));
    const normalize = (obj) => JSON.stringify({ total: obj.total, curated: obj.curated, layers: obj.layers, nodes: obj.nodes });
    if (normalize(existing) !== normalize(index)) {
      console.error('Canon index is out of date. Run `pnpm --filter iskra-site canon:index:generate`.');
      process.exit(1);
    }
    console.log(`Canon index up to date (${index.total} nodes, ${index.curated} curated).`);
    return;
  }

  writeFileSync(outPath, output);
  console.log(`Generated canon-index.json: ${index.total} nodes, ${index.curated} curated, layers: ${Object.keys(layers).length}`);
}

main();
