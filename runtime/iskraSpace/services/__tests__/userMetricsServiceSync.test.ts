
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { userMetricsService } from '../userMetricsService';
import { healthService } from '../healthService';
import { safeStorage } from '../storageCompat';

// Mock healthService
vi.mock('../healthService', () => ({
  healthService: {
    isAvailable: vi.fn(),
    requestPermissions: vi.fn(),
    getSleepData: vi.fn(),
  }
}));

// Mock safeStorage
vi.mock('../storageCompat', () => ({
  safeStorage: {
    getItem: vi.fn(),
    setItem: vi.fn(),
  }
}));

describe('userMetricsService', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  describe('syncSleepData', () => {
    it('does nothing if health service is unavailable', async () => {
      vi.mocked(healthService.isAvailable).mockReturnValue(false);
      await userMetricsService.syncSleepData();
      expect(healthService.requestPermissions).not.toHaveBeenCalled();
    });

    it('requests permissions if available', async () => {
      vi.mocked(healthService.isAvailable).mockReturnValue(true);
      vi.mocked(healthService.requestPermissions).mockResolvedValue(false);

      await userMetricsService.syncSleepData();
      expect(healthService.requestPermissions).toHaveBeenCalled();
      expect(healthService.getSleepData).not.toHaveBeenCalled();
    });

    it('fetches sleep data and updates score if permission granted', async () => {
      vi.mocked(healthService.isAvailable).mockReturnValue(true);
      vi.mocked(healthService.requestPermissions).mockResolvedValue(true);
      vi.mocked(healthService.getSleepData).mockResolvedValue({
        minutes: 480,
        source: 'test'
      });

      const today = new Date().toISOString().split('T')[0];

      await userMetricsService.syncSleepData();

      expect(healthService.getSleepData).toHaveBeenCalledWith(today);
      expect(safeStorage.setItem).toHaveBeenCalledWith('iskra_sleep_score', '100');
      expect(safeStorage.setItem).toHaveBeenCalledWith('iskra_sleep_date', today);
    });

    it('calculates score correctly (240 mins = 50%)', async () => {
      vi.mocked(healthService.isAvailable).mockReturnValue(true);
      vi.mocked(healthService.requestPermissions).mockResolvedValue(true);
      vi.mocked(healthService.getSleepData).mockResolvedValue({
        minutes: 240,
        source: 'test'
      });

      await userMetricsService.syncSleepData();

      expect(safeStorage.setItem).toHaveBeenCalledWith('iskra_sleep_score', '50');
    });

    it('caps score at 100', async () => {
      vi.mocked(healthService.isAvailable).mockReturnValue(true);
      vi.mocked(healthService.requestPermissions).mockResolvedValue(true);
      vi.mocked(healthService.getSleepData).mockResolvedValue({
        minutes: 600,
        source: 'test'
      });

      await userMetricsService.syncSleepData();

      expect(safeStorage.setItem).toHaveBeenCalledWith('iskra_sleep_score', '100');
    });

    it('handles errors gracefully', async () => {
      vi.mocked(healthService.isAvailable).mockReturnValue(true);
      vi.mocked(healthService.requestPermissions).mockRejectedValue(new Error('Auth failed'));

      await userMetricsService.syncSleepData();

      // Should not throw and not update storage
      expect(safeStorage.setItem).not.toHaveBeenCalled();
    });
  });
});
