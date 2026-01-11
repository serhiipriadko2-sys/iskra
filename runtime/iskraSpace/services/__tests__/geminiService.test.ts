
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { IskraAIService } from '../geminiService';

// Mock fetch globally
const globalFetch = vi.fn();
global.fetch = globalFetch;

describe('IskraAIService (Mocked)', () => {
  let service: IskraAIService;

  beforeEach(() => {
    vi.clearAllMocks();
    // Enable online mode for tests by setting env vars (conceptually) or mocking imports if possible.
    // Since we can't easily change import.meta.env at runtime in this setup without complex mocking,
    // we will rely on the service logic.
    // However, the service has a hardcoded OFFLINE_MODE check based on env.
    // If OFFLINE_MODE is true (which it is in test env usually), methods return mock data immediately.
    // To test the "online" logic, we might need to bypass that check or mock the `isOnlineAIAvailable` check if it was used internally.
    // Looking at the code: OFFLINE_MODE is a const calculated at module level.
    // We cannot easily change it.
    // BUT: The service methods check `if (OFFLINE_MODE)`.

    service = new IskraAIService();
  });

  // If we are in OFFLINE_MODE (test env), we test the fallbacks.
  // If we were able to force ONLINE, we would test fetch calls.

  describe('Offline Fallbacks', () => {
    it('getDailyAdvice returns offline advice', async () => {
      const advice = await service.getDailyAdvice([]);
      expect(advice.insight).toContain('Связь с облаком недоступна');
      expect(advice.checks).toContain('offline');
    });

    it('getPlanTop3 returns offline plan', async () => {
      const plan = await service.getPlanTop3();
      expect(plan.tasks.length).toBe(3);
      expect(plan.tasks[0].title).toBeDefined();
    });

    it('getJournalPrompt returns offline prompt', async () => {
        const prompt = await service.getJournalPrompt();
        expect(prompt.question).toBeDefined();
        expect(prompt.why).toBeDefined();
    });
  });

  // Since we cannot change the module-level const OFFLINE_MODE easily in this environment without
  // advanced vitest configurations (vi.mock with factory), we will focus on unit testing
  // the helper functions if they were exported, or accept that in this environment
  // we are testing the Offline paths which ARE the expected behavior for tests.

  // However, to increase coverage, we really want to test the `generateContentText` logic.
  // We can try to test the `cleanAndParseJSON` logic if we can access it, but it's not exported.

  // Strategy: We can test `analyzeJournalEntry` fallback.
  it('analyzeJournalEntry returns offline fallback', async () => {
      // Mock navigator.onLine to be false to trigger the first fallback
      const originalOnLine = navigator.onLine;
      Object.defineProperty(navigator, 'onLine', { value: false, configurable: true });

      let analysis = await service.analyzeJournalEntry("test entry");
      expect(analysis.reflection).toContain("Запись сохранена локально");

      // Reset navigator.onLine to true to trigger the OFFLINE_MODE fallback
      Object.defineProperty(navigator, 'onLine', { value: true, configurable: true });

      analysis = await service.analyzeJournalEntry("test entry");
      // Note: In test env OFFLINE_MODE is likely true, so it hits the second fallback
      expect(analysis.reflection).toContain("Связь с облаком отсутствует");

      // Cleanup
      Object.defineProperty(navigator, 'onLine', { value: originalOnLine, configurable: true });
  });

});
