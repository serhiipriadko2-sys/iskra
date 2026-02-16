import { useEffect } from 'react';
import type { IskraMetrics } from '@iskra/core';

export function useSomaticFeedback(metrics: IskraMetrics) {
  useEffect(() => {
    if (typeof navigator === 'undefined' || !navigator.vibrate) return;

    if (metrics.pain > 0.7) {
      navigator.vibrate([50, 20, 50, 20]);
    } else if (metrics.chaos > 0.8) {
      const pattern = Array.from({ length: 5 }, () => Math.random() * 50 + 20);
      navigator.vibrate(pattern);
    } else if (metrics.pain < 0.3 && metrics.rhythm > 50 && metrics.rhythm < 80) {
      navigator.vibrate([200, 100, 200]);
    }
  }, [metrics.pain, metrics.chaos, metrics.rhythm]);
}
