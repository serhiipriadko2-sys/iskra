import { MAX_AI_STREAM_BYTES } from './aiContentPolicyCore.ts';

export type StreamByteBudget = {
  used: number;
  limit: number;
};

export function createStreamByteBudget(
  limit: number = MAX_AI_STREAM_BYTES,
): StreamByteBudget {
  if (!Number.isInteger(limit) || limit < 1) {
    throw new RangeError('invalid_stream_byte_limit');
  }
  return { used: 0, limit };
}

export function encodeWithinStreamBudget(
  value: string,
  budget: StreamByteBudget,
  encoder: TextEncoder = new TextEncoder(),
): Uint8Array | null {
  const chunk = encoder.encode(value);
  if (budget.used + chunk.byteLength > budget.limit) return null;
  budget.used += chunk.byteLength;
  return chunk;
}
