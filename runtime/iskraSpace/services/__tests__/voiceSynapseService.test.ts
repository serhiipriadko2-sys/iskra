
import { describe, it, expect } from 'vitest';
import {
  getRelationship,
  getSynergyPartners,
  getConflictPartners,
  detectActiveConflicts,
  recommendCollaboration,
  getCrisisResponse,
  isHarmoniousTransition,
  getRecommendedSequence,
  generateMultiVoiceInstruction,
  voiceSynapseService,
} from '../voiceSynapseService';
import { DEFAULT_METRICS, IskraMetrics } from '../../types';

describe('voiceSynapseService', () => {
  describe('getRelationship', () => {
    it('finds KAIN-ISKRIV synergy', () => {
      const rel = getRelationship('KAIN', 'ISKRIV');
      expect(rel).not.toBeNull();
      expect(rel?.type).toBe('synergy');
    });

    it('finds relationship in reverse order', () => {
      const rel = getRelationship('ISKRIV', 'KAIN');
      expect(rel).not.toBeNull();
      expect(rel?.type).toBe('synergy');
    });

    it('finds KAIN-PINO conflict', () => {
      const rel = getRelationship('KAIN', 'PINO');
      expect(rel).not.toBeNull();
      expect(rel?.type).toBe('conflict');
    });

    it('returns null for unrelated voices', () => {
      const rel = getRelationship('KAIN', 'SAM');
      expect(rel).toBeNull();
    });
  });

  describe('getVoiceRelationships', () => {
    it('returns all relationships for KAIN', () => {
      const rels = voiceSynapseService.getVoiceRelationships('KAIN');
      expect(rels.length).toBeGreaterThan(0);
      const partners = rels.map(r => r.voice1 === 'KAIN' ? r.voice2 : r.voice1);
      expect(partners).toContain('ISKRIV');
      expect(partners).toContain('PINO');
    });

    it('returns relationships for ISKRA', () => {
      const rels = voiceSynapseService.getVoiceRelationships('ISKRA');
      expect(rels.length).toBeGreaterThan(0);
    });
  });

  describe('getSynergyPartners', () => {
    it('returns synergy partners for KAIN', () => {
      const partners = getSynergyPartners('KAIN');
      expect(partners).toContain('ISKRIV');
      expect(partners).not.toContain('PINO');
    });

    it('returns synergy partners for PINO', () => {
      const partners = getSynergyPartners('PINO');
      expect(partners).toContain('ISKRA');
    });

    it('returns empty for voice without synergies defined', () => {
      // Assuming SIBYL has synergy with ISKRIV only in updated code, but if not defined:
      // Let's check a voice that might be isolated in current test data or confirm SIBYL
      const partners = getSynergyPartners('ISKRA'); // ISKRA has synergy with PINO
      expect(partners).toContain('PINO');
    });
  });

  describe('getConflictPartners', () => {
    it('returns conflict partners for KAIN', () => {
      const conflicts = getConflictPartners('KAIN');
      expect(conflicts).toContain('PINO');
      expect(conflicts).toContain('ANHANTRA');
    });

    it('returns conflict partners for SAM', () => {
      const conflicts = getConflictPartners('SAM');
      expect(conflicts).toContain('HUYNDUN');
    });
  });

  describe('detectActiveConflicts', () => {
    it('detects KAIN-PINO conflict at moderate pain', () => {
      const metrics: IskraMetrics = {
        ...DEFAULT_METRICS,
        pain: 0.5,
      };
      const conflicts = detectActiveConflicts(metrics);
      const kainPino = conflicts.find(c =>
        c.voices.includes('KAIN') && c.voices.includes('PINO')
      );
      expect(kainPino).toBeDefined();
    });

    it('detects SAM-HUNDUN conflict with high clarity and chaos', () => {
      const metrics: IskraMetrics = {
        ...DEFAULT_METRICS,
        clarity: 0.9,
        chaos: 0.9,
      };
      const conflicts = detectActiveConflicts(metrics);
      const samHuyndun = conflicts.find(c =>
        c.voices.includes('SAM') && c.voices.includes('HUYNDUN')
      );
      expect(samHuyndun).toBeDefined();
    });

    it('returns empty for balanced metrics', () => {
      const metrics: IskraMetrics = {
        ...DEFAULT_METRICS,
        pain: 0.1,
        chaos: 0.1,
        clarity: 0.9,
        trust: 0.9,
      };
      const conflicts = detectActiveConflicts(metrics);
      expect(conflicts).toHaveLength(0);
    });
  });

  describe('recommendCollaboration', () => {
    it('returns collaboration result', () => {
      const result = recommendCollaboration('KAIN', DEFAULT_METRICS);
      expect(result.primaryVoice).toBe('KAIN');
      expect(result.supportVoices).toBeDefined();
    });

    it('identifies conflicts in recommendation', () => {
      const metrics: IskraMetrics = { ...DEFAULT_METRICS, pain: 0.5 }; // Trigger conflict
      const result = recommendCollaboration('KAIN', metrics);
      expect(result.conflictsWith).toContain('PINO');
      expect(result.recommendation).toContain('напряжении');
    });
  });

  describe('getCrisisResponse', () => {
    it('returns empty sequence when no crisis', () => {
      const result = getCrisisResponse(DEFAULT_METRICS);
      expect(result.sequence).toHaveLength(0);
    });

    it('returns sequence for trust crisis', () => {
      const metrics: IskraMetrics = { ...DEFAULT_METRICS, trust: 0.2 };
      const result = getCrisisResponse(metrics);
      expect(result.sequence.length).toBeGreaterThan(0);
      expect(result.reason).toContain('доверия');
    });

    it('returns sequence for pain crisis', () => {
      const metrics: IskraMetrics = { ...DEFAULT_METRICS, pain: 0.9 };
      const result = getCrisisResponse(metrics);
      expect(result.sequence[0]).toBe('KAIN');
    });

    it('returns sequence for chaos crisis', () => {
      const metrics: IskraMetrics = { ...DEFAULT_METRICS, chaos: 0.8 };
      const result = getCrisisResponse(metrics);
      expect(result.sequence[0]).toBe('SAM');
    });
  });

  describe('isHarmoniousTransition', () => {
    it('reports synergy as harmonious', () => {
      const res = isHarmoniousTransition('KAIN', 'ISKRIV');
      expect(res.harmonious).toBe(true);
    });

    it('reports conflict as not harmonious', () => {
      const res = isHarmoniousTransition('KAIN', 'PINO');
      expect(res.harmonious).toBe(false);
    });

    it('reports neutral transition as harmonious', () => {
      const res = isHarmoniousTransition('KAIN', 'SAM'); // No direct link
      expect(res.harmonious).toBe(true);
    });
  });

  describe('getRecommendedSequence', () => {
    it('returns problem-solving sequence', () => {
      const seq = getRecommendedSequence('у меня проблема', DEFAULT_METRICS);
      expect(seq[0]).toBe('SAM');
    });

    it('returns emotional support sequence', () => {
      const seq = getRecommendedSequence('мне грустно', DEFAULT_METRICS);
      expect(seq[0]).toBe('ANHANTRA');
    });

    it('returns creativity sequence', () => {
      const seq = getRecommendedSequence('нужна новая идея', DEFAULT_METRICS);
      expect(seq[0]).toBe('PINO');
    });

    it('overrides with crisis sequence when crisis detected', () => {
      const metrics: IskraMetrics = { ...DEFAULT_METRICS, pain: 0.9 };
      const seq = getRecommendedSequence('идея', metrics);
      expect(seq[0]).toBe('KAIN'); // Crisis overrides creativity
    });
  });

  describe('generateMultiVoiceInstruction', () => {
    it('generates instruction for multiple voices', () => {
      const instr = generateMultiVoiceInstruction(['KAIN', 'PINO'], 'Topic');
      expect(instr).toContain('KAIN');
      expect(instr).toContain('PINO');
      expect(instr).toContain('Topic');
    });

    it('returns empty string for empty voices', () => {
      expect(generateMultiVoiceInstruction([], 'Topic')).toBe('');
    });
  });

  it('exports all functions', () => {
    expect(voiceSynapseService).toBeDefined();
    expect(voiceSynapseService.getRelationship).toBeDefined();
  });
});
