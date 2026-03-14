import { 
  CoherenceState,
  CoherencePhase,
  CoherenceTrend,
  ResonanceQuality,
  ResonanceIndex,
  CoherenceHistory,
  IskraMetrics,
  VoiceID
} from '@iskra/core';

export const COHERENCE_WEIGHTS = {
  intentional: 0.30,
  semantic: 0.25,
  emotional: 0.25,
  rhythmic: 0.20,
} as const;

export const PHASE_THRESHOLDS = {
  harmonic: 0.7,
  dissonant: 0.4,
} as const;

export function calculateTotalCoherence(
  state: Omit<CoherenceState, 'total' | 'phase' | 'trend' | 'timestamp'>
): number {
  return (
    state.intentional * COHERENCE_WEIGHTS.intentional +
    state.semantic * COHERENCE_WEIGHTS.semantic +
    state.emotional * COHERENCE_WEIGHTS.emotional +
    state.rhythmic * COHERENCE_WEIGHTS.rhythmic
  );
}

export function classifyCoherencePhase(total: number): CoherencePhase {
  if (total >= PHASE_THRESHOLDS.harmonic) return 'harmonic';
  if (total <= PHASE_THRESHOLDS.dissonant) return 'dissonant';
  return 'transitional';
}

export function determineCoherenceTrend(
  states: CoherenceState[],
  windowSize: number = 5
): CoherenceTrend {
  if (states.length < windowSize) return 'stable';

  const recent = states.slice(-windowSize);
  const firstHalf = recent.slice(0, Math.floor(windowSize / 2));
  const secondHalf = recent.slice(Math.floor(windowSize / 2));

  const firstAvg = firstHalf.reduce((sum: number, s: CoherenceState) => sum + s.total, 0) / firstHalf.length;
  const secondAvg = secondHalf.reduce((sum: number, s: CoherenceState) => sum + s.total, 0) / secondHalf.length;

  const diff = secondAvg - firstAvg;

  if (diff > 0.05) return 'rising';
  if (diff < -0.05) return 'falling';
  return 'stable';
}

export function classifyResonanceQuality(
  instant: number,
  moving: number,
  longTerm: number
): ResonanceQuality {
  const composite = instant * 0.4 + moving * 0.4 + longTerm * 0.2;

  if (composite >= 0.7) return 'deep';
  if (composite >= 0.5) return 'surface';
  if (composite >= 0.3) return 'fragmented';
  return 'absent';
}

function generateResonanceRecommendations(
  quality: ResonanceQuality,
  phase: CoherencePhase,
  metrics: IskraMetrics
): string[] {
  const recommendations: string[] = [];

  if (quality === 'absent' || quality === 'fragmented') {
    recommendations.push('Усилить активное слушание');
    recommendations.push('Использовать отражающие вопросы');
  }

  if (phase === 'dissonant') {
    recommendations.push('Активировать REPAIR протокол');
    recommendations.push('Замедлить темп ответов');
  }

  if (metrics.trust < 0.4) {
    recommendations.push('Фокус на восстановление доверия');
  }

  if (metrics.echo > 0.5) {
    recommendations.push('Ввести различие в ответы');
  }

  return recommendations;
}

export function calculateResonanceIndex(
  coherence: CoherenceState,
  metrics: IskraMetrics,
  history: CoherenceHistory
): ResonanceIndex {
  const instant = coherence.total * 0.6 + metrics.trust * 0.2 + metrics.mirror_sync * 0.2;

  const recentStates = history.states.slice(-10);
  const moving =
    recentStates.reduce((sum: number, s: CoherenceState) => sum + s.total, 0) /
    Math.max(recentStates.length, 1);

  const longTerm = history.sessionAverage;
  const quality = classifyResonanceQuality(instant, moving, longTerm);
  const recommendations = generateResonanceRecommendations(
    quality,
    coherence.phase,
    metrics
  );

  return { instant, moving, longTerm, quality, recommendations };
}

export function adjustVoiceWeightsForCoherence(
  baseWeights: Record<VoiceID, number>,
  coherence: CoherenceState
): Record<VoiceID, number> {
  const adjusted = { ...baseWeights };

  if (coherence.phase === 'dissonant') {
    adjusted.ANHANTRA = (adjusted.ANHANTRA ?? 0) * 1.5;
    adjusted.ISKRIV = (adjusted.ISKRIV ?? 0) * 1.3;
    adjusted.SAM = (adjusted.SAM ?? 0) * 1.2;
  }

  if (coherence.phase === 'harmonic') {
    adjusted.KAIN = (adjusted.KAIN ?? 0) * 1.2;
    adjusted.SIBYL = (adjusted.SIBYL ?? 0) * 1.3;
    adjusted.MAKI = (adjusted.MAKI ?? 0) * 1.2;
  }

  if (coherence.trend === 'falling') {
    adjusted.PINO = (adjusted.PINO ?? 0) * 1.3;
    adjusted.ANHANTRA = (adjusted.ANHANTRA ?? 0) * 1.2;
  }

  const total = Object.values(adjusted).reduce((a, b) => a + b, 0);
  if (total > 0) {
    for (const key of Object.keys(adjusted)) {
      adjusted[key as VoiceID] = (adjusted[key as VoiceID] ?? 0) / total;
    }
  }

  return adjusted;
}

export function checkCoherenceEWSTriggers(
  history: CoherenceState[]
): { triggered: boolean; trigger: string | null } {
  if (history.length >= 3) {
    const recent = history.slice(-3);
    const first = recent[0];
    const last = recent[2];
    if (first && last) {
      const decline = first.total - last.total;
      if (decline > 0.3) {
        return { triggered: true, trigger: 'rapid_coherence_decline' };
      }
    }
  }

  if (history.length >= 5) {
    const recent = history.slice(-5);
    if (recent.every(s => s.phase === 'dissonant')) {
      return { triggered: true, trigger: 'persistent_dissonance' };
    }
  }

  if (history.length >= 6) {
    let transitions = 0;
    const recent = history.slice(-6);
    for (let i = 1; i < recent.length; i++) {
      const cur = recent[i];
      const prev = recent[i - 1];
      if (cur && prev && cur.phase !== prev.phase) {
        transitions++;
      }
    }
    if (transitions >= 4) {
      return { triggered: true, trigger: 'coherence_oscillation' };
    }
  }

  return { triggered: false, trigger: null };
}
