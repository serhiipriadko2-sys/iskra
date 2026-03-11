import { Explainable } from '../types/explainable';

export interface ExplainableValidation {
  valid: boolean;
  errors: string[];
}

function containsUndefined(input: unknown): boolean {
  if (input === undefined) return true;
  if (input === null) return false;
  if (Array.isArray(input)) return input.some(containsUndefined);
  if (typeof input === 'object') {
    return Object.values(input as Record<string, unknown>).some(containsUndefined);
  }
  return false;
}

export function validateExplainable<T>(value: Explainable<T>): ExplainableValidation {
  const errors: string[] = [];

  if (value.how.length === 0) {
    errors.push('how.length must be > 0');
  }

  const hasFormula = value.how.some(step => typeof step.formula === 'string' && step.formula.length > 0);
  if (!hasFormula) {
    errors.push('at least one step must include formula');
  }

  const hasCanonEvidence = value.evidence.some(ref => ref.kind === 'canon');
  if (!hasCanonEvidence) {
    errors.push('evidence must include at least one canon reference');
  }

  const hasUndefined = containsUndefined(value.how);
  if (hasUndefined) {
    errors.push('how must be JSON-safe (no undefined values)');
  }

  return {
    valid: errors.length === 0,
    errors
  };
}
