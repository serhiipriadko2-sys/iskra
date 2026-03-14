import type { EvidenceKind, EvidenceRef, ExplainStep, Explainable } from '@iskra/core';

export type ValidateExplainableOptions = {
  /** If true, require how[] to be present and non-empty. */
  requireHow?: boolean;
  /** If true, require at least one EvidenceRef either on explainable.evidence or any step.refs. */
  requireAnyRefs?: boolean;
  /** If true, require at least one step to include a non-empty formula string. */
  requireAnyFormula?: boolean;
  /** If set, require at least one EvidenceRef.kind to match one of these. */
  requireKinds?: EvidenceKind[];
};

export type XCodeValidationIssue = {
  code:
    | 'not_object'
    | 'missing_value'
    | 'missing_how'
    | 'empty_how'
    | 'step_label_empty'
    | 'formula_missing'
    | 'refs_missing'
    | 'ref_invalid'
    | 'kind_invalid'
    | 'ref_empty'
    | 'json_unsafe'
    | 'contains_undefined';
  message: string;
  path?: string;
};

export type XCodeValidationResult = {
  ok: boolean;
  issues: XCodeValidationIssue[];
};

const EVIDENCE_KINDS: EvidenceKind[] = ['canon', 'project', 'web', 'data'];

function isPlainObject(v: unknown): v is Record<string, unknown> {
  return typeof v === 'object' && v !== null && !Array.isArray(v);
}

function hasUndefinedDeep(v: unknown, seen = new Set<unknown>()): boolean {
  if (v === undefined) return true;
  if (v === null) return false;
  if (typeof v !== 'object') return false;
  if (seen.has(v)) return false;
  seen.add(v);

  if (Array.isArray(v)) {
    for (const item of v) {
      if (hasUndefinedDeep(item, seen)) return true;
    }
    return false;
  }

  for (const key of Object.keys(v as Record<string, unknown>)) {
    if (hasUndefinedDeep((v as Record<string, unknown>)[key], seen)) return true;
  }
  return false;
}

function isJsonSafe(v: unknown): boolean {
  try {
    JSON.stringify(v);
    return true;
  } catch {
    return false;
  }
}

function validateEvidenceRef(ref: EvidenceRef, issues: XCodeValidationIssue[], path: string) {
  if (!EVIDENCE_KINDS.includes(ref.kind)) {
    issues.push({
      code: 'kind_invalid',
      message: `EvidenceRef.kind must be one of: ${EVIDENCE_KINDS.join(', ')}`,
      path: `${path}.kind`,
    });
  }
  if (!ref.ref || typeof ref.ref !== 'string' || ref.ref.trim().length === 0) {
    issues.push({
      code: 'ref_empty',
      message: 'EvidenceRef.ref must be a non-empty string',
      path: `${path}.ref`,
    });
  }
}

function collectAllRefs(explainable: Explainable<unknown>): EvidenceRef[] {
  const out: EvidenceRef[] = [];
  if (Array.isArray(explainable.evidence)) out.push(...explainable.evidence);
  for (const step of explainable.how ?? []) {
    if (Array.isArray(step.refs)) out.push(...step.refs);
  }
  return out;
}

function hasAnyFormula(how: ExplainStep[]): boolean {
  return how.some((s) => typeof s.formula === 'string' && s.formula.trim().length > 0);
}

/**
 * Validate that an Explainable<T> object is structurally safe for XCode.
 *
 * This is intentionally conservative: it checks JSON-safety and bans
 * `undefined` inside `how.inputs`/`how.output` to prevent lossy serialization.
 */
export function validateExplainable(
  value: unknown,
  options: ValidateExplainableOptions = {}
): XCodeValidationResult {
  const issues: XCodeValidationIssue[] = [];
  if (!isPlainObject(value)) {
    issues.push({ code: 'not_object', message: 'Explainable must be an object' });
    return { ok: false, issues };
  }

  if (!('value' in value)) {
    issues.push({ code: 'missing_value', message: 'Explainable.value is required', path: 'value' });
  }

  const how = (value as unknown as Explainable<unknown>).how;
  if (!Array.isArray(how)) {
    if (options.requireHow) {
      issues.push({ code: 'missing_how', message: 'Explainable.how is required', path: 'how' });
    }
  } else {
    if (options.requireHow && how.length === 0) {
      issues.push({ code: 'empty_how', message: 'Explainable.how must be non-empty', path: 'how' });
    }

    for (let i = 0; i < how.length; i += 1) {
      const step = how[i];
      const stepPath = `how[${i}]`;
      if (!step) {
        // Defensive guard for noUncheckedIndexedAccess
        continue;
      }
      if (!step.label || typeof step.label !== 'string' || step.label.trim().length === 0) {
        issues.push({
          code: 'step_label_empty',
          message: 'ExplainStep.label must be a non-empty string',
          path: `${stepPath}.label`,
        });
      }

      if (hasUndefinedDeep(step.inputs)) {
        issues.push({
          code: 'contains_undefined',
          message: 'ExplainStep.inputs must not contain undefined (lossy JSON)',
          path: `${stepPath}.inputs`,
        });
      }
      if (hasUndefinedDeep(step.output)) {
        issues.push({
          code: 'contains_undefined',
          message: 'ExplainStep.output must not contain undefined (lossy JSON)',
          path: `${stepPath}.output`,
        });
      }
      if (!isJsonSafe(step.inputs) || !isJsonSafe(step.output)) {
        issues.push({
          code: 'json_unsafe',
          message: 'ExplainStep inputs/output must be JSON-serializable',
          path: stepPath,
        });
      }

      if (Array.isArray(step.refs)) {
        for (let j = 0; j < step.refs.length; j += 1) {
          const ref = step.refs[j];
          if (!ref) continue;
          validateEvidenceRef(ref, issues, `${stepPath}.refs[${j}]`);
        }
      }
    }

    if (options.requireAnyFormula && !hasAnyFormula(how)) {
      issues.push({
        code: 'formula_missing',
        message: 'At least one ExplainStep.formula must be present for XCode-required functions',
        path: 'how[*].formula',
      });
    }
  }

  const explainable = value as unknown as Explainable<unknown>;
  const allRefs = collectAllRefs(explainable);
  if (options.requireAnyRefs && allRefs.length === 0) {
    issues.push({
      code: 'refs_missing',
      message: 'At least one EvidenceRef is required for XCode-required functions',
      path: 'evidence|how[*].refs',
    });
  }

  if (options.requireKinds && options.requireKinds.length > 0) {
    const hasKind = allRefs.some((r) => options.requireKinds!.includes(r.kind));
    if (!hasKind) {
      issues.push({
        code: 'ref_invalid',
        message: `At least one EvidenceRef.kind must be one of: ${options.requireKinds.join(', ')}`,
        path: 'evidence|how[*].refs',
      });
    }
  }

  if (Array.isArray(explainable.evidence)) {
    for (let i = 0; i < explainable.evidence.length; i += 1) {
      const ref = explainable.evidence[i];
      if (!ref) continue;
      validateEvidenceRef(ref, issues, `evidence[${i}]`);
    }
  }

  return { ok: issues.length === 0, issues };
}
