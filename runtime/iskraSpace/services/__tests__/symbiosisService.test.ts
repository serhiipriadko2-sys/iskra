import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { SymbiosisActionReceipt } from '@iskra/runtime';
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
    expect(state.actionReceipts).toEqual([]);
    expect(symbiosisService.isStateless()).toBe(true);
  });

  it('persists a consented profile with ASK_EACH personal and depth permissions', () => {
    const state = symbiosisService.completeOnboarding('CONSENTED');
    expect(state.profile.memory_mode).toBe('CONSENTED');
    expect(state.profile.memory_permissions['memory.write.personal']).toBe('ASK_EACH');
    expect(state.profile.memory_permissions['depth.surgery']).toBe('ASK_EACH');
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

  it('expires depth.surgery consent at its declared boundary', () => {
    symbiosisService.completeOnboarding('CONSENTED');
    const receipt = symbiosisService.grantConsent(
      'depth.surgery',
      'Run one deep AI action',
      5,
    );
    expect(receipt?.expires_at).toBeTruthy();

    const expiresAt = Date.parse(receipt?.expires_at ?? '');
    expect(symbiosisService.getCurrentConsent(
      'depth.surgery',
      new Date(expiresAt - 1).toISOString(),
    )?.id).toBe(receipt?.id);
    expect(symbiosisService.getCurrentConsent(
      'depth.surgery',
      new Date(expiresAt).toISOString(),
    )).toBeNull();
  });

  it('records denial as the latest decision and invalidates an earlier grant', () => {
    symbiosisService.completeOnboarding('CONSENTED');
    const grant = symbiosisService.grantConsent(
      'depth.surgery',
      'Run one deep AI action',
    );
    const denial = symbiosisService.denyConsent(
      'depth.surgery',
      'User declined the deep AI action',
    );

    expect(grant?.decision).toBe('GRANTED');
    expect(denial?.decision).toBe('DENIED');
    expect(symbiosisService.getCurrentConsent('depth.surgery')).toBeNull();
    expect(symbiosisService.getReceipts().at(-1)?.id).toBe(denial?.id);
  });

  it('revokes a current depth.surgery grant and preserves the audit chain', () => {
    symbiosisService.completeOnboarding('CONSENTED');
    const grant = symbiosisService.grantConsent(
      'depth.surgery',
      'Run one deep AI action',
    );
    const revoked = symbiosisService.revokeConsent(
      'depth.surgery',
      'User revoked the deep AI action',
    );

    expect(grant?.decision).toBe('GRANTED');
    expect(revoked?.decision).toBe('REVOKED');
    expect(symbiosisService.getCurrentConsent('depth.surgery')).toBeNull();
    expect(symbiosisService.getReceipts().map(receipt => receipt.decision))
      .toEqual(['GRANTED', 'REVOKED']);
  });

  it('does not create a revoke receipt without a current grant', () => {
    symbiosisService.completeOnboarding('CONSENTED');
    expect(symbiosisService.revokeConsent(
      'depth.surgery',
      'Nothing to revoke',
    )).toBeNull();
  });

  it('retains superseded consent receipts so action permission refs stay auditable', () => {
    symbiosisService.completeOnboarding('CONSENTED');
    const first = symbiosisService.grantConsent(
      'memory.promote.shadow',
      'Promote the first reviewed Shadow record',
    );
    const second = symbiosisService.grantConsent(
      'memory.promote.shadow',
      'Promote the second reviewed Shadow record',
    );

    expect(symbiosisService.getReceipts().map(receipt => receipt.id))
      .toEqual([first?.id, second?.id]);
    expect(symbiosisService.getCurrentConsent('memory.promote.shadow')?.id).toBe(second?.id);
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

  it('records an action receipt and marks ASK_EACH consent as consumed', () => {
    symbiosisService.completeOnboarding('CONSENTED');
    const consent = symbiosisService.grantConsent(
      'memory.promote.shadow',
      'Promote one reviewed Shadow record',
    );
    const actionReceipt: SymbiosisActionReceipt = {
      action: 'memory.promote.shadow',
      requested_by: 'USER',
      permission_ref: consent?.id ?? null,
      result: 'DONE',
      read_back: 'VERIFIED',
      evidence_refs: ['turn:42'],
    };

    expect(symbiosisService.recordActionReceipt(actionReceipt)).toBe(true);
    expect(symbiosisService.getActionReceipts()).toEqual([actionReceipt]);
    expect(symbiosisService.hasUsedConsentReceipt(consent?.id ?? '')).toBe(true);
  });

  it('rejects malformed or duplicate action receipts', () => {
    symbiosisService.completeOnboarding('CONSENTED');
    const consent = symbiosisService.grantConsent(
      'memory.promote.shadow',
      'Promote one reviewed Shadow record',
    );
    const actionReceipt: SymbiosisActionReceipt = {
      action: 'memory.promote.shadow',
      requested_by: 'USER',
      permission_ref: consent?.id ?? null,
      result: 'DONE',
      read_back: 'VERIFIED',
      evidence_refs: ['turn:42'],
    };

    expect(symbiosisService.recordActionReceipt(actionReceipt)).toBe(true);
    expect(symbiosisService.recordActionReceipt(actionReceipt)).toBe(false);
    expect(symbiosisService.recordActionReceipt({
      ...actionReceipt,
      permission_ref: null,
    })).toBe(false);
  });
});
