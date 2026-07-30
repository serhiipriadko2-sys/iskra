import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '../../types/supabase';
import {
  parseStagingAcceptanceConfig,
  type StagingAcceptanceConfig,
} from '../../services/stagingAcceptanceConfig';

describe.skipIf(process.env.RUN_STAGING_ACCEPTANCE !== 'true').sequential(
  'S0 magic-link evidence and S1 Graph/RLS isolation',
  () => {
  let config: StagingAcceptanceConfig;
  let userA: SupabaseClient<Database>;
  let userB: SupabaseClient<Database>;
  let admin: SupabaseClient<Database>;
  let userAId = '';
  let userBId = '';
  const suffix = `${Date.now()}-${Math.random().toString(16).slice(2)}`;
  const nodeA = `staging-isolation-a-${suffix}`;
  const nodeA2 = `staging-isolation-a2-${suffix}`;
  const nodeB = `staging-isolation-b-${suffix}`;
  const edgeA = `staging-isolation-edge-a-${suffix}`;

  beforeAll(async () => {
    // Fail-closed preflight must finish before any network client is constructed.
    config = parseStagingAcceptanceConfig();
    const options = (token: string) => ({
      auth: { persistSession: false, autoRefreshToken: false },
      global: { headers: { Authorization: `Bearer ${token}` } },
    });
    userA = createClient<Database>(config.url, config.publishableKey, options(config.userAToken));
    userB = createClient<Database>(config.url, config.publishableKey, options(config.userBToken));
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

    const [profileA, profileB] = await Promise.all([
      userA.from('users').insert({ id: userAId, name: `graph-acceptance-a-${suffix}` }),
      userB.from('users').insert({ id: userBId, name: `graph-acceptance-b-${suffix}` }),
    ]);
    expect(profileA.error).toBeNull();
    expect(profileB.error).toBeNull();

    const [createdA, createdA2, createdB] = await Promise.all([
      userA.rpc('graph_create_node', {
        p_id: nodeA,
        p_layer: 'archive',
        p_type: 'insight',
        p_content: 'staging isolation node A',
      }),
      userA.rpc('graph_create_node', {
        p_id: nodeA2,
        p_layer: 'archive',
        p_type: 'insight',
        p_content: 'staging isolation node A2',
      }),
      userB.rpc('graph_create_node', {
        p_id: nodeB,
        p_layer: 'archive',
        p_type: 'insight',
        p_content: 'staging isolation node B',
      }),
    ]);
    expect(createdA.error).toBeNull();
    expect(createdA2.error).toBeNull();
    expect(createdB.error).toBeNull();

    const createdEdge = await userA.rpc('graph_create_edge', {
      p_id: edgeA,
      p_source: nodeA,
      p_target: nodeA2,
      p_type: 'RELATED_TO',
    });
    expect(createdEdge.error).toBeNull();
  });

  afterAll(async () => {
    if (!userA || !userB) return;
    const cleanup = await Promise.all([
      userA.rpc('graph_delete_node', { p_node_id: nodeA }),
      userA.rpc('graph_delete_node', { p_node_id: nodeA2 }),
      userB.rpc('graph_delete_node', { p_node_id: nodeB }),
    ]);
    expect(cleanup.map(result => result.error), 'Graph cleanup must complete').toEqual([null, null, null]);
    const profiles = await admin.from('users').delete().in('id', [userAId, userBId]);
    expect(profiles.error, 'Profile cleanup must complete').toBeNull();
  });

  it('requires two distinct disposable-principal bootstrap receipts', () => {
    expect(config.allowedOrigin).toBe('http://127.0.0.1:4173');
    expect(config.anonymousDenyReceipt).toMatch(/^[a-f0-9]{64}$/);
    expect(config.principalReceiptA).toMatch(/^[a-f0-9]{64}$/);
    expect(config.principalReceiptB).toMatch(/^[a-f0-9]{64}$/);
    expect(config.principalReceiptA).not.toBe(config.principalReceiptB);
  });

  it('resolves both authenticated users as active beta members', async () => {
    const [accessA, accessB] = await Promise.all([
      userA.rpc('resolve_beta_access'),
      userB.rpc('resolve_beta_access'),
    ]);
    expect(accessA.error).toBeNull();
    expect(accessB.error).toBeNull();
    expect(accessA.data).toMatchObject({ active: true, membership_status: 'active' });
    expect(accessB.data).toMatchObject({ active: true, membership_status: 'active' });
  });

  it('does not read another active member\'s node through Graph RPC', async () => {
    const { data, error } = await userA.rpc('graph_get_user_nodes', { p_node_ids: [nodeB] });
    expect(error).toBeNull();
    expect(data).toEqual([]);
  });

  it('does not update another active member\'s node through Graph RPC', async () => {
    const { data, error } = await userA.rpc('graph_update_node_resonance', {
      p_node_id: nodeB,
      p_metrics_snapshot: { source: 'forbidden' },
      p_resonance_score: 0.99,
    });
    expect(data).toBeNull();
    expect(error?.message ?? '').toMatch(/not found|forbidden|permission|own/i);
  });

  it('does not delete another active member\'s node through Graph RPC', async () => {
    const { error } = await userA.rpc('graph_delete_node', { p_node_id: nodeB });
    expect(error?.message ?? '').toMatch(/not found|forbidden|permission|own/i);
    const ownView = await userB.rpc('graph_get_user_nodes', { p_node_ids: [nodeB] });
    expect(ownView.error).toBeNull();
    expect(ownView.data).toHaveLength(1);
  });

  it('enforces ownership through direct graph table access', async () => {
    const nodeRead = await userB.from('graph_nodes').select('id').eq('id', nodeA);
    expect(nodeRead.error).toBeNull();
    expect(nodeRead.data).toEqual([]);
    const nodeUpdate = await userB
      .from('graph_nodes')
      .update({ content: 'forbidden' })
      .eq('id', nodeA)
      .select('id');
    expect(nodeUpdate.error).toBeNull();
    expect(nodeUpdate.data).toEqual([]);
    const nodeDelete = await userB.from('graph_nodes').delete().eq('id', nodeA).select('id');
    expect(nodeDelete.error).toBeNull();
    expect(nodeDelete.data).toEqual([]);

    const edgeRead = await userB.from('graph_edges').select('id').eq('id', edgeA);
    expect(edgeRead.error).toBeNull();
    expect(edgeRead.data).toEqual([]);
    const edgeUpdate = await userB.from('graph_edges').update({ weight: 0.01 }).eq('id', edgeA).select('id');
    expect(edgeUpdate.error).toBeNull();
    expect(edgeUpdate.data).toEqual([]);
    const edgeDelete = await userB.from('graph_edges').delete().eq('id', edgeA).select('id');
    expect(edgeDelete.error).toBeNull();
    expect(edgeDelete.data).toEqual([]);

    const ownerNodes = await userA.from('graph_nodes').select('id,content').in('id', [nodeA, nodeA2]);
    expect(ownerNodes.error).toBeNull();
    expect(ownerNodes.data).toHaveLength(2);
    const ownerEdge = await userA.from('graph_edges').select('id').eq('id', edgeA).single();
    expect(ownerEdge.error).toBeNull();
    expect(ownerEdge.data?.id).toBe(edgeA);
  });
  },
);
