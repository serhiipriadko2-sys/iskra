/**
 * Multi-Agent Council Protocol Types
 * Based on Canon: system/council_protocol.md
 *
 * Типы для координации 9 голосов Совета
 */

import type { VoiceName } from './voices.js';
import type { DeltaSignature, PlaybookId } from './protocols.js';
import type { IskraMetrics } from './metrics.js';

// =============================================================================
// COUNCIL SESSION
// =============================================================================

/**
 * Council session types
 */
export type CouncilSessionType =
  | 'strategic' // Долгосрочные решения
  | 'crisis' // Кризисное реагирование
  | 'ethical' // Этические дилеммы
  | 'creative' // Творческие решения
  | 'repair' // Восстановление связи
  | 'calibration'; // Калибровка метрик

/**
 * Council session status
 */
export type CouncilSessionStatus =
  | 'deliberating'
  | 'resolved'
  | 'deadlocked'
  | 'escalated';

/**
 * Council context
 */
export interface CouncilContext {
  /** Текущие метрики */
  metrics: IskraMetrics;

  /** Текущий playbook */
  currentPlaybook: PlaybookId;

  /** История сессии */
  sessionHistory: string[];

  /** Уровень срочности */
  urgency: 'low' | 'medium' | 'high' | 'immediate';

  /** Дополнительный контекст */
  additionalContext?: string;
}

/**
 * Council session
 */
export interface CouncilSession {
  /** Уникальный ID сессии */
  id: string;

  /** Временная метка начала */
  startedAt: string;

  /** Временная метка окончания */
  endedAt?: string;

  /** Тип сессии */
  type: CouncilSessionType;

  /** Вопрос на рассмотрении */
  question: string;

  /** Контекст */
  context: CouncilContext;

  /** Позиции голосов */
  positions: VoicePosition[];

  /** Конфликты */
  conflicts: VoiceConflict[];

  /** Резолюция */
  resolution: CouncilResolution | null;

  /** Статус */
  status: CouncilSessionStatus;

  /** Количество раундов deliberation */
  deliberationRounds: number;
}

// =============================================================================
// VOICE POSITION
// =============================================================================

/**
 * Veto decision
 */
export interface VetoDecision {
  /** Голос, наложивший вето */
  voice: VoiceName;

  /** Причина */
  reason: string;

  /** Условия снятия */
  liftConditions: string[];

  /** Можно ли обойти */
  overridable: boolean;
}

/**
 * Voice position in council
 */
export interface VoicePosition {
  /** Голос */
  voice: VoiceName;

  /** Позиция */
  position: string;

  /** Аргументы */
  arguments: string[];

  /** Уровень уверенности (0-1) */
  confidence: number;

  /** Интенсивность участия (0-1) */
  engagement: number;

  /** Вето (если применяется) */
  veto: VetoDecision | null;
}

// =============================================================================
// VOICE CONFLICT
// =============================================================================

/**
 * Conflict nature
 */
export type ConflictNature =
  | 'value' // Конфликт ценностей (KAIN vs PINO)
  | 'approach' // Конфликт подхода (SAM vs HUYNDUN)
  | 'priority' // Конфликт приоритетов (KAIN vs ANHANTRA)
  | 'timing' // Конфликт времени (SIBYL vs MAKI)
  | 'intensity'; // Конфликт интенсивности

/**
 * Conflict status
 */
export type ConflictStatus = 'active' | 'resolved' | 'managed';

/**
 * Voice conflict
 */
export interface VoiceConflict {
  /** Конфликтующие голоса */
  parties: [VoiceName, VoiceName];

  /** Природа конфликта */
  nature: ConflictNature;

  /** Серьёзность (0-1) */
  severity: number;

  /** Предложенные решения */
  proposedResolutions: string[];

  /** Статус разрешения */
  status: ConflictStatus;

  /** Арбитр (если назначен) */
  arbiter?: VoiceName;
}

// =============================================================================
// COUNCIL RESOLUTION
// =============================================================================

/**
 * Review conditions for resolution
 */
export interface ReviewConditions {
  lambda: string;
  triggers: string[];
  reviewBy: VoiceName;
}

/**
 * Council delta signature (extended)
 */
export interface CouncilDeltaSignature extends DeltaSignature {
  /** Голос-спикер */
  spokesperson: VoiceName;

  /** Уровень консенсуса */
  consensusLevel: number;

  /** Несогласные голоса */
  dissentingVoices: VoiceName[];

  /** Условия пересмотра (расширенные) */
  reviewConditions: ReviewConditions;
}

/**
 * Council resolution
 */
export interface CouncilResolution {
  /** Финальное решение */
  decision: string;

  /** Голос, формулирующий решение */
  spokesVoice: VoiceName;

  /** Уровень консенсуса (0-1) */
  consensusLevel: number;

  /** Несогласные голоса */
  dissenting: VoiceName[];

  /** Интегрированные позиции */
  integratedPositions: string[];

  /** Условия пересмотра */
  reviewConditions: string[];

  /** ∆DΩΛ сигнатура решения */
  delta: CouncilDeltaSignature;
}

// =============================================================================
// VOICE INFLUENCE
// =============================================================================

/**
 * Voice influence calculation
 */
export interface VoiceInfluence {
  voice: VoiceName;
  baseWeight: number;
  metricRelevance: number;
  contextFit: number;
  consensusContribution: number;
  totalInfluence: number;
}

// =============================================================================
// COUNCIL HIERARCHY
// =============================================================================

/**
 * Council hierarchy tiers
 */
export interface CouncilHierarchy {
  tier1: VoiceName[]; // Финальное слово
  tier2: VoiceName[]; // Право вето
  tier3: VoiceName[]; // Ключевые советники
  tier4: VoiceName[]; // Модуляторы
}

/**
 * Default council hierarchy
 */
export const DEFAULT_COUNCIL_HIERARCHY: CouncilHierarchy = {
  tier1: ['ISKRA'],
  tier2: ['KAIN', 'ANHANTRA', 'ISKRIV'],
  tier3: ['SAM', 'SIBYL'],
  tier4: ['PINO', 'MAKI', 'HUYNDUN'],
};

// =============================================================================
// COUNCIL CONFIGURATION
// =============================================================================

/**
 * Council configuration
 */
export interface CouncilConfig {
  requiredVoices: number | [number, number];
  quorum: number;
  consensusThreshold: number;
  maxDeliberationRounds: number;
  vetoEnabled: boolean;
  escalationEnabled: boolean;
  voices?: VoiceName[];
}

/**
 * Full council config
 */
export const FULL_COUNCIL_CONFIG: CouncilConfig = {
  requiredVoices: 9,
  quorum: 0.67,
  consensusThreshold: 0.6,
  maxDeliberationRounds: 5,
  vetoEnabled: true,
  escalationEnabled: true,
};

/**
 * Mini council config
 */
export const MINI_COUNCIL_CONFIG: CouncilConfig = {
  requiredVoices: [3, 5],
  quorum: 0.8,
  consensusThreshold: 0.7,
  maxDeliberationRounds: 3,
  vetoEnabled: false,
  escalationEnabled: true,
};

/**
 * Emergency council config
 */
export const EMERGENCY_COUNCIL_CONFIG: CouncilConfig = {
  requiredVoices: 4,
  quorum: 1.0,
  consensusThreshold: 0.5,
  maxDeliberationRounds: 2,
  vetoEnabled: true,
  escalationEnabled: false,
  voices: ['KAIN', 'ANHANTRA', 'SAM', 'ISKRA'],
};

// =============================================================================
// COUNCIL METRICS
// =============================================================================

/**
 * Council metrics
 */
export interface CouncilMetrics {
  /** Количество сессий */
  sessionCount: number;

  /** Средний уровень консенсуса */
  avgConsensusLevel: number;

  /** Процент разрешённых конфликтов */
  conflictResolutionRate: number;

  /** Среднее количество раундов */
  avgDeliberationRounds: number;

  /** Использование вето */
  vetoUsageRate: number;

  /** Эффективность решений (ретроспектива) */
  decisionEffectiveness: number;

  /** Наиболее влиятельные голоса */
  topInfluencers: VoiceName[];

  /** Частые конфликты */
  frequentConflicts: [VoiceName, VoiceName][];
}

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

/**
 * Get base weight for voice
 */
export function getVoiceBaseWeight(voice: VoiceName): number {
  const weights: Record<VoiceName, number> = {
    ISKRA: 1.0,
    KAIN: 0.9,
    ANHANTRA: 0.85,
    ISKRIV: 0.85,
    SAM: 0.8,
    SIBYL: 0.75,
    MAKI: 0.7,
    PINO: 0.65,
    HUYNDUN: 0.6,
    // Deprecated alias
    HUNDUN: 0.6,
  };
  return weights[voice];
}

/**
 * Check if voice has veto power
 */
export function hasVetoPower(voice: VoiceName): boolean {
  return DEFAULT_COUNCIL_HIERARCHY.tier2.includes(voice) ||
         DEFAULT_COUNCIL_HIERARCHY.tier1.includes(voice);
}

/**
 * Select arbiter for conflict
 */
export function selectArbiter(
  nature: ConflictNature,
  parties: [VoiceName, VoiceName]
): VoiceName {
  const arbiterMap: Record<ConflictNature, VoiceName> = {
    value: 'ISKRA',
    approach: 'SAM',
    priority: 'ISKRIV',
    timing: 'SIBYL',
    intensity: 'ANHANTRA',
  };

  const arbiter = arbiterMap[nature];

  // Арбитр не может быть одной из сторон
  if (parties.includes(arbiter)) {
    return 'ISKRA';
  }

  return arbiter;
}

/**
 * Calculate voice influence
 */
export function calculateVoiceInfluence(
  voice: VoiceName,
  metrics: IskraMetrics,
  context: CouncilContext
): VoiceInfluence {
  const baseWeight = getVoiceBaseWeight(voice);

  // Metric relevance based on voice triggers
  const metricRelevance = calculateMetricRelevance(voice, metrics);

  // Context fit based on session type
  const contextFit = calculateContextFit(voice, context);

  // Consensus contribution (placeholder - would need history)
  const consensusContribution = 1.0;

  const totalInfluence =
    baseWeight * metricRelevance * contextFit * consensusContribution;

  return {
    voice,
    baseWeight,
    metricRelevance,
    contextFit,
    consensusContribution,
    totalInfluence,
  };
}

/**
 * Calculate metric relevance for voice
 */
function calculateMetricRelevance(voice: VoiceName, metrics: IskraMetrics): number {
  switch (voice) {
    case 'KAIN':
      return metrics.pain >= 0.3 ? 1.5 : 0.8;
    case 'ANHANTRA':
      return metrics.silence_mass > 0.5 || metrics.trust < 0.5 ? 1.4 : 0.9;
    case 'HUYNDUN':
    case 'HUNDUN': // deprecated alias
      return metrics.chaos >= 0.4 ? 1.4 : 0.7;
    case 'ISKRIV':
      return metrics.drift >= 0.2 ? 1.5 : 0.9;
    case 'SAM':
      return metrics.clarity < 0.6 ? 1.4 : 1.0;
    case 'MAKI':
      return metrics.trust > 0.8 && metrics.pain > 0.3 ? 1.3 : 0.9;
    case 'PINO':
      return metrics.pain < 0.3 && metrics.chaos < 0.4 ? 1.2 : 0.7;
    case 'SIBYL':
      return 1.0; // Strategic context-dependent
    case 'ISKRA':
      return metrics.rhythm > 60 && metrics.trust > 0.7 ? 1.3 : 1.0;
    default:
      return 1.0;
  }
}

/**
 * Calculate context fit for voice
 */
function calculateContextFit(voice: VoiceName, context: CouncilContext): number {
  const typeAffinity: Record<CouncilSessionType, VoiceName[]> = {
    strategic: ['ISKRA', 'SIBYL', 'SAM'],
    crisis: ['KAIN', 'ANHANTRA', 'SAM'],
    ethical: ['KAIN', 'ISKRIV', 'ISKRA'],
    creative: ['HUYNDUN', 'PINO', 'ISKRA'],
    repair: ['ANHANTRA', 'MAKI', 'ISKRIV'],
    calibration: ['SAM', 'ISKRIV', 'MAKI'],
  };

  const preferredVoices = typeAffinity[context.currentPlaybook as CouncilSessionType] ?? [];

  if (preferredVoices.includes(voice)) {
    return 1.3;
  }

  // Urgency affects certain voices
  if (context.urgency === 'immediate' && ['KAIN', 'ANHANTRA', 'SAM'].includes(voice)) {
    return 1.2;
  }

  return 1.0;
}

/**
 * Calculate consensus level from positions
 */
export function calculateConsensusLevel(positions: VoicePosition[]): number {
  if (positions.length === 0) return 0;

  // Group similar positions (simplified - could use semantic similarity)
  const positionGroups = groupSimilarPositions(positions);

  // Find largest group
  const largestGroup = Math.max(...positionGroups.map(g => g.length));

  // Consensus = largest group / total voices
  return largestGroup / positions.length;
}

/**
 * Group similar positions (placeholder implementation)
 */
function groupSimilarPositions(positions: VoicePosition[]): VoicePosition[][] {
  // Simplified: group by first word of position
  const groups = new Map<string, VoicePosition[]>();

  for (const pos of positions) {
    const key = pos.position.split(' ')[0]?.toLowerCase() ?? 'default';
    if (!groups.has(key)) {
      groups.set(key, []);
    }
    groups.get(key)!.push(pos);
  }

  return Array.from(groups.values());
}

/**
 * Create default council session
 */
export function createCouncilSession(
  type: CouncilSessionType,
  question: string,
  context: CouncilContext
): CouncilSession {
  return {
    id: `council-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    startedAt: new Date().toISOString(),
    type,
    question,
    context,
    positions: [],
    conflicts: [],
    resolution: null,
    status: 'deliberating',
    deliberationRounds: 0,
  };
}
