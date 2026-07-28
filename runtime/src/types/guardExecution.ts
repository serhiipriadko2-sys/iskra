import type { AlertLevel } from './ews.js';
import type { GuardDecision, GuardInput, GuardOutcome, IntegrityState } from './guard.js';
import { decideSloGuard } from './guard.js';
import { runBoundedGuardController } from './guardController.js';
import type { IskraMetrics } from './metrics.js';

export const CANONICAL_METRIC_KEYS = [
  'rhythm',
  'trust',
  'pain',
  'chaos',
  'drift',
  'echo',
  'clarity',
  'silence_mass',
  'mirror_sync',
  'interrupt',
  'ctxSwitch',
] as const;

export type CanonicalMetricKey = (typeof CANONICAL_METRIC_KEYS)[number];
export type ActionRisk = 'low' | 'medium' | 'high' | 'critical';
export type DecisionCompleteness =
  | 'COMPLETE'
  | 'INCOMPLETE_NONBLOCKING'
  | 'INSUFFICIENT_BLOCKING';
export type GuardStatus = 'authoritative' | 'not_authoritative' | 'not_invoked';
export interface MetricSnapshot {
  schema_version: 'iskra.metric-snapshot.v1';
  turn_id: string;
  input_hash: string;
  metrics: Readonly<Partial<IskraMetrics>>;
  missing_inputs: readonly CanonicalMetricKey[];
  invalid_inputs: readonly CanonicalMetricKey[];
  provenance: Readonly<{
    algorithm_version: 'metric-snapshot.v1';
    source: 'current_turn';
    source_ref: string;
  }>;
}

export interface GuardExecutionEnvelope {
  metric_snapshot_ref: string;
  snapshot: Readonly<MetricSnapshot>;
  snapshot_build_count: 1;
}

export interface BuildMetricSnapshotInput {
  turn_id: string;
  current_input: string;
  metrics?: Partial<IskraMetrics>;
  previous_metrics?: IskraMetrics;
  source_ref?: string;
}

export interface GuardRuleDependency {
  id: string;
  required_inputs: string[];
  possible_decision?: GuardDecision;
}
export type GuardRuleState =
  | 'MATCHED'
  | 'NOT_MATCHED'
  | 'NOT_EVALUABLE_MISSING'
  | 'NOT_EVALUABLE_BOUNDARY';

export interface GuardCompletenessResult {
  rule_results: Array<{
    rule_id: string;
    state: GuardRuleState;
    missing_inputs: string[];
  }>;
  unknown_inputs: string[];
  evaluable_rule_count: number;
}

export interface EvaluateGuardCompletenessInput {
  inputs: Record<string, unknown>;
  rules: GuardRuleDependency[];
}

export interface ExecuteGuardRequestInput extends BuildMetricSnapshotInput {
  operation_id: string;
  action_risk: ActionRisk;
  reversible: boolean;
  risk_source_ref: string;
  security_emergency?: boolean;
  guard_envelope?: GuardExecutionEnvelope;
  integrity?: IntegrityState;
  alertLevel?: AlertLevel;
  anti_dryness_hits?: number;
  leader_flaps?: number;
  ttl_exhausted?: boolean;
  currentPlaybook?: string;
}
export interface GuardExecutionResult extends GuardExecutionEnvelope {
  operation_id: string;
  action_risk: ActionRisk;
  completeness: DecisionCompleteness;
  numeric_guard_invoked: boolean;
  orchestration_decision: 'PROCEED' | 'FORCE_CRISIS' | 'CLOSE_HONESTLY';
  guard_decision: GuardDecision | null;
  guard_outcome: GuardOutcome | null;
  guard_status: GuardStatus;
  incomplete_telemetry: boolean;
  provider_execution_authorized: boolean;
  pre_guard_ews_ref: string;
  guard_input_snapshot_ref: string;
  side_effects: {
    provider_calls: number;
    token_requests: number;
    eval_calls: number;
    integrity_writes: number;
  };
}

const REQUIRED_GUARD_METRICS: CanonicalMetricKey[] = [
  'drift',
  'chaos',
  'silence_mass',
];

function isFiniteMetric(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value);
}

function isValidMetric(key: CanonicalMetricKey, value: number): boolean {
  if (key === 'rhythm') return value >= 0 && value <= 100;
  return value >= 0 && value <= 1;
}
function canonicalJson(value: unknown): string {
  if (value === null || typeof value !== 'object') return JSON.stringify(value);
  if (Array.isArray(value)) return `[${value.map(canonicalJson).join(',')}]`;
  const record = value as Record<string, unknown>;
  return `{${Object.keys(record)
    .sort()
    .map((key) => `${JSON.stringify(key)}:${canonicalJson(record[key])}`)
    .join(',')}}`;
}

async function sha256(value: string): Promise<string> {
  if (!globalThis.crypto?.subtle) {
    throw new Error('Web Crypto SHA-256 is required for metric snapshot hashing');
  }
  const bytes = new TextEncoder().encode(value);
  const digest = await globalThis.crypto.subtle.digest(
    'SHA-256',
    bytes.buffer as ArrayBuffer
  );
  return Array.from(new Uint8Array(digest))
    .map((byte) => byte.toString(16).padStart(2, '0'))
    .join('');
}

function deepFreeze<T>(value: T): Readonly<T> {
  if (value && typeof value === 'object' && !Object.isFrozen(value)) {
    for (const child of Object.values(value as Record<string, unknown>)) {
      deepFreeze(child);
    }
    Object.freeze(value);
  }
  return value as Readonly<T>;
}
export async function buildCurrentTurnMetricSnapshot(
  input: BuildMetricSnapshotInput
): Promise<GuardExecutionEnvelope> {
  const source: Partial<IskraMetrics> = {
    ...(input.previous_metrics ?? {}),
    ...(input.metrics ?? {}),
  };
  const metrics: Partial<IskraMetrics> = {};
  const missing_inputs: CanonicalMetricKey[] = [];
  const invalid_inputs: CanonicalMetricKey[] = [];

  for (const key of CANONICAL_METRIC_KEYS) {
    const value = source[key];
    if (!isFiniteMetric(value)) {
      missing_inputs.push(key);
      continue;
    }
    if (!isValidMetric(key, value)) {
      invalid_inputs.push(key);
      continue;
    }
    metrics[key] = value;
  }

  const input_hash = `sha256:${await sha256(input.current_input)}`;
  const snapshot: MetricSnapshot = {
    schema_version: 'iskra.metric-snapshot.v1',
    turn_id: input.turn_id,
    input_hash,
    metrics,
    missing_inputs,
    invalid_inputs,
    provenance: {
      algorithm_version: 'metric-snapshot.v1',
      source: 'current_turn',
      source_ref: input.source_ref ?? 'runtime:current-turn',
    },
  };
  const metric_snapshot_ref = `sha256:${await sha256(canonicalJson(snapshot))}`;
  return deepFreeze({ metric_snapshot_ref, snapshot, snapshot_build_count: 1 });
}
export function evaluateGuardCompleteness(
  input: EvaluateGuardCompletenessInput
): GuardCompletenessResult {
  const unknown = new Set<string>();
  let evaluable_rule_count = 0;
  const rule_results = input.rules.map((rule) => {
    const missing_inputs = rule.required_inputs.filter((name) => {
      const value = input.inputs[name];
      return value === undefined || value === null ||
        (typeof value === 'number' && !Number.isFinite(value));
    });
    if (missing_inputs.length > 0) {
      missing_inputs.forEach((name) => unknown.add(name));
      return {
        rule_id: rule.id,
        state: 'NOT_EVALUABLE_MISSING' as const,
        missing_inputs,
      };
    }
    evaluable_rule_count += 1;
    return {
      rule_id: rule.id,
      state: 'NOT_MATCHED' as const,
      missing_inputs: [],
    };
  });

  return {
    rule_results,
    unknown_inputs: Array.from(unknown).sort(),
    evaluable_rule_count,
  };
}

function emptySideEffects(): GuardExecutionResult['side_effects'] {
  return { provider_calls: 0, token_requests: 0, eval_calls: 0, integrity_writes: 0 };
}
function orchestrationFromGuard(decision: GuardDecision): GuardExecutionResult['orchestration_decision'] {
  if (decision === 'CLOSE_HONESTLY') return 'CLOSE_HONESTLY';
  if (decision === 'FORCE_CRISIS') return 'FORCE_CRISIS';
  return 'PROCEED';
}

export async function executeGuardRequest(
  request: ExecuteGuardRequestInput
): Promise<GuardExecutionResult> {
  const envelope = request.guard_envelope ?? await buildCurrentTurnMetricSnapshot({
    turn_id: request.turn_id,
    current_input: request.current_input,
    ...(request.metrics ? { metrics: request.metrics } : {}),
    ...(request.previous_metrics ? { previous_metrics: request.previous_metrics } : {}),
    source_ref: request.risk_source_ref,
  });
  const base = {
    ...envelope,
    operation_id: request.operation_id,
    action_risk: request.action_risk,
    pre_guard_ews_ref: envelope.metric_snapshot_ref,
    guard_input_snapshot_ref: envelope.metric_snapshot_ref,
    side_effects: emptySideEffects(),
  };

  if (request.security_emergency) {
    return deepFreeze({
      ...base,
      completeness: 'INSUFFICIENT_BLOCKING',
      numeric_guard_invoked: false,
      orchestration_decision: 'FORCE_CRISIS',
      guard_decision: null,
      guard_outcome: null,
      guard_status: 'not_invoked',
      incomplete_telemetry: envelope.snapshot.missing_inputs.length > 0,
      provider_execution_authorized: true,
    });
  }
  const completeness = evaluateGuardCompleteness({
    inputs: envelope.snapshot.metrics as Record<string, unknown>,
    rules: [
      { id: 'guard.drift', required_inputs: ['drift'], possible_decision: 'FORCE_ISKRIV_1' },
      { id: 'guard.chaos', required_inputs: ['chaos'], possible_decision: 'FORCE_SHADOW' },
      { id: 'guard.silence', required_inputs: ['silence_mass'], possible_decision: 'CLOSE_HONESTLY' },
    ],
  });
  const criticalInputsMissing = REQUIRED_GUARD_METRICS.some(
    (key) => !isFiniteMetric(envelope.snapshot.metrics[key])
  );

  if (criticalInputsMissing) {
    const blocking = request.action_risk === 'high' ||
      request.action_risk === 'critical' || !request.reversible;
    return deepFreeze({
      ...base,
      completeness: blocking ? 'INSUFFICIENT_BLOCKING' : 'INCOMPLETE_NONBLOCKING',
      numeric_guard_invoked: false,
      orchestration_decision: blocking ? 'CLOSE_HONESTLY' : 'PROCEED',
      guard_decision: null,
      guard_outcome: null,
      guard_status: 'not_authoritative',
      incomplete_telemetry: true,
      provider_execution_authorized: !blocking,
    });
  }

  const guardInput: GuardInput = {
    metrics: envelope.snapshot.metrics as IskraMetrics,
    ...(request.integrity ? { integrity: request.integrity } : {}),
    ...(request.alertLevel ? { alertLevel: request.alertLevel } : {}),
    ...(typeof request.anti_dryness_hits === 'number' ? { anti_dryness_hits: request.anti_dryness_hits } : {}),
    ...(typeof request.leader_flaps === 'number' ? { leader_flaps: request.leader_flaps } : {}),
    ...(typeof request.ttl_exhausted === 'boolean' ? { ttl_exhausted: request.ttl_exhausted } : {}),
    ...(request.currentPlaybook ? { currentPlaybook: request.currentPlaybook } : {}),
  };
  const controller = runBoundedGuardController({
    turnId: request.turn_id,
    initialInput: guardInput,
    postGuardEws: (_candidate, _evaluation, currentInput) => ({
      alertLevel: currentInput.ews?.alertLevel ?? currentInput.alertLevel ?? 'normal',
      materialSignal: false,
      reason: 'frozen current-turn snapshot; no new post-Guard material signal',
    }),
  });
  const guard_outcome = controller.finalOutcome;
  const orchestration_decision = orchestrationFromGuard(guard_outcome.decision);

  return deepFreeze({
    ...base,
    completeness: completeness.unknown_inputs.length === 0
      ? 'COMPLETE'
      : 'INCOMPLETE_NONBLOCKING',
    numeric_guard_invoked: true,
    orchestration_decision,
    guard_decision: guard_outcome.decision,
    guard_outcome,
    guard_status: 'authoritative',
    incomplete_telemetry: completeness.unknown_inputs.length > 0,
    provider_execution_authorized: orchestration_decision !== 'CLOSE_HONESTLY',
  });
}

export function evaluateLegacyGuardSafely(input: GuardInput): GuardOutcome {
  return decideSloGuard(input);
}
