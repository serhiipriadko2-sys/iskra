#!/usr/bin/env -S npx tsx
/**
 * Self-test (negative + positive fixtures) for tools/verify_sot30_release.ts.
 *
 * Proves the verifier is genuinely fail-closed: the real v5.5.4 package must PASS,
 * and each deliberately-tampered fixture must FAIL non-zero on the expected check.
 * Tampering happens on throwaway temp copies / temp zips — the shipped v5.5.4
 * package bytes are never modified.
 *
 * Wired into CI (sot_integrity). Run manually: npx tsx tools/verify_sot30_release.selftest.ts
 */
import { execFileSync } from 'node:child_process';
import {
  cpSync, readFileSync, writeFileSync, rmSync, mkdtempSync, copyFileSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const RELEASE = 'governance/releases/2026-07-20-sot30-v5-5-4-semantic-runtime-consistency';
const ZIP = 'dist/SoT30_v5.5.4.zip';
const BASELINE = 'governance/releases/2026-07-19-sot30-v5-5-3-instructions-version-sync/support/MANIFEST.json';
const VERIFIER = 'tools/verify_sot30_release.ts';

type Run = { code: number; out: string };
function runVerifier(dir: string, zip: string): Run {
  try {
    const out = execFileSync('npx', ['tsx', VERIFIER, dir, zip, BASELINE], { encoding: 'utf8' });
    return { code: 0, out };
  } catch (e) {
    const err = e as { status?: number; stdout?: string; stderr?: string };
    return { code: err.status ?? 1, out: `${err.stdout ?? ''}${err.stderr ?? ''}` };
  }
}

const results: string[] = [];
let failures = 0;
function expect(name: string, cond: boolean, detail = '') {
  if (cond) results.push(`OK   ${name}`);
  else { results.push(`FAIL ${name} ${detail}`); failures += 1; }
}

function tmpCopy(): string {
  const d = mkdtempSync(join(tmpdir(), 'sot30ft_'));
  cpSync(RELEASE, join(d, 'rel'), { recursive: true });
  return join(d, 'rel');
}

// zip root name (v5.5.4 shipped as "SoT30_5.5.4")
const zipRoot = execFileSync('unzip', ['-Z1', ZIP], { encoding: 'utf8' })
  .split('\n')[0].split('/')[0];

// ---- positive ----
{
  const r = runVerifier(RELEASE, ZIP);
  expect('positive: real v5.5.4 PASS', r.code === 0 && /0 failed/.test(r.out) && !/FAIL /.test(r.out),
    `code=${r.code} out=${r.out.split('\n').slice(-2).join(' ')}`);
}

// helper: negative fixture that only mutates the release dir (real zip reused)
function negRelease(name: string, expectCheck: string, mutate: (dir: string) => void) {
  const dir = tmpCopy();
  try {
    mutate(dir);
    const r = runVerifier(dir, ZIP);
    expect(name, r.code !== 0 && new RegExp(`FAIL ${expectCheck}:`).test(r.out),
      `code=${r.code} out=${r.out.split('\n').filter((l) => l.startsWith('FAIL')).join('; ')}`);
  } finally { rmSync(join(dir, '..'), { recursive: true, force: true }); }
}

// 1. duplicated file-29 row + missing another (count stays 29, set breaks)
negRelease('neg: file-29 dup+missing row', 'C5', (dir) => {
  const p = join(dir, 'knowledge/29_INDEX_UPLOAD_MANIFEST.md');
  let t = readFileSync(p, 'utf8');
  const row00 = t.match(/^\| `00_[^\n]*\|$/m)![0];
  t = t.replace(/^\| `05_[^\n]*\|$/m, row00); // replace 05 row with a second 00 row
  writeFileSync(p, t);
});

// 2. missing file-29 row (count 28)
negRelease('neg: file-29 missing row', 'C5', (dir) => {
  const p = join(dir, 'knowledge/29_INDEX_UPLOAD_MANIFEST.md');
  writeFileSync(p, readFileSync(p, 'utf8').replace(/^\| `07_[^\n]*\|$\n/m, ''));
});

// 3. duplicated manifest.files path + missing another
negRelease('neg: manifest dup+missing path', 'C4', (dir) => {
  const p = join(dir, 'support/MANIFEST.json');
  const m = JSON.parse(readFileSync(p, 'utf8'));
  const i5 = m.files.findIndex((f: { path: string }) => f.path.includes('05_'));
  m.files[i5] = { ...m.files.find((f: { path: string }) => f.path.includes('04_')) }; // 04 twice, 05 gone
  writeFileSync(p, JSON.stringify(m, null, 2));
});

// 4. missing manifest file (29 entries)
negRelease('neg: manifest missing file', 'C4', (dir) => {
  const p = join(dir, 'support/MANIFEST.json');
  const m = JSON.parse(readFileSync(p, 'utf8'));
  m.files = m.files.filter((f: { path: string }) => !f.path.includes('12_'));
  writeFileSync(p, JSON.stringify(m, null, 2));
});

// 5. foreign filename in unchanged_files
negRelease('neg: foreign name in unchanged_files', 'C10', (dir) => {
  const p = join(dir, 'support/MANIFEST.json');
  const m = JSON.parse(readFileSync(p, 'utf8'));
  m.unchanged_files[0] = '99_FAKE.md';
  writeFileSync(p, JSON.stringify(m, null, 2));
});

// 8. .env artifact packaged in support/
negRelease('neg: .env in package', 'C16', (dir) => {
  writeFileSync(join(dir, 'support/.env'), 'X=1\n');
});

// 9. README composition token inconsistent with manifest
negRelease('neg: README composition mismatch', 'C19', (dir) => {
  const p = join(dir, 'README.md');
  writeFileSync(p, readFileSync(p, 'utf8')
    .replace(/composition: changed=10 unchanged=20/, 'composition: changed=9 unchanged=21'));
});

// 10. mirror modified (still contains pristine standalone as substring, but mirror region not byte-equal)
negRelease('neg: mirror substring-but-not-byte-equal', 'C7', (dir) => {
  const p = join(dir, 'knowledge/00_PROJECT_ROUTER.md');
  const instr = readFileSync(join(dir, 'support/PROJECT_INSTRUCTIONS_SOT30.md'), 'utf8');
  let t = readFileSync(p, 'utf8');
  // corrupt one character inside the mirror region, then append the pristine copy
  const anchor = '## Project Instructions';
  const a = t.indexOf(anchor);
  const corruptAt = a + anchor.length + 60;
  t = t.slice(0, corruptAt) + (t[corruptAt] === 'X' ? 'Y' : 'X') + t.slice(corruptAt + 1);
  t += `\n\n<!-- pristine copy -->\n${instr}\n`;
  writeFileSync(p, t);
});

// 11. extra non-md file in knowledge/ (C1 exact-dir)
negRelease('neg: extra non-md in knowledge', 'C1', (dir) => {
  writeFileSync(join(dir, 'knowledge/EXTRA.txt'), 'x\n');
});

// 12. wrong manifest path prefix (right basename)
negRelease('neg: wrong manifest path prefix', 'C4', (dir) => {
  const p = join(dir, 'support/MANIFEST.json');
  const m = JSON.parse(readFileSync(p, 'utf8'));
  const i0 = m.files.findIndex((f: { path: string }) => f.path.endsWith('00_PROJECT_ROUTER.md'));
  m.files[i0].path = 'wrong-prefix/00_PROJECT_ROUTER.md';
  writeFileSync(p, JSON.stringify(m, null, 2));
});

// 13. mirror duplicate-copy injection (C7 uniqueness)
negRelease('neg: mirror duplicate-copy injection', 'C7', (dir) => {
  const p = join(dir, 'knowledge/00_PROJECT_ROUTER.md');
  const instr = readFileSync(join(dir, 'support/PROJECT_INSTRUCTIONS_SOT30.md'), 'utf8');
  writeFileSync(p, `${readFileSync(p, 'utf8')}\n\n<!-- injected duplicate -->\n${instr}\n`);
});

// 14. ADR-lifecycle contradiction in README (C21)
negRelease('neg: lifecycle accepted-vs-proposed contradiction', 'C21', (dir) => {
  const p = join(dir, 'README.md');
  writeFileSync(p, `${readFileSync(p, 'utf8')}\n\n- ADR-20260720-02 is \`proposed\`, not \`accepted\`.\n`);
});

// 15. split-brain: release-tree file differs from the (unchanged) ZIP (C20 parity)
negRelease('neg: release-tree ≠ ZIP (split-brain)', 'C20', (dir) => {
  const p = join(dir, 'knowledge/16_SHADOW_LAYER.md');
  writeFileSync(p, `${readFileSync(p, 'utf8')}\n<!-- drift -->\n`);
});

// --- C22 file-29 active-identity fixtures (tamper v5.5.4's file 29) ---
const F29 = 'knowledge/29_INDEX_UPLOAD_MANIFEST.md';
// 18. wrong-version "(this build)" heading
negRelease('neg: wrong-version this-build heading', 'C22', (dir) => {
  const p = join(dir, F29);
  writeFileSync(p, readFileSync(p, 'utf8')
    .replace('## v5.5.4 semantic & runtime-status consistency (this build)',
      '## v5.4.1 semantic & runtime-status consistency (this build)'));
});
// 19. duplicate "(this build)" heading
negRelease('neg: duplicate this-build heading', 'C22', (dir) => {
  const p = join(dir, F29);
  writeFileSync(p, `${readFileSync(p, 'utf8')}\n## v5.5.3 duplicate section (this build)\nx\n`);
});
// 20. missing baseline in supersedes
negRelease('neg: supersedes missing baseline', 'C22', (dir) => {
  const p = join(dir, F29);
  writeFileSync(p, readFileSync(p, 'utf8')
    .replace(', v5.5.2 backlog, v5.5.3 instructions-sync', ''));
});
// 21. wrong composition baseline
negRelease('neg: wrong composition baseline', 'C22', (dir) => {
  const p = join(dir, F29);
  writeFileSync(p, readFileSync(p, 'utf8')
    .replace('### Composition vs the v5.5.3 release tree', '### Composition vs the v5.5.2 release tree'));
});
// 22. accepted-vs-proposed internal contradiction in file 29
negRelease('neg: file-29 accepted-vs-proposed contradiction', 'C22', (dir) => {
  const p = join(dir, F29);
  writeFileSync(p, readFileSync(p, 'utf8')
    .replace('- `ADR-20260720-02` — v5.5.4 semantic & runtime-status consistency (this build), **proposed**.',
      '- `ADR-20260720-02` — v5.5.4 semantic & runtime-status consistency, **accepted**; merged.'));
});

// helper: negative fixture that tampers the ZIP (release dir reused)
function negZip(name: string, expectCheck: string, tamper: (zipCopy: string) => void) {
  const d = mkdtempSync(join(tmpdir(), 'sot30fz_'));
  const zc = join(d, 'tampered.zip');
  try {
    copyFileSync(ZIP, zc);
    tamper(zc);
    const r = runVerifier(RELEASE, zc);
    expect(name, r.code !== 0 && new RegExp(`FAIL ${expectCheck}:`).test(r.out),
      `code=${r.code} out=${r.out.split('\n').filter((l) => l.startsWith('FAIL')).join('; ')}`);
  } finally { rmSync(d, { recursive: true, force: true }); }
}

// deterministic zip tamper: copy all entries from src, append one extra arcname.
function addZipEntry(zc: string, arcname: string) {
  const py = [
    'import zipfile,sys,shutil,os',
    'z=sys.argv[1]; arc=sys.argv[2]; tmp=z+".t"',
    'zi=zipfile.ZipFile(z); zo=zipfile.ZipFile(tmp,"w",zipfile.ZIP_DEFLATED)',
    '[zo.writestr(i,zi.read(i.filename)) for i in zi.infolist()]',
    'zo.writestr(arc,"x"); zo.close(); zi.close(); shutil.move(tmp,z)',
  ].join('\n');
  execFileSync('python3', ['-c', py, zc, arcname]);
}

// 6. extra ZIP entry under the package root
negZip('neg: extra ZIP entry', 'C14', (zc) => addZipEntry(zc, `${zipRoot}/knowledge/__extra.md`));

// 7. second ZIP root
negZip('neg: second ZIP root', 'C14', (zc) => addZipEntry(zc, 'SECOND_ROOT/__r.md'));

// 16. duplicate ZIP entry (same allowlisted arcname twice)
negZip('neg: duplicate ZIP entry', 'C14', (zc) => addZipEntry(zc, `${zipRoot}/knowledge/00_PROJECT_ROUTER.md`));

// 17. extra ZIP directory entry
negZip('neg: extra ZIP directory', 'C14', (zc) => addZipEntry(zc, `${zipRoot}/EXTRA/`));

// ---- report ----
for (const r of results) (r.startsWith('OK') ? console.log : console.error)(r);
console.log(`\n${results.length - failures}/${results.length} fixtures behaved as expected`);
process.exit(failures ? 1 : 0);
