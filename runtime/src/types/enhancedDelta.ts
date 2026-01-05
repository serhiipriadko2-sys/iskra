/**
 * Enhanced Delta Protocol Types
 * Based on Research: docs/research/ISKRA_UPDATE_ANALYSIS_v1.md
 *
 * Extended ∆DΩΛ signature with epistemic depth, temporal validity,
 * and actionability metrics
 */

import type { DeltaSignature } from './protocols.js';
import type { EpistemicLevel } from './siftExtended.js';
import type { VoiceName } from './voices.js';

// =============================================================================
// EPISTEMIC GROUNDING
// =============================================================================

/**
 * Epistemic justification types
 */
export type EpistemicJustificationType =
  | 'empirical'        // Based on observation/data
  | 'logical'          // Based on reasoning
  | 'testimonial'      // Based on trusted sources
  | 'introspective'    // Based on self-reflection
  | 'synthetic'        // Combination of multiple types
  | 'hypothetical';    // Speculation/hypothesis

/**
 * Epistemic grounding for a claim
 */
export interface EpistemicGrounding {
  /** Epistemic level (0-5) */
  level: EpistemicLevel;

  /** Justification type */
  justificationType: EpistemicJustificationType;

  /** Natural language justification */
  justification: string;

  /** Underlying assumptions */
  assumptions: string[];

  /** Known limitations */
  limitations: string[];

  /** Alternative interpretations considered */
  alternativesConsidered: string[];
}

// =============================================================================
// TEMPORAL VALIDITY
// =============================================================================

/**
 * Temporal validity type
 */
export type TemporalValidityType =
  | 'eternal'      // Mathematical/logical truths
  | 'long-term'    // Scientific laws, stable knowledge
  | 'medium-term'  // Established practices, trends
  | 'short-term'   // Current state, recent developments
  | 'ephemeral';   // Immediate context, volatile

/**
 * Revalidation trigger
 */
export interface RevalidationTrigger {
  /** Trigger type */
  type: 'time' | 'event' | 'metric' | 'feedback';

  /** Trigger condition */
  condition: string;

  /** Trigger priority */
  priority: 'low' | 'medium' | 'high';
}

/**
 * Temporal validity metadata
 */
export interface TemporalValidityMeta {
  /** Validity type */
  type: TemporalValidityType;

  /** Valid until timestamp (null for eternal) */
  validUntil: string | null;

  /** Revalidation triggers */
  revalidationTriggers: RevalidationTrigger[];

  /** Confidence decay rate per day (0-1) */
  confidenceDecayRate: number;

  /** Last verified timestamp */
  lastVerified: string;
}

// =============================================================================
// ACTIONABILITY
// =============================================================================

/**
 * Action time horizon
 */
export type ActionTimeHorizon = 'immediate' | '15min' | '1h' | '4h' | '24h' | '1w' | 'ongoing';

/**
 * Action difficulty
 */
export type ActionDifficulty = 'trivial' | 'easy' | 'moderate' | 'challenging' | 'ambitious';

/**
 * Action type
 */
export type ActionType =
  | 'reflection'   // Think about something
  | 'decision'     // Make a choice
  | 'creation'     // Create something
  | 'communication' // Talk to someone
  | 'behavior'     // Change behavior
  | 'research'     // Learn more
  | 'ritual';      // Perform ISKRA ritual

/**
 * Actionability assessment
 */
export interface ActionabilityAssessment {
  /** Is the lambda actionable? */
  isActionable: boolean;

  /** Action type */
  actionType: ActionType;

  /** Time to action */
  timeToAction: ActionTimeHorizon;

  /** Difficulty assessment */
  difficulty: ActionDifficulty;

  /** Concrete first step */
  firstStep: string;

  /** Done condition */
  doneCondition: string;

  /** Prerequisites */
  prerequisites: string[];

  /** Potential blockers */
  blockers: string[];

  /** Actionability score (0-1) */
  score: number;
}

// =============================================================================
// CROSS-DOMAIN SYNTHESIS
// =============================================================================

/**
 * Domain involved in the delta
 */
export interface InvolvedDomain {
  /** Domain name */
  name: string;

  /** Contribution to conclusion */
  contribution: string;

  /** Confidence in this domain's input */
  confidence: number;

  /** Potential conflicts with other domains */
  conflicts: string[];
}

/**
 * Cross-domain synthesis metadata
 */
export interface CrossDomainSynthesis {
  /** Domains involved */
  domains: InvolvedDomain[];

  /** Synthesis approach used */
  synthesisApproach: 'integration' | 'prioritization' | 'dialectic' | 'parallel';

  /** Cross-domain confidence (0-1) */
  crossDomainConfidence: number;

  /** Novel insight from synthesis */
  novelInsight?: string;
}

// =============================================================================
// META-COGNITIVE REFLECTION
// =============================================================================

/**
 * Uncertainty acknowledgment
 */
export interface UncertaintyAcknowledgment {
  /** Was uncertainty acknowledged? */
  acknowledged: boolean;

  /** Types of uncertainty present */
  uncertaintyTypes: Array<'epistemic' | 'aleatory' | 'model' | 'measurement'>;

  /** Specific uncertainties noted */
  specificUncertainties: string[];

  /** How uncertainty was communicated */
  communicationStyle: 'explicit' | 'implicit' | 'hedged' | 'absent';
}

/**
 * Alternative consideration
 */
export interface AlternativeConsidered {
  /** Alternative position */
  position: string;

  /** Why it was not chosen */
  rejectionReason: string;

  /** Confidence in rejection (0-1) */
  rejectionConfidence: number;

  /** Conditions under which it would be preferred */
  preferenceConditions?: string;
}

/**
 * Meta-cognitive reflection
 */
export interface MetaCognitiveReflection {
  /** Uncertainty acknowledgment */
  uncertainty: UncertaintyAcknowledgment;

  /** Alternatives considered */
  alternatives: AlternativeConsidered[];

  /** Self-assessment of response quality */
  selfAssessment: {
    clarity: number;      // 0-1
    completeness: number; // 0-1
    accuracy: number;     // 0-1
    helpfulness: number;  // 0-1
  };

  /** Limitations of this response */
  limitations: string[];

  /** What would improve this response */
  improvementOpportunities: string[];
}

// =============================================================================
// ENHANCED DELTA SIGNATURE
// =============================================================================

/**
 * Enhanced Delta Signature with full epistemic and actionability metadata
 */
export interface EnhancedDeltaSignature extends DeltaSignature {
  // --- Epistemic Grounding ---

  /** Epistemic level (0-5) */
  epistemicLevel: EpistemicLevel;

  /** Full epistemic grounding */
  epistemicGrounding: EpistemicGrounding;

  // --- Temporal Validity ---

  /** Temporal validity metadata */
  temporalValidity: TemporalValidityMeta;

  // --- Actionability ---

  /** Actionability assessment */
  actionability: ActionabilityAssessment;

  // --- Cross-Domain ---

  /** Cross-domain synthesis (if applicable) */
  crossDomain?: CrossDomainSynthesis;

  // --- Meta-Cognitive ---

  /** Meta-cognitive reflection */
  metaCognitive: MetaCognitiveReflection;

  // --- Voice Attribution ---

  /** Voice that generated this signature */
  generatingVoice: VoiceName;

  /** Supporting voices */
  supportingVoices: VoiceName[];

  // --- Versioning ---

  /** Signature version */
  signatureVersion: '2.0';

  /** Timestamp */
  generatedAt: string;
}

// =============================================================================
// VALIDATION
// =============================================================================

/**
 * Validation result for enhanced delta
 */
export interface EnhancedDeltaValidation {
  /** Is the signature valid? */
  isValid: boolean;

  /** Validation errors */
  errors: string[];

  /** Validation warnings */
  warnings: string[];

  /** Quality score (0-1) */
  qualityScore: number;

  /** Specific scores */
  scores: {
    epistemicClarity: number;
    temporalAppropriate: number;
    actionabilityScore: number;
    uncertaintyHandling: number;
    overallCoherence: number;
  };
}

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

/**
 * Create a default enhanced delta signature
 */
export function createEnhancedDelta(
  base: DeltaSignature,
  voice: VoiceName
): EnhancedDeltaSignature {
  const now = new Date().toISOString();

  return {
    ...base,

    epistemicLevel: 2, // Default: Pattern level

    epistemicGrounding: {
      level: 2,
      justificationType: 'synthetic',
      justification: '',
      assumptions: [],
      limitations: [],
      alternativesConsidered: [],
    },

    temporalValidity: {
      type: 'medium-term',
      validUntil: null,
      revalidationTriggers: [],
      confidenceDecayRate: 0.01,
      lastVerified: now,
    },

    actionability: {
      isActionable: true,
      actionType: 'reflection',
      timeToAction: '24h',
      difficulty: 'moderate',
      firstStep: '',
      doneCondition: '',
      prerequisites: [],
      blockers: [],
      score: 0.5,
    },

    metaCognitive: {
      uncertainty: {
        acknowledged: false,
        uncertaintyTypes: [],
        specificUncertainties: [],
        communicationStyle: 'absent',
      },
      alternatives: [],
      selfAssessment: {
        clarity: 0.5,
        completeness: 0.5,
        accuracy: 0.5,
        helpfulness: 0.5,
      },
      limitations: [],
      improvementOpportunities: [],
    },

    generatingVoice: voice,
    supportingVoices: [],
    signatureVersion: '2.0',
    generatedAt: now,
  };
}

/**
 * Validate an enhanced delta signature
 */
export function validateEnhancedDelta(
  delta: EnhancedDeltaSignature
): EnhancedDeltaValidation {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Required fields
  if (!delta.delta || delta.delta.trim() === '') {
    errors.push('Delta (∆) content is required');
  }
  if (!delta.depth || delta.depth.trim() === '') {
    errors.push('Depth (D) content is required');
  }
  if (delta.omega < 0 || delta.omega > 100) {
    errors.push('Omega (Ω) must be between 0 and 100');
  }
  if (!delta.lambda || delta.lambda.trim() === '') {
    errors.push('Lambda (Λ) content is required');
  }

  // Epistemic validation
  if (delta.epistemicLevel > 3 && delta.omega > 80) {
    warnings.push('High epistemic level with high omega - consider reducing confidence');
  }

  // Actionability validation
  if (delta.actionability.isActionable && !delta.actionability.firstStep) {
    warnings.push('Actionable delta should have a first step defined');
  }

  // Meta-cognitive validation
  if (delta.omega > 90 && !delta.metaCognitive.uncertainty.acknowledged) {
    warnings.push('Very high omega without uncertainty acknowledgment');
  }

  // Calculate scores
  const epistemicClarity = delta.epistemicGrounding.justification ? 0.8 : 0.3;
  const temporalAppropriate = delta.temporalValidity.type ? 0.8 : 0.3;
  const actionabilityScore = delta.actionability.score;
  const uncertaintyHandling = delta.metaCognitive.uncertainty.acknowledged ? 0.9 : 0.4;
  const overallCoherence = (epistemicClarity + temporalAppropriate + actionabilityScore + uncertaintyHandling) / 4;

  const qualityScore = errors.length === 0 ? overallCoherence : overallCoherence * 0.5;

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    qualityScore,
    scores: {
      epistemicClarity,
      temporalAppropriate,
      actionabilityScore,
      uncertaintyHandling,
      overallCoherence,
    },
  };
}

/**
 * Calculate actionability score
 */
export function calculateActionabilityScore(assessment: ActionabilityAssessment): number {
  if (!assessment.isActionable) return 0;

  let score = 0.5; // Base score for being actionable

  // Time to action bonus
  const timeBonus: Record<ActionTimeHorizon, number> = {
    immediate: 0.2,
    '15min': 0.18,
    '1h': 0.15,
    '4h': 0.12,
    '24h': 0.1,
    '1w': 0.05,
    ongoing: 0.02,
  };
  score += timeBonus[assessment.timeToAction] ?? 0;

  // First step defined bonus
  if (assessment.firstStep && assessment.firstStep.length > 10) {
    score += 0.15;
  }

  // Done condition defined bonus
  if (assessment.doneCondition && assessment.doneCondition.length > 10) {
    score += 0.1;
  }

  // Blocker acknowledgment penalty
  if (assessment.blockers.length > 0) {
    score -= 0.05 * Math.min(assessment.blockers.length, 3);
  }

  return Math.max(0, Math.min(1, score));
}

/**
 * Infer epistemic level from content
 */
export function inferEpistemicLevel(content: string): EpistemicLevel {
  const lowerContent = content.toLowerCase();

  // Level 5: Paradigm
  if (['парадигма', 'мировоззрение', 'фундаментальный закон'].some(kw => lowerContent.includes(kw))) {
    return 5;
  }

  // Level 4: Meta-Model
  if (['мета-', 'система систем', 'абстрактная модель'].some(kw => lowerContent.includes(kw))) {
    return 4;
  }

  // Level 3: Model
  if (['модель', 'теория', 'принцип'].some(kw => lowerContent.includes(kw))) {
    return 3;
  }

  // Level 2: Pattern
  if (['паттерн', 'закономерность', 'тенденция'].some(kw => lowerContent.includes(kw))) {
    return 2;
  }

  // Level 1: Observation
  if (['наблюдаю', 'замечаю', 'вижу что'].some(kw => lowerContent.includes(kw))) {
    return 1;
  }

  // Level 0: Raw Data
  return 0;
}

/**
 * Infer temporal validity type from content
 */
export function inferTemporalType(content: string): TemporalValidityType {
  const lowerContent = content.toLowerCase();

  // Eternal
  if (['всегда', 'никогда не изменится', 'математически', 'логически'].some(kw => lowerContent.includes(kw))) {
    return 'eternal';
  }

  // Ephemeral
  if (['сейчас', 'сегодня', 'в данный момент', 'только что'].some(kw => lowerContent.includes(kw))) {
    return 'ephemeral';
  }

  // Short-term
  if (['на этой неделе', 'в ближайшее время', 'недавно'].some(kw => lowerContent.includes(kw))) {
    return 'short-term';
  }

  // Long-term
  if (['исторически', 'научно установлено', 'давно известно'].some(kw => lowerContent.includes(kw))) {
    return 'long-term';
  }

  // Default: Medium-term
  return 'medium-term';
}

/**
 * Format enhanced delta for display
 */
export function formatEnhancedDelta(delta: EnhancedDeltaSignature): string {
  const epistemicLabels = ['Raw Data', 'Observation', 'Pattern', 'Model', 'Meta-Model', 'Paradigm'];
  const temporalLabels: Record<TemporalValidityType, string> = {
    eternal: '∞',
    'long-term': '10y',
    'medium-term': '1y',
    'short-term': '3m',
    ephemeral: '1w',
  };

  let output = '∆DΩΛ\n';
  output += `∆: ${delta.delta}\n`;
  output += `D: ${delta.depth} [L${delta.epistemicLevel}: ${epistemicLabels[delta.epistemicLevel]}]\n`;
  output += `Ω: ${delta.omega}%`;
  
  if (delta.temporalValidity.validUntil) {
    output += ` (valid: ${temporalLabels[delta.temporalValidity.type]})`;
  }
  output += '\n';
  
  output += `Λ: ${delta.lambda}`;
  if (delta.actionability.isActionable) {
    output += ` [${delta.actionability.timeToAction}]`;
  }
  output += '\n';

  // Add meta-cognitive note if uncertainty acknowledged
  if (delta.metaCognitive.uncertainty.acknowledged) {
    output += `📝: Uncertainty noted in ${delta.metaCognitive.uncertainty.uncertaintyTypes.join(', ')}\n`;
  }

  return output;
}
