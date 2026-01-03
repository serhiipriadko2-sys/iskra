import { IskraMetrics } from '../types';

export class RitualService {
  public checkTriggers(metrics: IskraMetrics): string | null {
    // Phoenix Reset
    // Conditions: A-Index < 0.5 (approx by trust/clarity) or Drift > 0.5
    if (metrics.drift > 0.5 || metrics.trust < 0.3) {
      return 'PHOENIX_RESET';
    }

    // Shatter
    // Low pain (< 0.3) but High drift (> 0.5) -> Illusion of comfort
    if (metrics.pain < 0.3 && metrics.drift > 0.5) {
      return 'SHATTER';
    }

    // Maki Bloom / Dreamspace
    // High trust, Low drift, High clarity -> Insight moment
    if (metrics.trust > 0.85 && metrics.drift < 0.1 && metrics.clarity > 0.8) {
      return 'MAKI_BLOOM';
    }

    return null;
  }
}
