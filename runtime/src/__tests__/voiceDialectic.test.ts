/**
 * Tests for Voice Dialectic Types
 * @module @iskra/runtime/voiceDialectic.test
 */

import { describe, it, expect } from 'vitest';
import {
  createDefaultDialecticConfig,
  createDialecticSession,
  createDialecticVoicePosition,
  createDialecticTurn,
  createDialecticSynthesis,
  calculateDialecticConsensus,
  selectDialecticArbiter,
  shouldEscalate,
  canResolve,
  assessDialecticQuality,
  DEFAULT_SELECTION_CRITERIA,
  DEFAULT_METRICS,
  type DialecticSession,
  type DialecticVoicePosition,
  type DialecticTurn,
  type DialecticSynthesis,
  type DialecticConfig,
} from '../index.js';

describe('Voice Dialectic Types', () => {
  describe('createDefaultDialecticConfig', () => {
    it('should create config with sensible defaults', () => {
      const config = createDefaultDialecticConfig();

      expect(config.maxTurns).toBe(12);
      expect(config.minConsensusForResolution).toBe(0.6);
      expect(config.allowDeadlock).toBe(true);
      expect(config.turnTimeoutMs).toBe(30000);
      expect(config.recordTranscript).toBe(true);
      expect(config.requireActionItems).toBe(false);
    });
  });

  describe('createDialecticSession', () => {
    it('should create session with required fields', () => {
      const session = createDialecticSession(
        'Should we use SIFT for all claims?',
        'User making many unverified assertions'
      );

      expect(session.id).toMatch(/^dial_\d+_[a-z0-9]+$/);
      expect(session.question).toBe('Should we use SIFT for all claims?');
      expect(session.context).toBe('User making many unverified assertions');
      expect(session.status).toBe('initiating');
      expect(session.participants).toHaveLength(0);
      expect(session.transcript).toHaveLength(0);
    });

    it('should merge custom config', () => {
      const session = createDialecticSession(
        'Test question',
        'Test context',
        { maxTurns: 6, requireActionItems: true }
      );

      expect(session.config.maxTurns).toBe(6);
      expect(session.config.requireActionItems).toBe(true);
      expect(session.config.recordTranscript).toBe(true); // Default preserved
    });

    it('should generate unique IDs', () => {
      const session1 = createDialecticSession('Q1', 'C1');
      const session2 = createDialecticSession('Q2', 'C2');

      expect(session1.id).not.toBe(session2.id);
    });
  });

  describe('createDialecticVoicePosition', () => {
    it('should create position with required fields', () => {
      const position = createDialecticVoicePosition(
        'SAM',
        'We should implement systematic verification',
        'Structure ensures reliability and reduces errors'
      );

      expect(position.voice).toBe('SAM');
      expect(position.position).toBe('We should implement systematic verification');
      expect(position.reasoning).toBe('Structure ensures reliability and reduces errors');
      expect(position.confidence).toBe(0.7);
    });

    it('should not include optional fields when not provided', () => {
      const position = createDialecticVoicePosition(
        'KAIN',
        'Truth must be confronted',
        'Avoidance leads to greater harm'
      );

      expect(position.evidence).toBeUndefined();
      expect(position.assumptions).toBeUndefined();
      expect(position.weaknesses).toBeUndefined();
    });

    it('should include optional fields when provided', () => {
      const position = createDialecticVoicePosition(
        'ISKRIV',
        'We are drifting from the original goal',
        'Context analysis shows increasing deviation',
        {
          confidence: 0.85,
          evidence: ['Drift metric at 0.4', 'User feedback indicates confusion'],
          assumptions: ['User values original goal'],
          weaknesses: ['May be temporary'],
        }
      );

      expect(position.confidence).toBe(0.85);
      expect(position.evidence).toHaveLength(2);
      expect(position.assumptions).toHaveLength(1);
      expect(position.weaknesses).toHaveLength(1);
    });
  });

  describe('createDialecticTurn', () => {
    it('should create turn with required fields', () => {
      const turn = createDialecticTurn(
        1,
        'SAM',
        'opening',
        'I propose we implement a structured verification protocol.'
      );

      expect(turn.order).toBe(1);
      expect(turn.speaker).toBe('SAM');
      expect(turn.type).toBe('opening');
      expect(turn.content).toContain('structured verification');
      expect(turn.timestamp).toBeDefined();
    });

    it('should support all turn types', () => {
      const turnTypes: DialecticTurn['type'][] = [
        'opening', 'response', 'question', 'concession',
        'objection', 'evidence', 'synthesis', 'meta'
      ];

      turnTypes.forEach((type, index) => {
        const turn = createDialecticTurn(index + 1, 'ISKRA', type, `Content for ${type}`);
        expect(turn.type).toBe(type);
      });
    });

    it('should include optional fields when provided', () => {
      const turn = createDialecticTurn(
        3,
        'KAIN',
        'concession',
        'I acknowledge the need for structure.',
        { supportsPosition: 'thesis', strength: 0.6 }
      );

      expect(turn.supportsPosition).toBe('thesis');
      expect(turn.strength).toBe(0.6);
    });
  });

  describe('createDialecticSynthesis', () => {
    it('should create synthesis with required fields', () => {
      const synthesis = createDialecticSynthesis(
        'ISKRA',
        'We will use graduated verification based on claim importance'
      );

      expect(synthesis.facilitator).toBe('ISKRA');
      expect(synthesis.resolution).toContain('graduated verification');
      expect(synthesis.consensusLevel).toBe(0.7);
      expect(synthesis.qualityScore).toBe(0.7);
    });

    it('should include elements from both sides', () => {
      const synthesis = createDialecticSynthesis(
        'ISKRA',
        'Balanced approach',
        {
          fromThesis: ['Systematic approach', 'Clear criteria'],
          fromAntithesis: ['Flexibility', 'Context awareness'],
          novelElements: ['Dynamic thresholds'],
          consensusLevel: 0.85,
        }
      );

      expect(synthesis.fromThesis).toContain('Systematic approach');
      expect(synthesis.fromAntithesis).toContain('Flexibility');
      expect(synthesis.novelElements).toContain('Dynamic thresholds');
      expect(synthesis.consensusLevel).toBe(0.85);
    });

    it('should include action items when provided', () => {
      const synthesis = createDialecticSynthesis(
        'SAM',
        'Implement verification protocol',
        {
          actionItems: [
            'Define claim categories',
            'Set verification thresholds',
            'Create bypass criteria'
          ]
        }
      );

      expect(synthesis.actionItems).toHaveLength(3);
    });
  });

  describe('calculateDialecticConsensus', () => {
    const thesis = createDialecticVoicePosition('SAM', 'Thesis', 'Reasoning', { confidence: 0.8 });
    const antithesis = createDialecticVoicePosition('KAIN', 'Antithesis', 'Reasoning', { confidence: 0.7 });

    it('should start with average confidence', () => {
      const consensus = calculateDialecticConsensus(thesis, antithesis, []);

      // Base is (0.8 + 0.7) / 2 = 0.75
      expect(consensus).toBeCloseTo(0.75, 1);
    });

    it('should increase with concessions', () => {
      const withConcessions: DialecticTurn[] = [
        createDialecticTurn(1, 'SAM', 'concession', 'Valid point'),
        createDialecticTurn(2, 'KAIN', 'concession', 'Agreed'),
      ];

      const consensus = calculateDialecticConsensus(thesis, antithesis, withConcessions);

      expect(consensus).toBeGreaterThan(0.75);
    });

    it('should decrease with objections', () => {
      const withObjections: DialecticTurn[] = [
        createDialecticTurn(1, 'SAM', 'objection', 'Disagree'),
        createDialecticTurn(2, 'KAIN', 'objection', 'Reject'),
        createDialecticTurn(3, 'SAM', 'objection', 'Counter'),
        createDialecticTurn(4, 'KAIN', 'objection', 'Refute'),
      ];

      const consensus = calculateDialecticConsensus(thesis, antithesis, withObjections);

      expect(consensus).toBeLessThan(0.75);
    });

    it('should stay within 0-1 bounds', () => {
      const manyTurns: DialecticTurn[] = Array(20).fill(null).map((_, i) =>
        createDialecticTurn(i + 1, i % 2 === 0 ? 'SAM' : 'KAIN', 'concession', 'Agree')
      );

      const consensus = calculateDialecticConsensus(thesis, antithesis, manyTurns);

      expect(consensus).toBeLessThanOrEqual(1);
      expect(consensus).toBeGreaterThanOrEqual(0);
    });
  });

  describe('selectDialecticArbiter', () => {
    it('should select neutral voice not in participants', () => {
      const participants: ('SAM' | 'KAIN')[] = ['SAM', 'KAIN'];

      const arbiter = selectDialecticArbiter(participants, DEFAULT_METRICS);

      expect(arbiter).toBe('ISKRA'); // First neutral voice
      expect(participants).not.toContain(arbiter);
    });

    it('should use fallback when all neutrals are participants', () => {
      const allNeutrals: ('ISKRA' | 'ANHANTRA' | 'SAM')[] = ['ISKRA', 'ANHANTRA', 'SAM'];

      const arbiter = selectDialecticArbiter(allNeutrals, DEFAULT_METRICS);

      expect(arbiter).toBe(DEFAULT_SELECTION_CRITERIA.arbiter.fallback);
    });
  });

  describe('shouldEscalate', () => {
    it('should not escalate for new session', () => {
      const session = createDialecticSession('Question', 'Context');

      expect(shouldEscalate(session)).toBe(false);
    });

    it('should escalate when many turns without progress', () => {
      const session = createDialecticSession('Question', 'Context', { maxTurns: 10 });

      // Add 8 turns (80% of max) without concessions or synthesis
      for (let i = 0; i < 8; i++) {
        session.transcript.push(
          createDialecticTurn(i + 1, i % 2 === 0 ? 'SAM' : 'KAIN', 'objection', 'Disagree')
        );
      }

      expect(shouldEscalate(session)).toBe(true);
    });

    it('should escalate when many objections without concessions', () => {
      const session = createDialecticSession('Question', 'Context');

      // Add 6 objections, no concessions
      for (let i = 0; i < 6; i++) {
        session.transcript.push(
          createDialecticTurn(i + 1, i % 2 === 0 ? 'SAM' : 'KAIN', 'objection', 'Disagree')
        );
      }

      expect(shouldEscalate(session)).toBe(true);
    });

    it('should not escalate when there are concessions', () => {
      const session = createDialecticSession('Question', 'Context', { maxTurns: 10 });

      for (let i = 0; i < 8; i++) {
        const type = i === 7 ? 'concession' : 'objection';
        session.transcript.push(
          createDialecticTurn(i + 1, i % 2 === 0 ? 'SAM' : 'KAIN', type, 'Content')
        );
      }

      expect(shouldEscalate(session)).toBe(false);
    });
  });

  describe('canResolve', () => {
    it('should return false without thesis', () => {
      const session = createDialecticSession('Question', 'Context');

      expect(canResolve(session)).toBe(false);
    });

    it('should return false without antithesis', () => {
      const session = createDialecticSession('Question', 'Context');
      session.thesis = createDialecticVoicePosition('SAM', 'Thesis', 'Reasoning');

      expect(canResolve(session)).toBe(false);
    });

    it('should return true when consensus is sufficient', () => {
      const session = createDialecticSession('Question', 'Context', { minConsensusForResolution: 0.6 });
      session.thesis = createDialecticVoicePosition('SAM', 'Thesis', 'Reasoning', { confidence: 0.8 });
      session.antithesis = createDialecticVoicePosition('KAIN', 'Antithesis', 'Reasoning', { confidence: 0.7 });
      session.transcript = [
        createDialecticTurn(1, 'SAM', 'concession', 'Valid'),
        createDialecticTurn(2, 'KAIN', 'concession', 'Agreed'),
      ];

      expect(canResolve(session)).toBe(true);
    });
  });

  describe('assessDialecticQuality', () => {
    it('should assess completed session', () => {
      const session = createDialecticSession('Question', 'Context');
      session.thesis = createDialecticVoicePosition('SAM', 'Thesis', 'Reasoning', {
        evidence: ['Evidence 1', 'Evidence 2'],
      });
      session.antithesis = createDialecticVoicePosition('KAIN', 'Antithesis', 'Reasoning', {
        evidence: ['Counter evidence'],
      });
      session.transcript = [
        createDialecticTurn(1, 'SAM', 'opening', 'Opening'),
        createDialecticTurn(2, 'KAIN', 'response', 'Response'),
        createDialecticTurn(3, 'SAM', 'concession', 'Concession'),
        createDialecticTurn(4, 'ISKRA', 'synthesis', 'Synthesis'),
      ];
      session.synthesis = createDialecticSynthesis('ISKRA', 'Resolution', {
        qualityScore: 0.8,
        actionItems: ['Action 1', 'Action 2'],
      });

      const quality = assessDialecticQuality(session);

      expect(quality.overall).toBeGreaterThan(0);
      expect(quality.overall).toBeLessThanOrEqual(1);
      expect(quality.thesisQuality).toBeGreaterThan(0.5); // Has evidence
      expect(quality.synthesisQuality).toBe(0.8);
      expect(quality.actionability).toBeGreaterThan(0);
    });

    it('should reflect lower quality for incomplete sessions', () => {
      const session = createDialecticSession('Question', 'Context');
      session.thesis = createDialecticVoicePosition('SAM', 'Thesis', 'Reasoning');
      session.antithesis = createDialecticVoicePosition('KAIN', 'Antithesis', 'Reasoning');
      session.transcript = [
        createDialecticTurn(1, 'SAM', 'opening', 'Opening'),
      ];
      // No synthesis

      const quality = assessDialecticQuality(session);

      expect(quality.synthesisQuality).toBe(0);
      expect(quality.productivity).toBeLessThan(0.5);
    });
  });

  describe('Type integrity', () => {
    it('should maintain DialecticSession structure', () => {
      const session: DialecticSession = createDialecticSession('Q', 'C');

      expect(session.id).toBeDefined();
      expect(session.question).toBeDefined();
      expect(session.context).toBeDefined();
      expect(session.status).toBeDefined();
      expect(session.config).toBeDefined();
      expect(session.participants).toBeDefined();
      expect(session.transcript).toBeDefined();
      expect(session.alliances).toBeDefined();
      expect(session.startedAt).toBeDefined();
    });

    it('should maintain DialecticConfig structure', () => {
      const config: DialecticConfig = createDefaultDialecticConfig();

      expect(config.maxTurns).toBeDefined();
      expect(config.minConsensusForResolution).toBeDefined();
      expect(config.allowDeadlock).toBeDefined();
      expect(config.turnTimeoutMs).toBeDefined();
      expect(config.recordTranscript).toBeDefined();
      expect(config.requireActionItems).toBeDefined();
    });
  });
});
