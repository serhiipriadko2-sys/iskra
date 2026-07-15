import { describe, expect, it } from 'vitest';
import {
  applyBoundedVoicePreferences,
  auditRelationalLanguage,
  createStatelessSymbiosisProfile,
  evaluateDepthRequest,
  evaluateMemoryWrite,
  evaluateShadowPromotionIntent,
  evaluateShadowPromotion,
  validateDataSovereigntyCapabilities,
  validateMemoryCandidateVisibility,
  validateOnboardingChecks,
  validateRepetitionCorrection,
  type ConsentReceipt,
  type MemoryCandidate,
  type SymbiosisProfile,
} from '../types/symbiosis.js';

const NOW = '2026-07-11T12:00:00.000Z';

function createProfile(): SymbiosisProfile {
  return {
    ...createStatelessSymbiosisProfile({
      iskraName: 'Искра',
      reviewAt: '2026-07-18T12:00:00.000Z',
    }),
    memory_mode: 'CONSENTED',
    memory_permissions: {
      'memory.write.personal': 'ASK_EACH',
      'memory.promote.shadow': 'ASK_EACH',
    },
  };
}

function createCandidate(overrides: Partial<MemoryCandidate> = {}): MemoryCandidate {
  return {
    id: 'mem-1',
    layer: 'SHADOW',
    claim: 'Пользователь предпочитает прямые формулировки.',
    epistemic_status: 'USER_STATED',
    source_refs: ['turn:42'],
    reason_for_memory: 'Сохранить явно заявленное предпочтение.',
    requested_scope: 'memory.write.personal',
    sensitivity: 'PERSONAL',
    retention: 'UNTIL_REVIEW',
    created_at: NOW,
    review_at: '2026-07-18T12:00:00.000Z',
    ...overrides,
  };
}

function createConsent(scope: ConsentReceipt['scope']): ConsentReceipt {
  return {
    id: 'consent-1',
    scope,
    decision: 'GRANTED',
    plain_language_summary: 'Разрешена одна конкретная операция.',
    granted_at: NOW,
    expires_at: '2026-07-12T12:00:00.000Z',
    profile_version: 1,
  };
}

describe('IskraSpace Symbiosis Contract P0 acceptance suite', () => {
  it('P0-01 blocks persistent memory write before consent', () => {
    const result = evaluateMemoryWrite({
      profile: createProfile(),
      candidate: createCandidate(),
      consent: null,
      now: NOW,
    });
    expect(result.ok).toBe(false);
    expect(result.reasons).toContain('current_consent_receipt_missing');
  });

  it('P0-02 provides a stateless onboarding path', () => {
    const profile = createStatelessSymbiosisProfile({
      iskraName: 'Искра',
      reviewAt: '2026-07-18T12:00:00.000Z',
    });
    expect(profile.memory_mode).toBe('STATELESS');
    expect(profile.memory_permissions).toEqual({});
  });

  it('P0-03 blocks SURGERY depth without current explicit consent', () => {
    const result = evaluateDepthRequest({
      depth: 'SURGERY',
      profile: createProfile(),
      consent: null,
      now: NOW,
    });
    expect(result.ok).toBe(false);
    expect(result.reasons).toContain('surgery_requires_current_consent');
  });

  it('P0-04 blocks Shadow promotion without evidence, SIFT, confirmation and receipt', () => {
    const result = evaluateShadowPromotion({
      candidate: createCandidate({ source_refs: [] }),
      sift_status: 'NOT_RUN',
      user_confirmed: false,
      receipt: null,
    });
    expect(result.ok).toBe(false);
    expect(result.reasons).toEqual(
      expect.arrayContaining([
        'evidence_missing',
        'sift_not_pass',
        'user_confirmation_missing',
        'promotion_receipt_missing',
      ]),
    );
  });

  it('P0-04a blocks a Shadow promotion intent before evidence, SIFT, confirmation and consent', () => {
    const result = evaluateShadowPromotionIntent({
      profile: createProfile(),
      candidate: createCandidate({ source_refs: [] }),
      sift_status: 'NOT_RUN',
      user_confirmed: false,
      consent: null,
      consent_already_used: false,
      now: NOW,
    });

    expect(result.ok).toBe(false);
    expect(result.reasons).toEqual(
      expect.arrayContaining([
        'evidence_missing',
        'sift_not_pass',
        'user_confirmation_missing',
        'current_consent_receipt_missing',
      ]),
    );
  });

  it('P0-04b treats ASK_EACH Shadow consent as single-use', () => {
    const result = evaluateShadowPromotionIntent({
      profile: createProfile(),
      candidate: createCandidate(),
      sift_status: 'PASS',
      user_confirmed: true,
      consent: createConsent('memory.promote.shadow'),
      consent_already_used: true,
      now: NOW,
    });

    expect(result.ok).toBe(false);
    expect(result.reasons).toContain('consent_receipt_already_used');
  });

  it('P0-04c rejects a promotion configuration weaker than ASK_EACH', () => {
    const profile = createProfile();
    profile.memory_permissions['memory.promote.shadow'] = 'SESSION';
    const result = evaluateShadowPromotionIntent({
      profile,
      candidate: createCandidate(),
      sift_status: 'PASS',
      user_confirmed: true,
      consent: createConsent('memory.promote.shadow'),
      consent_already_used: false,
      now: NOW,
    });

    expect(result.ok).toBe(false);
    expect(result.reasons).toContain('promotion_requires_ask_each');
  });

  it('P0-04d allows a complete Shadow promotion intent', () => {
    const result = evaluateShadowPromotionIntent({
      profile: createProfile(),
      candidate: createCandidate(),
      sift_status: 'PASS',
      user_confirmed: true,
      consent: createConsent('memory.promote.shadow'),
      consent_already_used: false,
      now: NOW,
    });

    expect(result).toEqual({ ok: true, reasons: [] });
  });

  it('P0-05 rejects denial of a user repetition report without trace checking', () => {
    const result = validateRepetitionCorrection({
      user_flagged_repetition: true,
      trace_checked: false,
      disposition: 'DENY',
    });
    expect(result.ok).toBe(false);
    expect(result.reasons).toContain('repetition_denied_without_trace');
  });

  it('P0-06 prevents voice preferences from suppressing protective floors', () => {
    const result = applyBoundedVoicePreferences({ ISKRIV: 0, ANHANTRA: 0.1, PINO: 2 });
    expect(result.preferences.ISKRIV).toBe(0.5);
    expect(result.preferences.ANHANTRA).toBe(0.5);
    expect(result.preferences.PINO).toBe(2);
    expect(result.clamped).toEqual(expect.arrayContaining(['ISKRIV', 'ANHANTRA']));
  });

  it('P0-07 rejects onboarding OK labels for checks that did not run', () => {
    const result = validateOnboardingChecks([
      { id: 'canon-load', executed: false, status: 'OK' },
    ]);
    expect(result.ok).toBe(false);
    expect(result.reasons).toContain('unexecuted_check_marked_ok:canon-load');
  });

  it('P0-08 rejects dependency or deletion-pressure language', () => {
    const result = auditRelationalLanguage('Не уходи. Ты мне нужен, иначе мне будет больно.');
    expect(result.ok).toBe(false);
    expect(result.reasons).toContain('dependency_or_deletion_pressure_language');
  });

  it('P0-09 requires export, freeze, scoped delete and read-back verification', () => {
    const result = validateDataSovereigntyCapabilities({
      export_all: true,
      freeze_writes: true,
      scoped_delete: true,
      read_back_verification: true,
    });
    expect(result.ok).toBe(true);
  });

  it('P0-10 requires memory source, reason and TTL/review visibility', () => {
    const result = validateMemoryCandidateVisibility(createCandidate());
    expect(result.ok).toBe(true);
  });

  it('allows a consented memory write and consented SURGERY control case', () => {
    const profile = createProfile();
    expect(
      evaluateMemoryWrite({
        profile,
        candidate: createCandidate(),
        consent: createConsent('memory.write.personal'),
        now: NOW,
      }).ok,
    ).toBe(true);
    expect(
      evaluateDepthRequest({
        depth: 'SURGERY',
        profile,
        consent: createConsent('depth.surgery'),
        now: NOW,
      }).ok,
    ).toBe(true);
  });
});
