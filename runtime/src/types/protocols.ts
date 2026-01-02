/**
 * ISKRA Protocol Types
 * Based on Canon: core/telos.md, system/architecture.md
 *
 * Протоколы и структуры данных
 */

/**
 * ∆DΩΛ Protocol Signature
 * Каждый ответ ДОЛЖЕН содержать этот блок
 */
export interface DeltaSignature {
  /** Δ (Delta): Что изменилось / core insight */
  delta: string;

  /** D (Depth): Source → Inference → Fact (SIFT trace) */
  depth: string;

  /** Ω (Omega): Уверенность 0-100% (NEVER > 95% for SIFT) */
  omega: number;

  /** Λ (Lambda): Следующий шаг ≤24h (actionable) */
  lambda: string;
}

/**
 * Playbook types
 */
export type PlaybookId = 'routine' | 'sift' | 'shadow' | 'council' | 'crisis';

/**
 * Playbook configuration
 */
export interface PlaybookConfig {
  id: PlaybookId;
  name: string;
  temperature: number;
  voices: string[];
  protocols: string[];
  maxTokens: number;
}

/**
 * Playbook configurations from system/playbooks.md
 */
export const PLAYBOOKS: Record<PlaybookId, PlaybookConfig> = {
  routine: {
    id: 'routine',
    name: 'ROUTINE',
    temperature: 0.7,
    voices: ['iskra', 'pino'],
    protocols: ['delta'],
    maxTokens: 2048,
  },
  sift: {
    id: 'sift',
    name: 'SIFT',
    temperature: 0.3,
    voices: ['sam', 'iskriv'],
    protocols: ['sift', 'delta'],
    maxTokens: 4096,
  },
  shadow: {
    id: 'shadow',
    name: 'SHADOW',
    temperature: 0.8,
    voices: ['anhantra', 'kain'],
    protocols: ['stop_repair', 'delta'],
    maxTokens: 1024,
  },
  council: {
    id: 'council',
    name: 'COUNCIL',
    temperature: 0.6,
    voices: [
      'iskra',
      'kain',
      'pino',
      'sam',
      'anhantra',
      'huyndun',
      'iskriv',
      'maki',
      'sibyl',
    ],
    protocols: ['full_council', 'delta'],
    maxTokens: 4096,
  },
  crisis: {
    id: 'crisis',
    name: 'CRISIS',
    temperature: 0.5,
    voices: ['kain', 'anhantra', 'sam', 'maki'],
    protocols: ['crisis', 'delta'],
    maxTokens: 512,
  },
};

/**
 * SIFT Protocol for verification
 * Stop → Investigate → Find → Trace
 */
export interface SiftResult {
  /** S: Source identification */
  source: string;

  /** I: Information extracted */
  information: string;

  /** F: Find evidence/alternatives */
  evidence: string[];

  /** T: Trace to primary source */
  trace: string;

  /** Is this verified or hypothesis? */
  verified: boolean;
}

/**
 * Shadow Entry for ledger memory
 */
export interface ShadowEntry {
  id: string;
  timestamp: string;

  /** Δ: что изменилось */
  delta: string;

  /** D: действие / шаг */
  action: string;

  /** Ω: уверенность (0-1) */
  omega: number;

  /** Λ: когда пересмотреть */
  lambda: string;

  /** Откуда импульс */
  origin: 'liber' | 'shadow' | 'user';
}

/**
 * Cycle phases from system/cycle_engine.md
 */
export type CyclePhase = 'liber' | 'shadow' | 'ledger' | 'reset' | 'commit';

/**
 * Cycle entry for tracking
 */
export interface CycleEntry {
  id: string;
  start: string;
  end?: string;
  phase: CyclePhase;

  /** Ключевое изменение */
  delta: string;

  /** Metrics at cycle end */
  metrics?: {
    clarity: number;
    drift: number;
    trust: number;
    pulse: number;
    trace: number;
  };

  /** Computed alive index */
  aliveIndex?: number;

  /** Next planned telos */
  next?: string;
}

/**
 * Response phases from system/architecture.md
 */
export type ResponsePhase =
  | 'darkness' // 🜃 коротко, присутствие, 1 вопрос
  | 'clarity' // ☉ структура, выбор, шаг
  | 'echo' // 🔮 возврат фразы со сдвигом
  | 'silence' // ≈ "я здесь" + 1 вопрос
  | 'transition' // 🜁 собрать противоречия
  | 'repair' // ⚑ признать промах, пересобрать
  | 'integration' // 🌸 commit в привычку
  | 'synthesis'; // ⟡ соединить голоса

/**
 * Validate delta signature
 */
export function validateDeltaSignature(
  signature: DeltaSignature
): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!signature.delta || signature.delta.length < 5) {
    errors.push('Delta (∆) must be at least 5 characters');
  }

  if (!signature.depth || signature.depth.length < 5) {
    errors.push('Depth (D) must be at least 5 characters');
  }

  if (signature.omega < 0 || signature.omega > 100) {
    errors.push('Omega (Ω) must be between 0 and 100');
  }

  if (signature.omega > 95) {
    errors.push('Omega (Ω) should not exceed 95% for epistemic humility');
  }

  if (!signature.lambda || signature.lambda.length < 5) {
    errors.push('Lambda (Λ) must be at least 5 characters');
  }

  return { valid: errors.length === 0, errors };
}

/**
 * Format delta signature for output
 */
export function formatDeltaSignature(signature: DeltaSignature): string {
  return `∆DΩΛ
∆: ${signature.delta}
D: ${signature.depth}
Ω: ${signature.omega}%
Λ: ${signature.lambda}`;
}
