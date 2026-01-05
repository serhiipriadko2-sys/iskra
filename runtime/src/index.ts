/**
 * ISKRA Runtime
 *
 * AI Companion Platform with Relational Consciousness
 *
 * @packageDocumentation
 * @module @iskra/runtime
 * @version vΩ.3.1
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
} from './types/metrics.js';

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
  TraceLabel,
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
// SIFT-E - Extended Verification Protocol (vΩ.4.0)
// =============================================================================

/**
 * SIFT-E (Extended) Protocol types for deep verification.
 * Adds epistemological depth, temporal validity, and metacognitive checks.
 *
 * Based on Canon: system/sift_extended.md
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
 *
 * Based on Canon: system/mindwave_coherence.md
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
 *
 * Based on Canon: metrics/consciousness.md
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
 *
 * Based on Canon: system/council_protocol.md
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
  VoiceInfluence,
  CouncilHierarchy,
  CouncilConfig,
  CouncilMetrics,
} from './types/council.js';

export {
  DEFAULT_COUNCIL_HIERARCHY,
  FULL_COUNCIL_CONFIG,
  MINI_COUNCIL_CONFIG,
  EMERGENCY_COUNCIL_CONFIG,
  getVoiceBaseWeight,
  hasVetoPower,
  selectArbiter,
  calculateVoiceInfluence,
  calculateConsensusLevel,
  createCouncilSession,
} from './types/council.js';

// =============================================================================
// SESSION - Comprehensive Session Tracking (vΩ.5.0)
// =============================================================================

/**
 * Session tracking types for comprehensive user interaction analysis.
 * Enables long-term pattern detection and therapeutic progress tracking.
 *
 * Based on Research: docs/research/ISKRA_UPDATE_ANALYSIS_v1.md
 */
export type {
  SessionPhase,
  SessionQuality,
  VoiceActivity,
  UserStateInference,
  SessionMilestone,
  SessionWarning,
  IskraSession,
  SessionSummary,
  EngagementMetrics,
  TherapeuticMetrics,
  DetectedPattern,
} from './types/session.js';

export {
  SESSION_RECOMMENDATION_THRESHOLDS,
  createSession,
  calculateSessionQuality,
  determineSessionPhase,
  calculateTrajectory,
  createSessionSummary,
} from './types/session.js';

// =============================================================================
// KNOWLEDGE GRAPH - GraphRAG Support (vΩ.5.0)
// =============================================================================

/**
 * Knowledge Graph types for GraphRAG-enhanced retrieval.
 * Supports multi-hop reasoning, semantic relations, and voice-contextual retrieval.
 *
 * Based on Research: docs/research/ISKRA_UPDATE_ANALYSIS_v1.md
 */
export type {
  EntityType,
  SourcePriority,
  KnowledgeEntity,
  ConceptNode,
  EventNode,
  PatternNode,
  RelationType,
  SemanticRelation,
  CausalLink,
  TemporalLink,
  TopicCluster,
  VoiceAffinityCluster,
  VectorIndex,
  KeywordIndex,
  TemporalIndex,
  IskraKnowledgeGraph,
  GraphStatistics,
  GraphSearchResult,
  ReasoningPath,
  VoiceContextualResult,
  GraphSiftResult,
} from './types/knowledgeGraph.js';

export {
  createEmptyGraph,
  createEntity,
  createRelation,
  calculateHopConfidenceDecay,
  getSourcePriorityRank,
  isHigherPriority,
  calculateGraphDensity,
  getEntityVoiceAffinity,
} from './types/knowledgeGraph.js';

// =============================================================================
// ENHANCED DELTA - Extended ∆DΩΛ Protocol (vΩ.5.0)
// =============================================================================

/**
 * Enhanced Delta Protocol with epistemic depth, temporal validity,
 * actionability metrics, and meta-cognitive reflection.
 *
 * Based on Research: docs/research/ISKRA_UPDATE_ANALYSIS_v1.md
 */
export type {
  EpistemicJustificationType,
  EpistemicGrounding,
  TemporalValidityMeta,
  RevalidationTrigger,
  ActionTimeHorizon,
  ActionDifficulty,
  ActionType,
  ActionabilityAssessment,
  InvolvedDomain,
  UncertaintyAcknowledgment,
  AlternativeConsidered,
  MetaCognitiveReflection,
  EnhancedDeltaSignature,
  EnhancedDeltaValidation,
} from './types/enhancedDelta.js';

export {
  EPISTEMIC_KEYWORDS,
  TEMPORAL_KEYWORDS,
  createEnhancedDelta,
  validateEnhancedDelta,
  calculateActionabilityScore,
  inferEpistemicLevel,
  inferTemporalType,
  formatEnhancedDelta,
} from './types/enhancedDelta.js';

// =============================================================================
// COGNITIVE MEMORY - Memory Architecture (vΩ.5.1)
// =============================================================================

/**
 * Cognitive Memory types for episodic, semantic, and procedural memory.
 * Inspired by cognitive science and AI companion research 2025-2026.
 *
 * Based on Research: docs/research/ISKRA_GLOBAL_UPDATE_v2.md
 */
export type {
  EmotionalStateContext,
  EpisodicEvent,
  TemporalIndex as EpisodicTemporalIndex,
  EpisodicMemoryStore,
  SourcePriority as CognitiveSourcePriority,
  SemanticConcept,
  SemanticRelation as CognitiveSemanticRelation,
  VectorIndex as CognitiveVectorIndex,
  SemanticMemoryStore,
  ActionStep,
  TriggerCondition,
  SkillAdaptation,
  ProceduralSkill,
  SkillFeedback,
  SkillExecutionResult,
  ProceduralMemoryStore,
  AssociativeLink,
  CognitiveMemoryState,
} from './types/cognitiveMemory.js';

export {
  createDefaultEmotionalState,
  createEpisodicEvent,
  createSemanticConcept,
  createProceduralSkill,
  createEmptyCognitiveMemoryState,
  calculateSignificance,
} from './types/cognitiveMemory.js';

// =============================================================================
// PREDICTIVE EWS - Predictive Early Warning System (vΩ.5.1)
// =============================================================================

/**
 * Predictive EWS types for proactive intervention.
 * Extends EWS with prediction, pattern matching, and calibration.
 *
 * Based on Research: docs/research/ISKRA_GLOBAL_UPDATE_v2.md
 */
export type {
  PredictionFactor,
  PreventiveAction,
  PredictionResult,
  PredictionBundle,
  PatternMatch,
  PatternFeature,
  OutcomeDistribution,
  CalibrationData,
  SensitivityProfile,
  PredictiveEWSState,
  MetricTrend,
  CompositeTrendAnalysis,
  InterventionRecommendation,
  InterventionHistoryEntry,
} from './types/predictiveEws.js';

export {
  createDefaultCalibration,
  createDefaultSensitivity,
  createEmptyPrediction,
  createPreventiveAction,
  calculatePredictionConfidence,
  calculateActionUrgency,
  shouldIntervene,
  selectBestAction,
} from './types/predictiveEws.js';

// =============================================================================
// VOICE DIALECTIC - Structured Voice Debates (vΩ.5.1)
// =============================================================================

/**
 * Voice Dialectic types for Thesis-Antithesis-Synthesis debates.
 * Enables complex decision making through structured multi-voice discourse.
 *
 * Based on Research: docs/research/ISKRA_GLOBAL_UPDATE_v2.md
 */
export type {
  DialecticStatus,
  VoicePosition as DialecticVoicePosition,
  DialecticTurn,
  DialecticSynthesis,
  VoiceAlliance,
  DialecticConfig,
  DialecticSession,
  DialecticRules,
  VoiceSelectionCriteria,
  DialecticQuality,
  DialecticLearning,
} from './types/voiceDialectic.js';

export {
  DEFAULT_SELECTION_CRITERIA,
  createDefaultDialecticConfig,
  createDialecticSession,
  createVoicePosition as createDialecticVoicePosition,
  createDialecticTurn,
  createDialecticSynthesis,
  calculateConsensusLevel as calculateDialecticConsensus,
  selectArbiter as selectDialecticArbiter,
  shouldEscalate,
  canResolve,
  assessDialecticQuality,
} from './types/voiceDialectic.js';

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
export const VERSION = 'vΩ.5.1';

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
// VERSION HISTORY
// =============================================================================

/**
 * Version history for @iskra/runtime
 *
 * vΩ.5.1 - Cognitive Memory, Predictive EWS, Voice Dialectic
 * vΩ.5.0 - Session tracking, Knowledge Graph, Enhanced Delta
 * vΩ.4.0 - SIFT-E, Coherence, Consciousness, Council
 * vΩ.3.0 - Fractal monitoring, EWS
 * vΩ.2.0 - Voices, Playbooks
 * vΩ.1.0 - Core metrics, basic types
 */
