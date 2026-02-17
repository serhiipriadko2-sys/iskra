import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GraphServiceSupabase } from '../../services/graphServiceSupabase';

// Create mock function using vi.hoisted
const mockSupabase = vi.hoisted(() => ({
  from: vi.fn(),
  rpc: vi.fn(),
}));

// Mock Supabase client and getUserId
vi.mock('../../services/supabaseClient', () => {
  return {
    supabase: mockSupabase,
    getUserId: vi.fn().mockResolvedValue('test-user-id'),
    isSupabaseAvailable: vi.fn().mockResolvedValue(true)
  };
});

function makeInsertChain(result: any) {
  const single = vi.fn().mockResolvedValue(result);
  const select = vi.fn().mockReturnValue({ single });
  const insert = vi.fn().mockReturnValue({ select });
  return { insert, select, single };
}

describe('GraphServiceSupabase', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('addNode(): inserts lowercased layer and returns a normalized node', async () => {
    const svc = new GraphServiceSupabase();

    const row = {
      id: 'node-1',
      layer: 'core',
      type: 'fact',
      content: 'C',
      timestamp: new Date().toISOString(),
      resonance_score: 0.77,
      metadata: {},
      created_at: new Date('2026-01-01T00:00:00Z').toISOString(),
      updated_at: new Date('2026-01-02T00:00:00Z').toISOString(),
      metrics_snapshot: null,
      related_ids: []
    };

    const chain = makeInsertChain({ data: row, error: null });
    mockSupabase.from.mockReturnValue(chain);

    const node = await svc.addNode(
      'CORE', // layer
      'FACT', // type
      'C', // content
      undefined // metrics
    );

    // DB insert payload should use lowercased layer
    expect(mockSupabase.from).toHaveBeenCalledWith('graph_nodes');
    expect(chain.insert).toHaveBeenCalled();
    const payload = chain.insert.mock.calls[0][0];
    expect(payload.layer).toBe('core');
    expect(payload.type).toBe('fact');
    expect(payload.content).toBe('C');

    // Check user_id directly if it's already resolved in the payload
    if (payload.user_id instanceof Promise) {
      await expect(payload.user_id).resolves.toBe('test-user-id');
    } else {
      expect(payload.user_id).toBe('test-user-id');
    }

    // Result should normalize layer casing back to enum-like form
    expect(node.id).toBe('node-1');
    expect(node.layer).toBe('CORE');
    expect(node.type).toBe('fact');
  });

  it('addNode(): throws on Supabase error', async () => {
    const svc = new GraphServiceSupabase();

    const chain = makeInsertChain({ data: null, error: { message: 'boom' } });
    mockSupabase.from.mockReturnValue(chain);

    await expect(
      svc.addNode(
        'CORE',
        'FACT',
        'C',
        undefined
      )
    ).rejects.toThrow(/Failed to add node/i);
  });
});
