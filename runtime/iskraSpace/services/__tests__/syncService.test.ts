import { beforeEach, describe, expect, it, vi } from 'vitest';

const isSupabaseAvailableMock = vi.hoisted(() => vi.fn());
const ensureSupabaseSessionMock = vi.hoisted(() => vi.fn());
const getLegacyDeviceIdMock = vi.hoisted(() => vi.fn());
const addChatMessageMock = vi.hoisted(() => vi.fn());
const addNodeMock = vi.hoisted(() => vi.fn());
const buildConnectionsMock = vi.hoisted(() => vi.fn());

const storage = new Map<string, string>();
const nodeLocalStorage: Storage = {
  clear: () => storage.clear(),
  getItem: (key: string) => storage.get(key) ?? null,
  key: (index: number) => Array.from(storage.keys())[index] ?? null,
  removeItem: (key: string) => {
    storage.delete(key);
  },
  setItem: (key: string, value: string) => {
    storage.set(key, String(value));
  },
  get length() {
    return storage.size;
  },
};

function ensureLocalStorage(): void {
  if (typeof globalThis.localStorage === 'undefined') {
    Object.defineProperty(globalThis, 'localStorage', {
      configurable: true,
      value: nodeLocalStorage,
    });
  }

  if (typeof window === 'undefined') {
    Object.defineProperty(globalThis, 'window', {
      configurable: true,
      value: {
        addEventListener: vi.fn(),
        localStorage: globalThis.localStorage,
      },
    });
  }
}

function deferred<T>() {
  let resolve!: (value: T) => void;
  const promise = new Promise<T>((resolvePromise) => {
    resolve = resolvePromise;
  });
  return { promise, resolve };
}

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
import { principalStorage } from '../principalStorage';

describe('SyncService identity migration boundary', () => {
  beforeEach(() => {
    ensureLocalStorage();
    localStorage.clear();
    isSupabaseAvailableMock.mockReset().mockResolvedValue(true);
    ensureSupabaseSessionMock.mockReset().mockResolvedValue('auth-user-id');
    getLegacyDeviceIdMock.mockReset().mockReturnValue('legacy-device-id');
    addChatMessageMock.mockReset().mockResolvedValue(undefined);
    addNodeMock.mockReset().mockResolvedValue({ id: 'node-1' });
    buildConnectionsMock.mockReset().mockResolvedValue(undefined);
    principalStorage.bind('auth-user-id');
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
    expect(localStorage.getItem('memory_archive_legacy-device-id')).toBeNull();
  });

  it('syncs current app-local memory stores and marks nodes as synced', async () => {
    const archiveNode = {
      id: 'arc-1',
      layer: 'archive',
      type: 'insight',
      content: { note: 'new archive node' },
      title: 'Archive Node',
      timestamp: new Date().toISOString(),
      evidence: [{ source: 'test', inference: 'test', fact: 'true' as const, trace: 'test' }],
      synced_to_cloud: false,
    };
    const shadowNode = {
      id: 'shd-1',
      layer: 'shadow',
      type: 'event',
      content: 'shadow note',
      title: 'Shadow Node',
      timestamp: new Date().toISOString(),
      evidence: [{ source: 'test', inference: 'test', fact: 'true' as const, trace: 'test' }],
      synced_to_cloud: false,
    };
    principalStorage.setItem('iskra-space-archive', JSON.stringify([archiveNode]));
    principalStorage.setItem('iskra-space-shadow', JSON.stringify([shadowNode]));

    await new SyncService().syncAllPending();

    expect(addNodeMock).toHaveBeenCalledWith('archive', 'insight', '{"note":"new archive node"}');
    expect(addNodeMock).toHaveBeenCalledWith('shadow', 'event', 'shadow note');
    expect(buildConnectionsMock).toHaveBeenCalledTimes(2);

    const syncedArchive = JSON.parse(principalStorage.getItem('iskra-space-archive') ?? '[]');
    const syncedShadow = JSON.parse(principalStorage.getItem('iskra-space-shadow') ?? '[]');
    expect(syncedArchive[0].synced_to_cloud).toBe(true);
    expect(syncedShadow[0].synced_to_cloud).toBe(true);
  });

  it('skips already-synced nodes in app-local memory stores', async () => {
    const archiveNode = {
      id: 'arc-2',
      layer: 'archive',
      type: 'insight',
      content: { note: 'already synced' },
      title: 'Synced Node',
      timestamp: new Date().toISOString(),
      evidence: [{ source: 'test', inference: 'test', fact: 'true' as const, trace: 'test' }],
      synced_to_cloud: true,
    };
    principalStorage.setItem('iskra-space-archive', JSON.stringify([archiveNode]));

    await new SyncService().syncAllPending();

    expect(addNodeMock).not.toHaveBeenCalled();
  });

  it('fails closed when the bound local principal differs from the authenticated session', async () => {
    principalStorage.bind('different-principal');
    principalStorage.setItem('iskra-space-archive', JSON.stringify([{
      id: 'arc-private',
      layer: 'archive',
      type: 'insight',
      content: 'must not sync',
      title: 'Private',
      timestamp: new Date().toISOString(),
      evidence: [],
      synced_to_cloud: false,
    }]));

    await new SyncService().syncAllPending();

    expect(addNodeMock).not.toHaveBeenCalled();
    expect(principalStorage.getItem('iskra-space-archive')).not.toBeNull();
  });

  it('does not write principal A memory into principal B when auth changes during upload', async () => {
    const pendingUpload = deferred<{ id: string }>();
    addNodeMock.mockImplementationOnce(() => pendingUpload.promise);
    principalStorage.setItem('iskra-space-archive', JSON.stringify([{
      id: 'arc-a',
      layer: 'archive',
      type: 'insight',
      content: 'private A',
      title: 'Private A',
      timestamp: new Date().toISOString(),
      evidence: [],
      synced_to_cloud: false,
    }]));

    const sync = new SyncService().syncAllPending();
    await vi.waitFor(() => expect(addNodeMock).toHaveBeenCalledTimes(1));

    principalStorage.bind('principal-b');
    const principalBArchive = JSON.stringify([{
      id: 'arc-b',
      layer: 'archive',
      type: 'insight',
      content: 'private B',
      title: 'Private B',
      timestamp: new Date().toISOString(),
      evidence: [],
      synced_to_cloud: false,
    }]);
    principalStorage.setItem('iskra-space-archive', principalBArchive);
    ensureSupabaseSessionMock.mockResolvedValue('principal-b');
    pendingUpload.resolve({ id: 'node-a' });
    await sync;

    expect(buildConnectionsMock).not.toHaveBeenCalledWith('node-a');
    expect(principalStorage.getItem('iskra-space-archive')).toBe(principalBArchive);
  });
});
