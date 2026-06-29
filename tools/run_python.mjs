#!/usr/bin/env node
import { spawnSync } from 'node:child_process';
import process from 'node:process';

const scriptArgs = process.argv.slice(2);

if (scriptArgs.length === 0) {
  console.error('Usage: node tools/run_python.mjs <script.py> [args...]');
  process.exit(2);
}

const candidates =
  process.platform === 'win32'
    ? [
        ['py', ['-3']],
        ['py', []],
        ['python3', []],
        ['python', []],
      ]
    : [
        ['python3', []],
        ['python', []],
        ['py', ['-3']],
        ['py', []],
      ];

for (const [command, prefixArgs] of candidates) {
  const probe = spawnSync(command, [...prefixArgs, '--version'], {
    encoding: 'utf8',
    windowsHide: true,
  });

  if (probe.error || probe.status !== 0) continue;

  const result = spawnSync(command, [...prefixArgs, ...scriptArgs], {
    stdio: 'inherit',
    windowsHide: true,
  });

  if (result.error) {
    console.error(`Failed to run ${command}: ${result.error.message}`);
    process.exit(1);
  }

  process.exit(result.status ?? 1);
}

console.error('No usable Python interpreter found. Tried py, python3, and python.');
process.exit(127);
