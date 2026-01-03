/**
 * Rate Limiter Service
 *
 * Client-side rate limiting for API calls (especially Gemini).
 * Prevents abuse and helps stay within API quotas.
 */

interface RateLimitConfig {
  maxRequests: number; // Max requests in the window
  windowMs: number; // Time window in milliseconds
  retryAfterMs: number; // Time to wait after hitting limit
}

interface RateLimitState {
  requests: number[];
  blocked: boolean;
  blockedUntil: number | null;
}

const DEFAULT_CONFIGS: Record<string, RateLimitConfig> = {
  // Gemini API: 60 requests per minute (conservative)
  gemini: {
    maxRequests: 50,
    windowMs: 60 * 1000, // 1 minute
    retryAfterMs: 10 * 1000, // 10 seconds
  },
  // Chat messages: prevent spam
  chat: {
    maxRequests: 10,
    windowMs: 10 * 1000, // 10 seconds
    retryAfterMs: 5 * 1000, // 5 seconds
  },
  // Voice transcription: expensive operation
  transcription: {
    maxRequests: 5,
    windowMs: 60 * 1000, // 1 minute
    retryAfterMs: 30 * 1000, // 30 seconds
  },
  // General API calls
  api: {
    maxRequests: 100,
    windowMs: 60 * 1000, // 1 minute
    retryAfterMs: 5 * 1000, // 5 seconds
  },
};

// State for each limiter
const limiters: Map<string, RateLimitState> = new Map();

/**
 * Get or create limiter state
 */
function getLimiterState(name: string): RateLimitState {
  if (!limiters.has(name)) {
    limiters.set(name, {
      requests: [],
      blocked: false,
      blockedUntil: null,
    });
  }
  return limiters.get(name)!;
}

/**
 * Clean old requests from the window
 */
function cleanOldRequests(state: RateLimitState, windowMs: number): void {
  const now = Date.now();
  state.requests = state.requests.filter((time) => now - time < windowMs);
}

/**
 * Check if a request is allowed
 */
export function checkRateLimit(
  name: string,
  config?: Partial<RateLimitConfig>
): { allowed: boolean; retryAfter?: number; remaining?: number } {
  const limiterConfig = {
    ...DEFAULT_CONFIGS[name] || DEFAULT_CONFIGS.api,
    ...config,
  };

  const state = getLimiterState(name);
  const now = Date.now();

  // Check if currently blocked
  if (state.blocked && state.blockedUntil) {
    if (now < state.blockedUntil) {
      return {
        allowed: false,
        retryAfter: state.blockedUntil - now,
        remaining: 0,
      };
    }
    // Unblock
    state.blocked = false;
    state.blockedUntil = null;
  }

  // Clean old requests
  cleanOldRequests(state, limiterConfig.windowMs);

  const remaining = limiterConfig.maxRequests - state.requests.length;

  if (state.requests.length >= limiterConfig.maxRequests) {
    // Block
    state.blocked = true;
    state.blockedUntil = now + limiterConfig.retryAfterMs;

    return {
      allowed: false,
      retryAfter: limiterConfig.retryAfterMs,
      remaining: 0,
    };
  }

  return {
    allowed: true,
    remaining,
  };
}

/**
 * Record a request (call after making the request)
 */
export function recordRequest(name: string): void {
  const state = getLimiterState(name);
  state.requests.push(Date.now());
}

/**
 * Wrapper function for rate-limited operations
 */
export async function withRateLimit<T>(
  name: string,
  operation: () => Promise<T>,
  config?: Partial<RateLimitConfig>
): Promise<T> {
  const check = checkRateLimit(name, config);

  if (!check.allowed) {
    throw new RateLimitError(
      `Rate limit exceeded for ${name}. Retry after ${check.retryAfter}ms`,
      check.retryAfter || 0
    );
  }

  recordRequest(name);
  return operation();
}

/**
 * Custom error for rate limiting
 */
export class RateLimitError extends Error {
  retryAfter: number;

  constructor(message: string, retryAfter: number) {
    super(message);
    this.name = 'RateLimitError';
    this.retryAfter = retryAfter;
  }
}

/**
 * Reset a specific limiter
 */
export function resetLimiter(name: string): void {
  limiters.delete(name);
}

/**
 * Reset all limiters
 */
export function resetAllLimiters(): void {
  limiters.clear();
}

/**
 * Get current state for debugging
 */
export function getLimiterStatus(name: string): {
  requests: number;
  blocked: boolean;
  blockedUntil: number | null;
  config: RateLimitConfig;
} {
  const state = getLimiterState(name);
  const config = DEFAULT_CONFIGS[name] || DEFAULT_CONFIGS.api;

  // Clean old requests for accurate count
  cleanOldRequests(state, config.windowMs);

  return {
    requests: state.requests.length,
    blocked: state.blocked,
    blockedUntil: state.blockedUntil,
    config,
  };
}

/**
 * Get all limiter statuses
 */
export function getAllLimiterStatuses(): Record<string, ReturnType<typeof getLimiterStatus>> {
  const statuses: Record<string, ReturnType<typeof getLimiterStatus>> = {};

  for (const name of Object.keys(DEFAULT_CONFIGS)) {
    statuses[name] = getLimiterStatus(name);
  }

  return statuses;
}
