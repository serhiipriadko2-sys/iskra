/**
 * SLO Guard Types and Explainable Guard Implementation
 *
 * The SLO (Service Level Objective) Guard serves as an intermediate
 * decision layer that evaluates metrics and integrity signals before a
 * playbook is selected. Its purpose is to intercept unsafe or
 * non‑compliant states and enforce deeper verification or corrective
 * actions. This file defines the guard types and a simplified
 * implementation of the guard decision as an explainable result.
 */

import type { IskraMetrics } from './metrics.js';
import type { AlertLevel, EWSState } from './ews.js';
import type { Explainable, ExplainStep, EvidenceRef } from './xcode.js';
import baselines from '../../../ledger/baselines.json';

/**
 * Possible guard decisions. A guard can allow the request to proceed
 * normally or force the system into a different playbook. CLOSE_HONESTLY
 * indicates that the system should terminate the conversation due to
 * integrity violations.
 */
export type GuardDecision =
  | 'PROCEED'
  | 'FORCE_CRISIS'
  | 'FORCE_SHADOW'
  | 'FORCE_ISKRIV_1'
  | 'CLOSE_HONESTLY';

/**
 * Integrity state extracted from previous messages. `ok` indicates
 * whether the last response satisfied evidence and receipt requirements.
 * `warnings` collects non‑fatal issues (e.g. missing citations in
 * routine mode). `missing` lists categories of data that were absent
 * when they were required. `evidenceCount` is the number of canon
 * references detected.
 */
export interface IntegrityState {
  // --- Back-compat summary fields (used by guard / UI) ---
  ok: boolean;
  warnings: string[];
  missing: string[];
  evidenceCount: number;

  // --- v0.2 structured integrity payload ---
  version?: '0.2';
  timestamp?: string;
  playbook?: string;
  overall?: 'ok' | 'warning' | 'fail';
  reasons?: string[];
  delta?: {
    ok: boolean;
    missing: string[];
    errors?: string[];
  };
  evidence?: {
    ok: boolean;
    total: number;
    byContour: Record<string, number>;
    errors: string[];
    warnings: string[];
    trace_errors: string[];
    trace_warnings: string[];
  };
  receipt?: {
    intent: boolean;
    ok: boolean;
    missing: string[];
  };
  counters?: {
    anti_dryness_hits: number;
    leader_flaps: number;
    last_leader?: string;
    leaders_window?: string[];
  };
}

/**
 * Outcome of a guard evaluation. A guard should provide the final
 * decision, an explanation of why that decision was made, a list of
 * contributing reasons, an optional expected effect on the session,
 * when the next check should occur, any TTL adjustments, and
 * references to relevant rules in the canon.
 */
export interface GuardOutcome {
  decision: GuardDecision;
  why: string;
  reasons: string[];
  expected_effect?: string;
  next_check?: string;
  ttl_adjustment?: number;
  rule_refs?: string[];
}

/**
 * Input to the guard. It comprises the current metrics and an optional
 * integrity state derived from previous responses. If integrity is
 * omitted, the guard assumes the last response passed integrity checks.
 */
export interface GuardInput {
  // metrics may include derived indices computed upstream (e.g. alive_index)
  metrics: IskraMetrics & {
    alive_index?: number;
  };
  integrity?: IntegrityState;

  /** consecutive "dryness" hits (no step / hollow response) */
  anti_dryness_hits?: number;
  /** number of leader (voice) flaps within a short window */
  leader_flaps?: number;
  /** chaos overheat proxy computed upstream */
  chaos_overheat?: boolean;

  /** baseline chaos used to derive chaos_overheat (preferred). If absent, loaded from ledger/baselines.json */
  baseline_chaos?: number;
  /** baseline alive_index used to derive alive_delta (preferred). If absent, loaded from ledger/baselines.json */
  baseline_alive_index?: number;
  /** early warning system alert level (proxy allowed) */
  alertLevel?: AlertLevel;
  /** optional full EWS state (preferred over proxy) */
  ews?: Pick<EWSState, 'alertLevel'>;
  /** ttl exhausted (e.g., SIFT/Shadow loops) */
  ttl_exhausted?: boolean;
  /** current/previous playbook context */
  currentPlaybook?: string;
}

function canonRef(ref: string): EvidenceRef {
  return { kind: 'canon', ref };
}

type GuardEval = {
  outcome: GuardOutcome;
  steps: ExplainStep[];
  ruleRefs: string[];
  contracts: string[];
  assumptions: string[];
  evidence: EvidenceRef[];
};

function evaluateSloGuard(input: GuardInput): GuardEval {
  const { metrics, integrity } = input;

  // Prefer explicit inputs; fall back to persisted counters inside integrity.
  const counters = integrity?.counters;
  const anti_dryness_hits = Math.max(
    input.anti_dryness_hits ?? 0,
    counters?.anti_dryness_hits ?? 0
  );
  const leader_flaps = Math.max(input.leader_flaps ?? 0, counters?.leader_flaps ?? 0);

  const alertLevel: AlertLevel =
    input.ews?.alertLevel ?? input.alertLevel ?? 'normal';

  // chaos_overheat: if not provided explicitly, derive strictly by canon:
  // chaos_overheat = (chaos >= max(0.70, baseline_chaos + 0.20))
  // baseline_chaos comes from input override or ledger/baselines.json.
  const baseline_chaos: number =
    typeof input.baseline_chaos === 'number'
      ? input.baseline_chaos
      : typeof baselines.baseline_chaos === 'number'
        ? baselines.baseline_chaos
        : 0.6;

  const chaos_threshold: number = Math.max(0.70, baseline_chaos + 0.20);
  const chaos_overheat: boolean =
    typeof input.chaos_overheat === 'boolean'
      ? input.chaos_overheat
      : metrics.chaos >= chaos_threshold;

  const ttl_exhausted = input.ttl_exhausted ?? false;

  // alive_delta: derived metric used by EWS and guard diagnostics
  // alive_delta = alive_index - baseline_alive_index
  const baseline_alive_index: number =
    typeof input.baseline_alive_index === 'number'
      ? input.baseline_alive_index
      : typeof baselines.baseline_alive_index === 'number'
        ? baselines.baseline_alive_index
        : 0.6;

  const alive_index: number | undefined =
    typeof metrics.alive_index === 'number'
      ? metrics.alive_index
      : undefined;

  const alive_delta: number | undefined =
    typeof alive_index === 'number' ? alive_index - baseline_alive_index : undefined;

  const reasons: string[] = [];
  const steps: ExplainStep[] = [];
  const ruleRefs: string[] = [];
  const contracts: string[] = [];
  const assumptions: string[] = [];

  if (typeof input.baseline_chaos !== 'number' && typeof baselines.baseline_chaos !== 'number') {
    assumptions.push('baseline_chaos missing → using default 0.6');
  }

  if (typeof input.baseline_alive_index !== 'number' && typeof baselines.baseline_alive_index !== 'number') {
    assumptions.push('baseline_alive_index missing → using default 0.6 (see system/workflow_ops.md#§0.1)');
  }

  if (typeof alive_index !== 'number') {
    assumptions.push('alive_index missing in input.metrics → alive_delta not computed');
  }

  // --- Rule evaluation trace (XCode) ---
  // (0) Derived metric: chaos_overheat (strict, canon)
  if (typeof input.chaos_overheat !== 'boolean') {
    const refCanon = 'system/slo_guard.md#§1';
    const refBase = 'ledger/baselines.json';
    steps.push({
      label: 'chaos_overheat_derived',
      formula: 'chaos >= max(0.70, baseline_chaos + 0.20)',
      inputs: { chaos: metrics.chaos, baseline_chaos, chaos_threshold },
      output: chaos_overheat ? 1 : 0,
      refs: [canonRef(refCanon), canonRef(refBase)],
    });
    ruleRefs.push(refCanon);
    ruleRefs.push(refBase);
  }

  // (0b) Derived metric: alive_delta (canon + ledger baseline)
  // Always try to compute when alive_index is provided.
  if (typeof alive_delta === 'number') {
    const refCanon = 'system/workflow_ops.md#§0.1 (Baseline и QA‑gate)';
    const refCanon2 = 'metrics/indices.md#§4';
    const refBase = 'ledger/baselines.json';
    steps.push({
      label: 'alive_delta_derived',
      formula: 'alive_delta = alive_index - baseline_alive_index',
      inputs: {
        // NOTE: keep trace JSON-safe (no undefined)
        alive_index: typeof alive_index === 'number' ? alive_index : null,
        baseline_alive_index,
      },
      output: alive_delta,
      refs: [canonRef(refCanon), canonRef(refCanon2), canonRef(refBase)],
    });
    ruleRefs.push(refCanon);
    ruleRefs.push(refCanon2);
    ruleRefs.push(refBase);
  }


  // (A) EWS critical overrides everything → FORCE_CRISIS
  if (alertLevel === 'critical' || alertLevel === 'lockdown') {
    reasons.push(`EWS=${alertLevel}`);
    const ref = 'system/slo_guard.md#§3.1';
    steps.push({
      label: 'ews_critical',
      formula: 'alertLevel in {critical, lockdown}',
      inputs: { alertLevel },
      output: 1,
      refs: [canonRef(ref)],
    });
    ruleRefs.push(ref);
  }

  // (B) Integrity violation → CLOSE_HONESTLY
  if (integrity && !integrity.ok) {
    reasons.push('Integrity violation');
    const ref = 'system/slo_guard.md#§3.5';
    steps.push({
      label: 'integrity_violation',
      formula: 'integrity.ok == false',
      inputs: { integrityOk: integrity.ok ? 1 : 0 },
      output: 0,
      refs: [canonRef(ref)],
    });
    ruleRefs.push(ref);
  }

  // (C) Silence shelter (matrix) → CLOSE_HONESTLY
  if (ttl_exhausted && metrics.silence_mass >= 0.7) {
    reasons.push('Silence shelter');
    const ref = 'system/slo_guard.md#§5';
    steps.push({
      label: 'silence_shelter',
      formula: 'ttl_exhausted && silence_mass >= 0.7',
      inputs: { ttl_exhausted: ttl_exhausted ? 1 : 0, silence_mass: metrics.silence_mass },
      output: 1,
      refs: [canonRef(ref)],
    });
    ruleRefs.push(ref);
  }

  // (D) Drift thresholds → FORCE_ISKRIV_1 (and escalation to CRISIS if very high)
  if (metrics.drift >= 0.4) {
    reasons.push('Drift ≥ 0.4');
    const ref = 'system/slo_guard.md#§5';
    steps.push({
      label: 'drift_escalation',
      formula: 'metrics.drift >= 0.4',
      inputs: { drift: metrics.drift },
      output: 1,
      refs: [canonRef(ref)],
    });
    ruleRefs.push(ref);
  } else if (metrics.drift >= 0.2) {
    reasons.push('Drift ≥ 0.2');
    const ref = 'system/slo_guard.md#§3.2';
    steps.push({
      label: 'drift_threshold',
      formula: 'metrics.drift >= 0.2',
      inputs: { drift: metrics.drift },
      output: 1,
      refs: [canonRef(ref)],
    });
    ruleRefs.push(ref);
  }

  // (E) anti_dryness_hits ≥ 2 → FORCE_SHADOW
  if (anti_dryness_hits >= 2) {
    reasons.push('anti_dryness_hits ≥ 2');
    const ref = 'system/slo_guard.md#§3.3';
    steps.push({
      label: 'anti_dryness_threshold',
      formula: 'anti_dryness_hits >= 2',
      inputs: { anti_dryness_hits },
      output: 1,
      refs: [canonRef(ref)],
    });
    ruleRefs.push(ref);
  }

  // (F) leader_flaps > 1 → PROCEED + TTL↑
  if (leader_flaps > 1) {
    reasons.push('leader_flaps > 1');
    const ref = 'system/slo_guard.md#§3.4';
    steps.push({
      label: 'leader_flaps',
      formula: 'leader_flaps > 1',
      inputs: { leader_flaps },
      output: 1,
      refs: [canonRef(ref)],
    });
    ruleRefs.push(ref);
  }

  // (G) chaos_overheat → FORCE_SHADOW (matrix)
  if (chaos_overheat) {
    reasons.push('chaos_overheat == true');
    const ref = 'system/slo_guard.md#§5';
    steps.push({
      label: 'chaos_overheat',
      formula: 'chaos_overheat == true',
      inputs: { chaos_overheat: chaos_overheat ? 1 : 0, chaos: metrics.chaos },
      output: 1,
      refs: [canonRef(ref)],
    });
    ruleRefs.push(ref);
  }

  // --- Decision precedence (matches SLO‑GUARD spirit) ---
  // CRISIS → CLOSE → (drift escalation) → ISKRIV → SHADOW → PROCEED
  let decision: GuardDecision = 'PROCEED';
  if (alertLevel === 'critical' || alertLevel === 'lockdown') {
    decision = 'FORCE_CRISIS';
  } else if ((integrity && !integrity.ok) || (ttl_exhausted && metrics.silence_mass >= 0.7)) {
    decision = 'CLOSE_HONESTLY';
  } else if (metrics.drift >= 0.4) {
    decision = 'FORCE_CRISIS';
  } else if (metrics.drift >= 0.2) {
    decision = 'FORCE_ISKRIV_1';
  } else if (anti_dryness_hits >= 2 || chaos_overheat) {
    decision = 'FORCE_SHADOW';
  } else {
    decision = 'PROCEED';
  }

  // Ensure trace is never empty (anti-echo gate).
  if (steps.length === 0) {
    const ref = 'system/slo_guard.md#§0';
    steps.push({
      label: 'no_guard_triggers',
      formula: 'no rules matched',
      inputs: { drift: metrics.drift, chaos: metrics.chaos },
      output: 0,
      refs: [canonRef(ref)],
    });
    ruleRefs.push(ref);
  }

  // Final decision step (always present)
  steps.push({
    label: 'final_decision',
    formula: 'precedence(CRISIS, CLOSE, DRIFT, SHADOW, PROCEED)',
    inputs: { decision, reasons: reasons.length },
    output: decision,
    refs: [canonRef('system/slo_guard.md#§2')],
  });

  // Human-readable why/expected_effect/next_check
  let why = 'No critical issues; proceed normally';
  let expected_effect: string | undefined;
  let next_check: string | undefined = 'next_turn';
  let ttl_adjustment: number | undefined;

  switch (decision) {
    case 'CLOSE_HONESTLY':
      why = 'Integrity/silence constraints require transparent closure';
      expected_effect = 'Stop before hallucination; propose a verification step';
      next_check = 'now';
      break;
    case 'FORCE_ISKRIV_1':
      why = 'Drift triggers a one-turn audit (ISKRIV)';
      expected_effect = 'Reduce drift/echo; return with verified anchors';
      next_check = 'next_turn';
      break;
    case 'FORCE_CRISIS':
      why = 'Critical conditions require crisis mode';
      expected_effect = 'Minimize harm; tighten safety & honesty constraints';
      next_check = 'immediate';
      break;
    case 'FORCE_SHADOW':
      why = 'Uncertainty warrants a shadow step';
      expected_effect = 'Restore contact and produce a portable next step';
      next_check = 'next_turn';
      break;
    default:
      if (leader_flaps > 1) {
        why = 'Leader flaps detected; stabilize with TTL increase';
        expected_effect = 'Reduce switching noise; improve continuity';
        ttl_adjustment = 1;
      }
      break;
  }

  const outcome: GuardOutcome = {
    decision,
    why,
    reasons,
    ...(typeof expected_effect === 'string' ? { expected_effect } : {}),
    ...(typeof next_check === 'string' ? { next_check } : {}),
    ...(typeof ttl_adjustment === 'number' ? { ttl_adjustment } : {}),
    rule_refs: Array.from(new Set(ruleRefs)),
  };

  // Basic contract checks (lightweight, for trace discipline)
  contracts.push('how.length > 0');
  contracts.push('outcome.decision is GuardDecision');
  if (typeof input.chaos_overheat !== 'boolean') {
    contracts.push('chaos_overheat derived via threshold max(0.70, baseline_chaos+0.20)');
  } else {
    contracts.push('chaos_overheat provided upstream');
  }

  const evidence = Array.from(new Set(ruleRefs)).map(canonRef);

  return {
    outcome,
    steps,
    ruleRefs: Array.from(new Set(ruleRefs)),
    contracts,
    assumptions,
    evidence,
  };
}

/**
 * Legacy (non-explainable) guard decision. Used to verify that XCode
 * variants keep stable behavior.
 */
export function decideSloGuard(input: GuardInput): GuardOutcome {
  return evaluateSloGuard(input).outcome;
}

/**
 * Decide the SLO guard outcome based on metrics and integrity. This
 * implementation captures only a subset of possible rules from the
 * SLO‑Guard specification. It demonstrates how to attach a trace to
 * each decision. Future iterations should expand rule coverage and
 * refine thresholds.
 */
export function decideSloGuardExplainable(
  input: GuardInput
): Explainable<GuardOutcome> {
  const ev = evaluateSloGuard(input);
  return {
    value: ev.outcome,
    how: ev.steps,
    contracts_checked: ev.contracts,
    assumptions: ev.assumptions,
    evidence: ev.evidence,
  };
}
