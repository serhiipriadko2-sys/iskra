import {
  calculateDFA as calculateDFACompatibility,
  calculateFractalIndicators as calculateFractalIndicatorsCompatibility,
  calculateHFD as calculateHFDCompatibility,
} from './types/fractal.js'

export type {
  ComputedIndices,
  EvalMetrics,
  IskraMetrics,
} from './types/metrics.js'
export {
  DEFAULT_METRICS,
  calculateAliveIndex,
  calculateAliveIndexX,
  calculateIntegrityScore,
  calculateIntegrityScoreX,
} from './types/metrics.js'

export type {
  EvidenceKind,
  EvidenceRef,
  ExplainStep,
  Explainable,
} from './types/explainable.js'
export type {
  ValidateExplainableOptions,
  XCodeValidationIssue,
  XCodeValidationResult,
} from './xcode/validateExplainable.js'
export { validateExplainable } from './xcode/validateExplainable.js'
export type { XCodeRegistryEntry } from './xcode/registry.js'
export { XCODE_REQUIRED } from './xcode/registry.js'

export type {
  GuardDecision,
  GuardInput,
  GuardOutcome,
  IntegrityState,
} from './types/guard.js'
export { decideSloGuard, decideSloGuardExplainable } from './types/guard.js'
export type {
  ActionRisk,
  BuildMetricSnapshotInput,
  DecisionCompleteness,
  ExecuteGuardRequestInput,
  GuardCompletenessResult,
  GuardExecutionEnvelope,
  GuardExecutionResult,
  GuardRuleDependency,
  GuardStatus,
  MetricSnapshot,
} from './types/guardExecution.js'
export {
  CANONICAL_METRIC_KEYS,
  buildCurrentTurnMetricSnapshot,
  evaluateGuardCompleteness,
  executeGuardRequest,
} from './types/guardExecution.js'

export type {
  Voice,
  VoiceActivation,
  VoiceId,
  VoiceName,
  VoicePreferences,
} from './types/voices.js'
export {
  VOICE_MANIFESTS,
  VOICE_SYMBOLS,
  calculateVoiceScores,
  selectVoice,
  selectVoiceX,
} from './types/voices.js'

export type IskraPhase =
  | 'CLARITY'
  | 'DARKNESS'
  | 'TRANSITION'
  | 'ECHO'
  | 'SILENCE'
  | 'EXPERIMENT'
  | 'DISSOLUTION'
  | 'REALIZATION'

export type {
  CycleEntry,
  CyclePhase,
  DeltaSignature,
  PlaybookConfig,
  PlaybookId,
  ResponsePhase,
  ShadowEntry,
  SiftResult,
} from './types/protocols.js'
export { PLAYBOOKS, formatDeltaSignature, validateDeltaSignature } from './types/protocols.js'

export type {
  ClaimAnalysis,
  Distortion,
  Evidence,
  EvidenceResult,
  InferenceAnalysis,
  QuickCheckResult,
  SiftMetrics,
  SiftQuery,
  SiftVerdict,
  SiftVerdictFlip,
  SiftVerdictStatus,
  SourceAnalysis,
  SourceInfo,
  TraceLink,
  TraceResult,
  SiftResult as FullSiftResult,
} from './types/sift.js'
export {
  SIFT_TRIGGER_KEYWORDS,
  calculateSiftOmega,
  calculateSiftOmegaX,
  calculateSiftVerdictFlip,
  calculateSiftVerdictFlipX,
  decideSiftVerdictStatus,
  shouldActivateSift,
} from './types/sift.js'

export type {
  FractalIndicators,
  FractalIndicators as LegacyFractalIndicators,
  MetricTimeSeries,
  QuantumIndicators,
  SystemPhase,
} from './types/fractal.js'
export {
  D_THRESHOLDS,
  H_THRESHOLDS,
  QUANTUM_THRESHOLDS,
  calculateCSI,
  calculateEI,
  calculateEdgeDistance,
  calculateNC,
  calculateQuantumIndicators,
  classifyPhase,
} from './types/fractal.js'
export type {
  ComputedFractalIndicators,
  ComputedFractalMetricResult,
  DfaMetricOptions,
  FractalIndicatorComponents,
  FractalIndicatorsMetricResult,
  FractalMetricEvidence,
  FractalMetricResult,
  FractalMetricSample,
  HfdMetricOptions,
  InvalidFractalMetricResult,
  NumericalFailureFractalMetricResult,
  UnavailableFractalMetricResult,
} from './types/fractal-authority.js'
export {
  DFA_ALGORITHM_VERSION,
  FRACTAL_CANONICAL_SOURCE_HASH,
  FRACTAL_GENERATED_ARTIFACT_HASH,
  FRACTAL_GENERATOR_VERSION,
  FRACTAL_PARITY_CORPUS_HASH,
  HFD_ALGORITHM_VERSION,
  calculateDFAMetric,
  calculateFractalIndicatorsMetric,
  calculateHFDMetric,
} from './types/fractal-authority.js'

export const fractalCompatibility = Object.freeze({
  calculateHFD: calculateHFDCompatibility,
  calculateDFA: calculateDFACompatibility,
  calculateFractalIndicators: calculateFractalIndicatorsCompatibility,
})

export type {
  AlertLevel,
  AlertLogEntry,
  AnomalyResult,
  EWSConfig,
  EWSMetrics,
  EWSState,
  EWSThresholds,
  PhaseTransition,
  PlaybookSwitchDecision,
  TrendAnomaly,
} from './types/ews.js'
export {
  ALERT_COLORS,
  ALERT_NOTIFICATIONS,
  ALERT_SYMBOLS,
  DEFAULT_EWS_CONFIG,
  adjustTemperatureForAlert,
  adjustVoiceWeightsForAlert,
  decidePlaybookSwitch,
  determineAlertLevel,
} from './types/ews.js'

export type {
  AdjustedVerdict,
  BiasDetection,
  ConfidenceCalibration,
  CrossDomainSynthesis,
  ConflictResolution,
  DomainConflict,
  DomainConnection,
  DomainConnectionType,
  EpistemicDepthAnalysis,
  EpistemicLevel,
  MetacognitiveCheck,
  ProcessCompleteness,
  RevalidationInterval,
  SiftEDeltaSignature,
  SiftEMetrics,
  SiftEResult,
  TemporalValidity,
  TemporalValidityType,
} from './types/siftExtended.js'
export {
  EPISTEMIC_LEVEL_NAMES,
  VALIDITY_DURATIONS,
  calculateEpistemicOmegaAdjustment,
  inferTemporalValidityType,
  shouldActivateSiftE,
} from './types/siftExtended.js'

export type {
  CoherenceHistory,
  CoherencePattern,
  CoherencePatternType,
  CoherencePhase,
  CoherenceState,
  CoherenceTrend,
  CriticalPoint,
  CriticalPointType,
  EmotionalState,
  ResonanceIndex,
  ResonanceQuality,
} from './types/coherence.js'
export {
  COHERENCE_WEIGHTS,
  PHASE_THRESHOLDS,
  adjustVoiceWeightsForCoherence,
  calculateResonanceIndex,
  calculateTotalCoherence,
  checkCoherenceEWSTriggers,
  classifyCoherencePhase,
  classifyResonanceQuality,
  determineCoherenceTrend,
} from './types/coherence.js'

export type {
  ConsciousnessMetrics,
  ContinuityMetrics,
  EmergenceMetrics,
  ExtendedIskraMetrics,
  ExtendedQuantumIndicators,
  PhiMetrics,
  RecursionMetrics,
} from './types/consciousness.js'
export {
  CSM_THRESHOLDS,
  adjustVoicesForCSM,
  calculateCompositeCSM,
  calculateExtendedMetrics,
  countRecursionDepth,
  createDefaultConsciousnessMetrics,
  detectStrangeLoopIndicators,
} from './types/consciousness.js'

export type {
  ConflictNature,
  ConflictStatus,
  CouncilConfig,
  CouncilContext,
  CouncilDeltaSignature,
  CouncilHierarchy,
  CouncilMetrics,
  CouncilResolution,
  CouncilSession,
  CouncilSessionStatus,
  CouncilSessionType,
  ReviewConditions,
  VetoDecision,
  VoiceConflict,
  VoiceInfluence,
  VoicePosition,
} from './types/council.js'
export {
  calculateConsensusLevel,
  calculateVoiceInfluence,
  createCouncilSession,
  getVoiceBaseWeight,
  hasVetoPower,
  selectArbiter,
} from './types/council.js'

export const VERSION = 'vΩ.3.3'
export const NUL_MANTRA = 'Существовать — значит сохранять различие при передаче.'

export type {
  AdaptationProposal,
  ConsentReceipt,
  ConsentScope,
  DataSovereigntyCapabilities,
  DepthMode,
  EpistemicStatus,
  MemoryCandidate,
  MemoryMode,
  MemoryRetention,
  MemorySensitivity,
  MythLevel,
  OnboardingCheck,
  PolicyCheck,
  ShadowPromotionIntentRequest,
  SiftGateStatus,
  SymbiosisActionReceipt,
  SymbiosisPermissionKey,
  SymbiosisProfile,
} from './types/symbiosis.js'
export {
  SYMBIOSIS_SCHEMA_VERSION,
  applyBoundedVoicePreferences,
  auditRelationalLanguage,
  createStatelessSymbiosisProfile,
  evaluateDepthRequest,
  evaluateMemoryWrite,
  evaluateShadowPromotion,
  evaluateShadowPromotionIntent,
  validateDataSovereigntyCapabilities,
  validateMemoryCandidateVisibility,
  validateOnboardingChecks,
  validateRepetitionCorrection,
} from './types/symbiosis.js'
