import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

const thisFile = fileURLToPath(import.meta.url);
const migration = readFileSync(
  join(dirname(thisFile), '../../../../supabase/migrations/20260709170000_closed_beta_access_boundary.sql'),
  'utf8',
);

const securityDefinerGraphRpcs = [
  'graph_create_node',
  'graph_create_edge',
  'graph_get_user_nodes',
  'graph_search_nodes',
  'graph_delete_node',
  'graph_update_node_resonance',
  'graph_get_connection_candidates',
  'graph_get_stats',
  'graph_traverse_bfs_nodes',
  'graph_find_resonant_nodes',
  'graph_get_node_with_edges',
];

describe('closed-beta migration Graph RPC boundary', () => {
  it('requires active beta membership inside every authenticated SECURITY DEFINER Graph RPC', () => {
    const marker = '-- Graph RPC closed-beta membership guards';
    const graphGuardSection = migration.slice(migration.indexOf(marker));

    expect(graphGuardSection).toContain(marker);

    for (const rpc of securityDefinerGraphRpcs) {
      expect(graphGuardSection).toMatch(new RegExp(
        `create or replace function public\\.${rpc}\\([\\s\\S]*?private\\.is_active_beta_member\\(\\)`,
      ));
    }
  });
});
