import { describe, expect, it, vi } from 'vitest';
import {
  createDefaultAiInteractionBoundaryHooks,
  type AiInteractionHookDependencies,
} from '../aiInteractionBoundaryHooks';
import type {
  AiInteractionBoundaryContext,
  AiInteractionReceipt,
} from '../aiInteractionCoordinator';

const createDependencies = (): AiInteractionHookDependencies => ({
  isCapabilityEnabled: vi.fn(() => true),
  getCurrentConsent: vi.fn(() => null),
  trackReceipt: vi.fn(),
  captureFailure: vi.fn(),
});

const context = (
  route: AiInteractionBoundaryContext['route'],
  method: AiInteractionBoundaryContext['method'],
): AiInteractionBoundaryContext => ({
  requestId: 'ai_test',
  route,
  method,
  startedAt: '2026-07-29T00:00:00.000Z',
  deadlineMs: 1_000,
  argumentCount: 1,
});

describe('default AI interaction boundary hooks', () => {
  it('blocks disabled closed-beta capabilities before provider execution', async () => {
    const dependencies = createDependencies();
    vi.mocked(dependencies.isCapabilityEnabled).mockReturnValue(false);
    const hooks = createDefaultAiInteractionBoundaryHooks(dependencies);

    expect(await hooks.policy?.(
      context('speech.synthesize', 'getTextToSpeech'),
    )).toEqual({
      allowed: false,
      reason: 'capability-disabled:textToSpeech',
    });

    expect(dependencies.isCapabilityEnabled).toHaveBeenCalledWith('textToSpeech');
  });

  it('requires a current depth.surgery receipt for deep-processing routes', async () => {
    const dependencies = createDependencies();
    const hooks = createDefaultAiInteractionBoundaryHooks(dependencies);
    const research = context('research.deep', 'performDeepResearch');

    expect(await hooks.consent?.(research)).toEqual({
      allowed: false,
      reason: 'consent-required:depth.surgery',
    });

    vi.mocked(dependencies.getCurrentConsent).mockReturnValue({ id: 'consent-1' });
    expect(await hooks.consent?.(research)).toEqual({ allowed: true });
  });

  it('emits content-free receipt telemetry and reports non-success outcomes', async () => {
    const dependencies = createDependencies();
    const hooks = createDefaultAiInteractionBoundaryHooks(dependencies);
    const receipt: AiInteractionReceipt = {
      requestId: 'ai_test',
      route: 'research.deep',
      method: 'performDeepResearch',
      startedAt: '2026-07-29T00:00:00.000Z',
      finishedAt: '2026-07-29T00:00:01.000Z',
      durationMs: 1_000,
      deadlineMs: 60_000,
      outcome: 'BLOCKED',
      errorCode: 'AI_CONSENT_BLOCKED',
    };

    await hooks.receipt?.(receipt);

    expect(dependencies.trackReceipt).toHaveBeenCalledWith(
      'ai_interaction_receipt',
      expect.objectContaining({
        route: 'research.deep',
        outcome: 'BLOCKED',
        error_code: 'AI_CONSENT_BLOCKED',
      }),
    );
    const properties = vi.mocked(dependencies.trackReceipt).mock.calls[0][1];
    expect(properties).not.toHaveProperty('requestId');
    expect(properties).not.toHaveProperty('prompt');
    expect(properties).not.toHaveProperty('content');

    expect(dependencies.captureFailure).toHaveBeenCalledWith(
      'ai_interaction:research.deep:BLOCKED:AI_CONSENT_BLOCKED',
      'warning',
    );
  });
});
