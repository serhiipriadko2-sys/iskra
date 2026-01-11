
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ragService } from '../ragService';
import { searchService } from '../searchService';
import { memoryService } from '../memoryService';

// Mock dependencies
vi.mock('../searchService', () => ({
  searchService: {
    searchHybrid: vi.fn(),
  },
}));

vi.mock('../memoryService', () => ({
  memoryService: {
    getMantra: vi.fn(),
  },
}));

describe('ragService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('buildRAGContext', () => {
    it('returns empty context when no results found', async () => {
      vi.mocked(searchService.searchHybrid).mockResolvedValue([]);

      const context = await ragService.buildRAGContext('test query');

      expect(context.relevantMemories).toHaveLength(0);
      expect(context.contextBlock).toBe('');
    });

    it('includes mantra if relevant', async () => {
      vi.mocked(searchService.searchHybrid).mockResolvedValue([]);
      vi.mocked(memoryService.getMantra).mockReturnValue({
        id: 'mantra-1',
        text: 'Core Mantra Text',
        isActive: true,
        layer: 'mantra',
        version: 'vΩ.3.4',
        timestamp: new Date().toISOString(),
      });

      const context = await ragService.buildRAGContext('mantra');

      expect(context.relevantMemories).toHaveLength(1);
      // Check that mantra was included (type is determined by layer detection)
      expect(context.relevantMemories[0]).toBeDefined();
    });

    it('filters results by score', async () => {
      vi.mocked(searchService.searchHybrid).mockResolvedValue([
        // @ts-ignore - partial mock is enough
        { id: '1', score: 0.9, snippet: 'high', type: 'archive' },
        // @ts-ignore
        { id: '2', score: 0.1, snippet: 'low', type: 'archive' },
      ]);

      const context = await ragService.buildRAGContext('test', { minScore: 0.5 });

      expect(context.relevantMemories).toHaveLength(1);
      expect(context.relevantMemories[0].id).toBe('1');
    });
  });

  describe('Conflict Detection (SIFT)', () => {
    it('detects direct contradictions', async () => {
      vi.mocked(searchService.searchHybrid).mockResolvedValue([
        // @ts-ignore
        { id: '1', score: 0.9, snippet: 'Sky is blue (true)', type: 'archive', layer: 'archive' },
        // @ts-ignore
        { id: '2', score: 0.8, snippet: 'Sky is green (false)', type: 'shadow', layer: 'shadow' },
      ]);

      const context = await ragService.buildRAGContext('sky color');

      expect(context.conflictTable).toBeDefined();
      expect(context.conflictTable?.length).toBeGreaterThan(0);
      expect(context.conflictTable?.[0].claim).toBe('Противоречие в данных');
    });

    it('identifies source priority correctly', async () => {
       vi.mocked(searchService.searchHybrid).mockResolvedValue([
        // @ts-ignore
        { id: '1', score: 0.9, snippet: 'Canon truth', type: 'canon', layer: 'mantra' },
      ]);

      const context = await ragService.buildRAGContext('truth');
      expect(context.sourcePriority).toBe('A_CANON');
    });
  });

  describe('Multi-step SIFT Loop', () => {
      it('resolves simple conflicts by finding new sources', async () => {
          // 1st call: Returns conflicting info
          vi.mocked(searchService.searchHybrid)
            .mockResolvedValueOnce([
                // @ts-ignore
                { id: '1', score: 0.9, snippet: 'A is true', type: 'shadow' },
                // @ts-ignore
                { id: '2', score: 0.9, snippet: 'A is false', type: 'shadow' },
            ])
            // 2nd call (verification): Returns decisive canon info
            .mockResolvedValueOnce([
                // @ts-ignore
                { id: '3', score: 0.99, snippet: 'A is definitely true', type: 'canon', layer: 'mantra' }
            ]);

          const context = await ragService.buildRAGContextWithSIFT('Is A true?');

          expect(context.sift_iterations).toBeGreaterThan(0);
          // 2 original + 1 new + 1 mantra (automatically added via mock) = 4
          expect(context.relevantMemories).toHaveLength(4);
          // Although logic is complex, we expect at least an iteration (initial search + verification search)
          expect(searchService.searchHybrid).toHaveBeenCalled();
          expect(vi.mocked(searchService.searchHybrid).mock.calls.length).toBeGreaterThanOrEqual(2);
      });

      it('stops if no new sources found', async () => {
           vi.mocked(searchService.searchHybrid)
            .mockResolvedValueOnce([
                // @ts-ignore
                { id: '1', score: 0.9, snippet: 'A is true', type: 'shadow' },
                // @ts-ignore
                { id: '2', score: 0.9, snippet: 'A is false', type: 'shadow' },
            ])
            .mockResolvedValueOnce([]); // No new info

          const context = await ragService.buildRAGContextWithSIFT('Is A true?');

          expect(context.sift_iterations).toBe(1);
          // Should still have the original conflicts
          expect(context.unresolved_conflicts).toHaveLength(1);
      });
  });
});
