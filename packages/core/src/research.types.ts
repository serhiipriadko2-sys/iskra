import { IskraValidationError } from './errors/index.js';

/**
 * `RESEARCH` is a router capability. It creates a reviewable evidence trace;
 * it is not a Voice, a permission source, or a persistence mechanism.
 */
export type ResearchCandidateLabel = 'HYP' | 'INTERP';

export interface ResearchCandidate {
  label: ResearchCandidateLabel;
  statement: string;
  provenance: string;
  verificationRoute: string;
}

export interface ResearchAuthorityBoundary {
  canSelectVoice: false;
  canChangeFactStatus: false;
  canChangePermission: false;
  canPersist: false;
}

export interface ResearchTrace {
  capability: 'RESEARCH';
  enabled: boolean;
  question: string | null;
  evidenceGaps: readonly string[];
  candidates: readonly ResearchCandidate[];
  authority: ResearchAuthorityBoundary;
}

export interface ResearchTraceInput {
  enabled?: boolean;
  question?: string;
  evidenceGaps?: readonly string[];
  candidates?: readonly ResearchCandidate[];
}

const NO_RESEARCH_AUTHORITY: ResearchAuthorityBoundary = Object.freeze({
  canSelectVoice: false,
  canChangeFactStatus: false,
  canChangePermission: false,
  canPersist: false,
});

const nonBlank = (value: string | undefined): value is string =>
  typeof value === 'string' && value.trim().length > 0;

/**
 * Builds the non-sovereign trace permitted at the router layer. Callers that
 * want a persistent write, a permission decision, a factual conclusion or a
 * voice selection must use their own separately-authorized boundary.
 */
export function createResearchTrace(input: ResearchTraceInput = {}): ResearchTrace {
  if (input.enabled !== true) {
    return {
      capability: 'RESEARCH',
      enabled: false,
      question: null,
      evidenceGaps: [],
      candidates: [],
      authority: NO_RESEARCH_AUTHORITY,
    };
  }

  if (!nonBlank(input.question)) {
    throw new IskraValidationError('RESEARCH requires a question when enabled');
  }

  const evidenceGaps = [...(input.evidenceGaps ?? [])].map(gap => gap.trim());
  if (evidenceGaps.length === 0 || evidenceGaps.some(gap => gap.length === 0)) {
    throw new IskraValidationError('RESEARCH requires at least one evidence gap when enabled');
  }

  const candidates = (input.candidates ?? []).map(candidate => ({ ...candidate }));
  for (const candidate of candidates) {
    if (!nonBlank(candidate.statement) || !nonBlank(candidate.provenance)) {
      throw new IskraValidationError('RESEARCH candidates require statement and provenance');
    }
    if (!nonBlank(candidate.verificationRoute)) {
      throw new IskraValidationError('RESEARCH candidates require a verification route');
    }
  }

  return {
    capability: 'RESEARCH',
    enabled: true,
    question: input.question.trim(),
    evidenceGaps,
    candidates,
    authority: NO_RESEARCH_AUTHORITY,
  };
}
