/**
 * Base error class for all ISKRA system errors.
 * Provides consistent error structure with code and context.
 */
export class IskraError extends Error {
  public readonly code: string;
  public readonly context?: Record<string, unknown>;

  constructor(message: string, code: string = 'UNKNOWN_ERROR', context?: Record<string, unknown>) {
    super(message);
    this.name = 'IskraError';
    this.code = code;
    if (context !== undefined) {
      this.context = context;
    }
    
    // Maintain proper stack trace
    if ((Error as any).captureStackTrace) {
      (Error as any).captureStackTrace(this, IskraError);
    }
  }
}

/**
 * Error thrown when validation fails in math package.
 */
export class IskraValidationError extends IskraError {
  constructor(message: string) {
    super(`Validation error: ${message}`, 'VALIDATION_ERROR');
    this.name = 'IskraValidationError';
  }
}
