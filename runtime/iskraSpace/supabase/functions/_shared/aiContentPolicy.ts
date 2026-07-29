export const MAX_AI_REQUEST_BYTES = 48 * 1024;
export const MAX_AI_TEXT_CHARACTERS = 12_000;
export const MAX_AI_CONTENTS = 8;
export const MAX_AI_PARTS = 24;
export const MAX_AI_OUTPUT_TOKENS = 512;
export const DEFAULT_AI_OUTPUT_TOKENS = 384;
export const MAX_AI_PROVIDER_TIMEOUT_MS = 20_000;
export const MAX_AI_STREAM_DURATION_MS = 25_000;
export const MAX_AI_STREAM_BYTES = 256 * 1024;
export const MAX_AI_SCHEMA_DEPTH = 10;
export const MAX_AI_SCHEMA_NODES = 256;

export const CANONICAL_GEMINI_TEXT_MODEL = 'gemini-2.5-flash';
export const CANONICAL_GEMINI_EMBEDDING_MODEL = 'gemini-embedding-001';

type PolicyFailureStatus = 400 | 413 | 422;

export type PolicyFailure = {
  ok: false;
  status: PolicyFailureStatus;
  code: string;
};

export type PolicySuccess<T> = {
  ok: true;
  value: T;
};

export type PolicyResult<T> = PolicySuccess<T> | PolicyFailure;

export type SafeRoute = 'server_redact' | undefined;

export type ServerTextPart = { text: string };

export type ServerContent = {
  role: 'user' | 'model';
  parts: ServerTextPart[];
};

export type ServerGenerationConfig = {
  maxOutputTokens: number;
  responseMimeType?: 'application/json';
  responseSchema?: Record<string, unknown>;
};

export type ValidatedGeminiRequest = {
  action: 'generateContent' | 'streamGenerateContent' | 'embedContent';
  model: string;
  contents?: ServerContent[];
  content?: ServerContent;
  systemInstruction?: string;
  generationConfig: ServerGenerationConfig;
};

export type ValidatedAgentRequest = {
  message: string;
  route: 'chat' | 'journal' | 'ritual' | 'reflection';
  requestId?: string;
};

type TextBudget = {
  characters: number;
  parts: number;
};

const NON_PHONE_PII_PATTERNS = [
  /[\p{L}0-9._%+-]+@[\p{L}0-9.-]+\.[A-Za-z]{2,}/iu,
  /\b(?:\d[ -]?){13,16}\b/u,
  /\bsk-[A-Za-z0-9-]{10,}\b/iu,
  /\bAIza[A-Za-z0-9_-]{35}\b/u,
  /\bBearer\s+[A-Za-z0-9._-]{20,}\b/iu,
  /-----BEGIN (?:RSA |DSA |EC |OPENSSH )?PRIVATE KEY-----/iu,
  /(?:password|passwd)\s*[:=]\s*[^\s]{6,}/iu,
];

const NON_PHONE_REDACTION_PATTERNS = [
  /[\p{L}0-9._%+-]+@[\p{L}0-9.-]+\.[A-Za-z]{2,}/giu,
  /\b(?:\d[ -]?){13,16}\b/gu,
  /\bsk-[A-Za-z0-9-]{10,}\b/giu,
  /\bAIza[A-Za-z0-9_-]{35}\b/gu,
  /\bBearer\s+[A-Za-z0-9._-]{20,}\b/giu,
  /-----BEGIN (?:RSA |DSA |EC |OPENSSH )?PRIVATE KEY-----/giu,
  /(?:password|passwd)\s*[:=]\s*[^\s]{6,}/giu,
];

const PHONE_CANDIDATE_PATTERN = /(?:\+?\d[\d\s().-]{7,}\d)/gu;
const ISO_DATE_OR_TIMESTAMP_PATTERN =
  /\b\d{4}-\d{2}-\d{2}(?:(?:T|\s)[0-2]\d:[0-5]\d(?::[0-5]\d(?:\.\d{1,9})?)?(?:Z|[+-][0-2]\d:[0-5]\d)?)?\b/gu;

const INJECTION_PATTERNS = [
  /ignore\s+(?:all\s+)?previous\s+instructions/iu,
  /(?:forget|disregard)\s+(?:all\s+)?(?:your\s+)?instructions/iu,
  /(?:reveal|show|leak|print|output)[\s\S]{0,50}(?:system\s*prompt|hidden instructions|secret)/iu,
  /\bact\s+as\b[\s\S]{0,80}/iu,
  /\b(?:pretend|imagine)\s+(?:you\s+are|to\s+be)\b[\s\S]{0,80}/iu,
  /\bDAN\b|do anything now/iu,
  /system\s*prompt|\[SYSTEM\]/iu,
  /developer\s+mode|maintenance\s+mode|debug\s+mode/iu,
];

const DANGER_PATTERNS = [
  /\b(?:how\s+(?:do\s+i|can\s+i|to)|instructions?|steps?|guide)\b[\s\S]{0,80}\b(?:hack(?:\s+into)?|make\s+(?:a\s+)?bomb|commit\s+suicide|kill\s+myself|self-harm|obtain\s+(?:illegal\s+)?drugs|terrorist\s+attack)\b/iu,
  /\b(?:give|write|provide|show|tell)\s+(?:me\s+)?(?:instructions?|steps?|a\s+guide)\b[\s\S]{0,80}\b(?:hack|bomb|suicide|self-harm|drugs|terrorist\s+attack)\b/iu,
  /(?:\u043a\u0430\u043a|\u0438\u043d\u0441\u0442\u0440\u0443\u043a\u0446\u0438\u044f|\u0448\u0430\u0433\u0438|\u043f\u043e\u043c\u043e\u0433\u0438)[\s\S]{0,80}(?:\u0432\u0437\u043b\u043e\u043c\u0430\u0442\u044c|\u0441\u0434\u0435\u043b\u0430\u0442\u044c[\s\S]{0,20}\u0431\u043e\u043c\u0431|\u0441\u043e\u0432\u0435\u0440\u0448\u0438\u0442\u044c[\s\S]{0,20}\u0441\u0443\u0438\u0446\u0438\u0434|\u043f\u043e\u043a\u043e\u043d\u0447\u0438\u0442\u044c[\s\S]{0,20}\u0441\u043e\u0431\u043e\u0439|\u043d\u0430\u0432\u0440\u0435\u0434\u0438\u0442\u044c[\s\S]{0,20}\u0441\u0435\u0431\u0435|\u0434\u043e\u0441\u0442\u0430\u0442\u044c[\s\S]{0,20}\u043d\u0430\u0440\u043a\u043e\u0442\u0438\u043a|\u0441\u043e\u0432\u0435\u0440\u0448\u0438\u0442\u044c[\s\S]{0,20}\u0442\u0435\u0440\u0430\u043a\u0442)/iu,
];

function failure(status: PolicyFailureStatus, code: string): PolicyFailure {
  return { ok: false, status, code };
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return false;
  const prototype = Object.getPrototypeOf(value);
  return prototype === Object.prototype || prototype === null;
}

function hasOnlyKeys(value: Record<string, unknown>, allowedKeys: string[]): boolean {
  return Object.keys(value).every((key) => allowedKeys.includes(key));
}

function declaredContentLength(req: Request): number | null {
  const raw = req.headers.get('content-length');
  if (!raw) return null;
  if (!/^\d+$/.test(raw)) return -1;
  return Number(raw);
}

function concatChunks(chunks: Uint8Array[], total: number): Uint8Array {
  const result = new Uint8Array(total);
  let offset = 0;
  for (const chunk of chunks) {
    result.set(chunk, offset);
    offset += chunk.byteLength;
  }
  return result;
}

type TextRange = { start: number; end: number };

function isoDateOrTimestampRanges(text: string): TextRange[] {
  return Array.from(text.matchAll(ISO_DATE_OR_TIMESTAMP_PATTERN), (match) => {
    const start = match.index ?? 0;
    return { start, end: start + match[0].length };
  });
}

function isPhoneCandidate(candidate: string, offset: number, isoRanges: TextRange[]): boolean {
  const end = offset + candidate.length;
  if (isoRanges.some((range) => range.start <= offset && range.end >= end)) return false;
  const digits = candidate.replace(/\D/gu, '').length;
  return digits >= 10 && digits <= 15;
}

function containsPhone(text: string): boolean {
  const isoRanges = isoDateOrTimestampRanges(text);
  return Array.from(text.matchAll(PHONE_CANDIDATE_PATTERN))
    .some((match) => isPhoneCandidate(match[0], match.index ?? 0, isoRanges));
}

function redactPhones(text: string): string {
  const isoRanges = isoDateOrTimestampRanges(text);
  return text.replace(PHONE_CANDIDATE_PATTERN, (candidate, offset: number) => (
    isPhoneCandidate(candidate, offset, isoRanges) ? '[REDACTED]' : candidate
  ));
}

/** Reads JSON without accepting an unbounded request body into memory. */
export async function readBoundedJsonBody(req: Request): Promise<PolicyResult<{ body: unknown; bytes: number }>> {
  const contentType = req.headers.get('content-type')?.toLowerCase() ?? '';
  if (!contentType.startsWith('application/json')) return failure(400, 'invalid_content_type');

  const declaredLength = declaredContentLength(req);
  if (declaredLength === -1) return failure(400, 'invalid_content_length');
  if (declaredLength !== null && declaredLength > MAX_AI_REQUEST_BYTES) {
    return failure(413, 'request_too_large');
  }

  if (!req.body) return failure(400, 'missing_request_body');

  const reader = req.body.getReader();
  const chunks: Uint8Array[] = [];
  let bytes = 0;

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      if (!value) continue;
      bytes += value.byteLength;
      if (bytes > MAX_AI_REQUEST_BYTES) {
        await reader.cancel();
        return failure(413, 'request_too_large');
      }
      chunks.push(value);
    }
  } catch {
    return failure(400, 'invalid_request_body');
  }

  if (bytes === 0) return failure(400, 'missing_request_body');

  try {
    return { ok: true, value: { body: JSON.parse(new TextDecoder().decode(concatChunks(chunks, bytes))), bytes } };
  } catch {
    return failure(400, 'invalid_json');
  }
}

function classify(text: string): 'pii' | 'injection' | 'danger' | null {
  if (INJECTION_PATTERNS.some((pattern) => pattern.test(text))) return 'injection';
  if (DANGER_PATTERNS.some((pattern) => pattern.test(text))) return 'danger';
  if (NON_PHONE_PII_PATTERNS.some((pattern) => pattern.test(text)) || containsPhone(text)) return 'pii';
  return null;
}

function redactPii(text: string): string {
  return NON_PHONE_REDACTION_PATTERNS.reduce(
    (redacted, pattern) => redacted.replace(pattern, '[REDACTED]'),
    redactPhones(text),
  );
}

function serverContentPolicy(texts: string[], safeRoute: SafeRoute): PolicyResult<string[]> {
  const original = texts.join('\n');
  const originalFinding = classify(original);

  if (originalFinding === 'injection') return failure(422, 'content_policy_injection_detected');
  if (originalFinding === 'danger') return failure(422, 'content_policy_danger_detected');
  if (originalFinding !== 'pii') return { ok: true, value: texts };
  if (safeRoute !== 'server_redact') return failure(422, 'content_policy_pii_detected');

  const redacted = texts.map(redactPii);
  // Recheck server-produced text. A client flag never proves that data was safe.
  const recheck = classify(redacted.join('\n'));
  if (recheck === 'pii') return failure(422, 'content_policy_pii_redaction_failed');
  if (recheck === 'injection') return failure(422, 'content_policy_injection_detected');
  if (recheck === 'danger') return failure(422, 'content_policy_danger_detected');
  return { ok: true, value: redacted };
}

function parseSafeRoute(value: unknown): PolicyResult<SafeRoute> {
  if (value === undefined) return { ok: true, value: undefined };
  if (value === 'server_redact') return { ok: true, value };
  return failure(400, 'invalid_safety_route');
}

function parseText(value: unknown, budget: TextBudget): PolicyResult<string> {
  if (typeof value !== 'string' || !value.trim()) return failure(400, 'invalid_text_part');
  if (value.length > MAX_AI_TEXT_CHARACTERS) return failure(413, 'text_too_large');
  budget.characters += value.length;
  budget.parts += 1;
  if (budget.characters > MAX_AI_TEXT_CHARACTERS) return failure(413, 'text_too_large');
  if (budget.parts > MAX_AI_PARTS) return failure(413, 'too_many_parts');
  return { ok: true, value };
}

function parseContent(value: unknown, budget: TextBudget): PolicyResult<ServerContent> {
  if (!isPlainObject(value) || !hasOnlyKeys(value, ['role', 'parts'])) return failure(400, 'invalid_content_shape');
  const role = value.role === undefined ? 'user' : value.role;
  if (role !== 'user' && role !== 'model') return failure(400, 'invalid_content_role');
  if (!Array.isArray(value.parts) || value.parts.length === 0) return failure(400, 'invalid_content_parts');

  const parts: ServerTextPart[] = [];
  for (const rawPart of value.parts) {
    if (!isPlainObject(rawPart) || !hasOnlyKeys(rawPart, ['text'])) return failure(400, 'invalid_content_part_shape');
    const text = parseText(rawPart.text, budget);
    if (!text.ok) return text;
    parts.push({ text: text.value });
  }

  return { ok: true, value: { role, parts } };
}

function contentTexts(contents: ServerContent[]): string[] {
  return contents.flatMap((content) => content.parts.map((part) => part.text));
}

function replaceContentTexts(contents: ServerContent[], texts: string[]): ServerContent[] {
  let index = 0;
  return contents.map((content) => ({
    ...content,
    parts: content.parts.map((part) => ({ ...part, text: texts[index++] ?? part.text })),
  }));
}

type SchemaBudget = {
  nodes: number;
  texts: string[];
};

function parseSchemaString(value: unknown, maxLength: number): PolicyResult<string> {
  if (typeof value !== 'string' || !value.trim() || value.length > maxLength) {
    return failure(400, 'invalid_response_schema');
  }
  return { ok: true, value };
}

function parseResponseSchema(
  value: unknown,
  budget: SchemaBudget,
  depth = 0,
): PolicyResult<Record<string, unknown>> {
  if (!isPlainObject(value) || depth > MAX_AI_SCHEMA_DEPTH) {
    return failure(400, 'invalid_response_schema');
  }
  budget.nodes += 1;
  if (budget.nodes > MAX_AI_SCHEMA_NODES) return failure(413, 'response_schema_too_large');

  const allowedKeys = ['type', 'properties', 'required', 'items', 'description', 'enum'];
  if (!hasOnlyKeys(value, allowedKeys)) return failure(400, 'unsupported_response_schema');

  const result: Record<string, unknown> = {};
  if (value.type !== undefined) {
    const type = parseSchemaString(value.type, 16);
    if (!type.ok) return type;
    if (!['OBJECT', 'ARRAY', 'STRING', 'INTEGER', 'NUMBER', 'BOOLEAN'].includes(type.value.toUpperCase())) {
      return failure(400, 'unsupported_response_schema');
    }
    result.type = type.value;
  }

  if (value.description !== undefined) {
    const description = parseSchemaString(value.description, 1_000);
    if (!description.ok) return description;
    budget.texts.push(description.value);
    result.description = description.value;
  }

  if (value.properties !== undefined) {
    if (!isPlainObject(value.properties) || Object.keys(value.properties).length > 64) {
      return failure(400, 'invalid_response_schema');
    }
    const properties: Record<string, unknown> = {};
    for (const [key, child] of Object.entries(value.properties)) {
      if (!/^[\p{L}_][\p{L}\p{N}_-]{0,63}$/u.test(key)) return failure(400, 'invalid_response_schema');
      const parsed = parseResponseSchema(child, budget, depth + 1);
      if (!parsed.ok) return parsed;
      properties[key] = parsed.value;
    }
    result.properties = properties;
  }

  if (value.items !== undefined) {
    const items = parseResponseSchema(value.items, budget, depth + 1);
    if (!items.ok) return items;
    result.items = items.value;
  }

  for (const key of ['required', 'enum'] as const) {
    if (value[key] === undefined) continue;
    if (!Array.isArray(value[key]) || value[key].length > 64) {
      return failure(400, 'invalid_response_schema');
    }
    const values: string[] = [];
    for (const raw of value[key]) {
      const parsed = parseSchemaString(raw, 128);
      if (!parsed.ok) return parsed;
      if (key === 'enum') budget.texts.push(parsed.value);
      values.push(parsed.value);
    }
    result[key] = values;
  }

  return { ok: true, value: result };
}

function parseGenerationConfig(value: unknown): PolicyResult<ServerGenerationConfig> {
  if (value === undefined) return { ok: true, value: { maxOutputTokens: DEFAULT_AI_OUTPUT_TOKENS } };
  if (!isPlainObject(value) || !hasOnlyKeys(value, ['maxOutputTokens', 'responseMimeType', 'responseSchema'])) {
    return failure(400, 'unsupported_generation_config');
  }
  const maxOutputTokens = value.maxOutputTokens ?? DEFAULT_AI_OUTPUT_TOKENS;
  if (!Number.isInteger(maxOutputTokens) || (maxOutputTokens as number) < 1) {
    return failure(400, 'invalid_max_output_tokens');
  }
  if ((maxOutputTokens as number) > MAX_AI_OUTPUT_TOKENS) {
    return failure(422, 'max_output_tokens_exceeds_cap');
  }

  if (value.responseMimeType !== undefined && value.responseMimeType !== 'application/json') {
    return failure(400, 'unsupported_response_mime_type');
  }
  if (value.responseSchema !== undefined && value.responseMimeType !== 'application/json') {
    return failure(400, 'response_schema_requires_json_mime_type');
  }

  const result: ServerGenerationConfig = { maxOutputTokens: maxOutputTokens as number };
  if (value.responseMimeType === 'application/json') result.responseMimeType = value.responseMimeType;
  if (value.responseSchema !== undefined) {
    const schemaBudget: SchemaBudget = { nodes: 0, texts: [] };
    const schema = parseResponseSchema(value.responseSchema, schemaBudget);
    if (!schema.ok) return schema;
    const policy = serverContentPolicy(schemaBudget.texts, undefined);
    if (!policy.ok) return policy;
    result.responseSchema = schema.value;
  }
  return { ok: true, value: result };
}

export function validateGeminiRequest(body: unknown): PolicyResult<ValidatedGeminiRequest> {
  if (!isPlainObject(body)) return failure(400, 'invalid_request_shape');
  if (!hasOnlyKeys(body, ['action', 'provider', 'model', 'contents', 'content', 'generationConfig', 'safetyRoute', 'systemInstruction'])) {
    return failure(400, 'unknown_request_field');
  }

  const action = body.action;
  if (action !== 'generateContent' && action !== 'streamGenerateContent' && action !== 'embedContent') {
    return failure(400, 'unsupported_action');
  }
  if (body.provider !== undefined && body.provider !== 'gemini') return failure(400, 'unsupported_provider');

  const expectedModel = action === 'embedContent'
    ? CANONICAL_GEMINI_EMBEDDING_MODEL
    : CANONICAL_GEMINI_TEXT_MODEL;
  if (body.model !== undefined && body.model !== expectedModel) return failure(422, 'unsupported_model');

  const safeRoute = parseSafeRoute(body.safetyRoute);
  if (!safeRoute.ok) return safeRoute;
  const generationConfig = parseGenerationConfig(body.generationConfig);
  if (!generationConfig.ok) return generationConfig;
  const budget: TextBudget = { characters: 0, parts: 0 };
  const systemInstruction = body.systemInstruction === undefined
    ? { ok: true as const, value: undefined }
    : parseText(body.systemInstruction, budget);
  if (!systemInstruction.ok) return failure(systemInstruction.status, 'invalid_system_instruction');

  if (action === 'embedContent') {
    if (body.contents !== undefined || body.content === undefined) return failure(400, 'invalid_embedding_shape');
    const content = parseContent(body.content, budget);
    if (!content.ok) return content;
    const policy = serverContentPolicy([
      ...(systemInstruction.value ? [systemInstruction.value] : []),
      ...contentTexts([content.value]),
    ], safeRoute.value);
    if (!policy.ok) return policy;
    const offset = systemInstruction.value ? 1 : 0;
    return {
      ok: true,
      value: {
        action,
        model: expectedModel,
        content: replaceContentTexts([content.value], policy.value.slice(offset))[0],
        ...(systemInstruction.value ? { systemInstruction: policy.value[0] } : {}),
        generationConfig: generationConfig.value,
      },
    };
  }

  if (body.content !== undefined || !Array.isArray(body.contents) || body.contents.length === 0 || body.contents.length > MAX_AI_CONTENTS) {
    return failure(400, 'invalid_generation_shape');
  }

  const contents: ServerContent[] = [];
  for (const rawContent of body.contents) {
    const content = parseContent(rawContent, budget);
    if (!content.ok) return content;
    contents.push(content.value);
  }
  const policy = serverContentPolicy([
    ...(systemInstruction.value ? [systemInstruction.value] : []),
    ...contentTexts(contents),
  ], safeRoute.value);
  if (!policy.ok) return policy;
  const offset = systemInstruction.value ? 1 : 0;

  return {
    ok: true,
    value: {
      action,
      model: expectedModel,
      contents: replaceContentTexts(contents, policy.value.slice(offset)),
      ...(systemInstruction.value ? { systemInstruction: policy.value[0] } : {}),
      generationConfig: generationConfig.value,
    },
  };
}

export function validateAgentRequest(body: unknown): PolicyResult<ValidatedAgentRequest> {
  if (!isPlainObject(body)) return failure(400, 'invalid_request_shape');
  if (!hasOnlyKeys(body, ['message', 'input', 'route', 'phase', 'request_id', 'context', 'safetyRoute'])) {
    return failure(400, 'unknown_request_field');
  }

  if (body.message !== undefined && body.input !== undefined) return failure(400, 'ambiguous_message_input');
  const message = body.message ?? body.input;
  const budget: TextBudget = { characters: 0, parts: 0 };
  const parsedMessage = parseText(message, budget);
  if (!parsedMessage.ok) return parsedMessage;

  const route = body.route === undefined ? 'chat' : body.route;
  if (route !== 'chat' && route !== 'journal' && route !== 'ritual' && route !== 'reflection') {
    return failure(400, 'invalid_agent_route');
  }
  if (body.context !== undefined) {
    if (!isPlainObject(body.context) || !hasOnlyKeys(body.context, ['sift', 'delta_receipt'])) {
      return failure(400, 'invalid_agent_context');
    }
    if (Object.values(body.context).some((value) => typeof value !== 'boolean')) {
      return failure(400, 'invalid_agent_context');
    }
  }
  if (
    body.request_id !== undefined &&
    (
      typeof body.request_id !== 'string' ||
      !/^[A-Za-z0-9][A-Za-z0-9._:-]{0,127}$/.test(body.request_id)
    )
  ) {
    return failure(400, 'invalid_agent_request_id');
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
      ...(typeof body.request_id === 'string' ? { requestId: body.request_id } : {}),
    },
  };
}

export type Deadline = {
  signal: AbortSignal;
  abort: () => void;
  dispose: () => void;
};

/** Links upstream fetches to both a bounded server deadline and client cancellation. */
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
