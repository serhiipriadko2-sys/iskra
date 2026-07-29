import type { SymbiosisPermissionKey } from '@iskra/runtime';
import {
  isBetaCapabilityEnabled,
  type BetaCapability,
} from '../config/betaCapabilities';
import { trackEvent } from './analytics';
import { captureMessage } from './errorTracking';
import { symbiosisService } from './symbiosisService';
import type {
  AiInteractionBoundaryHooks,
  AiInteractionReceipt,
  AiInteractionRoute,
} from './aiInteractionCoordinator';

const CAPABILITY_BY_ROUTE: Partial<Record<AiInteractionRoute, BetaCapability>> = {
  'speech.synthesize': 'textToSpeech',
};

const CONSENT_SCOPE_BY_ROUTE: Partial<Record<AiInteractionRoute, SymbiosisPermissionKey>> = {
  'conversation.analyze': 'depth.surgery',
  'research.deep': 'depth.surgery',
  'focus.artifact': 'depth.surgery',
};

interface ConsentReference {
  id: string;
}

export interface AiInteractionHookDependencies {
  isCapabilityEnabled(capability: BetaCapability): boolean;
  getCurrentConsent(scope: SymbiosisPermissionKey): ConsentReference | null;
  trackReceipt(event: string, properties: Record<string, unknown>): void;
  captureFailure(message: string, level: 'warning' | 'error'): void;
}

const defaultDependencies: AiInteractionHookDependencies = {
  isCapabilityEnabled: isBetaCapabilityEnabled,
  getCurrentConsent: (scope) => symbiosisService.getCurrentConsent(scope),
  trackReceipt: trackEvent,
  captureFailure: captureMessage,
};

const receiptProperties = (
  receipt: AiInteractionReceipt,
): Record<string, unknown> => ({
  route: receipt.route,
  method: receipt.method,
  outcome: receipt.outcome,
  duration_ms: receipt.durationMs,
  deadline_ms: receipt.deadlineMs,
  error_code: receipt.errorCode ?? 'NONE',
});

const failureLevel = (
  receipt: AiInteractionReceipt,
): 'warning' | 'error' =>
  receipt.outcome === 'FAILED' || receipt.outcome === 'TIMED_OUT'
    ? 'error'
    : 'warning';

export function createDefaultAiInteractionBoundaryHooks(
  dependencies: AiInteractionHookDependencies = defaultDependencies,
): AiInteractionBoundaryHooks {
  return {
    policy: (context) => {
      const capability = CAPABILITY_BY_ROUTE[context.route];
      if (capability && !dependencies.isCapabilityEnabled(capability)) {
        return {
          allowed: false,
          reason: `capability-disabled:${capability}`,
        };
      }
      return { allowed: true };
    },

    consent: (context) => {
      const scope = CONSENT_SCOPE_BY_ROUTE[context.route];
      if (!scope) return { allowed: true };

      const consent = dependencies.getCurrentConsent(scope);
      return consent
        ? { allowed: true }
        : { allowed: false, reason: `consent-required:${scope}` };
    },

    receipt: (receipt) => {
      dependencies.trackReceipt(
        'ai_interaction_receipt',
        receiptProperties(receipt),
      );

      if (receipt.outcome !== 'DONE') {
        const suffix = receipt.errorCode ? `:${receipt.errorCode}` : '';
        dependencies.captureFailure(
          `ai_interaction:${receipt.route}:${receipt.outcome}${suffix}`,
          failureLevel(receipt),
        );
      }
    },
  };
}

export const AI_INTERACTION_CONSENT_SCOPE_BY_ROUTE = Object.freeze({
  ...CONSENT_SCOPE_BY_ROUTE,
});

export const AI_INTERACTION_CAPABILITY_BY_ROUTE = Object.freeze({
  ...CAPABILITY_BY_ROUTE,
});
