import { beforeEach, describe, expect, it, vi } from 'vitest';
import { principalStorage, principalStorageKey } from '../principalStorage';
import { safeStorage } from '../storageCompat';

describe('principalStorage', () => {
  beforeEach(() => {
    localStorage.clear();
    safeStorage._clearMemoryFallback();
    principalStorage.bind('principal-a');
  });

  it('migrates legacy values once into the first bound principal', () => {
    localStorage.setItem('legacy-sensitive', 'value-a');
    expect(principalStorage.migrateLegacy(['legacy-sensitive'])).toBe(true);
    expect(principalStorage.getItem('legacy-sensitive')).toBe('value-a');
    expect(localStorage.getItem('legacy-sensitive')).toBeNull();

    principalStorage.bind('principal-b');
    localStorage.setItem('legacy-sensitive', 'value-b');
    expect(principalStorage.migrateLegacy(['legacy-sensitive'])).toBe(false);
    expect(principalStorage.getItem('legacy-sensitive')).toBeNull();
    expect(localStorage.getItem('legacy-sensitive')).toBe('value-b');
  });

  it('rolls back every staged value when a transaction write fails', () => {
    principalStorage.setItem('first', 'before-first');
    principalStorage.setItem('second', 'before-second');
    const blockedKey = principalStorageKey('second');
    const originalSetItem = Storage.prototype.setItem;
    const setItem = vi.spyOn(Storage.prototype, 'setItem').mockImplementation(function (
      this: Storage,
      key: string,
      value: string,
    ) {
      if (key === blockedKey && value === 'after-second') throw new DOMException('quota', 'QuotaExceededError');
      return originalSetItem.call(this, key, value);
    });

    expect(() => principalStorage.applyTransaction([
      { key: 'first', value: 'after-first' },
      { key: 'second', value: 'after-second' },
    ])).toThrow();
    expect(principalStorage.getItem('first')).toBe('before-first');
    expect(principalStorage.getItem('second')).toBe('before-second');
    setItem.mockRestore();
  });

  it('keeps the memory fallback isolated and evictable when browser storage fails', () => {
    const getItem = vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new DOMException('blocked', 'SecurityError');
    });
    const setItem = vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new DOMException('blocked', 'SecurityError');
    });

    safeStorage.setItem('sensitive', 'principal-a-value');
    expect(safeStorage.getItem('sensitive')).toBe('principal-a-value');

    principalStorage.bind('principal-b');
    expect(safeStorage.getItem('sensitive')).toBeNull();
    safeStorage.setItem('sensitive', 'principal-b-value');

    principalStorage.bind('principal-a');
    expect(safeStorage.getItem('sensitive')).toBe('principal-a-value');
    expect(safeStorage.clearBoundPrincipalFallback()).toBe(1);
    expect(safeStorage.getItem('sensitive')).toBeNull();

    getItem.mockRestore();
    setItem.mockRestore();
  });
});
