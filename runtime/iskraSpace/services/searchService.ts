import { storageService } from './storageService';
import { memoryService } from './memoryService';
import { MemoryNode, MemoryNodeLayer, SearchFilters, SearchResult, Task, JournalEntry } from '../types';
import { IskraAIService } from './geminiService';
import { graphServiceSupabase } from './graphServiceSupabase';
import { isSupabaseAvailable } from './supabaseClient';

/**
 * Hybrid search: lexical (tf-idf-like) + semantic (embeddings).
 */
class SearchService {
  private readonly remoteSemanticEnabled = import.meta.env.VITE_ENABLE_REMOTE_SEMANTIC_SEARCH === 'true';
  private readonly allowSensitiveRemoteEmbedding = import.meta.env.VITE_ALLOW_SENSITIVE_REMOTE_EMBEDDING === 'true';
  private ready = false;
  private lexIndex: {
    docs: { id: string; type: SearchResult['type']; layer?: MemoryNodeLayer; text: string; title?: string; tags?: string[]; ts?: number }[];
    vocab: Map<string, number>;
  } = { docs: [], vocab: new Map() };

  // Removed immediate instantiation to prevent circular dependency error during module load
  private aiService?: IskraAIService;

  // Simple in-memory vector store: docId -> vector
  private vectors: Map<string, number[]> = new Map();

  // Cosine Similarity
  private similarity(v1: number[], v2: number[]): number {
    if (!v1 || !v2 || v1.length !== v2.length) return 0;
    let dot = 0;
    let mag1 = 0;
    let mag2 = 0;
    for (let i = 0; i < v1.length; i++) {
      dot += v1[i] * v2[i];
      mag1 += v1[i] * v1[i];
      mag2 += v2[i] * v2[i];
    }
    return dot / (Math.sqrt(mag1) * Math.sqrt(mag2));
  }

  private getAi(): IskraAIService {
    if (!this.aiService) {
      this.aiService = new IskraAIService();
    }
    return this.aiService;
  }

  private isRemoteEmbeddingAllowed(doc: { type: SearchResult['type'] }): boolean {
    if (this.allowSensitiveRemoteEmbedding) return true;
    return doc.type === 'task';
  }

  invalidate() {
    this.ready = false;
    this.lexIndex = { docs: [], vocab: new Map() };
    this.vectors.clear();
  }

  async build(force = false) {
    if (force) {
      this.invalidate();
    }

    if (this.ready) return;

    const tasks = storageService.getTasks().map((t: Task) => ({
      id: `task_${t.id}`,
      type: 'task' as const,
      text: t.title,
      title: t.title,
      tags: [t.ritualTag],
      ts: Date.now(),
    }));
    const journal = storageService.getJournalEntries().map((j: JournalEntry) => ({
      id: `journal_${j.id}`,
      type: 'journal' as const,
      text: j.text,
      title: j.prompt?.question,
      tags: [],
      ts: +new Date(j.timestamp),
    }));
    const archive = memoryService.getArchive();
    const shadow = memoryService.getShadow();

    const memDoc = (n: MemoryNode, layer: MemoryNodeLayer) => ({
      id: `memory_${layer}_${n.id}`,
      type: 'memory' as const,
      layer,
      text: `${n.title || ''}\n${JSON.stringify(n.content) || ''}`,
      title: n.title,
      tags: [...(n.tags || []), `_type:${n.type}`],
      ts: +new Date(n.timestamp),
    });
    const memory = [
      ...archive.map((n) => memDoc(n, 'archive')),
      ...shadow.map((n) => memDoc(n, 'shadow')),
    ];

    const docs = [...tasks, ...journal, ...memory];

    const tokenize = (s: string) => s.toLowerCase().normalize('NFKC').replace(/[^\p{L}\p{N}\s]/gu, ' ').split(/\s+/).filter(Boolean);
    const vocab = new Map<string, number>();
    docs.forEach((d) => {
      const uniq = new Set(tokenize(d.text));
      uniq.forEach((tok) => vocab.set(tok, (vocab.get(tok) || 0) + 1));
    });
    this.lexIndex = { docs, vocab };
    this.ready = true;
  }

  private scoreLex(query: string, text: string) {
    const tokenize = (s: string) => s.toLowerCase().normalize('NFKC').replace(/[^\p{L}\p{N}\s]/gu, ' ').split(/\s+/).filter(Boolean);
    const q = tokenize(query);
    const t = tokenize(text);
    if (!q.length || !t.length) return 0;
    let hits = 0;
    q.forEach((term) => {
      if (t.includes(term)) hits += 1;
    });
    return hits / q.length;
  }

  private snippet(text: string, query: string, max = 220) {
    const i = text.toLowerCase().indexOf(query.toLowerCase());
    if (i < 0) return text.length > max ? `${text.slice(0, max)}...` : text;
    const start = Math.max(0, i - 40);
    const end = Math.min(text.length, i + max - 40);
    return `${start > 0 ? '...' : ''}${text.slice(start, end)}${end < text.length ? '...' : ''}`;
  }

  async searchHybrid(query: string, filters: SearchFilters = {}): Promise<SearchResult[]> {
    if (!this.ready) {
      await this.build();
    }
    const { docs } = this.lexIndex;

    const pool = docs.filter((d) => {
      if (filters.type && !filters.type.includes(d.type)) return false;
      if (filters.layer && d.type === 'memory' && !filters.layer.includes(d.layer!)) return false;
      if (filters.after && d.ts && d.ts < +new Date(filters.after)) return false;
      if (filters.before && d.ts && d.ts > +new Date(filters.before)) return false;
      if (filters.tags?.length && !(d.tags || []).some((t) => filters.tags!.includes(t))) return false;
      return true;
    });

    const semanticAllowedIds = new Set(
      this.remoteSemanticEnabled
        ? pool.filter((doc) => this.isRemoteEmbeddingAllowed(doc)).map((doc) => doc.id)
        : []
    );

    const queryVector = this.remoteSemanticEnabled
      ? await this.getAi().getEmbedding(query)
      : [];
    const useSemantic = queryVector.length > 0;

    const lexScored = pool
      .map((d) => ({
        doc: d,
        lexScore: this.scoreLex(query, d.text),
      }))
      .filter((i) => i.lexScore > 0)
      .sort((a, b) => b.lexScore - a.lexScore);

    const topCandidates = lexScored.slice(0, 5);

    const finalResults = await Promise.all(
      topCandidates.map(async (candidate) => {
        let semanticScore = 0;
        const canUseSemantic = useSemantic && semanticAllowedIds.has(candidate.doc.id);

        if (canUseSemantic) {
          if (!this.vectors.has(candidate.doc.id)) {
            const vec = await this.getAi().getEmbedding(candidate.doc.text.substring(0, 1000));
            this.vectors.set(candidate.doc.id, vec);
          }

          const cachedVector = this.vectors.get(candidate.doc.id);
          if (cachedVector?.length) {
            semanticScore = this.similarity(queryVector, cachedVector);
          }
        }

        const totalScore = (candidate.lexScore * 0.7) + (semanticScore * 0.3);

        return {
          id: candidate.doc.id,
          type: candidate.doc.type,
          layer: candidate.doc.layer,
          title: candidate.doc.title,
          snippet: this.snippet(candidate.doc.text, query),
          score: totalScore,
          meta: { tags: candidate.doc.tags, ts: candidate.doc.ts, semantic: semanticScore },
        };
      })
    );

    const isOnline = await isSupabaseAvailable().catch(() => false);
    let cloudResults: SearchResult[] = [];
    if (isOnline) {
      try {
        const nodes = await graphServiceSupabase.searchNodes(query, 5);
        cloudResults = nodes.map(node => ({
          id: `graph_${node.id}`,
          type: 'memory' as const,
          layer: node.layer?.toLowerCase() as any,
          title: node.title,
          snippet: String(node.content),
          score: node.resonance_score || 0.5,
          meta: {
            tags: node.metadata?.tags as string[] || [],
            ts: +new Date(node.timestamp || new Date()),
            semantic: node.resonance_score
          }
        }));
      } catch (e) {
        console.warn('Failed to fetch from graphServiceSupabase:', e);
      }
    }

    const combined = [...finalResults, ...cloudResults];
    const seen = new Set<string>();
    const uniqueResults = combined.filter(r => {
      const key = `${r.title || ''}_${r.snippet.substring(0, 50)}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });

    return uniqueResults.sort((a, b) => b.score - a.score);
  }
}

export const searchService = new SearchService();
