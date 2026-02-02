import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GraphServiceSupabase } from '../../services/graphServiceSupabase';

// Create mock function using vi.hoisted
const mockSupabase = vi.hoisted(() => ({
  from: vi.fn(),
}));

// We mock the Supabase client module that the service imports.
// Path is relative to this test file.
vi.mock('../../services/supabaseClient', () => {
  return { supabase: mockSupabase };
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
      timestamp: Date.now(),
      resonance_score: 0.77,
      metadata: {},
      created_at: new Date('2026-01-01T00:00:00Z').toISOString(),
      updated_at: new Date('2026-01-02T00:00:00Z').toISOString(),
    };

    const chain = makeInsertChain({ data: row, error: null });
    mockSupabase.from.mockReturnValue(chain);

    const node = await svc.addNode(
      'CORE' as any, // layer
      'FACT' as any, // type
      'C', // content
      undefined, // metrics
      'node-1' // id
    );

    // DB insert payload should use lowercased layer
    expect(mockSupabase.from).toHaveBeenCalledWith('graph_nodes');
    expect(chain.insert).toHaveBeenCalled();
    const payload = chain.insert.mock.calls[0][0];
    expect(payload.layer).toBe('core');
    expect(payload.type).toBe('fact');
    expect(payload.content).toBe('C');

    // Result should normalize layer casing back to enum-like form
    expect(node.id).toBe('node-1');
    expect(node.layer).toBe('CORE');
    expect(node.type).toBe('fact'); // Type is not normalized to uppercase
  });

  it('addNode(): throws on Supabase error', async () => {
    const svc = new GraphServiceSupabase();

    const chain = makeInsertChain({ data: null, error: { message: 'boom' } });
    mockSupabase.from.mockReturnValue(chain);

    await expect(
      svc.addNode(
        'CORE' as any, // layer
        'FACT' as any, // type
        'C', // content
        undefined, // metrics
        'node-err' // id
      )
    ).rejects.toThrow(/Failed to add node/i);
  });
});
