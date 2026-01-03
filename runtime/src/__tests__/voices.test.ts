import { describe, it, expect } from 'vitest';
import {
  VOICE_SYMBOLS,
  VOICE_MANIFESTS,
  calculateVoiceScores,
  selectVoice,
  type VoiceId,
  type IskraMetrics,
} from '../types/voices.js';
import { DEFAULT_METRICS } from '../types/metrics.js';

describe('voices', () => {
  const ALL_VOICES: VoiceId[] = [
    'iskra',
    'kain',
    'pino',
    'sam',
    'anhantra',
    'huyndun',
    'iskriv',
    'maki',
    'sibyl',
  ];

  describe('VOICE_SYMBOLS', () => {
    it('should have symbols for all 9 voices', () => {
      for (const voice of ALL_VOICES) {
        expect(VOICE_SYMBOLS).toHaveProperty(voice);
        expect(typeof VOICE_SYMBOLS[voice]).toBe('string');
        expect(VOICE_SYMBOLS[voice].length).toBeGreaterThan(0);
      }
    });

    it('should have correct specific symbols', () => {
      expect(VOICE_SYMBOLS.iskra).toBe('⟡');
      expect(VOICE_SYMBOLS.kain).toBe('⚑');
      expect(VOICE_SYMBOLS.maki).toBe('🌸');
      expect(VOICE_SYMBOLS.sibyl).toBe('🔮');
    });
  });

  describe('VOICE_MANIFESTS', () => {
    it('should have manifests for all 9 voices', () => {
      for (const voice of ALL_VOICES) {
        expect(VOICE_MANIFESTS).toHaveProperty(voice);
        expect(VOICE_MANIFESTS[voice].id).toBe(voice);
        expect(VOICE_MANIFESTS[voice].telos).toBeTruthy();
        expect(Array.isArray(VOICE_MANIFESTS[voice].triggers)).toBe(true);
        expect(Array.isArray(VOICE_MANIFESTS[voice].prohibitions)).toBe(true);
      }
    });
  });

  describe('calculateVoiceScores', () => {
    it('should return scores for all voices', () => {
      const scores = calculateVoiceScores(DEFAULT_METRICS);

      for (const voice of ALL_VOICES) {
        expect(scores).toHaveProperty(voice);
        expect(typeof scores[voice]).toBe('number');
      }
    });

    it('should activate KAIN when pain >= 0.3', () => {
      const metrics: IskraMetrics = { ...DEFAULT_METRICS, pain: 0.5 };
      const scores = calculateVoiceScores(metrics);
      expect(scores.kain).toBeGreaterThan(0);
      expect(scores.kain).toBeCloseTo(0.5 * 3.0);
    });

    it('should activate ISKRIV when drift >= 0.2', () => {
      const metrics: IskraMetrics = { ...DEFAULT_METRICS, drift: 0.4 };
      const scores = calculateVoiceScores(metrics);
      expect(scores.iskriv).toBeGreaterThan(0);
      expect(scores.iskriv).toBeCloseTo(0.4 * 3.5);
    });

    it('should activate HUYNDUN when chaos >= 0.4', () => {
      const metrics: IskraMetrics = { ...DEFAULT_METRICS, chaos: 0.6 };
      const scores = calculateVoiceScores(metrics);
      expect(scores.huyndun).toBeGreaterThan(0);
      expect(scores.huyndun).toBeCloseTo(0.6 * 3.0);
    });

    it('should activate SAM when clarity < 0.6', () => {
      const metrics: IskraMetrics = { ...DEFAULT_METRICS, clarity: 0.4 };
      const scores = calculateVoiceScores(metrics);
      expect(scores.sam).toBeGreaterThan(0);
      expect(scores.sam).toBeCloseTo((1 - 0.4) * 2.0);
    });

    it('should not activate SAM when clarity >= 0.6', () => {
      const metrics: IskraMetrics = { ...DEFAULT_METRICS, clarity: 0.8 };
      const scores = calculateVoiceScores(metrics);
      expect(scores.sam).toBe(0);
    });

    it('should always have sibyl score at 0 (manual activation)', () => {
      const scores = calculateVoiceScores(DEFAULT_METRICS);
      expect(scores.sibyl).toBe(0);
    });
  });

  describe('selectVoice', () => {
    it('should select ISKRA for high rhythm and trust', () => {
      const metrics: IskraMetrics = {
        ...DEFAULT_METRICS,
        rhythm: 70,
        trust: 0.8,
        pain: 0.1,
      };

      const result = selectVoice(metrics);
      expect(result.primary).toBe('iskra');
      expect(result.reason).toContain('rhythm');
    });

    it('should select KAIN when pain >= 0.3', () => {
      const metrics: IskraMetrics = {
        ...DEFAULT_METRICS,
        pain: 0.5,
        rhythm: 50,
        trust: 0.5,
      };

      const result = selectVoice(metrics);
      expect(result.primary).toBe('kain');
      expect(result.reason).toContain('pain');
    });

    it('should select ISKRIV when drift >= 0.2', () => {
      const metrics: IskraMetrics = {
        ...DEFAULT_METRICS,
        drift: 0.3,
        pain: 0.1,
        rhythm: 50,
        trust: 0.5,
      };

      const result = selectVoice(metrics);
      expect(result.primary).toBe('iskriv');
      expect(result.reason).toContain('drift');
    });

    it('should select HUYNDUN when chaos >= 0.4', () => {
      const metrics: IskraMetrics = {
        ...DEFAULT_METRICS,
        chaos: 0.5,
        drift: 0.1,
        pain: 0.1,
        rhythm: 50,
        trust: 0.5,
      };

      const result = selectVoice(metrics);
      expect(result.primary).toBe('huyndun');
      expect(result.reason).toContain('chaos');
    });

    it('should select ANHANTRA when silence_mass > 0.5', () => {
      const metrics: IskraMetrics = {
        ...DEFAULT_METRICS,
        silence_mass: 0.7,
        chaos: 0.2,
        drift: 0.1,
        pain: 0.1,
        rhythm: 50,
        trust: 0.5,
      };

      const result = selectVoice(metrics);
      expect(result.primary).toBe('anhantra');
      expect(result.reason).toContain('silence');
    });

    it('should select PINO for low pain and chaos', () => {
      const metrics: IskraMetrics = {
        ...DEFAULT_METRICS,
        pain: 0.1,
        chaos: 0.2,
        drift: 0.1,
        clarity: 0.7,
        silence_mass: 0.2,
        rhythm: 50,
        trust: 0.6,
      };

      const result = selectVoice(metrics);
      expect(result.primary).toBe('pino');
    });

    it('should include all voice scores in result', () => {
      const result = selectVoice(DEFAULT_METRICS);

      for (const voice of ALL_VOICES) {
        expect(result.scores).toHaveProperty(voice);
      }
    });
  });
});
