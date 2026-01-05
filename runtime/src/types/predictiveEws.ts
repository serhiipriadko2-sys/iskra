/**
 * ISKRA Predictive Early Warning System Types
 * Based on Research: docs/research/ISKRA_GLOBAL_UPDATE_v2.md
 *
 * Extends the EWS with predictive capabilities, pattern matching,
 * and user-specific calibration for proactive intervention.
 *
 * @module @iskra/runtime/predictiveEws
 * @version vΩ.5.1
 */

import type { AlertLevel, EWSState, EWSThresholds } from './ews.js';
import type { IskraMetrics } from './metrics.js';
import type { FractalIndicators } from './fractal.js';

// =============================================================================
// PREDICTION TYPES
// =============================================================================

/**
 * Factor contributing to a prediction
 */
export interface PredictionFactor {
  /** Which metric or indicator is contributing */
  metric: keyof IskraMetrics | keyof FractalIndicators | 'composite';
  /** Current value of this factor */
  currentValue: number;
  /** Historical average for comparison */
  historicalAverage?: number;
  /** Trend direction */
  trend: 'rising' | 'falling' | 'stable' | 'volatile';
  /** Rate of change per message */
  changeRate: number;
  /** How much this factor contributes to the prediction (0-1) */
  contribution: number;
  /** Explanation of why this matters */
  explanation: string;
}

/**
 * Preventive action that can be taken
 */
export interface PreventiveAction {
  /** Type of preventive action */
  type:
    | 'switch_voice'
    | 'reduce_temperature'
    | 'activate_protocol'
    | 'suggest_pause'
    | 'increase_empathy'
    | 'simplify_response'
    | 'invoke_repair'
    | 'call_council'
    | 'apply_ritual';
  /** How urgent is this action (0-1) */
  urgency: number;
  /** Why this action is recommended */
  rationale: string;
  /** Expected effect of taking this action */
  expectedEffect: string;
  /** Specific parameters for the action */
  parameters?: Record<string, unknown>;
  /** Estimated probability of success (0-1) */
  successProbability: number;
}

/**
 * Result of a prediction for a specific time horizon
 */
export interface PredictionResult {
  /** Predicted alert level */
  targetAlert: AlertLevel;
  /** Probability of this prediction (0-1) */
  probability: number;
  /** Confidence in the prediction (0-1) */
  confidence: number;
  /** Time horizon in messages */
  timeHorizon: number;
  /** Factors contributing to this prediction */
  contributingFactors: PredictionFactor[];
  /** Recommended preventive actions */
  preventiveActions: PreventiveAction[];
  /** When this prediction was made */
  timestamp: string;
  /** Whether this prediction has been validated */
  validated?: boolean;
  /** Actual outcome if validated */
  actualOutcome?: AlertLevel;
}

/**
 * Short-term vs medium-term predictions
 */
export interface PredictionBundle {
  /** Prediction for next 1-3 messages */
  shortTerm: PredictionResult;
  /** Prediction for next 5-10 messages */
  mediumTerm: PredictionResult;
  /** Optional long-term projection (session-level) */
  longTerm?: PredictionResult;
}

// =============================================================================
// PATTERN MATCHING TYPES
// =============================================================================

/**
 * A historical pattern that was matched
 */
export interface PatternMatch {
  /** Unique identifier for this pattern */
  patternId: string;
  /** Description of the pattern */
  description: string;
  /** Similarity score to current situation (0-1) */
  similarity: number;
  /** How the matched situation resolved */
  resolution: AlertLevel;
  /** What actions were taken */
  actionsTaken: string[];
  /** Whether the resolution was positive */
  positiveOutcome: boolean;
  /** How many times this pattern has been seen */
  occurrenceCount: number;
  /** Key features of this pattern */
  features: PatternFeature[];
}

/**
 * A feature that defines a pattern
 */
export interface PatternFeature {
  /** Name of the feature */
  name: string;
  /** Expected value or range */
  expected: number | { min: number; max: number };
  /** Current value */
  actual: number;
  /** How well this feature matches (0-1) */
  matchScore: number;
}

/**
 * Outcome distribution for matched patterns
 */
export interface OutcomeDistribution {
  /** Probability distribution across alert levels */
  distribution: Record<AlertLevel, number>;
  /** Most likely outcome */
  mostLikely: AlertLevel;
  /** Confidence in the distribution */
  confidence: number;
  /** Sample size (number of patterns considered) */
  sampleSize: number;
}

// =============================================================================
// CALIBRATION TYPES
// =============================================================================

/**
 * Calibration data for a specific user/context
 */
export interface CalibrationData {
  /** False positive rate (predicted high, actual low) */
  falsePositiveRate: number;
  /** Miss rate (predicted low, actual high) */
  missRate: number;
  /** Overall accuracy */
  accuracy: number;
  /** Personalized thresholds based on history */
  adjustedThresholds: EWSThresholds;
  /** Number of predictions used for calibration */
  predictionCount: number;
  /** When calibration was last updated */
  lastUpdated: string;
  /** Breakdown by alert level */
  byAlertLevel: Record<AlertLevel, {
    predicted: number;
    actual: number;
    correct: number;
  }>;
}

/**
 * User-specific sensitivity settings
 */
export interface SensitivityProfile {
  /** Overall sensitivity (0-2, 1 is default) */
  overall: number;
  /** Per-metric sensitivity adjustments */
  byMetric: Partial<Record<keyof IskraMetrics, number>>;
  /** Preferred intervention timing */
  interventionTiming: 'early' | 'balanced' | 'late';
  /** Whether to show predictions to user */
  showPredictionsToUser: boolean;
  /** Action urgency threshold for notification */
  notificationThreshold: number;
}

// =============================================================================
// PREDICTIVE EWS STATE
// =============================================================================

/**
 * Extended EWS state with predictive capabilities
 */
export interface PredictiveEWSState extends EWSState {
  /** Current predictions */
  predictions: PredictionBundle;
  /** Matched historical patterns */
  patternMatches: PatternMatch[];
  /** Outcome distribution from patterns */
  outcomeDistribution: OutcomeDistribution;
  /** Calibration data */
  calibration: CalibrationData;
  /** User sensitivity profile */
  sensitivity: SensitivityProfile;
  /** Prediction history for learning */
  predictionHistory: Array<{
    prediction: PredictionResult;
    actual: AlertLevel;
    timestamp: string;
  }>;
  /** Active preventive actions */
  activeActions: Array<{
    action: PreventiveAction;
    startedAt: string;
    expiresAt?: string;
    effectiveness?: number;
  }>;
}

// =============================================================================
// TREND ANALYSIS TYPES
// =============================================================================

/**
 * Trend analysis for a specific metric
 */
export interface MetricTrend {
  /** Metric being analyzed */
  metric: keyof IskraMetrics;
  /** Current value */
  current: number;
  /** Values over time window */
  history: number[];
  /** Trend direction */
  direction: 'rising' | 'falling' | 'stable';
  /** Slope of the trend line */
  slope: number;
  /** R-squared (fit quality) */
  rSquared: number;
  /** Predicted value at next step */
  predictedNext: number;
  /** Confidence interval */
  confidenceInterval: { low: number; high: number };
}

/**
 * Composite trend analysis across all metrics
 */
export interface CompositeTrendAnalysis {
  /** Individual metric trends */
  metricTrends: Record<keyof IskraMetrics, MetricTrend>;
  /** Overall system trajectory */
  systemTrajectory: 'improving' | 'stable' | 'degrading' | 'volatile';
  /** Risk score (0-1) */
  riskScore: number;
  /** Stability score (0-1) */
  stabilityScore: number;
  /** Time window analyzed (in messages) */
  windowSize: number;
}

// =============================================================================
// INTERVENTION TYPES
// =============================================================================

/**
 * Intervention recommendation with context
 */
export interface InterventionRecommendation {
  /** Primary recommended action */
  primary: PreventiveAction;
  /** Alternative actions */
  alternatives: PreventiveAction[];
  /** Why intervention is needed */
  reasoning: string;
  /** Expected improvement if action taken */
  expectedImprovement: {
    targetMetric: string;
    currentValue: number;
    expectedValue: number;
    confidence: number;
  };
  /** Timing recommendation */
  timing: {
    optimalWindow: 'immediate' | 'next_message' | 'within_3_messages';
    urgency: number;
    reason: string;
  };
}

/**
 * Intervention history entry
 */
export interface InterventionHistoryEntry {
  /** Unique identifier */
  id: string;
  /** When intervention was applied */
  timestamp: string;
  /** What action was taken */
  action: PreventiveAction;
  /** State before intervention */
  stateBefore: {
    alertLevel: AlertLevel;
    keyMetrics: Partial<IskraMetrics>;
  };
  /** State after intervention */
  stateAfter?: {
    alertLevel: AlertLevel;
    keyMetrics: Partial<IskraMetrics>;
    messagesUntilEffect: number;
  };
  /** Calculated effectiveness */
  effectiveness?: number;
}

// =============================================================================
// FACTORY FUNCTIONS
// =============================================================================

/**
 * Create default calibration data
 */
export function createDefaultCalibration(): CalibrationData {
  return {
    falsePositiveRate: 0,
    missRate: 0,
    accuracy: 0.5,
    adjustedThresholds: {
      watch: { D_chaos: 1.4, drift: 0.2 },
      warning: { D_chaos: 1.6, drift: 0.3, trust: 0.3 },
      critical: { D_chaos: 1.8, drift: 0.4, alive_index: 0.3 },
    },
    predictionCount: 0,
    lastUpdated: new Date().toISOString(),
    byAlertLevel: {
      normal: { predicted: 0, actual: 0, correct: 0 },
      watch: { predicted: 0, actual: 0, correct: 0 },
      warning: { predicted: 0, actual: 0, correct: 0 },
      critical: { predicted: 0, actual: 0, correct: 0 },
      lockdown: { predicted: 0, actual: 0, correct: 0 },
    },
  };
}

/**
 * Create default sensitivity profile
 */
export function createDefaultSensitivity(): SensitivityProfile {
  return {
    overall: 1.0,
    byMetric: {},
    interventionTiming: 'balanced',
    showPredictionsToUser: false,
    notificationThreshold: 0.7,
  };
}

/**
 * Create an empty prediction result
 */
export function createEmptyPrediction(timeHorizon: number): PredictionResult {
  return {
    targetAlert: 'normal',
    probability: 0.5,
    confidence: 0,
    timeHorizon,
    contributingFactors: [],
    preventiveActions: [],
    timestamp: new Date().toISOString(),
  };
}

/**
 * Create a preventive action
 */
export function createPreventiveAction(
  type: PreventiveAction['type'],
  options: Partial<Omit<PreventiveAction, 'type'>> = {}
): PreventiveAction {
  const action: PreventiveAction = {
    type,
    urgency: options.urgency ?? 0.5,
    rationale: options.rationale ?? `Apply ${type} to stabilize system`,
    expectedEffect: options.expectedEffect ?? 'Reduce alert probability',
    successProbability: options.successProbability ?? 0.7,
  };
  if (options.parameters !== undefined) {
    action.parameters = options.parameters;
  }
  return action;
}

/**
 * Calculate prediction confidence based on factors
 */
export function calculatePredictionConfidence(factors: PredictionFactor[]): number {
  if (factors.length === 0) return 0;

  const totalContribution = factors.reduce((sum, f) => sum + f.contribution, 0);
  const avgContribution = totalContribution / factors.length;

  // Higher confidence when factors agree
  const trendAgreement = factors.filter(f => f.trend !== 'volatile').length / factors.length;

  return Math.min(avgContribution * 0.6 + trendAgreement * 0.4, 1);
}

/**
 * Calculate action urgency based on prediction
 */
export function calculateActionUrgency(
  prediction: PredictionResult,
  currentLevel: AlertLevel
): number {
  const levelSeverity: Record<AlertLevel, number> = {
    normal: 0,
    watch: 0.25,
    warning: 0.5,
    critical: 0.75,
    lockdown: 1,
  };

  const currentSeverity = levelSeverity[currentLevel];
  const predictedSeverity = levelSeverity[prediction.targetAlert];

  // Urgency increases with:
  // 1. Higher predicted severity
  // 2. Large jump from current level
  // 3. Short time horizon
  // 4. High confidence

  const severityJump = Math.max(0, predictedSeverity - currentSeverity);
  const timeUrgency = 1 / (prediction.timeHorizon + 1);

  return Math.min(
    severityJump * 0.4 +
      predictedSeverity * 0.3 +
      timeUrgency * 0.15 +
      prediction.confidence * 0.15,
    1
  );
}

/**
 * Check if intervention is recommended
 */
export function shouldIntervene(
  prediction: PredictionResult,
  sensitivity: SensitivityProfile
): boolean {
  const adjustedProbability = prediction.probability * sensitivity.overall;
  const adjustedConfidence = prediction.confidence;

  const thresholds = {
    early: { probability: 0.5, confidence: 0.4 },
    balanced: { probability: 0.65, confidence: 0.5 },
    late: { probability: 0.8, confidence: 0.6 },
  };

  const threshold = thresholds[sensitivity.interventionTiming];

  return (
    adjustedProbability >= threshold.probability &&
    adjustedConfidence >= threshold.confidence &&
    prediction.targetAlert !== 'normal'
  );
}

/**
 * Select best preventive action from list
 */
export function selectBestAction(
  actions: PreventiveAction[],
  urgency: number
): PreventiveAction | null {
  if (actions.length === 0) return null;

  // Sort by combined score of urgency match and success probability
  const scored = actions.map(a => ({
    action: a,
    score: a.successProbability * 0.6 + (1 - Math.abs(a.urgency - urgency)) * 0.4,
  }));

  scored.sort((a, b) => b.score - a.score);

  return scored[0]?.action ?? null;
}
