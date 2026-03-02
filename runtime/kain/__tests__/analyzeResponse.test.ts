import { describe, it, expect } from 'vitest';
import { analyzeResponse } from '../src/index';

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
});