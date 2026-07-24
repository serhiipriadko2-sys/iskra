import { existsSync, readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

const thisFile = fileURLToPath(import.meta.url);
const migrationPath = join(
  dirname(thisFile),
  '../../../../supabase/migrations/20260718191950_supabase_acl_and_graph_contract_hardening.sql',
);
const migration = existsSync(migrationPath) ? readFileSync(migrationPath, 'utf8') : '';
const triggerAclMigrationPath = join(
  dirname(thisFile),
  '../../../../supabase/migrations/20260718200634_restore_closed_beta_graph_acl.sql',
);
const triggerAclMigration = existsSync(triggerAclMigrationPath)
  ? readFileSync(triggerAclMigrationPath, 'utf8')
  : '';
const initplanMigrationPath = join(
  dirname(thisFile),
  '../../../../supabase/migrations/20260718194551_optimize_rls_initplan.sql',
);
const initplanMigration = existsSync(initplanMigrationPath)
  ? readFileSync(initplanMigrationPath, 'utf8')
  : '';
const provenanceMigrations = [
  {
    path: '../../../../supabase/migrations/20260718194551_optimize_rls_initplan.sql',
    liveSha256: '1b773fdd0ec82486754cceccacf15dc5c1f882b8d9a2a98ffb9939cf4af145ef',
    replayGuard: 'if exists (',
  },
  {
    path: '../../../../supabase/migrations/20260718194835_consolidate_rls_policies.sql',
    liveSha256: 'b292eb3a2652089ada35d787ef8a2d93568535dab91199941dd54eedd17860a1',
    replayGuard: null,
  },
] as const;

describe('Supabase ACL hardening migration', () => {
  it('matches the normalized SQL body already recorded by production', () => {
    const normalizedBody = migration
      .split(/\r?\n/)
      .filter(line => !/^\s*--/.test(line) && !/^\s*(begin|commit);\s*$/i.test(line))
      .join('\n')
      .trim()
      .replace(/(\n\s*){3,}/g, '\n\n');
    expect(normalizedBody).toHaveLength(646);
    expect(createHash('sha256').update(normalizedBody).digest('hex')).toBe(
      '22a205c44f7d0dad10305be099647ac6a8577a91343f49740f19ac2d6184b246',
    );
  });

  it('preserves PR #275 provenance while making its drift-dependent migration replay-safe', () => {
    for (const receipt of provenanceMigrations) {
      const path = join(dirname(thisFile), receipt.path);
      expect(existsSync(path), path).toBe(true);
      const body = readFileSync(path, 'utf8').replace(/\r\n/g, '\n');
      if (receipt.replayGuard) {
        expect(body, path).toContain(receipt.replayGuard);
        expect(body, path).toContain(receipt.liveSha256);
      } else {
        expect(createHash('sha256').update(body).digest('hex'), path).toBe(receipt.liveSha256);
      }
    }

    expect(
      existsSync(join(dirname(thisFile), '../../../../supabase/migrations/20260718000000_optimize_rls_initplan.sql')),
    ).toBe(false);
    expect(
      existsSync(join(dirname(thisFile), '../../../../supabase/migrations/20260718000001_consolidate_rls_policies.sql')),
    ).toBe(false);
  });

  it('guards the two legacy Graph policies that are absent on a clean replay', () => {
    for (const [table, policy] of [
      ['graph_nodes', 'Users can manage own graph nodes (secure)'],
      ['graph_edges', 'Users can manage own graph edges (secure)'],
    ] as const) {
      const guardedAlter = new RegExp(
        String.raw`if exists \([\s\S]*tablename = '${table}'[\s\S]*policyname = '${policy.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}'[\s\S]*\) then[\s\S]*execute 'alter policy`,
        'i',
      );
      expect(initplanMigration, `${table}.${policy}`).toMatch(guardedAlter);
    }

    expect(initplanMigration).not.toMatch(
      /begin;\s*alter policy "Users can manage own graph (?:nodes|edges) \(secure\)"/i,
    );
  });

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

  it('restores the closed-beta Graph boundary in one forward migration', () => {
    expect(triggerAclMigration).toContain(
      'revoke all on function public.prevent_graph_node_cross_owner_cascade()',
    );
    expect(triggerAclMigration).toMatch(/from public, anon, authenticated, service_role;/i);
    expect(triggerAclMigration).not.toMatch(/grant\s+execute/i);
    expect(triggerAclMigration).toContain('drop policy if exists graph_nodes_read_public');
    expect(triggerAclMigration).toContain('drop policy if exists graph_edges_read_public');
    expect(triggerAclMigration).toMatch(
      /create policy graph_nodes_active_beta_read_visible[\s\S]*for select to authenticated/i,
    );
    expect(triggerAclMigration).toMatch(
      /create policy graph_edges_active_beta_read_visible[\s\S]*for select to authenticated/i,
    );
    expect(triggerAclMigration).not.toMatch(/for select to (?:public|anon)/i);
    expect(triggerAclMigration).toContain('and exists (');
    expect(triggerAclMigration).toContain('alter policy users_select_own');
    expect(triggerAclMigration).toContain('alter policy audit_log_insert_own');
  });
});
