import type { EmbeddingProvider } from './memory.js';

export type PiiPolicy = 'allow' | 'redact' | 'block';

export interface SafeEmbeddingProviderOptions {
  /**
   * Maximum number of characters sent to the embedding backend.
   * Default: 8192.
   */
  maxChars?: number;
  /** Normalize whitespace (trim + collapse). Default: true. */
  normalizeWhitespace?: boolean;
  /** PII policy. Default: 'redact'. */
  piiPolicy?: PiiPolicy;
  /** Cache max entries. Default: 2048. */
  cacheMaxEntries?: number;
  /** Cache TTL in ms. Default: 24h. */
  cacheTtlMs?: number;
}

type CacheEntry = { value: number[]; expiresAt: number };

// Simple FNV-1a 32-bit hash (deterministic, dependency-free).
function fnv1a32(input: string): string {
  let hash = 0x811c9dc5;
  for (let i = 0; i < input.length; i += 1) {
    hash ^= input.charCodeAt(i);
    // 32-bit FNV prime
    hash = (hash * 0x01000193) >>> 0;
  }
  return hash.toString(16).padStart(8, '0');
}

function normalize(text: string, maxChars: number, normalizeWhitespace: boolean): string {
  const t = normalizeWhitespace
    ? text.trim().replace(/\s+/g, ' ')
    : text;
  return t.length > maxChars ? t.slice(0, maxChars) : t;
}

function detectPII(text: string): { has: boolean; redacted: string } {
  let redacted = text;
  let has = false;

  // Email
  const emailRe = /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi;
  if (emailRe.test(redacted)) {
    has = true;
    redacted = redacted.replace(emailRe, '<EMAIL>');
  }

  // Phone-ish (very heuristic)
  const phoneRe = /(?:\+?\d[\d\s\-()]{7,}\d)/g;
  if (phoneRe.test(redacted)) {
    has = true;
    redacted = redacted.replace(phoneRe, '<PHONE>');
  }

  // Credit card-ish
  const cardRe = /\b\d{13,19}\b/g;
  if (cardRe.test(redacted)) {
    has = true;
    redacted = redacted.replace(cardRe, '<CARD>');
  }

  return { has, redacted };
}

/**
 * Wrap any EmbeddingProvider with input hygiene + optional PII policy + cache.
 *
 * SECURITY NOTE:
 * - This is *not* a full PII detector. It's a guardrail against obvious leaks.
 */
export class SafeEmbeddingProvider implements EmbeddingProvider {
  private readonly maxChars: number;
  private readonly normalizeWhitespace: boolean;
  private readonly piiPolicy: PiiPolicy;
  private readonly cacheMaxEntries: number;
  private readonly cacheTtlMs: number;
  private readonly cache = new Map<string, CacheEntry>();

  constructor(private readonly delegate: EmbeddingProvider, opts: SafeEmbeddingProviderOptions = {}) {
    this.maxChars = opts.maxChars ?? 8192;
    this.normalizeWhitespace = opts.normalizeWhitespace ?? true;
    this.piiPolicy = opts.piiPolicy ?? 'redact';
    this.cacheMaxEntries = opts.cacheMaxEntries ?? 2048;
    this.cacheTtlMs = opts.cacheTtlMs ?? 24 * 60 * 60 * 1000;
  }

  async embed(text: string): Promise<number[]> {
    const normalized = normalize(text, this.maxChars, this.normalizeWhitespace);

    const pii = detectPII(normalized);
    if (pii.has && this.piiPolicy === 'block') {
      throw new Error('PII detected in embedding input (policy=block)');
    }
    const safeText = pii.has && this.piiPolicy === 'redact' ? pii.redacted : normalized;

    const key = fnv1a32(safeText);
    const now = Date.now();
    const cached = this.cache.get(key);
    if (cached && cached.expiresAt > now) {
      return cached.value;
    }

    const value = await this.delegate.embed(safeText);
    this.cache.set(key, { value, expiresAt: now + this.cacheTtlMs });

    // Best-effort eviction.
    if (this.cache.size > this.cacheMaxEntries) {
      const firstKey = this.cache.keys().next().value as string | undefined;
      if (firstKey) this.cache.delete(firstKey);
    }

    return value;
  }
}
