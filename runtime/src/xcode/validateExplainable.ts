/**
 * Explainable Validation Shim
 * 
 * Logic has been migrated to @iskra/engine. Keeping this shim
 * specifically to avoid breaking existing legacy imports.
 */

export type { ValidateExplainableOptions, XCodeValidationIssue, XCodeValidationResult } from '@iskra/engine';
export { validateExplainable } from '@iskra/engine';
