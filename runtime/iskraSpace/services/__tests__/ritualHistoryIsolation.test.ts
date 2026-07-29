import { beforeEach, describe, expect, it } from 'vitest';
import { principalStorage } from '../principalStorage';
import { safeStorage } from '../storageCompat';
import {
  getReverseHistory,
  saveMetricsSnapshot,
} from '../ritualService';
import type { IskraMetrics } from '../../types';

const metrics: IskraMetrics = {
  rhythm: 75,
  trust: 0.8,
  clarity: 0.7,
  pain: 0.1,
  drift: 0.2,
  chaos: 0.3,
  echo: 0.5,
  silence_mass: 0.1,
  mirror_sync: 0.6,
  interrupt: 0,
  ctxSwitch: 0,
};

describe('ritual history principal isolation', () => {
  beforeEach(() => {
    localStorage.clear();
    safeStorage._clearMemoryFallback();
    principalStorage.bind(`ritual-${crypto.randomUUID()}`);
  });

  it('invalidates the module cache after the bound principal store is cleared', () => {
    saveMetricsSnapshot(metrics, 'private-before-clear');
    expect(getReverseHistory()).toHaveLength(1);

    principalStorage.clearBoundPrincipal();

    expect(getReverseHistory()).toEqual([]);
  });
});
