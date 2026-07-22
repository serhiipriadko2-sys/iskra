import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { randomUUID } from 'node:crypto';
import type { Database } from '../../types/supabase';
import {
  parseStagingAcceptanceConfig,
  type StagingAcceptanceConfig,
} from '../../services/stagingAcceptanceConfig';

type FixtureTable =
  | 'metrics_snapshots'
  | 'memory_nodes'
  | 'journal_entries'
  | 'tasks'
  | 'habits'
  | 'voice_preferences'
  | 'chat_history';

type Fixture = {
  table: FixtureTable;
  buildRow: (id: string, userId: string) => Record<string, unknown>;
  forbiddenUpdate: Record<string, unknown>;
};

describe.skipIf(process.env.RUN_STAGING_ACCEPTANCE !== 'true').sequential(
  'S1 staging direct-table RLS isolation',
  () => {
  let config: StagingAcceptanceConfig;
  let userA: SupabaseClient<Database>;
  let userB: SupabaseClient<Database>;
  let nonMember: SupabaseClient<Database>;
  let suspendedMember: SupabaseClient<Database>;
  let anonymous: SupabaseClient<Database>;
  let admin: SupabaseClient<Database>;
  let userAId = '';
  let userBId = '';
  const runId = `${Date.now()}-${Math.random().toString(16).slice(2)}`;
  const created: Array<{ table: FixtureTable | 'audit_log'; id: string }> = [];

  beforeAll(async () => {
    config = parseStagingAcceptanceConfig();
    const clientOptions = (token: string) => ({
      auth: { persistSession: false, autoRefreshToken: false },
      global: { headers: { Authorization: `Bearer ${token}` } },
    });
    userA = createClient<Database>(config.url, config.publishableKey, clientOptions(config.userAToken));
    userB = createClient<Database>(config.url, config.publishableKey, clientOptions(config.userBToken));
    nonMember = createClient<Database>(config.url, config.publishableKey, clientOptions(config.nonMemberToken));
    suspendedMember = createClient<Database>(
      config.url,
      config.publishableKey,
      clientOptions(config.suspendedMemberToken),
    );
    anonymous = createClient<Database>(config.url, config.publishableKey, clientOptions(config.anonymousToken));
    admin = createClient<Database>(config.url, config.serviceRoleKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });

    const [identityA, identityB] = await Promise.all([
      userA.auth.getUser(config.userAToken),
      userB.auth.getUser(config.userBToken),
    ]);
    expect(identityA.error).toBeNull();
    expect(identityB.error).toBeNull();
    userAId = identityA.data.user?.id ?? '';
    userBId = identityB.data.user?.id ?? '';
    expect(userAId).toMatch(/^[0-9a-f-]{36}$/i);
    expect(userBId).toMatch(/^[0-9a-f-]{36}$/i);
    expect(userAId).not.toBe(userBId);

    // A duplicate row means these are not clean disposable acceptance users.
    const [profileA, profileB] = await Promise.all([
      userA.from('users').insert({ id: userAId, name: `acceptance-a-${runId}` }),
      userB.from('users').insert({ id: userBId, name: `acceptance-b-${runId}` }),
    ]);
    expect(profileA.error).toBeNull();
    expect(profileB.error).toBeNull();
  });

  it('denies non-member, suspended, and anonymous sessions across resolver, Graph RPC, and tables', async () => {
    const [nonMemberAccess, suspendedAccess, anonymousAccess] = await Promise.all([
      nonMember.rpc('resolve_beta_access'),
      suspendedMember.rpc('resolve_beta_access'),
      anonymous.rpc('resolve_beta_access'),
    ]);
    expect(nonMemberAccess.error).toBeNull();
    expect(nonMemberAccess.data).toMatchObject({ active: false });
    expect(suspendedAccess.error).toBeNull();
    expect(suspendedAccess.data).toMatchObject({ active: false, membership_status: 'suspended' });
    if (anonymousAccess.error) {
      expect(anonymousAccess.data).toBeNull();
    } else {
      expect(anonymousAccess.data).toMatchObject({ active: false });
    }

    for (const client of [nonMember, suspendedMember, anonymous]) {
      const graph = await client.rpc('graph_get_user_nodes', { p_limit_count: 1 });
      expect(graph.data).toBeNull();
      expect(graph.error).not.toBeNull();

      for (const table of [
        'users',
        'metrics_snapshots',
        'memory_nodes',
        'journal_entries',
        'tasks',
        'habits',
        'voice_preferences',
        'chat_history',
        'audit_log',
        'graph_nodes',
        'graph_edges',
      ] as const) {
        const read = await client.from(table).select('*').limit(1);
        expect(read.data ?? [], `${table} must not expose rows`).toEqual([]);
      }
    }
  });

  afterAll(async () => {
    if (!admin || !userAId || !userBId) return;
    const cleanupErrors: string[] = [];
    for (const item of [...created].reverse()) {
      const result = await admin.from(item.table).delete().eq('id', item.id);
      if (result.error) cleanupErrors.push(`${item.table}:${result.error.message}`);
    }
    const profiles = await admin.from('users').delete().in('id', [userAId, userBId]);
    if (profiles.error) cleanupErrors.push(`users:${profiles.error.message}`);
    expect(cleanupErrors, 'service-role cleanup must complete').toEqual([]);
  });

  it('prevents profile read, update, and delete across users', async () => {
    const read = await userB.from('users').select('id,name').eq('id', userAId);
    expect(read.error).toBeNull();
    expect(read.data).toEqual([]);

    const update = await userB.from('users').update({ name: 'forbidden' }).eq('id', userAId).select('id');
    expect(update.error).toBeNull();
    expect(update.data).toEqual([]);

    const deletion = await userB.from('users').delete().eq('id', userAId).select('id');
    expect(deletion.data ?? []).toEqual([]);
    const ownerView = await userA.from('users').select('name').eq('id', userAId).single();
    expect(ownerView.error).toBeNull();
    expect(ownerView.data?.name).toBe(`acceptance-a-${runId}`);
  });

  const fixtureCases: Fixture[] = [
    {
      table: 'metrics_snapshots',
      buildRow: (id, userId) => ({ id, user_id: userId, phase: 'acceptance-original' }),
      forbiddenUpdate: { phase: 'forbidden' },
    },
    {
      table: 'memory_nodes',
      buildRow: (id, userId) => ({ id, user_id: userId, title: 'acceptance-original' }),
      forbiddenUpdate: { title: 'forbidden' },
    },
    {
      table: 'journal_entries',
      buildRow: (id, userId) => ({ id, user_id: userId, text: 'acceptance fixture' }),
      forbiddenUpdate: { text: 'forbidden' },
    },
    {
      table: 'tasks',
      buildRow: (id, userId) => ({ id, user_id: userId, title: 'acceptance-original' }),
      forbiddenUpdate: { title: 'forbidden' },
    },
    {
      table: 'habits',
      buildRow: (id, userId) => ({ id, user_id: userId, title: 'acceptance-original' }),
      forbiddenUpdate: { title: 'forbidden' },
    },
    {
      table: 'voice_preferences',
      buildRow: (id, userId) => ({ id, user_id: userId, voice_name: 'ISKRA' }),
      forbiddenUpdate: { voice_name: 'forbidden' },
    },
    {
      table: 'chat_history',
      buildRow: (id, userId) => ({ id, user_id: userId, role: 'user', text: 'acceptance fixture' }),
      forbiddenUpdate: { text: 'forbidden' },
    },
  ];

  it.each(fixtureCases)('$table rejects cross-user read, update, and delete', async fixture => {
    const id = randomUUID();
    const insert = await userA.from(fixture.table).insert(fixture.buildRow(id, userAId) as never);
    expect(insert.error).toBeNull();
    created.push({ table: fixture.table, id });

    const read = await userB.from(fixture.table).select('id').eq('id', id);
    expect(read.error).toBeNull();
    expect(read.data).toEqual([]);

    const update = await userB
      .from(fixture.table)
      .update(fixture.forbiddenUpdate as never)
      .eq('id', id)
      .select('id');
    expect(update.error).toBeNull();
    expect(update.data).toEqual([]);

    const deletion = await userB.from(fixture.table).delete().eq('id', id).select('id');
    expect(deletion.error).toBeNull();
    expect(deletion.data).toEqual([]);

    const ownerView = await userA.from(fixture.table).select('id').eq('id', id).single();
    expect(ownerView.error).toBeNull();
    expect(ownerView.data?.id).toBe(id);
  });

  it('keeps audit_log append-only and owner-isolated', async () => {
    const id = randomUUID();
    const insert = await userA.from('audit_log').insert({ id, user_id: userAId, action: 'staging_acceptance' });
    expect(insert.error).toBeNull();
    created.push({ table: 'audit_log', id });

    const foreignRead = await userB.from('audit_log').select('id').eq('id', id);
    expect(foreignRead.error).toBeNull();
    expect(foreignRead.data).toEqual([]);

    const ownerUpdate = await userA.from('audit_log').update({ action: 'forbidden' }).eq('id', id).select('id');
    expect(ownerUpdate.data ?? []).toEqual([]);
    const ownerDelete = await userA.from('audit_log').delete().eq('id', id).select('id');
    expect(ownerDelete.data ?? []).toEqual([]);

    const ownerView = await userA.from('audit_log').select('action').eq('id', id).single();
    expect(ownerView.error).toBeNull();
    expect(ownerView.data?.action).toBe('staging_acceptance');
  });
  },
);
