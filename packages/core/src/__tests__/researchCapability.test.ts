import { describe, expect, it } from 'vitest';
import * as core from '../index';

type ResearchCandidate = {
  label: 'HYP' | 'INTERP';
  statement: string;
  provenance: string;
  verificationRoute: string;
};

type ResearchTrace = {
  capability: 'RESEARCH';
  enabled: boolean;
  question: string | null;
  evidenceGaps: readonly string[];
  candidates: readonly ResearchCandidate[];
  authority: {
    canSelectVoice: false;
    canChangeFactStatus: false;
    canChangePermission: false;
    canPersist: false;
  };
};

type CreateResearchTrace = (input: {
  enabled?: boolean;
  question?: string;
  evidenceGaps?: readonly string[];
  candidates?: readonly ResearchCandidate[];
}) => ResearchTrace;

const createResearchTrace = (core as typeof core & {
  createResearchTrace?: CreateResearchTrace;
}).createResearchTrace;

describe('RESEARCH router capability', () => {
  it('is disabled by default and never introduces authority', () => {
    expect(createResearchTrace).toBeTypeOf('function');

    const trace = createResearchTrace!({});

    expect(trace).toMatchObject({
      capability: 'RESEARCH',
      enabled: false,
      question: null,
      evidenceGaps: [],
      candidates: [],
      authority: {
        canSelectVoice: false,
        canChangeFactStatus: false,
        canChangePermission: false,
        canPersist: false,
      },
    });
  });

  it('requires question, evidence gaps and verification routes when enabled', () => {
    expect(createResearchTrace).toBeTypeOf('function');

    expect(() => createResearchTrace!({
      enabled: true,
      question: 'What is unknown?',
      evidenceGaps: [],
      candidates: [],
    })).toThrow(/evidence gap/i);

    expect(() => createResearchTrace!({
      enabled: true,
      question: 'What is unknown?',
      evidenceGaps: ['No current receipt'],
      candidates: [{
        label: 'HYP',
        statement: 'The receipt may be stale.',
        provenance: 'local working tree',
        verificationRoute: '',
      }],
    })).toThrow(/verification route/i);
  });

  it('records only typed candidates and preserves the nine-voice boundary', () => {
    expect(createResearchTrace).toBeTypeOf('function');

    const trace = createResearchTrace!({
      enabled: true,
      question: 'Which receipt is current?',
      evidenceGaps: ['No fresh GitHub read-back'],
      candidates: [
        {
          label: 'INTERP',
          statement: 'The local receipt can be stale.',
          provenance: 'local RELEASE_STATUS.md',
          verificationRoute: 'read GitHub commit and Actions status',
        },
        {
          label: 'HYP',
          statement: 'The remote branch may have advanced.',
          provenance: 'unverified branch reference',
          verificationRoute: 'git fetch origin main',
        },
      ],
    });

    expect(trace.candidates.map(candidate => candidate.label)).toEqual(['INTERP', 'HYP']);
    expect(trace.authority.canSelectVoice).toBe(false);
    expect(core.VOICES).toHaveLength(9);
    expect(core.VOICES.some(voice => voice.id === 'RESEARCH')).toBe(false);
  });
});
