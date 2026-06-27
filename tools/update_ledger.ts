import * as fs from 'fs';
import * as path from 'path';
import * as crypto from 'crypto';
import { spawnSync } from 'child_process';

/**
 * TypeScript replacement for update_ledger.py
 * Maintains Iskra Source of Truth SHA-256 integrity.
 */

const ROOT = process.cwd();
const INCLUDE_DIRS = ["core","system","governance","metrics","mind","appendix","canon","runtime","tools",".github","docs","supabase"];
const INCLUDE_FILES = ["manifest.yml","README.md","CONTRIBUTING.md","ISKRA_MANIFEST.md","LIBER_INITIUM.md","pnpm-lock.yaml"];
const EXCLUDE = new Set(["ledger/sot.json", "ledger/checksum.asc"]);

const CHECKSUM_DEFAULTS = {
    version: "vΩ.1.2",
    revision: "rev13-maki-priority+integrity",
    algorithm: "sha256"
};

function sha256_file(filePath: string): string {
    // Normalize line endings to LF for consistent hashing across Windows/Linux
    const content = fs.readFileSync(filePath, 'utf-8').replace(/\r\n/g, '\n');
    const hashSum = crypto.createHash('sha256');
    hashSum.update(content, 'utf-8');
    return hashSum.digest('hex');
}

function should_exclude(rel_path: string): boolean {
    const parts = rel_path.split('/');
    if (parts.includes('__pycache__') || rel_path.endsWith('.pyc')) return true;
    if (parts.includes('node_modules')) return true;
    if (parts.includes('coverage')) return true;
    if (parts.includes('dist')) return true;
    if (rel_path.endsWith('.tsbuildinfo')) return true;
    return false;
}

function trackedFiles(): string[] {
    const pathspecs = [...INCLUDE_DIRS, ...INCLUDE_FILES];
    const result = spawnSync('git', ['ls-files', '-z', '--', ...pathspecs], {
        cwd: ROOT,
        encoding: 'utf8',
        windowsHide: true,
        maxBuffer: 16 * 1024 * 1024,
    });

    if (result.error) throw result.error;
    if (result.status !== 0) {
        throw new Error(`git ls-files failed with ${result.status}: ${result.stderr.trim()}`);
    }

    return result.stdout
        .split('\0')
        .map((item) => item.trim())
        .filter(Boolean)
        .sort();
}

const out = { version: "sot-ledger/1", sha256: {} as Record<string, string> };

for (const rel of trackedFiles()) {
    if (EXCLUDE.has(rel) || should_exclude(rel)) continue;
    const file = path.join(ROOT, rel);
    if (!fs.existsSync(file) || !fs.lstatSync(file).isFile()) continue;
    out.sha256[rel] = sha256_file(file);
}

const ledgerDir = path.join(ROOT, 'ledger');
if (!fs.existsSync(ledgerDir)) fs.mkdirSync(ledgerDir);

fs.writeFileSync(path.join(ledgerDir, 'sot.json'), JSON.stringify(out, null, 2) + '\n', 'utf-8');

const checksumPath = path.join(ledgerDir, 'checksum.asc');
let meta = { ...CHECKSUM_DEFAULTS };

if (fs.existsSync(checksumPath)) {
    const lines = fs.readFileSync(checksumPath, 'utf-8').split('\n');
    for (const line of lines) {
        if (line.startsWith('version:')) meta.version = line.split(':')[1].trim();
        else if (line.startsWith('revision:')) meta.revision = line.split(':')[1].trim();
        else if (line.startsWith('algorithm:')) meta.algorithm = line.split(':')[1].trim();
    }
}

const d = new Date();
const updated = d.toISOString().split('T')[0];

let ascLines = [
    "-----BEGIN ISKRA CHECKSUM-----",
    `version: ${meta.version}`,
    `revision: ${meta.revision}`,
    `updated: ${updated}`,
    `algorithm: ${meta.algorithm}`,
    "",
    "# path  sha256"
];

const sortedKeys = Object.keys(out.sha256).sort();
for (const key of sortedKeys) {
    ascLines.push(`${key}  ${out.sha256[key]}`);
}
ascLines.push("-----END ISKRA CHECKSUM-----");

fs.writeFileSync(checksumPath, ascLines.join('\n') + '\n', 'utf-8');
console.log(`Updated ledger/sot.json with ${Object.keys(out.sha256).length} entries`);
