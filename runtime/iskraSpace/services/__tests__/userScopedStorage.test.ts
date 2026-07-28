import { beforeEach, describe, expect, it, vi } from 'vitest';

const store: Record<string, string> = {};

const localStorageMock = {
  get length() {
    return Object.keys(store).length;
  },
  getItem(key: string) {
    return store[key] ?? null;
  },
  setItem(key: string, value: string) {
    store[key] = value;
  },
  removeItem(key: string) {
    delete store[key];
  },
  key(index: number) {
    return Object.keys(store)[index] ?? null;
  },
};

Object.defineProperty(global, 'localStorage', { value: localStorageMock });

import {
  activateUserStorage,
  clearActiveUserStorage,
  deactivateUserStorage,
  getActiveUserStoragePrefix,
  userScopedStorage,
} from '../userScopedStorage';

describe('userScopedStorage', () => {
  beforeEach(() => {
    for (const key of Object.keys(store)) delete store[key];
    deactivateUserStorage();
    vi.clearAllMocks();
  });

  it('isolates two authenticated user namespaces', () => {
    activateUserStorage('user-a', { migrateLegacy: false });
    userScopedStorage.setItem('journal', 'A');

    activateUserStorage('user-b', { migrateLegacy: false });
    expect(userScopedStorage.getItem('journal')).toBeNull();
    userScopedStorage.setItem('journal', 'B');

    activateUserStorage('user-a', { migrateLegacy: false });
    expect(userScopedStorage.getItem('journal')).toBe('A');
  });

  it('migrates legacy values once into the active namespace', () => {
    store['iskra-space-journal-entries'] = '["legacy"]';

    const receipt = activateUserStorage('user-a');

    expect(receipt.migratedKeys).toContain('iskra-space-journal-entries');
    expect(getActiveUserStoragePrefix()).toContain('iskra:v2:user');
  });

  it('clears only active namespace', () => {
    activateUserStorage('user-a', { migrateLegacy: false });
    userScopedStorage.setItem('journal', 'A');
    const removed = clearActiveUserStorage();

    expect(removed).toBe(1);
    expect(userScopedStorage.getItem('journal')).toBeNull();
  });
});
