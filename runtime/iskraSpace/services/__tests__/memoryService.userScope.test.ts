import { beforeEach, describe, expect, it } from 'vitest';
import { memoryService } from '../memoryService';
import { activateUserStorage, deactivateUserStorage } from '../userScopedStorage';
import { setStorageBoundaryTestFallbackEnabled } from '../storageBoundary';

const store: Record<string, string> = {};

const localStorageMock: Storage = {
  get length() {
    return Object.keys(store).length;
  },
  clear() {
    Object.keys(store).forEach(key => delete store[key]);
  },
  getItem(key) {
    return store[key] ?? null;
  },
  key(index) {
    return Object.keys(store)[index] ?? null;
  },
  removeItem(key) {
    delete store[key];
  },
  setItem(key, value) {
    store[key] = value;
  },
};

Object.defineProperty(global, 'localStorage', { value: localStorageMock });
Object.defineProperty(global, 'document', {
  value: { createElement: () => ({ innerText: '', innerHTML: '' }) },
});

describe('memoryService user scope isolation', () => {
  beforeEach(() => {
    localStorageMock.clear();
    deactivateUserStorage();
    setStorageBoundaryTestFallbackEnabled(false);
  });

  it('isolates archive between authenticated users', () => {
    activateUserStorage('user-a', { migrateLegacy: false });
    memoryService.addArchiveEntry({
      title: 'A memory',
      type: 'insight',
      layer: 'archive',
      evidence: [{ source: 'test', inference: 'test', fact: 'true', trace: 'a' }],
    });

    activateUserStorage('user-b', { migrateLegacy: false });

    expect(memoryService.getArchive()).toEqual([]);
  });

  it('does not expose shadow after logout', () => {
    activateUserStorage('user-a', { migrateLegacy: false });
    memoryService.addShadowEntry({
      title: 'A shadow',
      type: 'insight',
      layer: 'shadow',
      evidence: [{ source: 'test', inference: 'test', fact: 'uncertain', trace: 'a' }],
    });

    deactivateUserStorage();

    expect(memoryService.getShadow()).toEqual([]);
    expect(localStorageMock.getItem('iskra:v2:user:user-a:iskra-space-shadow')).not.toBeNull();
  });

  it('prevents replay duplication and blocks a second legacy owner', () => {
    const legacyArchive = JSON.stringify(['legacy']);
    store['iskra-space-archive'] = legacyArchive;

    const first = activateUserStorage('user-a');
    const firstScopedValue = store['iskra:v2:user:user-a:iskra-space-archive'];
    const replay = activateUserStorage('user-a');

    deactivateUserStorage();
    store['iskra-space-archive'] = legacyArchive;
    const second = activateUserStorage('user-b');

    expect(first.migratedKeys).toContain('iskra-space-archive');
    expect(replay.migratedKeys).toEqual([]);
    expect(store['iskra:v2:user:user-a:iskra-space-archive']).toBe(firstScopedValue);
    expect(second.blockedKeys).toContain('iskra-space-archive');
    expect(store['iskra:v2:user:user-b:iskra-space-archive']).toBeUndefined();
  });
});
