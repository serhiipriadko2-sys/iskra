import { beforeEach, describe, expect, it } from 'vitest';
import { activateUserStorage, deactivateUserStorage } from '../userScopedStorage';
import { storageService } from '../storageService';

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

const journalEntry = {
  id: 'entry-a',
  timestamp: new Date().toISOString(),
  text: 'A',
  prompt: {
    question: 'Q',
    why: 'W',
  },
};

describe('storageService user scoped storage', () => {
  beforeEach(() => {
    localStorageMock.clear();
    deactivateUserStorage();
  });

  it('does not expose user A journal to user B', () => {
    activateUserStorage('user-a', { migrateLegacy: false });
    storageService.addJournalEntry(journalEntry);

    activateUserStorage('user-b', { migrateLegacy: false });

    expect(storageService.getJournalEntries()).toEqual([]);
  });
});
