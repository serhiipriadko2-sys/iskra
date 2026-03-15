import {
  CoreEngine,
  MemoryService,
  metricsEngine,
  voiceSystem,
  createSupabaseClient,
  SupabaseEdgeEmbeddingProvider,
  SafeEmbeddingProvider,
  SupabasePgvectorHnswIndex,
  EmbeddingProvider,
  VectorIndex
} from '@iskra/engine';

// 1. Initialize Supabase configuration
const url = import.meta.env.VITE_SUPABASE_URL ?? '';
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY ?? '';

let embeddingProvider: EmbeddingProvider;
let vectorIndex: VectorIndex | undefined = undefined;

if (url && anonKey) {
  // 2a. Live Supabase connection configured
  const supabase = createSupabaseClient({ url, anonKey });
  
  // Edge Function embeddings (with semantic caching & PII redaction)
  const edge = new SupabaseEdgeEmbeddingProvider(supabase, { functionName: 'embed', timeoutMs: 10_000 });
  embeddingProvider = new SafeEmbeddingProvider(edge, {
    piiPolicy: 'redact',
    cacheTtlMs: 6 * 60 * 60 * 1000,
    cacheMaxEntries: 1024
  });

  // HNSW Postgres Vector Index (respects RLS, SECURITY INVOKER)
  vectorIndex = new SupabasePgvectorHnswIndex(supabase);
} else {
  // 2b. Deterministic fallback for local dev (no DB configured)
  console.warn('ISKRA CORE: Running in degraded mode (No Supabase URL/Key). Memory is transient and uses mock deterministic embeddings.');
  embeddingProvider = {
    embed: async (text: string): Promise<number[]> => {
      const hash = text.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
      // Mock length matching the model's standard embedding dimension (e.g. 384 for BGE)
      // We return 2 here just for mock compatibility, but production uses 384
      return [Math.sin(hash), Math.cos(hash)];
    }
  };
}

// 3. Initialize Memory Service with Vector Index (if available)
const memoryService = new MemoryService(embeddingProvider, vectorIndex, {
    persistence: vectorIndex ? 'best_effort' : undefined
});

// 4. Create and export the singleton CoreEngine instance
export const engine = new CoreEngine(memoryService, metricsEngine, voiceSystem);
