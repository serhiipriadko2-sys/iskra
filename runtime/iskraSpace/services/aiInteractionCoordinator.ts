import { IskraAIService } from './geminiService';

export const AI_INTERACTION_ROUTE_POLICIES = {
  'advice.daily': { method: 'getDailyAdvice', deadlineMs: 20_000 },
  'plan.top3': { method: 'getPlanTop3', deadlineMs: 20_000 },
  'journal.prompt': { method: 'getJournalPrompt', deadlineMs: 20_000 },
  'journal.analyze': { method: 'analyzeJournalEntry', deadlineMs: 30_000 },
  'chat.policy.stream': { method: 'getChatResponseStreamWithPolicy', deadlineMs: 45_000 },
  'rune.interpret.stream': { method: 'getRuneInterpretationStream', deadlineMs: 30_000 },
  'speech.synthesize': { method: 'getTextToSpeech', deadlineMs: 20_000 },
  'embedding.generate': { method: 'getEmbedding', deadlineMs: 15_000 },
  'conversation.analyze': { method: 'analyzeConversation', deadlineMs: 30_000 },
  'research.deep': { method: 'performDeepResearch', deadlineMs: 60_000 },
  'focus.artifact': { method: 'generateFocusArtifact', deadlineMs: 30_000 },
} as const;

export type AiInteractionRoute = keyof typeof AI_INTERACTION_ROUTE_POLICIES;

type AiInteractionMethod =
  | 'getDailyAdvice'
  | 'getPlanTop3'
  | 'getJournalPrompt'
  | 'analyzeJournalEntry'
  | 'getChatResponseStreamWithPolicy'
  | 'getRuneInterpretationStream'
  | 'getTextToSpeech'
  | 'getEmbedding'
  | 'analyzeConversation'
  | 'performDeepResearch'
  | 'generateFocusArtifact';

export type AiInteractionServicePort = Pick<
  IskraAIService,
  AiInteractionMethod | 'abort'
>;

export type AiInteractionGateway = Pick<AiInteractionServicePort, AiInteractionMethod>;

export interface AiInteractionBoundaryContext {
  requestId: string;
  route: AiInteractionRoute;
  method: AiInteractionMethod;
  startedAt: string;
  deadlineMs: number;
  argumentCount: number;
}

export type AiInteractionBoundaryDecision =
  | { allowed: true }
  | { allowed: false; reason: string };

export type AiInteractionBoundaryHook = (
  context: AiInteractionBoundaryContext,
) => AiInteractionBoundaryDecision | Promise<AiInteractionBoundaryDecision>;

export type AiInteractionOutcome =
  | 'DONE'
  | 'BLOCKED'
  | 'FAILED'
  | 'TIMED_OUT'
  | 'ABORTED';

export interface AiInteractionReceipt {
  requestId: string;
  route: AiInteractionRoute;
  method: AiInteractionMethod;
  startedAt: string;
  finishedAt: string;
  durationMs: number;
  deadlineMs: number;
  outcome: AiInteractionOutcome;
  errorCode?: string;
}

export interface AiInteractionBoundaryHooks {
  policy?: AiInteractionBoundaryHook;
  consent?: AiInteractionBoundaryHook;
  receipt?: (receipt: AiInteractionReceipt) => void | Promise<void>;
}

export interface AiInteractionCoordinatorOptions {
  service?: AiInteractionServicePort;
  hooks?: AiInteractionBoundaryHooks;
  deadlineOverrides?: Partial<Record<AiInteractionRoute, number>>;
  receiptLimit?: number;
}

export class AiInteractionBoundaryError extends Error {
  readonly code: 'AI_POLICY_BLOCKED' | 'AI_CONSENT_BLOCKED';

  constructor(kind: 'policy' | 'consent', reason: string) {
    super(`AI ${kind} boundary blocked the request: ${reason}`);
    this.name = 'AiInteractionBoundaryError';
    this.code = kind === 'policy' ? 'AI_POLICY_BLOCKED' : 'AI_CONSENT_BLOCKED';
  }
}

export class AiInteractionDeadlineError extends Error {
  readonly code = 'AI_DEADLINE_EXCEEDED';

  constructor(route: AiInteractionRoute, deadlineMs: number) {
    super(`AI route ${route} exceeded its ${deadlineMs}ms deadline`);
    this.name = 'AiInteractionDeadlineError';
  }
}

export type AiInteractionCoordinator = AiInteractionGateway & {
  /** Typed compatibility facade. This is not the raw IskraAIService instance. */
  readonly service: AiInteractionGateway;
  abort(): void;
  getReceipts(): readonly AiInteractionReceipt[];
  getAllowedRoutes(): readonly AiInteractionRoute[];
};

const createRequestId = (): string => {
  const randomUuid = globalThis.crypto?.randomUUID?.();
  return randomUuid
    ? `ai_${randomUuid}`
    : `ai_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
};

const errorCode = (error: unknown): string => {
  if (error instanceof AiInteractionDeadlineError) return error.code;
  if (error instanceof AiInteractionBoundaryError) return error.code;
  if (error instanceof Error && error.name === 'AbortError') return 'AI_ABORTED';
  return error instanceof Error ? error.name : 'AI_UNKNOWN_ERROR';
};

const outcomeForError = (error: unknown): AiInteractionOutcome => {
  if (error instanceof AiInteractionDeadlineError) return 'TIMED_OUT';
  if (error instanceof AiInteractionBoundaryError) return 'BLOCKED';
  if (error instanceof Error && error.name === 'AbortError') return 'ABORTED';
  return 'FAILED';
};

export function createAiInteractionCoordinator(
  options: AiInteractionCoordinatorOptions = {},
): AiInteractionCoordinator {
  const port = options.service ?? new IskraAIService();
  const hooks = options.hooks ?? {};
  const receiptLimit = Math.max(1, options.receiptLimit ?? 100);
  const receipts: AiInteractionReceipt[] = [];

  const createContext = (
    route: AiInteractionRoute,
    argumentCount: number,
  ): { context: AiInteractionBoundaryContext; startedAtMs: number; deadlineAtMs: number } => {
    const policy = AI_INTERACTION_ROUTE_POLICIES[route];
    const startedAtMs = Date.now();
    const deadlineMs = Math.max(
      1,
      options.deadlineOverrides?.[route] ?? policy.deadlineMs,
    );
    return {
      context: Object.freeze({
        requestId: createRequestId(),
        route,
        method: policy.method,
        startedAt: new Date(startedAtMs).toISOString(),
        deadlineMs,
        argumentCount,
      }),
      startedAtMs,
      deadlineAtMs: startedAtMs + deadlineMs,
    };
  };

  const recordReceipt = async (
    context: AiInteractionBoundaryContext,
    startedAtMs: number,
    outcome: AiInteractionOutcome,
    code?: string,
  ): Promise<void> => {
    const finishedAtMs = Date.now();
    const receipt: AiInteractionReceipt = Object.freeze({
      requestId: context.requestId,
      route: context.route,
      method: context.method,
      startedAt: context.startedAt,
      finishedAt: new Date(finishedAtMs).toISOString(),
      durationMs: Math.max(0, finishedAtMs - startedAtMs),
      deadlineMs: context.deadlineMs,
      outcome,
      ...(code ? { errorCode: code } : {}),
    });

    receipts.push(receipt);
    if (receipts.length > receiptLimit) receipts.splice(0, receipts.length - receiptLimit);

    try {
      await hooks.receipt?.(receipt);
    } catch {
      console.warn('[AI boundary] receipt hook failed');
    }
  };

  const runBoundaryHook = async (
    kind: 'policy' | 'consent',
    hook: AiInteractionBoundaryHook | undefined,
    context: AiInteractionBoundaryContext,
  ): Promise<void> => {
    if (!hook) return;

    let decision: AiInteractionBoundaryDecision;
    try {
      decision = await hook(context);
    } catch {
      throw new AiInteractionBoundaryError(kind, 'hook-error');
    }

    if (!decision.allowed) {
      throw new AiInteractionBoundaryError(kind, decision.reason);
    }
  };

  const waitWithDeadline = async <T>(
    promise: Promise<T>,
    route: AiInteractionRoute,
    deadlineAtMs: number,
    deadlineMs: number,
  ): Promise<T> => {
    const remainingMs = deadlineAtMs - Date.now();
    if (remainingMs <= 0) {
      port.abort();
      throw new AiInteractionDeadlineError(route, deadlineMs);
    }

    let timer: ReturnType<typeof setTimeout> | undefined;
    const timeout = new Promise<never>((_resolve, reject) => {
      timer = setTimeout(() => {
        port.abort();
        reject(new AiInteractionDeadlineError(route, deadlineMs));
      }, remainingMs);
    });

    try {
      return await Promise.race([promise, timeout]);
    } finally {
      if (timer !== undefined) clearTimeout(timer);
    }
  };

  const executePromise = async <T>(
    route: AiInteractionRoute,
    argumentCount: number,
    operation: () => Promise<T>,
  ): Promise<T> => {
    const { context, startedAtMs, deadlineAtMs } = createContext(route, argumentCount);
    let finalized = false;

    const finalize = async (outcome: AiInteractionOutcome, code?: string) => {
      if (finalized) return;
      finalized = true;
      await recordReceipt(context, startedAtMs, outcome, code);
    };

    try {
      await runBoundaryHook('policy', hooks.policy, context);
      await runBoundaryHook('consent', hooks.consent, context);
      const value = await waitWithDeadline(
        Promise.resolve().then(operation),
        route,
        deadlineAtMs,
        context.deadlineMs,
      );
      await finalize('DONE');
      return value;
    } catch (error) {
      await finalize(outcomeForError(error), errorCode(error));
      throw error;
    }
  };

  const executeStream = async function* <TChunk, TReturn>(
    route: AiInteractionRoute,
    argumentCount: number,
    operation: () => AsyncGenerator<TChunk, TReturn>,
  ): AsyncGenerator<TChunk, TReturn> {
    const { context, startedAtMs, deadlineAtMs } = createContext(route, argumentCount);
    let finalized = false;

    const finalize = async (outcome: AiInteractionOutcome, code?: string) => {
      if (finalized) return;
      finalized = true;
      await recordReceipt(context, startedAtMs, outcome, code);
    };

    try {
      await runBoundaryHook('policy', hooks.policy, context);
      await runBoundaryHook('consent', hooks.consent, context);
      const iterator = operation();

      while (true) {
        const result = await waitWithDeadline(
          iterator.next(),
          route,
          deadlineAtMs,
          context.deadlineMs,
        );
        if (result.done) {
          await finalize('DONE');
          return result.value;
        }
        yield result.value;
      }
    } catch (error) {
      await finalize(outcomeForError(error), errorCode(error));
      throw error;
    } finally {
      if (!finalized) {
        port.abort();
        await finalize('ABORTED', 'AI_STREAM_CLOSED');
      }
    }
  };

  const gateway: AiInteractionGateway = Object.freeze({
    getDailyAdvice: (...args: Parameters<AiInteractionServicePort['getDailyAdvice']>) =>
      executePromise('advice.daily', args.length, () => port.getDailyAdvice(...args)),
    getPlanTop3: (...args: Parameters<AiInteractionServicePort['getPlanTop3']>) =>
      executePromise('plan.top3', args.length, () => port.getPlanTop3(...args)),
    getJournalPrompt: (...args: Parameters<AiInteractionServicePort['getJournalPrompt']>) =>
      executePromise('journal.prompt', args.length, () => port.getJournalPrompt(...args)),
    analyzeJournalEntry: (...args: Parameters<AiInteractionServicePort['analyzeJournalEntry']>) =>
      executePromise('journal.analyze', args.length, () => port.analyzeJournalEntry(...args)),
    getChatResponseStreamWithPolicy: (
      ...args: Parameters<AiInteractionServicePort['getChatResponseStreamWithPolicy']>
    ) => executeStream(
      'chat.policy.stream',
      args.length,
      () => port.getChatResponseStreamWithPolicy(...args),
    ),
    getRuneInterpretationStream: (
      ...args: Parameters<AiInteractionServicePort['getRuneInterpretationStream']>
    ) => executeStream(
      'rune.interpret.stream',
      args.length,
      () => port.getRuneInterpretationStream(...args),
    ),
    getTextToSpeech: (...args: Parameters<AiInteractionServicePort['getTextToSpeech']>) =>
      executePromise('speech.synthesize', args.length, () => port.getTextToSpeech(...args)),
    getEmbedding: (...args: Parameters<AiInteractionServicePort['getEmbedding']>) =>
      executePromise('embedding.generate', args.length, () => port.getEmbedding(...args)),
    analyzeConversation: (...args: Parameters<AiInteractionServicePort['analyzeConversation']>) =>
      executePromise('conversation.analyze', args.length, () => port.analyzeConversation(...args)),
    performDeepResearch: (...args: Parameters<AiInteractionServicePort['performDeepResearch']>) =>
      executePromise('research.deep', args.length, () => port.performDeepResearch(...args)),
    generateFocusArtifact: (...args: Parameters<AiInteractionServicePort['generateFocusArtifact']>) =>
      executePromise('focus.artifact', args.length, () => port.generateFocusArtifact(...args)),
  });

  return Object.freeze({
    ...gateway,
    service: gateway,
    abort: () => port.abort(),
    getReceipts: () => Object.freeze([...receipts]),
    getAllowedRoutes: () => Object.freeze(
      Object.keys(AI_INTERACTION_ROUTE_POLICIES) as AiInteractionRoute[],
    ),
  });
}

export const aiInteractionCoordinator = createAiInteractionCoordinator();

export default aiInteractionCoordinator;
