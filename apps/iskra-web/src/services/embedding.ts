import { EmbeddingProvider, SafeEmbeddingProvider, SupabaseEdgeEmbeddingProvider, createSupabaseClient } from '@iskra/engine';

export class BrowserEmbeddingProvider implements EmbeddingProvider {
  private readonly delegate: EmbeddingProvider;

  constructor() {
    const url = import.meta.env.VITE_SUPABASE_URL ?? '';
    const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY ?? '';

    if (url && anonKey) {
      const supabase = createSupabaseClient({ url, anonKey });
      const edge = new SupabaseEdgeEmbeddingProvider(supabase, { functionName: 'embed', timeoutMs: 10_000 });
      this.delegate = new SafeEmbeddingProvider(edge, {
        // Browser default: redact obvious PII.
        piiPolicy: 'redact',
        cacheTtlMs: 6 * 60 * 60 * 1000,
        cacheMaxEntries: 1024
      });
      return;
    }

    // Deterministic fallback for local dev (no Supabase configured).
    this.delegate = {
      embed: async (text: string): Promise<number[]> => {
        const hash = text.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
        return [Math.sin(hash), Math.cos(hash)];
      }
    };
  }

  embed(text: string): Promise<number[]> {
    return this.delegate.embed(text);
  }
}
