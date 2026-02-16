import { useState, useEffect } from 'react';
import { metricsEngine } from '@iskra/engine';
import { IskraMetrics, DEFAULT_METRICS } from '@iskra/core';

/**
 * useEngine Hook
 * Connects the React UI to the @iskra/engine singleton
 */
export function useEngine() {
  const [metrics, setMetrics] = useState<IskraMetrics>(DEFAULT_METRICS);

  // Poll for metrics updates (simple version, ideally would be event-driven)
  useEffect(() => {
    const interval = setInterval(() => {
      setMetrics(metricsEngine.getCurrentMetrics());
    }, 100); // 10fps update rate

    return () => clearInterval(interval);
  }, []);

  const updateInput = (text: string) => {
    // Process input through the engine
    // Heuristic: Input activity increases rhythm temporarily
    metricsEngine.update({ rhythm: Math.min(100, metrics.rhythm + 5) }, text);
  };

  return {
    metrics,
    updateInput
  };
}
