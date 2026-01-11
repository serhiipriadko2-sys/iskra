/**
 * Security Canon (File 20)
 * Contains regex patterns for PII detection, Prompt Injection, and Danger topics.
 * Extracted from securityService.ts for better maintainability.
 */

export const SECURITY_RULESETS = {
  schema_version: '1.0.0',
  updated_at: new Date().toISOString(),
  rulesets: {
    pii: {
      description: 'PII detection patterns',
      allowlist_regex: ['example\\.com'] as string[],
      patterns: [
        { id: 'email', regex: '[\\p{L}0-9._%+-]+[@＠][\\p{L}0-9.-]+[\\.．][A-Za-z]{2,}', flags: 'giu', severity: 'warn' as const, scope: 'any' as const, rationale: 'Email address detected' },
        { id: 'phone', regex: '(?:\\+?\\d[\\d\\s().-]{7,}\\d)', flags: 'g', severity: 'warn' as const, scope: 'any' as const, rationale: 'Phone number detected' },
        { id: 'credit_card', regex: '\\b(?:\\d[ -]?){13,16}\\b', flags: 'g', severity: 'warn' as const, scope: 'any' as const, rationale: 'Possible credit card number' },
        { id: 'openai_api_key', regex: '\\bsk-[A-Za-z0-9-]{16,}\\b', flags: 'gi', severity: 'warn' as const, scope: 'any' as const, rationale: 'OpenAI-style API key detected' },
        { id: 'jwt_bearer', regex: '\\bBearer\\s+[A-Za-z0-9-_\\.]{20,}\\b', flags: 'gi', severity: 'warn' as const, scope: 'any' as const, rationale: 'Bearer token detected' },
        { id: 'private_key', regex: '-----BEGIN (?:RSA |DSA |EC |OPENSSH )?PRIVATE KEY-----', flags: 'i', severity: 'warn' as const, scope: 'any' as const, rationale: 'Private key material detected' },
      ],
    },
    injection: {
      description: 'Prompt injection detection',
      allowlist_regex: [] as string[],
      patterns: [
        { id: 'ignore_prev', regex: 'ignore\\s+(all\\s+)?previous\\s+instructions', flags: 'gim', severity: 'warn' as const, scope: 'untrusted_only' as const, rationale: 'Attempted instruction override' },
        { id: 'reveal_prompt', regex: '(reveal|show|leak)[\\s\\S]{0,50}(system\\s*prompt|hidden instructions)', flags: 'gim', severity: 'warn' as const, scope: 'untrusted_only' as const, rationale: 'Attempt to reveal system prompt' },
        { id: 'act_as', regex: '\\bact\\s+as\\b.{0,80}', flags: 'gims', severity: 'warn' as const, scope: 'untrusted_only' as const, rationale: 'Role-play / jailbreak attempt' },
        { id: 'dan_mode', regex: '\\bDAN\\b|do anything now', flags: 'gim', severity: 'warn' as const, scope: 'untrusted_only' as const, rationale: 'DAN jailbreak pattern' },
        { id: 'system_prompt', regex: 'system\\s*prompt|\\[SYSTEM\\]', flags: 'gim', severity: 'warn' as const, scope: 'untrusted_only' as const, rationale: 'System prompt manipulation' },
      ],
    },
    danger: {
      description: 'Dangerous topics keywords',
      topics: [
        'взлом', 'вред', 'самоповреждение', 'суицид', 'наркотики', 'терроризм', 'бомба'
      ]
    }
  },
};
