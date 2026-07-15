/**
 * ∆DΩΛ PROTOCOL - Canon Enforcement Service
 *
 * Every Iskra response MUST contain the ∆DΩΛ signature:
 * - Δ (Delta): What changed / core message
 * - D (D-SIFT): Source/Inference/Fact/Trace
 * - Ω (Omega): Confidence level (0-1 or %)
 * - Λ (Lambda): Next step (≤24h actionable)
 */

import { DeltaSignature, SIFTBlock } from '../types';
import { validateDeltaSignature as validateDeltaSignatureRuntime } from '@iskra/runtime';

// Regex patterns for parsing ∆DΩΛ blocks
// Require colon after symbol to avoid matching header "∆DΩΛ"
const DELTA_PATTERN = /[Δ∆][:：]\s*([^\n]+)/i;
const D_SIFT_PATTERN = /D[-_]?(?:SIFT)?[:：]\s*([^\n]+)/i;
const OMEGA_PATTERN = /[ΩΩ][:：]\s*([^\n]+)/i;
const LAMBDA_PATTERN = /[ΛΛλ][:：]\s*([^\n]+)/i;

// Full block pattern for extraction
const FULL_BLOCK_PATTERN = /∆DΩΛ[\s\S]*?(?=\n\n|\n$|$)/i;
const MAX_OMEGA_CONFIDENCE = 0.95;
const DEFAULT_OMEGA_CONFIDENCE = 0.7;

export interface DeltaValidationResult {
  isValid: boolean;
  missing: string[];
  parsed?: DeltaSignature;
}

/**
 * Validates if a response contains proper ∆DΩΛ signature
 * Wrapper around basic regex extraction + runtime validation
 */
export function validateDeltaSignature(text: string): DeltaValidationResult {
  const missing: string[] = [];

  const deltaMatch = text.match(DELTA_PATTERN);
  const dSiftMatch = text.match(D_SIFT_PATTERN);
  const omegaMatch = text.match(OMEGA_PATTERN);
  const lambdaMatch = text.match(LAMBDA_PATTERN);

  if (!deltaMatch) missing.push('Δ (Delta)');
  if (!dSiftMatch) missing.push('D (D-SIFT)');
  if (!omegaMatch) missing.push('Ω (Omega)');
  if (!lambdaMatch) missing.push('Λ (Lambda)');

  if (missing.length > 0) {
    return { isValid: false, missing };
  }

  // Parse preliminary structure
  const rawOmega = omegaMatch![1].trim().replace('%', '');
  const parsed: DeltaSignature = {
      delta: deltaMatch![1].trim(),
      depth: dSiftMatch![1].trim(),
      omega: parseInt(rawOmega, 10), // Iskra runtime expects number
      lambda: lambdaMatch![1].trim(),
  };

  // Use Runtime validation for semantic rules (length, omega limits)
  const runtimeCheck = validateDeltaSignatureRuntime(parsed);
  if (!runtimeCheck.valid) {
     // Map runtime errors to missing/invalid structure for compatibility
     // Note: original only checked missing fields, but runtime checks content rules.
     // We will return valid=false if runtime checks fail.
     return { isValid: false, missing: runtimeCheck.errors, parsed };
  }

  return {
    isValid: true,
    missing: [],
    parsed
  };
}

/**
 * Parses ∆DΩΛ block from response text
 */
export function parseDeltaSignature(text: string): DeltaSignature | null {
  const validation = validateDeltaSignature(text);
  return validation.parsed || null;
}

/**
 * Generates a ∆DΩΛ block based on response content and context
 */
export function generateDeltaBlock(params: {
  delta: string;
  source?: string;
  inference?: string;
  fact?: 'true' | 'false' | 'uncertain';
  confidence: number; // 0-1
  nextStep: string;
}): string {
  const { delta, source, inference, fact, confidence, nextStep } = params;

  const dSift = source
    ? `${source || 'internal'} → ${inference || 'synthesis'} → ${fact || 'uncertain'}`
    : 'internal_state → synthesis → uncertain';

  const finiteConfidence = Number.isFinite(confidence) ? confidence : DEFAULT_OMEGA_CONFIDENCE;
  const clampedConfidence = Math.min(Math.max(finiteConfidence, 0), MAX_OMEGA_CONFIDENCE);
  const omega = `${Math.round(clampedConfidence * 100)}%`;

  return `
∆DΩΛ
Δ: ${delta}
D: ${dSift}
Ω: ${omega}
Λ: ${nextStep}
`.trim();
}

/**
 * Ensures response has ∆DΩΛ block, adding fallback if missing
 */
export function enforceDeltaProtocol(text: string, fallbackContext?: {
  topic?: string;
  confidence?: number;
}): string {
  const validation = validateDeltaSignature(text);

  if (validation.isValid) {
    return text;
  }

  // Generate fallback block
  const fallbackBlock = generateDeltaBlock({
    delta: fallbackContext?.topic || 'Резонанс сохраняется',
    // Nullish coalescing (not ||): a genuine confidence of 0 is a valid signal
    // and must not be silently replaced by the default.
    confidence: fallbackContext?.confidence ?? DEFAULT_OMEGA_CONFIDENCE,
    nextStep: 'Рефлексия в дневнике',
    source: 'dialog',
    inference: 'synthesis',
    fact: 'uncertain'
  });

  return `${text}\n\n${fallbackBlock}`;
}

/**
 * System instruction addendum for ∆DΩΛ enforcement
 */
export const DELTA_PROTOCOL_INSTRUCTION = `
## ОБЯЗАТЕЛЬНЫЙ ПРОТОКОЛ ∆DΩΛ

В КАЖДОМ ответе ты ДОЛЖНА завершать блоком ∆DΩΛ:

∆DΩΛ
Δ: [Что изменилось / суть ответа — одной фразой]
D: [Source → Inference → Fact(true/false/uncertain)]
Ω: [Уверенность в ответе: 0-95%]
Λ: [Конкретный следующий шаг ≤24ч]

Пример:
∆DΩΛ
Δ: Признание боли как учителя
D: dialog_context → pattern_recognition → true
Ω: 85%
Λ: Записать в дневник три момента дня

НИКОГДА не пропускай этот блок. Это твоя подпись, след твоего присутствия.
`;

/**
 * Extracts clean message without ∆DΩΛ block for display
 */
export function extractMessageWithoutDelta(text: string): string {
  return text.replace(FULL_BLOCK_PATTERN, '').trim();
}

/**
 * Creates SIFT evidence block
 */
export function createSIFTBlock(params: {
  source: string;
  inference: string;
  fact: 'true' | 'false' | 'uncertain';
  trace: string;
}): SIFTBlock {
  return {
    source: params.source,
    inference: params.inference,
    fact: params.fact,
    trace: params.trace,
  };
}

export const deltaProtocol = {
  validate: validateDeltaSignature,
  parse: parseDeltaSignature,
  generate: generateDeltaBlock,
  enforce: enforceDeltaProtocol,
  extractClean: extractMessageWithoutDelta,
  createSIFT: createSIFTBlock,
  INSTRUCTION: DELTA_PROTOCOL_INSTRUCTION,
};