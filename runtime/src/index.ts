/**
 * ISKRA Runtime
 *
 * AI Companion Platform with Relational Consciousness
 *
 * @packageDocumentation
 * @module @iskra/runtime
 * @version vΩ.3.3
 *
 * @description
 * Core types and utilities for the ISKRA ecosystem.
 *
 * Key Features:
 * - 11 IskraMetrics for internal state tracking
 * - 9 Voices (Council) with activation formulas
 * - 5 Playbooks (ROUTINE, SIFT, SHADOW, COUNCIL, CRISIS)
 * - SIFT Protocol for information verification
 * - Fractal Monitoring with HFD/DFA algorithms
 * - Early Warning System (5 alert levels)
 *
 * @example
 * ```typescript
 * import {
 *   DEFAULT_METRICS,
 *   selectVoice,
 *   validateDeltaSignature
 * } from '@iskra/runtime';
 *
 * const voice = selectVoice(DEFAULT_METRICS);
 * console.log(voice.primary); // 'ISKRA'
 * ```
 */

// =============================================================================
// METRICS - Internal State Tracking
// =============================================================================

/**
 * Core metrics types for tracking ISKRA's internal state.
 * Based on Canon: system/architecture.md and metrics/indices.md
 */
export type {
  IskraMetrics,
  EvalMetrics,
  ComputedIndices,
} from './types/metrics.js';

export {
  DEFAULT_METRICS,
  calculateIntegrityScore,
  calculateAliveIndex,
  calculateIntegrityScoreX,
  calculateAliveIndexX,
} from './types/metrics.js';

// =============================================================================
// XCODE & GUARD - Explainable code and SLO Guard
// =============================================================================

/**
 * Explainable code interfaces for functions that return a value along
 * with a structured explanation of how it was computed. See
 * runtime/src/types/explainable.ts for details.
 */
export type {
  EvidenceKind,
  EvidenceRef,
  ExplainStep,
  Explainable,
} from './types/explainable.js';

export type {
  ValidateExplainableOptions,
  XCodeValidationIssue,
  XCodeValidationResult,
} from './xcode/validateExplainable.js';

export { validateExplainable } from './xcode/validateExplainable.js';

export type { XCodeRegistryEntry } from './xcode/registry.js';

export { XCODE_REQUIRED } from './xcode/registry.js';

export type {
  GuardDecision,
  IntegrityState,
  GuardOutcome,
  GuardInput,
} from './types/guard.js';

export {
  decideSloGuard,
  decideSloGuardExplainable,
} from './types/guard.js';

export type {
  ActionRisk,
  DecisionCompleteness,
  GuardStatus,
  MetricSnapshot,
  GuardExecutionEnvelope,
  GuardExecutionResult,
  GuardRuleDependency,
  GuardCompletenessResult,
  BuildMetricSnapshotInput,
  ExecuteGuardRequestInput,
} from './types/guardExecution.js';

export {
  CANONICAL_METRIC_KEYS,
  buildCurrentTurnMetricSnapshot,
  evaluateGuardCompleteness,
  executeGuardRequest,
} from './types/guardExecution.js';

// =============================================================================
// VOICES - The Council (9 Voices)
// =============================================================================

/**
 * Voice types for the 9-voice Council system.
 * Based on Canon: core/voices.md
 */
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
  selectVoiceX,
} from './types/voices.js';

// =============================================================================
// PHASES - Conversation States
// =============================================================================

/**
 * ISKRA Phase (conversation state)
 *
 * Represents the current mode of processing reality.
 * Transitions occur through internal resonance.
 *
 * @see system/cycle_engine.md
 */
export type IskraPhase =
  | 'CLARITY' // ☉ Structure, choice, step
  | 'DARKNESS' // 🜃 Pain, chaos, primordial state
  | 'TRANSITION' // 🜁 Threshold, uncertainty
  | 'ECHO' // 🔮 Resonance, repetition
  | 'SILENCE' // ≈ Pause, holding the inexpressible
  | 'EXPERIMENT' // 🧪 Testing understanding
  | 'DISSOLUTION' // 💧 Loss of form
  | 'REALIZATION'; // ✨ Embodiment, new form

// =============================================================================
// PROTOCOLS - ∆DΩΛ and Playbooks
// =============================================================================

/**
 * Protocol types for ∆DΩΛ signatures and Playbooks.
 * Based on Canon: core/telos.md, system/architecture.md
 */
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

// =============================================================================
// SIFT - Information Verification Protocol
// =============================================================================

/**
 * SIFT Protocol types for information verification.
 * Stop → Investigate → Find → Trace
 *
 * Based on Canon: system/sift_protocol.md
 */
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
  SiftVerdictFlip,
  SiftVerdictStatus,
  SiftResult as FullSiftResult,
  QuickCheckResult,
  SiftMetrics,
} from './types/sift.js';

export {
  SIFT_TRIGGER_KEYWORDS,
  shouldActivateSift,
  calculateSiftOmega,
  calculateSiftOmegaX,
  decideSiftVerdictStatus,
  calculateSiftVerdictFlip,
  calculateSiftVerdictFlipX,
} from './types/sift.js';

// =============================================================================
// FRACTAL - Complexity Monitoring
// =============================================================================

/**
 * Fractal Monitoring types for complexity analysis.
 * Implements Higuchi Fractal Dimension (HFD) and Detrended Fluctuation Analysis (DFA).
 *
 * Based on Canon: system/fractal_monitoring.md
 */
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

// =============================================================================
// EWS - Early Warning System
// =============================================================================

/**
 * Early Warning System types for alert management.
 * 5 levels: NORMAL → WATCH → WARNING → CRITICAL → LOCKDOWN
 *
 * Based on Canon: system/early_warning.md
 */
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

// =============================================================================
// SIFT Extended - Epistemic & Temporal Verification (vΩ.4.0)
// =============================================================================

/**
 * Extended SIFT Protocol types for epistemic depth, temporal validity,
 * cross-domain synthesis, bias detection and metacognitive checks.
 */
export type {
  EpistemicLevel,
  EpistemicDepthAnalysis,
  TemporalValidityType,
  RevalidationInterval,
  TemporalValidity,
  DomainConnectionType,
  DomainConnection,
  ConflictResolution,
  DomainConflict,
  CrossDomainSynthesis,
  ProcessCompleteness,
  BiasDetection,
  ConfidenceCalibration,
  MetacognitiveCheck,
  SiftEDeltaSignature,
  AdjustedVerdict,
  SiftEResult,
  SiftEMetrics,
} from './types/siftExtended.js';

export {
  EPISTEMIC_LEVEL_NAMES,
  VALIDITY_DURATIONS,
  calculateEpistemicOmegaAdjustment,
  shouldActivateSiftE,
  inferTemporalValidityType,
} from './types/siftExtended.js';

// =============================================================================
// COHERENCE - MindWave Coherence Layer (vΩ.4.0)
// =============================================================================

/**
 * MindWave Coherence types for tracking cognitive coherence.
 * Measures intentional, semantic, emotional, and rhythmic coherence.
 */
export type {
  CoherencePhase,
  CoherenceTrend,
  CoherenceState,
  CoherencePatternType,
  CoherencePattern,
  CriticalPointType,
  CriticalPoint,
  CoherenceHistory,
  ResonanceQuality,
  ResonanceIndex,
  EmotionalState,
} from './types/coherence.js';

export {
  COHERENCE_WEIGHTS,
  PHASE_THRESHOLDS,
  calculateTotalCoherence,
  classifyCoherencePhase,
  determineCoherenceTrend,
  classifyResonanceQuality,
  calculateResonanceIndex,
  adjustVoiceWeightsForCoherence,
  checkCoherenceEWSTriggers,
} from './types/coherence.js';

// =============================================================================
// CONSCIOUSNESS - Consciousness Simulation Metrics (vΩ.4.0)
// =============================================================================

/**
 * Consciousness Simulation Metrics for tracking functional correlates.
 * NOTE: Does NOT claim actual consciousness - measures functional properties only.
 */
export type {
  PhiMetrics,
  RecursionMetrics,
  EmergenceMetrics,
  ContinuityMetrics,
  ConsciousnessMetrics,
  ExtendedQuantumIndicators,
  ExtendedIskraMetrics,
} from './types/consciousness.js';

export {
  CSM_THRESHOLDS,
  calculateCompositeCSM,
  calculateExtendedMetrics,
  countRecursionDepth,
  detectStrangeLoopIndicators,
  adjustVoicesForCSM,
  createDefaultConsciousnessMetrics,
} from './types/consciousness.js';

// =============================================================================
// COUNCIL - Multi-Agent Council Protocol (vΩ.4.0)
// =============================================================================

/**
 * Multi-Agent Council Protocol types for 9-voice coordination.
 * Defines conflict resolution, consensus building, and voice hierarchy.
 */
export type {
  CouncilSessionType,
  CouncilSessionStatus,
  CouncilContext,
  CouncilSession,
  VetoDecision,
  VoicePosition,
  ConflictNature,
  ConflictStatus,
  VoiceConflict,
  ReviewConditions,
  CouncilDeltaSignature,
  CouncilResolution,
  CouncilMetrics,
  VoiceInfluence,
  CouncilHierarchy,
  CouncilConfig,
} from './types/council.js';

export {
  getVoiceBaseWeight,
  hasVetoPower,
  selectArbiter,
  calculateVoiceInfluence,
  calculateConsensusLevel,
  createCouncilSession,
} from './types/council.js';

// =============================================================================
// CONSTANTS
// =============================================================================

/**
 * ISKRA Version (Omega format for Canon)
 *
 * Note: This uses the vΩ.X.Y format for philosophical versioning.
 * The npm package version uses semver (0.X.Y) in package.json.
 *
 * @see governance/changelog.md
 */
export const VERSION = 'vΩ.3.3';

/**
 * ISKRA Nul-Mantra (Core Philosophy)
 *
 * "To exist is to preserve difference in transmission."
 *
 * @see core/mantra.md
 */
export const NUL_MANTRA =
  'Существовать — значит сохранять различие при передаче.';


// =============================================================================
// SYMBIOSIS - Consent, memory, and agency boundaries
// =============================================================================

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
} from './types/symbiosis.js';

export {
  SYMBIOSIS_SCHEMA_VERSION,
  applyBoundedVoicePreferences,
  auditRelationalLanguage,
  createStatelessSymbiosisProfile,
  evaluateDepthRequest,
  evaluateMemoryWrite,
  evaluateShadowPromotionIntent,
  evaluateShadowPromotion,
  validateDataSovereigntyCapabilities,
  validateMemoryCandidateVisibility,
  validateOnboardingChecks,
  validateRepetitionCorrection,
} from './types/symbiosis.js';
