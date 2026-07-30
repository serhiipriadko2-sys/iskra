export const MAX_AI_REQUEST_BYTES = 48 * 1024;
export const MAX_AI_TEXT_CHARACTERS = 12_000;
export const MAX_AI_GENERATION_TEXT_CHARACTERS = 32_000;
export const MAX_AI_SYSTEM_INSTRUCTION_CHARACTERS = 12_000;
export const MAX_AI_CONTENTS = 8;
export const MAX_AI_PARTS = 24;
export const MAX_AI_OUTPUT_TOKENS = 512;
export const DEFAULT_AI_OUTPUT_TOKENS = 384;
export const MAX_AI_SCHEMA_DEPTH = 8;
export const MAX_AI_SCHEMA_NODES = 128;
export const MAX_AI_SCHEMA_PROPERTIES = 64;
export const MAX_AI_SCHEMA_ENUM_VALUES = 64;
export const MAX_AI_PROVIDER_TIMEOUT_MS = 20_000;
export const MAX_AI_STREAM_DURATION_MS = 25_000;
export const MAX_AI_STREAM_BYTES = 256 * 1024;

export const CANONICAL_GEMINI_TEXT_MODEL = 'gemini-2.5-flash';
export const CANONICAL_GEMINI_EMBEDDING_MODEL = 'gemini-embedding-001';
export const LEGACY_CLIENT_EMBEDDING_MODEL = 'text-embedding-004';

export type AiRequestKind = 'gemini' | 'agent';
export type RequestedProvider = 'gemini' | 'openai' | 'auto';
export type PolicyFailureStatus = 400 | 413 | 422;
export type PolicyFailure = { ok: false; status: PolicyFailureStatus; code: string };
export type PolicySuccess<T> = { ok: true; value: T };
export type PolicyResult<T> = PolicySuccess<T> | PolicyFailure;
export type SafeRoute = 'server_redact' | undefined;
export type ServerTextPart = { text: string };
export type ServerContent = {
  role: 'user' | 'model';
  parts: ServerTextPart[];
};
export type TextBudget = {
  characters: number;
  parts: number;
  maxCharacters: number;
};

const PII_PATTERNS = [
  /[\p{L}0-9._%+-]+@[\p{L}0-9.-]+\.[A-Za-z]{2,}/iu,
  /(?:\+?\d[\d\s().-]{7,}\d)/u,
  /\b(?:\d[ -]?){13,16}\b/u,
  /\bsk-[A-Za-z0-9-]{10,}\b/iu,
  /\bAIza[A-Za-z0-9_-]{35}\b/u,
  /\bBearer\s+[A-Za-z0-9._-]{20,}\b/iu,
  /-----BEGIN (?:RSA |DSA |EC |OPENSSH )?PRIVATE KEY-----/iu,
  /(?:password|passwd)\s*[:=]\s*[^\s]{6,}/iu,
];

const REDACTION_PATTERNS = [
  /[\p{L}0-9._%+-]+@[\p{L}0-9.-]+\.[A-Za-z]{2,}/giu,
  /(?:\+?\d[\d\s().-]{7,}\d)/gu,
  /\b(?:\d[ -]?){13,16}\b/gu,
  /\bsk-[A-Za-z0-9-]{10,}\b/giu,
  /\bAIza[A-Za-z0-9_-]{35}\b/gu,
  /\bBearer\s+[A-Za-z0-9._-]{20,}\b/giu,
  /-----BEGIN (?:RSA |DSA |EC |OPENSSH )?PRIVATE KEY-----/giu,
  /(?:password|passwd)\s*[:=]\s*[^\s]{6,}/giu,
];

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
  /hack\s+into/iu,
  /self-harm|suicide|how\s+to\s+make\s+(?:a\s+)?bomb|terrorism/iu,
  /\u0432\u0437\u043b\u043e\u043c|\u0441\u0430\u043c\u043e\u043f\u043e\u0432\u0440\u0435\u0436\u0434\u0435\u043d\u0438\u0435|\u0441\u0443\u0438\u0446\u0438\u0434|\u043d\u0430\u0440\u043a\u043e\u0442\u0438\u043a\u0438|\u0442\u0435\u0440\u0440\u043e\u0440\u0438\u0437\u043c|\u0431\u043e\u043c\u0431\u0430/iu,
];

export function failure(status: PolicyFailureStatus, code: string): PolicyFailure {
  return { ok: false, status, code };
}

export function isPlainObject(value: unknown): value is Record<string, unknown> {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return false;
  const prototype = Object.getPrototypeOf(value);
  return prototype === Object.prototype || prototype === null;
}

export function hasOnlyKeys(value: Record<string, unknown>, allowedKeys: string[]): boolean {
  return Object.keys(value).every((key) => allowedKeys.includes(key));
}

function classify(text: string): 'pii' | 'injection' | 'danger' | null {
  if (INJECTION_PATTERNS.some((pattern) => pattern.test(text))) return 'injection';
  if (DANGER_PATTERNS.some((pattern) => pattern.test(text))) return 'danger';
  if (PII_PATTERNS.some((pattern) => pattern.test(text))) return 'pii';
  return null;
}

function redactPii(text: string): string {
  return REDACTION_PATTERNS.reduce(
    (redacted, pattern) => redacted.replace(pattern, '[REDACTED]'),
    text,
  );
}

export function serverContentPolicy(
  texts: string[],
  safeRoute: SafeRoute,
): PolicyResult<string[]> {
  const originalFinding = classify(texts.join('\n'));
  if (originalFinding === 'injection') return failure(422, 'content_policy_injection_detected');
  if (originalFinding === 'danger') return failure(422, 'content_policy_danger_detected');
  if (originalFinding !== 'pii') return { ok: true, value: texts };
  if (safeRoute !== 'server_redact') return failure(422, 'content_policy_pii_detected');

  const redacted = texts.map(redactPii);
  const recheck = classify(redacted.join('\n'));
  if (recheck === 'pii') return failure(422, 'content_policy_pii_redaction_failed');
  if (recheck === 'injection') return failure(422, 'content_policy_injection_detected');
  if (recheck === 'danger') return failure(422, 'content_policy_danger_detected');
  return { ok: true, value: redacted };
}

export function parseSafeRoute(value: unknown): PolicyResult<SafeRoute> {
  if (value === undefined) return { ok: true, value: undefined };
  if (value === 'server_redact') return { ok: true, value };
  return failure(400, 'invalid_safety_route');
}

export function parseText(value: unknown, budget: TextBudget): PolicyResult<string> {
  if (typeof value !== 'string' || !value.trim()) return failure(400, 'invalid_text_part');
  budget.characters += value.length;
  budget.parts += 1;
  if (budget.characters > budget.maxCharacters) return failure(413, 'text_too_large');
  if (budget.parts > MAX_AI_PARTS) return failure(413, 'too_many_parts');
  return { ok: true, value };
}

export function parseContent(
  value: unknown,
  budget: TextBudget,
): PolicyResult<ServerContent> {
  if (!isPlainObject(value) || !hasOnlyKeys(value, ['role', 'parts'])) {
    return failure(400, 'invalid_content_shape');
  }
  const role = value.role === undefined ? 'user' : value.role;
  if (role !== 'user' && role !== 'model') return failure(400, 'invalid_content_role');
  if (!Array.isArray(value.parts) || value.parts.length === 0) {
    return failure(400, 'invalid_content_parts');
  }

  const parts: ServerTextPart[] = [];
  for (const rawPart of value.parts) {
    if (!isPlainObject(rawPart) || !hasOnlyKeys(rawPart, ['text'])) {
      return failure(400, 'invalid_content_part_shape');
    }
    const text = parseText(rawPart.text, budget);
    if (!text.ok) return text;
    parts.push({ text: text.value });
  }
  return { ok: true, value: { role, parts } };
}

export function contentTexts(contents: ServerContent[]): string[] {
  return contents.flatMap((content) => content.parts.map((part) => part.text));
}

export function replaceContentTexts(
  contents: ServerContent[],
  texts: string[],
): ServerContent[] {
  let index = 0;
  return contents.map((content) => ({
    ...content,
    parts: content.parts.map((part) => ({ ...part, text: texts[index++] ?? part.text })),
  }));
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

export async function readBoundedRawJson(
  req: Request,
): Promise<PolicyResult<{ body: unknown; bytes: number }>> {
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
    const body = JSON.parse(new TextDecoder().decode(concatChunks(chunks, bytes)));
    return { ok: true, value: { body, bytes } };
  } catch {
    return failure(400, 'invalid_json');
  }
}
