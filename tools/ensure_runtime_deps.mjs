import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { spawnSync } from 'node:child_process';

const runtimeDir = join(process.cwd(), 'runtime');
const packageLock = join(runtimeDir, 'package-lock.json');
const dependencyMarker = join(runtimeDir, 'node_modules', '@google', 'genai');
const typeMarker = join(runtimeDir, 'node_modules', '@types', 'node');

if (!existsSync(packageLock)) {
  console.error('[legacy-runtime] Missing runtime/package-lock.json; cannot prepare runtime deps.');
  process.exit(2);
}

if (existsSync(dependencyMarker) && existsSync(typeMarker)) {
  console.log('[legacy-runtime] runtime dependencies already present');
  process.exit(0);
}

console.log('[legacy-runtime] installing runtime dependencies with npm ci --ignore-scripts');
const result = spawnSync('npm', ['ci', '--ignore-scripts'], {
  cwd: runtimeDir,
  stdio: 'inherit',
  shell: process.platform === 'win32',
});

if (result.error) {
  console.error(`[legacy-runtime] failed to launch npm: ${result.error.message}`);
  process.exit(1);
}

process.exit(result.status ?? 1);
