/**
 * ISKRA Space Types
 *
 * Re-exports core types from @iskra/runtime
 * Defines app-specific types
 */

// =============================================================================
// RE-EXPORTS FROM @iskra/runtime (Core Types)
// =============================================================================
export type {
  IskraMetrics,
  EvalMetrics as CoreEvalMetrics,
  ComputedIndices,
} from '@iskra/runtime';

export {
  DEFAULT_METRICS,
  calculateIntegrityScore,
  calculateAliveIndex,
} from '@iskra/runtime';

export type {
  VoiceName,
  VoiceId, // deprecated alias
  VoiceActivation,
  VoicePreferences,
} from '@iskra/runtime';

export {
  VOICE_SYMBOLS,
  VOICE_MANIFESTS,
  calculateVoiceScores,
  selectVoice,
} from '@iskra/runtime';

export type { IskraPhase } from '@iskra/runtime';

export type {
  DeltaSignature,
  PlaybookId,
  PlaybookConfig,
  ShadowEntry,
  CyclePhase,
  CycleEntry,
  ResponsePhase,
} from '@iskra/runtime';

export {
  PLAYBOOKS,
  validateDeltaSignature,
  formatDeltaSignature,
} from '@iskra/runtime';

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
} from '@iskra/runtime';

export {
  ALERT_COLORS,
  ALERT_SYMBOLS,
  DEFAULT_EWS_CONFIG,
  determineAlertLevel,
  decidePlaybookSwitch,
  adjustVoiceWeightsForAlert,
  adjustTemperatureForAlert,
  ALERT_NOTIFICATIONS,
} from '@iskra/runtime';

export type {
  FractalIndicators,
  QuantumIndicators,
  SystemPhase,
} from '@iskra/runtime';

export {
  D_THRESHOLDS,
  H_THRESHOLDS,
  QUANTUM_THRESHOLDS,
  classifyPhase,
  calculateEdgeDistance,
  calculateFractalIndicators,
  calculateQuantumIndicators,
} from '@iskra/runtime';

// Import types for use in local interfaces
import type { IskraMetrics, VoiceName, VoicePreferences, DeltaSignature, Voice as CanonVoice } from '@iskra/runtime';

// =============================================================================
// APP-SPECIFIC TYPES (iskraSpace only)
// =============================================================================

// --- Ritual & Task Management ---
export type RitualTag = 'FIRE' | 'WATER' | 'SUN' | 'BALANCE' | 'DELTA';

export interface Task {
  id: string;
  title: string;
  ritualTag: RitualTag;
  done: boolean;
  date?: string; // ISO Date string YYYY-MM-DD
  priority?: 'low' | 'medium' | 'high';
  duration?: number; // minutes
}

export interface Habit {
  id: string;
  title: string;
  streak: number;
  completedToday: boolean;
  ritualTag: RitualTag;
}

export interface JournalEntry {
  id: string;
  timestamp: string;
  text: string;
  prompt: {
    question: string;
    why: string;
  };
  analysis?: {
    reflection: string;
    mood: string;
    signature: string; // e.g. "Iskra" or "Kain"
  };
  userMetrics?: {
    mood: number; // 0-100
    energy: number; // 0-100
  };
}

// --- Duo Link Types ---
export type ShareLevel = 'hidden' | 'daily_score' | 'weekly_mean';

export interface DuoSharePrefs {
  sleep: ShareLevel;
  focus: ShareLevel;
  habits: ShareLevel;
}

export interface DuoMessage {
  id: string;
  sender: 'me' | 'partner';
  text: string;
  timestamp: string;
}

export interface DuoCanvasNote {
  id: string;
  text: string;
  color: string; // e.g., 'bg-yellow-800/50'
}

// --- Voice Extension (App-specific) ---
/**
 * Extended Voice type for iskraSpace with activation function.
 *
 * We extend the canonical Voice type from @iskra/runtime by adding a required
 * activation function. This avoids redefining the canonical fields and keeps
 * the canonical Voice schema as the single source of truth. The activation
 * function is used by the frontend to calculate resonance scores for each voice.
 */
export type Voice = CanonVoice & {
  activation: (
    metrics: IskraMetrics,
    prefs?: VoicePreferences,
    currentVoiceName?: VoiceName
  ) => number;
};

// --- Message Types ---
export interface Message {
  role: 'user' | 'model';
  text: string;
  image?: string; // Base64 string
  voice?: Voice;
  deltaSignature?: DeltaSignature; // Parsed ∆DΩΛ block
  kainSlice?: string; // Parsed KAIN-Slice
  iLoop?: string; // Parsed I-Loop data
}

export interface TranscriptionMessage {
  role: 'user' | 'model' | 'system';
  text: string;
}

// --- User Daily Metrics ---
/**
 * UserDailyMetrics — ПОЛЬЗОВАТЕЛЬСКИЕ метрики дня
 *
 * Это метрики ПОЛЬЗОВАТЕЛЯ, формирующие его ∆-Ритм!
 * НЕ ПУТАТЬ с IskraMetrics!
 */
export interface UserDailyMetrics {
  focus: number; // 0-100, из FocusSession
  sleep: number; // 0-100, ввод пользователя / HealthKit
  energy: number; // 0-100, из Journal.userMetrics
  habits: number; // 0-100, % выполненных привычек
  deltaScore: number; // 0-100, вычисляемый ∆-Ритм
}

// Note: DeltaSignature is already exported from '@iskra/runtime' at line 44

// --- Meta Metrics ---
export interface MetaMetrics {
  a_index: number; // Integrative Health (0-1)
  cd_index: number; // Composite Desiderata (Truthfulness) (0-1)
  fractality: number; // Law-47: Integrity × Resonance (0-2)
  groundedness: number; // Clarity × (1 - Drift) (0-1)
  truthfulness: number; // Direct trust mapping (0-1)
  helpfulness: number; // Mirror sync (0-1)
  resolution: number; // (1 - Pain) × (1 - Chaos) (0-1)
  civility: number; // Trust (0-1)
  lv_index: number; // Levitas Index (0-1)
  l_index: number; // Liveliness Index (0-1)
  sa_index: number; // Self-Awareness Index (0-1)
}

// --- Extended EvalMetrics (with overall) ---
export interface EvalMetrics {
  accuracy: number; // 0-1: Точность фактов (SIFT compliance)
  usefulness: number; // 0-1: Практическая польза
  omegaHonesty: number; // 0-1: Калиброванная уверенность (Ω)
  nonEmpty: number; // 0-1: Конкретность (не "вода")
  alliance: number; // 0-1: Качество альянса
  overall: number; // 0-1: Weighted average
}

// --- Evidence System ---
export type EvidenceContour = 'canon' | 'project' | 'company' | 'web';
export type TraceLabel = 'FACT' | 'INFER' | 'HYP' | 'DESIGN' | 'PLAN' | 'QUOTE';

export interface Evidence {
  contour: EvidenceContour;
  identifier: string;
  anchor?: string;
  label?: TraceLabel;
  formatted: string;
}

export interface SIFTEvidence {
  claim: string;
  label: TraceLabel;
  evidence: Evidence[];
  confidence: number;
  sources_checked: number;
  sift_depth: number;
}

// --- Validator Types ---
export type VoiceID =
  | 'VOICE.ISKRA'
  | 'VOICE.ISKRIV'
  | 'VOICE.KAIN'
  | 'VOICE.PINO'
  | 'VOICE.HUNDUN'
  | 'VOICE.ANHANTRA'
  | 'VOICE.SAM'
  | 'VOICE.MAKI'
  | 'VOICE.SIBYL';

export interface LambdaCondition {
  action?: string;
  owner?: string;
  condition: string;
  by?: string;
  '<=24h'?: boolean;
}

export interface ValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
  parsed?: unknown;
}

// --- AI Service Types ---
export interface DailyAdvice {
  deltaScore: number;
  sleep: number;
  focus: number;
  habits: number;
  energy: number;
  insight: string;
  why: string;
  microStep: string;
  checks: string[];
}

export interface PlanTop3 {
  tasks: Array<{
    title: string;
    ritualTag: RitualTag;
  }>;
}

export interface JournalPrompt {
  question: string;
  why: string;
}

export interface ConversationAnalysis {
  summary: string;
  keyPoints: string[];
  mainThemes: string[];
  brainstormIdeas: string[];
  connectionQuality: {
    score: number;
    assessment: string;
  };
  unspokenQuestions: string[];
}

export interface DeepResearchReport {
  title: string;
  synthesis: string;
  keyPatterns: string[];
  tensionPoints: string[];
  unseenConnections: string[];
  reflectionQuestion: string;
}

// --- Memory System ---
export interface SIFTBlock {
  source: string;
  inference: string;
  fact: 'true' | 'false' | 'uncertain';
  trace: string;
  evidence?: Evidence[];
  sift_depth?: number;
  sources_checked?: number;
  confidence?: number;
  label?: TraceLabel;
}

export interface MemoryNodeMetrics {
  trust: number;
  clarity: number;
  pain: number;
  drift: number;
  chaos: number;
}

export type MemoryNodeType = 'event' | 'feedback' | 'decision' | 'insight' | 'artifact';
export type MemoryNodeLayer = 'mantra' | 'archive' | 'shadow';
export type DocType = 'canon' | 'draft' | 'code' | 'log' | 'personal';

export interface MemoryNode {
  id: string;
  type: MemoryNodeType;
  layer: MemoryNodeLayer;
  timestamp: string;
  metrics?: MemoryNodeMetrics;
  facet?: VoiceName;
  evidence: SIFTBlock[];
  content: unknown;
  title: string;
  doc_type?: DocType;
  trust_level?: number;
  tags?: string[];
  section?: string;
  sift?: SIFTBlock;
}

export interface MantraNode {
  id: string;
  layer: 'mantra';
  text: string;
  version: string;
  isActive: boolean;
  timestamp: string;
}

export interface IntegrityReport {
  timestamp: string;
  status: 'HEALTHY' | 'DEGRADED' | 'CORRUPT';
  counts: {
    mantra: number;
    archive: number;
    shadow: number;
  };
  issues: string[];
  repairs: string[];
}

export interface DeltaReportData {
  delta: string;
  depth: string;
  omega: string;
  lambda: string;
}

// --- Search Service ---
export type SearchableDocType = 'journal' | 'task' | 'memory';

export type SearchFilters = {
  type?: SearchableDocType[];
  tags?: string[];
  after?: string;
  before?: string;
  layer?: MemoryNodeLayer[];
};

export interface SearchResult {
  id: string;
  type: SearchableDocType;
  layer?: MemoryNodeLayer;
  title?: string;
  snippet: string;
  score: number;
  meta?: Record<string, unknown>;
}
