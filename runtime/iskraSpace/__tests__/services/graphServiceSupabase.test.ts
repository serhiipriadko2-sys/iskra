import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GraphServiceSupabase } from '../../services/graphServiceSupabase';

// We mock the Supabase client module that the service imports.
// Path is relative to this test file.
vi.mock('../../services/supabaseClient', () => {
  const mock = {
    from: vi.fn(),
  };
  return { supabase: mock };
});

// eslint-disable-next-line @typescript-eslint/no-var-requires
const { supabase } = require('../../services/supabaseClient');

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
      user_id: 'user-1',
      layer: 'core',
      type: 'FACT',
      title: 'T',
      content: 'C',
      resonance: 0.77,
      tags: ['x'],
      created_at: new Date('2026-01-01T00:00:00Z').toISOString(),
      updated_at: new Date('2026-01-02T00:00:00Z').toISOString(),
      // Optional fields
      source: null,
      state: null,
      decay_rate: null,
    };

    const chain = makeInsertChain({ data: row, error: null });
    supabase.from.mockReturnValue(chain);

    const node = await svc.addNode(
      {
        id: 'node-1',
        layer: 'CORE',
        type: 'FACT',
        title: 'T',
        content: 'C',
        resonance: 0.5, // will be overwritten by computed value
        timestamp: new Date('2026-01-01T00:00:00Z'),
        tags: ['x'],
      } as any,
      'user-1'
    );

    // DB insert payload should use lowercased layer
    expect(supabase.from).toHaveBeenCalledWith('graph_nodes');
    expect(chain.insert).toHaveBeenCalled();
    const payload = chain.insert.mock.calls[0][0];
    expect(payload.user_id).toBe('user-1');
    expect(payload.layer).toBe('core');

    // Result should normalize layer casing back to enum-like form
    expect(node.id).toBe('node-1');
    expect(node.layer).toBe('CORE');
    expect(node.type).toBe('FACT');
    expect(node.resonance).toBeCloseTo(0.77);
    expect(node.tags).toEqual(['x']);
  });

  it('addNode(): throws on Supabase error', async () => {
    const svc = new GraphServiceSupabase();

    const chain = makeInsertChain({ data: null, error: { message: 'boom' } });
    supabase.from.mockReturnValue(chain);

    await expect(
      svc.addNode(
        {
          id: 'node-err',
          layer: 'CORE',
          type: 'FACT',
          title: 'T',
          content: 'C',
          resonance: 0,
          timestamp: new Date(),
          tags: [],
        } as any,
        'user-1'
      )
    ).rejects.toThrow(/Failed to add node/i);
  });
});
