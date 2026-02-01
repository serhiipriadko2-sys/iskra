
import { describe, it, expect, vi, afterEach } from 'vitest';
import { healthService } from '../healthService';

describe('healthService', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('isAvailable returns false when window.IskraHealth is undefined', () => {
    expect(healthService.isAvailable()).toBe(false);
  });

  it('isAvailable returns true when window.IskraHealth is defined', () => {
    vi.stubGlobal('IskraHealth', {});
    expect(healthService.isAvailable()).toBe(true);
  });

  it('requestPermissions calls bridge when available', async () => {
    const requestPermissionsMock = vi.fn().mockResolvedValue(true);
    vi.stubGlobal('IskraHealth', {
      requestPermissions: requestPermissionsMock
    });

    const result = await healthService.requestPermissions();
    expect(result).toBe(true);
    expect(requestPermissionsMock).toHaveBeenCalledWith(['sleep']);
  });

  it('getSleepData calls bridge and returns data', async () => {
    const getSleepDataMock = vi.fn().mockResolvedValue({ minutes: 480 });
    vi.stubGlobal('IskraHealth', {
      getSleepData: getSleepDataMock
    });

    const result = await healthService.getSleepData('2023-01-01');
    expect(result).toEqual({ minutes: 480, source: 'HealthKit/Connect' });
    expect(getSleepDataMock).toHaveBeenCalledWith('2023-01-01');
  });

  it('getSleepData returns null on error', async () => {
    const getSleepDataMock = vi.fn().mockRejectedValue(new Error('Failed'));
    vi.stubGlobal('IskraHealth', {
      getSleepData: getSleepDataMock
    });

    const result = await healthService.getSleepData('2023-01-01');
    expect(result).toBeNull();
  });
});
