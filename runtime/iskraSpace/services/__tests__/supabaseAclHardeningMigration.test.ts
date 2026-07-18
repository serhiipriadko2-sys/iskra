import { existsSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

const thisFile = fileURLToPath(import.meta.url);
const migrationPath = join(
  dirname(thisFile),
  '../../../../supabase/migrations/20260717183002_supabase_acl_and_graph_contract_hardening.sql',
);
const migration = existsSync(migrationPath) ? readFileSync(migrationPath, 'utf8') : '';

describe('Supabase ACL hardening migration', () => {
  it('removes anon execution without removing authenticated closed-beta paths', () => {
    expect(migration).toContain('revoke execute on function public.consume_ai_quota(text) from anon;');
    expect(migration).toContain('revoke execute on function public.resolve_beta_access() from anon;');
    expect(migration).toContain(
      'revoke execute on function public.prevent_graph_node_cross_owner_cascade() from anon;',
    );
    expect(migration).toContain('grant execute on function public.consume_ai_quota(text) to authenticated;');
    expect(migration).toContain('grant execute on function public.resolve_beta_access() to authenticated;');
  });

  it('preserves Graph SECURITY DEFINER RPC review and disables only schema introspection', () => {
    expect(migration).toContain("comment on schema public is e'@graphql({\"introspection\": false})';");
    expect(migration).toContain('Graph RPC EXECUTE grants remain unchanged');
    expect(migration).not.toMatch(/revoke\s+all\s+on\s+table\s+public\.(graph_nodes|graph_edges)/i);
  });

  it('pins mutable helper functions to a safe schema search path', () => {
    expect(migration).toContain(
      'alter function iskra_memory.iskra_payload_has_secret(jsonb) set search_path = pg_catalog, iskra_memory;',
    );
    expect(migration).toContain(
      'alter function iskra_memory.iskra_assert_safe_payload(jsonb) set search_path = pg_catalog, iskra_memory;',
    );
  });
});
