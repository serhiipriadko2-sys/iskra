import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { ConsentReceipt } from '@iskra/runtime';
import type { MemoryNode } from '../../types';
import { memoryService } from '../memoryService';
import { shadowPromotionService } from '../shadowPromotionService';
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

function addReviewedShadow(overrides: Partial<MemoryNode> = {}): MemoryNode {
  return memoryService.addShadowEntry({
    title: 'Reviewed Shadow hypothesis',
    type: 'insight',
    layer: 'shadow',
    content: 'Пользователь явно предпочитает прямые формулировки.',
    evidence: [{
      source: 'turn:42',
      inference: 'Explicitly stated preference',
      fact: 'true',
      trace: 'message:7',
    }],
    sift: {
      source: 'turn:42',
      inference: 'Explicitly stated preference',
      fact: 'true',
      trace: 'message:7',
    },
    ...overrides,
  });
}

function grantPromotionConsent(): ConsentReceipt {
  const receipt = symbiosisService.grantConsent(
    'memory.promote.shadow',
    'Перенести одну выбранную и проверенную запись Shadow в Archive.',
  );
  if (!receipt) throw new Error('test consent was not granted');
  return receipt;
}

describe('shadowPromotionService policy boundary', () => {
  beforeEach(() => {
    localStorageMock.clear();
    vi.clearAllMocks();
    symbiosisService.completeOnboarding('CONSENTED');
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('blocks before mutation when current scoped consent is missing', () => {
    const shadow = addReviewedShadow();

    const result = shadowPromotionService.promote({
      node: shadow,
      userConfirmed: true,
      consent: null,
    });

    expect(result.ok).toBe(false);
    expect(result.reasons).toContain('current_consent_receipt_missing');
    expect(memoryService.getShadow().map(node => node.id)).toContain(shadow.id);
    expect(memoryService.getArchive()).toEqual([]);
    expect(symbiosisService.getActionReceipts()).toEqual([]);
  });

  it('blocks before mutation when evidence or SIFT PASS is missing', () => {
    const shadow = addReviewedShadow({ evidence: [], sift: undefined });
    const consent = grantPromotionConsent();

    const result = shadowPromotionService.promote({
      node: shadow,
      userConfirmed: true,
      consent,
    });

    expect(result.ok).toBe(false);
    expect(result.reasons).toEqual(expect.arrayContaining(['evidence_missing', 'sift_not_pass']));
    expect(memoryService.getShadow().map(node => node.id)).toContain(shadow.id);
    expect(memoryService.getArchive()).toEqual([]);
  });

  it('uses the system clock and rejects an expired consent receipt', () => {
    vi.useFakeTimers();
    vi.setSystemTime('2026-07-15T12:00:00.000Z');
    const shadow = addReviewedShadow();
    const consent = grantPromotionConsent();
    vi.setSystemTime('2026-07-15T12:16:00.000Z');

    const result = shadowPromotionService.promote({
      node: shadow,
      userConfirmed: true,
      consent,
    });

    expect(result.ok).toBe(false);
    expect(result.reasons).toContain('current_consent_receipt_missing');
    expect(memoryService.getShadow().map(node => node.id)).toContain(shadow.id);
    expect(memoryService.getArchive()).toEqual([]);
  });

  it('promotes only after policy PASS and records a verified read-back receipt', () => {
    const shadow = addReviewedShadow();
    const consent = grantPromotionConsent();

    const result = shadowPromotionService.promote({
      node: shadow,
      userConfirmed: true,
      consent,
    });

    expect(result.ok).toBe(true);
    expect(result.promotedNode?.layer).toBe('archive');
    expect(memoryService.getShadow().map(node => node.id)).not.toContain(shadow.id);
    expect(memoryService.getArchive().map(node => node.id)).toContain(result.promotedNode?.id);
    expect(symbiosisService.getActionReceipts()).toEqual([
      expect.objectContaining({
        action: 'memory.promote.shadow',
        permission_ref: consent.id,
        result: 'DONE',
        read_back: 'VERIFIED',
      }),
    ]);
  });

  it('does not reuse an ASK_EACH consent receipt for a second promotion', () => {
    const first = addReviewedShadow({ title: 'First' });
    const second = addReviewedShadow({ title: 'Second' });
    const consent = grantPromotionConsent();

    expect(shadowPromotionService.promote({
      node: first,
      userConfirmed: true,
      consent,
    }).ok).toBe(true);

    const repeated = shadowPromotionService.promote({
      node: second,
      userConfirmed: true,
      consent,
    });

    expect(repeated.ok).toBe(false);
    expect(repeated.reasons).toContain('consent_receipt_already_used');
    expect(memoryService.getShadow().map(node => node.id)).toContain(second.id);
  });
});
