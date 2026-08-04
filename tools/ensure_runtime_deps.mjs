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
 * Readiness needs three independent signals, because each catches a failure
 * the other two miss:
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
 *      tree was mutated without touching the lockfile". A hash check cannot see
 *      this: `npm prune --omit=dev` removes devDependencies (typescript,
 *      @types/node) while leaving both package-lock.json and this stamp
 *      untouched, so a hash-only check reports readiness for a tree that
 *      cannot build. A partially restored cache is the harder variant — the
 *      directory survives while its contents do not — which is why
 *      brokenDependencies() resolves declared entry points rather than
 *      testing directory names.
 *
 *   3. package.json's own declared dependencies against the lockfile's own
 *      record of them — catches "package.json was edited without regenerating
 *      the lockfile" (a dependency added, removed, or its range changed by
 *      hand, with no `npm install` run afterward). Neither signal above sees
 *      this: the lockfile's bytes are untouched, so the hash still matches;
 *      and since round 11 the integrity check is DERIVED from the lockfile's
 *      own `packages` map, so a dependency package.json newly declares but
 *      the lockfile has never heard of is not iterated at all — nothing
 *      reports it missing, because nothing looks for it. Reproduced: adding a
 *      dependency to package.json alone, lockfile and node_modules untouched,
 *      left signals (1) and (2) both silent and the check reporting "tree
 *      complete".
 *
 * Checking all three is not belt-and-braces; each alone is genuinely
 * insufficient. The integrity check enumerates the lockfile's own `packages`
 * map rather than a hand-picked marker list or the direct dependencies, so —
 * unlike the original two markers — it does detect a newly declared package
 * missing from a stale tree that the LOCKFILE already knows about, and unlike
 * a direct-only check it also covers transitive packages. That case is
 * covered twice; the cases listed under (1) are covered only by the hash; the
 * case under (3) — package.json diverging from the lockfile itself — is
 * covered only by comparing the two directly.
 */
const lockHash = createHash('sha256').update(readFileSync(packageLock)).digest('hex');

/**
 * Order-independent equality for a `dependencies`/`devDependencies` map:
 * same keys, same values, key order irrelevant. Not a JSON.stringify
 * comparison — npm and a hand-edited file need not preserve the same key
 * order for the comparison to be meaningless (a reordered-but-unchanged
 * `package.json` must not read as drift).
 */
function sameDependencyMap(a, b) {
  const left = a ?? {};
  const right = b ?? {};
  const keys = new Set([...Object.keys(left), ...Object.keys(right)]);
  for (const key of keys) {
    if (left[key] !== right[key]) return false;
  }
  return true;
}

/**
 * Whether `package.json`'s declared dependencies still match what the
 * lockfile's own root entry (`packages[""]`) recorded them as at the last
 * `npm install`/`npm ci`. That root entry mirrors `dependencies`/
 * `devDependencies` exactly as of lock generation, so this comparison detects
 * drift directly — no separate npm invocation needed to see it, only to
 * resolve it (a genuine mismatch here means `npm ci` itself should be left to
 * fail with its own actionable error, not silently patched around here).
 */
/**
 * Whether every exact-version `overrides` entry in `package.json` still
 * matches the version actually resolved for that package in the lockfile.
 *
 * `dependencies`/`devDependencies` alone miss this: `overrides` pins a
 * TRANSITIVE package's version, so the overridden name never appears in
 * either map. Changing an override's value in `package.json` — e.g.
 * `"protobufjs": "7.6.5"` → a newer pin — leaves the lockfile's own
 * `node_modules/protobufjs` entry at the old version, and neither the
 * lockfile hash (unchanged) nor the dependency-map comparison (does not
 * look at `overrides`) would ever see it.
 *
 * Only string (exact-version) overrides are checked, matching what this
 * package.json actually declares — nested override objects (overriding a
 * dependency's own transitive dependency specifically, rather than every
 * occurrence) are a distinct npm feature this does not attempt to resolve.
 * A package the override names that has no top-level `node_modules/<name>`
 * entry at all is not treated as a mismatch: that means nothing in this
 * tree currently depends on it, so the override has no effect to verify.
 */
function overridesMatchLock(pkg, lock) {
  const overrides = pkg.overrides;
  if (!overrides || typeof overrides !== 'object') return true;
  for (const [name, version] of Object.entries(overrides)) {
    if (typeof version !== 'string') continue;
    const installed = lock.packages?.[`node_modules/${name}`];
    if (installed && installed.version !== version) return false;
  }
  return true;
}

function packageJsonMatchesLock() {
  if (!existsSync(packageJson)) return true; // nothing to compare against
  const pkg = JSON.parse(readFileSync(packageJson, 'utf8'));
  const lock = JSON.parse(readFileSync(packageLock, 'utf8'));
  const rootEntry = lock.packages?.[''] ?? {};
  return (
    sameDependencyMap(pkg.dependencies, rootEntry.dependencies) &&
    sameDependencyMap(pkg.devDependencies, rootEntry.devDependencies) &&
    overridesMatchLock(pkg, lock)
  );
}

/**
 * Node/TypeScript module resolution for a declared target, reduced to
 * existence. Two different extension sets, because a declaration target and
 * a code target resolve against different file kinds:
 *
 *   - `main` is not required to name a file that exists verbatim: `ms`
 *     declares `"main": "./index"` and Node resolves `./index.js`.
 *   - `types`/`typings` are declaration targets: `@types/retry` declares
 *     `"types": "index"` and TypeScript resolves `./index.d.ts` — a `.js`
 *     extension will never exist for a pure-declaration package, so trying
 *     only code extensions there reports every such package broken.
 *
 * Checking the literal string, or checking one extension set for both kinds,
 * reports healthy packages as broken — measured across this lockfile's 243
 * packages: four false positives from literal-string checking (round 11),
 * two more from applying code extensions to a declaration target (this
 * round). A check that cries wolf on a good tree is worse than none, because
 * the fix is to stop believing it.
 */
function entryPointExists(dir, rel, kind) {
  const base = join(dir, rel);
  if (existsSync(base)) return true;
  const extensions = kind === 'declaration' ? ['.d.ts', '.d.cts', '.d.mts'] : ['.js', '.json', '.node', '.cjs', '.mjs'];
  for (const ext of extensions) {
    if (existsSync(`${base}${ext}`)) return true;
  }
  return existsSync(join(base, kind === 'declaration' ? 'index.d.ts' : 'index.js'));
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

  // npm's own module resolution for `main`, `bin`, `types`/`typings` accepts a
  // bare relative path with no "./" prefix. @types/node declares exactly that
  // — `{"types": "index.d.ts"}`, no `main`, no `bin`, no `exports` — so a
  // check that requires a literal "./" prefix drops its only entry point and
  // reports a package with a stripped .d.ts as complete.
  const pushLenient = (rel, kind) => {
    if (typeof rel !== 'string' || rel.length === 0 || rel.includes('*') || rel.startsWith('/')) return;
    targets.push({ rel: rel.startsWith('./') || rel.startsWith('../') ? rel : `./${rel}`, kind });
  };

  // `main`, `types` and `typings` are all ignored ENTIRELY once `exports` is
  // present — modern resolvers go through `exports` exclusively, so a stale
  // top-level field left over from before a package adopted `exports` names
  // nothing the resolver ever reads. Measured twice on this lockfile:
  // `@humanfs/core` declares `main: "dist/index.js"` (absent — only .d.ts
  // ships in dist/) while its real target is `exports.import.default:
  // "./src/index.js"` (present); `rxjs` declares top-level `types:
  // "index.d.ts"` (absent at the package root) while its real declaration
  // target is `exports["."].types: "./dist/types/index.d.ts"` (present).
  // Checking these fields unconditionally reported two healthy packages as
  // broken. `types`/`typings` still matter when `exports` is ABSENT — that is
  // exactly the `@types/node` / `@types/retry` case this round exists to fix.
  if (!manifest.exports) {
    pushLenient(manifest.main, 'code');
    pushLenient(manifest.types, 'declaration');
    pushLenient(manifest.typings, 'declaration');
  }

  if (typeof manifest.bin === 'string') pushLenient(manifest.bin, 'code');
  else if (manifest.bin && typeof manifest.bin === 'object') {
    for (const target of Object.values(manifest.bin)) pushLenient(target, 'code');
  }

  const walkExports = (node) => {
    if (typeof node === 'string') {
      // Unlike main/bin/types, `exports` targets are conventionally always
      // "./"-relative; a bare string here is more likely a bare specifier
      // pointing at another package than an omitted prefix, so — unlike the
      // fields above — it is not normalized, only accepted if already
      // relative. Every condition walked here is code-resolving (`types` is
      // deliberately excluded from RUNTIME_EXPORT_CONDITIONS — see below).
      if (node.startsWith('./') && !node.includes('*')) targets.push({ rel: node, kind: 'code' });
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

  return targets;
}

/**
 * Whether an optional package's os/cpu constraints admit the platform this
 * script is running on, using the same semantics npm itself uses to decide
 * install eligibility (an unconstrained list, i.e. absent or `["any"]`,
 * matches everything; entries prefixed `!` negate; a negated match always
 * excludes; a non-empty positive list requires the current value to appear
 * in it). Absence on an *excluded* platform is not damage — `os`/`cpu` say
 * npm never installed it there. Absence on an *included* platform is exactly
 * the failure this check exists to catch.
 */
function checkPlatformList(list, current) {
  if (!Array.isArray(list) || list.length === 0) return true;
  if (list.length === 1 && list[0] === 'any') return true;
  const negated = list.filter((v) => v.startsWith('!')).map((v) => v.slice(1));
  if (negated.includes(current)) return false;
  const positive = list.filter((v) => !v.startsWith('!'));
  return positive.length === 0 || positive.includes(current);
}

function optionalAppliesToThisPlatform(meta) {
  return checkPlatformList(meta.os, process.platform) && checkPlatformList(meta.cpu, process.arch);
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
    // `link: true` entries are symlinked workspace members, not installed trees.
    if (meta?.link) continue;
    // Optional dependencies are legitimately absent for two different reasons
    // that this check must not conflate:
    //   1. The entry declares its OWN os/cpu constraint that excludes this
    //      platform — e.g. `@rolldown/binding-darwin-arm64` never installs on
    //      Linux. Absence here is correct and must not be flagged.
    //   2. The entry is optional only because it sits behind an optional edge
    //      SOMEWHERE ELSE in the graph (a transitive dependency of a
    //      platform-specific optional package for a different platform), and
    //      declares no os/cpu of its own — e.g. `@emnapi/core`, pulled in
    //      only by WASM-fallback bindings this platform does not use.
    //      Whether npm actually installs such a node depends on the whole
    //      dependency graph, not on this node's own manifest; this check has
    //      no path to that answer, so — as before this round — it is skipped.
    // Tightening therefore applies only to case 1: an entry is checked when
    // it is optional AND declares an os/cpu constraint that this platform
    // satisfies. `@rolldown/binding-linux-x64-gnu` (`os: ["linux"], cpu:
    // ["x64"]`) is exactly that case, and is required for `import 'rolldown'`
    // to resolve on this platform.
    if (meta?.optional || meta?.devOptional) {
      const declaresOwnPlatform = Array.isArray(meta.os) || Array.isArray(meta.cpu);
      if (!declaresOwnPlatform || !optionalAppliesToThisPlatform(meta)) continue;
    }

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

    // A cache restore can replace a package with a COMPLETE but different
    // version — every entry point present, nothing missing, and yet builds
    // and tests run against code the lockfile does not describe. Existence
    // checks alone cannot see this; every lockfile entry that survives the
    // skips above carries its own resolved `version`, so comparing it
    // against the installed manifest's own `version` costs nothing extra
    // and catches a class of drift no entry-point check can.
    if (typeof meta.version === 'string' && manifest.version !== meta.version) {
      broken.push(`${name} (version ${manifest.version ?? '?'} !== locked ${meta.version})`);
      continue;
    }

    const missingEntry = declaredEntryPoints(manifest).find(({ rel, kind }) => !entryPointExists(dir, rel, kind));
    if (missingEntry !== undefined) broken.push(`${name} (missing ${missingEntry.rel})`);
  }
  return broken;
}

if (existsSync(nodeModulesDir) && existsSync(stampFile)) {
  const stamped = readFileSync(stampFile, 'utf8').trim();
  if (stamped !== lockHash) {
    console.log('[legacy-runtime] runtime lockfile changed since last install; reinstalling');
  } else if (!packageJsonMatchesLock()) {
    // Lockfile hash and installed-tree integrity can both be satisfied while
    // package.json itself has drifted from what the lockfile last recorded
    // — see signal (3) above. Falling through to `npm ci` here is
    // deliberate: it is npm's own job to refuse an out-of-sync lockfile with
    // an actionable error, not this script's job to guess what to install.
    console.log('[legacy-runtime] runtime package.json has diverged from package-lock.json; reinstalling');
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
