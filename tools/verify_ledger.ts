import * as fs from 'fs';
import * as path from 'path';
import * as crypto from 'crypto';

const ROOT = process.cwd();

function sha256_file(filePath: string): string {
    const fileBuffer = fs.readFileSync(filePath);
    const hashSum = crypto.createHash('sha256');
    hashSum.update(fileBuffer);
    return hashSum.digest('hex');
}

function main() {
    const ledgerPath = path.join(ROOT, 'ledger', 'sot.json');
    if (!fs.existsSync(ledgerPath)) {
        console.error('Missing ledger/sot.json');
        process.exit(2);
    }
    
    const sot = JSON.parse(fs.readFileSync(ledgerPath, 'utf-8'));
    const bad: [string, string, string][] = [];
    const entries = sot.sha256 || {};
    
    for (const [rel, expected] of Object.entries(entries)) {
        const filePath = path.join(ROOT, rel);
        if (!fs.existsSync(filePath)) {
            bad.push([rel, 'missing', expected as string]);
            continue;
        }
        
        const got = sha256_file(filePath);
        if (got !== expected) {
            bad.push([rel, got, expected as string]);
        }
    }
    
    if (bad.length > 0) {
        console.error('Ledger verification FAILED:');
        for (const [rel, got, exp] of bad.slice(0, 50)) {
            console.error(`- ${rel}: got ${got} expected ${exp}`);
        }
        process.exit(1);
    }
    
    console.log(`Ledger OK (${Object.keys(entries).length} files)`);
    process.exit(0);
}

main();
