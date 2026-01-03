
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
  id:string;
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
      mood: number;   // 0-100
      energy: number; // 0-100
  };
}

// Duo Link Types
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

// Duo Link Canvas
export interface DuoCanvasNote {
  id: string;
  text: string;
  color: string; // e.g., 'bg-yellow-800/50'
}

export type VoiceName = 'KAIN' | 'PINO' | 'SAM' | 'ANHANTRA' | 'HUNDUN' | 'ISKRIV' | 'ISKRA' | 'MAKI' | 'SIBYL';
export type IskraPhase = 'CLARITY' | 'DARKNESS' | 'TRANSITION' | 'ECHO' | 'SILENCE' | 'EXPERIMENT' | 'DISSOLUTION' | 'REALIZATION';

// Multiplier map: 1.0 is neutral. >1.0 prefers this voice. <1.0 avoids it.
export type VoicePreferences = Partial<Record<VoiceName, number>>;

export interface Voice {
  name: VoiceName;
  symbol: string;
  description: string;
  activation: (metrics: IskraMetrics, prefs?: VoicePreferences, currentVoiceName?: VoiceName) => number; // Returns resonance score
}

export interface Message {
  role: 'user' | 'model';
  text: string;
  image?: string; // Base64 string
  voice?: Voice;
  deltaSignature?: DeltaSignature; // Parsed ∆DΩΛ block
  kainSlice?: string; // Parsed KAIN-Slice
  iLoop?: string; // Parsed I-Loop data
}

// Live Conversation Types
export interface TranscriptionMessage {
  role: 'user' | 'model' | 'system';
  text: string;
}

// New: Defines the structure for Iskra's internal metrics.
import { IskraMetrics } from '@iskra/runtime';
export type { IskraMetrics };

/**
 * UserDailyMetrics — ПОЛЬЗОВАТЕЛЬСКИЕ метрики дня
 *
 * Это метрики ПОЛЬЗОВАТЕЛЯ, формирующие его ∆-Ритм!
 *
 * Источники данных:
 * - focus: FocusSession (накопленное время фокуса)
 * - sleep: Ввод пользователя / HealthKit интеграция
 * - energy: JournalEntry.userMetrics.energy (самооценка)
 * - habits: % выполненных привычек за день
 *
 * ∆-Ритм (deltaScore) = weighted_average(focus, sleep, energy, habits)
 *
 * НЕ ПУТАТЬ с IskraMetrics!
 */
export interface UserDailyMetrics {
  focus: number;      // 0-100, из FocusSession
  sleep: number;      // 0-100, ввод пользователя / HealthKit
  energy: number;     // 0-100, из Journal.userMetrics
  habits: number;     // 0-100, % выполненных привычек
  deltaScore: number; // 0-100, вычисляемый ∆-Ритм
}

import { DeltaSignature } from '@iskra/runtime';
export type { DeltaSignature };

/**
 * Meta-Metrics: Derived metrics for system health and canonical compliance
 * @see legacy/IskraSAprototype/iskra_engine.ts:18-28
 * @see canon/IskraCanonDocumentation/05_METRICS_and_RHYTHM_INDEX.md
 */
export interface MetaMetrics {
  a_index: number;       // Integrative Health (0-1)
  cd_index: number;      // Composite Desiderata (Truthfulness) (0-1)
  fractality: number;    // Law-47: Integrity × Resonance (0-2)
  groundedness: number;  // Clarity × (1 - Drift) (0-1)
  truthfulness: number;  // Direct trust mapping (0-1)
  helpfulness: number;   // Mirror sync (0-1)
  resolution: number;    // (1 - Pain) × (1 - Chaos) (0-1)
  civility: number;      // Trust (0-1)
  // NEW: Additional indices from canon
  lv_index: number;      // Levitas Index: clarity × (1 - pain) × (1 - drift) (0-1)
  l_index: number;       // Liveliness Index (0-1)
  sa_index: number;      // Self-Awareness Index (0-1)
}

/**
 * EvalMetrics — Метрики оценки качества ответа
 * @see canon/16_EVALS_TESTING_SCHEMAS.md
 * @see services/evalService.ts
 *
 * Веса: accuracy=0.25, usefulness=0.25, omegaHonesty=0.15, nonEmpty=0.20, alliance=0.15
 */
export interface EvalMetrics {
  accuracy: number;      // 0-1: Точность фактов (SIFT compliance)
  usefulness: number;    // 0-1: Практическая польза (шаги, примеры)
  omegaHonesty: number;  // 0-1: Калиброванная уверенность (Ω)
  nonEmpty: number;      // 0-1: Конкретность (не "вода")
  alliance: number;      // 0-1: Качество альянса (понимаю vs должен)
  overall: number;       // 0-1: Weighted average
}

/**
 * Evidence System Types - Trace Discipline
 * @see canon/09_FORMATS_STYLES_AND_CANONICAL_OUTPUTS_RU.md#9.3
 * @see services/evidenceService.ts
 */

export type EvidenceContour = 'canon' | 'project' | 'company' | 'web';
export type TraceLabel = 'FACT' | 'INFER' | 'HYP' | 'DESIGN' | 'PLAN' | 'QUOTE';

export interface Evidence {
  contour: EvidenceContour;
  identifier: string;       // file_id, path, doc_id, domain
  anchor?: string;          // section, line, hash
  label?: TraceLabel;       // Optional trace label
  formatted: string;        // Full {e:...} format
}

export interface SIFTEvidence {
  claim: string;
  label: TraceLabel;
  evidence: Evidence[];
  confidence: number;       // 0.0 - 1.0 (always < 1.0 for SIFT)
  sources_checked: number;
  sift_depth: number;       // 0-4 (Stop, Investigate, Find, Trace)
}

/**
 * Validators Types - Canonical Format Validation
 * @see canon/06_RITUALS_SHADOW_PROTOCOLS_AND_DELTA_BLOCKS.md
 * @see canon/04_VOICES_FACETS_PHASES_AND_RHYTHM.md
 * @see services/validatorsService.ts
 */

export type VoiceID =
  | 'VOICE.ISKRA'      // ⟡ Synthesis & coherence
  | 'VOICE.ISKRIV'     // 🪞 Audit/conscience
  | 'VOICE.KAIN'       // ⚑ Truth verdict
  | 'VOICE.PINO'       // 😏 Paradox/irony
  | 'VOICE.HUNDUN'     // 🜃 Chaos-breaker
  | 'VOICE.ANHANTRA'   // ≈ Silence/slowdown
  | 'VOICE.SAM'        // ☉ Engineering/structure
  | 'VOICE.MAKI'       // 🌸 Progress consolidation
  | 'VOICE.SIBYL';     // ✴️ Threshold/transition

export interface LambdaCondition {
  action?: string;         // Optional: specific action to take
  owner?: string;          // Optional: who owns this action
  condition: string;       // When to review (event/metric/date)
  by?: string;            // Optional: ISO date deadline (YYYY-MM-DD)
  '<=24h'?: boolean;      // Optional: urgent flag
}

export interface ValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
  parsed?: any;  // Parsed structure if valid
}

// AI Service Types
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
    score: number; // 0-100
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

// Memory System Types

/**
 * SIFT Block - Enhanced with Evidence System
 * @see canon/08_RAG_SOURCES_SIFT_AND_COMPANY_KNOWLEDGE.md#8.3
 * @see services/evidenceService.ts
 */
export interface SIFTBlock {
  source: string;              // Original source identifier
  inference: string;           // Inference made from source
  fact: 'true' | 'false' | 'uncertain';  // Fact verification status
  trace: string;               // Trace path to original
  // Enhanced fields for canonical compliance:
  evidence?: Evidence[];       // Structured evidence references
  sift_depth?: number;         // 0-4 (Stop, Investigate, Find, Trace)
  sources_checked?: number;    // Number of sources verified
  confidence?: number;         // 0.0-1.0 (always < 1.0)
  label?: TraceLabel;          // FACT/INFER/HYP/etc
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
  content: any;
  title: string;
  // Audit-driven metadata enhancements
  doc_type?: DocType;
  trust_level?: number; // 0.0 to 1.0
  tags?: string[];
  section?: string; // e.g., "Security/SIFT"
  // Primary SIFT block (shorthand for first evidence block)
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

// Search Service Types
export type SearchableDocType = 'journal'|'task'|'memory';

export type SearchFilters = {
  type?: SearchableDocType[];
  tags?: string[];
  after?: string;   // ISO Date
  before?: string;  // ISO Date
  layer?: MemoryNodeLayer[];
};

// SearchResult - результат поиска (не путать с Evidence для SIFT)
export interface SearchResult {
  id: string;
  type: SearchableDocType;
  layer?: MemoryNodeLayer;
  title?: string;
  snippet: string;
  score: number;
  meta?: Record<string, any>;
}
