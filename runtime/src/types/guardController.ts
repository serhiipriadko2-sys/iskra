import type { AlertLevel } from './ews.js';
import {
  decideSloGuard,
  type GuardInput,
  type GuardOutcome,
} from './guard.js';

export const MAX_GUARD_EVALUATIONS_PER_TURN = 3 as const;

export type GuardEvaluationNumber = 1 | 2 | 3;
export type GuardEvaluationStability = 'stable' | 'recompute' | 'cap_exhausted';
export type BoundedGuardClosure = 'stable' | 'MAX_GUARD_EVALUATIONS_EXHAUSTED';

export interface GuardEvaluationReceipt {
  schemaVersion: 'iskra.guard.evaluation.v1';
  receiptId: string;
  turnId: string;
  evaluation: GuardEvaluationNumber;
  previousReceiptId: string | null;
  inputAlertLevel: AlertLevel;
  postGuardAlertLevel: AlertLevel;
  postGuardMaterialSignal: boolean;
  alertEscalated: boolean;
  materialChange: boolean;
  stability: GuardEvaluationStability;
  candidateOutcome: GuardOutcome;
  effectiveOutcome: GuardOutcome | null;
  authoritative: boolean;
  reason: string;
}

export interface PostGuardEwsResult {
  alertLevel: AlertLevel;
  materialSignal: boolean;
  reason: string;
}

export interface BoundedGuardControllerInput {
  turnId: string;
  initialInput: GuardInput;
  postGuardEws: (
    candidate: GuardOutcome,
    evaluation: GuardEvaluationNumber,
    input: GuardInput
  ) => PostGuardEwsResult;
  makeReceiptId?: (turnId: string, evaluation: GuardEvaluationNumber) => string;
}

export interface BoundedGuardControllerResult {
  finalOutcome: GuardOutcome;
  receipts: GuardEvaluationReceipt[];
  evaluations: GuardEvaluationNumber;
  closure: BoundedGuardClosure;
}

const ALERT_RANK: Record<AlertLevel, number> = {
  normal: 0,
  watch: 1,
  warning: 2,
  critical: 3,
  lockdown: 4,
};

function currentAlertLevel(input: GuardInput): AlertLevel {
  return input.ews?.alertLevel ?? input.alertLevel ?? 'normal';
}

function isAlertEscalation(before: AlertLevel, after: AlertLevel): boolean {
  return ALERT_RANK[after] > ALERT_RANK[before];
}

function closeHonestlyFrom(candidate: GuardOutcome): GuardOutcome {
  return {
    decision: 'CLOSE_HONESTLY',
    why: 'Guard decision remained unstable after three full evaluations',
    reasons: [...candidate.reasons, 'MAX_GUARD_EVALUATIONS_EXHAUSTED'],
    expected_effect: 'Stop recursive re-evaluation and preserve an auditable trace',
    next_check: 'next_turn',
    rule_refs: Array.from(
      new Set([
        ...(candidate.rule_refs ?? []),
        'projects/20_GOVERNANCE_ADR.md#ADR-20260711-01',
      ])
    ),
  };
}

export function runBoundedGuardController(
  request: BoundedGuardControllerInput
): BoundedGuardControllerResult {
  const receipts: GuardEvaluationReceipt[] = [];
  const makeReceiptId =
    request.makeReceiptId ??
    ((turnId: string, evaluation: GuardEvaluationNumber) =>
      `${turnId}:guard:${evaluation}`);

  let input: GuardInput = { ...request.initialInput };

  for (
    let rawEvaluation = 1;
    rawEvaluation <= MAX_GUARD_EVALUATIONS_PER_TURN;
    rawEvaluation += 1
  ) {
    const evaluation = rawEvaluation as GuardEvaluationNumber;
    const inputAlertLevel = currentAlertLevel(input);
    const candidateOutcome = decideSloGuard(input);
    const postGuard = request.postGuardEws(candidateOutcome, evaluation, input);
    const alertEscalated = isAlertEscalation(inputAlertLevel, postGuard.alertLevel);
    const materialChange = postGuard.materialSignal && alertEscalated;
    const atCap = evaluation === MAX_GUARD_EVALUATIONS_PER_TURN;

    if (!materialChange) {
      const receipt: GuardEvaluationReceipt = {
        schemaVersion: 'iskra.guard.evaluation.v1',
        receiptId: makeReceiptId(request.turnId, evaluation),
        turnId: request.turnId,
        evaluation,
        previousReceiptId: receipts.at(-1)?.receiptId ?? null,
        inputAlertLevel,
        postGuardAlertLevel: postGuard.alertLevel,
        postGuardMaterialSignal: postGuard.materialSignal,
        alertEscalated,
        materialChange: false,
        stability: 'stable',
        candidateOutcome,
        effectiveOutcome: candidateOutcome,
        authoritative: true,
        reason: postGuard.reason,
      };
      receipts.push(receipt);
      return {
        finalOutcome: candidateOutcome,
        receipts,
        evaluations: evaluation,
        closure: 'stable',
      };
    }

    if (atCap) {
      const finalOutcome = closeHonestlyFrom(candidateOutcome);
      const receipt: GuardEvaluationReceipt = {
        schemaVersion: 'iskra.guard.evaluation.v1',
        receiptId: makeReceiptId(request.turnId, evaluation),
        turnId: request.turnId,
        evaluation,
        previousReceiptId: receipts.at(-1)?.receiptId ?? null,
        inputAlertLevel,
        postGuardAlertLevel: postGuard.alertLevel,
        postGuardMaterialSignal: true,
        alertEscalated: true,
        materialChange: true,
        stability: 'cap_exhausted',
        candidateOutcome,
        effectiveOutcome: finalOutcome,
        authoritative: true,
        reason: postGuard.reason,
      };
      receipts.push(receipt);
      return {
        finalOutcome,
        receipts,
        evaluations: evaluation,
        closure: 'MAX_GUARD_EVALUATIONS_EXHAUSTED',
      };
    }

    receipts.push({
      schemaVersion: 'iskra.guard.evaluation.v1',
      receiptId: makeReceiptId(request.turnId, evaluation),
      turnId: request.turnId,
      evaluation,
      previousReceiptId: receipts.at(-1)?.receiptId ?? null,
      inputAlertLevel,
      postGuardAlertLevel: postGuard.alertLevel,
      postGuardMaterialSignal: true,
      alertEscalated: true,
      materialChange: true,
      stability: 'recompute',
      candidateOutcome,
      effectiveOutcome: null,
      authoritative: false,
      reason: postGuard.reason,
    });

    input = {
      ...input,
      alertLevel: postGuard.alertLevel,
      ews: { alertLevel: postGuard.alertLevel },
    };
  }

  throw new Error('unreachable: bounded guard controller exceeded evaluation cap');
}
