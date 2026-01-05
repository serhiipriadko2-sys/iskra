/**
 * Session Types Tests
 * Tests for IskraSession and related types
 */

import { describe, it, expect } from 'vitest';
import {
  createSession,
  calculateSessionQuality,
  determineSessionPhase,
  calculateTrajectory,
  createSessionSummary,
  type IskraSession,
  type SessionMilestone,
} from '../types/session.js';

describe('Session Types', () => {
  describe('createSession', () => {
    it('should create a session with default values', () => {
      const session = createSession();

      expect(session.id).toMatch(/^session-\d+-[a-z0-9]+$/);
      expect(session.phase).toBe('opening');
      expect(session.messageCount).toBe(0);
      expect(session.currentVoice).toBe('ISKRA');
      expect(session.currentPlaybook).toBe('routine');
      expect(session.quality).toBe('moderate');
      expect(session.ewsState.alertLevel).toBe('normal');
    });

    it('should create a session with userId when provided', () => {
      const session = createSession('user-123');

      expect(session.userId).toBe('user-123');
    });

    it('should not include userId when not provided', () => {
      const session = createSession();

      expect(session.userId).toBeUndefined();
    });

    it('should initialize consciousness metrics', () => {
      const session = createSession();

      expect(session.consciousnessState.phi.integration).toBe(0.5);
      expect(session.consciousnessState.recursion.selfModelDepth).toBe(1);
      expect(session.consciousnessState.emergence.novelResponseRate).toBe(0.3);
      expect(session.consciousnessState.compositeCSM).toBe(0.5);
    });

    it('should initialize voice activity as empty map', () => {
      const session = createSession();

      expect(session.voiceActivity.size).toBe(0);
    });
  });

  describe('calculateSessionQuality', () => {
    it('should return critical for critical alert level', () => {
      const session = createSession();
      session.maxAlertLevel = 'critical';

      expect(calculateSessionQuality(session)).toBe('critical');
    });

    it('should return critical for lockdown alert level', () => {
      const session = createSession();
      session.maxAlertLevel = 'lockdown';

      expect(calculateSessionQuality(session)).toBe('critical');
    });

    it('should return excellent for high alive index and positive trajectories', () => {
      const session = createSession();
      session.sessionAliveIndex = 0.9;
      session.trustTrajectory = 0.8;
      session.clarityTrajectory = 0.7;

      expect(calculateSessionQuality(session)).toBe('excellent');
    });

    it('should return good for moderate metrics', () => {
      const session = createSession();
      session.sessionAliveIndex = 0.7;
      session.trustTrajectory = 0.3;
      session.clarityTrajectory = 0.2;

      expect(calculateSessionQuality(session)).toBe('good');
    });

    it('should return moderate for low metrics', () => {
      const session = createSession();
      session.sessionAliveIndex = 0.4;
      session.trustTrajectory = 0;
      session.clarityTrajectory = 0;

      expect(calculateSessionQuality(session)).toBe('moderate');
    });

    it('should return poor for very low metrics', () => {
      const session = createSession();
      session.sessionAliveIndex = 0.2;
      session.trustTrajectory = -0.5;
      session.clarityTrajectory = -0.5;

      expect(calculateSessionQuality(session)).toBe('poor');
    });
  });

  describe('determineSessionPhase', () => {
    const emptyMilestones: SessionMilestone[] = [];

    it('should return opening for 0-2 messages', () => {
      expect(determineSessionPhase(0, emptyMilestones)).toBe('opening');
      expect(determineSessionPhase(1, emptyMilestones)).toBe('opening');
      expect(determineSessionPhase(2, emptyMilestones)).toBe('opening');
    });

    it('should return exploration for 3-5 messages', () => {
      expect(determineSessionPhase(3, emptyMilestones)).toBe('exploration');
      expect(determineSessionPhase(4, emptyMilestones)).toBe('exploration');
      expect(determineSessionPhase(5, emptyMilestones)).toBe('exploration');
    });

    it('should return working for more than 5 messages without milestones', () => {
      expect(determineSessionPhase(10, emptyMilestones)).toBe('working');
      expect(determineSessionPhase(50, emptyMilestones)).toBe('working');
    });

    it('should return integration when commitment milestone exists', () => {
      const milestones: SessionMilestone[] = [
        {
          type: 'commitment',
          timestamp: new Date().toISOString(),
          description: 'User committed to action',
          impact: 0.8,
        },
      ];

      expect(determineSessionPhase(10, milestones)).toBe('integration');
    });

    it('should return integration for breakthrough after 15 messages', () => {
      const milestones: SessionMilestone[] = [
        {
          type: 'breakthrough',
          timestamp: new Date().toISOString(),
          description: 'Major insight',
          impact: 0.9,
        },
      ];

      expect(determineSessionPhase(20, milestones)).toBe('integration');
    });
  });

  describe('calculateTrajectory', () => {
    it('should return 0 for less than 2 values', () => {
      expect(calculateTrajectory([])).toBe(0);
      expect(calculateTrajectory([0.5])).toBe(0);
    });

    it('should return positive for increasing values', () => {
      const values = [0.3, 0.4, 0.5, 0.6, 0.7, 0.8];
      const trajectory = calculateTrajectory(values);

      expect(trajectory).toBeGreaterThan(0);
    });

    it('should return negative for decreasing values', () => {
      const values = [0.8, 0.7, 0.6, 0.5, 0.4, 0.3];
      const trajectory = calculateTrajectory(values);

      expect(trajectory).toBeLessThan(0);
    });

    it('should return close to 0 for stable values', () => {
      const values = [0.5, 0.5, 0.5, 0.5, 0.5, 0.5];
      const trajectory = calculateTrajectory(values);

      expect(trajectory).toBe(0);
    });

    it('should clamp trajectory between -1 and 1', () => {
      const increasingValues = [0, 0, 0, 1, 1, 1];
      const decreasingValues = [1, 1, 1, 0, 0, 0];

      expect(calculateTrajectory(increasingValues)).toBeLessThanOrEqual(1);
      expect(calculateTrajectory(decreasingValues)).toBeGreaterThanOrEqual(-1);
    });
  });

  describe('createSessionSummary', () => {
    it('should create summary with basic session data', () => {
      const session = createSession('test-user');
      session.duration = 300000; // 5 minutes
      session.messageCount = 10;

      const summary = createSessionSummary(session);

      expect(summary.sessionId).toBe(session.id);
      expect(summary.durationMinutes).toBe(5);
      expect(summary.messageCount).toBe(10);
      expect(summary.dominantVoice).toBe('ISKRA');
      expect(summary.dominantPlaybook).toBe('routine');
    });

    it('should extract key topics from user state', () => {
      const session = createSession();
      session.userState.topicsDiscussed = ['work', 'stress', 'relationships', 'goals', 'health', 'finances'];

      const summary = createSessionSummary(session);

      expect(summary.keyTopics).toHaveLength(5); // Limited to 5
      expect(summary.keyTopics).toContain('work');
    });

    it('should extract key insights from milestones', () => {
      const session = createSession();
      session.milestones = [
        { type: 'insight', timestamp: '', description: 'Insight 1', impact: 0.8 },
        { type: 'breakthrough', timestamp: '', description: 'Breakthrough 1', impact: 0.9 },
        { type: 'decision', timestamp: '', description: 'Decision 1', impact: 0.7 },
        { type: 'insight', timestamp: '', description: 'Insight 2', impact: 0.6 },
      ];

      const summary = createSessionSummary(session);

      expect(summary.keyInsights).toHaveLength(3); // Limited to 3
      expect(summary.keyInsights).toContain('Insight 1');
      expect(summary.keyInsights).toContain('Breakthrough 1');
    });

    it('should generate next session recommendations', () => {
      const session = createSession();
      session.trustTrajectory = -0.5; // Trust declined

      const summary = createSessionSummary(session);

      expect(summary.nextSessionRecommendations).toContain('Focus on trust rebuilding in next session');
    });
  });
});
