import { beforeEach, describe, expect, it, vi } from 'vitest';

const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: vi.fn((key: string) => store[key] ?? null),
    setItem: vi.fn((key: string, value: string) => { store[key] = value; }),
    removeItem: vi.fn((key: string) => { delete store[key]; }),
    clear: vi.fn(() => { store = {}; }),
    key: vi.fn((index: number) => Object.keys(store)[index] ?? null),
    get length() { return Object.keys(store).length; },
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
import { principalStorage, principalStorageKey } from '../principalStorage';

describe('storageService symbiosis onboarding', () => {
  beforeEach(() => {
    localStorageMock.clear();
    vi.clearAllMocks();
    storageService.bindPrincipal('test-principal');
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

  it('exports and reimports a portable backup above the former one MiB limit', () => {
    storageService.saveTasks(Array.from({ length: 100 }, (_, index) => ({
      id: `task-${index}`,
      title: 'x'.repeat(12_000),
      ritualTag: 'FIRE' as const,
      done: false,
    })));

    const exported = storageService.exportAllData();
    expect(new TextEncoder().encode(exported).byteLength).toBeGreaterThan(1024 * 1024);

    expect(() => storageService.importAllData(exported)).not.toThrow();
    expect(storageService.getTasks()).toHaveLength(100);
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

  it('keeps local application data isolated between authenticated principals', () => {
    storageService.saveTasks([{
      id: 'task-a',
      title: 'private A',
      ritualTag: 'FIRE',
      done: false,
    }]);

    storageService.bindPrincipal('principal-b');
    expect(storageService.getTasks()).toEqual([]);

    storageService.bindPrincipal('test-principal');
    expect(storageService.getTasks()[0]?.title).toBe('private A');
  });

  it('evicts the bound principal and its raw sync queues on session release', () => {
    storageService.saveTasks([{
      id: 'private',
      title: 'private',
      ritualTag: 'FIRE',
      done: false,
    }]);
    localStorageMock.setItem('chat_history_test-principal', '[{"secret":true}]');
    localStorageMock.setItem('chat_pending_test-principal', '[{"secret":true}]');
    localStorageMock.setItem('memory_archive_test-principal', '[{"secret":true}]');
    localStorageMock.setItem('memory_shadow_test-principal', '[{"secret":true}]');
    localStorageMock.setItem('memory_all_test-principal', '[{"secret":true}]');
    localStorageMock.setItem('metrics_latest_test-principal', '{"secret":true}');
    localStorageMock.setItem('device-consent', 'preserve');

    storageService.releasePrincipal({ clear: true });

    expect(localStorageMock.getItem('chat_history_test-principal')).toBeNull();
    expect(localStorageMock.getItem('chat_pending_test-principal')).toBeNull();
    expect(localStorageMock.getItem('memory_archive_test-principal')).toBeNull();
    expect(localStorageMock.getItem('memory_shadow_test-principal')).toBeNull();
    expect(localStorageMock.getItem('memory_all_test-principal')).toBeNull();
    expect(localStorageMock.getItem('metrics_latest_test-principal')).toBeNull();
    expect(localStorageMock.getItem('device-consent')).toBe('preserve');
  });

  it('unbinds the principal when legacy migration cannot use browser storage', () => {
    localStorageMock.removeItem('iskra.principal.legacy-owner.v1');
    localStorageMock.setItem.mockImplementationOnce(() => {
      throw new DOMException('blocked', 'SecurityError');
    });

    expect(() => storageService.bindPrincipal('failing-principal')).toThrow();
    expect(principalStorage.activePrincipal()).toBeNull();
  });

  it('validates the complete backup before applying any import mutation', () => {
    storageService.saveTasks([{
      id: 'before',
      title: 'before',
      ritualTag: 'WATER',
      done: false,
    }]);
    const invalidBackup = JSON.stringify({
      version: '1.0.0',
      tasks: [{ id: 'after', title: 'after', ritualTag: 'SUN', done: false }],
      habits: [{ corrupted: true }],
    });

    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    expect(() => storageService.importAllData(invalidBackup)).toThrow();
    expect(storageService.getTasks()[0]?.id).toBe('before');
    consoleSpy.mockRestore();
  });

  it('clears all local state', () => {
    storageService.completeOnboarding('TestUser', 'CONSENTED');
    localStorageMock.setItem('chat_history_test-principal', '[{"secret":true}]');
    localStorageMock.setItem('chat_pending_test-principal', '[{"secret":true}]');
    localStorageMock.setItem('memory_archive_test-principal', '[{"secret":true}]');
    localStorageMock.setItem('memory_shadow_test-principal', '[{"secret":true}]');
    localStorageMock.setItem('memory_all_test-principal', '[{"secret":true}]');
    localStorageMock.setItem('metrics_latest_test-principal', '{"secret":true}');
    localStorageMock.setItem('iskra_analytics_opted_in', 'true');
    localStorageMock.setItem('iskra_analytics_client_id', 'device-identifier');
    localStorageMock.setItem('iskra_error_tracking_opted_in', 'true');
    localStorageMock.setItem('iskra.principal.legacy-owner.v1', 'test-principal');
    localStorageMock.setItem('sb-project-auth-token', '{"access_token":"redacted"}');
    storageService.clearAllData();
    expect(localStorageMock.getItem(principalStorageKey('iskra-onboarding-complete'))).toBeNull();
    expect(localStorageMock.getItem('chat_history_test-principal')).toBeNull();
    expect(localStorageMock.getItem('chat_pending_test-principal')).toBeNull();
    expect(localStorageMock.getItem('memory_archive_test-principal')).toBeNull();
    expect(localStorageMock.getItem('memory_shadow_test-principal')).toBeNull();
    expect(localStorageMock.getItem('memory_all_test-principal')).toBeNull();
    expect(localStorageMock.getItem('metrics_latest_test-principal')).toBeNull();
    expect(localStorageMock.getItem('iskra_analytics_opted_in')).toBeNull();
    expect(localStorageMock.getItem('iskra_analytics_client_id')).toBeNull();
    expect(localStorageMock.getItem('iskra_error_tracking_opted_in')).toBeNull();
    expect(localStorageMock.getItem('iskra.principal.legacy-owner.v1')).toBeNull();
    expect(localStorageMock.getItem('sb-project-auth-token')).toBeNull();
    expect(principalStorage.activePrincipal()).toBeNull();
    expect(localStorageMock.clear).toHaveBeenCalled();
    expect(window.location.reload).toHaveBeenCalled();
  });
});
