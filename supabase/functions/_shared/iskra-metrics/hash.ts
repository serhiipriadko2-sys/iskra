// =============================================================================
// sha256 — via Web Crypto (available in Deno and Node 20+)
// =============================================================================
// Pure async hash of a UTF-8 string to lowercase hex. No side effects beyond
// the Web Crypto call, which is deterministic.
// =============================================================================

export async function sha256Hex(input: string): Promise<string> {
  const bytes = new TextEncoder().encode(input);
  const digest = await globalThis.crypto.subtle.digest('SHA-256', bytes);
  const view = new Uint8Array(digest);
  let hex = '';
  for (let i = 0; i < view.length; i++) {
    hex += view[i]!.toString(16).padStart(2, '0');
  }
  return hex;
}
