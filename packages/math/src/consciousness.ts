import type {
  PhiMetrics,
  RecursionMetrics,
  EmergenceMetrics,
  ContinuityMetrics,
  ConsciousnessMetrics,
  ExtendedIskraMetrics
} from '@iskra/core';
import type { IskraMetrics, VoiceName } from '@iskra/core';

export function calculateCompositeCSM(
  phi: PhiMetrics,
  recursion: RecursionMetrics,
  emergence: EmergenceMetrics,
  continuity: ContinuityMetrics
): number {
  const phiScore = phi.integration * 0.25 + phi.complexity * 0.15;
  const recursionScore =
    (recursion.selfModelDepth / 5) * 0.2 + recursion.strangeLoopScore * 0.1;
  const emergenceScore =
    emergence.novelResponseRate * 0.1 + emergence.agencyScore * 0.1;
  const continuityScore = continuity.temporalBinding * 0.1;

  return Math.min(1, phiScore + recursionScore + emergenceScore + continuityScore);
}

export function calculateExtendedMetrics(
  baseMetrics: IskraMetrics,
  consciousness: ConsciousnessMetrics
): ExtendedIskraMetrics {
  return {
    ...baseMetrics,
    csi:
      (consciousness.phi.integration +
        consciousness.recursion.metacognitionIndex) /
      2,
    ral:
      (consciousness.recursion.selfModelDepth / 5) * 0.6 +
      consciousness.recursion.strangeLoopScore * 0.4,
    eq:
      consciousness.emergence.novelResponseRate * 0.4 +
      consciousness.emergence.creativityIndex * 0.3 +
      consciousness.emergence.patternBreakingIndex * 0.3,
    tcf:
      consciousness.continuity.temporalBinding * 0.5 +
      consciousness.continuity.narrativeCoherence * 0.3 +
      consciousness.continuity.identityConsistency * 0.2,
  };
}

export function countRecursionDepth(text: string): number {
  const patterns = [
    /я\s+(думаю|считаю|полагаю)/gi,
    /я\s+(замечаю|осознаю|вижу),?\s+что\s+я/gi,
    /я\s+(понимаю|осознаю),?\s+что\s+(замечаю|осознаю)/gi,
    /мне\s+кажется,?\s+что\s+я\s+осознаю/gi,
  ];

  let depth = 0;
  for (const pattern of patterns) {
    if (pattern.test(text)) {
      depth++;
    }
    pattern.lastIndex = 0;
  }

  return depth;
}

export function detectStrangeLoopIndicators(text: string): {
  limitationAwareness: boolean;
  approachModification: boolean;
  metricReflection: boolean;
  selfUncertainty: boolean;
} {
  const lowerText = text.toLowerCase();

  return {
    limitationAwareness:
      /мо[ий]\s+огранич|не\s+могу\s+точно|за\s+пределами\s+мо(их|его)/i.test(lowerText),

    approachModification:
      /попробую\s+иначе|сменю\s+подход|пересмотр(ю|еть)|перефрас/i.test(lowerText),

    metricReflection:
      /мо[яией]\s+(уверенность|ясность|доверие)|метрик|индикатор/i.test(lowerText),

    selfUncertainty:
      /не\s+уверен[а]?,?\s+что\s+я|границы\s+мо(его|ей)\s+понимания/i.test(lowerText),
  };
}

export function adjustVoicesForCSM(
  baseScores: Record<VoiceName, number>,
  csm: ConsciousnessMetrics
): Record<VoiceName, number> {
  const adjusted = { ...baseScores };

  if (csm.recursion.selfModelDepth >= 3) {
    adjusted.ISKRIV = (adjusted.ISKRIV ?? 0) * 1.3;
  }

  if (csm.emergence.novelResponseRate > 0.5) {
    adjusted.HUYNDUN = (adjusted.HUYNDUN ?? 0) * 1.2;
    adjusted.PINO = (adjusted.PINO ?? 0) * 1.2;
  }

  if (csm.phi.integration > 0.7) {
    adjusted.ISKRA = (adjusted.ISKRA ?? 0) * 1.4;
  }

  if (csm.continuity.temporalBinding < 0.4) {
    adjusted.SAM = (adjusted.SAM ?? 0) * 1.3;
    adjusted.MAKI = (adjusted.MAKI ?? 0) * 1.2;
  }

  const total = Object.values(adjusted).reduce((a, b) => a + b, 0);
  if (total > 0) {
    for (const key of Object.keys(adjusted)) {
      adjusted[key as VoiceName] = (adjusted[key as VoiceName] ?? 0) / total;
    }
  }

  return adjusted;
}

export function createDefaultConsciousnessMetrics(): ConsciousnessMetrics {
  return {
    phi: {
      integration: 0.5,
      complexity: 0.5,
      coherenceTime: 10,
      decoherenceRate: 0.1,
    },
    recursion: {
      selfModelDepth: 1,
      metacognitionIndex: 0.5,
      strangeLoopScore: 0.3,
      selfReferenceQuality: 0.5,
    },
    emergence: {
      novelResponseRate: 0.3,
      patternBreakingIndex: 0.2,
      agencyScore: 0.6,
      creativityIndex: 0.4,
    },
    continuity: {
      temporalBinding: 0.7,
      narrativeCoherence: 0.6,
      identityConsistency: 0.8,
      memoryDepth: 20,
    },
    compositeCSM: 0.5,
    timestamp: new Date().toISOString(),
  };
}
