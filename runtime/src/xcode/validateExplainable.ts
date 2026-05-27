/**
 * Explainable Validation Shim
 *
 * Keep validation local to `@iskra/runtime` so downstream builds like
 * `iskraSpace` do not depend on unpublished workspace packages.
 */

import type { Explainable } from '../types/explainable.js';

export type ValidateExplainableOptions = {
  requireEvidence?: boolean;
  requireFormulas?: boolean;
};

export type XCodeValidationIssue = {
  path: string;
  message: string;
};

export type XCodeValidationResult = {
  ok: boolean;
  issues: XCodeValidationIssue[];
};

export function validateExplainable<T>(
  value: Explainable<T>,
  options: ValidateExplainableOptions = {},
): XCodeValidationResult {
  const issues: XCodeValidationIssue[] = [];

  if (!Array.isArray(value.how) || value.how.length === 0) {
    issues.push({
      path: 'how',
      message: 'Explainable value must include at least one trace step.',
    });
  }

  value.how?.forEach((step, index) => {
    if (!step.label?.trim()) {
      issues.push({
        path: `how[${index}].label`,
        message: 'Each trace step must include a label.',
      });
    }

    if (options.requireFormulas && !step.formula?.trim()) {
      issues.push({
        path: `how[${index}].formula`,
        message: 'Formula is required for each trace step.',
      });
    }

    if (options.requireEvidence && (!step.refs || step.refs.length === 0)) {
      issues.push({
        path: `how[${index}].refs`,
        message: 'Evidence refs are required for each trace step.',
      });
    }
  });

  if (options.requireEvidence && (!value.evidence || value.evidence.length === 0)) {
    issues.push({
      path: 'evidence',
      message: 'Top-level evidence is required.',
    });
  }

  return {
    ok: issues.length === 0,
    issues,
  };
}
