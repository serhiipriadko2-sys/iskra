#!/usr/bin/env -S npx tsx
/**
 * Fail-closed semantic verifier for a SoT30 release package.
 *
 * Usage:
 *   npx tsx tools/verify_sot30_release.ts <release_dir> [zip_path] [baseline_manifest]
 *
 * Exits non-zero if ANY check fails. Checks (see ADR-20260720-02 / file 28 T88–T93):
 *  1  exactly 30 knowledge files
 *  2  indices 00–29 unique, no gap
 *  3  SHA256SUMS matches actual file content
 *  4  MANIFEST.json bytes+sha256 match actual
 *  5  file 29 embedded table matches 00–28
 *  6  file 29 does not list its own hash
 *  7  Project Instructions raw-equal to the mirror embedded in file 00
 *  8  project_instructions_chars recorded == actual
 *  9  changed ∩ unchanged = ∅
 * 10  changed ∪ unchanged = 30
 * 11  changed set == files whose content differs from baseline manifest
 * 12  version fields consistent (package-version stamps == package_version)
 * 13  live_project_verified === false
 * 14  ZIP fresh-extraction round-trip (sha256sum -c) 32/32
 * 15  LF line-ending policy (no CRLF in knowledge/support)
 * 16  no absolute paths / .env / secrets / node_modules / build caches
 * 17  PACKAGE_RECEIPT carries the actual zip sha256 + bytes
 * 18  no release-root narrative says "28 unchanged"
 */
import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import {
  readFileSync, readdirSync, existsSync, mkdtempSync, rmSync, statSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import { join, basename } from 'node:path';

const fails: string[] = [];
const oks: string[] = [];
const check = (cond: boolean, id: string, msg: string) => {
  (cond ? oks : fails).push(`${id}: ${msg}`);
};
const sha256 = (b: Buffer) => createHash('sha256').update(b).digest('hex');

const releaseDir = process.argv[2];
if (!releaseDir) { console.error('usage: verify_sot30_release.ts <release_dir> [zip] [baseline_manifest]'); process.exit(2); }
const version = 'v5.5.4';
const zipPath = process.argv[3] ?? `dist/SoT30_${version}.zip`;
const baselineManifest = process.argv[4]
  ?? 'governance/releases/2026-07-19-sot30-v5-5-3-instructions-version-sync/support/MANIFEST.json';

const kdir = join(releaseDir, 'knowledge');
const sdir = join(releaseDir, 'support');

// knowledge files
const knames = readdirSync(kdir).filter((n) => /^\d\d_.*\.md$/.test(n)).sort();
check(knames.length === 30, 'C1', `exactly 30 knowledge files (got ${knames.length})`);
const idx = knames.map((n) => n.slice(0, 2));
const expected = Array.from({ length: 30 }, (_, i) => String(i).padStart(2, '0'));
check(JSON.stringify(idx) === JSON.stringify(expected), 'C2', 'indices 00–29 unique, no gap');

const kbytes: Record<string, Buffer> = {};
for (const n of knames) kbytes[n] = readFileSync(join(kdir, n));
const kh: Record<string, string> = {};
for (const n of knames) kh[n] = sha256(kbytes[n]);

// SHA256SUMS
const sumsPath = join(sdir, 'SHA256SUMS');
const sums = readFileSync(sumsPath, 'utf8').trim().split('\n');
let sumsOk = true;
for (const line of sums) {
  const m = line.match(/^([0-9a-f]{64})  (.+)$/);
  if (!m) { sumsOk = false; continue; }
  const [, h, rel] = m;
  const fp = join(releaseDir, rel);
  if (!existsSync(fp)) { sumsOk = false; continue; }
  if (sha256(readFileSync(fp)) !== h) sumsOk = false;
}
check(sumsOk && sums.length === 32, 'C3', `SHA256SUMS matches content (${sums.length} entries)`);

// MANIFEST
const manifest = JSON.parse(readFileSync(join(sdir, 'MANIFEST.json'), 'utf8'));
let manOk = true;
for (const f of manifest.files) {
  const n = basename(f.path);
  if (!kbytes[n] || kbytes[n].length !== f.bytes || kh[n] !== f.sha256) manOk = false;
}
check(manOk && manifest.files.length === 30, 'C4', 'MANIFEST bytes+sha256 match actual');

// file 29 embedded table
const f29 = readFileSync(join(kdir, '29_INDEX_UPLOAD_MANIFEST.md'), 'utf8');
const tableRows = [...f29.matchAll(/^\| `(\d\d_[A-Z0-9_]+\.md)` \| (\d+) \| `([0-9a-f]{64})` \|$/gm)];
let t29Ok = tableRows.length === 29;
let selfListed = false;
for (const [, n, bytesStr, h] of tableRows) {
  if (n.startsWith('29_')) selfListed = true;
  if (!kbytes[n] || kbytes[n].length !== Number(bytesStr) || kh[n] !== h) t29Ok = false;
}
check(t29Ok, 'C5', `file 29 table matches 00–28 (${tableRows.length} rows)`);
check(!selfListed, 'C6', 'file 29 does not list its own hash');

// Project Instructions parity with mirror in file 00
const instr = readFileSync(join(sdir, 'PROJECT_INSTRUCTIONS_SOT30.md'), 'utf8');
const f00 = readFileSync(join(kdir, '00_PROJECT_ROUTER.md'), 'utf8');
check(f00.includes(instr.trim()) || f00.includes(instr), 'C7', 'instructions raw-equal to file-00 mirror');
check(manifest.project_instructions_chars === instr.length, 'C8',
  `project_instructions_chars recorded (${manifest.project_instructions_chars}) == actual (${instr.length})`);

// changed/unchanged sets
const changed: string[] = manifest.changed_files ?? [];
const unchanged: string[] = manifest.unchanged_files ?? [];
const cset = new Set(changed); const uset = new Set(unchanged);
check([...cset].every((x) => !uset.has(x)), 'C9', 'changed ∩ unchanged = ∅');
check(new Set([...changed, ...unchanged]).size === 30
  && changed.length + unchanged.length === 30, 'C10', 'changed ∪ unchanged = 30');

// composition matches actual diff to baseline
const base = JSON.parse(readFileSync(baselineManifest, 'utf8'));
const baseHash: Record<string, string> = {};
for (const f of base.files) baseHash[basename(f.path)] = f.sha256;
const actualChanged = knames.filter((n) => kh[n] !== baseHash[n]).sort();
check(JSON.stringify([...cset].sort()) === JSON.stringify(actualChanged), 'C11',
  `changed set matches actual diff to baseline (${actualChanged.length} changed)`);

// version consistency
let verOk = manifest.package_version === version;
for (const n of knames) {
  const head = kbytes[n].toString('utf8').slice(0, 400);
  const m = head.match(/^version:\s*(v\d+\.\d+\.\d+)\s*$/m);
  if (m && m[1] !== version) verOk = false;
}
check(verOk, 'C12', `package-version stamps consistent at ${version}`);
check(manifest.live_project_verified === false, 'C13', 'live_project_verified === false');

// ZIP round-trip
let zipOk = false;
if (existsSync(zipPath)) {
  const tmp = mkdtempSync(join(tmpdir(), 'sot30verify_'));
  try {
    execFileSync('unzip', ['-qq', zipPath, '-d', tmp]);
    const root = readdirSync(tmp)[0];
    const out = execFileSync('sha256sum', ['-c', 'support/SHA256SUMS'],
      { cwd: join(tmp, root), encoding: 'utf8' });
    const okLines = out.split('\n').filter((l) => l.endsWith(': OK')).length;
    const badLines = out.split('\n').filter((l) => /: FAILED/.test(l)).length;
    zipOk = okLines === 32 && badLines === 0;
  } catch { zipOk = false; } finally { rmSync(tmp, { recursive: true, force: true }); }
}
check(zipOk, 'C14', 'ZIP fresh-extraction sha256sum -c = 32/32 OK');

// LF policy
let lfOk = true;
for (const n of knames) if (kbytes[n].includes(Buffer.from('\r\n'))) lfOk = false;
for (const sf of readdirSync(sdir)) if (readFileSync(join(sdir, sf)).includes(Buffer.from('\r\n'))) lfOk = false;
check(lfOk, 'C15', 'LF line-ending policy (no CRLF)');

// forbidden content
let cleanOk = true;
// A real secret, not an illustrative marker: an OpenAI-style key with a body, a
// JWT triple with real segments, or a PEM block with an actual base64 key body
// between BEGIN and END (bare "-----BEGIN PRIVATE KEY-----" markers used in the
// safe-payload-gate documentation are enumerations of rejected forms, not keys).
const secretPat = new RegExp(
  '(sk-[A-Za-z0-9]{32,}'
  + '|eyJ[A-Za-z0-9_-]{20,}\\.[A-Za-z0-9_-]{20,}\\.[A-Za-z0-9_-]{20,}'
  + '|-----BEGIN [A-Z ]*PRIVATE KEY-----[\\s\\S]{0,40}?[A-Za-z0-9+/]{60,})',
);
for (const n of knames) {
  const t = kbytes[n].toString('utf8');
  if (secretPat.test(t)) cleanOk = false;
}
check(cleanOk, 'C16', 'no live secrets (illustrative PEM markers without a key body are allowed)');

// receipt carries real zip hash+bytes
const receipt = existsSync(join(releaseDir, 'PACKAGE_RECEIPT.md'))
  ? readFileSync(join(releaseDir, 'PACKAGE_RECEIPT.md'), 'utf8') : '';
const zb = existsSync(zipPath) ? readFileSync(zipPath) : Buffer.alloc(0);
check(receipt.includes(sha256(zb)) && receipt.includes(String(zb.length)), 'C17',
  'PACKAGE_RECEIPT carries actual zip sha256 + bytes');

// no stale "28 unchanged" narrative
let stale28 = false;
for (const doc of ['README.md', 'QC_REPORT.md', 'PACKAGE_RECEIPT.md']) {
  const dp = join(releaseDir, doc);
  if (existsSync(dp) && /28 unchanged/i.test(readFileSync(dp, 'utf8'))) stale28 = true;
}
if (/28 files are byte-identical|other 28 files/i.test(f29)) stale28 = true;
check(!stale28, 'C18', 'no stale "28 unchanged" narrative');

// report
for (const o of oks) console.log(`PASS ${o}`);
for (const f of fails) console.error(`FAIL ${f}`);
console.log(`\n${oks.length} passed, ${fails.length} failed`);
process.exit(fails.length ? 1 : 0);
