import { describe, expect, it, vi } from 'vitest';
import {
  AI_INTERACTION_ROUTE_POLICIES,
  aiInteractionCoordinator,
  createAiInteractionCoordinator,
  type AiInteractionServicePort,
} from '../aiInteractionCoordinator';

describe('aiInteractionCoordinator enforcement boundary', () => {
  it('exposes typed gateway methods without a service compatibility facade', () => {
    expect('service' in aiInteractionCoordinator).toBe(false);
    expect(typeof aiInteractionCoordinator.getDailyAdvice).toBe('function');
    expect(typeof aiInteractionCoordinator.getChatResponseStreamWithPolicy).toBe('function');
    expect(typeof aiInteractionCoordinator.getEmbedding).toBe('function');
    expect(typeof aiInteractionCoordinator.abort).toBe('function');
  });

  it('exposes exactly the configured route allowlist', () => {
    expect(aiInteractionCoordinator.getAllowedRoutes()).toEqual(
      Object.keys(AI_INTERACTION_ROUTE_POLICIES),
    );
  });

  it('delegates lifecycle abort to the private service port', () => {
    expect(() => aiInteractionCoordinator.abort()).not.toThrow();
  });

  it('wires the default closed-beta policy hook', async () => {
    await expect(
      aiInteractionCoordinator.getTextToSpeech('test'),
    ).rejects.toMatchObject({ code: 'AI_POLICY_BLOCKED' });
  });

  it('wires the default symbiosis consent hook', async () => {
    localStorage.clear();
    await expect(
      aiInteractionCoordinator.performDeepResearch('test', [], 'research'),
    ).rejects.toMatchObject({ code: 'AI_CONSENT_BLOCKED' });
  });
});

const createPort = (): AiInteractionServicePort => ({
  getDailyAdvice: vi.fn(async () => ({ insight: 'ok', microStep: 'go' })),
  getPlanTop3: vi.fn(async () => ({ tasks: [] })),
  getJournalPrompt: vi.fn(async () => ({ question: 'q', why: 'w' })),
  analyzeJournalEntry: vi.fn(async () => ({
    reflection: 'r',
    mood: 'm',
    signature: 's',
  })),
  getChatResponseStreamWithPolicy: vi.fn(),
  getRuneInterpretationStream: vi.fn(),
  getTextToSpeech: vi.fn(async () => ''),
  getEmbedding: vi.fn(async () => []),
  analyzeConversation: vi.fn(async () => ({ summary: '' })),
  performDeepResearch: vi.fn(async () => ({ title: '' })),
  generateFocusArtifact: vi.fn(async () => ({
    title: '',
    description: '',
    action: '',
    rune: '',
  })),
  abort: vi.fn(),
} as unknown as AiInteractionServicePort);

describe('aiInteractionCoordinator hook execution', () => {
  it('fails closed before provider execution and records a blocked receipt', async () => {
    const port = createPort();
    const receipt = vi.fn();
    const coordinator = createAiInteractionCoordinator({
      service: port,
      hooks: {
        policy: () => ({ allowed: false, reason: 'test-policy' }),
        receipt,
      },
    });

    await expect(coordinator.getPlanTop3()).rejects.toMatchObject({
      code: 'AI_POLICY_BLOCKED',
    });
    expect(port.getPlanTop3).not.toHaveBeenCalled();
    expect(receipt).toHaveBeenCalledWith(expect.objectContaining({
      route: 'plan.top3',
      outcome: 'BLOCKED',
      errorCode: 'AI_POLICY_BLOCKED',
    }));
  });

  it('runs consent after policy and blocks without provider execution', async () => {
    const port = createPort();
    const order: string[] = [];
    const coordinator = createAiInteractionCoordinator({
      service: port,
      hooks: {
        policy: () => { order.push('policy'); return { allowed: true }; },
        consent: () => {
          order.push('consent');
          return { allowed: false, reason: 'test-consent' };
        },
      },
    });

    await expect(coordinator.getPlanTop3()).rejects.toMatchObject({
      code: 'AI_CONSENT_BLOCKED',
    });
    expect(order).toEqual(['policy', 'consent']);
    expect(port.getPlanTop3).not.toHaveBeenCalled();
  });

  it('aborts the private port and records a timed-out receipt', async () => {
    const port = createPort();
    vi.mocked(port.getPlanTop3).mockImplementation(
      () => new Promise(() => undefined),
    );
    const receipt = vi.fn();
    const coordinator = createAiInteractionCoordinator({
      service: port,
      deadlineOverrides: { 'plan.top3': 5 },
      hooks: { receipt },
    });

    await expect(coordinator.getPlanTop3()).rejects.toMatchObject({
      code: 'AI_DEADLINE_EXCEEDED',
    });
    expect(port.abort).toHaveBeenCalledOnce();
    expect(receipt).toHaveBeenCalledWith(expect.objectContaining({
      route: 'plan.top3',
      outcome: 'TIMED_OUT',
      errorCode: 'AI_DEADLINE_EXCEEDED',
    }));
  });
});
