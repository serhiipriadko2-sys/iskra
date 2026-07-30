import {
  MAX_AI_TEXT_CHARACTERS,
  failure,
  hasOnlyKeys,
  isPlainObject,
  parseSafeRoute,
  parseText,
  readBoundedRawJson,
  serverContentPolicy,
  type AiRequestKind,
  type PolicyResult,
} from './aiContentPolicyCore.ts';
import {
  validateGeminiRequest,
  type ValidatedGeminiRequest,
} from './aiContentSchemaPolicy.ts';

export * from './aiContentPolicyCore.ts';
export * from './aiContentSchemaPolicy.ts';

export type ValidatedAgentRequest = {
  message: string;
  route: 'chat' | 'journal' | 'ritual' | 'reflection';
  phase: 'runtime';
  request_id?: string;
  context: { sift: boolean; delta_receipt: boolean };
};
export type ValidatedAiRequest = ValidatedGeminiRequest | ValidatedAgentRequest;

function parseRequestId(value: unknown): PolicyResult<string | undefined> {
  if (value === undefined) return { ok: true, value: undefined };
  if (
    typeof value !== 'string' || value.length < 1 || value.length > 128 ||
    !/^[A-Za-z0-9._:-]+$/.test(value)
  ) {
    return failure(400, 'invalid_request_id');
  }
  return { ok: true, value };
}

export function validateAgentRequest(body: unknown): PolicyResult<ValidatedAgentRequest> {
  if (!isPlainObject(body)) return failure(400, 'invalid_request_shape');
  if (!hasOnlyKeys(body, [
    'message', 'input', 'route', 'phase', 'request_id', 'context', 'safetyRoute',
  ])) {
    return failure(400, 'unknown_request_field');
  }
  if (body.message !== undefined && body.input !== undefined) {
    return failure(400, 'ambiguous_message_input');
  }

  const parsedMessage = parseText(body.message ?? body.input, {
    characters: 0,
    parts: 0,
    maxCharacters: MAX_AI_TEXT_CHARACTERS,
  });
  if (!parsedMessage.ok) return parsedMessage;

  const route = body.route === undefined ? 'chat' : body.route;
  if (route !== 'chat' && route !== 'journal' && route !== 'ritual' && route !== 'reflection') {
    return failure(400, 'invalid_agent_route');
  }
  const phase = body.phase === undefined ? 'runtime' : body.phase;
  if (phase !== 'runtime') return failure(400, 'invalid_agent_phase');
  const requestId = parseRequestId(body.request_id);
  if (!requestId.ok) return requestId;

  let context = { sift: true, delta_receipt: true };
  if (body.context !== undefined) {
    if (!isPlainObject(body.context) || !hasOnlyKeys(body.context, ['sift', 'delta_receipt'])) {
      return failure(400, 'invalid_agent_context');
    }
    if (Object.values(body.context).some((value) => typeof value !== 'boolean')) {
      return failure(400, 'invalid_agent_context');
    }
    context = {
      sift: body.context.sift === undefined ? true : body.context.sift as boolean,
      delta_receipt: body.context.delta_receipt === undefined
        ? true
        : body.context.delta_receipt as boolean,
    };
  }

  const safeRoute = parseSafeRoute(body.safetyRoute);
  if (!safeRoute.ok) return safeRoute;
  const policy = serverContentPolicy([parsedMessage.value], safeRoute.value);
  if (!policy.ok) return policy;
  return {
    ok: true,
    value: {
      message: policy.value[0],
      route,
      phase,
      ...(requestId.value ? { request_id: requestId.value } : {}),
      context,
    },
  };
}

function inferRequestKind(req: Request, body: unknown): AiRequestKind | null {
  const pathname = new URL(req.url).pathname.replace(/\/+$/, '');
  if (pathname.endsWith('/gemini')) return 'gemini';
  if (pathname.endsWith('/iskra-agent')) return 'agent';
  if (isPlainObject(body) && 'action' in body) return 'gemini';
  if (isPlainObject(body) && ('message' in body || 'input' in body)) return 'agent';
  return null;
}

/** Reads a bounded body and returns only a normalized strict AI request. */
export async function readBoundedJsonBody(
  req: Request,
  kind?: AiRequestKind,
): Promise<PolicyResult<{ body: ValidatedAiRequest; bytes: number }>> {
  const raw = await readBoundedRawJson(req);
  if (!raw.ok) return raw;
  const requestKind = kind ?? inferRequestKind(req, raw.value.body);
  if (!requestKind) return failure(400, 'unknown_ai_request');
  const validated = requestKind === 'gemini'
    ? validateGeminiRequest(raw.value.body)
    : validateAgentRequest(raw.value.body);
  if (!validated.ok) return validated;
  return { ok: true, value: { body: validated.value, bytes: raw.value.bytes } };
}

export type Deadline = {
  signal: AbortSignal;
  abort: () => void;
  dispose: () => void;
};

export function createDeadline(parentSignal: AbortSignal | undefined, durationMs: number): Deadline {
  const controller = new AbortController();
  const onParentAbort = () => controller.abort();
  if (parentSignal?.aborted) controller.abort();
  else parentSignal?.addEventListener('abort', onParentAbort, { once: true });
  const timeout = setTimeout(() => controller.abort(), durationMs);
  return {
    signal: controller.signal,
    abort: () => controller.abort(),
    dispose: () => {
      clearTimeout(timeout);
      parentSignal?.removeEventListener('abort', onParentAbort);
    },
  };
}
