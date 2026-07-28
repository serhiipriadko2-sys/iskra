import { beforeEach, describe, expect, it } from 'vitest';
import { symbiosisService } from '../symbiosisService';
import { activateUserStorage, deactivateUserStorage } from '../userScopedStorage';
import { setStorageBoundaryTestFallbackEnabled } from '../storageBoundary';

const store: Record<string, string> = {};

const localStorageMock: Storage = {
  get length() { return Object.keys(store).length; },
  clear() { Object.keys(store).forEach(key => delete store[key]); },
  getItem(key) { return store[key] ?? null; },
  key(index) { return Object.keys(store)[index] ?? null; },
  removeItem(key) { delete store[key]; },
  setItem(key, value) { store[key] = value; },
};

Object.defineProperty(global, 'localStorage', { value: localStorageMock });

describe('symbiosisService user isolation', () => {
  beforeEach(() => {
    localStorageMock.clear();
    deactivateUserStorage();
    setStorageBoundaryTestFallbackEnabled(true);
  });

  it('does not expose profile between users', () => {
    activateUserStorage('user-a', { migrateLegacy: false });
    symbiosisService.completeOnboarding('CONSENTED');

    activateUserStorage('user-b', { migrateLegacy: false });

    expect(symbiosisService.getProfile()).toBeNull();
  });

  it('blocks reads after logout boundary removal', () => {
    activateUserStorage('user-a', { migrateLegacy: false });
    symbiosisService.completeOnboarding('STATELESS');

    deactivateUserStorage();
    setStorageBoundaryTestFallbackEnabled(false);

    expect(symbiosisService.getProfile()).toBeNull();
  });

  it('keeps consent and action receipts scoped', () => {
    activateUserStorage('user-a', { migrateLegacy: false });
    symbiosisService.completeOnboarding('CONSENTED');
    const receipt = symbiosisService.grantConsent('memory.write.personal', 'test');

    activateUserStorage('user-b', { migrateLegacy: false });

    expect(symbiosisService.getReceipts()).toEqual([]);
    expect(symbiosisService.hasUsedConsentReceipt(receipt?.id ?? '')).toBe(false);
  });
});
