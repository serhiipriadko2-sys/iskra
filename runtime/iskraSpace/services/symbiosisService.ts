import {
  createStatelessSymbiosisProfile,
  type ConsentReceipt,
  type MemoryMode,
  type SymbiosisActionReceipt,
  type SymbiosisPermissionKey,
  type SymbiosisProfile,
} from '@iskra/runtime';
import { storageBoundary } from './storageBoundary';

const PROFILE_KEY = 'iskra-symbiosis-profile-v1';
const RECEIPTS_KEY = 'iskra-symbiosis-consent-receipts-v1';
const ACTION_RECEIPTS_KEY = 'iskra-symbiosis-action-receipts-v1';
const REVIEW_DAYS = 30;

export interface SymbiosisState {
  profile: SymbiosisProfile;
  receipts: ConsentReceipt[];
  actionReceipts: SymbiosisActionReceipt[];
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

const isActionReceipt = (value: unknown): value is SymbiosisActionReceipt => {
  if (!isRecord(value)) return false;
  return typeof value.action === 'string' &&
    (value.requested_by === 'USER' || value.requested_by === 'ISKRA_PROPOSAL') &&
    (value.permission_ref === null || typeof value.permission_ref === 'string') &&
    (value.result === 'DONE' || value.result === 'PARTIAL' ||
      value.result === 'BLOCKED' || value.result === 'FAILED') &&
    (value.read_back === 'VERIFIED' || value.read_back === 'MISMATCH' ||
      value.read_back === 'NOT_APPLICABLE') &&
    Array.isArray(value.evidence_refs) &&
    value.evidence_refs.every(ref => typeof ref === 'string');
};

const parseJson = <T>(key: string): T | null => {
  try {
    const raw = storageBoundary.getItem(key);
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
    'depth.surgery': 'ASK_EACH',
  },
});

const createReceiptId = (): string => {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return `consent_${crypto.randomUUID()}`;
  }
  return `consent_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
};

const persistState = (state: SymbiosisState): void => {
  storageBoundary.setItem(PROFILE_KEY, JSON.stringify(state.profile));
  storageBoundary.setItem(RECEIPTS_KEY, JSON.stringify(state.receipts));
  storageBoundary.setItem(ACTION_RECEIPTS_KEY, JSON.stringify(state.actionReceipts));
};

const appendConsentReceipt = (
  state: SymbiosisState,
  scope: SymbiosisPermissionKey,
  decision: ConsentReceipt['decision'],
  summary: string,
  expiresAt: string | null,
): ConsentReceipt => {
  const receipt: ConsentReceipt = {
    id: createReceiptId(),
    scope,
    decision,
    plain_language_summary: summary,
    granted_at: new Date().toISOString(),
    expires_at: expiresAt,
    profile_version: state.profile.version,
  };
  persistState({ ...state, receipts: [...state.receipts, receipt] });
  return receipt;
};

export const symbiosisService = {
  completeOnboarding(memoryMode: MemoryMode): SymbiosisState {
    const profile = memoryMode === 'CONSENTED'
      ? createConsentedProfile()
      : createStatelessSymbiosisProfile({
          iskraName: 'Искра',
          reviewAt: addDays(REVIEW_DAYS),
        });
    const state: SymbiosisState = { profile, receipts: [], actionReceipts: [] };
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

  getActionReceipts(): SymbiosisActionReceipt[] {
    const receipts = parseJson<unknown>(ACTION_RECEIPTS_KEY);
    return Array.isArray(receipts) ? receipts.filter(isActionReceipt) : [];
  },

  getState(): SymbiosisState | null {
    const profile = this.getProfile();
    return profile
      ? { profile, receipts: this.getReceipts(), actionReceipts: this.getActionReceipts() }
      : null;
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

    const expiresAt = new Date(Date.now() + Math.max(1, ttlMinutes) * 60_000).toISOString();
    return appendConsentReceipt(state, scope, 'GRANTED', summary, expiresAt);
  },

  denyConsent(
    scope: SymbiosisPermissionKey,
    summary: string,
  ): ConsentReceipt | null {
    const state = this.getState();
    if (!state) return null;
    return appendConsentReceipt(state, scope, 'DENIED', summary, null);
  },

  revokeConsent(
    scope: SymbiosisPermissionKey,
    summary: string,
  ): ConsentReceipt | null {
    const state = this.getState();
    if (!state || !this.getCurrentConsent(scope)) return null;
    return appendConsentReceipt(state, scope, 'REVOKED', summary, null);
  },

  recordActionReceipt(receipt: SymbiosisActionReceipt): boolean {
    if (!isActionReceipt(receipt) || !receipt.permission_ref) return false;
    const state = this.getState();
    if (!state || state.actionReceipts.some(item => item.permission_ref === receipt.permission_ref)) {
      return false;
    }

    const pendingReceipt: SymbiosisActionReceipt = {
      ...receipt,
      read_back: 'NOT_APPLICABLE',
    };
    persistState({ ...state, actionReceipts: [...state.actionReceipts, pendingReceipt] });

    const persisted = this.getActionReceipts().some(item =>
      item.permission_ref === pendingReceipt.permission_ref &&
      item.action === pendingReceipt.action &&
      item.result === pendingReceipt.result,
    );
    if (!persisted) return false;

    const refreshed = this.getState();
    if (!refreshed) return false;
    const verifiedReceipt: SymbiosisActionReceipt = {
      ...pendingReceipt,
      read_back: 'VERIFIED',
    };
    persistState({
      ...refreshed,
      actionReceipts: refreshed.actionReceipts.map(item =>
        item.permission_ref === verifiedReceipt.permission_ref
          ? verifiedReceipt
          : item,
      ),
    });

    return this.getActionReceipts().some(item =>
      item.permission_ref === verifiedReceipt.permission_ref &&
      item.read_back === 'VERIFIED',
    );
  },

  hasUsedConsentReceipt(receiptId: string): boolean {
    if (!receiptId) return false;
    return this.getActionReceipts().some(receipt => receipt.permission_ref === receiptId);
  },

  getCurrentConsent(
    scope: SymbiosisPermissionKey,
    now = new Date().toISOString(),
  ): ConsentReceipt | null {
    const profile = this.getProfile();
    if (!profile) return null;

    const latestDecision = [...this.getReceipts()].reverse().find(receipt =>
      receipt.scope === scope && receipt.profile_version === profile.version,
    );
    if (!latestDecision || latestDecision.decision !== 'GRANTED') return null;
    if (latestDecision.expires_at && Date.parse(latestDecision.expires_at) <= Date.parse(now)) {
      return null;
    }
    return latestDecision;
  },

  exportState(): SymbiosisState | null {
    return this.getState();
  },

  importState(value: unknown): boolean {
    if (!value || typeof value !== 'object') return false;
    const candidate = value as Partial<SymbiosisState>;
    if (!isSymbiosisProfile(candidate.profile)) return false;
    if (!Array.isArray(candidate.receipts) || !candidate.receipts.every(isConsentReceipt)) return false;
    const actionReceipts = candidate.actionReceipts ?? [];
    if (!Array.isArray(actionReceipts) || !actionReceipts.every(isActionReceipt)) return false;
    persistState({
      profile: candidate.profile,
      receipts: candidate.receipts,
      actionReceipts,
    });
    return true;
  },

  clear(): void {
    storageBoundary.removeItem(PROFILE_KEY);
    storageBoundary.removeItem(RECEIPTS_KEY);
    storageBoundary.removeItem(ACTION_RECEIPTS_KEY);
  },
};
