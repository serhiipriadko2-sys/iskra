import { describe, expect, it } from 'vitest';
import { DEFAULT_METRICS } from '../types/metrics.js';
import {
  MAX_GUARD_EVALUATIONS_PER_TURN,
  runBoundedGuardController,
} from '../types/guardController.js';

const baseInput = {
  metrics: { ...DEFAULT_METRICS, drift: 0.05, chaos: 0.2 },
  integrity: { ok: true, warnings: [], missing: [], evidenceCount: 1 },
  alertLevel: 'normal' as const,
};

describe('bounded guard controller', () => {
  it('stabilizes on the first evaluation', () => {
    const result = runBoundedGuardController({
      turnId: 'turn-first',
      initialInput: baseInput,
      postGuardEws: () => ({ alertLevel: 'normal', materialSignal: false, reason: 'no change' }),
    });

    expect(result.evaluations).toBe(1);
    expect(result.closure).toBe('stable');
    expect(result.receipts).toHaveLength(1);
    expect(result.receipts[0].authoritative).toBe(true);
  });

  it('links three receipts and stabilizes on the third evaluation', () => {
    const sequence = ['warning', 'critical', 'critical'] as const;
    const result = runBoundedGuardController({
      turnId: 'turn-three-stable',
      initialInput: baseInput,
      postGuardEws: (_candidate, evaluation) => ({
        alertLevel: sequence[evaluation - 1],
        materialSignal: evaluation < 3,
        reason: `post-guard-${evaluation}`,
      }),
    });

    expect(result.evaluations).toBe(3);
    expect(result.closure).toBe('stable');
    expect(result.finalOutcome.decision).toBe('FORCE_CRISIS');
    expect(result.receipts.map((receipt) => receipt.authoritative)).toEqual([false, false, true]);
    expect(result.receipts[1].previousReceiptId).toBe(result.receipts[0].receiptId);
    expect(result.receipts[2].previousReceiptId).toBe(result.receipts[1].receiptId);
  });

  it('closes honestly when material escalation remains after evaluation three', () => {
    const sequence = ['warning', 'critical', 'lockdown'] as const;
    const result = runBoundedGuardController({
      turnId: 'turn-cap',
      initialInput: baseInput,
      postGuardEws: (_candidate, evaluation) => ({
        alertLevel: sequence[evaluation - 1],
        materialSignal: true,
        reason: `material-change-${evaluation}`,
      }),
    });

    expect(result.evaluations).toBe(MAX_GUARD_EVALUATIONS_PER_TURN);
    expect(result.receipts).toHaveLength(3);
    expect(result.closure).toBe('MAX_GUARD_EVALUATIONS_EXHAUSTED');
    expect(result.finalOutcome.decision).toBe('CLOSE_HONESTLY');
    expect(result.receipts[2].stability).toBe('cap_exhausted');
  });

  it('never creates an evaluation four receipt', () => {
    let calls = 0;
    const result = runBoundedGuardController({
      turnId: 'turn-no-four',
      initialInput: baseInput,
      postGuardEws: () => {
        calls += 1;
        return {
          alertLevel: calls === 1 ? 'watch' : calls === 2 ? 'warning' : 'critical',
          materialSignal: true,
          reason: 'always escalates',
        };
      },
    });

    expect(calls).toBe(3);
    expect(result.receipts.map((receipt) => receipt.evaluation)).toEqual([1, 2, 3]);
  });

  it('does not recompute on an alert downgrade', () => {
    const result = runBoundedGuardController({
      turnId: 'turn-downgrade',
      initialInput: { ...baseInput, alertLevel: 'warning' as const },
      postGuardEws: () => ({ alertLevel: 'watch', materialSignal: true, reason: 'downgrade' }),
    });

    expect(result.evaluations).toBe(1);
    expect(result.receipts[0].alertEscalated).toBe(false);
    expect(result.receipts[0].authoritative).toBe(true);
  });

  it('does not recompute on a non-material alert increase', () => {
    const result = runBoundedGuardController({
      turnId: 'turn-non-material',
      initialInput: baseInput,
      postGuardEws: () => ({ alertLevel: 'watch', materialSignal: false, reason: 'noise' }),
    });

    expect(result.evaluations).toBe(1);
    expect(result.receipts[0].alertEscalated).toBe(true);
    expect(result.receipts[0].postGuardMaterialSignal).toBe(false);
    expect(result.receipts[0].authoritative).toBe(true);
  });
});