
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { memoryService } from '../memoryService';
import { MemoryNode } from '../../types';

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: vi.fn((key: string) => store[key] || null),
    setItem: vi.fn((key: string, value: string) => {
      store[key] = value;
    }),
    removeItem: vi.fn((key: string) => {
      delete store[key];
    }),
    clear: vi.fn(() => {
      store = {};
    }),
  };
})();

Object.defineProperty(global, 'localStorage', {
  value: localStorageMock,
});

describe('memoryService CRUD Operations', () => {
  beforeEach(() => {
    localStorageMock.clear();
    vi.clearAllMocks();
  });

  const validNode: Partial<MemoryNode> = {
    title: 'Test Node',
    type: 'insight',
    content: 'Test Content',
    evidence: [{
      source: 'Test',
      inference: 'Inference',
      fact: 'true',
      trace: 'Trace'
    }]
  };

  describe('updateNode', () => {
    it('successfully updates an archive node', () => {
      // Setup: Add node
      const node = memoryService.addArchiveEntry(validNode);

      // Act: Update
      const updated = memoryService.updateNode(node.id, 'archive', { title: 'Updated Title' });

      // Assert
      expect(updated).not.toBeNull();
      expect(updated?.title).toBe('Updated Title');
      expect(updated?.id).toBe(node.id); // ID unchanged

      // Verify storage
      const stored = memoryService.getArchive().find(n => n.id === node.id);
      expect(stored?.title).toBe('Updated Title');
    });

    it('returns null if node not found', () => {
      const result = memoryService.updateNode('non-existent', 'archive', { title: 'New' });
      expect(result).toBeNull();
    });

    it('prevents changing layer via update', () => {
      const node = memoryService.addArchiveEntry(validNode);

      // Act: Try to change layer to shadow
      // @ts-ignore - testing runtime protection
      const updated = memoryService.updateNode(node.id, 'archive', { layer: 'shadow' });

      // Assert: Layer should remain 'archive' as per implementation logic
      expect(updated?.layer).toBe('archive');
    });
  });

  describe('deleteNode', () => {
    it('successfully deletes an archive node', () => {
      const node = memoryService.addArchiveEntry(validNode);

      const success = memoryService.deleteNode(node.id, 'archive');

      expect(success).toBe(true);
      expect(memoryService.getArchive()).toHaveLength(0);
    });

    it('successfully deletes a shadow node', () => {
      const node = memoryService.addShadowEntry(validNode);

      const success = memoryService.deleteNode(node.id, 'shadow');

      expect(success).toBe(true);
      expect(memoryService.getShadow()).toHaveLength(0);
    });

    it('returns false if node not found', () => {
      const success = memoryService.deleteNode('non-existent', 'archive');
      expect(success).toBe(false);
    });
  });
});
