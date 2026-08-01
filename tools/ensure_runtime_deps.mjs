import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { join } from 'node:path';
import { spawnSync } from 'node:child_process';

const runtimeDir = join(process.cwd(), 'runtime');
const packageLock = join(runtimeDir, 'package-lock.json');
const packageJson = join(runtimeDir, 'package.json');
const nodeModulesDir = join(runtimeDir, 'node_modules');
// Stamp lives inside node_modules so wiping node_modules also invalidates it.
const stampFile = join(nodeModulesDir, '.iskra-runtime-deps-stamp');

if (!existsSync(packageLock)) {
  console.error('[legacy-runtime] Missing runtime/package-lock.json; cannot prepare runtime deps.');
  process.exit(2);
}

/**
 * Readiness needs two independent signals, because each catches a failure the
 * other misses:
 *
 *   1. Lockfile hash — catches changes the integrity check cannot see, because
 *      that check inspects what is on disk, not which version was requested:
 *        - a declared version/range changed while the old package is still
 *          installed (node_modules/zod is intact, but at the previous major);
 *        - a package promoted from transitive to direct — already installed,
 *          so it looks complete and nothing appears missing;
 *        - a lockfile-only change (transitive bump) with package.json
 *          untouched, where the integrity check has nothing to compare at all.
 *
 *   2. Integrity of every declared dependency — catches "the installed tree
 *      was mutated without touching the lockfile". A hash check cannot see
 *      this: `npm prune --omit=dev` removes devDependencies (typescript,
 *      @types/node) while leaving both package-lock.json and this stamp
 *      untouched, so a hash-only check reports readiness for a tree that
 *      cannot build. A partially restored cache is the harder variant — the
 *      directory survives while its contents do not — which is why
 *      brokenDependencies() resolves declared entry points rather than
 *      testing directory names.
 *
 * Checking both is not belt-and-braces; each alone is genuinely insufficient.
 * The integrity check is derived from package.json rather than a hand-picked
 * marker list, so — unlike the original two markers — it does detect a newly
 * declared package missing from a stale tree. That case is covered twice; the
 * cases listed under (1) are covered only by the hash.
 */
const lockHash = createHash('sha256').update(readFileSync(packageLock)).digest('hex');

/**
 * A package counts as present only if its own manifest is readable AND every
 * entry point that manifest declares exists on disk.
 *
 * Checking directory names alone is not enough: a partially restored cache can
 * leave `node_modules/typescript/` in place while omitting `bin/tsc`, and a
 * name-only check then reports a complete tree for one that cannot build.
 * Reading each package.json and resolving its `main`/`bin` targets catches
 * gutted packages without the cost of a full `npm ls` integrity pass.
 */
function brokenDependencies() {
  if (!existsSync(packageJson)) return [];
  const pkg = JSON.parse(readFileSync(packageJson, 'utf8'));
  const declared = [
    ...Object.keys(pkg.dependencies ?? {}),
    ...Object.keys(pkg.devDependencies ?? {}),
  ];

  const broken = [];
  for (const name of declared) {
    const dir = join(nodeModulesDir, name);
    const manifestPath = join(dir, 'package.json');
    if (!existsSync(dir) || !existsSync(manifestPath)) {
      broken.push(name);
      continue;
    }

    let manifest;
    try {
      manifest = JSON.parse(readFileSync(manifestPath, 'utf8'));
    } catch {
      broken.push(`${name} (unreadable package.json)`);
      continue;
    }

    const entryPoints = [];
    if (typeof manifest.main === 'string') entryPoints.push(manifest.main);
    if (typeof manifest.bin === 'string') entryPoints.push(manifest.bin);
    else if (manifest.bin && typeof manifest.bin === 'object') {
      for (const target of Object.values(manifest.bin)) {
        if (typeof target === 'string') entryPoints.push(target);
      }
    }

    const missingEntry = entryPoints.find((rel) => !existsSync(join(dir, rel)));
    if (missingEntry !== undefined) broken.push(`${name} (missing ${missingEntry})`);
  }
  return broken;
}

if (existsSync(nodeModulesDir) && existsSync(stampFile)) {
  const stamped = readFileSync(stampFile, 'utf8').trim();
  if (stamped !== lockHash) {
    console.log('[legacy-runtime] runtime lockfile changed since last install; reinstalling');
  } else {
    const missing = brokenDependencies();
    if (missing.length === 0) {
      console.log('[legacy-runtime] runtime dependencies already present (lockfile unchanged, tree complete)');
      process.exit(0);
    }
    console.log(
      `[legacy-runtime] stamp matches but ${missing.length} declared package(s) are missing or incomplete ` +
        `(${missing.slice(0, 5).join(', ')}${missing.length > 5 ? ', …' : ''}); reinstalling`
    );
  }
}

/**
 * `--include=dev` is not redundant. npm defaults `omit` to `dev` when
 * NODE_ENV=production, so under a production environment `npm ci` succeeds
 * while installing none of the devDependencies — and this helper exists
 * precisely to prepare a typecheck/build/test environment, where typescript
 * and @types/node are devDependencies. Without forcing it, that partial
 * install would exit 0, the readiness stamp would be written, and a later
 * run under a normal environment would skip installation and fail the build
 * on missing types. Forcing the flag makes the install identical regardless
 * of ambient NODE_ENV.
 */
console.log('[legacy-runtime] installing runtime dependencies with npm ci --ignore-scripts --include=dev');
const result = spawnSync('npm', ['ci', '--ignore-scripts', '--include=dev'], {
  cwd: runtimeDir,
  stdio: 'inherit',
  shell: process.platform === 'win32',
});

if (result.error) {
  console.error(`[legacy-runtime] failed to launch npm: ${result.error.message}`);
  process.exit(1);
}

const status = result.status ?? 1;
if (status === 0) {
  // Stamp only after verifying the install actually produced the declared
  // tree — writing it on a bare exit code is what let the production-omit
  // and prune cases through before.
  const stillMissing = brokenDependencies();
  if (stillMissing.length > 0) {
    console.error(
      `[legacy-runtime] npm ci exited 0 but ${stillMissing.length} declared package(s) are still missing or incomplete ` +
        `(${stillMissing.slice(0, 5).join(', ')}${stillMissing.length > 5 ? ', …' : ''}); refusing to stamp readiness.`
    );
    process.exit(1);
  }
  writeFileSync(stampFile, `${lockHash}\n`, 'utf8');
}

process.exit(status);
