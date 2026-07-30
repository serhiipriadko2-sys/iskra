import {
  CANONICAL_GEMINI_EMBEDDING_MODEL,
  CANONICAL_GEMINI_TEXT_MODEL,
  DEFAULT_AI_OUTPUT_TOKENS,
  LEGACY_CLIENT_EMBEDDING_MODEL,
  MAX_AI_CONTENTS,
  MAX_AI_GENERATION_TEXT_CHARACTERS,
  MAX_AI_OUTPUT_TOKENS,
  MAX_AI_SCHEMA_DEPTH,
  MAX_AI_SCHEMA_ENUM_VALUES,
  MAX_AI_SCHEMA_NODES,
  MAX_AI_SCHEMA_PROPERTIES,
  MAX_AI_SYSTEM_INSTRUCTION_CHARACTERS,
  MAX_AI_TEXT_CHARACTERS,
  contentTexts,
  failure,
  hasOnlyKeys,
  isPlainObject,
  parseContent,
  parseSafeRoute,
  replaceContentTexts,
  serverContentPolicy,
  type PolicyResult,
  type RequestedProvider,
  type ServerContent,
  type TextBudget,
} from './aiContentPolicyCore.ts';

export type ValidatedGenerationConfig = {
  maxOutputTokens: number;
  responseMimeType?: 'application/json';
  responseSchema?: Record<string, unknown>;
};

export type ValidatedGeminiRequest = {
  action: 'generateContent' | 'streamGenerateContent' | 'embedContent';
  provider?: RequestedProvider;
  model: string;
  contents?: ServerContent[];
  content?: ServerContent;
  systemInstruction?: string;
  generationConfig: ValidatedGenerationConfig;
};

type SchemaBudget = { nodes: number };
type ParsedSchema = { value: Record<string, unknown>; policyTexts: string[] };
const SCHEMA_TYPES = new Set([
  'OBJECT', 'ARRAY', 'STRING', 'INTEGER', 'NUMBER', 'BOOLEAN',
  'object', 'array', 'string', 'integer', 'number', 'boolean',
]);
const FORBIDDEN_SCHEMA_KEYS = new Set(['__proto__', 'prototype', 'constructor']);

function parseProvider(value: unknown): PolicyResult<RequestedProvider | undefined> {
  if (value === undefined) return { ok: true, value: undefined };
  if (value === 'gemini' || value === 'openai' || value === 'auto') {
    return { ok: true, value };
  }
  return failure(400, 'unsupported_provider');
}

function parseModel(action: unknown, value: unknown): PolicyResult<string> {
  if (action === 'embedContent') {
    if (
      value === undefined ||
      value === CANONICAL_GEMINI_EMBEDDING_MODEL ||
      value === LEGACY_CLIENT_EMBEDDING_MODEL
    ) {
      return { ok: true, value: CANONICAL_GEMINI_EMBEDDING_MODEL };
    }
    return failure(422, 'unsupported_model');
  }
  if (value === undefined || value === CANONICAL_GEMINI_TEXT_MODEL) {
    return { ok: true, value: CANONICAL_GEMINI_TEXT_MODEL };
  }
  return failure(422, 'unsupported_model');
}

function parseSystemInstruction(value: unknown): PolicyResult<string | undefined> {
  if (value === undefined) return { ok: true, value: undefined };
  if (typeof value !== 'string') return failure(400, 'invalid_system_instruction');
  if (value.length > MAX_AI_SYSTEM_INSTRUCTION_CHARACTERS) {
    return failure(413, 'system_instruction_too_large');
  }
  return { ok: true, value: value.trim() ? value : undefined };
}

function parseSchemaNode(
  value: unknown,
  budget: SchemaBudget,
  depth: number,
): PolicyResult<ParsedSchema> {
  if (depth > MAX_AI_SCHEMA_DEPTH) return failure(413, 'response_schema_too_deep');
  if (!isPlainObject(value)) return failure(400, 'invalid_response_schema');
  budget.nodes += 1;
  if (budget.nodes > MAX_AI_SCHEMA_NODES) return failure(413, 'response_schema_too_large');
  if (!hasOnlyKeys(value, [
    'type', 'properties', 'items', 'required', 'enum', 'description', 'additionalProperties',
  ])) {
    return failure(400, 'unsupported_response_schema_keyword');
  }
  if (typeof value.type !== 'string' || !SCHEMA_TYPES.has(value.type)) {
    return failure(400, 'invalid_response_schema_type');
  }

  const parsed: Record<string, unknown> = { type: value.type };
  const policyTexts: string[] = [];
  if (value.description !== undefined) {
    if (typeof value.description !== 'string' || value.description.length > 1_000) {
      return failure(400, 'invalid_response_schema_description');
    }
    parsed.description = value.description;
    policyTexts.push(value.description);
  }
  if (value.enum !== undefined) {
    if (!Array.isArray(value.enum) || value.enum.length === 0 || value.enum.length > MAX_AI_SCHEMA_ENUM_VALUES) {
      return failure(400, 'invalid_response_schema_enum');
    }
    const enumValues: Array<string | number | boolean> = [];
    for (const item of value.enum) {
      if (typeof item !== 'string' && typeof item !== 'number' && typeof item !== 'boolean') {
        return failure(400, 'invalid_response_schema_enum');
      }
      if (typeof item === 'string') {
        if (item.length > 256) return failure(400, 'invalid_response_schema_enum');
        policyTexts.push(item);
      }
      enumValues.push(item);
    }
    parsed.enum = enumValues;
  }
  if (value.required !== undefined) {
    if (!Array.isArray(value.required) || value.required.length > MAX_AI_SCHEMA_PROPERTIES) {
      return failure(400, 'invalid_response_schema_required');
    }
    const required: string[] = [];
    for (const item of value.required) {
      if (typeof item !== 'string' || !item || item.length > 128 || FORBIDDEN_SCHEMA_KEYS.has(item)) {
        return failure(400, 'invalid_response_schema_required');
      }
      required.push(item);
    }
    if (new Set(required).size !== required.length) {
      return failure(400, 'invalid_response_schema_required');
    }
    parsed.required = required;
  }
  if (value.additionalProperties !== undefined) {
    if (typeof value.additionalProperties !== 'boolean') {
      return failure(400, 'invalid_response_schema_additional_properties');
    }
    parsed.additionalProperties = value.additionalProperties;
  }
  if (value.properties !== undefined) {
    if (!isPlainObject(value.properties)) return failure(400, 'invalid_response_schema_properties');
    const entries = Object.entries(value.properties);
    if (entries.length > MAX_AI_SCHEMA_PROPERTIES) return failure(413, 'response_schema_too_large');
    const properties: Record<string, unknown> = {};
    for (const [key, child] of entries) {
      if (!key || key.length > 128 || FORBIDDEN_SCHEMA_KEYS.has(key)) {
        return failure(400, 'invalid_response_schema_property');
      }
      const parsedChild = parseSchemaNode(child, budget, depth + 1);
      if (!parsedChild.ok) return parsedChild;
      properties[key] = parsedChild.value.value;
      policyTexts.push(...parsedChild.value.policyTexts);
    }
    parsed.properties = properties;
  }
  if (value.items !== undefined) {
    const parsedItems = parseSchemaNode(value.items, budget, depth + 1);
    if (!parsedItems.ok) return parsedItems;
    parsed.items = parsedItems.value.value;
    policyTexts.push(...parsedItems.value.policyTexts);
  }
  return { ok: true, value: { value: parsed, policyTexts } };
}

function parseGenerationConfig(
  value: unknown,
): PolicyResult<ValidatedGenerationConfig & { policyTexts: string[] }> {
  if (value === undefined) {
    return { ok: true, value: { maxOutputTokens: DEFAULT_AI_OUTPUT_TOKENS, policyTexts: [] } };
  }
  if (!isPlainObject(value) || !hasOnlyKeys(value, [
    'maxOutputTokens', 'responseMimeType', 'responseSchema',
  ])) {
    return failure(400, 'unsupported_generation_config');
  }
  const maxOutputTokens = value.maxOutputTokens === undefined
    ? DEFAULT_AI_OUTPUT_TOKENS
    : value.maxOutputTokens;
  if (!Number.isInteger(maxOutputTokens) || (maxOutputTokens as number) < 1) {
    return failure(400, 'invalid_max_output_tokens');
  }
  if ((maxOutputTokens as number) > MAX_AI_OUTPUT_TOKENS) {
    return failure(422, 'max_output_tokens_exceeds_cap');
  }
  if (value.responseMimeType !== undefined && value.responseMimeType !== 'application/json') {
    return failure(400, 'unsupported_response_mime_type');
  }

  let responseSchema: Record<string, unknown> | undefined;
  let policyTexts: string[] = [];
  if (value.responseSchema !== undefined) {
    if (value.responseMimeType !== 'application/json') {
      return failure(400, 'response_schema_requires_json_mime');
    }
    const schema = parseSchemaNode(value.responseSchema, { nodes: 0 }, 1);
    if (!schema.ok) return schema;
    responseSchema = schema.value.value;
    policyTexts = schema.value.policyTexts;
  }
  return {
    ok: true,
    value: {
      maxOutputTokens: maxOutputTokens as number,
      ...(value.responseMimeType === 'application/json'
        ? { responseMimeType: 'application/json' as const }
        : {}),
      ...(responseSchema ? { responseSchema } : {}),
      policyTexts,
    },
  };
}

export function validateGeminiRequest(body: unknown): PolicyResult<ValidatedGeminiRequest> {
  if (!isPlainObject(body)) return failure(400, 'invalid_request_shape');
  if (!hasOnlyKeys(body, [
    'action', 'provider', 'model', 'contents', 'content',
    'generationConfig', 'safetyRoute', 'systemInstruction',
  ])) {
    return failure(400, 'unknown_request_field');
  }
  const action = body.action;
  if (action !== 'generateContent' && action !== 'streamGenerateContent' && action !== 'embedContent') {
    return failure(400, 'unsupported_action');
  }

  const provider = parseProvider(body.provider);
  if (!provider.ok) return provider;
  const model = parseModel(action, body.model);
  if (!model.ok) return model;
  const safeRoute = parseSafeRoute(body.safetyRoute);
  if (!safeRoute.ok) return safeRoute;
  const generationConfig = parseGenerationConfig(body.generationConfig);
  if (!generationConfig.ok) return generationConfig;
  const systemInstruction = parseSystemInstruction(body.systemInstruction);
  if (!systemInstruction.ok) return systemInstruction;

  const schemaPolicy = serverContentPolicy(generationConfig.value.policyTexts, undefined);
  if (!schemaPolicy.ok) return schemaPolicy;
  const instructionPolicy = serverContentPolicy(
    systemInstruction.value ? [systemInstruction.value] : [],
    safeRoute.value,
  );
  if (!instructionPolicy.ok) return instructionPolicy;
  const redactedSystemInstruction = systemInstruction.value
    ? instructionPolicy.value[0]
    : undefined;
  const normalizedGenerationConfig: ValidatedGenerationConfig = {
    maxOutputTokens: generationConfig.value.maxOutputTokens,
    ...(generationConfig.value.responseMimeType
      ? { responseMimeType: generationConfig.value.responseMimeType }
      : {}),
    ...(generationConfig.value.responseSchema
      ? { responseSchema: generationConfig.value.responseSchema }
      : {}),
  };

  if (action === 'embedContent') {
    if (body.contents !== undefined || body.content === undefined) {
      return failure(400, 'invalid_embedding_shape');
    }
    if (normalizedGenerationConfig.responseMimeType || normalizedGenerationConfig.responseSchema) {
      return failure(400, 'invalid_embedding_generation_config');
    }
    const budget: TextBudget = { characters: 0, parts: 0, maxCharacters: MAX_AI_TEXT_CHARACTERS };
    const content = parseContent(body.content, budget);
    if (!content.ok) return content;
    const policy = serverContentPolicy(contentTexts([content.value]), safeRoute.value);
    if (!policy.ok) return policy;
    return {
      ok: true,
      value: {
        action,
        ...(provider.value ? { provider: provider.value } : {}),
        model: model.value,
        content: replaceContentTexts([content.value], policy.value)[0],
        ...(redactedSystemInstruction ? { systemInstruction: redactedSystemInstruction } : {}),
        generationConfig: normalizedGenerationConfig,
      },
    };
  }

  if (
    body.content !== undefined || !Array.isArray(body.contents) ||
    body.contents.length === 0 || body.contents.length > MAX_AI_CONTENTS
  ) {
    return failure(400, 'invalid_generation_shape');
  }
  const budget: TextBudget = {
    characters: 0,
    parts: 0,
    maxCharacters: MAX_AI_GENERATION_TEXT_CHARACTERS,
  };
  const contents: ServerContent[] = [];
  for (const rawContent of body.contents) {
    const content = parseContent(rawContent, budget);
    if (!content.ok) return content;
    contents.push(content.value);
  }
  const policy = serverContentPolicy(contentTexts(contents), safeRoute.value);
  if (!policy.ok) return policy;
  return {
    ok: true,
    value: {
      action,
      ...(provider.value ? { provider: provider.value } : {}),
      model: model.value,
      contents: replaceContentTexts(contents, policy.value),
      ...(redactedSystemInstruction ? { systemInstruction: redactedSystemInstruction } : {}),
      generationConfig: normalizedGenerationConfig,
    },
  };
}
