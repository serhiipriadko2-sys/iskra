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
 *   2. Integrity of every package the lockfile declares — catches "the installed
 *      tree
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
 * The integrity check enumerates the lockfile's own `packages` map rather than a
 * hand-picked marker list or the direct dependencies, so — unlike the original
 * two markers — it does detect a newly declared package missing from a stale
 * tree, and unlike a direct-only check it also covers transitive packages. That
 * case is covered twice; the cases listed under (1) are covered only by the hash.
 */
const lockHash = createHash('sha256').update(readFileSync(packageLock)).digest('hex');

/**
 * Node's CommonJS resolution for a `main` target, reduced to existence.
 *
 * `main` is not required to name a file that exists verbatim: `ms` declares
 * `"main": "./index"` and Node resolves `./index.js`. Checking the literal
 * string reports that package broken on a perfectly healthy tree — measured
 * across this lockfile's 243 packages, literal checking produced four such
 * false positives. A check that cries wolf on a good tree is worse than none,
 * because the fix is to stop believing it.
 */
function entryPointExists(dir, rel) {
  const base = join(dir, rel);
  if (existsSync(base)) return true;
  for (const ext of ['.js', '.json', '.node', '.cjs', '.mjs']) {
    if (existsSync(`${base}${ext}`)) return true;
  }
  return existsSync(join(base, 'index.js'));
}

// Conditions Node actually resolves at runtime. Everything else in an `exports`
// map — `types`, `development`, and vendor-specific keys like `@zod/source` or
// `@standard-schema/source` — points at TypeScript sources or declaration files
// that packages routinely do not publish. Checking those targets reports a
// healthy tree as damaged (measured: `@babel/helper-string-parser` via `types`,
// `@standard-schema/spec` via a source condition). The set is deliberately
// narrow: a condition wrongly included costs a false alarm on every run, while
// one wrongly excluded costs at most a missed file that some other condition of
// the same package almost always covers.
const RUNTIME_EXPORT_CONDITIONS = new Set([
  'node',
  'node-addons',
  'import',
  'require',
  'browser',
  'default',
]);

/**
 * Collect every relative file target a manifest declares as a runtime entry
 * point.
 *
 * `main` and `bin` alone are not sufficient. Modern packages ship `exports`
 * only — `ora` (`{"types": "./index.d.ts", "default": "./index.js"}`) and
 * `typescript-eslint` (`{".": {...}}`) declare no `main` and no `bin`, so an
 * entry-point check that looks only at those two fields collects nothing for
 * them and silently passes a gutted directory. `exports` is the field Node
 * actually resolves for such packages, so it is the field that must be
 * validated.
 *
 * Skipped, because they name something other than a shipped runtime file:
 * wildcard subpath patterns (`"./*": "./dist/*.js"`), which are mapping rules
 * that cannot be existence-checked without expanding the glob; `null` targets
 * (deliberately blocked subpaths); and every condition outside
 * RUNTIME_EXPORT_CONDITIONS.
 */
function declaredEntryPoints(manifest) {
  const targets = [];

  if (typeof manifest.main === 'string') targets.push(manifest.main);

  if (typeof manifest.bin === 'string') targets.push(manifest.bin);
  else if (manifest.bin && typeof manifest.bin === 'object') {
    for (const target of Object.values(manifest.bin)) {
      if (typeof target === 'string') targets.push(target);
    }
  }

  const walkExports = (node) => {
    if (typeof node === 'string') {
      targets.push(node);
      return;
    }
    if (Array.isArray(node)) {
      for (const entry of node) walkExports(entry);
      return;
    }
    if (node && typeof node === 'object') {
      for (const [key, value] of Object.entries(node)) {
        const isSubpath = key.startsWith('.');
        // Subpath keys may be patterns; condition keys never are.
        if (isSubpath && key.includes('*')) continue;
        if (!isSubpath && !RUNTIME_EXPORT_CONDITIONS.has(key)) continue;
        walkExports(value);
      }
    }
  };
  walkExports(manifest.exports);

  return targets.filter((rel) => rel.startsWith('./') && !rel.includes('*'));
}

/**
 * A package counts as present only if its own manifest is readable AND every
 * entry point that manifest declares exists on disk.
 *
 * The set to check is derived from the **lockfile**, not from `package.json`'s
 * direct dependencies. Direct names alone leave the tree's larger half
 * unverified: `inquirer` is a direct dependency, but importing it loads
 * `@inquirer/core`, which appears only in the lockfile. A cache restore that
 * drops a transitive package leaves every direct entry point intact, so a
 * direct-only check reports a complete tree for one that cannot import.
 *
 * Checking directory names alone is likewise not enough: a partially restored
 * cache can leave `node_modules/typescript/` in place while omitting `bin/tsc`,
 * and a name-only check then reports a complete tree for one that cannot build.
 * Reading each package.json and resolving its declared entry points — `main`,
 * `bin` *and* `exports` — catches gutted packages without the cost of a full
 * `npm ls` integrity pass.
 */
function brokenDependencies() {
  const lock = JSON.parse(readFileSync(packageLock, 'utf8'));
  const entries = lock.packages;
  if (!entries || typeof entries !== 'object') {
    // lockfileVersion 1 has no `packages` map. Fail loudly rather than
    // silently degrading to "nothing to check" — a readiness check that
    // quietly verifies nothing is worse than one that refuses to run.
    console.error(
      '[legacy-runtime] runtime/package-lock.json has no "packages" map (lockfileVersion < 2); cannot verify tree integrity.'
    );
    process.exit(2);
  }

  const broken = [];
  for (const [key, meta] of Object.entries(entries)) {
    // "" is the root project itself, not an installed package.
    if (key === '' || !key.startsWith('node_modules/')) continue;
    // Optional dependencies are legitimately absent when their os/cpu
    // constraints do not match this platform, so their absence is not damage.
    // `link: true` entries are symlinked workspace members, not installed trees.
    if (meta?.optional || meta?.devOptional || meta?.link) continue;

    const dir = join(runtimeDir, key);
    const manifestPath = join(dir, 'package.json');
    const name = key.slice(key.lastIndexOf('node_modules/') + 'node_modules/'.length);
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

    const missingEntry = declaredEntryPoints(manifest).find((rel) => !entryPointExists(dir, rel));
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
