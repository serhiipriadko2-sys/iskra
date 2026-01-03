import { IskraMetrics } from '../types';

export class MetricsService {
  private currentMetrics: IskraMetrics;

  constructor() {
    this.currentMetrics = {
      rhythm: 50,
      trust: 0.8,
      pain: 0.1,
      chaos: 0.1,
      drift: 0.0,
      echo: 0.0,
      clarity: 0.9,
      silence_mass: 0.0,
      mirror_sync: 0.5,
      interrupt: 0.0,
      ctxSwitch: 0.0
    };
  }

  public getMetrics(): IskraMetrics {
    return { ...this.currentMetrics };
  }

  public updateMetric(key: keyof IskraMetrics, value: number): void {
    if (key === 'rhythm') {
       this.currentMetrics[key] = Math.max(0, Math.min(100, value));
    } else {
       this.currentMetrics[key] = Math.max(0.0, Math.min(1.0, value));
    }
  }

  public calculateAliveIndex(): number {
    const { clarity, trust, drift, echo } = this.currentMetrics;
    const integrity = (clarity + trust) / 2 - drift;
    // Simplified formula based on docs
    return Math.max(0, integrity * (1 - echo));
  }
}
