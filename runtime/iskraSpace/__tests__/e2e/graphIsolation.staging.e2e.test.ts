import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '../../types/supabase';

const url = process.env.VITE_SUPABASE_URL ?? '';
const anonKey = process.env.VITE_SUPABASE_ANON_KEY ?? '';
const userAToken = process.env.ISKRA_STAGING_USER_A_JWT ?? '';
const userBToken = process.env.ISKRA_STAGING_USER_B_JWT ?? '';
const enabled =
  process.env.RUN_STAGING_GRAPH_ISOLATION === 'true' &&
  Boolean(url && anonKey && userAToken && userBToken);

describe.skipIf(!enabled)('staging Graph RPC two-user isolation', () => {
  let userA: SupabaseClient<Database>;
  let userB: SupabaseClient<Database>;
  const nodeA = `staging-isolation-a-${Date.now()}`;
  const nodeB = `staging-isolation-b-${Date.now()}`;

  beforeAll(async () => {
    userA = createClient<Database>(url, anonKey, {
      global: { headers: { Authorization: `Bearer ${userAToken}` } },
    });
    userB = createClient<Database>(url, anonKey, {
      global: { headers: { Authorization: `Bearer ${userBToken}` } },
    });

    const [createdA, createdB] = await Promise.all([
      userA.rpc('graph_create_node', {
        p_id: nodeA,
        p_layer: 'archive',
        p_type: 'insight',
        p_content: 'staging isolation node A',
      }),
      userB.rpc('graph_create_node', {
        p_id: nodeB,
        p_layer: 'archive',
        p_type: 'insight',
        p_content: 'staging isolation node B',
      }),
    ]);

    expect(createdA.error).toBeNull();
    expect(createdB.error).toBeNull();
  });

  afterAll(async () => {
    await Promise.all([
      userA.rpc('graph_delete_node', { p_node_id: nodeA }),
      userB.rpc('graph_delete_node', { p_node_id: nodeB }),
    ]);
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
    const { data: ownView, error: ownViewError } = await userB.rpc('graph_get_user_nodes', {
      p_node_ids: [nodeB],
    });
    expect(ownViewError).toBeNull();
    expect(ownView).toHaveLength(1);
  });
});
