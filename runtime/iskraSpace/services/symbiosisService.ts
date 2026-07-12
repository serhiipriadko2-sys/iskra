import {
  createStatelessSymbiosisProfile,
  type ConsentReceipt,
  type MemoryMode,
  type SymbiosisPermissionKey,
  type SymbiosisProfile,
} from '@iskra/runtime';

const PROFILE_KEY = 'iskra-symbiosis-profile-v1';
const RECEIPTS_KEY = 'iskra-symbiosis-consent-receipts-v1';
const REVIEW_DAYS = 30;

export interface SymbiosisState {
  profile: SymbiosisProfile;
  receipts: ConsentReceipt[];
}

const isRecord = (value: unknown): value is Record<string, unknown> =>
  Boolean(value && typeof value === 'object' && !Array.isArray(value));

const isSymbiosisProfile = (value: unknown): value is SymbiosisProfile => {
  if (!isRecord(value)) return false;
  return value.schema_version === 'iskra.symbiosis.v1' &&
    (value.memory_mode === 'STATELESS' || value.memory_mode === 'CONSENTED') &&
    typeof value.iskra_name === 'string' &&
    typeof value.review_at === 'string' &&
    typeof value.version === 'number' &&
    Array.isArray(value.user_authored_telos) &&
    Array.isArray(value.boundaries) &&
    Array.isArray(value.stop_words) &&
    isRecord(value.memory_permissions);
};

const isConsentReceipt = (value: unknown): value is ConsentReceipt => {
  if (!isRecord(value)) return false;
  return typeof value.id === 'string' &&
    typeof value.scope === 'string' &&
    (value.decision === 'GRANTED' || value.decision === 'DENIED' || value.decision === 'REVOKED') &&
    typeof value.plain_language_summary === 'string' &&
    typeof value.granted_at === 'string' &&
    (value.expires_at === null || typeof value.expires_at === 'string') &&
    typeof value.profile_version === 'number';
};

const parseJson = <T>(key: string): T | null => {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) as T : null;
  } catch {
    return null;
  }
};

const addDays = (days: number): string => {
  const date = new Date();
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString();
};

const createConsentedProfile = (): SymbiosisProfile => ({
  ...createStatelessSymbiosisProfile({
    iskraName: 'Искра',
    reviewAt: addDays(REVIEW_DAYS),
  }),
  memory_mode: 'CONSENTED',
  memory_permissions: {
    'memory.write.low_sensitivity': 'AUTO_LOW_SENSITIVITY',
    'memory.write.personal': 'ASK_EACH',
    'memory.write.sensitive': 'ASK_EACH',
    'memory.promote.shadow': 'ASK_EACH',
  },
});

const createReceiptId = (): string => {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return `consent_${crypto.randomUUID()}`;
  }
  return `consent_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
};

const persistState = (state: SymbiosisState): void => {
  localStorage.setItem(PROFILE_KEY, JSON.stringify(state.profile));
  localStorage.setItem(RECEIPTS_KEY, JSON.stringify(state.receipts));
};

export const symbiosisService = {
  completeOnboarding(memoryMode: MemoryMode): SymbiosisState {
    const profile = memoryMode === 'CONSENTED'
      ? createConsentedProfile()
      : createStatelessSymbiosisProfile({
          iskraName: 'Искра',
          reviewAt: addDays(REVIEW_DAYS),
        });
    const state: SymbiosisState = { profile, receipts: [] };
    persistState(state);
    return state;
  },

  getProfile(): SymbiosisProfile | null {
    const profile = parseJson<unknown>(PROFILE_KEY);
    return isSymbiosisProfile(profile) ? profile : null;
  },

  getReceipts(): ConsentReceipt[] {
    const receipts = parseJson<unknown>(RECEIPTS_KEY);
    return Array.isArray(receipts) ? receipts.filter(isConsentReceipt) : [];
  },

  getState(): SymbiosisState | null {
    const profile = this.getProfile();
    return profile ? { profile, receipts: this.getReceipts() } : null;
  },

  isStateless(): boolean {
    return this.getProfile()?.memory_mode !== 'CONSENTED';
  },

  grantConsent(
    scope: SymbiosisPermissionKey,
    summary: string,
    ttlMinutes = 15,
  ): ConsentReceipt | null {
    const state = this.getState();
    if (!state || state.profile.memory_mode !== 'CONSENTED') return null;
    if ((state.profile.memory_permissions[scope] ?? 'NONE') === 'NONE') return null;

    const now = new Date();
    const receipt: ConsentReceipt = {
      id: createReceiptId(),
      scope,
      decision: 'GRANTED',
      plain_language_summary: summary,
      granted_at: now.toISOString(),
      expires_at: new Date(now.getTime() + ttlMinutes * 60_000).toISOString(),
      profile_version: state.profile.version,
    };
    const receipts = [...state.receipts.filter(item => item.scope !== scope), receipt];
    persistState({ profile: state.profile, receipts });
    return receipt;
  },

  getCurrentConsent(
    scope: SymbiosisPermissionKey,
    now = new Date().toISOString(),
  ): ConsentReceipt | null {
    const profile = this.getProfile();
    if (!profile) return null;
    return this.getReceipts().find(receipt =>
      receipt.scope === scope &&
      receipt.decision === 'GRANTED' &&
      receipt.profile_version === profile.version &&
      (receipt.expires_at === null || Date.parse(receipt.expires_at) > Date.parse(now)),
    ) ?? null;
  },

  exportState(): SymbiosisState | null {
    return this.getState();
  },

  importState(value: unknown): boolean {
    if (!value || typeof value !== 'object') return false;
    const candidate = value as Partial<SymbiosisState>;
    if (!isSymbiosisProfile(candidate.profile)) return false;
    if (!Array.isArray(candidate.receipts) || !candidate.receipts.every(isConsentReceipt)) return false;
    persistState({ profile: candidate.profile, receipts: candidate.receipts });
    return true;
  },

  clear(): void {
    localStorage.removeItem(PROFILE_KEY);
    localStorage.removeItem(RECEIPTS_KEY);
  },
};
