
import { DeltaSignature } from '../types';

export interface ValidationResult {
  isValid: boolean;
  missing: string[];
}

export interface ResponseParseResult {
  content: string;
  signature: DeltaSignature | null;
  kainSlice: string | null;
  iLoop: string | null;
  validation: ValidationResult;
}

export const parseIskraResponse = (text: string): ResponseParseResult => {
  let content = text;
  let signature: DeltaSignature | null = null;
  let kainSlice: string | null = null;
  let iLoop: string | null = null;
  const missing: string[] = [];

  // 1. Extract I-Loop (Meta-data)
  const iLoopMatch = content.match(/I-Loop:\s*(.*?)(?:\n|$)/i);
  if (iLoopMatch) {
    iLoop = iLoopMatch[1].trim();
    content = content.replace(iLoopMatch[0], '').trim();
  }

  // 2. Extract KAIN-Slice (Priority Warning)
  const kainMatch = content.match(/[⚑🚩]\s*KAIN-Slice:\s*(.*?)(?:\n\n|$)/iu);
  if (kainMatch) {
    kainSlice = kainMatch[1].trim();
    content = content.replace(kainMatch[0], '').trim();
  }

  // 3. Extract ∆DΩΛ Block (The Canon Signature)
  // Matches variants like:
  // ∆ (Дельта): ...
  // **∆**: ...
  // ∆: ...
  const deltaRegex = /[*]*∆[*]*\s*\(?Дельта\)?\s*:?\s*(.*?)\n+[*]*D[*]*\s*\(?(?:Depth|SIFT)\)?\s*:?\s*(.*?)\n+[*]*Ω[*]*\s*\(?Омега\)?\s*:?\s*(.*?)\n+[*]*Λ[*]*\s*\(?(?:Lambda|Лямбда|Latch)\)?\s*:?\s*(.*)/si;
  
  const deltaMatch = content.match(deltaRegex);

  if (deltaMatch) {
    const [fullMatch, delta, depth, omega, lambda] = deltaMatch;
    const omegaRaw = omega.trim();
    // Parse omega as number (handling "85%" or "0.85")
    const omegaVal = parseInt(omegaRaw.replace('%', ''), 10);

    signature = {
      delta: delta.trim(),
      depth: depth.trim(),
      omega: isNaN(omegaVal) ? 0 : omegaVal,
      lambda: lambda.trim()
    };
    content = content.replace(fullMatch, '').trim();

    // Strict Validation against Philosophy
    if (!signature.delta || signature.delta.length < 5) missing.push('∆ (Смысл изменения)');
    if (!signature.depth || signature.depth.length < 5) missing.push('D (Опора/SIFT)');
    // Omega is number now
    if (signature.omega < 0) missing.push('Ω (Уровень уверенности)');
    if (!signature.lambda || signature.lambda.length < 5) missing.push('Λ (Следующий шаг)');

  } else {
    // If the block is completely missing, it's a major violation unless it's a very short functional acknowledgment
    // However, for Iskra, "Existence means maintaining difference", so almost all responses should have it.
    if (content.length > 50) {
       missing.push('Отсутствует блок ∆DΩΛ');
    }
  }

  return {
    content,
    signature,
    kainSlice,
    iLoop,
    validation: {
      isValid: missing.length === 0,
      missing
    }
  };
};
