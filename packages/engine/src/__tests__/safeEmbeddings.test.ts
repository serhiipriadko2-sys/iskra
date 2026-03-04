import { describe, it, expect } from 'vitest';
import { SafeEmbeddingProvider } from '../services/safeEmbeddings';
import type { EmbeddingProvider } from '../services/memory';

class SpyProvider implements EmbeddingProvider {
  public calls: string[] = [];
  async embed(text: string): Promise<number[]> {
    this.calls.push(text);
    return [text.length, 0];
  }
}

describe('SafeEmbeddingProvider', () => {
  it('redacts obvious PII by default', async () => {
    const spy = new SpyProvider();
    const safe = new SafeEmbeddingProvider(spy);
    await safe.embed('email me at test@example.com');
    expect(spy.calls.length).toBe(1);
    expect(spy.calls[0]).toContain('<EMAIL>');
    expect(spy.calls[0]).not.toContain('test@example.com');
  });

  it('caches embeddings (same normalized text)', async () => {
    const spy = new SpyProvider();
    const safe = new SafeEmbeddingProvider(spy, { cacheTtlMs: 60_000 });
    await safe.embed('  hello   world  ');
    await safe.embed('hello world');
    expect(spy.calls.length).toBe(1);
  });

  it('blocks when piiPolicy=block', async () => {
    const spy = new SpyProvider();
    const safe = new SafeEmbeddingProvider(spy, { piiPolicy: 'block' });
    await expect(safe.embed('call me +1 (555) 123-4567')).rejects.toThrow(/PII detected/i);
    expect(spy.calls.length).toBe(0);
  });
});
