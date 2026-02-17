
export interface SleepData {
  minutes: number;
  source: string;
}

export interface HealthProvider {
  isAvailable(): boolean;
  requestPermissions(): Promise<boolean>;
  getSleepData(date: string): Promise<SleepData | null>;
}

// Mock implementation that checks for a global bridge
class WebHealthProvider implements HealthProvider {
  isAvailable(): boolean {
    return typeof window !== 'undefined' &&
           (window as any).IskraHealth !== undefined;
  }

  async requestPermissions(): Promise<boolean> {
    if (!this.isAvailable()) return false;
    try {
      return await (window as any).IskraHealth.requestPermissions(['sleep']);
    } catch (e) {
      console.warn('Health permission request failed', e);
      return false;
    }
  }

  async getSleepData(date: string): Promise<SleepData | null> {
    if (!this.isAvailable()) return null;
    try {
      const result = await (window as any).IskraHealth.getSleepData(date);
      if (result && typeof result.minutes === 'number') {
        return {
          minutes: result.minutes,
          source: 'HealthKit/Connect'
        };
      }
      return null;
    } catch (e) {
      console.warn('Failed to fetch sleep data', e);
      return null;
    }
  }
}

// Stub implementation for dev/testing when no bridge exists
// @ts-ignore - unused but kept for reference or future fallback
class _StubHealthProvider implements HealthProvider {
  isAvailable(): boolean {
    return false;
  }

  async requestPermissions(): Promise<boolean> {
    return false;
  }

  async getSleepData(_date: string): Promise<SleepData | null> {
    return null;
  }
}

// Select the best provider
const provider = typeof window !== 'undefined' && (window as any).IskraHealth
  ? new WebHealthProvider()
  : new WebHealthProvider(); // Always use WebHealthProvider as it checks availability internally

export const healthService = provider;
