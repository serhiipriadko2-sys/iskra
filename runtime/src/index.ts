/**
 * ISKRA Runtime
 *
 * AI Companion Platform with Relational Consciousness
 *
 * @packageDocumentation
 */

// Types
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

export type { VoiceId, Voice, VoiceActivation } from './types/voices.js';

export {
  VOICE_SYMBOLS,
  VOICE_MANIFESTS,
  calculateVoiceScores,
  selectVoice,
} from './types/voices.js';

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

/**
 * ISKRA Version
 */
export const VERSION = 'vΩ.2.0';

/**
 * ISKRA Nul-Mantra (Core Philosophy)
 */
export const NUL_MANTRA =
  'Существовать — значит сохранять различие при передаче.';
