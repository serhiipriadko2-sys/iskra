/**
 * ISKRA Cognitive Memory Types
 * Based on Research: docs/research/ISKRA_GLOBAL_UPDATE_v2.md
 *
 * Implements episodic, semantic, and procedural memory architecture
 * inspired by cognitive science and AI companion best practices 2025-2026.
 *
 * @module @iskra/runtime/cognitiveMemory
 * @version vΩ.5.1
 */

import type { VoiceName } from './voices.js';

// =============================================================================
// EPISODIC MEMORY - Events and Experiences
// =============================================================================

/**
 * Emotional state context for memory tagging
 */
export interface EmotionalStateContext {
  /** Primary emotion */
  primary: 'joy' | 'sadness' | 'anger' | 'fear' | 'surprise' | 'trust' | 'anticipation' | 'neutral';
  /** Intensity of the emotion (0-1) */
  intensity: number;
  /** Secondary emotions if mixed */
  secondary?: string[];
  /** Valence (-1 to 1, negative to positive) */
  valence: number;
  /** Arousal level (0-1, calm to excited) */
  arousal: number;
}

/**
 * A discrete episode in memory - a specific event with context
 */
export interface EpisodicEvent {
  /** Unique identifier */
  id: string;
  /** ISO timestamp of when event occurred */
  timestamp: string;
  /** Main content/description of the event */
  content: string;
  /** Summary/title for quick reference */
  summary: string;
  /** Emotional context at time of event */
  emotionalContext: EmotionalStateContext;
  /** Participants involved ('user', 'iskra', or specific voice names) */
  participants: ('user' | 'iskra' | VoiceName)[];
  /** Outcome or resolution if any */
  outcome?: string;
  /** Significance score (0-1), how important this event is */
  significance: number;
  /** Number of times this memory has been recalled */
  recallCount: number;
  /** Last time this memory was accessed */
  lastRecalled?: string;
  /** Tags for categorization */
  tags: string[];
  /** Session ID where event occurred */
  sessionId?: string;
  /** Vector embedding for semantic search */
  embedding?: number[];
}

/**
 * Temporal index for efficient time-based retrieval
 */
export interface TemporalIndex {
  /** Start of indexed range */
  rangeStart: string;
  /** End of indexed range */
  rangeEnd: string;
  /** Episodes grouped by day */
  byDay: Map<string, string[]>;
  /** Episodes grouped by week */
  byWeek: Map<string, string[]>;
  /** Most recent episode IDs for quick access */
  recentIds: string[];
}

/**
 * Episodic memory store
 */
export interface EpisodicMemoryStore {
  /** All stored episodes */
  events: EpisodicEvent[];
  /** Temporal index for time-based queries */
  temporalIndex: TemporalIndex;
  /** Emotional tags for emotion-based retrieval */
  emotionalTags: Map<string, string[]>;
  /** Configuration */
  config: {
    /** Maximum number of episodes to store before consolidation */
    maxEpisodes: number;
    /** Significance threshold for long-term storage */
    significanceThreshold: number;
    /** How often to consolidate (in milliseconds) */
    consolidationInterval: number;
  };
}

// =============================================================================
// SEMANTIC MEMORY - Knowledge and Facts
// =============================================================================

/**
 * Source priority levels for knowledge verification
 */
export type SourcePriority = 'A' | 'B' | 'C' | 'D';

/**
 * A semantic concept - general knowledge or fact
 */
export interface SemanticConcept {
  /** Unique identifier */
  id: string;
  /** Name/label of the concept */
  name: string;
  /** Definition or description */
  definition: string;
  /** Vector embedding for semantic search */
  embedding?: number[];
  /** Whether verified through SIFT protocol */
  siftVerified: boolean;
  /** Source priority (A=canon, B=verified, C=unverified, D=hypothetical) */
  sourcePriority: SourcePriority;
  /** IDs of related concepts */
  relatedConcepts: string[];
  /** Domain/topic tags */
  domainTags: string[];
  /** When this concept was added */
  createdAt: string;
  /** When last updated */
  updatedAt: string;
  /** Confidence in this knowledge (0-1) */
  confidence: number;
  /** Original source of this information */
  source?: string;
  /** Any caveats or limitations */
  caveats?: string[];
}

/**
 * Semantic relation between concepts
 */
export interface SemanticRelation {
  /** Unique identifier */
  id: string;
  /** Source concept ID */
  fromId: string;
  /** Target concept ID */
  toId: string;
  /** Type of relation */
  relationType: 'is_a' | 'part_of' | 'causes' | 'related_to' | 'contradicts' | 'supports' | 'example_of' | 'opposite_of';
  /** Strength of the relation (0-1) */
  strength: number;
  /** Whether relation is bidirectional */
  bidirectional: boolean;
  /** When this relation was established */
  createdAt: string;
  /** Evidence or reasoning for this relation */
  evidence?: string;
}

/**
 * Vector index for semantic search
 */
export interface VectorIndex {
  /** Dimension of vectors */
  dimension: number;
  /** Index type (e.g., 'hnsw', 'ivfflat') */
  indexType: string;
  /** Number of indexed items */
  itemCount: number;
  /** Last rebuild timestamp */
  lastRebuilt: string;
}

/**
 * Semantic memory store
 */
export interface SemanticMemoryStore {
  /** All stored concepts */
  concepts: SemanticConcept[];
  /** Relations between concepts */
  relations: SemanticRelation[];
  /** Vector index for semantic search */
  vectorIndex: VectorIndex;
  /** SIFT verification cache */
  siftCache: Map<string, {
    verified: boolean;
    verifiedAt: string;
    omega: number;
  }>;
  /** Configuration */
  config: {
    /** Minimum confidence for auto-accept */
    minConfidence: number;
    /** Require SIFT for concepts above this priority */
    siftRequiredForPriority: SourcePriority;
  };
}

// =============================================================================
// PROCEDURAL MEMORY - Skills and Behaviors
// =============================================================================

/**
 * A single step in a procedural sequence
 */
export interface ActionStep {
  /** Step order (1-based) */
  order: number;
  /** Description of the action */
  description: string;
  /** Type of action */
  type: 'speech' | 'query' | 'transform' | 'validate' | 'decide' | 'wait';
  /** Parameters for this step */
  parameters?: Record<string, unknown>;
  /** Expected duration in milliseconds */
  expectedDurationMs?: number;
  /** Fallback step if this fails */
  fallbackStep?: number;
}

/**
 * Condition that triggers a skill
 */
export interface TriggerCondition {
  /** Type of trigger */
  type: 'metric_threshold' | 'keyword' | 'pattern' | 'voice_active' | 'playbook' | 'time';
  /** Condition expression or value */
  condition: string;
  /** Weight for this trigger (for multi-trigger skills) */
  weight: number;
}

/**
 * Adaptation to a skill based on feedback
 */
export interface SkillAdaptation {
  /** When adaptation was made */
  timestamp: string;
  /** What triggered the adaptation */
  trigger: string;
  /** What was changed */
  change: string;
  /** Effect on success rate */
  successRateImpact: number;
  /** Whether to keep this adaptation */
  retained: boolean;
}

/**
 * A procedural skill - learned behavior or routine
 */
export interface ProceduralSkill {
  /** Unique identifier */
  id: string;
  /** Name of the skill */
  name: string;
  /** Description of what this skill does */
  description: string;
  /** Sequence of steps to execute */
  steps: ActionStep[];
  /** Conditions that trigger this skill */
  triggerConditions: TriggerCondition[];
  /** Success rate based on feedback (0-1) */
  successRate: number;
  /** Number of times executed */
  executionCount: number;
  /** When this skill was created */
  createdAt: string;
  /** Last time this skill was used */
  lastUsed?: string;
  /** Adaptations made to this skill */
  adaptations: SkillAdaptation[];
  /** Which voices commonly use this skill */
  preferredVoices: VoiceName[];
  /** Skill category */
  category: 'response' | 'analysis' | 'verification' | 'support' | 'ritual';
  /** Whether skill is active */
  isActive: boolean;
}

/**
 * Feedback for skill adaptation
 */
export interface SkillFeedback {
  /** Skill that was executed */
  skillId: string;
  /** Whether execution was successful */
  success: boolean;
  /** User feedback if any */
  userFeedback?: string;
  /** Metrics at time of execution */
  metricsAtExecution?: Partial<Record<string, number>>;
  /** Suggested improvements */
  improvements?: string[];
}

/**
 * Result of skill execution
 */
export interface SkillExecutionResult {
  /** Skill that was executed */
  skillId: string;
  /** Whether execution completed */
  completed: boolean;
  /** Output of the skill */
  output?: unknown;
  /** Steps that were executed */
  stepsExecuted: number;
  /** Duration of execution */
  durationMs: number;
  /** Any errors that occurred */
  errors?: string[];
}

/**
 * Procedural memory store
 */
export interface ProceduralMemoryStore {
  /** All registered skills */
  skills: ProceduralSkill[];
  /** Recent executions for learning */
  executionHistory: Array<{
    skillId: string;
    timestamp: string;
    result: SkillExecutionResult;
    feedback?: SkillFeedback;
  }>;
  /** Configuration */
  config: {
    /** Minimum success rate to keep skill active */
    minSuccessRate: number;
    /** Number of executions before adaptation */
    adaptationThreshold: number;
    /** Maximum adaptations per skill */
    maxAdaptations: number;
  };
}

// =============================================================================
// ASSOCIATIVE LINKS - Cross-Memory Connections
// =============================================================================

/**
 * Link between different memory types
 */
export interface AssociativeLink {
  /** Unique identifier */
  id: string;
  /** Source memory type and ID */
  source: {
    type: 'episodic' | 'semantic' | 'procedural';
    id: string;
  };
  /** Target memory type and ID */
  target: {
    type: 'episodic' | 'semantic' | 'procedural';
    id: string;
  };
  /** Strength of association (0-1) */
  strength: number;
  /** How this association was formed */
  formationType: 'co-occurrence' | 'explicit' | 'inferred' | 'temporal';
  /** When link was created */
  createdAt: string;
  /** Number of times this link was activated */
  activationCount: number;
}

// =============================================================================
// COGNITIVE MEMORY STATE - Complete Memory System
// =============================================================================

/**
 * Complete cognitive memory state
 */
export interface CognitiveMemoryState {
  /** Episodic memory (events and experiences) */
  episodic: EpisodicMemoryStore;
  /** Semantic memory (knowledge and facts) */
  semantic: SemanticMemoryStore;
  /** Procedural memory (skills and behaviors) */
  procedural: ProceduralMemoryStore;
  /** Cross-memory associative links */
  associativeLinks: AssociativeLink[];
  /** Memory statistics */
  stats: {
    totalEpisodes: number;
    totalConcepts: number;
    totalSkills: number;
    totalLinks: number;
    lastConsolidation: string;
    memoryUtilization: number;
  };
}

// =============================================================================
// FACTORY FUNCTIONS
// =============================================================================

/**
 * Create a default emotional state context
 */
export function createDefaultEmotionalState(): EmotionalStateContext {
  return {
    primary: 'neutral',
    intensity: 0.5,
    valence: 0,
    arousal: 0.5,
  };
}

/**
 * Create a new episodic event
 */
export function createEpisodicEvent(
  content: string,
  options: Partial<Omit<EpisodicEvent, 'id' | 'timestamp' | 'recallCount'>> = {}
): EpisodicEvent {
  const baseEvent: EpisodicEvent = {
    id: `ep_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`,
    timestamp: new Date().toISOString(),
    content,
    summary: content.slice(0, 100),
    emotionalContext: createDefaultEmotionalState(),
    participants: ['user', 'iskra'],
    significance: 0.5,
    recallCount: 0,
    tags: [],
  };
  
  // Merge options, but preserve generated id, timestamp, and recallCount
  return {
    ...baseEvent,
    ...options,
    id: baseEvent.id,
    timestamp: baseEvent.timestamp,
    recallCount: baseEvent.recallCount,
    content, // Preserve required content parameter
  };
}

/**
 * Create a new semantic concept
 */
export function createSemanticConcept(
  name: string,
  definition: string,
  options: Partial<Omit<SemanticConcept, 'id' | 'createdAt' | 'updatedAt'>> = {}
): SemanticConcept {
  const now = new Date().toISOString();
  const baseConcept: SemanticConcept = {
    id: `sem_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`,
    name,
    definition,
    siftVerified: false,
    sourcePriority: 'C',
    relatedConcepts: [],
    domainTags: [],
    createdAt: now,
    updatedAt: now,
    confidence: 0.5,
  };
  
  // Merge options, but preserve generated fields and required params
  return {
    ...baseConcept,
    ...options,
    id: baseConcept.id,
    createdAt: baseConcept.createdAt,
    updatedAt: baseConcept.updatedAt,
    name,
    definition,
  };
}

/**
 * Create a new procedural skill
 */
export function createProceduralSkill(
  name: string,
  description: string,
  steps: ActionStep[],
  options: Partial<Omit<ProceduralSkill, 'id' | 'createdAt' | 'executionCount' | 'successRate'>> = {}
): ProceduralSkill {
  const baseSkill: ProceduralSkill = {
    id: `proc_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`,
    name,
    description,
    steps,
    triggerConditions: [],
    successRate: 0.5,
    executionCount: 0,
    createdAt: new Date().toISOString(),
    adaptations: [],
    preferredVoices: [],
    category: 'response',
    isActive: true,
  };
  
  // Merge options, but preserve generated fields and required params
  return {
    ...baseSkill,
    ...options,
    id: baseSkill.id,
    createdAt: baseSkill.createdAt,
    executionCount: baseSkill.executionCount,
    successRate: baseSkill.successRate,
    name,
    description,
    steps,
  };
}

/**
 * Create an empty cognitive memory state
 */
export function createEmptyCognitiveMemoryState(): CognitiveMemoryState {
  return {
    episodic: {
      events: [],
      temporalIndex: {
        rangeStart: new Date().toISOString(),
        rangeEnd: new Date().toISOString(),
        byDay: new Map(),
        byWeek: new Map(),
        recentIds: [],
      },
      emotionalTags: new Map(),
      config: {
        maxEpisodes: 10000,
        significanceThreshold: 0.3,
        consolidationInterval: 24 * 60 * 60 * 1000, // 24 hours
      },
    },
    semantic: {
      concepts: [],
      relations: [],
      vectorIndex: {
        dimension: 768,
        indexType: 'hnsw',
        itemCount: 0,
        lastRebuilt: new Date().toISOString(),
      },
      siftCache: new Map(),
      config: {
        minConfidence: 0.7,
        siftRequiredForPriority: 'A',
      },
    },
    procedural: {
      skills: [],
      executionHistory: [],
      config: {
        minSuccessRate: 0.5,
        adaptationThreshold: 5,
        maxAdaptations: 10,
      },
    },
    associativeLinks: [],
    stats: {
      totalEpisodes: 0,
      totalConcepts: 0,
      totalSkills: 0,
      totalLinks: 0,
      lastConsolidation: new Date().toISOString(),
      memoryUtilization: 0,
    },
  };
}

/**
 * Calculate significance score for an event
 */
export function calculateSignificance(
  emotionalIntensity: number,
  participantCount: number,
  hasOutcome: boolean
): number {
  let score = emotionalIntensity * 0.4;
  score += Math.min(participantCount / 5, 1) * 0.3;
  score += hasOutcome ? 0.3 : 0;
  return Math.min(score, 1);
}
