import { existsSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

const thisFile = fileURLToPath(import.meta.url);
const migrationPath = join(
  dirname(thisFile),
  '../../../../supabase/migrations/20260710110000_graph_shared_row_guard.sql',
);

const migration = existsSync(migrationPath)
  ? readFileSync(migrationPath, 'utf8')
  : '';

function functionBody(name: string): string {
  const start = migration.indexOf(`create or replace function public.${name}(`);
  const next = migration.indexOf('\ncreate or replace function public.', start + 1);

  return migration.slice(start, next === -1 ? migration.length : next);
}

describe('graph shared-row guard migration', () => {
  it('keeps shared graph rows read-only across every mutating Graph RPC', () => {
    expect(existsSync(migrationPath)).toBe(true);

    const createNode = functionBody('graph_create_node');
    const createEdge = functionBody('graph_create_edge');
    const deleteNode = functionBody('graph_delete_node');
    const updateNode = functionBody('graph_update_node_resonance');

    for (const body of [createNode, createEdge, deleteNode, updateNode]) {
      expect(body).toContain('private.is_active_beta_member()');
      expect(body).toContain('set search_path = public, pg_temp');
      expect(body).toMatch(/v_uid uuid := auth\.uid\(\)/);
    }

    expect(createNode).toMatch(/insert into public\.graph_nodes[\s\S]*?\) values \([\s\S]*?v_uid\s*\)/);
    expect(createNode).not.toMatch(/graph_nodes\.user_id\s+is\s+null/i);

    const edgeConflictUpdate = createEdge.match(
      /on conflict \(source, target, type\) do update[\s\S]*?returning \* into v_row;/i,
    )?.[0] ?? '';
    expect(edgeConflictUpdate).toMatch(/where public\.graph_edges\.user_id = v_uid/i);
    expect(edgeConflictUpdate).not.toMatch(/or\s+public\.graph_edges\.user_id\s+is\s+null/i);

    const deleteStatement = deleteNode.match(/delete from public\.graph_nodes[\s\S]*?;/i)?.[0] ?? '';
    expect(deleteStatement).toMatch(/node\.user_id = v_uid/i);
    expect(deleteStatement).not.toMatch(/or\s+node\.user_id\s+is\s+null/i);

    const updateStatement = updateNode.match(/update public\.graph_nodes[\s\S]*?returning \* into v_row;/i)?.[0] ?? '';
    expect(updateStatement).toMatch(/node\.user_id = v_uid/i);
    expect(updateStatement).not.toMatch(/or\s+node\.user_id\s+is\s+null/i);
  });

  it('preserves shared-row visibility while making direct graph writes owner-only', () => {
    expect(migration).toMatch(
      /create policy graph_nodes_active_beta_read_visible[\s\S]*?for select[\s\S]*?user_id is null/i,
    );
    expect(migration).toMatch(
      /create policy graph_edges_active_beta_read_visible[\s\S]*?for select[\s\S]*?user_id is null/i,
    );

    for (const table of ['graph_nodes', 'graph_edges']) {
      for (const operation of ['insert', 'update', 'delete']) {
        const statement = migration.match(
          new RegExp(
            `create policy ${table}_active_beta_${operation}_own[\\s\\S]*?;`,
            'i',
          ),
        )?.[0] ?? '';

        expect(statement).toContain('private.is_active_beta_member()');
        expect(statement).toMatch(/user_id = \(select auth\.uid\(\)\)/i);
        expect(statement).not.toMatch(/\bor\s+user_id\s+is\s+null/i);
      }
    }
  });

  it('blocks an owned-node delete from cascading into a shared or foreign edge', () => {
    expect(migration).toMatch(
      /create or replace function public\.prevent_graph_node_cross_owner_cascade\(\)[\s\S]*?security definer[\s\S]*?set search_path = public, pg_temp/i,
    );
    expect(migration).toMatch(
      /edge\.user_id is distinct from v_uid[\s\S]*?graph node deletion would cascade into a non-owned edge/i,
    );
    expect(migration).toMatch(
      /create trigger graph_nodes_block_cross_owner_cascade[\s\S]*?before delete on public\.graph_nodes/i,
    );
  });

  it('allows direct edge writes only when both endpoints are visible to the caller', () => {
    for (const operation of ['insert', 'update']) {
      const statement = migration.match(
        new RegExp(
          `create policy graph_edges_active_beta_${operation}_own[\\s\\S]*?;`,
          'i',
        ),
      )?.[0] ?? '';

      expect(statement).toMatch(
        /exists \([\s\S]*?from public\.graph_nodes source_node[\s\S]*?source_node\.id = source/i,
      );
      expect(statement).toMatch(
        /exists \([\s\S]*?from public\.graph_nodes target_node[\s\S]*?target_node\.id = target/i,
      );
      expect(statement).not.toMatch(/source_node\.user_id = \(select auth\.uid\(\)\)\s+or\s+source_node\.user_id is null\s+or/i);
      expect(statement).not.toMatch(/target_node\.user_id = \(select auth\.uid\(\)\)\s+or\s+target_node\.user_id is null\s+or/i);
    }
  });
});
