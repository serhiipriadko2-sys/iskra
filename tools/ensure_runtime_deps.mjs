import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { join } from 'node:path';
import { spawnSync } from 'node:child_process';

const runtimeDir = join(process.cwd(), 'runtime');
const packageLock = join(runtimeDir, 'package-lock.json');
const nodeModulesDir = join(runtimeDir, 'node_modules');
// Stamp lives inside node_modules so wiping node_modules also invalidates it.
const stampFile = join(nodeModulesDir, '.iskra-runtime-deps-stamp');

if (!existsSync(packageLock)) {
  console.error('[legacy-runtime] Missing runtime/package-lock.json; cannot prepare runtime deps.');
  process.exit(2);
}

/**
 * Readiness is keyed on the lockfile's content hash, not on the presence of a
 * hand-picked marker package. Marker-based checks silently go stale the moment
 * a dependency is added: node_modules left over from an earlier revision still
 * contains the markers, the install is skipped, and the build fails later with
 * a missing-module error for the new package. Hashing the lockfile makes any
 * dependency change invalidate readiness automatically.
 */
const lockHash = createHash('sha256').update(readFileSync(packageLock)).digest('hex');

if (existsSync(nodeModulesDir) && existsSync(stampFile)) {
  const stamped = readFileSync(stampFile, 'utf8').trim();
  if (stamped === lockHash) {
    console.log('[legacy-runtime] runtime dependencies already present (lockfile unchanged)');
    process.exit(0);
  }
  console.log('[legacy-runtime] runtime lockfile changed since last install; reinstalling');
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
 * of ambient NODE_ENV, which is also what keeps the lockfile hash a
 * sufficient readiness key: one lockfile, one possible installed tree.
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
  writeFileSync(stampFile, `${lockHash}\n`, 'utf8');
}

process.exit(status);
