import {
  isUserStorageActive,
  userScopedStorage,
} from './userScopedStorage';

export type StorageBoundaryMode = 'user' | 'legacy-migration';

export interface StorageBoundaryAdapter {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
  clear(): void;
}

class StorageBoundaryUnavailableError extends Error {
  constructor() {
    super('User storage is unavailable before the authenticated storage scope is active');
    this.name = 'StorageBoundaryUnavailableError';
  }
}

function getBrowserStorage(): StorageBoundaryAdapter | null {
  try {
    return typeof localStorage === 'undefined' ? null : localStorage;
  } catch {
    return null;
  }
}

const unavailableStorage: StorageBoundaryAdapter = {
  getItem: () => null,
  setItem: () => { throw new StorageBoundaryUnavailableError(); },
  removeItem: () => { throw new StorageBoundaryUnavailableError(); },
  clear: () => { throw new StorageBoundaryUnavailableError(); },
};

function isTestRuntime(): boolean {
  return import.meta.env.MODE === 'test';
}

function resolveStorage(mode: StorageBoundaryMode): StorageBoundaryAdapter {
  if (mode === 'legacy-migration') {
    return getBrowserStorage() ?? unavailableStorage;
  }

  if (isUserStorageActive()) {
    return userScopedStorage;
  }

  if (isTestRuntime()) {
    return getBrowserStorage() ?? unavailableStorage;
  }

  return unavailableStorage;
}

export function getStorage(mode: StorageBoundaryMode = 'user'): StorageBoundaryAdapter {
  return {
    getItem: key => resolveStorage(mode).getItem(key),
    setItem: (key, value) => resolveStorage(mode).setItem(key, value),
    removeItem: key => resolveStorage(mode).removeItem(key),
    clear: () => resolveStorage(mode).clear(),
  };
}

export const storageBoundary = getStorage();
export const legacyMigrationStorage = getStorage('legacy-migration');
