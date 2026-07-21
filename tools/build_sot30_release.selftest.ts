#!/usr/bin/env -S npx tsx
/**
 * Self-test for tools/build_sot30_release.py — exercises the build path that CI
 * previously did not cover (this is why the --from-git provenance defect shipped
 * green). Builds into throwaway temp dirs; never mutates the shipped v5.5.4
 * package. Wired into CI (sot_integrity).
 */
import { execFileSync } from 'node:child_process';
import { cpSync, readFileSync, rmSync, mkdtempSync, existsSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { execSync } from 'node:child_process';

const RELEASE = 'governance/releases/2026-07-20-sot30-v5-5-4-semantic-runtime-consistency';
const BASELINE = 'governance/releases/2026-07-19-sot30-v5-5-3-instructions-version-sync/support/MANIFEST.json';

const results: string[] = [];
let failures = 0;
const expect = (name: string, cond: boolean, detail = '') => {
  if (cond) results.push(`OK   ${name}`);
  else { results.push(`FAIL ${name} ${detail}`); failures += 1; }
};

function build(outRelease: string, zipOut: string, extra: string[] = []): Record<string, unknown> {
  const out = execFileSync('python3', [
    'tools/build_sot30_release.py', outRelease,
    '--version', 'v5.5.4', '--baseline', BASELINE, '--zip-out', zipOut, ...extra,
  ], { encoding: 'utf8' });
  return JSON.parse(out);
}
function verify(dir: string, zip: string): number {
  try { execFileSync('npx', ['tsx', 'tools/verify_sot30_release.ts', dir, zip, BASELINE]); return 0; }
  catch (e) { return (e as { status?: number }).status ?? 1; }
}
function sha(p: string): string {
  return execSync(`sha256sum ${p}`, { encoding: 'utf8' }).split(' ')[0];
}
function tmp(): string { return mkdtempSync(join(tmpdir(), 'sot30bt_')); }

// 1. default build -> release_tree_working_bytes + verifier PASS + round-trip
{
  const d = tmp();
  try {
    cpSync(RELEASE, join(d, 'rel'), { recursive: true });
    const r = build(join(d, 'rel'), join(d, 'def.zip'));
    expect('default: generated_from=release_tree_working_bytes',
      r.generated_from === 'release_tree_working_bytes', JSON.stringify(r.generated_from));
    expect('default: root=SoT30_v5.5.4', r.root === 'SoT30_v5.5.4', String(r.root));
    expect('default: build → verifier PASS', verify(join(d, 'rel'), join(d, 'def.zip')) === 0);
  } finally { rmSync(d, { recursive: true, force: true }); }
}

// 2. --from-git HEAD builds genuinely from git blobs (output to temp, source = real repo path)
{
  const d = tmp();
  try {
    cpSync(RELEASE, join(d, 'rel'), { recursive: true });
    const r = build(join(d, 'rel'), join(d, 'git.zip'),
      ['--from-git', 'HEAD', '--git-source-dir', RELEASE]);
    expect('from-git: generated_from=canonical_git_blobs',
      r.generated_from === 'canonical_git_blobs', JSON.stringify(r.generated_from));
    // every knowledge entry in the zip must byte-equal the git@HEAD blob
    const py = [
      'import zipfile,subprocess,sys',
      `z=zipfile.ZipFile(sys.argv[1]); REAL=sys.argv[2]`,
      "names=[n for n in z.namelist() if '/knowledge/' in n and n.endswith('.md')]",
      "bad=sum(1 for n in names if z.read(n)!=subprocess.check_output(['git','show',f\"HEAD:{REAL}/knowledge/\"+n.split('/knowledge/')[1]]))",
      'print(f"{len(names)-bad}/{len(names)}")',
    ].join('\n');
    const parity = execFileSync('python3', ['-c', py, join(d, 'git.zip'), RELEASE], { encoding: 'utf8' }).trim();
    expect('from-git: 30/30 zip knowledge == git@HEAD blobs', parity === '30/30', parity);
    expect('from-git: build → verifier PASS', verify(join(d, 'rel'), join(d, 'git.zip')) === 0);
  } finally { rmSync(d, { recursive: true, force: true }); }
}

// 3. reproducibility: two default builds are byte-identical (same toolchain)
{
  const d = tmp();
  try {
    cpSync(RELEASE, join(d, 'a'), { recursive: true });
    cpSync(RELEASE, join(d, 'b'), { recursive: true });
    build(join(d, 'a'), join(d, 'a.zip'));
    build(join(d, 'b'), join(d, 'b.zip'));
    expect('reproducibility: two builds byte-identical', sha(join(d, 'a.zip')) === sha(join(d, 'b.zip')));
  } finally { rmSync(d, { recursive: true, force: true }); }
}

// 4. isolation: building into a temp copy does not touch the real release dir
{
  const before = execSync(`git status --short ${RELEASE}`, { encoding: 'utf8' });
  const d = tmp();
  try {
    cpSync(RELEASE, join(d, 'rel'), { recursive: true });
    build(join(d, 'rel'), join(d, 'iso.zip'));
    const after = execSync(`git status --short ${RELEASE}`, { encoding: 'utf8' });
    expect('isolation: real release dir untouched by temp build', before === after,
      `before=${before.length}b after=${after.length}b`);
  } finally { rmSync(d, { recursive: true, force: true }); }
}

for (const r of results) (r.startsWith('OK') ? console.log : console.error)(r);
console.log(`\n${results.length - failures}/${results.length} build checks behaved as expected`);
process.exit(failures ? 1 : 0);
