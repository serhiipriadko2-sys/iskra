import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GraphServiceSupabase } from '../../services/graphServiceSupabase';

// Create mock function using vi.hoisted
const mockSupabase = vi.hoisted(() => ({
  from: vi.fn(),
  rpc: vi.fn(),
}));

// Mock Supabase client
vi.mock('../../services/supabaseClient', () => {
  return {
    supabase: mockSupabase,
    getUserId: vi.fn().mockResolvedValue('test-user-id'),
    isSupabaseAvailable: vi.fn().mockResolvedValue(true)
  };
});

describe('GraphServiceSupabase', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('addNode(): creates a node through the RPC boundary and returns a normalized node', async () => {
    const svc = new GraphServiceSupabase();

    const row = {
      id: 'node-1',
      layer: 'archive',
      type: 'event',
      content: 'C',
      timestamp: new Date().toISOString(),
      resonance_score: 0.77,
      metadata: {},
      created_at: new Date('2026-01-01T00:00:00Z').toISOString(),
      updated_at: new Date('2026-01-02T00:00:00Z').toISOString(),
      metrics_snapshot: null,
      related_ids: [],
      user_id: 'test-user-id'
    };

    mockSupabase.rpc.mockResolvedValue({ data: row, error: null });

    const node = await svc.addNode(
      'ARCHIVE', // layer
      'EVENT', // type
      'C', // content
      undefined // metrics
    );

    expect(mockSupabase.from).not.toHaveBeenCalled();
    expect(mockSupabase.rpc).toHaveBeenCalledWith('graph_create_node', expect.objectContaining({
      p_layer: 'archive',
      p_type: 'event',
      p_content: 'C',
      p_related_ids: [],
      p_metadata: {}
    }));

    // Result should normalize layer casing back to enum-like form
    expect(node.id).toBe('node-1');
    expect(node.layer).toBe('ARCHIVE');
    expect(node.type).toBe('event');
  });

  it('addNode(): throws on Supabase RPC error', async () => {
    const svc = new GraphServiceSupabase();

    mockSupabase.rpc.mockResolvedValue({ data: null, error: { message: 'boom' } });

    await expect(
      svc.addNode(
        'ARCHIVE',
        'EVENT',
        'C',
        undefined
      )
    ).rejects.toThrow(/Failed to add node/i);
  });
});
