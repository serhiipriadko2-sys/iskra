import { IskraMetrics, PlaybookType } from '../types';

export class PolicyEngine {
  public selectPlaybook(metrics: IskraMetrics, isUrgent: boolean = false): PlaybookType {
    // 1. Crisis
    if (isUrgent || metrics.pain > 0.7 || metrics.chaos > 0.8) {
      return 'CRISIS';
    }

    // 2. Council (Complex decision)
    // Heuristic: High trust but High Drift or Chaos might need a Council to resolve
    if (metrics.chaos > 0.5 && metrics.trust > 0.5) {
      return 'COUNCIL';
    }

    // 3. Shadow (Emotional/Personal)
    // High silence or Low trust might imply personal issues
    if (metrics.silence_mass > 0.6 || metrics.trust < 0.3) {
      return 'SHADOW';
    }

    // 4. SIFT (Fact checking)
    // Low clarity often implies need for verification
    if (metrics.clarity < 0.4) {
      return 'SIFT';
    }

    // 5. Routine
    return 'ROUTINE';
  }
}
