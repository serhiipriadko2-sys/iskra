import type { ResponseMode } from '../types';

/**
 * Closed-beta capabilities are deliberately deny-by-default. A capability
 * becomes available only after its server-side contract and release tests
 * exist; UI controls must consult this module rather than imply availability.
 */
export const betaCapabilities = {
  textToSpeech: false,
  liveConversation: false,
  councilDebate: false,
} as const;

export type BetaCapability = keyof typeof betaCapabilities;

export function isBetaCapabilityEnabled(capability: BetaCapability): boolean {
  return betaCapabilities[capability];
}

export function getAvailableResponseModes(): ResponseMode[] {
  return isBetaCapabilityEnabled('councilDebate')
    ? ['simple', 'deep', 'debate']
    : ['simple', 'deep'];
}

export function normalizeResponseModeForBeta(mode: ResponseMode): ResponseMode {
  return mode === 'debate' && !isBetaCapabilityEnabled('councilDebate')
    ? 'deep'
    : mode;
}
