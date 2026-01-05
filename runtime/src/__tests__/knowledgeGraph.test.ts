/**
 * Knowledge Graph Types Tests
 * Tests for IskraKnowledgeGraph and related types
 */

import { describe, it, expect } from 'vitest';
import {
  createEmptyGraph,
  createEntity,
  createRelation,
  calculateHopConfidenceDecay,
  getSourcePriorityRank,
  isHigherPriority,
  calculateGraphDensity,
  getEntityVoiceAffinity,
  type KnowledgeEntity,
  type SemanticRelation,
  type IskraKnowledgeGraph,
} from '../types/knowledgeGraph.js';

describe('Knowledge Graph Types', () => {
  describe('createEmptyGraph', () => {
    it('should create an empty graph with default structure', () => {
      const graph = createEmptyGraph();

      expect(graph.version).toBe('1.0.0');
      expect(graph.entities).toEqual([]);
      expect(graph.concepts).toEqual([]);
      expect(graph.events).toEqual([]);
      expect(graph.patterns).toEqual([]);
      expect(graph.relations).toEqual([]);
      expect(graph.topicClusters).toEqual([]);
    });

    it('should have zero statistics', () => {
      const graph = createEmptyGraph();

      expect(graph.stats.nodeCount).toBe(0);
      expect(graph.stats.edgeCount).toBe(0);
      expect(graph.stats.avgDegree).toBe(0);
      expect(graph.stats.density).toBe(0);
    });

    it('should have empty verification stats', () => {
      const graph = createEmptyGraph();

      expect(graph.stats.verification.siftVerifiedCount).toBe(0);
      expect(graph.stats.verification.unverifiedCount).toBe(0);
      expect(graph.stats.verification.verificationRate).toBe(0);
    });
  });

  describe('createEntity', () => {
    it('should create an entity with required fields', () => {
      const entity = createEntity('Test Concept', 'concept', 'A_CANON');

      expect(entity.name).toBe('Test Concept');
      expect(entity.type).toBe('concept');
      expect(entity.sourcePriority).toBe('A_CANON');
      expect(entity.siftVerified).toBe(false);
      expect(entity.tags).toEqual([]);
    });

    it('should generate unique id', () => {
      const entity1 = createEntity('Entity 1', 'concept', 'A_CANON');
      const entity2 = createEntity('Entity 2', 'concept', 'A_CANON');

      expect(entity1.id).not.toBe(entity2.id);
      expect(entity1.id).toMatch(/^entity-\d+-[a-z0-9]+$/);
    });

    it('should include custom attributes', () => {
      const entity = createEntity('Test', 'event', 'B_PROJECT', {
        customField: 'value',
        number: 42,
      });

      expect(entity.attributes.customField).toBe('value');
      expect(entity.attributes.number).toBe(42);
    });

    it('should set creation timestamps', () => {
      const before = new Date().toISOString();
      const entity = createEntity('Test', 'concept', 'A_CANON');
      const after = new Date().toISOString();

      expect(entity.createdAt >= before).toBe(true);
      expect(entity.createdAt <= after).toBe(true);
      expect(entity.updatedAt).toBe(entity.createdAt);
    });
  });

  describe('createRelation', () => {
    it('should create a relation with default values', () => {
      const relation = createRelation('entity1', 'entity2', 'is_a');

      expect(relation.from).toBe('entity1');
      expect(relation.to).toBe('entity2');
      expect(relation.type).toBe('is_a');
      expect(relation.strength).toBe(0.5);
      expect(relation.confidence).toBe(0.5);
    });

    it('should accept custom strength', () => {
      const relation = createRelation('a', 'b', 'causes', 0.9);

      expect(relation.strength).toBe(0.9);
    });

    it('should set bidirectional based on type', () => {
      const related = createRelation('a', 'b', 'related_to');
      const associated = createRelation('a', 'b', 'associated_with');
      const causes = createRelation('a', 'b', 'causes');

      expect(related.bidirectional).toBe(true);
      expect(associated.bidirectional).toBe(true);
      expect(causes.bidirectional).toBe(false);
    });

    it('should generate unique id', () => {
      const rel1 = createRelation('a', 'b', 'is_a');
      const rel2 = createRelation('a', 'b', 'is_a');

      expect(rel1.id).not.toBe(rel2.id);
      expect(rel1.id).toMatch(/^rel-\d+-[a-z0-9]+$/);
    });
  });

  describe('calculateHopConfidenceDecay', () => {
    it('should return full confidence for 0 hops', () => {
      const confidence = calculateHopConfidenceDecay(0.9, 0);

      expect(confidence).toBe(0.9);
    });

    it('should decay confidence with more hops', () => {
      const conf0 = calculateHopConfidenceDecay(1.0, 0);
      const conf1 = calculateHopConfidenceDecay(1.0, 1);
      const conf2 = calculateHopConfidenceDecay(1.0, 2);
      const conf3 = calculateHopConfidenceDecay(1.0, 3);

      expect(conf0).toBeGreaterThan(conf1);
      expect(conf1).toBeGreaterThan(conf2);
      expect(conf2).toBeGreaterThan(conf3);
    });

    it('should use default decay rate of 0.15', () => {
      const confidence = calculateHopConfidenceDecay(1.0, 1);

      expect(confidence).toBeCloseTo(0.85, 2);
    });

    it('should use custom decay rate', () => {
      const confidence = calculateHopConfidenceDecay(1.0, 1, 0.25);

      expect(confidence).toBeCloseTo(0.75, 2);
    });

    it('should approach zero for many hops', () => {
      const confidence = calculateHopConfidenceDecay(1.0, 20);

      expect(confidence).toBeLessThan(0.1);
    });
  });

  describe('getSourcePriorityRank', () => {
    it('should return correct ranks', () => {
      expect(getSourcePriorityRank('A_CANON')).toBe(1);
      expect(getSourcePriorityRank('B_PROJECT')).toBe(2);
      expect(getSourcePriorityRank('C_COMPANY')).toBe(3);
      expect(getSourcePriorityRank('D_WEB')).toBe(4);
    });
  });

  describe('isHigherPriority', () => {
    it('should return true for higher priority', () => {
      expect(isHigherPriority('A_CANON', 'B_PROJECT')).toBe(true);
      expect(isHigherPriority('A_CANON', 'D_WEB')).toBe(true);
      expect(isHigherPriority('B_PROJECT', 'C_COMPANY')).toBe(true);
    });

    it('should return false for lower or equal priority', () => {
      expect(isHigherPriority('D_WEB', 'A_CANON')).toBe(false);
      expect(isHigherPriority('A_CANON', 'A_CANON')).toBe(false);
      expect(isHigherPriority('B_PROJECT', 'A_CANON')).toBe(false);
    });
  });

  describe('calculateGraphDensity', () => {
    it('should return 0 for 0 or 1 nodes', () => {
      expect(calculateGraphDensity(0, 0)).toBe(0);
      expect(calculateGraphDensity(1, 0)).toBe(0);
    });

    it('should calculate density correctly', () => {
      // 3 nodes can have max 3 edges (3*2/2)
      expect(calculateGraphDensity(3, 3)).toBe(1.0);
      expect(calculateGraphDensity(3, 0)).toBe(0);
      expect(calculateGraphDensity(3, 1)).toBeCloseTo(0.333, 2);
    });

    it('should return 1 for fully connected graph', () => {
      // 4 nodes: max edges = 4*3/2 = 6
      expect(calculateGraphDensity(4, 6)).toBe(1.0);
    });
  });

  describe('getEntityVoiceAffinity', () => {
    it('should return 0 for entity without voice affinity', () => {
      const entity = createEntity('Test', 'concept', 'A_CANON');

      expect(getEntityVoiceAffinity(entity, 'KAIN')).toBe(0);
      expect(getEntityVoiceAffinity(entity, 'ISKRA')).toBe(0);
    });

    it('should return correct affinity when set', () => {
      const entity = createEntity('Test', 'concept', 'A_CANON');
      entity.voiceAffinity = {
        KAIN: 0.8,
        ANHANTRA: 0.6,
      };

      expect(getEntityVoiceAffinity(entity, 'KAIN')).toBe(0.8);
      expect(getEntityVoiceAffinity(entity, 'ANHANTRA')).toBe(0.6);
      expect(getEntityVoiceAffinity(entity, 'ISKRA')).toBe(0);
    });
  });
});
