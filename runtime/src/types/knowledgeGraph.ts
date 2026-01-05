/**
 * ISKRA Knowledge Graph Types
 * Based on Research: docs/research/ISKRA_UPDATE_ANALYSIS_v1.md
 *
 * GraphRAG-inspired knowledge structure for enhanced retrieval and reasoning
 */

import type { VoiceName } from './voices.js';
import type { TraceLabel } from './sift.js';

// =============================================================================
// KNOWLEDGE ENTITIES
// =============================================================================

/**
 * Entity types in the knowledge graph
 */
export type EntityType =
  | 'person'
  | 'concept'
  | 'event'
  | 'artifact'
  | 'emotion'
  | 'goal'
  | 'belief'
  | 'pattern'
  | 'ritual';

/**
 * Source priority for SIFT verification
 */
export type SourcePriority = 'A_CANON' | 'B_PROJECT' | 'C_COMPANY' | 'D_WEB';

/**
 * Knowledge entity node
 */
export interface KnowledgeEntity {
  /** Unique identifier */
  id: string;

  /** Entity name */
  name: string;

  /** Entity type */
  type: EntityType;

  /** Entity attributes */
  attributes: Record<string, unknown>;

  /** Vector embedding (for semantic search) */
  embedding?: number[];

  /** SIFT verification status */
  siftVerified: boolean;

  /** Source priority */
  sourcePriority: SourcePriority;

  /** Source reference */
  sourceRef?: string;

  /** Creation timestamp */
  createdAt: string;

  /** Last update timestamp */
  updatedAt: string;

  /** Voice affinity (which voices relate to this entity) */
  voiceAffinity?: Partial<Record<VoiceName, number>>;

  /** Tags for categorization */
  tags: string[];
}

/**
 * Concept node (abstract ideas)
 */
export interface ConceptNode extends KnowledgeEntity {
  type: 'concept';
  attributes: {
    definition: string;
    examples: string[];
    relatedConcepts: string[];
    abstractionLevel: number; // 0 = concrete, 5 = highly abstract
    domain: string;
  };
}

/**
 * Event node (things that happened)
 */
export interface EventNode extends KnowledgeEntity {
  type: 'event';
  attributes: {
    description: string;
    occurredAt: string;
    participants: string[];
    outcome: string;
    significance: number; // 0-1
  };
}

/**
 * Pattern node (recurring behaviors or themes)
 */
export interface PatternNode extends KnowledgeEntity {
  type: 'pattern';
  attributes: {
    description: string;
    frequency: number;
    triggers: string[];
    outcomes: string[];
    healthiness: number; // -1 to 1 (harmful to beneficial)
  };
}

// =============================================================================
// SEMANTIC RELATIONS
// =============================================================================

/**
 * Relation types between entities
 */
export type RelationType =
  | 'is_a'           // Taxonomy
  | 'part_of'        // Composition
  | 'causes'         // Causation
  | 'related_to'     // General relation
  | 'contradicts'    // Conflict
  | 'supports'       // Agreement
  | 'precedes'       // Temporal order
  | 'follows'        // Temporal order
  | 'triggers'       // Activation
  | 'inhibits'       // Suppression
  | 'exemplifies'    // Instance of
  | 'associated_with'; // Loose association

/**
 * Semantic relation between entities
 */
export interface SemanticRelation {
  /** Unique identifier */
  id: string;

  /** Source entity ID */
  from: string;

  /** Target entity ID */
  to: string;

  /** Relation type */
  type: RelationType;

  /** Relation strength (0-1) */
  strength: number;

  /** Is this relation bidirectional? */
  bidirectional: boolean;

  /** Evidence for this relation */
  evidence?: string;

  /** Trace label for verification */
  label?: TraceLabel;

  /** Confidence in this relation (0-1) */
  confidence: number;

  /** Creation timestamp */
  createdAt: string;
}

/**
 * Causal link (specialized relation for causation)
 */
export interface CausalLink extends SemanticRelation {
  type: 'causes';
  
  /** Causal mechanism */
  mechanism?: string;
  
  /** Time delay between cause and effect */
  timeDelay?: string;
  
  /** Probability of effect given cause (0-1) */
  probability: number;
  
  /** Confounding factors */
  confounders?: string[];
}

/**
 * Temporal link (specialized relation for time)
 */
export interface TemporalLink extends SemanticRelation {
  type: 'precedes' | 'follows';
  
  /** Time gap between events */
  timeGap?: string;
  
  /** Is the temporal order strict? */
  strictOrder: boolean;
}

// =============================================================================
// CLUSTERS AND INDICES
// =============================================================================

/**
 * Topic cluster (group of related entities)
 */
export interface TopicCluster {
  /** Cluster identifier */
  id: string;

  /** Cluster name */
  name: string;

  /** Cluster description */
  description: string;

  /** Entity IDs in this cluster */
  entityIds: string[];

  /** Centroid embedding */
  centroid?: number[];

  /** Cluster coherence (0-1) */
  coherence: number;

  /** Parent cluster (for hierarchy) */
  parentClusterId?: string;

  /** Child clusters */
  childClusterIds: string[];
}

/**
 * Voice affinity cluster (entities grouped by voice relevance)
 */
export interface VoiceAffinityCluster {
  /** Associated voice */
  voice: VoiceName;

  /** Entity IDs relevant to this voice */
  entityIds: string[];

  /** Average affinity score */
  avgAffinity: number;

  /** Key topics for this voice */
  keyTopics: string[];
}

/**
 * Vector index for semantic search
 */
export interface VectorIndex {
  /** Index name */
  name: string;

  /** Dimension of vectors */
  dimension: number;

  /** Number of indexed entities */
  entityCount: number;

  /** Index type */
  indexType: 'flat' | 'hnsw' | 'ivf';

  /** Last rebuild timestamp */
  lastRebuild: string;
}

/**
 * Keyword index for text search
 */
export interface KeywordIndex {
  /** Indexed fields */
  fields: string[];

  /** Total document count */
  documentCount: number;

  /** Unique term count */
  termCount: number;
}

/**
 * Temporal index for time-based queries
 */
export interface TemporalIndex {
  /** Earliest timestamp */
  earliest: string;

  /** Latest timestamp */
  latest: string;

  /** Event count */
  eventCount: number;

  /** Granularity */
  granularity: 'hour' | 'day' | 'week' | 'month';
}

// =============================================================================
// KNOWLEDGE GRAPH
// =============================================================================

/**
 * Complete ISKRA Knowledge Graph
 */
export interface IskraKnowledgeGraph {
  /** Graph version */
  version: string;

  /** Last update timestamp */
  lastUpdate: string;

  // --- Nodes ---

  /** All entities */
  entities: KnowledgeEntity[];

  /** Concept nodes */
  concepts: ConceptNode[];

  /** Event nodes */
  events: EventNode[];

  /** Pattern nodes */
  patterns: PatternNode[];

  // --- Edges ---

  /** Semantic relations */
  relations: SemanticRelation[];

  /** Causal links */
  causalLinks: CausalLink[];

  /** Temporal links */
  temporalLinks: TemporalLink[];

  // --- Clusters ---

  /** Topic clusters */
  topicClusters: TopicCluster[];

  /** Voice affinity clusters */
  voiceClusters: VoiceAffinityCluster[];

  // --- Indices ---

  /** Vector index */
  vectorIndex?: VectorIndex;

  /** Keyword index */
  keywordIndex?: KeywordIndex;

  /** Temporal index */
  temporalIndex?: TemporalIndex;

  // --- Statistics ---

  stats: GraphStatistics;
}

/**
 * Graph statistics
 */
export interface GraphStatistics {
  /** Total node count */
  nodeCount: number;

  /** Total edge count */
  edgeCount: number;

  /** Average degree (edges per node) */
  avgDegree: number;

  /** Graph density */
  density: number;

  /** Number of connected components */
  connectedComponents: number;

  /** Verification statistics */
  verification: {
    siftVerifiedCount: number;
    unverifiedCount: number;
    verificationRate: number;
  };

  /** Source distribution */
  sourceDist: Record<SourcePriority, number>;
}

// =============================================================================
// GRAPH SEARCH AND REASONING
// =============================================================================

/**
 * Graph search result
 */
export interface GraphSearchResult {
  /** Query that was searched */
  query: string;

  /** Matched entities */
  entities: Array<{
    entity: KnowledgeEntity;
    score: number;
    matchType: 'semantic' | 'keyword' | 'exact';
  }>;

  /** Related entities (through relations) */
  related: Array<{
    entity: KnowledgeEntity;
    relation: SemanticRelation;
    hopDistance: number;
  }>;

  /** Relevant clusters */
  clusters: TopicCluster[];

  /** Search metadata */
  metadata: {
    totalResults: number;
    searchTimeMs: number;
    indexesUsed: string[];
  };
}

/**
 * Reasoning path (for multi-hop reasoning)
 */
export interface ReasoningPath {
  /** Starting entity */
  startEntity: KnowledgeEntity;

  /** Ending entity */
  endEntity: KnowledgeEntity;

  /** Path through graph */
  path: Array<{
    entity: KnowledgeEntity;
    relation?: SemanticRelation;
  }>;

  /** Total path length (hops) */
  hops: number;

  /** Path explanation in natural language */
  explanation: string;

  /** Confidence (decays with hops) */
  confidence: number;

  /** Supporting evidence */
  evidence: string[];
}

/**
 * Voice-contextual retrieval result
 */
export interface VoiceContextualResult {
  /** Active voice */
  voice: VoiceName;

  /** Entities relevant to this voice */
  voiceRelevantEntities: Array<{
    entity: KnowledgeEntity;
    affinity: number;
  }>;

  /** Context tailored for this voice */
  contextBlock: string;

  /** Suggested response angle */
  suggestedAngle: string;
}

/**
 * Graph SIFT result
 */
export interface GraphSiftResult {
  /** Claim being verified */
  claim: string;

  /** Verification status */
  verified: boolean;

  /** Supporting entities */
  supportingEntities: KnowledgeEntity[];

  /** Contradicting entities */
  contradictingEntities: KnowledgeEntity[];

  /** Evidence paths */
  evidencePaths: ReasoningPath[];

  /** Overall confidence */
  confidence: number;

  /** Trace label */
  label: TraceLabel;

  /** Source priority of best evidence */
  sourcePriority: SourcePriority;
}

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

/**
 * Create an empty knowledge graph
 */
export function createEmptyGraph(): IskraKnowledgeGraph {
  return {
    version: '1.0.0',
    lastUpdate: new Date().toISOString(),
    entities: [],
    concepts: [],
    events: [],
    patterns: [],
    relations: [],
    causalLinks: [],
    temporalLinks: [],
    topicClusters: [],
    voiceClusters: [],
    stats: {
      nodeCount: 0,
      edgeCount: 0,
      avgDegree: 0,
      density: 0,
      connectedComponents: 0,
      verification: {
        siftVerifiedCount: 0,
        unverifiedCount: 0,
        verificationRate: 0,
      },
      sourceDist: {
        A_CANON: 0,
        B_PROJECT: 0,
        C_COMPANY: 0,
        D_WEB: 0,
      },
    },
  };
}

/**
 * Create a knowledge entity
 */
export function createEntity(
  name: string,
  type: EntityType,
  sourcePriority: SourcePriority,
  attributes: Record<string, unknown> = {}
): KnowledgeEntity {
  const now = new Date().toISOString();
  return {
    id: `entity-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`,
    name,
    type,
    attributes,
    siftVerified: false,
    sourcePriority,
    createdAt: now,
    updatedAt: now,
    tags: [],
  };
}

/**
 * Create a semantic relation
 */
export function createRelation(
  from: string,
  to: string,
  type: RelationType,
  strength: number = 0.5
): SemanticRelation {
  return {
    id: `rel-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`,
    from,
    to,
    type,
    strength,
    bidirectional: type === 'related_to' || type === 'associated_with',
    confidence: 0.5,
    createdAt: new Date().toISOString(),
  };
}

/**
 * Calculate confidence decay over hops
 */
export function calculateHopConfidenceDecay(
  initialConfidence: number,
  hops: number,
  decayRate: number = 0.15
): number {
  return initialConfidence * Math.pow(1 - decayRate, hops);
}

/**
 * Get source priority rank (lower is higher priority)
 */
export function getSourcePriorityRank(priority: SourcePriority): number {
  const ranks: Record<SourcePriority, number> = {
    A_CANON: 1,
    B_PROJECT: 2,
    C_COMPANY: 3,
    D_WEB: 4,
  };
  return ranks[priority];
}

/**
 * Compare source priorities
 */
export function isHigherPriority(a: SourcePriority, b: SourcePriority): boolean {
  return getSourcePriorityRank(a) < getSourcePriorityRank(b);
}

/**
 * Calculate graph density
 */
export function calculateGraphDensity(nodeCount: number, edgeCount: number): number {
  if (nodeCount <= 1) return 0;
  const maxEdges = nodeCount * (nodeCount - 1) / 2;
  return edgeCount / maxEdges;
}

/**
 * Get voice affinity for an entity
 */
export function getEntityVoiceAffinity(
  entity: KnowledgeEntity,
  voice: VoiceName
): number {
  return entity.voiceAffinity?.[voice] ?? 0;
}
