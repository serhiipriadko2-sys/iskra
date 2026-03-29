import * as fs from 'fs';
import * as path from 'path';

/**
 * Iskra Coder vΩ.6 | GitAgent Exporter
 *
 * This script strictly complies to the ADR `adr_gitagent_export.md`.
 * It uses a WhiteList architecture to harvest SoT (ledger) metadata
 * into the public GitAgent format, omitting restricted system specs.
 */

const CORE_DIR = path.join(process.cwd(), 'core');
const MANIFEST_PATH = path.join(process.cwd(), 'packages/core/manifest/voices.json');
const OUT_DIR = path.join(process.cwd(), 'dist/gitagent');

// Security Check Bounds
const STOP_LIST = ['system', 'security.md', 'supabase_', '.env', 'edge_function'];

if (!fs.existsSync(OUT_DIR)) {
  fs.mkdirSync(OUT_DIR, { recursive: true });
}

function safeReadFile(filePath: string): string {
  if (STOP_LIST.some(stop => filePath.includes(stop) || filePath.toLowerCase().includes(stop))) {
     throw new Error(`SECURITY VIOLATION: Tried to read blocked file ${filePath}`);
  }
  if (fs.existsSync(filePath)) {
    return fs.readFileSync(filePath, 'utf-8');
  }
  return '';
}

async function exportGitAgent() {
  console.log('>>> [START] Building Iskra GitAgent Projection...');
  
  // 1. Generate core SOUL.md
  console.log('  -> Compiling SOUL.md from core canon...');
  const mantra = safeReadFile(path.join(CORE_DIR, 'mantra.md'));
  const principles = safeReadFile(path.join(CORE_DIR, 'principles.md'));
  const telos = safeReadFile(path.join(CORE_DIR, 'telos.md'));

  const soulMd = `# ISKRA SOUL | THE CANON
${mantra}

${principles}

${telos}
`;
  fs.writeFileSync(path.join(OUT_DIR, 'SOUL.md'), soulMd);

  // 2. Generate Base Agent YAML
  console.log('  -> Writing Core agent.yaml...');
  const baseAgentYaml = `spec_version: "0.1.0"
name: iskra-core
version: 1.0.0
description: Iskra Core Canon and Governance Agent (Read-only Projection)
compliance:
  risk_tier: high
  supervision:
    human_in_the_loop: always
  segregation_of_duties:
    enforcement: strict
`;
  fs.writeFileSync(path.join(OUT_DIR, 'agent.yaml'), baseAgentYaml);

  // 3. Generate Sub-agents (Voices as Multi-agents)
  console.log('  -> Compiling multi-agent voice structures...');
  const voicesRaw = safeReadFile(MANIFEST_PATH);
  
  if (!voicesRaw) {
    throw new Error('voices.json not found in packages/core/manifest/');
  }
  
  const voices = JSON.parse(voicesRaw);

  for (const voice of voices) {
    const safeVoiceId = voice.id.toLowerCase();
    const dir = path.join(OUT_DIR, 'agents', safeVoiceId);
    fs.mkdirSync(dir, { recursive: true });

    // Extends the core agent to prevent payload bloat (N+1 Config optimization)
    const agentYaml = `extends: ../../agent.yaml
name: ${safeVoiceId}
description: "${voice.description}"
`;
    fs.writeFileSync(path.join(dir, 'agent.yaml'), agentYaml);

    // Provide specific Role borders
    const dutiesMd = `# DUTIES & ARCHETYPE
**Role:** ${voice.archetype}
**Symbol:** ${voice.symbol}
**Telos:** ${voice.telos}

## Formula
\`\`\`text
${voice.formula}
\`\`\`

## Active Threshold Triggers
\`\`\`json
${JSON.stringify(voice.thresholds, null, 2)}
\`\`\`

> *NOTE: Quantum resonance and entropy logic are abstracted by the @iskra/engine runtime and not part of the static projection.*
`;
    fs.writeFileSync(path.join(dir, 'DUTIES.md'), dutiesMd);
  }

  console.log('<<< [SUCCESS] Iskra Canon successfully exported to dist/gitagent/');
}

exportGitAgent().catch(err => {
  console.error('[ERROR]', err.message);
  process.exit(1);
});
