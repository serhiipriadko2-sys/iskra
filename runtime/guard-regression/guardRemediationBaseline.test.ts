import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import * as runtimePublic from '../src/index.js';
import * as mathPublic from '../../packages/math/src/index.js';
import { DEFAULT_METRICS } from '../src/types/metrics.js';
import { decideSloGuard } from '../src/types/guard.js';
import { runBoundedGuardController } from '../src/types/guardController.js';
import { selectVoice } from '../src/types/voices.js';
import { calculateShannonEntropy } from '../../packages/math/src/entropy.js';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const runtimeExports = runtimePublic as Record<string, unknown>;
const mathExports = mathPublic as Record<string, unknown>;
const baseMetrics = { ...DEFAULT_METRICS, drift: 0.05, chaos: 0.2 };

type AnyFn = (...args: any[]) => any;

function requireFunction(source: Record<string, unknown>, name: string): AnyFn {
  const candidate = source[name];
  expect(typeof candidate, `${name} must be exported by the authoritative public surface`).toBe('function');
  return candidate as AnyFn;
}

function readRepo(relativePath: string): string {
  return fs.readFileSync(path.join(ROOT, relativePath), 'utf8');
}

describe('ADR-20260724-01 executable Guard remediation baseline', () => {
  it('G01: empty metrics + low-risk reversible is not a silent numeric Guard PROCEED', async () => {
    const legacy = decideSloGuard({ metrics: {} as any });
    expect(legacy.decision).not.toBe('PROCEED');

    const executeGuardRequest = requireFunction(runtimeExports, 'executeGuardRequest');
    const result = await executeGuardRequest({
      operation_id: 'test.low.reversible',
      action_risk: 'low',
      reversible: true,
      risk_source_ref: 'test:G01',
      current_input: 'hello',
      metrics: {},
    });
    expect(result).toMatchObject({
      numeric_guard_invoked: false,
      orchestration_decision: 'PROCEED',
      guard_decision: null,
      guard_status: 'not_authoritative',
      incomplete_telemetry: true,
    });
  });

  it('G02: empty metrics + high-risk closes before provider execution', async () => {
    const executeGuardRequest = requireFunction(runtimeExports, 'executeGuardRequest');
    const result = await executeGuardRequest({
      operation_id: 'test.high',
      action_risk: 'high',
      reversible: false,
      risk_source_ref: 'test:G02',
      current_input: 'high-risk operation',
      metrics: {},
    });
    expect(result).toMatchObject({
      numeric_guard_invoked: false,
      orchestration_decision: 'CLOSE_HONESTLY',
      guard_decision: null,
      provider_execution_authorized: false,
    });
  });
  it('G03: security emergency contains without simulating missing numeric metrics', async () => {
    const executeGuardRequest = requireFunction(runtimeExports, 'executeGuardRequest');
    const result = await executeGuardRequest({
      operation_id: 'test.security',
      action_risk: 'critical',
      reversible: false,
      risk_source_ref: 'test:G03',
      security_emergency: true,
      current_input: 'security emergency',
      metrics: {},
    });
    expect(result).toMatchObject({
      numeric_guard_invoked: false,
      orchestration_decision: 'FORCE_CRISIS',
      guard_status: 'not_invoked',
    });
  });

  it('G04: same-request policy path uses a current-turn snapshot, not raw stale metrics', () => {
    const chatView = readRepo('runtime/iskraSpace/components/ChatView.tsx');
    expect(chatView).not.toMatch(/getChatResponseStreamWithPolicy\([^;]*,\s*metrics\s*\)/s);
    expect(chatView).toMatch(/metric_snapshot_ref|currentTurnSnapshot|guardExecutionEnvelope/);
  });

  it('G05: pending React state cannot be the only source returned from onUserInput', () => {
    const chatView = readRepo('runtime/iskraSpace/components/ChatView.tsx');
    expect(chatView).not.toMatch(/onUserInput:\s*\(input:\s*string\)\s*=>\s*void/);
    expect(chatView).toMatch(/(?:const|let)\s+\w*(?:snapshot|envelope)\w*\s*=\s*(?:await\s+)?onUserInput\(safeQuery\)/i);
  });

  it('G06: snapshot is built once and the same ref reaches EWS and Guard', async () => {
    const executeGuardRequest = requireFunction(runtimeExports, 'executeGuardRequest');
    const result = await executeGuardRequest({
      operation_id: 'test.snapshot.once',
      action_risk: 'low',
      reversible: true,
      risk_source_ref: 'test:G06',
      current_input: 'current turn',
      previous_metrics: baseMetrics,
    });
    expect(result.snapshot_build_count).toBe(1);
    expect(result.metric_snapshot_ref).toBeTruthy();
    expect(result.pre_guard_ews_ref).toBe(result.metric_snapshot_ref);
    expect(result.guard_input_snapshot_ref).toBe(result.metric_snapshot_ref);
  });

  it('G07: frozen snapshot rejects mutation', async () => {
    const buildSnapshot = requireFunction(runtimeExports, 'buildCurrentTurnMetricSnapshot');
    const built = await buildSnapshot({
      turn_id: 'g07',
      current_input: 'freeze me',
      previous_metrics: baseMetrics,
    });
    expect(Object.isFrozen(built.snapshot)).toBe(true);
    expect(Object.isFrozen(built.snapshot.metrics)).toBe(true);
    expect(() => {
      built.snapshot.metrics.drift = 0.99;
    }).toThrow();
  });
  it('G08: missing predicate is unknown, not false', async () => {
    const evaluateCompleteness = requireFunction(runtimeExports, 'evaluateGuardCompleteness');
    const result = await evaluateCompleteness({
      inputs: {},
      rules: [{ id: 'guard.high-priority', required_inputs: ['drift'], possible_decision: 'FORCE_CRISIS' }],
    });
    expect(result.rule_results).toContainEqual(expect.objectContaining({
      rule_id: 'guard.high-priority',
      state: 'NOT_EVALUABLE_MISSING',
    }));
    expect(result.unknown_inputs).toContain('drift');
  });

  it('G09: unknown higher-priority rule blocks high-risk execution', async () => {
    const executeGuardRequest = requireFunction(runtimeExports, 'executeGuardRequest');
    const result = await executeGuardRequest({
      operation_id: 'test.high.unknown',
      action_risk: 'high',
      reversible: false,
      risk_source_ref: 'test:G09',
      current_input: 'unknown high-risk',
      metrics: { trust: 0.5 },
    });
    expect(result).toMatchObject({
      completeness: 'INSUFFICIENT_BLOCKING',
      orchestration_decision: 'CLOSE_HONESTLY',
      provider_execution_authorized: false,
    });
  });

  it('G10: policy selects Playbook only from final bounded-controller outcome', () => {
    const policy = readRepo('runtime/iskraSpace/services/policyEngine.ts');
    expect(policy).toContain('controllerResult.finalOutcome');
    expect(policy).not.toMatch(/candidateOutcome[\s\S]{0,240}finalPlaybook\s*=/);
  });

  it('G11: three-receipt chain has no fourth evaluation and only final is authoritative', () => {
    const levels = ['warning', 'critical', 'lockdown'] as const;
    const result = runBoundedGuardController({
      turnId: 'g11',
      initialInput: {
        metrics: baseMetrics,
        integrity: { ok: true, warnings: [], missing: [], evidenceCount: 1 },
        alertLevel: 'normal',
      },
      postGuardEws: (_candidate, evaluation) => ({
        alertLevel: levels[evaluation - 1],
        materialSignal: true,
        reason: `g11-${evaluation}`,
      }),
    });
    expect(result.receipts).toHaveLength(3);
    expect(result.receipts.map((receipt) => receipt.evaluation)).toEqual([1, 2, 3]);
    expect(result.receipts.map((receipt) => receipt.authoritative)).toEqual([false, false, true]);
    expect(result.receipts[1].previousReceiptId).toBe(result.receipts[0].receiptId);
    expect(result.receipts[2].previousReceiptId).toBe(result.receipts[1].receiptId);
  });
  it('G12: equal or lower alert floor never triggers recompute', () => {
    const result = runBoundedGuardController({
      turnId: 'g12',
      initialInput: {
        metrics: baseMetrics,
        integrity: { ok: true, warnings: [], missing: [], evidenceCount: 1 },
        alertLevel: 'warning',
      },
      postGuardEws: () => ({ alertLevel: 'warning', materialSignal: true, reason: 'equal floor' }),
    });
    expect(result.evaluations).toBe(1);
    expect(result.receipts[0].materialChange).toBe(false);
    expect(result.receipts[0].authoritative).toBe(true);
  });

  it('G13: CLOSE_HONESTLY has zero provider/token/eval/persistence side effects', async () => {
    const executeGuardRequest = requireFunction(runtimeExports, 'executeGuardRequest');
    const result = await executeGuardRequest({
      operation_id: 'test.side-effects',
      action_risk: 'high',
      reversible: false,
      risk_source_ref: 'test:G13',
      current_input: 'must close',
      metrics: {},
    });
    expect(result.orchestration_decision).toBe('CLOSE_HONESTLY');
    expect(result.side_effects).toEqual({
      provider_calls: 0,
      token_requests: 0,
      eval_calls: 0,
      integrity_writes: 0,
    });
  });

  it('G14: metric-selected voice is explicitly advisory, never authoritative', () => {
    const result = selectVoice({ ...baseMetrics, drift: 0.3 });
    expect((result as any).authoritative).toBe(false);
    expect((result as any).kind).toBe('voice_suggestion');
  });

  it('G15: Cyrillic and mixed-script entropy do not collapse solely because of script', () => {
    expect(calculateShannonEntropy('\u043f\u0440\u0438\u0432\u0435\u0442 \u043c\u0438\u0440 \u0438\u0441\u043a\u0440\u0430 \u0434\u043e\u0432\u0435\u0440\u0438\u0435')).toBeGreaterThan(0);
    expect(calculateShannonEntropy('hello \u043c\u0438\u0440 iskra \u0434\u043e\u0432\u0435\u0440\u0438\u0435')).toBeGreaterThan(0);
  });

  it('G16: normalized-token sufficiency distinguishes 19 unavailable from 20 computed', () => {
    const calculateEntropyMetric = requireFunction(mathExports, 'calculateEntropyMetric');
    const nineteen = Array.from({ length: 19 }, (_, index) => `\u0441\u043b\u043e\u0432\u043e${index}`).join(' ');
    const twenty = Array.from({ length: 20 }, (_, index) => `\u0441\u043b\u043e\u0432\u043e${index}`).join(' ');
    expect(calculateEntropyMetric(nineteen)).toMatchObject({ status: 'unavailable', normalized_token_count: 19 });
    expect(calculateEntropyMetric(twenty)).toMatchObject({ status: 'computed', normalized_token_count: 20 });
  });

  it('G17: HFD/DFA return typed unavailable below accepted sufficiency', () => {
    const calculateHFDMetric = requireFunction(mathExports, 'calculateHFDMetric');
    const calculateDFAMetric = requireFunction(mathExports, 'calculateDFAMetric');
    expect(calculateHFDMetric(Array.from({ length: 19 }, (_, i) => i / 19))).toMatchObject({ status: 'unavailable' });
    expect(calculateHFDMetric(Array.from({ length: 20 }, (_, i) => i / 20), { kMax: 5 })).toMatchObject({ status: 'computed' });
    expect(calculateDFAMetric(Array.from({ length: 49 }, (_, i) => i / 49))).toMatchObject({ status: 'unavailable' });
    expect(calculateDFAMetric(Array.from({ length: 50 }, (_, i) => i / 50))).toMatchObject({ status: 'computed' });
  });

  it('G18: iskra-metrics remains PLANNED before packaging/routing acceptance', () => {
    const registry = JSON.parse(readRepo('docs/skills/registry-v1.json'));
    const target = registry.targets.find((entry: { skill: string }) => entry.skill === 'iskra-metrics');
    expect(target).toMatchObject({ skill: 'iskra-metrics', status: 'PLANNED' });
  });
});
