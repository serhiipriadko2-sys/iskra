import { beforeEach, describe, expect, it, vi } from 'vitest';

const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: vi.fn((key: string) => store[key] ?? null),
    setItem: vi.fn((key: string, value: string) => { store[key] = value; }),
    removeItem: vi.fn((key: string) => { delete store[key]; }),
    clear: vi.fn(() => { store = {}; }),
  };
})();

Object.defineProperty(global, 'localStorage', { value: localStorageMock });
Object.defineProperty(global, 'window', {
  value: { location: { reload: vi.fn() } },
});
Object.defineProperty(global, 'document', {
  value: { createElement: vi.fn(() => ({ innerText: '', innerHTML: '' })) },
});

import { storageService } from '../storageService';

describe('storageService symbiosis onboarding', () => {
  beforeEach(() => {
    localStorageMock.clear();
    vi.clearAllMocks();
  });

  it('is incomplete until both marker and profile exist', () => {
    expect(storageService.isOnboardingComplete()).toBe(false);
    localStorageMock.setItem('iskra-onboarding-complete', 'true');
    expect(storageService.isOnboardingComplete()).toBe(false);
  });

  it('creates a first-class STATELESS profile', () => {
    const state = storageService.completeOnboarding('TestUser', 'STATELESS');
    expect(state.profile.memory_mode).toBe('STATELESS');
    expect(storageService.isOnboardingComplete()).toBe(true);
    expect(storageService.getUserName()).toBe('TestUser');
  });

  it('creates a CONSENTED profile with explicit memory scopes', () => {
    const state = storageService.completeOnboarding('TestUser', 'CONSENTED');
    expect(state.profile.memory_mode).toBe('CONSENTED');
    expect(state.profile.memory_permissions['memory.write.personal']).toBe('ASK_EACH');
  });

  it('restores a remote profile and marks onboarding complete', () => {
    const source = storageService.completeOnboarding('TestUser', 'STATELESS');
    localStorageMock.clear();

    expect(storageService.restoreSymbiosisState(source)).toBe(true);
    expect(storageService.isOnboardingComplete()).toBe(true);
    expect(storageService.getSymbiosisState()?.profile.memory_mode).toBe('STATELESS');
  });

  it('exports the profile and consent ledger', () => {
    storageService.completeOnboarding('TestUser', 'CONSENTED');
    const exported = JSON.parse(storageService.exportAllData()) as {
      symbiosis: { profile: { memory_mode: string }; receipts: unknown[] };
    };
    expect(exported.symbiosis.profile.memory_mode).toBe('CONSENTED');
    expect(exported.symbiosis.receipts).toEqual([]);
  });

  it('keeps tutorial and voice state behavior intact', () => {
    expect(storageService.hasSeenTutorial()).toBe(false);
    storageService.completeTutorial();
    expect(storageService.hasSeenTutorial()).toBe(true);
    storageService.saveLastVoiceState('AUTO', 'ISKRA');
    expect(storageService.getLastVoiceState().mode).toBe('AUTO');
  });

  it('throws on invalid import JSON', () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    expect(() => storageService.importAllData('not valid json')).toThrow();
    consoleSpy.mockRestore();
  });

  it('clears all local state', () => {
    storageService.completeOnboarding('TestUser', 'CONSENTED');
    storageService.clearAllData();
    expect(localStorageMock.clear).toHaveBeenCalled();
    expect(window.location.reload).toHaveBeenCalled();
  });
});
