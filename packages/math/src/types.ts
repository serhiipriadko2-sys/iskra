/**
 * ISKRA Metrics Types
 * (Temporary copy for isolation, will be moved to @iskra/core later)
 */

export interface IskraMetrics {
  rhythm: number;
  trust: number;
  pain: number;
  chaos: number;
  drift: number;
  echo: number;
  clarity: number;
  silence_mass: number;
  mirror_sync: number;
  interrupt: number;
  ctxSwitch: number;
}

export const DEFAULT_METRICS: IskraMetrics = {
  rhythm: 60,
  trust: 0.7,
  pain: 0.1,
  chaos: 0.2,
  drift: 0.1,
  echo: 0.1,
  clarity: 0.8,
  silence_mass: 0.1,
  mirror_sync: 0.7,
  interrupt: 0.1,
  ctxSwitch: 0.2,
};
