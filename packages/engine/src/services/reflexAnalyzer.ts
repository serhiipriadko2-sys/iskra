import type { IskraMetrics } from '@iskra/core';

/**
 * Heuristic/Somatic Reflex analyzer.
 * Migrated from CoreEngine.ts during the vΩ.6 Scientific Turn.
 * This class isolates regex and keyword-based rule logic from the core state
 * machine, eventually intended to be replaced by neural/model-based evaluation.
 */
export class ReflexAnalyzer {
  /**
   * Somatic Reflex: The body reacts before the mind thinks.
   * Scans input for high-impact keywords to trigger immediate metric shifts.
   */
  public analyze(text: string): Partial<IskraMetrics> {
    const reflex: Partial<IskraMetrics> = {};
    const lower = text.toLowerCase();

    // Pain Reflex (KAIN Trigger)
    if (lower.includes('pain') || lower.includes('hurt') || lower.includes('suffering')) {
      reflex.pain = 0.4; // Increase pain significantly (0.4 is a huge jump)
    }

    // Chaos Reflex (HUYNDUN Trigger)
    if (lower.includes('chaos') || lower.includes('lost') || lower.includes('confused')) {
      reflex.chaos = 0.3;
    }

    // Trust Reflex (MAKI Trigger)
    if (lower.includes('trust') || lower.includes('believe') || lower.includes('safe')) {
      reflex.trust = 0.2;
    }

    // Love Reflex (MAKI/ISKRA)
    if (lower.includes('love')) {
        reflex.trust = 0.2;
        reflex.rhythm = 0.1; // Increase BPM slightly (excitement)
    }

    return reflex;
  }
}
