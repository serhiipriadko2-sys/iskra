import type {
  ConsentReceipt,
  SymbiosisActionReceipt,
} from '@iskra/runtime';
import { symbiosisService } from './symbiosisService';

export const DEPTH_CONSENT_SCOPE = 'depth.surgery' as const;
export const DEPTH_CONSENT_TTL_OPTIONS = [5, 15, 60] as const;

export type DepthConsentTtlMinutes = typeof DEPTH_CONSENT_TTL_OPTIONS[number];
export type DepthAction = 'ai.research.deep' | 'ai.focus.artifact';
export type DepthActionResult = Extract<
  SymbiosisActionReceipt['result'],
  'DONE' | 'BLOCKED' | 'FAILED'
>;

export interface DepthActionReceiptResult {
  receipt: SymbiosisActionReceipt;
  stored: boolean;
  verified: boolean;
}

const verifyActionReceipt = (
  receipt: SymbiosisActionReceipt,
): boolean => symbiosisService.getActionReceipts().some(item =>
  item.action === receipt.action &&
  item.permission_ref === receipt.permission_ref &&
  item.result === receipt.result,
);

export const depthConsentService = {
  grant(summary: string, ttlMinutes: DepthConsentTtlMinutes): ConsentReceipt | null {
    return symbiosisService.grantConsent(
      DEPTH_CONSENT_SCOPE,
      summary,
      ttlMinutes,
    );
  },

  deny(summary: string): ConsentReceipt | null {
    return symbiosisService.denyConsent(DEPTH_CONSENT_SCOPE, summary);
  },

  revoke(summary: string): ConsentReceipt | null {
    return symbiosisService.revokeConsent(DEPTH_CONSENT_SCOPE, summary);
  },

  getCurrent(): ConsentReceipt | null {
    return symbiosisService.getCurrentConsent(DEPTH_CONSENT_SCOPE);
  },

  recordAction(
    action: DepthAction,
    permissionRef: string,
    result: DepthActionResult,
    evidenceRefs: string[],
  ): DepthActionReceiptResult {
    const receipt: SymbiosisActionReceipt = {
      action,
      requested_by: 'USER',
      permission_ref: permissionRef,
      result,
      read_back: 'NOT_APPLICABLE',
      evidence_refs: evidenceRefs,
    };
    const stored = symbiosisService.recordActionReceipt(receipt);
    return {
      receipt,
      stored,
      verified: stored && verifyActionReceipt(receipt),
    };
  },
};
