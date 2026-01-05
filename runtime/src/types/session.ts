/**
 * ISKRA Session Types
 * Based on Research: docs/research/ISKRA_UPDATE_ANALYSIS_v1.md
 *
 * Comprehensive session state tracking for long-term user interaction analysis
 */

import type { IskraMetrics } from './metrics.js';
import type { VoiceName } from './voices.js';
import type { FractalIndicators } from './fractal.js';
import type { CoherenceState } from './coherence.js';
import type { ConsciousnessMetrics } from './consciousness.js';
import type { SiftResult } from './sift.js';
import type { AlertLevel, EWSState } from './ews.js';
import type { DeltaSignature, PlaybookId } from './protocols.js';

// =============================================================================
// CONFIGURATION CONSTANTS
// =============================================================================

/**
 * Session recommendation thresholds
 */
export const SESSION_RECOMMENDATION_THRESHOLDS = {
  /** Minimum KAIN activations to suggest gentler approach */
  kainActivationsForGentleApproach: 3,
  /** Trust trajectory threshold for trust rebuilding recommendation */
  trustTrajectoryForRebuild: -0.2,
  /** Maximum recommendations to return */
  maxRecommendations: 3,
} as const;

// =============================================================================
// SESSION STATE
// =============================================================================

/**
 * Session phase
 */
export type SessionPhase =
  | 'opening'      // Initial connection
  | 'exploration'  // Understanding context
  | 'working'      // Active collaboration
  | 'integration'  // Synthesizing insights
  | 'closing';     // Wrapping up

/**
 * Session quality level
 */
export type SessionQuality = 'excellent' | 'good' | 'moderate' | 'poor' | 'critical';

/**
 * Voice activity tracking
 */
export interface VoiceActivity {
  /** Voice name */
  voice: VoiceName;

  /** Number of times activated */
  activationCount: number;

  /** Total duration (in messages) */
  totalMessages: number;

  /** Average engagement score when active */
  avgEngagement: number;

  /** Last activation timestamp */
  lastActivation: string;

  /** Reason for activation (metrics snapshot) */
  activationReasons: string[];
}

/**
 * User state inference
 */
export interface UserStateInference {
  /** Inferred mood based on language analysis */
  inferredMood: 'positive' | 'neutral' | 'negative' | 'mixed' | 'uncertain';

  /** Engagement level (0-1) */
  engagementLevel: number;

  /** Topics discussed during session */
  topicsDiscussed: string[];

  /** Communication style observed */
  communicationStyle: 'direct' | 'exploratory' | 'emotional' | 'analytical';

  /** Energy level (0-1) */
  energyLevel: number;

  /** Openness to feedback (0-1) */
  opennessToFeedback: number;
}

/**
 * Session milestones
 */
export interface SessionMilestone {
  /** Milestone type */
  type: 'insight' | 'breakthrough' | 'decision' | 'repair' | 'commitment';

  /** Timestamp */
  timestamp: string;

  /** Description */
  description: string;

  /** Associated delta signature */
  delta?: DeltaSignature;

  /** Impact score (0-1) */
  impact: number;
}

/**
 * Session warnings and alerts
 */
export interface SessionWarning {
  /** Warning type */
  type: 'drift' | 'trust_decline' | 'engagement_drop' | 'coherence_loss' | 'crisis_indicator';

  /** Timestamp */
  timestamp: string;

  /** Severity (0-1) */
  severity: number;

  /** Message context */
  context: string;

  /** Resolution status */
  resolved: boolean;

  /** Resolution action taken */
  resolutionAction?: string;
}

// =============================================================================
// COMPREHENSIVE SESSION STATE
// =============================================================================

/**
 * Comprehensive ISKRA session state
 */
export interface IskraSession {
  /** Unique session ID */
  id: string;

  /** User ID (if authenticated) */
  userId?: string;

  /** Session start timestamp */
  startedAt: string;

  /** Session end timestamp (if ended) */
  endedAt?: string;

  /** Current session phase */
  phase: SessionPhase;

  // --- Temporal State ---

  /** Duration in milliseconds */
  duration: number;

  /** Total message count */
  messageCount: number;

  /** User message count */
  userMessageCount: number;

  /** Model message count */
  modelMessageCount: number;

  // --- Metrics Evolution ---

  /** Current metrics */
  currentMetrics: IskraMetrics;

  /** Metrics history (sampled) */
  metricsHistory: Array<{
    timestamp: string;
    metrics: IskraMetrics;
    messageIndex: number;
  }>;

  /** Fractal indicators history */
  fractalHistory: Array<{
    timestamp: string;
    indicators: FractalIndicators;
  }>;

  /** Coherence state history */
  coherenceHistory: CoherenceState[];

  // --- Consciousness Tracking ---

  /** Current consciousness metrics */
  consciousnessState: ConsciousnessMetrics;

  /** Composite CSM trend */
  csmTrend: 'rising' | 'stable' | 'falling';

  // --- Voice Activity ---

  /** Voice activity map */
  voiceActivity: Map<VoiceName, VoiceActivity>;

  /** Current active voice */
  currentVoice: VoiceName;

  /** Voice transitions (from -> to) */
  voiceTransitions: Array<{
    from: VoiceName;
    to: VoiceName;
    timestamp: string;
    reason: string;
  }>;

  // --- Playbook Activity ---

  /** Current playbook */
  currentPlaybook: PlaybookId;

  /** Playbook history */
  playbookHistory: Array<{
    playbook: PlaybookId;
    startedAt: string;
    endedAt?: string;
    reason: string;
  }>;

  // --- RAG Context ---

  /** Knowledge sources accessed */
  knowledgeAccessed: string[];

  /** SIFT results from session */
  siftResults: SiftResult[];

  /** Evidence contours used */
  evidenceContours: Array<'canon' | 'project' | 'company' | 'web'>;

  // --- User State ---

  /** Inferred user state */
  userState: UserStateInference;

  /** User feedback received */
  userFeedback: Array<{
    timestamp: string;
    type: 'positive' | 'negative' | 'neutral' | 'correction';
    content?: string;
  }>;

  // --- Session Quality ---

  /** Overall session quality */
  quality: SessionQuality;

  /** Session milestones */
  milestones: SessionMilestone[];

  /** Session warnings */
  warnings: SessionWarning[];

  // --- EWS State ---

  /** Current EWS state */
  ewsState: EWSState;

  /** Highest alert level reached */
  maxAlertLevel: AlertLevel;

  // --- Computed Indices ---

  /** Session alive index (0-1) */
  sessionAliveIndex: number;

  /** Session trust trajectory (-1 to 1) */
  trustTrajectory: number;

  /** Session clarity trajectory (-1 to 1) */
  clarityTrajectory: number;
}

// =============================================================================
// SESSION SUMMARY
// =============================================================================

/**
 * Session summary for storage and review
 */
export interface SessionSummary {
  /** Session ID */
  sessionId: string;

  /** Duration in minutes */
  durationMinutes: number;

  /** Message count */
  messageCount: number;

  /** Dominant voice */
  dominantVoice: VoiceName;

  /** Dominant playbook */
  dominantPlaybook: PlaybookId;

  /** Key topics */
  keyTopics: string[];

  /** Key insights (from milestones) */
  keyInsights: string[];

  /** Session quality */
  quality: SessionQuality;

  /** Average metrics */
  avgMetrics: {
    trust: number;
    clarity: number;
    pain: number;
    chaos: number;
    drift: number;
  };

  /** Final delta signature */
  finalDelta?: DeltaSignature;

  /** Recommendations for next session */
  nextSessionRecommendations: string[];
}

// =============================================================================
// SESSION ANALYTICS
// =============================================================================

/**
 * Engagement metrics
 */
export interface EngagementMetrics {
  /** Response rate (user responses / prompts) */
  responseRate: number;

  /** Average response length */
  avgResponseLength: number;

  /** Question ratio (questions / statements) */
  questionRatio: number;

  /** Topic depth (revisits to same topic) */
  topicDepth: number;

  /** Emotional engagement (0-1) */
  emotionalEngagement: number;
}

/**
 * Therapeutic progress metrics (if applicable)
 */
export interface TherapeuticMetrics {
  /** Insight generation rate */
  insightRate: number;

  /** Self-reflection depth (0-1) */
  selfReflectionDepth: number;

  /** Behavior change commitment (0-1) */
  behaviorChangeCommitment: number;

  /** Emotional regulation improvement (0-1) */
  emotionalRegulationImprovement: number;

  /** Trust building progress (0-1) */
  trustBuildingProgress: number;
}

/**
 * Pattern detection result
 */
export interface DetectedPattern {
  /** Pattern type */
  type: 'recurring_topic' | 'emotional_cycle' | 'avoidance' | 'growth' | 'regression';

  /** Pattern description */
  description: string;

  /** Confidence (0-1) */
  confidence: number;

  /** First occurrence */
  firstOccurrence: string;

  /** Occurrence count */
  occurrenceCount: number;

  /** Related topics */
  relatedTopics: string[];
}

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

/**
 * Create a new session
 */
export function createSession(userId?: string): IskraSession {
  const now = new Date().toISOString();
  const id = `session-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;

  const session: IskraSession = {
    id,
    startedAt: now,
    phase: 'opening',
    duration: 0,
    messageCount: 0,
    userMessageCount: 0,
    modelMessageCount: 0,
    currentMetrics: {
      rhythm: 50,
      trust: 0.7,
      pain: 0.1,
      chaos: 0.2,
      drift: 0.1,
      echo: 0.1,
      clarity: 0.7,
      silence_mass: 0.1,
      mirror_sync: 0.5,
      interrupt: 0.1,
      ctxSwitch: 0.1,
    },
    metricsHistory: [],
    fractalHistory: [],
    coherenceHistory: [],
    consciousnessState: {
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
      timestamp: now,
    },
    csmTrend: 'stable',
    voiceActivity: new Map(),
    currentVoice: 'ISKRA',
    voiceTransitions: [],
    currentPlaybook: 'routine',
    playbookHistory: [],
    knowledgeAccessed: [],
    siftResults: [],
    evidenceContours: [],
    userState: {
      inferredMood: 'neutral',
      engagementLevel: 0.5,
      topicsDiscussed: [],
      communicationStyle: 'exploratory',
      energyLevel: 0.5,
      opennessToFeedback: 0.5,
    },
    userFeedback: [],
    quality: 'moderate',
    milestones: [],
    warnings: [],
    ewsState: {
      alertLevel: 'normal',
      activeTriggers: [],
      anomalies: [],
      phaseTransition: null,
      lastCheck: now,
      consecutiveAlerts: 0,
    },
    maxAlertLevel: 'normal',
    sessionAliveIndex: 0.5,
    trustTrajectory: 0,
    clarityTrajectory: 0,
  };

  // Conditionally add userId to avoid exactOptionalPropertyTypes issue
  if (userId !== undefined) {
    session.userId = userId;
  }

  return session;
}

/**
 * Calculate session quality from metrics
 */
export function calculateSessionQuality(session: IskraSession): SessionQuality {
  const { sessionAliveIndex, trustTrajectory, clarityTrajectory, maxAlertLevel } = session;

  // Critical if max alert was critical or lockdown
  if (maxAlertLevel === 'critical' || maxAlertLevel === 'lockdown') {
    return 'critical';
  }

  // Combine factors
  const qualityScore =
    sessionAliveIndex * 0.4 +
    (trustTrajectory + 1) / 2 * 0.3 +
    (clarityTrajectory + 1) / 2 * 0.3;

  if (qualityScore >= 0.8) return 'excellent';
  if (qualityScore >= 0.6) return 'good';
  if (qualityScore >= 0.4) return 'moderate';
  return 'poor';
}

/**
 * Determine session phase based on message count and content
 */
export function determineSessionPhase(
  messageCount: number,
  milestones: SessionMilestone[]
): SessionPhase {
  if (messageCount <= 2) return 'opening';
  if (messageCount <= 5) return 'exploration';

  // Check for integration signals
  const hasCommitment = milestones.some(m => m.type === 'commitment');
  if (hasCommitment) return 'integration';

  // Check for breakthrough
  const hasBreakthrough = milestones.some(m => m.type === 'breakthrough');
  if (hasBreakthrough && messageCount > 15) return 'integration';

  return 'working';
}

/**
 * Calculate trajectory from history
 */
export function calculateTrajectory(values: number[]): number {
  if (values.length < 2) return 0;

  const firstHalf = values.slice(0, Math.floor(values.length / 2));
  const secondHalf = values.slice(Math.floor(values.length / 2));

  const firstAvg = firstHalf.reduce((a, b) => a + b, 0) / firstHalf.length;
  const secondAvg = secondHalf.reduce((a, b) => a + b, 0) / secondHalf.length;

  return Math.max(-1, Math.min(1, (secondAvg - firstAvg) * 2));
}

/**
 * Create session summary from session state
 */
export function createSessionSummary(session: IskraSession): SessionSummary {
  // Find dominant voice
  let dominantVoice: VoiceName = 'ISKRA';
  let maxActivations = 0;
  session.voiceActivity.forEach((activity, voice) => {
    if (activity.activationCount > maxActivations) {
      maxActivations = activity.activationCount;
      dominantVoice = voice;
    }
  });

  // Find dominant playbook
  const playbookCounts = new Map<PlaybookId, number>();
  session.playbookHistory.forEach(entry => {
    const count = playbookCounts.get(entry.playbook) || 0;
    playbookCounts.set(entry.playbook, count + 1);
  });
  let dominantPlaybook: PlaybookId = 'routine';
  let maxPlaybookCount = 0;
  playbookCounts.forEach((count, playbook) => {
    if (count > maxPlaybookCount) {
      maxPlaybookCount = count;
      dominantPlaybook = playbook;
    }
  });

  // Calculate average metrics
  const metricSums = {
    trust: 0,
    clarity: 0,
    pain: 0,
    chaos: 0,
    drift: 0,
  };
  session.metricsHistory.forEach(({ metrics }) => {
    metricSums.trust += metrics.trust;
    metricSums.clarity += metrics.clarity;
    metricSums.pain += metrics.pain;
    metricSums.chaos += metrics.chaos;
    metricSums.drift += metrics.drift;
  });
  const historyLength = session.metricsHistory.length || 1;
  const avgMetrics = {
    trust: metricSums.trust / historyLength,
    clarity: metricSums.clarity / historyLength,
    pain: metricSums.pain / historyLength,
    chaos: metricSums.chaos / historyLength,
    drift: metricSums.drift / historyLength,
  };

  return {
    sessionId: session.id,
    durationMinutes: Math.round(session.duration / 60000),
    messageCount: session.messageCount,
    dominantVoice,
    dominantPlaybook,
    keyTopics: session.userState.topicsDiscussed.slice(0, 5),
    keyInsights: session.milestones
      .filter(m => m.type === 'insight' || m.type === 'breakthrough')
      .map(m => m.description)
      .slice(0, 3),
    quality: session.quality,
    avgMetrics,
    nextSessionRecommendations: generateNextSessionRecommendations(session),
  };
}

/**
 * Generate recommendations for next session
 */
function generateNextSessionRecommendations(session: IskraSession): string[] {
  const recommendations: string[] = [];
  const thresholds = SESSION_RECOMMENDATION_THRESHOLDS;

  // Based on trust trajectory
  if (session.trustTrajectory < thresholds.trustTrajectoryForRebuild) {
    recommendations.push('Focus on trust rebuilding in next session');
  }

  // Based on unresolved warnings
  const unresolvedWarnings = session.warnings.filter(w => !w.resolved);
  if (unresolvedWarnings.length > 0) {
    recommendations.push(`Address unresolved issues: ${unresolvedWarnings.map(w => w.type).join(', ')}`);
  }

  // Based on dominant voice
  const kainActivations = session.voiceActivity.get('KAIN')?.activationCount ?? 0;
  if (kainActivations > thresholds.kainActivationsForGentleApproach) {
    recommendations.push('Consider gentler approach in next session (ANHANTRA/MAKI)');
  }

  // Based on topics
  if (session.userState.topicsDiscussed.length > 0) {
    recommendations.push(`Continue exploring: ${session.userState.topicsDiscussed[0]}`);
  }

  // Based on milestones
  const commitments = session.milestones.filter(m => m.type === 'commitment');
  if (commitments.length > 0) {
    recommendations.push('Check progress on previous commitments');
  }

  return recommendations.slice(0, thresholds.maxRecommendations);
}
