const USER_STORAGE_PREFIX = 'iskra:v2:user';
const LEGACY_OWNER_KEY = 'iskra:v2:legacy-storage-owner';

export const LEGACY_USER_STORAGE_KEYS = [
  'iskra-space-tasks',
  'iskra-space-journal-entries',
  'iskra-space-duo-prefs',
  'iskra-space-duo-canvas-notes',
  'iskra-space-habits',
  'iskra-journal-pin',
  'iskra-onboarding-complete',
  'iskra-tutorial-seen',
  'iskra-user-name',
  'iskra-voice-preferences',
  'iskra-last-voice-state',
  'iskra-response-mode',
  'iskra-space-archive',
  'iskra-space-shadow',
  'iskra-space-mantra',
  'iskra-symbiosis-profile-v1',
  'iskra-symbiosis-consent-receipts-v1',
  'iskra-symbiosis-action-receipts-v1',
  'iskra-mood-entries',
] as const;

export interface UserStorageActivationReceipt {
  scopePrefix: string;
  migratedKeys: string[];
  failedKeys: string[];
  blockedKeys: string[];
}

export class StorageScopeUnavailableError extends Error {
  constructor() {
    super('User-scoped storage is unavailable before the authenticated user boundary is active');
    this.name = 'StorageScopeUnavailableError';
  }
}

let activeScopeToken: string | null = null;

function getBrowserStorage(): Storage | null {
  try {
    return typeof localStorage === 'undefined' ? null : localStorage;
  } catch {
    return null;
  }
}

function normalizeUserId(userId: string): string {
  const normalized = userId.trim();
  if (!normalized || normalized.length > 160) {
    throw new Error('A valid user id is required to activate user-scoped storage');
  }
  return encodeURIComponent(normalized);
}

function buildScopePrefix(scopeToken: string): string {
  return `${USER_STORAGE_PREFIX}:${scopeToken}:`;
}

function buildScopedKey(scopeToken: string, key: string): string {
  return `${buildScopePrefix(scopeToken)}${key}`;
}

function requireActiveScopeToken(): string {
  if (!activeScopeToken) throw new StorageScopeUnavailableError();
  return activeScopeToken;
}

function emptyReceipt(scopeToken: string): UserStorageActivationReceipt {
  return {
    scopePrefix: buildScopePrefix(scopeToken),
    migratedKeys: [],
    failedKeys: [],
    blockedKeys: [],
  };
}

function migrateLegacyKeys(storage: Storage, scopeToken: string): UserStorageActivationReceipt {
  const receipt = emptyReceipt(scopeToken);
  const presentLegacyKeys = LEGACY_USER_STORAGE_KEYS.filter(key => storage.getItem(key) !== null);
  if (presentLegacyKeys.length === 0) return receipt;

  const existingOwner = storage.getItem(LEGACY_OWNER_KEY);
  if (existingOwner && existingOwner !== scopeToken) {
    receipt.blockedKeys.push(...presentLegacyKeys);
    return receipt;
  }

  if (!existingOwner) {
    try {
      storage.setItem(LEGACY_OWNER_KEY, scopeToken);
    } catch {
      receipt.failedKeys.push(...presentLegacyKeys);
      return receipt;
    }

    if (storage.getItem(LEGACY_OWNER_KEY) !== scopeToken) {
      receipt.failedKeys.push(...presentLegacyKeys);
      return receipt;
    }
  }

  for (const legacyKey of presentLegacyKeys) {
    const legacyValue = storage.getItem(legacyKey);
    if (legacyValue === null) continue;

    const scopedKey = buildScopedKey(scopeToken, legacyKey);
    try {
      const existingValue = storage.getItem(scopedKey);
      if (existingValue === null) {
        storage.setItem(scopedKey, legacyValue);
      }

      const persistedValue = storage.getItem(scopedKey);
      if (persistedValue === legacyValue) {
        storage.removeItem(legacyKey);
        receipt.migratedKeys.push(legacyKey);
      } else if (persistedValue !== null) {
        receipt.blockedKeys.push(legacyKey);
      } else {
        receipt.failedKeys.push(legacyKey);
      }
    } catch {
      receipt.failedKeys.push(legacyKey);
    }
  }

  return receipt;
}

export function activateUserStorage(
  userId: string,
  options: { migrateLegacy?: boolean } = {},
): UserStorageActivationReceipt {
  const scopeToken = normalizeUserId(userId);
  activeScopeToken = scopeToken;

  const storage = getBrowserStorage();
  if (!storage || options.migrateLegacy === false) return emptyReceipt(scopeToken);
  return migrateLegacyKeys(storage, scopeToken);
}

export function deactivateUserStorage(): void {
  activeScopeToken = null;
}

export function isUserStorageActive(): boolean {
  return activeScopeToken !== null;
}

export function getActiveUserStoragePrefix(): string | null {
  return activeScopeToken ? buildScopePrefix(activeScopeToken) : null;
}

export function getActiveUserStorageKey(key: string): string | null {
  return activeScopeToken ? buildScopedKey(activeScopeToken, key) : null;
}

export function clearActiveUserStorage(): number {
  const storage = getBrowserStorage();
  const prefix = getActiveUserStoragePrefix();
  if (!storage || !prefix) return 0;

  const keysToRemove: string[] = [];
  for (let index = 0; index < storage.length; index += 1) {
    const key = storage.key(index);
    if (key?.startsWith(prefix)) keysToRemove.push(key);
  }

  for (const key of keysToRemove) storage.removeItem(key);
  return keysToRemove.length;
}

export const userScopedStorage = {
  getItem(key: string): string | null {
    const storage = getBrowserStorage();
    const scopedKey = getActiveUserStorageKey(key);
    return storage && scopedKey ? storage.getItem(scopedKey) : null;
  },

  setItem(key: string, value: string): void {
    const storage = getBrowserStorage();
    if (!storage) return;
    storage.setItem(buildScopedKey(requireActiveScopeToken(), key), value);
  },

  removeItem(key: string): void {
    const storage = getBrowserStorage();
    if (!storage) return;
    storage.removeItem(buildScopedKey(requireActiveScopeToken(), key));
  },

  clear(): void {
    clearActiveUserStorage();
  },
};
