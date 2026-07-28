const PRINCIPAL_NAMESPACE = 'iskra.principal.v1';
const LEGACY_MIGRATION_OWNER_KEY = 'iskra.principal.legacy-owner.v1';
const PRINCIPAL_ID_PATTERN = /^[A-Za-z0-9_-]{1,128}$/;

let activePrincipal: string | null = null;

function currentPrincipal(): string {
  if (activePrincipal) return activePrincipal;
  if (import.meta.env.VITEST || import.meta.env.MODE === 'test') return 'vitest-local';
  throw new Error('principal_storage_unbound');
}

export function principalStorageKey(key: string): string {
  return `${PRINCIPAL_NAMESPACE}:${currentPrincipal()}:${key}`;
}

export type StorageMutation = {
  key: string;
  value: string | null;
};

export const principalStorage = {
  bind(principalId: string): void {
    const normalized = principalId.trim();
    if (!PRINCIPAL_ID_PATTERN.test(normalized)) {
      throw new Error('invalid_storage_principal');
    }
    activePrincipal = normalized;
  },

  activePrincipal(): string | null {
    return activePrincipal;
  },

  unbind(): void {
    activePrincipal = null;
  },

  getItem(key: string): string | null {
    return localStorage.getItem(principalStorageKey(key));
  },

  setItem(key: string, value: string): void {
    localStorage.setItem(principalStorageKey(key), value);
  },

  removeItem(key: string): void {
    localStorage.removeItem(principalStorageKey(key));
  },

  migrateLegacy(keys: readonly string[]): boolean {
    const principal = currentPrincipal();
    const owner = localStorage.getItem(LEGACY_MIGRATION_OWNER_KEY);
    if (owner && owner !== principal) return false;

    const mutations: StorageMutation[] = [];
    for (const key of keys) {
      const legacyValue = localStorage.getItem(key);
      if (legacyValue !== null && this.getItem(key) === null) {
        mutations.push({ key, value: legacyValue });
      }
    }

    this.applyTransaction(mutations);
    for (const mutation of mutations) {
      localStorage.removeItem(mutation.key);
    }
    localStorage.setItem(LEGACY_MIGRATION_OWNER_KEY, principal);
    return mutations.length > 0;
  },

  applyTransaction(mutations: readonly StorageMutation[]): void {
    const snapshots = mutations.map(({ key }) => ({ key, value: this.getItem(key) }));
    try {
      for (const mutation of mutations) {
        if (mutation.value === null) this.removeItem(mutation.key);
        else this.setItem(mutation.key, mutation.value);
      }
    } catch (error) {
      for (const snapshot of snapshots) {
        if (snapshot.value === null) this.removeItem(snapshot.key);
        else this.setItem(snapshot.key, snapshot.value);
      }
      throw error;
    }
  },

  clearBoundPrincipal(): number {
    const prefix = `${PRINCIPAL_NAMESPACE}:${currentPrincipal()}:`;
    const keys: string[] = [];
    for (let index = 0; index < localStorage.length; index += 1) {
      const key = localStorage.key(index);
      if (key?.startsWith(prefix)) keys.push(key);
    }
    for (const key of keys) localStorage.removeItem(key);
    return keys.length;
  },
};
