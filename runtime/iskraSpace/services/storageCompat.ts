/**
 * storageCompat — безопасный доступ к localStorage
 *
 * Цель:
 * - Не падать в Node/Vitest (где localStorage отсутствует)
 * - Не спамить stderr "localStorage is not defined"
 * - Сохранить поведение в браузере без изменений
 */
import { principalStorage, principalStorageKey } from './principalStorage';

const memory = new Map<string, string>();
const deviceMemory = new Map<string, string>();

function hasLocalStorage(): boolean {
  try {
    return typeof localStorage !== 'undefined' && localStorage !== null;
  } catch {
    return false;
  }
}

function principalMemoryKey(key: string): string {
  try {
    return principalStorageKey(key);
  } catch {
    return `iskra.principal.unbound:${key}`;
  }
}

export const safeStorage = {
  getItem(key: string): string | null {
    const fallbackKey = principalMemoryKey(key);
    if (!hasLocalStorage()) return memory.get(fallbackKey) ?? null;
    try {
      return principalStorage.getItem(key);
    } catch {
      return memory.get(fallbackKey) ?? null;
    }
  },

  setItem(key: string, value: string): void {
    const fallbackKey = principalMemoryKey(key);
    if (!hasLocalStorage()) {
      memory.set(fallbackKey, value);
      return;
    }
    try {
      principalStorage.setItem(key, value);
    } catch {
      // if browser storage is unavailable (quota/private mode), keep a best-effort fallback
      memory.set(fallbackKey, value);
    }
  },

  removeItem(key: string): void {
    const fallbackKey = principalMemoryKey(key);
    if (!hasLocalStorage()) {
      memory.delete(fallbackKey);
      return;
    }
    try {
      principalStorage.removeItem(key);
    } catch {
      memory.delete(fallbackKey);
    }
  },

  clearBoundPrincipalFallback(): number {
    const prefix = principalMemoryKey('');
    const keys = [...memory.keys()].filter(key => key.startsWith(prefix));
    for (const key of keys) memory.delete(key);
    return keys.length;
  },

  clearAllFallbacks(): void {
    memory.clear();
    deviceMemory.clear();
  },

  /** For tests only */
  _clearMemoryFallback(): void {
    memory.clear();
  },
};

/** Device-wide storage is reserved for non-user identifiers and consent state. */
export const deviceStorage = {
  getItem(key: string): string | null {
    if (!hasLocalStorage()) return deviceMemory.get(key) ?? null;
    try {
      return localStorage.getItem(key);
    } catch {
      return deviceMemory.get(key) ?? null;
    }
  },

  setItem(key: string, value: string): void {
    if (!hasLocalStorage()) {
      deviceMemory.set(key, value);
      return;
    }
    try {
      localStorage.setItem(key, value);
    } catch {
      deviceMemory.set(key, value);
    }
  },

  removeItem(key: string): void {
    if (!hasLocalStorage()) {
      deviceMemory.delete(key);
      return;
    }
    try {
      localStorage.removeItem(key);
    } catch {
      deviceMemory.delete(key);
    }
  },
};

