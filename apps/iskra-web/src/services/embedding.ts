import { EmbeddingProvider } from '@iskra/engine';

export class BrowserEmbeddingProvider implements EmbeddingProvider {
  async embed(text: string): Promise<number[]> {
    // Simple mock for browser: hash text to deterministic vector
    // In production, this would call Supabase Edge Function
    const hash = text.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const v1 = Math.sin(hash);
    const v2 = Math.cos(hash);
    return [v1, v2];
  }
}
