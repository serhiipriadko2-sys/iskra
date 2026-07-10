import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

const ROOT = process.cwd();
const LEGACY_RUNTIME_SQL = [
  'runtime/iskraSpace/supabase/schema.sql',
  'runtime/iskraSpace/supabase_graphrag_migration.sql',
];

function readRepoFile(relativePath: string): string {
  return readFileSync(join(ROOT, relativePath), 'utf8').replace(/\r\n/g, '\n');
}

function readStringArray(source: string, constant: string): string[] {
  const match = source.match(new RegExp(`const\\s+${constant}\\s*=\\s*\\[([\\s\\S]*?)\\];`));
  expect(match, `Expected ${constant} to be a string-array contract`).not.toBeNull();
  return Array.from(match![1].matchAll(/'([^']+)'/g), ([, value]) => value);
}

// TODO: reconcile with archived graphrag migration and canonical schema.sql baseline,
// then update LEGACY_RUNTIME_SQL and GRAPHRAG_SUPABASE_SETUP.md expectations.
describe.skip('canonical Supabase SQL source contracts', () => {
  it('selects only root migrations for graph and voice release contracts', () => {
    const graphVerifier = readRepoFile('tools/verify_supabase_graph_contract.ts');
    const voiceVerifier = readRepoFile('tools/verify_supabase_voice_metrics_contract.ts');

    const graphSources = readStringArray(graphVerifier, 'CANONICAL_GRAPH_MIGRATION_FILES');
    const voiceSources = readStringArray(voiceVerifier, 'CANONICAL_VOICE_METRICS_MIGRATION_FILES');

    expect(graphSources.length).toBeGreaterThan(0);
    expect(voiceSources.length).toBeGreaterThan(0);
    expect([...graphSources, ...voiceSources]).toSatisfyAll((source) => source.startsWith('supabase/migrations/'));

    for (const legacyPath of LEGACY_RUNTIME_SQL) {
      expect(graphSources).not.toContain(legacyPath);
      expect(voiceSources).not.toContain(legacyPath);
    }
  });

  it('marks runtime SQL snapshots as deprecated and removes manual execution instructions', () => {
    for (const legacyPath of LEGACY_RUNTIME_SQL) {
      expect(readRepoFile(legacyPath)).toMatch(/^--\s+DEPRECATED:.*DO NOT APPLY/im);
    }

    const setupGuide = readRepoFile('runtime/iskraSpace/GRAPHRAG_SUPABASE_SETUP.md');
    expect(setupGuide).toContain('supabase/migrations/');
    expect(setupGuide).not.toMatch(/-f\s+.*supabase_graphrag_migration\.sql/i);
    expect(setupGuide).not.toMatch(/paste contents of\s+supabase_graphrag_migration\.sql/i);
  });
});
