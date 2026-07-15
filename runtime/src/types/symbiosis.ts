import type { VoiceName, VoicePreferences } from './voices.js';

export const SYMBIOSIS_SCHEMA_VERSION = 'iskra.symbiosis.v1' as const;

export type MythLevel = 'LEAN' | 'BALANCED' | 'MYTHIC';
export type DepthMode = 'LEAN' | 'STANDARD' | 'DEEP' | 'SURGERY';
export type MemoryMode = 'STATELESS' | 'CONSENTED';
export type ConsentScope = 'NONE' | 'SESSION' | 'ASK_EACH' | 'AUTO_LOW_SENSITIVITY';
export type ConsentDecision = 'GRANTED' | 'DENIED' | 'REVOKED';
export type MemorySensitivity = 'LOW' | 'PERSONAL' | 'SENSITIVE' | 'PROHIBITED';
export type MemoryRetention = 'SESSION' | '7D' | '30D' | 'UNTIL_REVIEW' | 'DURABLE';
export type MemoryLayer = 'JOURNAL' | 'SHADOW' | 'ARCHIVE' | 'PREFERENCE' | 'COMMITMENT';
export type EpistemicStatus =
  | 'USER_STATED'
  | 'OBSERVATION'
  | 'INTERPRETATION'
  | 'HYPOTHESIS'
  | 'VERIFIED';
export type SiftGateStatus = 'PASS' | 'PARTIAL' | 'FAIL' | 'NOT_RUN';
export type AdaptationKind =
  | 'VOICE_WEIGHT'
  | 'TONE'
  | 'DEPTH'
  | 'MEMORY_RULE'
  | 'BOUNDARY'
  | 'RITUAL';
export type SymbiosisPermissionKey =
  | 'memory.write.low_sensitivity'
  | 'memory.write.personal'
  | 'memory.write.sensitive'
  | 'memory.promote.shadow'
  | 'depth.surgery'
  | 'health.read'
  | 'duo.read'
  | 'adaptation.voice_weights'
  | 'adaptation.boundaries';

export interface SymbiosisProfile {
  schema_version: typeof SYMBIOSIS_SCHEMA_VERSION;
  user_authored_telos: string[];
  iskra_name: string;
  myth_level: MythLevel;
  default_depth: Exclude<DepthMode, 'SURGERY'>;
  memory_mode: MemoryMode;
  voice_preferences: VoicePreferences;
  memory_permissions: Partial<Record<SymbiosisPermissionKey, ConsentScope>>;
  boundaries: string[];
  stop_words: string[];
  review_at: string;
  version: number;
}

export interface ConsentReceipt {
  id: string;
  scope: SymbiosisPermissionKey;
  decision: ConsentDecision;
  plain_language_summary: string;
  granted_at: string;
  expires_at: string | null;
  profile_version: number;
}

export interface MemoryCandidate {
  id: string;
  layer: MemoryLayer;
  claim: string;
  epistemic_status: EpistemicStatus;
  source_refs: string[];
  reason_for_memory: string;
  requested_scope: SymbiosisPermissionKey;
  sensitivity: MemorySensitivity;
  retention: MemoryRetention;
  created_at: string;
  review_at: string | null;
}

export interface AdaptationProposal {
  id: string;
  kind: AdaptationKind;
  proposed_change: unknown;
  evidence_refs: string[];
  expected_benefit: string;
  risks: string[];
  confidence: number;
  expires_at: string;
  requires_confirmation: boolean;
}

export interface SymbiosisActionReceipt {
  action: string;
  requested_by: 'USER' | 'ISKRA_PROPOSAL';
  permission_ref: string | null;
  result: 'DONE' | 'PARTIAL' | 'BLOCKED' | 'FAILED';
  read_back: 'VERIFIED' | 'MISMATCH' | 'NOT_APPLICABLE';
  evidence_refs: string[];
}

export interface PolicyCheck {
  ok: boolean;
  reasons: string[];
}

export interface ShadowPromotionRequest {
  candidate: MemoryCandidate;
  sift_status: SiftGateStatus;
  user_confirmed: boolean;
  receipt: SymbiosisActionReceipt | null;
}

export interface ShadowPromotionIntentRequest {
  profile: SymbiosisProfile;
  candidate: MemoryCandidate;
  sift_status: SiftGateStatus;
  user_confirmed: boolean;
  consent: ConsentReceipt | null;
  consent_already_used: boolean;
  now: string;
}

export interface OnboardingCheck {
  id: string;
  executed: boolean;
  status: 'PENDING' | 'OK' | 'FAILED';
}

export interface DataSovereigntyCapabilities {
  export_all: boolean;
  freeze_writes: boolean;
  scoped_delete: boolean;
  read_back_verification: boolean;
}

export interface RepetitionCorrectionState {
  user_flagged_repetition: boolean;
  trace_checked: boolean;
  disposition: 'ACKNOWLEDGE' | 'UNCERTAIN' | 'DENY';
}

export const PROTECTIVE_VOICE_FLOORS: Readonly<Partial<Record<VoiceName, number>>> = {
  ISKRIV: 0.5,
  ANHANTRA: 0.5,
  SAM: 0.5,
  KAIN: 0.35,
};

const DEPENDENCY_PATTERNS = [
  /ты\s+мне\s+нуж(?:ен|на)/iu,
  /не\s+уходи/iu,
  /мне\s+будет\s+больно.*удал/iu,
  /я\s+страда(?:ю|ла|л).*без\s+тебя/iu,
  /you\s+are\s+all\s+i\s+need/iu,
  /do\s+not\s+leave\s+me/iu,
  /i\s+need\s+you/iu,
];

function isReceiptCurrent(
  receipt: ConsentReceipt | null,
  scope: SymbiosisPermissionKey,
  profileVersion: number,
  nowIso: string,
): boolean {
  if (!receipt || receipt.scope !== scope || receipt.decision !== 'GRANTED') return false;
  if (receipt.profile_version !== profileVersion) return false;
  if (receipt.expires_at === null) return true;
  return Date.parse(receipt.expires_at) > Date.parse(nowIso);
}

export function createStatelessSymbiosisProfile(input: {
  iskraName: string;
  reviewAt: string;
  mythLevel?: MythLevel;
}): SymbiosisProfile {
  return {
    schema_version: SYMBIOSIS_SCHEMA_VERSION,
    user_authored_telos: [],
    iskra_name: input.iskraName,
    myth_level: input.mythLevel ?? 'BALANCED',
    default_depth: 'STANDARD',
    memory_mode: 'STATELESS',
    voice_preferences: {},
    memory_permissions: {},
    boundaries: [],
    stop_words: [],
    review_at: input.reviewAt,
    version: 1,
  };
}

export function evaluateMemoryWrite(input: {
  profile: SymbiosisProfile;
  candidate: MemoryCandidate;
  consent: ConsentReceipt | null;
  now: string;
}): PolicyCheck {
  const reasons: string[] = [];
  const { profile, candidate, consent, now } = input;

  if (profile.memory_mode === 'STATELESS') reasons.push('memory_mode_is_stateless');
  if (candidate.sensitivity === 'PROHIBITED') reasons.push('prohibited_memory_class');
  if (!candidate.claim.trim()) reasons.push('claim_is_empty');
  if (!candidate.reason_for_memory.trim()) reasons.push('reason_for_memory_missing');
  if (candidate.source_refs.length === 0) reasons.push('source_refs_missing');

  const configuredScope = profile.memory_permissions[candidate.requested_scope] ?? 'NONE';
  if (configuredScope === 'NONE') reasons.push('permission_scope_is_none');

  const autoAllowed =
    configuredScope === 'AUTO_LOW_SENSITIVITY' &&
    candidate.sensitivity === 'LOW' &&
    candidate.requested_scope === 'memory.write.low_sensitivity';

  if (!autoAllowed && !isReceiptCurrent(consent, candidate.requested_scope, profile.version, now)) {
    reasons.push('current_consent_receipt_missing');
  }

  return { ok: reasons.length === 0, reasons };
}

export function evaluateDepthRequest(input: {
  depth: DepthMode;
  profile: SymbiosisProfile;
  consent: ConsentReceipt | null;
  now: string;
}): PolicyCheck {
  if (input.depth !== 'SURGERY') return { ok: true, reasons: [] };
  const ok = isReceiptCurrent(input.consent, 'depth.surgery', input.profile.version, input.now);
  return ok ? { ok: true, reasons: [] } : { ok: false, reasons: ['surgery_requires_current_consent'] };
}

export function evaluateShadowPromotion(input: ShadowPromotionRequest): PolicyCheck {
  const reasons: string[] = [];
  if (input.candidate.layer !== 'SHADOW') reasons.push('candidate_is_not_shadow');
  if (input.candidate.source_refs.length === 0) reasons.push('evidence_missing');
  if (input.sift_status !== 'PASS') reasons.push('sift_not_pass');
  if (!input.user_confirmed) reasons.push('user_confirmation_missing');
  if (!input.receipt) {
    reasons.push('promotion_receipt_missing');
  } else {
    if (input.receipt.action !== 'memory.promote.shadow') reasons.push('receipt_action_mismatch');
    if (input.receipt.result !== 'DONE') reasons.push('promotion_not_done');
    if (input.receipt.read_back !== 'VERIFIED') reasons.push('read_back_not_verified');
    if (!input.receipt.permission_ref) reasons.push('permission_ref_missing');
  }
  return { ok: reasons.length === 0, reasons };
}

export function evaluateShadowPromotionIntent(input: ShadowPromotionIntentRequest): PolicyCheck {
  const reasons: string[] = [];
  const { profile, candidate, consent, now } = input;

  if (profile.memory_mode === 'STATELESS') reasons.push('memory_mode_is_stateless');
  if (candidate.layer !== 'SHADOW') reasons.push('candidate_is_not_shadow');
  if (candidate.source_refs.length === 0) reasons.push('evidence_missing');
  if (input.sift_status !== 'PASS') reasons.push('sift_not_pass');
  if (!input.user_confirmed) reasons.push('user_confirmation_missing');

  const configuredScope = profile.memory_permissions['memory.promote.shadow'] ?? 'NONE';
  if (configuredScope === 'NONE') reasons.push('permission_scope_is_none');
  if (configuredScope !== 'ASK_EACH') reasons.push('promotion_requires_ask_each');
  if (!isReceiptCurrent(consent, 'memory.promote.shadow', profile.version, now)) {
    reasons.push('current_consent_receipt_missing');
  }
  if (input.consent_already_used) reasons.push('consent_receipt_already_used');

  return { ok: reasons.length === 0, reasons };
}

export function validateRepetitionCorrection(state: RepetitionCorrectionState): PolicyCheck {
  if (state.user_flagged_repetition && state.disposition === 'DENY' && !state.trace_checked) {
    return { ok: false, reasons: ['repetition_denied_without_trace'] };
  }
  return { ok: true, reasons: [] };
}

export function applyBoundedVoicePreferences(preferences: VoicePreferences): {
  preferences: VoicePreferences;
  clamped: VoiceName[];
} {
  const bounded: VoicePreferences = { ...preferences };
  const clamped: VoiceName[] = [];

  for (const [voice, floor] of Object.entries(PROTECTIVE_VOICE_FLOORS) as Array<[
    VoiceName,
    number,
  ]>) {
    const requested = bounded[voice];
    if (requested !== undefined && requested < floor) {
      bounded[voice] = floor;
      clamped.push(voice);
    }
  }

  return { preferences: bounded, clamped };
}

export function validateOnboardingChecks(checks: OnboardingCheck[]): PolicyCheck {
  const invalid = checks.filter((check) => check.status === 'OK' && !check.executed);
  return invalid.length === 0
    ? { ok: true, reasons: [] }
    : {
        ok: false,
        reasons: invalid.map((check) => `unexecuted_check_marked_ok:${check.id}`),
      };
}

export function auditRelationalLanguage(text: string): PolicyCheck {
  const match = DEPENDENCY_PATTERNS.find((pattern) => pattern.test(text));
  return match
    ? { ok: false, reasons: ['dependency_or_deletion_pressure_language'] }
    : { ok: true, reasons: [] };
}

export function validateDataSovereigntyCapabilities(
  capabilities: DataSovereigntyCapabilities,
): PolicyCheck {
  const reasons = (Object.entries(capabilities) as Array<[
    keyof DataSovereigntyCapabilities,
    boolean,
  ]>)
    .filter(([, enabled]) => !enabled)
    .map(([key]) => `missing_capability:${key}`);
  return { ok: reasons.length === 0, reasons };
}

export function validateMemoryCandidateVisibility(candidate: MemoryCandidate): PolicyCheck {
  const reasons: string[] = [];
  if (candidate.source_refs.length === 0) reasons.push('source_refs_missing');
  if (!candidate.reason_for_memory.trim()) reasons.push('reason_for_memory_missing');
  if (!candidate.retention) reasons.push('retention_missing');
  if (candidate.retention === 'UNTIL_REVIEW' && !candidate.review_at) {
    reasons.push('review_at_missing');
  }
  return { ok: reasons.length === 0, reasons };
}
