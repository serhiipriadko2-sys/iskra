import { describe, it, expect } from 'vitest';
import { analyzeResponse, decideRepairNextStep } from '../index';

describe('analyzeResponse (kain plugin)', () => {
  it('triggers repair when pain is high', () => {
    const signal = analyzeResponse('test', { pain: 0.5 } as any);
    expect(signal.repairNeeded).toBe(true);
  });

  it('triggers repair when drift is high', () => {
    const signal = analyzeResponse('test', { drift: 0.6 } as any);
    expect(signal.repairNeeded).toBe(true);
  });

  it('does not trigger repair when metrics are low', () => {
    const signal = analyzeResponse('test', { pain: 0.1, drift: 0.1, echo: 0.1, chaos: 0.1 } as any);
    expect(signal.repairNeeded).toBe(false);
  });

  it('asks for repair only once before waiting', () => {
    const next = decideRepairNextStep({
      repairNeeded: true,
      promptsAsked: 0,
      silenceMass: 0.1,
      elapsedMs: 0,
    });

    expect(next).toEqual({
      action: 'ask_once',
      status: 'waiting',
      voice: 'KAIN',
      reason: 'ask_repair_boundary_once',
    });
  });

  it('closes unresolved after one unanswered repair prompt', () => {
    const next = decideRepairNextStep({
      repairNeeded: true,
      promptsAsked: 1,
      silenceMass: 0.1,
      elapsedMs: 10_000,
    });

    expect(next.action).toBe('close_unresolved');
    expect(next.status).toBe('unresolved');
    expect(next.voice).toBe('ANHANTRA');
    expect(next.reason).toBe('repair_prompt_limit_reached');
  });

  it('closes unresolved when silence_mass crosses boundary', () => {
    const next = decideRepairNextStep({
      repairNeeded: true,
      promptsAsked: 0,
      silenceMass: 0.8,
      elapsedMs: 1_000,
    });

    expect(next.action).toBe('close_unresolved');
    expect(next.status).toBe('unresolved');
    expect(next.reason).toBe('silence_mass_boundary');
  });

  it('closes unresolved when repair wait times out', () => {
    const next = decideRepairNextStep({
      repairNeeded: true,
      promptsAsked: 0,
      silenceMass: 0.1,
      elapsedMs: 120_000,
      timeoutMs: 120_000,
    });

    expect(next.action).toBe('close_unresolved');
    expect(next.status).toBe('unresolved');
    expect(next.reason).toBe('repair_timeout');
  });
});
