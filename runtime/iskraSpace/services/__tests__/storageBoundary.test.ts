import { beforeEach, describe, expect, it } from 'vitest';
import { activateUserStorage, deactivateUserStorage } from '../userScopedStorage';
import { getStorage } from '../storageBoundary';

const store: Record<string, string> = {};

const localStorageMock: Storage = {
  get length() { return Object.keys(store).length; },
  clear() { Object.keys(store).forEach(key => delete store[key]); },
  getItem(key) { return store[key] ?? null; },
  key(index) { return Object.keys(store)[index] ?? null; },
  removeItem(key) { delete store[key]; },
  setItem(key, value) { store[key] = value; },
};

Object.defineProperty(global, 'localStorage', { value: localStorageMock });

describe('storageBoundary', () => {
  beforeEach(() => {
    localStorageMock.clear();
    deactivateUserStorage();
  });

  it('routes user mode through active namespace', () => {
    const storage = getStorage();
    activateUserStorage('user-a', { migrateLegacy: false });
    storage.setItem('journal', 'A');

    activateUserStorage('user-b', { migrateLegacy: false });
    expect(storage.getItem('journal')).toBeNull();
  });

  it('allows explicit legacy migration access only', () => {
    localStorageMock.setItem('legacy', 'value');
    expect(getStorage('legacy-migration').getItem('legacy')).toBe('value');
  });
});
