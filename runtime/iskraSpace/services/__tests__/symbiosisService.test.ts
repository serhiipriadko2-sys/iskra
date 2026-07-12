import { beforeEach, describe, expect, it, vi } from 'vitest';
import { symbiosisService } from '../symbiosisService';

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

describe('symbiosisService onboarding state', () => {
  beforeEach(() => {
    localStorageMock.clear();
    vi.clearAllMocks();
  });

  it('persists a stateless profile with no receipts', () => {
    const state = symbiosisService.completeOnboarding('STATELESS');
    expect(state.profile.memory_mode).toBe('STATELESS');
    expect(state.receipts).toEqual([]);
    expect(symbiosisService.isStateless()).toBe(true);
  });

  it('persists a consented profile with ASK_EACH personal memory', () => {
    const state = symbiosisService.completeOnboarding('CONSENTED');
    expect(state.profile.memory_mode).toBe('CONSENTED');
    expect(state.profile.memory_permissions['memory.write.personal']).toBe('ASK_EACH');
    expect(symbiosisService.isStateless()).toBe(false);
  });

  it('does not issue personal consent in stateless mode', () => {
    symbiosisService.completeOnboarding('STATELESS');
    expect(symbiosisService.grantConsent('memory.write.personal', 'test')).toBeNull();
  });

  it('issues a scoped, expiring receipt after explicit action', () => {
    symbiosisService.completeOnboarding('CONSENTED');
    const receipt = symbiosisService.grantConsent(
      'memory.write.personal',
      'Store one selected memory',
    );
    expect(receipt?.scope).toBe('memory.write.personal');
    expect(receipt?.decision).toBe('GRANTED');
    expect(symbiosisService.getCurrentConsent('memory.write.personal')?.id).toBe(receipt?.id);
  });

  it('exports and restores the profile and receipt ledger', () => {
    symbiosisService.completeOnboarding('CONSENTED');
    symbiosisService.grantConsent('memory.write.personal', 'restore test');
    const exported = symbiosisService.exportState();
    symbiosisService.clear();
    expect(symbiosisService.getState()).toBeNull();
    expect(symbiosisService.importState(exported)).toBe(true);
    expect(symbiosisService.getProfile()?.memory_mode).toBe('CONSENTED');
  });

  it('rejects malformed remote profile state', () => {
    expect(symbiosisService.importState({
      profile: { schema_version: 'iskra.symbiosis.v1', memory_mode: 'CONSENTED' },
      receipts: [{ id: 'receipt-without-required-fields' }],
    })).toBe(false);
    expect(symbiosisService.getState()).toBeNull();
  });
});
