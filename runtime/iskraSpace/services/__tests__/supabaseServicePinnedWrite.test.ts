import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  defaultFrom: vi.fn(),
  getUserId: vi.fn(),
}));

vi.mock('../supabaseClient', () => ({
  supabase: { from: mocks.defaultFrom },
  getUserId: mocks.getUserId,
  isSupabaseAvailable: vi.fn(),
}));

import { addChatMessage } from '../supabaseService';

describe('supabaseService pinned chat writes', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('writes through the pinned client and explicit principal only', async () => {
    const insert = vi.fn().mockResolvedValue({ error: null });
    const pinnedFrom = vi.fn(() => ({ insert }));
    const pinnedClient = { from: pinnedFrom };

    await expect(addChatMessage(
      { role: 'user', text: 'principal A message' },
      {
        queueOnFailure: false,
        client: pinnedClient as never,
        expectedUserId: 'principal-a',
      },
    )).resolves.toBe(true);

    expect(mocks.getUserId).not.toHaveBeenCalled();
    expect(mocks.defaultFrom).not.toHaveBeenCalled();
    expect(pinnedFrom).toHaveBeenCalledWith('chat_history');
    expect(insert).toHaveBeenCalledWith(expect.objectContaining({
      user_id: 'principal-a',
      role: 'user',
      text: 'principal A message',
    }));
  });

  it('rejects a partially specified pinning boundary', async () => {
    await expect(addChatMessage(
      { role: 'user', text: 'must not write' },
      { client: { from: vi.fn() } as never },
    )).rejects.toThrow('require both client and expectedUserId');

    expect(mocks.getUserId).not.toHaveBeenCalled();
    expect(mocks.defaultFrom).not.toHaveBeenCalled();
  });
});
