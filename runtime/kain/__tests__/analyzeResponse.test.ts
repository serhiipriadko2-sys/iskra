import { describe, it, expect } from 'vitest';
import { analyzeResponse } from '../src/index';
import type { IskraMetrics } from '@iskra/runtime/src/types/metrics';

const BASE_METRICS: IskraMetrics = {
  pain: 0.1,
  drift: 0.1,
  echo: 0.1,
  chaos: 0.1,
  trust: 0.8,
  silence_mass: 0,
  rhythm: 60,
  mirror_sync: 0.5,
  interrupt: 0,
  ctxSwitch: 0,
  clarity: 0.8,
};

describe('analyzeResponse (kain plugin)', () => {
  it('triggers repair when pain is high', () => {
    const signal = analyzeResponse('test', { ...BASE_METRICS, pain: 0.5 });
    expect(signal.repairNeeded).toBe(true);
  });

  it('triggers repair when drift is high', () => {
    const signal = analyzeResponse('test', { ...BASE_METRICS, drift: 0.6 });
    expect(signal.repairNeeded).toBe(true);
  });

  it('triggers repair when lexical echo is high in response', () => {
    const signal = analyzeResponse('echo echo echo', BASE_METRICS);
    expect(signal.repairNeeded).toBe(true);
  });

  it('does not trigger repair when metrics are low', () => {
    const signal = analyzeResponse('clean response', BASE_METRICS);
    expect(signal.repairNeeded).toBe(false);
  });
});
