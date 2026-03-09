import { IskraValidationError as CoreValidationError } from '@iskra/core';

/**
 * Validates that a signal array is non-empty and contains only finite numbers.
 * @throws {IskraValidationError} if validation fails
 */
export function validateSignal(signal: number[]): void {
  if (!signal || signal.length === 0) {
    throw new IskraValidationError('Signal cannot be empty');
  }
  if (signal.some(isNaN)) {
    throw new IskraValidationError('Signal contains NaN values');
  }
  if (signal.some(x => !isFinite(x))) {
    throw new IskraValidationError('Signal contains Infinity values');
  }
}

/**
 * Validates kmax parameter for fractal analysis.
 * @throws {IskraValidationError} if validation fails
 */
export function validateKmax(kmax: number, signalLength: number): void {
  if (kmax <= 0) {
    throw new IskraValidationError('kmax must be positive');
  }
  if (kmax > signalLength) {
    throw new IskraValidationError('kmax cannot exceed signal length');
  }
}

/**
 * Validation error class for math package.
 */
export class IskraValidationError extends CoreValidationError {
  constructor(message: string) {
    super(message);
    this.name = 'IskraValidationError';
  }
}
