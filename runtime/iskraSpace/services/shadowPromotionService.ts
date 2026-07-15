import {
  evaluateShadowPromotion,
  evaluateShadowPromotionIntent,
  type ConsentReceipt,
  type MemoryCandidate,
  type SiftGateStatus,
  type SymbiosisActionReceipt,
} from '@iskra/runtime';
import type { MemoryNode } from '../types';
import { memoryService } from './memoryService';
import { symbiosisService } from './symbiosisService';

export interface ShadowPromotionInput {
  node: MemoryNode;
  userConfirmed: boolean;
  consent: ConsentReceipt | null;
}

export interface ShadowPromotionOutcome {
  ok: boolean;
  reasons: string[];
  promotedNode: MemoryNode | null;
  receipt: SymbiosisActionReceipt | null;
}

const uniqueNonEmpty = (values: unknown[]): string[] =>
  [...new Set(values
    .filter((value): value is string => typeof value === 'string')
    .map(value => value.trim())
    .filter(Boolean))];

const evidenceRefsFor = (node: MemoryNode): string[] => uniqueNonEmpty(
  (node.evidence ?? []).flatMap(evidence => [evidence.source, evidence.trace]),
);

const claimFor = (node: MemoryNode): string => {
  if (typeof node.content === 'string') return node.content;
  try {
    return JSON.stringify(node.content) ?? '';
  } catch {
    return '';
  }
};

const candidateFor = (node: MemoryNode, sourceRefs: string[]): MemoryCandidate => ({
  id: node.id,
  layer: 'SHADOW',
  claim: claimFor(node),
  epistemic_status: node.sift?.fact === 'true' ? 'VERIFIED' : 'HYPOTHESIS',
  source_refs: sourceRefs,
  reason_for_memory: 'Explicit user-confirmed Shadow to Archive promotion.',
  requested_scope: 'memory.promote.shadow',
  sensitivity: 'PERSONAL',
  retention: 'UNTIL_REVIEW',
  created_at: node.timestamp,
  review_at: null,
});

const siftStatusFor = (node: MemoryNode): SiftGateStatus =>
  node.sift?.fact === 'true' ? 'PASS' : node.sift ? 'FAIL' : 'NOT_RUN';

export const shadowPromotionService = {
  promote(input: ShadowPromotionInput): ShadowPromotionOutcome {
    const profile = symbiosisService.getProfile();
    if (!profile) {
      return {
        ok: false,
        reasons: ['symbiosis_profile_missing'],
        promotedNode: null,
        receipt: null,
      };
    }

    const sourceRefs = evidenceRefsFor(input.node);
    const candidate = candidateFor(input.node, sourceRefs);
    const siftStatus = siftStatusFor(input.node);
    const now = new Date().toISOString();
    const preflight = evaluateShadowPromotionIntent({
      profile,
      candidate,
      sift_status: siftStatus,
      user_confirmed: input.userConfirmed,
      consent: input.consent,
      consent_already_used: input.consent
        ? symbiosisService.hasUsedConsentReceipt(input.consent.id)
        : false,
      now,
    });

    if (!preflight.ok) {
      return {
        ok: false,
        reasons: preflight.reasons,
        promotedNode: null,
        receipt: null,
      };
    }

    const promotedNode = memoryService.promoteToArchive(input.node.id);
    const readBackVerified = Boolean(
      promotedNode &&
      memoryService.getArchive().some(node => node.id === promotedNode.id) &&
      !memoryService.getShadow().some(node => node.id === input.node.id),
    );
    const receipt: SymbiosisActionReceipt = {
      action: 'memory.promote.shadow',
      requested_by: 'USER',
      permission_ref: input.consent?.id ?? null,
      result: promotedNode ? 'DONE' : 'FAILED',
      read_back: readBackVerified ? 'VERIFIED' : 'MISMATCH',
      evidence_refs: sourceRefs,
    };
    const policy = evaluateShadowPromotion({
      candidate,
      sift_status: siftStatus,
      user_confirmed: input.userConfirmed,
      receipt,
    });
    const receiptRecorded = symbiosisService.recordActionReceipt(receipt);

    return {
      ok: policy.ok && receiptRecorded,
      reasons: [
        ...policy.reasons,
        ...(receiptRecorded ? [] : ['action_receipt_not_recorded']),
      ],
      promotedNode,
      receipt,
    };
  },
};
