// =============================================================================
// Canonical JSON — deterministic serialization for input hashing
// =============================================================================
// Produces a byte-stable string for any JSON-like value so that logically
// equal inputs hash identically regardless of key insertion order. Numbers use
// the JS canonical form; arrays preserve order (order is significant for
// signals). No side effects.
// =============================================================================

type Json =
  | null
  | boolean
  | number
  | string
  | readonly Json[]
  | { readonly [k: string]: Json };

/** Serialize `value` with object keys sorted lexicographically, arrays as-is. */
export function canonicalJson(value: unknown): string {
  return serialize(value as Json);
}

function serialize(value: Json): string {
  if (value === null) return 'null';

  const t = typeof value;
  if (t === 'number') {
    if (!Number.isFinite(value as number)) {
      throw new Error('canonicalJson: non-finite number is not serializable');
    }
    return JSON.stringify(value);
  }
  if (t === 'boolean' || t === 'string') return JSON.stringify(value);

  if (Array.isArray(value)) {
    return '[' + value.map((v) => serialize(v as Json)).join(',') + ']';
  }

  // Plain object: sort keys, drop `undefined` members (JSON semantics).
  const obj = value as { [k: string]: Json };
  const keys = Object.keys(obj).sort();
  const parts: string[] = [];
  for (const k of keys) {
    const v = obj[k];
    if (v === undefined) continue;
    parts.push(JSON.stringify(k) + ':' + serialize(v));
  }
  return '{' + parts.join(',') + '}';
}
