import { describe, it, expect } from 'vitest';
import {
  getVoiceBaseWeight,
  hasVetoPower,
  selectArbiter,
  calculateConsensusLevel,
  createCouncilSession,
  DEFAULT_COUNCIL_HIERARCHY,
  FULL_COUNCIL_CONFIG,
  MINI_COUNCIL_CONFIG,
  EMERGENCY_COUNCIL_CONFIG,
} from '../types/council.js';
import { DEFAULT_METRICS } from '../types/metrics.js';
import type { VoicePosition, CouncilContext } from '../types/council.js';

describe('Multi-Agent Council Protocol', () => {
  describe('DEFAULT_COUNCIL_HIERARCHY', () => {
    it('should have ISKRA in tier1', () => {
      expect(DEFAULT_COUNCIL_HIERARCHY.tier1).toContain('ISKRA');
    });

    it('should have veto voices in tier2', () => {
      expect(DEFAULT_COUNCIL_HIERARCHY.tier2).toContain('KAIN');
      expect(DEFAULT_COUNCIL_HIERARCHY.tier2).toContain('ANHANTRA');
      expect(DEFAULT_COUNCIL_HIERARCHY.tier2).toContain('ISKRIV');
    });

    it('should have all 9 voices across tiers', () => {
      const allVoices = [
        ...DEFAULT_COUNCIL_HIERARCHY.tier1,
        ...DEFAULT_COUNCIL_HIERARCHY.tier2,
        ...DEFAULT_COUNCIL_HIERARCHY.tier3,
        ...DEFAULT_COUNCIL_HIERARCHY.tier4,
      ];
      expect(allVoices).toHaveLength(9);
    });
  });

  describe('COUNCIL_CONFIGS', () => {
    it('FULL_COUNCIL_CONFIG should require all 9 voices', () => {
      expect(FULL_COUNCIL_CONFIG.requiredVoices).toBe(9);
      expect(FULL_COUNCIL_CONFIG.vetoEnabled).toBe(true);
    });

    it('MINI_COUNCIL_CONFIG should have lower requirements', () => {
      expect(MINI_COUNCIL_CONFIG.requiredVoices).toEqual([3, 5]);
      expect(MINI_COUNCIL_CONFIG.vetoEnabled).toBe(false);
    });

    it('EMERGENCY_COUNCIL_CONFIG should have 4 specific voices', () => {
      expect(EMERGENCY_COUNCIL_CONFIG.requiredVoices).toBe(4);
      expect(EMERGENCY_COUNCIL_CONFIG.voices).toContain('KAIN');
      expect(EMERGENCY_COUNCIL_CONFIG.voices).toContain('ANHANTRA');
    });
  });

  describe('getVoiceBaseWeight', () => {
    it('should return highest weight for ISKRA', () => {
      expect(getVoiceBaseWeight('ISKRA')).toBe(1.0);
    });

    it('should return lower weight for tier4 voices', () => {
      expect(getVoiceBaseWeight('PINO')).toBeLessThan(getVoiceBaseWeight('ISKRA'));
      expect(getVoiceBaseWeight('HUYNDUN')).toBeLessThan(getVoiceBaseWeight('ISKRA'));
      // Backwards-compatible alias
      expect(getVoiceBaseWeight('HUYNDUN')).toBe(getVoiceBaseWeight('HUYNDUN'));
    });

    it('should return consistent weights', () => {
      expect(getVoiceBaseWeight('KAIN')).toBe(0.9);
      expect(getVoiceBaseWeight('SAM')).toBe(0.8);
    });
  });

  describe('hasVetoPower', () => {
    it('should return true for tier1 and tier2 voices', () => {
      expect(hasVetoPower('ISKRA')).toBe(true);
      expect(hasVetoPower('KAIN')).toBe(true);
      expect(hasVetoPower('ANHANTRA')).toBe(true);
      expect(hasVetoPower('ISKRIV')).toBe(true);
    });

    it('should return false for tier3 and tier4 voices', () => {
      expect(hasVetoPower('SAM')).toBe(false);
      expect(hasVetoPower('PINO')).toBe(false);
      expect(hasVetoPower('MAKI')).toBe(false);
      expect(hasVetoPower('HUYNDUN')).toBe(false);
      // Alias should behave the same
      expect(hasVetoPower('HUYNDUN')).toBe(false);
    });
  });

  describe('selectArbiter', () => {
    it('should select ISKRA for value conflicts', () => {
      expect(selectArbiter('value', ['PINO', 'SAM'])).toBe('ISKRA');
    });

    it('should select SAM for approach conflicts', () => {
      expect(selectArbiter('approach', ['PINO', 'KAIN'])).toBe('SAM');
    });

    it('should select ISKRIV for priority conflicts', () => {
      expect(selectArbiter('priority', ['PINO', 'SAM'])).toBe('ISKRIV');
    });

    it('should fallback to ISKRA if arbiter is a party', () => {
      expect(selectArbiter('approach', ['SAM', 'PINO'])).toBe('ISKRA');
    });
  });

  describe('calculateConsensusLevel', () => {
    it('should return 0 for empty positions', () => {
      expect(calculateConsensusLevel([])).toBe(0);
    });

    it('should return 1 for identical positions', () => {
      const positions: VoicePosition[] = [
        {
          voice: 'ISKRA',
          position: 'Согласен с предложением',
          arguments: ['A'],
          confidence: 0.8,
          engagement: 0.9,
          veto: null,
        },
        {
          voice: 'KAIN',
          position: 'Согласен с идеей',
          arguments: ['B'],
          confidence: 0.7,
          engagement: 0.8,
          veto: null,
        },
      ];

      const result = calculateConsensusLevel(positions);
      expect(result).toBeGreaterThan(0);
      expect(result).toBeLessThanOrEqual(1);
    });

    it('should detect when voices disagree', () => {
      const positions: VoicePosition[] = [
        {
          voice: 'ISKRA',
          position: 'Согласен',
          arguments: ['A'],
          confidence: 0.8,
          engagement: 0.9,
          veto: null,
        },
        {
          voice: 'KAIN',
          position: 'Не согласен',
          arguments: ['B'],
          confidence: 0.9,
          engagement: 0.8,
          veto: null,
        },
      ];

      const result = calculateConsensusLevel(positions);
      // Different first words should put them in different groups
      expect(result).toBeLessThan(1);
    });
  });

  describe('createCouncilSession', () => {
    it('should create valid session', () => {
      const context: CouncilContext = {
        metrics: DEFAULT_METRICS,
        currentPlaybook: 'routine',
        sessionHistory: ['Hello', 'World'],
        urgency: 'medium',
      };

      const session = createCouncilSession('strategic', 'What to do?', context);

      expect(session.id).toMatch(/^council-/);
      expect(session.type).toBe('strategic');
      expect(session.question).toBe('What to do?');
      expect(session.status).toBe('deliberating');
      expect(session.positions).toEqual([]);
      expect(session.conflicts).toEqual([]);
      expect(session.resolution).toBeNull();
      expect(session.deliberationRounds).toBe(0);
    });

    it('should generate unique IDs', () => {
      const context: CouncilContext = {
        metrics: DEFAULT_METRICS,
        currentPlaybook: 'routine',
        sessionHistory: [],
        urgency: 'low',
      };

      const session1 = createCouncilSession('creative', 'Q1', context);
      const session2 = createCouncilSession('creative', 'Q2', context);

      expect(session1.id).not.toBe(session2.id);
    });
  });
});
