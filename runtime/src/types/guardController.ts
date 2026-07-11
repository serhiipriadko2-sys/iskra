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
  alertEsc