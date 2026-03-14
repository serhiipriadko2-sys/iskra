import {
  type SupabaseClient,
  FunctionsFetchError,
  FunctionsHttpError,
  FunctionsRelayError
} from '@supabase/supabase-js';

import type { EmbeddingProvider } from './memory.js';

export interface EdgeEmbeddingsRequest {
  input: string;
}

export interface EdgeEmbeddingsResponse {
  embedding: number[];
}

export interface SupabaseEdgeEmbeddingProviderOptions {
  /** Supabase Edge Function name. Default: 'embed' */
  functionName?: string;
  /** Optional AbortSignal timeout in ms (best-effort). */
  timeoutMs?: number;
}

/**
 * Embedding provider backed by Supabase Edge Functions.
 * Expects a function that returns JSON: { embedding: number[] }.
 */
export class SupabaseEdgeEmbeddingProvider implements EmbeddingProvider {
  private readonly functionName: string;
  private readonly timeoutMs?: number;

  constructor(private readonly supabase: SupabaseClient, options: SupabaseEdgeEmbeddingProviderOptions = {}) {
    this.functionName = options.functionName ?? 'embed';
    if (options.timeoutMs !== undefined) {
      this.timeoutMs = options.timeoutMs;
    }
  }

  async embed(text: string): Promise<number[]> {
    const controller = this.timeoutMs ? new AbortController() : null;
    const timer = controller && this.timeoutMs
      ? setTimeout(() => controller.abort(), this.timeoutMs)
      : null;

    try {
      const invokeOptions: any = {
        body: { input: text } satisfies EdgeEmbeddingsRequest,
      };
      if (controller?.signal) {
        invokeOptions.signal = controller.signal;
      }

      const { data, error } = await this.supabase.functions.invoke<EdgeEmbeddingsResponse>(this.functionName, invokeOptions);

      if (error) {
        // Standardized error handling patterns from supabase-js docs.
        if (error instanceof FunctionsHttpError) {
          const details = await error.context.text();
          throw new Error(`Edge function HTTP error: ${details}`);
        }
        if (error instanceof FunctionsRelayError) {
          throw new Error(`Edge function relay error: ${error.message}`);
        }
        if (error instanceof FunctionsFetchError) {
          throw new Error(`Edge function fetch error: ${error.message}`);
        }
        throw new Error(`Edge function error: ${error.message}`);
      }

      if (!data || !Array.isArray((data as EdgeEmbeddingsResponse).embedding)) {
        throw new Error('Edge function returned invalid payload (missing embedding[])');
      }

      return data.embedding;
    } finally {
      if (timer) clearTimeout(timer);
    }
  }
}
