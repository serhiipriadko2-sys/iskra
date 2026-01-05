/**
 * ISKRA Voice Dialectic Types
 * Based on Research: docs/research/ISKRA_GLOBAL_UPDATE_v2.md
 *
 * Implements structured voice debates using the Thesis-Antithesis-Synthesis
 * model for complex decision making and perspective integration.
 *
 * @module @iskra/runtime/voiceDialectic
 * @version vΩ.5.1
 */

import type { VoiceName } from './voices.js';
import type { IskraMetrics } from './metrics.js';

// =============================================================================
// CORE DIALECTIC TYPES
// =============================================================================

/**
 * Status of a dialectic session
 */
export type DialecticStatus =
  | 'initiating'     // Session starting, selecting participants
  | 'thesis'         // Generating thesis position
  | 'antithesis'     // Generating antithesis position
  | 'deliberation'   // Voices are discussing
  | 'synthesis'      // Attempting synthesis
  | 'resolved'       // Successfully resolved
  | 'deadlocked'     // Could not reach synthesis
  | 'escalated';     // Escalated to arbiter

/**
 * A position held by a voice in the dialectic
 */
export interface VoicePosition {
  /** Voice holding this position */
  voice: VoiceName;
  /** The position statement */
  position: string;
  /** Confidence in this position (0-1) */
  confidence: number;
  /** Detailed reasoning */
  reasoning: string;
  /** Supporting evidence or citations */
  evidence?: string[];
  /** Key assumptions made */
  assumptions?: string[];
  /** Potential weaknesses acknowledged */
  weaknesses?: string[];
  /** Metrics state when position was formed */
  metricsSnapshot?: Partial<IskraMetrics>;
}

/**
 * A turn in the dialectic debate
 */
export interface DialecticTurn {
  /** Order of this turn (1-based) */
  order: number;
  /** Voice speaking */
  speaker: VoiceName;
  /** Type of contribution */
  type:
    | 'opening'       // Initial thesis/antithesis statement
    | 'response'      // Direct response to previous turn
    | 'question'      // Clarifying question
    | 'concession'    // Acknowledging validity of other position
    | 'objection'     // Challenging a point
    | 'evidence'      // Providing supporting evidence
    | 'synthesis'     // Attempting synthesis
    | 'meta';         // Meta-observation about the process
  /** Content of the turn */
  content: string;
  /** Timestamp */
  timestamp: string;
  /** Which position this supports (if applicable) */
  supportsPosition?: 'thesis' | 'antithesis' | 'neutral';
  /** Strength of the contribution (0-1) */
  strength?: number;
}

/**
 * Result of synthesis attempt
 */
export interface DialecticSynthesis {
  /** Voice that facilitated synthesis */
  facilitator: VoiceName;
  /** The synthesized resolution */
  resolution: string;
  /** How much consensus was achieved (0-1) */
  consensusLevel: number;
  /** Elements taken from thesis */
  fromThesis: string[];
  /** Elements taken from antithesis */
  fromAntithesis: string[];
  /** Novel elements in synthesis */
  novelElements: string[];
  /** Unresolved tensions that remain */
  remainingTensions: string[];
  /** Actionable items from the resolution */
  actionItems: string[];
  /** Quality score of the synthesis (0-1) */
  qualityScore: number;
}

/**
 * An alliance between voices on a specific issue
 */
export interface VoiceAlliance {
  /** Voices in the alliance */
  voices: VoiceName[];
  /** What they're aligned on */
  alignedOn: string;
  /** Strength of the alliance (0-1) */
  strength: number;
  /** Whether this is a temporary or persistent alliance */
  type: 'temporary' | 'persistent';
  /** When this alliance formed */
  formedAt: string;
}

// =============================================================================
// DIALECTIC SESSION
// =============================================================================

/**
 * Configuration for a dialectic session
 */
export interface DialecticConfig {
  /** Maximum number of turns before forcing synthesis */
  maxTurns: number;
  /** Minimum consensus required for resolution */
  minConsensusForResolution: number;
  /** Whether to allow deadlock */
  allowDeadlock: boolean;
  /** Timeout for each turn in milliseconds */
  turnTimeoutMs: number;
  /** Whether to record full transcript */
  recordTranscript: boolean;
  /** Whether synthesis must include action items */
  requireActionItems: boolean;
  /** Voices that cannot participate */
  excludedVoices?: VoiceName[];
  /** Required voices that must participate */
  requiredVoices?: VoiceName[];
}

/**
 * A complete dialectic session
 */
export interface DialecticSession {
  /** Unique session identifier */
  id: string;
  /** The question or topic being debated */
  question: string;
  /** Why this dialectic was initiated */
  context: string;
  /** Current status */
  status: DialecticStatus;
  /** Session configuration */
  config: DialecticConfig;

  /** Thesis position */
  thesis?: VoicePosition;
  /** Antithesis position */
  antithesis?: VoicePosition;
  /** Synthesis result */
  synthesis?: DialecticSynthesis;

  /** All participating voices */
  participants: VoiceName[];
  /** Arbiter if one was needed */
  arbiter?: VoiceName;
  /** Full transcript of the debate */
  transcript: DialecticTurn[];
  /** Alliances formed during debate */
  alliances: VoiceAlliance[];

  /** When session started */
  startedAt: string;
  /** When session was resolved */
  resolvedAt?: string;
  /** Total duration in milliseconds */
  durationMs?: number;

  /** Metrics at start of session */
  startMetrics?: IskraMetrics;
  /** Metrics at end of session */
  endMetrics?: IskraMetrics;

  /** Any errors during the session */
  errors?: string[];
}

// =============================================================================
// DIALECTIC RULES AND PROTOCOLS
// =============================================================================

/**
 * Rules governing the dialectic process
 */
export interface DialecticRules {
  /** Order of speaking after opening */
  speakingOrder: 'alternating' | 'free' | 'arbiter_controlled';
  /** How to handle interruptions */
  interruptionPolicy: 'allow' | 'disallow' | 'limited';
  /** How evidence is weighted */
  evidenceWeight: number;
  /** How concessions affect consensus */
  concessionBonus: number;
  /** Penalty for personal attacks (if any) */
  adHominemPenalty: number;
  /** Required format for positions */
  positionFormat?: {
    requireReasoning: boolean;
    requireEvidence: boolean;
    maxLength?: number;
  };
}

/**
 * Selection criteria for thesis/antithesis voices
 */
export interface VoiceSelectionCriteria {
  /** For thesis selection */
  thesis: {
    /** Voices that naturally align with structure/clarity */
    preferredVoices: VoiceName[];
    /** Metric conditions that favor certain voices */
    metricConditions: Array<{
      metric: keyof IskraMetrics;
      condition: 'high' | 'low';
      favors: VoiceName;
    }>;
  };
  /** For antithesis selection */
  antithesis: {
    /** Voices that naturally challenge/question */
    preferredVoices: VoiceName[];
    /** Should be opposite to thesis voice */
    preferOpposite: boolean;
  };
  /** For arbiter selection */
  arbiter: {
    /** Neutral voices for arbitration */
    neutralVoices: VoiceName[];
    /** Fallback if no neutral available */
    fallback: VoiceName;
  };
}

/**
 * Default voice selection criteria
 */
export const DEFAULT_SELECTION_CRITERIA: VoiceSelectionCriteria = {
  thesis: {
    preferredVoices: ['SAM', 'ISKRA', 'SIBYL'],
    metricConditions: [
      { metric: 'clarity', condition: 'high', favors: 'SAM' },
      { metric: 'trust', condition: 'high', favors: 'ISKRA' },
      { metric: 'echo', condition: 'high', favors: 'SIBYL' },
    ],
  },
  antithesis: {
    preferredVoices: ['KAIN', 'ISKRIV', 'HUNDUN'],
    preferOpposite: true,
  },
  arbiter: {
    neutralVoices: ['ISKRA', 'ANHANTRA'],
    fallback: 'ISKRA',
  },
};

// =============================================================================
// DIALECTIC OUTCOMES
// =============================================================================

/**
 * Quality assessment of a dialectic session
 */
export interface DialecticQuality {
  /** Overall quality score (0-1) */
  overall: number;
  /** Quality of the thesis */
  thesisQuality: number;
  /** Quality of the antithesis */
  antithesisQuality: number;
  /** Quality of deliberation */
  deliberationQuality: number;
  /** Quality of synthesis */
  synthesisQuality: number;
  /** How productive was the debate */
  productivity: number;
  /** How respectful was the exchange */
  civility: number;
  /** Did it produce actionable outcomes */
  actionability: number;
}

/**
 * Learning from a dialectic session
 */
export interface DialecticLearning {
  /** Pattern identified */
  pattern: string;
  /** Which voices work well together */
  effectivePairings: Array<{ voices: VoiceName[]; context: string }>;
  /** Which voice combinations create deadlock */
  deadlockRisks: Array<{ voices: VoiceName[]; reason: string }>;
  /** Successful synthesis strategies */
  synthesisStrategies: string[];
  /** Topics that benefit from dialectic */
  suitableTopics: string[];
}

// =============================================================================
// FACTORY FUNCTIONS
// =============================================================================

/**
 * Create default dialectic configuration
 */
export function createDefaultDialecticConfig(): DialecticConfig {
  return {
    maxTurns: 12,
    minConsensusForResolution: 0.6,
    allowDeadlock: true,
    turnTimeoutMs: 30000,
    recordTranscript: true,
    requireActionItems: false,
  };
}

/**
 * Create a new dialectic session
 */
export function createDialecticSession(
  question: string,
  context: string,
  options: Partial<DialecticConfig> = {}
): DialecticSession {
  return {
    id: `dial_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`,
    question,
    context,
    status: 'initiating',
    config: { ...createDefaultDialecticConfig(), ...options },
    participants: [],
    transcript: [],
    alliances: [],
    startedAt: new Date().toISOString(),
  };
}

/**
 * Create a voice position
 */
export function createVoicePosition(
  voice: VoiceName,
  position: string,
  reasoning: string,
  options: Partial<Omit<VoicePosition, 'voice' | 'position' | 'reasoning'>> = {}
): VoicePosition {
  const result: VoicePosition = {
    voice,
    position,
    reasoning,
    confidence: options.confidence ?? 0.7,
  };
  if (options.evidence !== undefined) {
    result.evidence = options.evidence;
  }
  if (options.assumptions !== undefined) {
    result.assumptions = options.assumptions;
  }
  if (options.weaknesses !== undefined) {
    result.weaknesses = options.weaknesses;
  }
  if (options.metricsSnapshot !== undefined) {
    result.metricsSnapshot = options.metricsSnapshot;
  }
  return result;
}

/**
 * Create a dialectic turn
 */
export function createDialecticTurn(
  order: number,
  speaker: VoiceName,
  type: DialecticTurn['type'],
  content: string,
  options: Partial<Omit<DialecticTurn, 'order' | 'speaker' | 'type' | 'content' | 'timestamp'>> = {}
): DialecticTurn {
  return {
    order,
    speaker,
    type,
    content,
    timestamp: new Date().toISOString(),
    ...options,
  };
}

/**
 * Create a dialectic synthesis
 */
export function createDialecticSynthesis(
  facilitator: VoiceName,
  resolution: string,
  options: Partial<Omit<DialecticSynthesis, 'facilitator' | 'resolution'>> = {}
): DialecticSynthesis {
  return {
    facilitator,
    resolution,
    consensusLevel: options.consensusLevel ?? 0.7,
    fromThesis: options.fromThesis ?? [],
    fromAntithesis: options.fromAntithesis ?? [],
    novelElements: options.novelElements ?? [],
    remainingTensions: options.remainingTensions ?? [],
    actionItems: options.actionItems ?? [],
    qualityScore: options.qualityScore ?? 0.7,
  };
}

/**
 * Calculate consensus level from positions and transcript
 */
export function calculateConsensusLevel(
  thesis: VoicePosition,
  antithesis: VoicePosition,
  transcript: DialecticTurn[]
): number {
  // Count concessions
  const concessions = transcript.filter(t => t.type === 'concession').length;

  // Count objections
  const objections = transcript.filter(t => t.type === 'objection').length;

  // Base consensus from confidence levels
  const confidenceFactor = (thesis.confidence + antithesis.confidence) / 2;

  // Adjust for debate dynamics
  const concessionBonus = Math.min(concessions * 0.1, 0.3);
  const objectionPenalty = Math.min(objections * 0.05, 0.2);

  return Math.max(0, Math.min(1, confidenceFactor + concessionBonus - objectionPenalty));
}

/**
 * Select arbiter based on participants and metrics
 */
export function selectArbiter(
  participants: VoiceName[],
  _metrics: IskraMetrics,
  criteria: VoiceSelectionCriteria = DEFAULT_SELECTION_CRITERIA
): VoiceName {
  // Find neutral voice not already participating
  for (const neutral of criteria.arbiter.neutralVoices) {
    if (!participants.includes(neutral)) {
      return neutral;
    }
  }

  // Use fallback
  return criteria.arbiter.fallback;
}

/**
 * Check if dialectic should be escalated
 */
export function shouldEscalate(session: DialecticSession): boolean {
  // Escalate if:
  // 1. Too many turns without progress
  if (session.transcript.length > session.config.maxTurns * 0.8) {
    const recentTurns = session.transcript.slice(-4);
    const hasProgress = recentTurns.some(t =>
      t.type === 'concession' || t.type === 'synthesis'
    );
    if (!hasProgress) return true;
  }

  // 2. Many objections without concessions
  const objections = session.transcript.filter(t => t.type === 'objection').length;
  const concessions = session.transcript.filter(t => t.type === 'concession').length;
  if (objections > 5 && concessions === 0) return true;

  return false;
}

/**
 * Check if session can be resolved
 */
export function canResolve(session: DialecticSession): boolean {
  if (!session.thesis || !session.antithesis) return false;

  const consensus = calculateConsensusLevel(
    session.thesis,
    session.antithesis,
    session.transcript
  );

  return consensus >= session.config.minConsensusForResolution;
}

/**
 * Assess quality of a completed dialectic session
 */
export function assessDialecticQuality(session: DialecticSession): DialecticQuality {
  const thesisQuality = session.thesis?.evidence?.length
    ? Math.min(0.5 + session.thesis.evidence.length * 0.1, 1)
    : 0.5;

  const antithesisQuality = session.antithesis?.evidence?.length
    ? Math.min(0.5 + session.antithesis.evidence.length * 0.1, 1)
    : 0.5;

  const deliberationQuality = Math.min(session.transcript.length / 8, 1);

  const synthesisQuality = session.synthesis?.qualityScore ?? 0;

  const productivity = session.synthesis
    ? (session.synthesis.actionItems.length > 0 ? 1 : 0.6)
    : 0.3;

  // Civility based on absence of errors and balanced speaking
  const speakerCounts = new Map<VoiceName, number>();
  session.transcript.forEach(t => {
    speakerCounts.set(t.speaker, (speakerCounts.get(t.speaker) || 0) + 1);
  });
  const counts = Array.from(speakerCounts.values());
  const maxCount = Math.max(...counts, 1);
  const minCount = Math.min(...counts, 0);
  const civility = maxCount > 0 ? 1 - (maxCount - minCount) / maxCount : 1;

  const actionability = session.synthesis?.actionItems.length
    ? Math.min(session.synthesis.actionItems.length * 0.25, 1)
    : 0;

  const overall =
    thesisQuality * 0.15 +
    antithesisQuality * 0.15 +
    deliberationQuality * 0.15 +
    synthesisQuality * 0.25 +
    productivity * 0.15 +
    civility * 0.05 +
    actionability * 0.1;

  return {
    overall,
    thesisQuality,
    antithesisQuality,
    deliberationQuality,
    synthesisQuality,
    productivity,
    civility,
    actionability,
  };
}
