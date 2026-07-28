import { beforeEach, describe, expect, it, vi } from 'vitest';
import { syncService } from '../syncService';
import { activateUserStorage, deactivateUserStorage } from '../userScopedStorage';
import { storageBoundary } from '../storageBoundary';

const storage = new Map<string, string>();

const localStorageMock: Storage = {
  clear: () => storage.clear(),
  getItem: key => storage.get(key) ?? null,
  key: index => Array.from(storage.keys())[index] ?? null,
  removeItem: key => storage.delete(key),
  setItem: (key, value) => storage.set(key, value),
  get length() { return storage.size; },
};

Object.defineProperty(globalThis, 'localStorage', { value: localStorageMock });

vi.mock('../supabaseClient', () => ({
  isSupabaseAvailable: vi.fn().mockResolvedValue(true),
  ensureSupabaseSession: vi.fn().mockResolvedValue('user-a'),
  getLegacyDeviceId: vi.fn().mockReturnValue(null),
}));

vi.mock('../graphServiceSupabase', () => ({
  graphServiceSupabase: {
    addNode: vi.fn().mockResolvedValue({ id: 'node-1' }),
    buildConnections: vi.fn().mockResolvedValue(undefined),
  },
}));

describe('syncService user storage boundary', () => {
  beforeEach(() => {
    storage.clear();
    deactivateUserStorage();
  });

  it('syncs only the active user namespace memory state', async () => {
    activateUserStorage('user-a', { migrateLegacy: false });
    storageBoundary.setItem('iskra-space-archive', JSON.stringify([
      {
        id: 'a1',
        layer: 'archive',
        type: 'insight',
        content: { note: 'A' },
        synced_to_cloud: false,
      },
    ]));

    await syncService.syncAllPending();

    activateUserStorage('user-b', { migrateLegacy: false });
    expect(localStorageMock.getItem('iskra:v2:user:user-a:iskra-space-archive')).not.toBeNull();
    expect(localStorageMock.getItem('iskra:v2:user:user-b:iskra-space-archive')).toBeNull();
  });
});
