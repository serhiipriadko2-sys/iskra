import { useEffect } from 'react';
import type { IskraMetrics } from '@iskra/core';

/**
 * Somatic Feedback Hook
 * SPEC-004: Holographic UI & Somatic Feedback
 *
 * Translates abstract metrics into physical sensations (vibration).
 */
export function useSomaticFeedback(metrics: IskraMetrics) {
  useEffect(() => {
    // Basic browser API check
    if (typeof navigator === 'undefined' || !navigator.vibrate) return;

    // High Pain = Sharp, fast vibration
    if (metrics.pain > 0.7) {
      navigator.vibrate([50, 20, 50, 20]);
    }

    // High Chaos = Erratic bursts
    else if (metrics.chaos > 0.8) {
      // TypeScript might complain about number[] for vibrate if types aren't perfect,
      // but navigator.vibrate accepts pattern arrays.
      const pattern: number[] = Array.from({ length: 5 }, () => Math.random() * 50 + 20);
      navigator.vibrate(pattern);
    }

    // Flow State (Low Pain, Stable Rhythm) = Heartbeat
    else if (metrics.pain < 0.3 && metrics.rhythm > 50 && metrics.rhythm < 80) {
      navigator.vibrate([200, 100, 200]);
    }
  }, [metrics.pain, metrics.chaos, metrics.rhythm]);
}
