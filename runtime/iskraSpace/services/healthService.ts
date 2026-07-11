
export interface SleepData {
  minutes: number;
  source: string;
}

export interface HealthProvider {
  isAvailable(): boolean;
  requestPermissions(): Promise<boolean>;
  getSleepData(date: string): Promise<SleepData | null>;
}

interface IskraHealthBridge {
  requestPermissions?: (scopes: string[]) => Promise<boolean>;
  getSleepData?: (date: string) => Promise<unknown>;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function isIskraHealthBridge(value: unknown): value is IskraHealthBridge {
  return isRecord(value);
}

function getHealthBridge(): IskraHealthBridge | null {
  if (typeof window === 'undefined') return null;

  const candidate = (window as Window & { IskraHealth?: unknown }).IskraHealth;
  return isIskraHealthBridge(candidate) ? candidate : null;
}

// Mock implementation that checks for a global bridge
class WebHealthProvider implements HealthProvider {
  isAvailable(): boolean {
    return getHealthBridge() !== null;
  }

  async requestPermissions(): Promise<boolean> {
    const bridge = getHealthBridge();
    if (!bridge || typeof bridge.requestPermissions !== 'function') return false;

    try {
      return await bridge.requestPermissions(['sleep']);
    } catch (e) {
      console.warn('Health permission request failed', e);
      return false;
    }
  }

  async getSleepData(date: string): Promise<SleepData | null> {
    const bridge = getHealthBridge();
    if (!bridge || typeof bridge.getSleepData !== 'function') return null;

    try {
      const result = await bridge.getSleepData(date);
      if (isRecord(result) && typeof result.minutes === 'number') {
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
const provider: HealthProvider = new WebHealthProvider();

export const healthService = provider;
