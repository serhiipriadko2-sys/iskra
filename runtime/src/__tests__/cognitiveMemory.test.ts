/**
 * Tests for Cognitive Memory Types
 * @module @iskra/runtime/cognitiveMemory.test
 */

import { describe, it, expect } from 'vitest';
import {
  createDefaultEmotionalState,
  createEpisodicEvent,
  createSemanticConcept,
  createProceduralSkill,
  createEmptyCognitiveMemoryState,
  calculateSignificance,
  type EpisodicEvent,
  type SemanticConcept,
  type ProceduralSkill,
  type CognitiveMemoryState,
  type ActionStep,
} from '../index.js';

describe('Cognitive Memory Types', () => {
  describe('createDefaultEmotionalState', () => {
    it('should create neutral emotional state', () => {
      const state = createDefaultEmotionalState();

      expect(state.primary).toBe('neutral');
      expect(state.intensity).toBe(0.5);
      expect(state.valence).toBe(0);
      expect(state.arousal).toBe(0.5);
    });
  });

  describe('createEpisodicEvent', () => {
    it('should create event with required fields', () => {
      const event = createEpisodicEvent('User shared a personal story');

      expect(event.id).toMatch(/^ep_\d+_[a-z0-9]+$/);
      expect(event.content).toBe('User shared a personal story');
      expect(event.timestamp).toBeDefined();
      expect(event.recallCount).toBe(0);
      expect(event.significance).toBe(0.5);
      expect(event.participants).toEqual(['user', 'iskra']);
    });

    it('should create event with custom options', () => {
      const emotionalContext = {
        primary: 'joy' as const,
        intensity: 0.8,
        valence: 0.7,
        arousal: 0.6,
      };

      const event = createEpisodicEvent('Birthday celebration', {
        emotionalContext,
        significance: 0.9,
        tags: ['celebration', 'personal'],
        participants: ['user', 'iskra', 'MAKI'],
        outcome: 'Positive connection established',
      });

      expect(event.emotionalContext.primary).toBe('joy');
      expect(event.emotionalContext.intensity).toBe(0.8);
      expect(event.significance).toBe(0.9);
      expect(event.tags).toContain('celebration');
      expect(event.participants).toContain('MAKI');
      expect(event.outcome).toBe('Positive connection established');
    });

    it('should generate unique IDs', () => {
      const event1 = createEpisodicEvent('Event 1');
      const event2 = createEpisodicEvent('Event 2');

      expect(event1.id).not.toBe(event2.id);
    });
  });

  describe('createSemanticConcept', () => {
    it('should create concept with required fields', () => {
      const concept = createSemanticConcept(
        'Telos',
        'The ultimate purpose or aim'
      );

      expect(concept.id).toMatch(/^sem_\d+_[a-z0-9]+$/);
      expect(concept.name).toBe('Telos');
      expect(concept.definition).toBe('The ultimate purpose or aim');
      expect(concept.siftVerified).toBe(false);
      expect(concept.sourcePriority).toBe('C');
      expect(concept.confidence).toBe(0.5);
    });

    it('should create verified concept', () => {
      const concept = createSemanticConcept('Canon', 'Source of truth', {
        siftVerified: true,
        sourcePriority: 'A',
        confidence: 0.95,
        domainTags: ['core', 'philosophy'],
      });

      expect(concept.siftVerified).toBe(true);
      expect(concept.sourcePriority).toBe('A');
      expect(concept.confidence).toBe(0.95);
      expect(concept.domainTags).toContain('core');
    });

    it('should set timestamps', () => {
      const concept = createSemanticConcept('Test', 'Test definition');

      expect(concept.createdAt).toBeDefined();
      expect(concept.updatedAt).toBeDefined();
      expect(concept.createdAt).toBe(concept.updatedAt);
    });
  });

  describe('createProceduralSkill', () => {
    const sampleSteps: ActionStep[] = [
      { order: 1, description: 'Acknowledge user input', type: 'speech' },
      { order: 2, description: 'Analyze emotional content', type: 'query' },
      { order: 3, description: 'Generate empathetic response', type: 'speech' },
    ];

    it('should create skill with required fields', () => {
      const skill = createProceduralSkill(
        'Empathetic Response',
        'Respond with empathy to emotional content',
        sampleSteps
      );

      expect(skill.id).toMatch(/^proc_\d+_[a-z0-9]+$/);
      expect(skill.name).toBe('Empathetic Response');
      expect(skill.steps).toHaveLength(3);
      expect(skill.successRate).toBe(0.5);
      expect(skill.executionCount).toBe(0);
      expect(skill.isActive).toBe(true);
      expect(skill.category).toBe('response');
    });

    it('should create skill with custom options', () => {
      const skill = createProceduralSkill(
        'SIFT Verification',
        'Verify claims using SIFT protocol',
        sampleSteps,
        {
          category: 'verification',
          preferredVoices: ['SAM', 'ISKRIV'],
          triggerConditions: [
            { type: 'keyword', condition: 'verify', weight: 1.0 },
          ],
        }
      );

      expect(skill.category).toBe('verification');
      expect(skill.preferredVoices).toContain('SAM');
      expect(skill.triggerConditions).toHaveLength(1);
    });
  });

  describe('createEmptyCognitiveMemoryState', () => {
    it('should create empty state with all stores', () => {
      const state = createEmptyCognitiveMemoryState();

      expect(state.episodic.events).toHaveLength(0);
      expect(state.semantic.concepts).toHaveLength(0);
      expect(state.procedural.skills).toHaveLength(0);
      expect(state.associativeLinks).toHaveLength(0);
    });

    it('should have default configuration', () => {
      const state = createEmptyCognitiveMemoryState();

      expect(state.episodic.config.maxEpisodes).toBe(10000);
      expect(state.episodic.config.significanceThreshold).toBe(0.3);
      expect(state.semantic.config.minConfidence).toBe(0.7);
      expect(state.procedural.config.minSuccessRate).toBe(0.5);
    });

    it('should have initialized stats', () => {
      const state = createEmptyCognitiveMemoryState();

      expect(state.stats.totalEpisodes).toBe(0);
      expect(state.stats.totalConcepts).toBe(0);
      expect(state.stats.totalSkills).toBe(0);
      expect(state.stats.lastConsolidation).toBeDefined();
    });
  });

  describe('calculateSignificance', () => {
    it('should calculate low significance for calm events', () => {
      const significance = calculateSignificance(0.2, 2, false);

      expect(significance).toBeLessThan(0.4);
    });

    it('should calculate high significance for emotional events with outcome', () => {
      const significance = calculateSignificance(0.9, 4, true);

      expect(significance).toBeGreaterThan(0.7);
    });

    it('should cap significance at 1.0', () => {
      const significance = calculateSignificance(1.0, 10, true);

      expect(significance).toBeLessThanOrEqual(1.0);
    });

    it('should weight factors correctly', () => {
      // Emotion weighted at 0.4
      const emotionOnly = calculateSignificance(1.0, 1, false);
      // Participants weighted at 0.3
      const participantsOnly = calculateSignificance(0, 5, false);
      // Outcome weighted at 0.3
      const outcomeOnly = calculateSignificance(0, 1, true);

      expect(emotionOnly).toBeCloseTo(0.46, 1);
      expect(participantsOnly).toBeCloseTo(0.3, 1);
      expect(outcomeOnly).toBeCloseTo(0.36, 1);
    });
  });

  describe('Type integrity', () => {
    it('should maintain episodic event structure', () => {
      const event: EpisodicEvent = {
        id: 'test',
        timestamp: new Date().toISOString(),
        content: 'Test content',
        summary: 'Test',
        emotionalContext: createDefaultEmotionalState(),
        participants: ['user'],
        significance: 0.5,
        recallCount: 0,
        tags: [],
      };

      expect(event.id).toBeDefined();
    });

    it('should maintain semantic concept structure', () => {
      const concept: SemanticConcept = {
        id: 'test',
        name: 'Test',
        definition: 'Test definition',
        siftVerified: false,
        sourcePriority: 'C',
        relatedConcepts: [],
        domainTags: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        confidence: 0.5,
      };

      expect(concept.id).toBeDefined();
    });

    it('should maintain procedural skill structure', () => {
      const skill: ProceduralSkill = {
        id: 'test',
        name: 'Test',
        description: 'Test skill',
        steps: [],
        triggerConditions: [],
        successRate: 0.5,
        executionCount: 0,
        createdAt: new Date().toISOString(),
        adaptations: [],
        preferredVoices: [],
        category: 'response',
        isActive: true,
      };

      expect(skill.id).toBeDefined();
    });

    it('should maintain cognitive memory state structure', () => {
      const state: CognitiveMemoryState = createEmptyCognitiveMemoryState();

      expect(state.episodic).toBeDefined();
      expect(state.semantic).toBeDefined();
      expect(state.procedural).toBeDefined();
      expect(state.associativeLinks).toBeDefined();
      expect(state.stats).toBeDefined();
    });
  });
});
