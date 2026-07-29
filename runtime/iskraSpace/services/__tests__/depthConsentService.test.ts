import { beforeEach, describe, expect, it, vi } from 'vitest';
import { depthConsentService } from '../depthConsentService';
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

describe('depthConsentService action boundary', () => {
  beforeEach(() => {
    localStorageMock.clear();
    vi.clearAllMocks();
    symbiosisService.completeOnboarding('CONSENTED');
  });

  it('grants a scoped depth receipt with the selected expiry', () => {
    const receipt = depthConsentService.grant('One deep research action', 5);

    expect(receipt).toMatchObject({
      scope: 'depth.surgery',
      decision: 'GRANTED',
    });
    expect(receipt?.expires_at).toBeTruthy();
  });

  it('stores and verifies permission_ref on a completed action receipt', () => {
    const consent = depthConsentService.grant('One deep research action', 15);
    expect(consent).not.toBeNull();

    const result = depthConsentService.recordAction(
      'ai.research.deep',
      consent?.id ?? '',
      'DONE',
      ['route:research.deep', 'context_nodes:3'],
    );

    expect(result.stored).toBe(true);
    expect(result.verified).toBe(true);
    expect(result.receipt.permission_ref).toBe(consent?.id);
    expect(symbiosisService.getActionReceipts()[0]).toMatchObject({
      action: 'ai.research.deep',
      permission_ref: consent?.id,
      result: 'DONE',
    });
  });

  it('records denial with a permission reference and blocks replay', () => {
    const denial = depthConsentService.deny('User declined focus artifact');
    expect(denial?.decision).toBe('DENIED');

    const first = depthConsentService.recordAction(
      'ai.focus.artifact',
      denial?.id ?? '',
      'BLOCKED',
      ['route:focus.artifact', 'decision:denied'],
    );
    const replay = depthConsentService.recordAction(
      'ai.focus.artifact',
      denial?.id ?? '',
      'BLOCKED',
      ['route:focus.artifact', 'decision:denied'],
    );

    expect(first.verified).toBe(true);
    expect(replay.stored).toBe(false);
    expect(replay.verified).toBe(false);
  });
});
