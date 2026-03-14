import {
  AlertLevel,
  PhaseTransition,
  PlaybookSwitchDecision,
  DEFAULT_EWS_CONFIG,
  EWSConfig,
  IskraMetrics,
  FractalIndicators,
  PlaybookId,
  VoiceID
} from '@iskra/core';

export function determineAlertLevel(
  metrics: IskraMetrics,
  fractal: FractalIndicators,
  config: EWSConfig = DEFAULT_EWS_CONFIG,
  aliveIndex?: number
): AlertLevel {
  const { thresholds } = config;
  const hasCriticalAliveIndex =
    typeof aliveIndex === 'number' &&
    !Number.isNaN(aliveIndex) &&
    aliveIndex <= thresholds.critical.alive_index;

  if (
    fractal.D_chaos >= thresholds.critical.D_chaos ||
    metrics.drift >= thresholds.critical.drift ||
    hasCriticalAliveIndex ||
    metrics.interrupt > 0.7 ||
    fractal.edgeDistance < 0.1
  ) {
    return 'critical';
  }

  if (
    fractal.D_chaos >= thresholds.warning.D_chaos ||
    metrics.drift >= thresholds.warning.drift ||
    metrics.trust < thresholds.warning.trust ||
    metrics.pain > 0.5
  ) {
    return 'warning';
  }

  if (
    fractal.D_chaos >= thresholds.watch.D_chaos ||
    metrics.drift >= thresholds.watch.drift ||
    fractal.complexityIndex > 0.7
  ) {
    return 'watch';
  }

  return 'normal';
}

export function decidePlaybookSwitch(
  currentPlaybook: PlaybookId,
  alertLevel: AlertLevel,
  transition: PhaseTransition | null
): PlaybookSwitchDecision {
  if (alertLevel === 'critical') {
    return {
      currentPlaybook,
      recommendedPlaybook: 'crisis',
      shouldSwitch: currentPlaybook !== 'crisis',
      reason: 'CRITICAL alert level reached',
      urgency: 'immediate',
    };
  }

  if (alertLevel === 'warning' && currentPlaybook !== 'shadow' && currentPlaybook !== 'crisis') {
    return {
      currentPlaybook,
      recommendedPlaybook: 'shadow',
      shouldSwitch: true,
      reason: 'WARNING alert with emotional indicators',
      urgency: 'high',
    };
  }

  if (transition && transition.probability > 0.7 && transition.timeToTransition < 5) {
    const recommended = transition.toPhase === 'chaotic' ? 'crisis' : 'shadow';
    return {
      currentPlaybook,
      recommendedPlaybook: recommended,
      shouldSwitch: currentPlaybook !== recommended,
      reason: `Phase transition predicted: ${transition.fromPhase} → ${transition.toPhase}`,
      urgency: 'medium',
    };
  }

  return {
    currentPlaybook,
    recommendedPlaybook: currentPlaybook,
    shouldSwitch: false,
    reason: 'No switch needed',
    urgency: 'low',
  };
}

function normalizeWeights(weights: Record<VoiceID, number>): Record<VoiceID, number> {
  const total = Object.values(weights).reduce((a, b) => a + b, 0);
  if (total === 0) return weights;

  const normalized: Record<VoiceID, number> = {} as Record<VoiceID, number>;
  for (const [key, value] of Object.entries(weights)) {
    normalized[key as VoiceID] = value / total;
  }
  return normalized;
}

export function adjustVoiceWeightsForAlert(
  baseWeights: Record<VoiceID, number>,
  alertLevel: AlertLevel
): Record<VoiceID, number> {
  const adjusted = { ...baseWeights };

  switch (alertLevel) {
    case 'watch':
      adjusted.ISKRIV = (adjusted.ISKRIV || 0) * 1.3;
      adjusted.SAM = (adjusted.SAM || 0) * 1.1;
      break;

    case 'warning':
      adjusted.KAIN = (adjusted.KAIN || 0) * 1.5;
      adjusted.ANHANTRA = (adjusted.ANHANTRA || 0) * 1.4;
      adjusted.PINO = (adjusted.PINO || 0) * 0.5;
      break;

    case 'critical':
      adjusted.KAIN = 2.0;
      adjusted.ANHANTRA = 1.8;
      adjusted.SAM = 1.5;
      adjusted.MAKI = 1.3;
      adjusted.PINO = 0;
      adjusted.HUYNDUN = 0.5;
      break;

    case 'lockdown':
      Object.keys(adjusted).forEach(k => {
        adjusted[k as VoiceID] = 0;
      });
      adjusted.SAM = 1.0;
      adjusted.MAKI = 1.0;
      break;
  }

  return normalizeWeights(adjusted);
}

export function adjustTemperatureForAlert(
  baseTemperature: number,
  alertLevel: AlertLevel
): number {
  const adjustments: Record<AlertLevel, number> = {
    normal: 0,
    watch: -0.1,
    warning: -0.2,
    critical: -0.3,
    lockdown: -0.4,
  };

  return Math.max(0.1, baseTemperature + adjustments[alertLevel]);
}
