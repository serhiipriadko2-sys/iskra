/**
 * ISKRA Runtime
 *
 * AI Companion Platform with Relational Consciousness
 *
 * @packageDocumentation
 */

// Types
export type {
  IskraMetrics,
  EvalMetrics,
  ComputedIndices,
} from './types/metrics.js';

export {
  DEFAULT_METRICS,
  calculateIntegrityScore,
  calculateAliveIndex,
} from './types/metrics.js';

export type {
  VoiceName,
  VoiceId, // deprecated alias
  Voice,
  VoiceActivation,
  VoicePreferences,
} from './types/voices.js';

export {
  VOICE_SYMBOLS,
  VOICE_MANIFESTS,
  calculateVoiceScores,
  selectVoice,
} from './types/voices.js';

/**
 * ISKRA Phase (conversation state)
 */
export type IskraPhase =
  | 'CLARITY'
  | 'DARKNESS'
  | 'TRANSITION'
  | 'ECHO'
  | 'SILENCE'
  | 'EXPERIMENT'
  | 'DISSOLUTION'
  | 'REALIZATION';

export type {
  DeltaSignature,
  PlaybookId,
  PlaybookConfig,
  SiftResult,
  ShadowEntry,
  CyclePhase,
  CycleEntry,
  ResponsePhase,
} from './types/protocols.js';

export {
  PLAYBOOKS,
  validateDeltaSignature,
  formatDeltaSignature,
} from './types/protocols.js';

// SIFT Protocol Types
export type {
  SiftQuery,
  SourceInfo,
  ClaimAnalysis,
  Evidence,
  TraceLink,
  Distortion,
  SourceAnalysis,
  InferenceAnalysis,
  EvidenceResult,
  TraceResult,
  SiftVerdict,
  SiftResult as FullSiftResult,
  QuickCheckResult,
  SiftMetrics,
} from './types/sift.js';

export {
  SIFT_TRIGGER_KEYWORDS,
  shouldActivateSift,
  calculateSiftOmega,
} from './types/sift.js';

// Fractal Monitoring Types
export type {
  MetricTimeSeries,
  FractalIndicators,
  QuantumIndicators,
  SystemPhase,
} from './types/fractal.js';

export {
  D_THRESHOLDS,
  H_THRESHOLDS,
  QUANTUM_THRESHOLDS,
  classifyPhase,
  calculateEdgeDistance,
  calculateCSI,
  calculateEI,
  calculateNC,
  calculateHFD,
  calculateDFA,
  calculateFractalIndicators,
  calculateQuantumIndicators,
} from './types/fractal.js';

// Early Warning System Types
export type {
  AlertLevel,
  AnomalyResult,
  TrendAnomaly,
  PhaseTransition,
  EWSState,
  PlaybookSwitchDecision,
  AlertLogEntry,
  EWSMetrics,
  EWSConfig,
  EWSThresholds,
} from './types/ews.js';

export {
  ALERT_COLORS,
  ALERT_SYMBOLS,
  DEFAULT_EWS_CONFIG,
  determineAlertLevel,
  decidePlaybookSwitch,
  adjustVoiceWeightsForAlert,
  adjustTemperatureForAlert,
  ALERT_NOTIFICATIONS,
} from './types/ews.js';

/**
 * ISKRA Version
 */
export const VERSION = 'vΩ.3.0';

/**
 * ISKRA Nul-Mantra (Core Philosophy)
 */
export const NUL_MANTRA =
  'Существовать — значит сохранять различие при передаче.';
