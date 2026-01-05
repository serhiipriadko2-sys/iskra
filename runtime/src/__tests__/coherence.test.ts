import { describe, it, expect } from 'vitest';
import {
  calculateTotalCoherence,
  classifyCoherencePhase,
  determineCoherenceTrend,
  classifyResonanceQuality,
  checkCoherenceEWSTriggers,
  COHERENCE_WEIGHTS,
  PHASE_THRESHOLDS,
} from '../types/coherence.js';
import type { CoherenceState } from '../types/coherence.js';

describe('MindWave Coherence', () => {
  describe('COHERENCE_WEIGHTS', () => {
    it('should sum to 1.0', () => {
      const sum = Object.values(COHERENCE_WEIGHTS).reduce((a, b) => a + b, 0);
      expect(sum).toBeCloseTo(1.0);
    });
  });

  describe('calculateTotalCoherence', () => {
    it('should calculate weighted sum', () => {
      const state = {
        intentional: 0.8,
        semantic: 0.7,
        emotional: 0.6,
        rhythmic: 0.5,
      };

      const result = calculateTotalCoherence(state);
      const expected =
        0.8 * COHERENCE_WEIGHTS.intentional +
        0.7 * COHERENCE_WEIGHTS.semantic +
        0.6 * COHERENCE_WEIGHTS.emotional +
        0.5 * COHERENCE_WEIGHTS.rhythmic;

      expect(result).toBeCloseTo(expected);
    });

    it('should return 0 for zero state', () => {
      const state = {
        intentional: 0,
        semantic: 0,
        emotional: 0,
        rhythmic: 0,
      };

      expect(calculateTotalCoherence(state)).toBe(0);
    });

    it('should return ~1.0 for perfect state', () => {
      const state = {
        intentional: 1,
        semantic: 1,
        emotional: 1,
        rhythmic: 1,
      };

      expect(calculateTotalCoherence(state)).toBeCloseTo(1.0);
    });
  });

  describe('classifyCoherencePhase', () => {
    it('should classify harmonic for high coherence', () => {
      expect(classifyCoherencePhase(0.8)).toBe('harmonic');
      expect(classifyCoherencePhase(0.7)).toBe('harmonic');
    });

    it('should classify dissonant for low coherence', () => {
      expect(classifyCoherencePhase(0.3)).toBe('dissonant');
      expect(classifyCoherencePhase(0.4)).toBe('dissonant');
    });

    it('should classify transitional for middle values', () => {
      expect(classifyCoherencePhase(0.5)).toBe('transitional');
      expect(classifyCoherencePhase(0.6)).toBe('transitional');
    });
  });

  describe('determineCoherenceTrend', () => {
    const createState = (total: number): CoherenceState => ({
      intentional: total,
      semantic: total,
      emotional: total,
      rhythmic: total,
      total,
      phase: 'harmonic',
      trend: 'stable',
      timestamp: new Date().toISOString(),
    });

    it('should return stable for insufficient data', () => {
      const states = [createState(0.5), createState(0.5)];
      expect(determineCoherenceTrend(states, 5)).toBe('stable');
    });

    it('should detect rising trend', () => {
      const states = [
        createState(0.3),
        createState(0.4),
        createState(0.5),
        createState(0.6),
        createState(0.7),
      ];
      expect(determineCoherenceTrend(states, 5)).toBe('rising');
    });

    it('should detect falling trend', () => {
      const states = [
        createState(0.7),
        createState(0.6),
        createState(0.5),
        createState(0.4),
        createState(0.3),
      ];
      expect(determineCoherenceTrend(states, 5)).toBe('falling');
    });

    it('should detect stable trend', () => {
      const states = [
        createState(0.5),
        createState(0.5),
        createState(0.5),
        createState(0.5),
        createState(0.5),
      ];
      expect(determineCoherenceTrend(states, 5)).toBe('stable');
    });
  });

  describe('classifyResonanceQuality', () => {
    it('should classify deep for high values', () => {
      expect(classifyResonanceQuality(0.8, 0.8, 0.8)).toBe('deep');
    });

    it('should classify surface for medium values', () => {
      expect(classifyResonanceQuality(0.5, 0.6, 0.5)).toBe('surface');
    });

    it('should classify fragmented for low values', () => {
      expect(classifyResonanceQuality(0.3, 0.4, 0.3)).toBe('fragmented');
    });

    it('should classify absent for very low values', () => {
      expect(classifyResonanceQuality(0.1, 0.2, 0.1)).toBe('absent');
    });
  });

  describe('checkCoherenceEWSTriggers', () => {
    const createState = (total: number, phase: 'harmonic' | 'dissonant' | 'transitional'): CoherenceState => ({
      intentional: total,
      semantic: total,
      emotional: total,
      rhythmic: total,
      total,
      phase,
      trend: 'stable',
      timestamp: new Date().toISOString(),
    });

    it('should detect rapid decline', () => {
      const states = [
        createState(0.8, 'harmonic'),
        createState(0.5, 'transitional'),
        createState(0.3, 'dissonant'),
      ];

      const result = checkCoherenceEWSTriggers(states);
      expect(result.triggered).toBe(true);
      expect(result.trigger).toBe('rapid_coherence_decline');
    });

    it('should detect persistent dissonance', () => {
      const states = [
        createState(0.3, 'dissonant'),
        createState(0.3, 'dissonant'),
        createState(0.3, 'dissonant'),
        createState(0.3, 'dissonant'),
        createState(0.3, 'dissonant'),
      ];

      const result = checkCoherenceEWSTriggers(states);
      expect(result.triggered).toBe(true);
      expect(result.trigger).toBe('persistent_dissonance');
    });

    it('should detect oscillation', () => {
      const states = [
        createState(0.8, 'harmonic'),
        createState(0.3, 'dissonant'),
        createState(0.8, 'harmonic'),
        createState(0.3, 'dissonant'),
        createState(0.8, 'harmonic'),
        createState(0.3, 'dissonant'),
      ];

      const result = checkCoherenceEWSTriggers(states);
      expect(result.triggered).toBe(true);
      expect(result.trigger).toBe('coherence_oscillation');
    });

    it('should not trigger for stable state', () => {
      const states = [
        createState(0.7, 'harmonic'),
        createState(0.7, 'harmonic'),
        createState(0.7, 'harmonic'),
      ];

      const result = checkCoherenceEWSTriggers(states);
      expect(result.triggered).toBe(false);
    });
  });
});
