import { beforeEach, describe, expect, it, vi } from 'vitest';

const isSupabaseAvailableMock = vi.hoisted(() => vi.fn());
const ensureSupabaseSessionMock = vi.hoisted(() => vi.fn());
const getLegacyDeviceIdMock = vi.hoisted(() => vi.fn());
const addChatMessageMock = vi.hoisted(() => vi.fn());
const addNodeMock = vi.hoisted(() => vi.fn());
const buildConnectionsMock = vi.hoisted(() => vi.fn());

vi.mock('../supabaseClient', () => ({
  isSupabaseAvailable: isSupabaseAvailableMock,
  ensureSupabaseSession: ensureSupabaseSessionMock,
  getLegacyDeviceId: getLegacyDeviceIdMock,
}));

vi.mock('../supabaseService', () => ({
  supabaseService: {
    addChatMessage: addChatMessageMock,
  },
}));

vi.mock('../graphServiceSupabase', () => ({
  graphServiceSupabase: {
    addNode: addNodeMock,
    buildConnections: buildConnectionsMock,
  },
}));

import { SyncService } from '../syncService';

describe('SyncService identity migration boundary', () => {
  beforeEach(() => {
    localStorage.clear();
    isSupabaseAvailableMock.mockReset().mockResolvedValue(true);
    ensureSupabaseSessionMock.mockReset().mockResolvedValue('auth-user-id');
    getLegacyDeviceIdMock.mockReset().mockReturnValue('legacy-device-id');
    addChatMessageMock.mockReset().mockResolvedValue(undefined);
    addNodeMock.mockReset().mockResolvedValue({ id: 'node-1' });
    buildConnectionsMock.mockReset().mockResolvedValue(undefined);
  });

  it('syncs authenticated and legacy chat queues through the current Supabase session path', async () => {
    const authMessage = { role: 'user', text: 'new authenticated queue' };
    const legacyMessage = { role: 'model', text: 'legacy offline queue' };
    localStorage.setItem('chat_history_auth-user-id', JSON.stringify([authMessage]));
    localStorage.setItem('chat_history_legacy-device-id', JSON.stringify([legacyMessage]));

    await new SyncService().syncAllPending();

    expect(ensureSupabaseSessionMock).toHaveBeenCalled();
    expect(getLegacyDeviceIdMock).toHaveBeenCalled();
    expect(addChatMessageMock).toHaveBeenCalledTimes(2);
    expect(addChatMessageMock).toHaveBeenNthCalledWith(1, authMessage);
    expect(addChatMessageMock).toHaveBeenNthCalledWith(2, legacyMessage);
  });

  it('uses legacy memory queues only as migration provenance', async () => {
    localStorage.setItem('memory_archive_legacy-device-id', JSON.stringify([
      { layer: 'archive', type: 'insight', content: { note: 'old local node' } },
    ]));

    await new SyncService().syncAllPending();

    expect(addNodeMock).toHaveBeenCalledWith('archive', 'insight', '{"note":"old local node"}');
    expect(buildConnectionsMock).toHaveBeenCalledWith('node-1');
  });
});
