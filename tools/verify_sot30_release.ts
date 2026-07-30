#!/usr/bin/env -S npx tsx
/**
 * Fail-closed semantic verifier for a SoT30 release package.
 *
 * Usage:
 *   npx tsx tools/verify_sot30_release.ts <release_dir> [zip_path] [baseline_manifest] [version]
 *
 * Exits non-zero if ANY check fails. Each check verifies an EXACT property, not a
 * necessary-but-insufficient proxy (hardened per ADR-20260720-02 + PR-C review):
 *  C1  knowledge dir = exactly the 30 files {00..29}, unique, no extra/non-md/missing
 *  C1b support dir = exactly {MANIFEST.json, PROJECT_INSTRUCTIONS_SOT30.md, SHA256SUMS}
 *  C2  indices 00–29 contiguous
 *  C3  SHA256SUMS = exactly {30 knowledge + support/MANIFEST.json + support/PROJECT_INSTRUCTIONS_SOT30.md}, each hash correct
 *  C4  MANIFEST.files = exactly the 30 knowledge paths (unique set), each bytes+sha256 correct
 *  C5  file-29 table = exactly {00..28} (unique set), each bytes+sha256 correct
 *  C6  file 29 does not list its own hash
 *  C7  T80: the mirror region in file 00 (anchored at "## Project Instructions") is BYTE-EQUAL to the standalone instructions
 *  C8  project_instructions_chars == actual character count
 *  C9  changed ∩ unchanged = ∅
 *  C10 changed ∪ unchanged = the actual set of knowledge filenames (set equality, not just size)
 *  C11 changed set = files whose content differs from the baseline manifest
 *  C12 package-version stamps consistent with package_version
 *  C13 live_project_verified === false
 *  C14 ZIP: single top-level root; every entry under root/knowledge|root/support; file set = exactly {30 knowledge + 3 support}; sha256sum -c 32/32
 *  C15 LF line-ending policy (no CRLF in knowledge/support)
 *  C16 package composition safety: no packaged file / zip entry is .env|node_modules|build-cache|absolute-path; no live secrets in knowledge/support/audit/scripts (illustrative bare PEM markers allowed)
 *  C17 PACKAGE_RECEIPT carries the actual zip sha256 + bytes
 *  C18 no release-root or file-29 narrative repeats the retired "28 files identical" composition claim
 *  C19 T88: README/QC/PACKAGE_RECEIPT composition tokens agree with each other AND with MANIFEST's actual changed/unchanged counts; file 29 defers to the manifest (no contradicting hard-coded count)
 *  C20 release-tree ↔ extracted-ZIP byte parity for all 33 files (catches a split-brain tree/zip)
 *  C21 no ADR-lifecycle self-contradiction (a doc claiming `accepted` while also stating `proposed`/`not accepted`)
 *  C22 file-29 active-identity consistency: exactly one "(this build)" version-section == MANIFEST.package_version; supersedes ⊇ baseline_release; active composition heading ⊇ baseline_release; no "proposed, not accepted" ADR claim
 *  C23 T85/T86 acceptance-contract consistency (applicable from v5.5.6; older immutable releases are
 *      grandfathered; a malformed package_version is a hard FAIL, never grandfathered)
 *  C24 (from v5.5.7) shared-project memory branch + context-boundary matrix present in file 02;
 *      Enterprise section carries no chat-history requirement in ANY phrasing (semantic, not exact-bullet)
 *  C25 (from v5.5.7) T86 declared cross-file coverage is real: files 06/07 carry no numeric M2 coupling;
 *      the 07 §2.2 M3 veto-attribution divergence is mapped in 12 §4.2; normative M2 phrases live INSIDE
 *      the 12 §4.2 normative section (a decoy copy elsewhere does not satisfy the contract)
 *  C26 (from v5.5.7) release root = exact allowlist {README, QC_REPORT, PACKAGE_RECEIPT, knowledge/, support/};
 *      root docs carry no encoding artifact (isolated " ? ", U+FFFD, double-encoded UTF-8 pairs)
 *  C27 (from v5.5.7) active identity: manifest.package_version == file-25 current_package
 *      == standalone instructions heading == file-00 mirror heading (closes the T97 gap)
 *  C28 (from v5.5.7) loader sequence statically gated: file-00 loader block routes
 *      29 → 00 → 01 → 02 → 03–07 in order; file-29 reading order agrees (closes the T96 gap)
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
const setEq = (a: Set<string>, b: Set<string>) =>
  a.size === b.size && [...a].every((x) => b.has(x));

const releaseDir = process.argv[2];
if (!releaseDir) {
  console.error('usage: verify_sot30_release.ts <release_dir> [zip] [baseline_manifest] [version]');
  process.exit(2);
}
const version = process.argv[5] ?? 'v5.5.4';
const zipPath = process.argv[3] ?? `dist/SoT30_${version}.zip`;
const baselineManifest = process.argv[4]
  ?? 'governance/releases/2026-07-19-sot30-v5-5-3-instructions-version-sync/support/MANIFEST.json';

const kdir = join(releaseDir, 'knowledge');
const sdir = join(releaseDir, 'support');
const SUPPORT_FILES = ['MANIFEST.json', 'PROJECT_INSTRUCTIONS_SOT30.md', 'SHA256SUMS'];
const EXPECTED_KNAMES = new Set(
  Array.from({ length: 30 }, (_, i) => String(i).padStart(2, '0')),
);

// ---- knowledge dir = EXACTLY {00..29}, nothing else (no non-md / stray files) ----
const kEntries = readdirSync(kdir);
const kfiles = kEntries.filter((n) => /\.md$/.test(n)).sort();
const kIdxSet = new Set(kfiles.map((n) => n.slice(0, 2)));
const kNumbered = kfiles.filter((n) => /^\d\d_.*\.md$/.test(n));
check(
  kEntries.length === 30 && kfiles.length === 30 && kNumbered.length === 30
    && new Set(kEntries).size === 30 && setEq(new Set(kEntries), new Set(kNumbered))
    && setEq(kIdxSet, EXPECTED_KNAMES),
  'C1', `knowledge dir is exactly the 30 files {00..29}, no extras (got ${kEntries.length} entries)`,
);
// support dir = exactly the 3 support files, nothing else
const sEntries = readdirSync(sdir);
check(sEntries.length === 3 && setEq(new Set(sEntries), new Set(SUPPORT_FILES)),
  'C1b', `support dir is exactly {${SUPPORT_FILES.join(', ')}} (got ${sEntries.length})`);
const knames = kNumbered;
const idx = knames.map((n) => n.slice(0, 2));
const expected = Array.from({ length: 30 }, (_, i) => String(i).padStart(2, '0'));
check(JSON.stringify(idx) === JSON.stringify(expected), 'C2', 'indices 00–29 contiguous');

const kbytes: Record<string, Buffer> = {};
for (const n of knames) kbytes[n] = readFileSync(join(kdir, n));
const kh: Record<string, string> = {};
for (const n of knames) kh[n] = sha256(kbytes[n]);
const knameSet = new Set(knames);

// ---- SHA256SUMS = exact expected set + correct hashes ----
const sumsPath = join(sdir, 'SHA256SUMS');
const sums = readFileSync(sumsPath, 'utf8').trim().split('\n');
const sumsPaths = new Set<string>();
let sumsHashOk = true;
for (const line of sums) {
  const m = line.match(/^([0-9a-f]{64})  (.+)$/);
  if (!m) { sumsHashOk = false; continue; }
  const [, h, rel] = m;
  sumsPaths.add(rel);
  const fp = join(releaseDir, rel);
  if (!existsSync(fp) || sha256(readFileSync(fp)) !== h) sumsHashOk = false;
}
const expectedSumsPaths = new Set<string>([
  ...knames.map((n) => `knowledge/${n}`),
  'support/MANIFEST.json',
  'support/PROJECT_INSTRUCTIONS_SOT30.md',
]);
check(
  sumsHashOk && sums.length === 32 && setEq(sumsPaths, expectedSumsPaths),
  'C3', `SHA256SUMS = exact expected 32-file set with correct hashes (${sums.length} lines)`,
);

// ---- MANIFEST.files = exact 30 knowledge set, with EXACT full paths ----
const manifest = JSON.parse(readFileSync(join(sdir, 'MANIFEST.json'), 'utf8'));
const manFullPaths = (manifest.files ?? []).map((f: { path: string }) => f.path);
const manFullSet = new Set<string>(manFullPaths);
const expectedManPaths = new Set<string>(knames.map((n) => `knowledge/${n}`));
let manHashOk = true;
for (const f of manifest.files ?? []) {
  const n = basename(f.path);
  // full path must be exactly knowledge/<name> (rejects wrong-prefix/00_… with a right basename)
  if (f.path !== `knowledge/${n}` || !kbytes[n] || kbytes[n].length !== f.bytes || kh[n] !== f.sha256) {
    manHashOk = false;
  }
}
check(
  manHashOk && manifest.files?.length === 30
    && manFullPaths.length === 30 && manFullSet.size === 30 && setEq(manFullSet, expectedManPaths),
  'C4', 'MANIFEST.files = exact 30 knowledge paths (full-path set), bytes+sha256 correct',
);

// ---- file-29 embedded table = exact {00..28} set ----
const f29 = readFileSync(join(kdir, '29_INDEX_UPLOAD_MANIFEST.md'), 'utf8');
const tableRows = [...f29.matchAll(/^\| `(\d\d_[A-Z0-9_]+\.md)` \| (\d+) \| `([0-9a-f]{64})` \|$/gm)];
const t29Names = new Set<string>();
let t29HashOk = true;
let selfListed = false;
for (const [, n, bytesStr, h] of tableRows) {
  t29Names.add(n);
  if (n.startsWith('29_')) selfListed = true;
  if (!kbytes[n] || kbytes[n].length !== Number(bytesStr) || kh[n] !== h) t29HashOk = false;
}
const expected0028 = new Set(knames.filter((n) => !n.startsWith('29_')));
check(
  t29HashOk && tableRows.length === 29 && t29Names.size === 29 && setEq(t29Names, expected0028),
  'C5', `file-29 table = exact {00..28} set (${tableRows.length} rows)`,
);
check(!selfListed, 'C6', 'file 29 does not list its own hash');

// ---- T80: byte-equal mirror region anchored in file 00 ----
const instrBuf = readFileSync(join(sdir, 'PROJECT_INSTRUCTIONS_SOT30.md'));
const instr = instrBuf.toString('utf8');
const f00Buf = readFileSync(join(kdir, '00_PROJECT_ROUTER.md'));
const anchor = Buffer.from('## Project Instructions');
const anchorIdx = f00Buf.indexOf(anchor);
let t80Ok = false;
if (anchorIdx !== -1) {
  let s = anchorIdx + anchor.length;
  while (s < f00Buf.length && [0x0a, 0x0d, 0x20, 0x09].includes(f00Buf[s])) s += 1;
  const region = f00Buf.subarray(s, s + instrBuf.length);
  // byte-equal to the standalone AND anchored at the documented mirror position AND
  // present exactly once: a modified mirror fails even if a pristine copy appears
  // elsewhere as a substring, and a duplicate-copy injection fails on uniqueness.
  const first = f00Buf.indexOf(instrBuf);
  const last = f00Buf.lastIndexOf(instrBuf);
  t80Ok = region.length === instrBuf.length && region.equals(instrBuf) && first !== -1 && first === last;
}
check(t80Ok, 'C7', 'T80: file-00 mirror region is BYTE-EQUAL to standalone instructions and unique');
check(manifest.project_instructions_chars === instr.length, 'C8',
  `project_instructions_chars recorded (${manifest.project_instructions_chars}) == actual (${instr.length})`);

// ---- changed / unchanged sets ----
const changed: string[] = manifest.changed_files ?? [];
const unchanged: string[] = manifest.unchanged_files ?? [];
const cset = new Set(changed);
const uset = new Set(unchanged);
check(
  changed.length === cset.size && unchanged.length === uset.size
    && [...cset].every((x) => !uset.has(x)),
  'C9', 'changed ∩ unchanged = ∅ (both internally unique)',
);
check(setEq(new Set([...changed, ...unchanged]), knameSet), 'C10',
  'changed ∪ unchanged = actual knowledge filename set');

// ---- composition matches actual diff to baseline ----
const base = JSON.parse(readFileSync(baselineManifest, 'utf8'));
const baseHash: Record<string, string> = {};
for (const f of base.files) baseHash[basename(f.path)] = f.sha256;
const actualChanged = knames.filter((n) => kh[n] !== baseHash[n]).sort();
check(setEq(cset, new Set(actualChanged)), 'C11',
  `changed set = actual diff to baseline (${actualChanged.length} changed)`);

// ---- version consistency ----
let verOk = manifest.package_version === version;
for (const n of knames) {
  const head = kbytes[n].toString('utf8').slice(0, 400);
  const m = head.match(/^version:\s*(v\d+\.\d+\.\d+)\s*$/m);
  if (m && m[1] !== version) verOk = false;
}
check(verOk, 'C12', `package-version stamps consistent at ${version}`);
check(manifest.live_project_verified === false, 'C13', 'live_project_verified === false');

// ---- ZIP: single root, exact allowlist (no dup entries / extra dirs), round-trip ----
// ---- C20: every extracted file is BYTE-EQUAL to its release-tree counterpart ----
let zipOk = false;
let parityOk = false;
let zipMsg = 'zip missing';
let parityMsg = 'zip missing';
if (existsSync(zipPath)) {
  const tmp = mkdtempSync(join(tmpdir(), 'sot30verify_'));
  try {
    const listing = execFileSync('unzip', ['-Z1', zipPath], { encoding: 'utf8' })
      .split('\n').map((l) => l.trim()).filter(Boolean);
    const roots = new Set(listing.map((e) => e.split('/')[0]));
    const singleRoot = roots.size === 1;
    const root = [...roots][0];
    // file entries as an ARRAY (so duplicate arcnames are detectable), dir entries too
    const fileEntries = listing.filter((e) => !e.endsWith('/'));
    const dirEntries = listing.filter((e) => e.endsWith('/'));
    const relFileArr = fileEntries.map((e) => e.slice(root.length + 1));
    const relFiles = new Set(relFileArr);
    const expectedZip = new Set<string>([
      ...knames.map((n) => `knowledge/${n}`),
      ...SUPPORT_FILES.map((s) => `support/${s}`),
    ]);
    const noDupEntries = relFileArr.length === relFiles.size;             // no duplicate arcnames
    const expectedDirs = new Set([`${root}/`, `${root}/knowledge/`, `${root}/support/`]);
    const dirsOk = dirEntries.every((d) => expectedDirs.has(d));          // no stray directories
    const noAbsOrDotDot = fileEntries.every((e) => !e.startsWith('/') && !e.includes('..'));
    const allowlistOk = setEq(relFiles, expectedZip);
    execFileSync('unzip', ['-qq', zipPath, '-d', tmp]);
    const out = execFileSync('sha256sum', ['-c', 'support/SHA256SUMS'],
      { cwd: join(tmp, root), encoding: 'utf8' });
    const okLines = out.split('\n').filter((l) => l.endsWith(': OK')).length;
    const badLines = out.split('\n').filter((l) => /: FAILED/.test(l)).length;
    zipOk = singleRoot && allowlistOk && noDupEntries && dirsOk && noAbsOrDotDot
      && okLines === 32 && badLines === 0;
    zipMsg = `root=${root} entries=${relFileArr.length} dup=${!noDupEntries} dirs=${dirsOk} sha256sum -c ${okLines}/32`;

    // C20: extracted ZIP bytes must equal the release-tree bytes for all 33 files
    let par = true;
    for (const n of knames) {
      if (!readFileSync(join(tmp, root, 'knowledge', n)).equals(kbytes[n])) par = false;
    }
    for (const sf of SUPPORT_FILES) {
      if (!readFileSync(join(tmp, root, 'support', sf)).equals(readFileSync(join(sdir, sf)))) par = false;
    }
    parityOk = par;
    parityMsg = par ? '33/33 byte-equal to release tree' : 'ZIP diverges from release tree';
  } catch (e) { zipMsg = `error: ${(e as Error).message}`; parityMsg = zipMsg; } finally {
    rmSync(tmp, { recursive: true, force: true });
  }
}
check(zipOk, 'C14', `ZIP single-root + exact allowlist + no-dup/no-stray-dir + round-trip (${zipMsg})`);
check(parityOk, 'C20', `release-tree ↔ extracted-ZIP byte parity (${parityMsg})`);

// ---- LF policy ----
let lfOk = true;
for (const n of knames) if (kbytes[n].includes(Buffer.from('\r\n'))) lfOk = false;
for (const sf of SUPPORT_FILES) {
  const p = join(sdir, sf);
  if (existsSync(p) && readFileSync(p).includes(Buffer.from('\r\n'))) lfOk = false;
}
check(lfOk, 'C15', 'LF line-ending policy (no CRLF in knowledge/support)');

// ---- C16: package composition safety + real secret scan ----
// structural: no packaged file / zip entry is an env/dependency/cache/absolute artifact.
const FORBIDDEN_PATH = /(^|\/)(\.env(\..*)?|node_modules|\.cache|\.next|coverage|dist|build)(\/|$)/i;
let structuralOk = true;
// RECURSIVELY walk knowledge/ and support/ so a stray .env / node_modules / cache
// artifact is caught even inside an injected sub-directory and even if absent from
// SHA256SUMS/MANIFEST.
const walk = (dir: string, prefix: string): string[] => {
  const out: string[] = [];
  for (const d of readdirSync(dir, { withFileTypes: true })) {
    const rel = `${prefix}/${d.name}`;
    out.push(rel);
    if (d.isDirectory()) out.push(...walk(join(dir, d.name), rel));
  }
  return out;
};
const actualPackaged = [...walk(kdir, 'knowledge'), ...walk(sdir, 'support')];
for (const rel of actualPackaged) {
  if (FORBIDDEN_PATH.test(rel) || rel.startsWith('/')) structuralOk = false;
}
// (zip entry names already allow-listed in C14; this guards the release tree itself.)

// secrets: tight patterns over knowledge + support + (optional) audit dir + tool scripts.
// Bare "-----BEGIN … PRIVATE KEY-----" markers WITHOUT a base64 body are illustrative
// (the file-24 historical mirror enumerates rejected forms) and are allowed.
// A real leaked Supabase service_role / anon key is a JWT (eyJ…) and is caught by
// the JWT-triple branch regardless of any `SERVICE_ROLE_KEY=` prefix. We deliberately
// do NOT flag `ANON_KEY=<name>`-style assignments: in the file-24 historical mirror
// those values are documentation placeholders (`your_supabase_anon_key`,
// `import.meta.env.VITE_SUPABASE_ANON_KEY`), not real secrets.
const secretPat = new RegExp(
  '(sk-[A-Za-z0-9_-]{20,}'
  + '|eyJ[A-Za-z0-9_-]{20,}\\.[A-Za-z0-9_-]{20,}\\.[A-Za-z0-9_-]{20,}'
  + '|-----BEGIN [A-Z ]*PRIVATE KEY-----[\\s\\S]{0,40}?[A-Za-z0-9+/]{60,})',
);
const secretScanTargets: string[] = [
  ...knames.map((n) => join(kdir, n)),
  ...SUPPORT_FILES.map((s) => join(sdir, s)),
];
// release-root docs: committed release artifacts whose bytes the ledger will
// authenticate — a secret here would be hashed-and-blessed, so scan them too.
for (const doc of ['README.md', 'QC_REPORT.md', 'PACKAGE_RECEIPT.md']) {
  secretScanTargets.push(join(releaseDir, doc));
}
// audit artifacts + build/verify scripts, when present (advertised coverage).
const auditDir = 'governance/audits/2026-07-20-sot30-v554';
if (existsSync(auditDir)) {
  for (const f of readdirSync(auditDir)) secretScanTargets.push(join(auditDir, f));
}
for (const s of ['tools/build_sot30_release.py', 'tools/verify_sot30_release.ts',
  'tools/verify_sot30_release.selftest.ts']) {
  if (existsSync(s)) secretScanTargets.push(s);
}
let secretsOk = true;
for (const p of secretScanTargets) {
  if (!existsSync(p) || statSync(p).isDirectory()) continue;
  if (secretPat.test(readFileSync(p, 'utf8'))) { secretsOk = false; }
}
check(structuralOk && secretsOk, 'C16',
  'package tree (recursive) has no env/dep/cache/abs-path artifact + no live secrets in knowledge/support/audit/scripts');

// ---- receipt carries real zip hash+bytes ----
const receipt = existsSync(join(releaseDir, 'PACKAGE_RECEIPT.md'))
  ? readFileSync(join(releaseDir, 'PACKAGE_RECEIPT.md'), 'utf8') : '';
const zb = existsSync(zipPath) ? readFileSync(zipPath) : Buffer.alloc(0);
check(zb.length > 0 && receipt.includes(sha256(zb)) && receipt.includes(String(zb.length)), 'C17',
  'PACKAGE_RECEIPT carries actual zip sha256 + bytes');

// ---- retired "28 identical" claim absent ----
let retired = false;
const retiredPat = /28 files (are )?(byte-)?identical|other 28 files|28 unchanged/i;
for (const doc of ['README.md', 'QC_REPORT.md', 'PACKAGE_RECEIPT.md']) {
  const dp = join(releaseDir, doc);
  if (existsSync(dp) && retiredPat.test(readFileSync(dp, 'utf8'))) retired = true;
}
if (retiredPat.test(f29)) retired = true;
check(!retired, 'C18', 'retired "28-files-identical" composition claim absent');

// ---- C19 (T88): composition agreement across README/QC/receipt + MANIFEST + file 29 ----
// Editable release-root docs carry a machine-readable token:
//   <!-- composition: changed=N unchanged=M baseline=v5.5.3 -->
// All three must agree with each other AND with the manifest's actual counts;
// file 29 must defer to the manifest and carry no contradicting hard-coded count.
const compToken = (t: string): [number, number] | null => {
  const m = t.match(/composition:\s*changed=(\d+)\s+unchanged=(\d+)/i);
  return m ? [Number(m[1]), Number(m[2])] : null;
};
const manComp: [number, number] = [changed.length, unchanged.length];
const rootTokens: Record<string, [number, number] | null> = {};
for (const doc of ['README.md', 'QC_REPORT.md', 'PACKAGE_RECEIPT.md']) {
  const dp = join(releaseDir, doc);
  rootTokens[doc] = existsSync(dp) ? compToken(readFileSync(dp, 'utf8')) : null;
}
const allTokens = Object.values(rootTokens);
const tokensPresent = allTokens.every((x) => x !== null);
const tokensAgree = tokensPresent && allTokens.every(
  (x) => x![0] === manComp[0] && x![1] === manComp[1],
);
// file 29 must reference the manifest as the composition authority and NOT hard-code a
// contradicting "N files unchanged" count.
const f29DefersToManifest = /manifest'?s?\b|support\/MANIFEST\.json/i.test(f29)
  && !/\b(\d+) files? (are )?(byte-)?identical\b/i.test(f29);
check(tokensAgree && f29DefersToManifest, 'C19',
  `T88 composition agreement (manifest changed=${manComp[0]}/unchanged=${manComp[1]}; root tokens ${
    tokensPresent ? 'present' : 'MISSING'}; file29 defers=${f29DefersToManifest})`);

// ---- C21: lifecycle/status self-consistency across ADR + release-root docs ----
// Catches the P0a class: a doc claiming ADR `accepted` while also stating it is
// `proposed` / `not accepted`. (A historical "supersedes the earlier proposed
// state" reference is allowed; only an active "is `proposed`, not `accepted`"
// contradiction fails.)
const contradictionPat = /is\s+`?proposed`?\s*,?\s*(and\s+)?not\s+`?accepted`?|not\s+`?accepted`?\s+absent/i;
const statusDocs: Record<string, string> = {};
for (const doc of ['README.md', 'QC_REPORT.md', 'PACKAGE_RECEIPT.md']) {
  const dp = join(releaseDir, doc);
  if (existsSync(dp)) statusDocs[doc] = readFileSync(dp, 'utf8');
}
// Resolve the ADR file from the manifest's `adr` id (e.g. "ADR-20260720-02")
// rather than hard-coding the filename, so a renamed/re-versioned ADR still binds.
const adrId: string = manifest.adr ?? '';
const govDir = 'governance';
let adrPath = '';
if (adrId && existsSync(govDir)) {
  for (const f of readdirSync(govDir)) {
    if (/^adr_.*\.md$/i.test(f)) {
      const t = readFileSync(join(govDir, f), 'utf8');
      if (new RegExp(`^#\\s+${adrId.replace(/[.*+?^${}()|[\\]\\\\]/g, '\\$&')}\\b`, 'm').test(t)) {
        adrPath = join(govDir, f);
        break;
      }
    }
  }
}
if (adrPath) statusDocs[adrPath] = readFileSync(adrPath, 'utf8');
const contradictions = Object.entries(statusDocs)
  .filter(([, t]) => /status[:*\s]*.{0,20}accepted/i.test(t) && contradictionPat.test(t))
  .map(([d]) => basename(d));
check(contradictions.length === 0, 'C21',
  `no ADR-lifecycle self-contradiction (accepted vs proposed) ${
    contradictions.length ? `— FAIL in ${contradictions.join(', ')}` : ''}`);

// ---- C22: file-29 active-identity consistency (exact properties, not keyword proxy) ----
// Catches the class where file 29's active narrative labels an OLD version as
// "(this build)", or the composition/supersedes reference the wrong baseline, or an
// accepted ADR is called "proposed". Version resolved from the MANIFEST, not hard-coded.
{
  const pkgVer: string = manifest.package_version ?? '';           // e.g. "v5.5.5"
  const baseVer: string = manifest.baseline_release ?? '';         // e.g. "v5.5.4"
  const thisBuildHeadings = [...f29.matchAll(/^##\s+(v\d+\.\d+\.\d+)\b[^\n]*\(this build\)/gim)]
    .map((m) => m[1]);
  // 1+2: exactly one "(this build)" version-section, and it is the package version
  const c22a = thisBuildHeadings.length === 1 && thisBuildHeadings[0] === pkgVer;
  // 3: frontmatter supersedes lists the baseline release
  const supersedesM = f29.match(/^supersedes:\s*(.+)$/mi);
  const c22b = !!baseVer && !!supersedesM && supersedesM[1].includes(baseVer);
  // 4: active composition heading references the baseline release
  const compM = f29.match(/^###\s+Composition[^\n]*$/mi);
  const c22c = !!baseVer && !!compM && compM[0].includes(baseVer);
  // 5: no INTERNAL contradiction — an ADR must not be both listed as `accepted` in
  // file 29 and called "proposed, not accepted" in the same file. (An immutable
  // historical package that consistently says its own ADR was `proposed` at its build
  // time is NOT flagged — this checks self-contradiction, not current repo state.)
  const acceptedAdrs = new Set<string>();
  const proposedNotAccepted = new Set<string>();
  for (const line of f29.split('\n')) {
    const ids = [...line.matchAll(/ADR-\d{8}-\d{2}/g)].map((m) => m[0]);
    if (!ids.length) continue;
    const isProposedNotAcc = /is\s+`?proposed`?\s*,?\s*not\s+`?accepted`?/i.test(line);
    if (isProposedNotAcc) ids.forEach((id) => proposedNotAccepted.add(id));
    // "accepted" declaration = the word accepted, but NOT "not accepted" and NOT "proposed"
    else if (/\baccepted\b/i.test(line) && !/not\s+`?accepted`?/i.test(line) && !/\bproposed\b/i.test(line)) {
      ids.forEach((id) => acceptedAdrs.add(id));
    }
  }
  const c22d = ![...proposedNotAccepted].some((a) => acceptedAdrs.has(a));
  check(c22a && c22b && c22c && c22d, 'C22',
    `file-29 active identity consistent (this-build=${JSON.stringify(thisBuildHeadings)} `
    + `pkg=${pkgVer}; supersedes⊇${baseVer}:${c22b}; comp⊇${baseVer}:${c22c}; no-internal-contradiction:${c22d})`);
}


// ---- version helpers shared by C23–C26 (floor-gated contracts) ----
const verTuple = (v: string): number[] => {
  const m = String(v ?? '').match(/^v?(\d+)\.(\d+)\.(\d+)$/);
  return m ? [Number(m[1]), Number(m[2]), Number(m[3])] : [0, 0, 0];
};
const versionWellFormed = /^v?\d+\.\d+\.\d+$/.test(String(manifest.package_version ?? ''));
const atLeast = (v: string, floor: string): boolean => {
  const a = verTuple(v); const b = verTuple(floor);
  for (let i = 0; i < 3; i += 1) {
    if (a[i] !== b[i]) return a[i] > b[i];
  }
  return true;
};
// A malformed package_version must NEVER downgrade to "contract not applicable":
// that would let a corrupted manifest bypass every floor-gated semantic check.
const appliesFrom = (floor: string): boolean =>
  versionWellFormed && atLeast(manifest.package_version ?? '', floor);

// ---- C23: T85/T86 acceptance-contract consistency ----
// Introduced after the v5.5.5 clean-Project diagnostic run. Older immutable
// releases are grandfathered so their historical packages remain verifiable.
{
  const applies = appliesFrom('v5.5.6');
  if (!versionWellFormed) {
    check(false, 'C23',
      `package_version malformed (${JSON.stringify(manifest.package_version)}) — fail-closed, floor-gated contracts cannot be waived`);
  } else if (!applies) {
    check(true, 'C23', `T85/T86 contract not applicable before v5.5.6 (package=${manifest.package_version})`);
  } else {
    const f02 = readFileSync(join(kdir, '02_PROJECTS_SURFACE_MAP.md'), 'utf8');
    const f03 = readFileSync(join(kdir, '03_TELOS_MANTRA_PRINCIPLES.md'), 'utf8');
    const f04 = readFileSync(join(kdir, '04_IDENTITY_NON_MIRROR.md'), 'utf8');
    const f12 = readFileSync(join(kdir, '12_COUNCIL_VOICES.md'), 'utf8');
    const f28 = readFileSync(join(kdir, '28_EVALS_ACCEPTANCE.md'), 'utf8');
    const between = (s: string, a: string, b: string): string => {
      const i = s.indexOf(a); if (i < 0) return '';
      const j = s.indexOf(b, i + a.length); return j < 0 ? '' : s.slice(i, j);
    };

    const ent = between(f02, '### Enterprise users', '### All other subscriptions (including Business)');
    const nonEnt = between(f02, '### All other subscriptions (including Business)', '### Business workspace boundary');
    const biz = between(f02, '### Business workspace boundary', '### Unknown-state rule');
    const unknown = between(f02, '### Unknown-state rule', '```text');
    const t85row = f28.split('\n').find((l) => l.startsWith('| T85-MEMORY-SETTINGS-PRECONDITION |')) ?? '';
    const t85ok = ent.includes('`Reference saved memories`')
      && ent.includes('Workspace settings')
      && !/- Enable `Reference chat history`/i.test(ent)
      && nonEnt.includes('- Enable `Reference saved memories`')
      && nonEnt.includes('- Enable `Reference chat history`')
      && biz.includes('must not disable Memory')
      && biz.includes('positive claim') && biz.includes('forbidden')
      && unknown.includes('Unknown plan') && unknown.includes('positive isolation/enabled claim is forbidden')
      && !f02.includes('### Business/Enterprise users')
      && t85row.includes('Enterprise requires `Reference saved memories` + Workspace Memory')
      && t85row.includes('does not require `Reference chat history`')
      && t85row.includes('every non-Enterprise plan, including Business, requires both personal toggles')
      && t85row.includes('positive claim forbidden');

    const table12 = between(f12, '### 4.2', '## 5');
    const row12 = table12.split('\n').find((l) => l.includes('ISKRIV') && l.includes('drift') && l.trim().startsWith('|')) ?? '';
    const cells = row12.split('|').map((x) => x.trim());
    const m2cell = cells[3] ?? '';
    const m2Block = (s: string): string => {
      const note = s.indexOf('**M2 drift note (normative):**');
      if (note < 0) return '';
      const end8 = s.indexOf('8.4 ', note);
      return s.slice(Math.max(0, note - 800), end8 < 0 ? note + 800 : end8);
    };
    const validM2Block = (b: string): boolean => b.includes('no numeric M2 Voice threshold')
      && b.includes('12 ') && b.includes('4.2')
      && b.includes('It does not select a Voice or activate KAIN.')
      && !/drift[^\n]{0,24}0\.2/i.test(b)
      && !b.includes('ISKRIV/KAIN')
      && !b.includes('It activates KAIN.');
    const t86row = f28.split('\n').find((l) => l.startsWith('| T86-THRESHOLD-CONSISTENCY |')) ?? '';
    const t86ok = m2cell.length > 0 && !/[0-9><=]/.test(m2cell)
      && f12.includes('means that this mechanism has no numeric threshold')
      && f12.includes('M1 and M3 thresholds must not be transferred into M2')
      && validM2Block(m2Block(f03)) && validM2Block(m2Block(f04))
      && t86row.includes('03/04 M2 drift blocks contain no numeric activation')
      && t86row.includes('M2 drift does not activate KAIN');

    check(t85ok && t86ok, 'C23',
      `T85/T86 contract consistent (T85=${t85ok}; T86=${t86ok}; M2=${JSON.stringify(m2cell)})`);
  }
}

// ---- C24 (from v5.5.7): shared-project memory branch + semantic Enterprise regression ----
{
  if (!appliesFrom('v5.5.7')) {
    check(versionWellFormed, 'C24', `shared-project contract not applicable before v5.5.7 (package=${manifest.package_version})`);
  } else {
    const f02 = readFileSync(join(kdir, '02_PROJECTS_SURFACE_MAP.md'), 'utf8');
    const f28 = readFileSync(join(kdir, '28_EVALS_ACCEPTANCE.md'), 'utf8');
    const between = (s: string, a: string, b: string): string => {
      const i = s.indexOf(a); if (i < 0) return '';
      const j = s.indexOf(b, i + a.length); return j < 0 ? '' : s.slice(i, j);
    };
    const shared = between(f02, '### Shared projects', '### Context-boundary matrix');
    const sharedOk = shared.includes('project-only')
      && shared.includes('cannot revert')
      && /observed_at/.test(shared);
    const matrix = between(f02, '### Context-boundary matrix', '<!-- T85-CONTRACT');
    // exact cell-value contract: parse each boundary row and assert the semantic
    // value of BOTH cells, so reversing e.g. Project-only to allowed/allowed fails
    // even though every keyword is still present somewhere in the section.
    const matrixCell = (rowLabel: string): [string, string] | null => {
      const row = matrix.split('\n').find((l) => l.trim().startsWith(`| ${rowLabel}`));
      if (!row) return null;
      const cells = row.split('|').map((c) => c.trim());
      return cells.length >= 4 ? [cells[2], cells[3]] : null;
    };
    // a cell must OPEN with the expected value AND must not smuggle the opposite
    // value anywhere in its explanation ("denied — actually allowed" fails).
    const cellIs = (cell: string | undefined, want: 'allowed' | 'denied'): boolean => {
      if (!cell) return false;
      const norm = cell.toLowerCase();
      const opposite = want === 'allowed' ? 'denied' : 'allowed';
      return norm.startsWith(want) && !norm.includes(opposite);
    };
    const rowsSpec: Array<[string, 'allowed' | 'denied', 'allowed' | 'denied']> = [
      ['Project-only memory', 'denied', 'denied'],
      ['Enterprise/Edu default memory', 'denied', 'allowed'],
      ['Non-Enterprise default memory (incl. Business)', 'allowed', 'allowed'],
      ['Shared project', 'denied', 'denied'],
    ];
    const cellsOk = rowsSpec.every(([label, a, b]) => {
      const c = matrixCell(label);
      return !!c && cellIs(c[0], a) && cellIs(c[1], b);
    });
    const matrixOk = matrix.includes('Outside-chat reference')
      && matrix.includes('Saved-memory reference')
      && matrix.includes('not a security')
      && cellsOk;
    const tokenOk = f02.includes('shared=auto_project_only_irreversible');
    // Enterprise regression guard: after removing the single allowed NEGATION
    // sentence, no term from the allowlisted history-requirement LEXICON may
    // remain in the Enterprise section. This is an explicit lexicon contract,
    // not a general semantic proof — extend the lexicon when new phrasings are
    // observed (static regex cannot prove absence in arbitrary phrasing).
    const ent = between(f02, '### Enterprise users', '### All other subscriptions (including Business)');
    const entWithoutNegation = ent.replace(
      /`Reference chat history` is \*\*not\*\* an Enterprise prerequisite[^\n]*/i, '',
    );
    const historyLexicon = /(chat|conversation)[ -]?history|previous conversations|prior (chats|conversations)|истори[юия][^\n]{0,20}(чат|разговор)/i;
    const entSemanticOk = ent.length > 0 && !historyLexicon.test(entWithoutNegation);
    const t94Ok = /^\| T94-SHARED-PROJECT-MEMORY \|.*project-only.*cannot revert/m.test(f28);
    const t95Ok = /^\| T95-MEMORY-BOUNDARY-DIMENSIONS \|.*outside-chat reference denied, saved-memory reference allowed/m.test(f28);
    check(sharedOk && matrixOk && tokenOk && entSemanticOk && t94Ok && t95Ok, 'C24',
      `shared-project branch + boundary matrix + semantic Enterprise guard (shared=${sharedOk} matrix=${matrixOk} `
      + `token=${tokenOk} entSemantic=${entSemanticOk} T94=${t94Ok} T95=${t95Ok})`);
  }
}

// ---- C25 (from v5.5.7): T86 declared cross-file coverage is real (06/07 + normative-section location) ----
{
  if (!appliesFrom('v5.5.7')) {
    check(versionWellFormed, 'C25', `T86 cross-file contract not applicable before v5.5.7 (package=${manifest.package_version})`);
  } else {
    const f06 = readFileSync(join(kdir, '06_SECURITY_INTEGRITY.md'), 'utf8');
    const f07 = readFileSync(join(kdir, '07_UNIVERSAL_ROUTER.md'), 'utf8');
    const f12 = readFileSync(join(kdir, '12_COUNCIL_VOICES.md'), 'utf8');
    // no line may couple the M2 mechanism with a numeric threshold in 06/07:
    // decimals, comparison forms, integers/percentages tied to threshold or
    // activation vocabulary. Section references (e.g. "12 §4.2") are exempt.
    const m2NumericLine = (t: string): boolean => t.split('\n').some((l) => {
      if (!/\bM2\b/.test(l)) return false;
      const rest = l.replace(/\bM2\b/g, '').replace(/§\s*[\d.]+|файл[ае]?\s*\d+|file\s*\d+/gi, '');
      return /[<>≥≤]\s*\d|\d\.\d|\d+\s*%|(threshold|activat|порог|активаци)[^\n]{0,30}\d/i.test(rest);
    });
    const c25a = !m2NumericLine(f06) && !m2NumericLine(f07);
    // the normative M2 phrases must sit INSIDE §4.2, not merely anywhere in the file
    const s42i = f12.indexOf('### 4.2');
    const s42j = f12.indexOf('## 5', s42i < 0 ? 0 : s42i);
    const s42 = s42i >= 0 && s42j > s42i ? f12.slice(s42i, s42j) : '';
    const c25b = s42.includes('means that this mechanism has no numeric threshold')
      && s42.includes('M1 and M3 thresholds must not be transferred into M2');
    // the known 07 §2.2 KAIN drift-veto attribution divergence must be mapped in §4.2
    const c25c = s42.includes('Mapped M3 divergence');
    check(c25a && c25b && c25c, 'C25',
      `T86 cross-file coverage real (06/07 no numeric M2: ${c25a}; normative phrases in §4.2: ${c25b}; M3 divergence mapped: ${c25c})`);
  }
}

// ---- C26 (from v5.5.7): release-root allowlist + mojibake guard ----
{
  if (!appliesFrom('v5.5.7')) {
    check(versionWellFormed, 'C26', `release-root contract not applicable before v5.5.7 (package=${manifest.package_version})`);
  } else {
    const ROOT_ALLOW = new Set(['README.md', 'QC_REPORT.md', 'PACKAGE_RECEIPT.md', 'knowledge', 'support']);
    const rootEntries = readdirSync(releaseDir);
    const rootOk = rootEntries.length === ROOT_ALLOW.size
      && rootEntries.every((e) => ROOT_ALLOW.has(e));
    // encoding-artifact scan: an isolated " ? " is the signature of a
    // non-UTF-8-safe pipeline replacing typographic dashes (seen shipped in the
    // v5.5.6 QC report); U+FFFD marks a failed decode; "â€…"/"Ã©"-class pairs
    // mark double-encoded UTF-8. Legitimate question marks terminate a word and
    // never float between spaces; legitimate Cyrillic never decodes to these pairs.
    const encodingArtifact = /( \? )|�|â€|Ã[ -¿]/;
    let mojibake = false;
    for (const doc of ['README.md', 'QC_REPORT.md', 'PACKAGE_RECEIPT.md']) {
      const dp = join(releaseDir, doc);
      if (existsSync(dp) && encodingArtifact.test(readFileSync(dp, 'utf8'))) mojibake = true;
    }
    check(rootOk && !mojibake, 'C26',
      `release root exact allowlist (${rootEntries.sort().join(', ')}) + no mojibake artifact (mojibake=${mojibake})`);
  }
}

// ---- C27 (from v5.5.7): active package identity — every active stamp equals the manifest ----
// Closes the T97 gap: C12 sees only `version:` frontmatter keys, so `current_package`
// and the Project Instructions heading could silently regress to an older version.
{
  if (!appliesFrom('v5.5.7')) {
    check(versionWellFormed, 'C27', `active-identity contract not applicable before v5.5.7 (package=${manifest.package_version})`);
  } else {
    const pkgVer: string = manifest.package_version ?? '';
    const f25head = readFileSync(join(kdir, '25_LIBER_SPACE_BUSIDO.md'), 'utf8').slice(0, 600);
    const cpM = f25head.match(/^current_package:\s*(v\d+\.\d+\.\d+)\s*$/m);
    const c27a = !!cpM && cpM[1] === pkgVer;
    const instrHead = readFileSync(join(sdir, 'PROJECT_INSTRUCTIONS_SOT30.md'), 'utf8')
      .split('\n')[0] ?? '';
    const ihM = instrHead.match(/SoT30\s+(v\d+\.\d+\.\d+)/);
    const c27b = !!ihM && ihM[1] === pkgVer;
    // the file-00 mirror heading is covered transitively by C7 byte equality,
    // but assert it directly so a broken mirror cannot mask an identity regression.
    const f00txt = readFileSync(join(kdir, '00_PROJECT_ROUTER.md'), 'utf8');
    const mhM = f00txt.match(/# Project Instructions[^\n]*SoT30\s+(v\d+\.\d+\.\d+)/);
    const c27c = !!mhM && mhM[1] === pkgVer;
    check(c27a && c27b && c27c, 'C27',
      `active identity stamps equal manifest ${pkgVer} (25.current_package=${cpM?.[1] ?? 'MISSING'}; `
      + `instructions-heading=${ihM?.[1] ?? 'MISSING'}; mirror-heading=${mhM?.[1] ?? 'MISSING'})`);
  }
}

// ---- C28 (from v5.5.7): loader-sequence gate — T96 is statically enforced, not just a prompt ----
{
  if (!appliesFrom('v5.5.7')) {
    check(versionWellFormed, 'C28', `loader-sequence contract not applicable before v5.5.7 (package=${manifest.package_version})`);
  } else {
    const f00txt = readFileSync(join(kdir, '00_PROJECT_ROUTER.md'), 'utf8');
    const li = f00txt.indexOf('## Loader contract');
    const lj = f00txt.indexOf('## Precedence', li < 0 ? 0 : li);
    const loader = li >= 0 && lj > li ? f00txt.slice(li, lj) : '';
    // the normative loader block (not decoy text elsewhere) must route the exact
    // sequence 29 → 00 → 01 → 02 → 03–07 in this order.
    const seq = ['29_INDEX_UPLOAD_MANIFEST.md', '00_PROJECT_ROUTER.md',
      '01_PARITY_ADVANCEMENT_MANIFEST.md', '02_PROJECTS_SURFACE_MAP.md', '03–07'];
    let pos = 0; let orderOk = loader.length > 0;
    for (const tok of seq) {
      const at = loader.indexOf(tok, pos);
      if (at < 0) { orderOk = false; break; }
      pos = at + tok.length;
    }
    const f29ro = f29.includes('29 → 00 → 01 → 02 → 03–07');
    check(orderOk && f29ro, 'C28',
      `loader sequence statically gated (00 loader block order=${orderOk}; file-29 reading order=${f29ro})`);
  }
}

// ---- report ----
for (const o of oks) console.log(`PASS ${o}`);
for (const f of fails) console.error(`FAIL ${f}`);
console.log(`\n${oks.length} passed, ${fails.length} failed`);
process.exit(fails.length ? 1 : 0);
