
import { describe, it, expect, vi, afterEach, beforeEach } from 'vitest';
import { healthService } from '../healthService';

describe('healthService', () => {
  beforeEach(() => {
    // Mock window object
    global.window = global.window || ({} as any);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    delete (global.window as any).IskraHealth;
  });

  it('isAvailable returns false when window.IskraHealth is undefined', () => {
    delete (global.window as any).IskraHealth;
    expect(healthService.isAvailable()).toBe(false);
  });

  it('isAvailable returns true when window.IskraHealth is defined', () => {
    (global.window as any).IskraHealth = {};
    expect(healthService.isAvailable()).toBe(true);
  });

  it('requestPermissions calls bridge when available', async () => {
    const requestPermissionsMock = vi.fn().mockResolvedValue(true);
    (global.window as any).IskraHealth = {
      requestPermissions: requestPermissionsMock
    };

    const result = await healthService.requestPermissions();
    expect(result).toBe(true);
    expect(requestPermissionsMock).toHaveBeenCalledWith(['sleep']);
  });

  it('getSleepData calls bridge and returns data', async () => {
    const getSleepDataMock = vi.fn().mockResolvedValue({ minutes: 480 });
    (global.window as any).IskraHealth = {
      getSleepData: getSleepDataMock
    };

    const result = await healthService.getSleepData('2023-01-01');
    expect(result).toEqual({ minutes: 480, source: 'HealthKit/Connect' });
    expect(getSleepDataMock).toHaveBeenCalledWith('2023-01-01');
  });

  it('getSleepData returns null on error', async () => {
    const getSleepDataMock = vi.fn().mockRejectedValue(new Error('Failed'));
    (global.window as any).IskraHealth = {
      getSleepData: getSleepDataMock
    };

    const result = await healthService.getSleepData('2023-01-01');
    expect(result).toBeNull();
  });
});
