import * as fs from 'fs';
import * as path from 'path';

/**
 * Iskra Coder vΩ.6 | Security Regression Test
 * Enforces boundaries to ensure protected SoT (System/Edge logic) does not leak.
 */

const outDir = path.join(process.cwd(), 'dist/gitagent');

function verifySecurity() {
  console.log('>>> [TEST] Running Security Assertions on GitAgent export...');

  if (!fs.existsSync(outDir)) {
    throw new Error('Output directory dist/gitagent missing. Did you run the exporter?');
  }

  function walk(dir: string): string[] {
    let results: string[] = [];
    const list = fs.readdirSync(dir);
    list.forEach(file => {
      file = path.join(dir, file);
      const stat = fs.statSync(file);
      if (stat && stat.isDirectory()) {
         results = results.concat(walk(file));
      } else {
         results.push(file);
      }
    });
    return results;
  }

  const files = walk(outDir);
  let checked = 0;

  for (const file of files) {
    const content = fs.readFileSync(file, 'utf-8');
    
    // 1. Leak Assertions
    if (content.match(/gemini_api_key/i) || content.match(/VITE_SUPABASE_ANON_KEY/i)) {
      throw new Error(`[FAIL] SECURITY REGRESSION: Found potential token in ${file}`);
    }
    
    // 2. Path Assertions
    if (file.toLowerCase().includes('security.md')) {
      throw new Error(`[FAIL] SECURITY REGRESSION: Protected Security file leaked into output!`);
    }

    checked++;
  }
  
  // 3. Structure Validations
  if (!fs.existsSync(path.join(outDir, 'agent.yaml')) || !fs.existsSync(path.join(outDir, 'SOUL.md'))) {
     throw new Error('[FAIL] Base GitAgent manifests are missing!');
  }
  
  if (!fs.existsSync(path.join(outDir, 'agents/iskra/agent.yaml'))) {
     throw new Error('[FAIL] Multi-agent voice (ISKRA) is missing!');
  }

  console.log(`<<< [PASS] Security Assertions Passed. Checked ${checked} exported files.`);
}

try {
  verifySecurity();
} catch(err: any) {
  console.error(err.message);
  process.exit(1);
}
