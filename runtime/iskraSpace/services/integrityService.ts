/**
 * INTEGRITY SERVICE
 *
 * This service derives and persists integrity signals between turns. It
 * evaluates the last assistant response for evidence citations and
 * receipt discipline, taking into account the context of the last
 * playbook. When the previous playbook was ROUTINE, missing canon
 * references are treated as warnings rather than hard failures unless
 * the response includes explicit fact claims (denoted by [FACT]).
 *
 * Integrity state is stored via safeStorage so that the policy engine
 * can consume it on the next turn without recomputing from raw text.
 */

import type { Message } from '../types';
import type { PlaybookType } from './policyEngine';
import { safeStorage } from './storageCompat';
import type { IntegrityState } from '../../src/types/guard.js';

import { validateDeltaSignature } from './deltaProtocol';
import { evidenceService } from './evidenceService';

const LAST_PLAYBOOK_KEY = 'iskra_last_playbook';
const INTEGRITY_STATE_KEY = 'iskra_integrity_state';
const GUARD_COUNTERS_KEY = 'iskra_guard_counters';

export interface GuardCounters {
  anti_dryness_hits: number;
  leader_flaps: number;
  last_leader?: string;
  leaders_window?: string[]; // last 2-3 leaders
}

function defaultCounters(): GuardCounters {
  return {
    anti_dryness_hits: 0,
    leader_flaps: 0,
    last_leader: undefined,
    leaders_window: [],
  };
}

export function getGuardCounters(): GuardCounters {
  const raw = safeStorage.getItem(GUARD_COUNTERS_KEY);
  if (!raw) return defaultCounters();
  try {
    const parsed = JSON.parse(raw) as GuardCounters;
    return {
      ...defaultCounters(),
      ...parsed,
      leaders_window: Array.isArray(parsed.leaders_window) ? parsed.leaders_window : [],
    };
  } catch {
    return defaultCounters();
  }
}

export function saveGuardCounters(counters: GuardCounters): void {
  safeStorage.setItem(GUARD_COUNTERS_KEY, JSON.stringify(counters));
}

function detectReceiptIntent(text: string): boolean {
  // “Receipt intent” means the response is offering an artifact download.
  // We treat plain sandbox links as intent ONLY if accompanied by
  // an explicit download/archive phrase.
  const hasSandbox = /sandbox:\/\//i.test(text);
  if (!hasSandbox) return false;
  return /(скачать|download|архив|archive|zip|\.zip)/i.test(text);
}

function receiptCheck(text: string): { intent: boolean; ok: boolean; missing: string[] } {
  const intent = detectReceiptIntent(text);
  if (!intent) return { intent: false, ok: true, missing: [] };
  const missing: string[] = [];
  if (!/sha256\s*:/i.test(text)) missing.push('sha256');
  if (!/bytes\s*:/i.test(text)) missing.push('bytes');
  return { intent: true, ok: missing.length === 0, missing };
}

export function computeIntegrityStateV02(params: {
  responseText: string;
  playbook: PlaybookType;
  responseId?: string;
  voiceName?: string;
  evalFlags?: string[];
}): IntegrityState {
  const { responseText, playbook, responseId, voiceName, evalFlags = [] } = params;

  const warnings: string[] = [];
  const missing: string[] = [];
  const reasons: string[] = [];

  // --- Delta ---
  const delta = validateDeltaSignature(responseText);
  const deltaOk = delta.isValid;
  if (!deltaOk) {
    if (playbook === 'ROUTINE') {
      warnings.push('NO_DELTA');
      reasons.push('∆DΩΛ missing (routine grace)');
    } else {
      missing.push('delta');
      reasons.push('∆DΩΛ missing');
    }
  }

  // --- Evidence ---
  const evidenceStats = evidenceService.getEvidenceStats(responseText);
  const extracted = evidenceService.extractEvidenceFromText(responseText);

  const evidenceErrors: string[] = [];
  const evidenceWarnings: string[] = [];
  for (const e of extracted) {
    const v = evidenceService.validateEvidence(e);
    if (!v.valid) evidenceErrors.push(...v.errors);
    evidenceWarnings.push(...v.warnings);
  }

  const traceCheck = evidenceService.validateTraceDiscipline(responseText);
  if (!traceCheck.valid) {
    // Trace discipline errors are always fail-worthy: [FACT] without evidence.
    missing.push('trace_discipline');
    reasons.push('Trace discipline violated');
  }

  const hasFactTag = /\[FACT\]/i.test(responseText);
  const evidenceRequired = playbook === 'SIFT' || playbook === 'COUNCIL' || playbook === 'CRISIS' || hasFactTag;
  if (evidenceRequired && evidenceStats.total === 0) {
    if (playbook === 'ROUTINE' && !hasFactTag) {
      warnings.push('NO_EVIDENCE');
      reasons.push('No evidence provided (routine grace)');
    } else {
      missing.push('evidence');
      reasons.push('No evidence provided');
    }
  }

  if (evidenceErrors.length > 0) {
    warnings.push('EVIDENCE_FORMAT');
  }

  // --- Receipts ---
  const rcpt = receiptCheck(responseText);
  if (rcpt.intent && !rcpt.ok) {
    missing.push('receipt');
    reasons.push('Artifact offered without receipt');
  }

  // --- Counters (for guard inputs) ---
  const counters = getGuardCounters();

  // anti_dryness_hits: consecutive “hollow” flags from eval
  const drynessHit = evalFlags.includes('SMOOTH_EMPTY') || evalFlags.includes('LOW_USEFULNESS');
  counters.anti_dryness_hits = drynessHit ? counters.anti_dryness_hits + 1 : 0;

  // leader flaps: detect changes of leader voice within last 2-3 turns
  if (voiceName) {
    const window = Array.isArray(counters.leaders_window) ? counters.leaders_window : [];
    window.push(voiceName);
    while (window.length > 3) window.shift();
    counters.leaders_window = window;
    counters.last_leader = voiceName;
    // Count changes between adjacent entries
    let flaps = 0;
    for (let i = 1; i < window.length; i++) {
      if (window[i] !== window[i - 1]) flaps += 1;
    }
    counters.leader_flaps = flaps;
  }

  saveGuardCounters(counters);

  // --- Overall ---
  // FAIL if any hard missing categories exist (delta for non-routine, trace errors, receipts intent missing, evidence required missing)
  const hardFail =
    (playbook !== 'ROUTINE' && !deltaOk) ||
    missing.includes('trace_discipline') ||
    (rcpt.intent && !rcpt.ok) ||
    (evidenceRequired && evidenceStats.total === 0 && !(playbook === 'ROUTINE' && !hasFactTag));

  const overall: 'ok' | 'warning' | 'fail' = hardFail ? 'fail' : warnings.length > 0 ? 'warning' : 'ok';

  const state: IntegrityState = {
    ok: overall !== 'fail',
    warnings,
    missing,
    evidenceCount: evidenceStats.byContour.canon,

    version: '0.2',
    timestamp: new Date().toISOString(),
    playbook,
    overall,
    reasons,
    delta: {
      ok: deltaOk,
      missing: delta.missing,
      errors: deltaOk ? undefined : delta.missing,
    },
    evidence: {
      ok: traceCheck.valid && evidenceErrors.length === 0,
      total: evidenceStats.total,
      byContour: evidenceStats.byContour as any,
      errors: evidenceErrors,
      warnings: evidenceWarnings,
      trace_errors: traceCheck.errors,
      trace_warnings: traceCheck.warnings,
    },
    receipt: rcpt,
    counters,
  };

  // Provide a human-meaningful reason bundle for UI
  if (responseId) {
    state.reasons = [...(state.reasons || []), `response_id=${responseId}`];
  }

  return state;
}

/**
 * Derive integrity from the conversation history and last playbook. The
 * final assistant message is inspected for canon citations (e.g.
 * `{e:canon:...}`) and receipts (sha256 + bytes) for any sandbox
 * attachments. Missing citations in ROUTINE playbook responses
 * produce warnings; missing receipts or citations in other playbooks
 * result in a failure (ok=false).
 */
export function deriveGuardIntegrity(
  history: Message[],
  lastPlaybook: PlaybookType
): IntegrityState {
  // Find last assistant message
  const lastAssistant = [...history].reverse().find(m => m.role === 'model');
  const text = lastAssistant?.text || '';
  const state: IntegrityState = {
    ok: true,
    warnings: [],
    missing: [],
    evidenceCount: 0,
  };

  // Detect evidence via evidenceService (covers canon/project/company/web)
  const stats = evidenceService.getEvidenceStats(text);
  state.evidenceCount = stats.byContour.canon;
  const hasFactTag = /\[FACT\]/i.test(text);

  // If no evidence
  if (stats.total === 0) {
    if (lastPlaybook === 'ROUTINE' && !hasFactTag) {
      state.warnings.push('No canon references found in routine response');
    } else {
      state.ok = false;
      state.missing.push('canon_reference');
    }
  }

  // Detect receipt intent and require receipts
  const rcpt = receiptCheck(text);
  if (rcpt.intent && !rcpt.ok) {
    state.ok = false;
    state.missing.push('receipt');
  }

  return state;
}

/** Retrieve the last playbook from storage. */
export function getLastPlaybook(): PlaybookType | null {
  const p = safeStorage.getItem(LAST_PLAYBOOK_KEY);
  return p as PlaybookType | null;
}

/** Persist the last playbook for use on the next turn. */
export function saveLastPlaybook(playbook: PlaybookType): void {
  safeStorage.setItem(LAST_PLAYBOOK_KEY, playbook);
}

/** Retrieve stored integrity state if it exists. */
export function getStoredIntegrity(): IntegrityState | null {
  const raw = safeStorage.getItem(INTEGRITY_STATE_KEY);
  try {
    return raw ? (JSON.parse(raw) as IntegrityState) : null;
  } catch {
    return null;
  }
}

/** Persist integrity state between turns. */
export function saveIntegrityState(state: IntegrityState): void {
  safeStorage.setItem(INTEGRITY_STATE_KEY, JSON.stringify(state));
}

/** Clear stored integrity state. */
export function clearIntegrityState(): void {
  safeStorage.removeItem(INTEGRITY_STATE_KEY);
}

export const integrityService = {
  deriveGuardIntegrity,
  computeIntegrityStateV02,
  getLastPlaybook,
  saveLastPlaybook,
  getStoredIntegrity,
  saveIntegrityState,
  clearIntegrityState,
  getGuardCounters,
  saveGuardCounters,
};