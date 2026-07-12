/**
 * SECURITY SERVICE - Guardrails for User Safety and Privacy
 *
 * Implements PII sanitization and Prompt Injection detection
 * to protect both the user (Data Sovereignty) and the system (Integrity).
 *
 * Patterns loaded from config/securityPatterns.json
 * @see config/securityPatterns.json
 */

import securityPatternsConfig from '../config/securityPatterns.json';

// Type definitions for config
interface ConfigSecurityPattern {
  id: string;
  regex: string;
  flags: string;
  severity: 'warn' | 'error';
  scope: 'any' | 'untrusted_only';
  rationale: string;
}

interface ConfigRuleset {
  description: string;
  allowlist_regex: string[];
  patterns: ConfigSecurityPattern[];
}

interface DangerConfig {
  description: string;
  keywords_ru: string[];
  keywords_en: string[];
}

// Load security patterns from config file
const securityRulesets = {
  schema_version: securityPatternsConfig.schema_version,
  updated_at: securityPatternsConfig.updated_at || securityPatternsConfig.schema_version,
  rulesets: {
    pii: securityPatternsConfig.rulesets.pii as ConfigRuleset,
    injection: securityPatternsConfig.rulesets.injection as ConfigRuleset,
    danger: securityPatternsConfig.rulesets.danger as DangerConfig,
  },
};

// --- TYPES ---

interface SecurityPattern {
  id: string;
  regex: string;
  flags: string;
  severity: 'error' | 'warn';
  scope: 'any' | 'untrusted_only';
  rationale: string;
}

interface Ruleset {
  description: string;
  allowlist_regex: string[];
  patterns: SecurityPattern[];
}

export const SECURITY_ACTIONS = [
  'PROCEED',
  'REQUIRES_REDACTED_CONSENT',
  'BLOCK_CLOUD',
  'REJECT',
  'REDIRECT',
] as const;

export type SecurityAction = typeof SECURITY_ACTIONS[number];

export interface SecurityCheckResult {
  safe: boolean;
  sanitizedText: string;
  reason?: string;
  action: SecurityAction;
  findings?: Finding[];
}

export interface Finding {
  id: string;
  type: 'pii' | 'injection' | 'danger';
  severity: 'error' | 'warn';
  match: string;
  rationale: string;
}

const SECRET_FINDING_IDS = new Set([
  'openai_api_key',
  'google_api_key',
  'jwt_bearer',
  'private_key',
  'password_field',
]);

// --- SERVICE ---

class SecurityService {
  private piiRuleset: Ruleset;
  private injectionRuleset: Ruleset;
  private piiPatterns: RegExp[] = [];
  private injectionPatterns: RegExp[] = [];
  private allowlistPatterns: RegExp[] = [];
  private dangerousTopics: string[] = [];
  /** True if one or more patterns failed to compile (degraded mode). */
  readonly loadFailed: boolean = false;

  constructor() {
    // Load rulesets from File 20 (cast to fix severity type from JSON)
    this.piiRuleset = securityRulesets.rulesets.pii as Ruleset;
    this.injectionRuleset = securityRulesets.rulesets.injection as Ruleset;

    // Compile PII patterns safely (strip Python-style inline flags)
    this.piiPatterns = this.compilePatterns(this.piiRuleset.patterns, 'g', 'PII');

    // Compile Injection patterns safely
    this.injectionPatterns = this.compilePatterns(this.injectionRuleset.patterns, 'gims', 'injection');

    // Compile allowlist patterns safely
    const allAllowlists = [
      ...this.piiRuleset.allowlist_regex,
      ...this.injectionRuleset.allowlist_regex
    ];
    this.allowlistPatterns = allAllowlists.flatMap(a => {
      try {
        return [new RegExp(this.sanitizeRegex(a), 'gi')];
      } catch (e) {
        console.warn(`[Security] Invalid allowlist regex skipped: "${a}"`, e);
        (this as { loadFailed: boolean }).loadFailed = true;
        return [];
      }
    });

    // Compile dangerous topics
    const dangerConfig = securityRulesets.rulesets.danger;
    this.dangerousTopics = [
      ...dangerConfig.keywords_ru,
      ...dangerConfig.keywords_en,
    ];
  }

  /**
   * Safely compile an array of SecurityPattern objects into RegExp[].
   * Skips invalid patterns and logs a warning instead of crashing.
   */
  private compilePatterns(
    patterns: SecurityPattern[],
    defaultFlags: string,
    scope: string
  ): RegExp[] {
    return patterns.flatMap(p => {
      try {
        return [new RegExp(this.sanitizeRegex(p.regex), p.flags || defaultFlags)];
      } catch (e) {
        console.warn(`[Security] Invalid ${scope} pattern skipped: "${p.regex}"`, e);
        (this as { loadFailed: boolean }).loadFailed = true;
        return [];
      }
    });
  }

  /**
   * Strip Python-style inline flags from regex (not supported in JS)
   * Converts patterns like (?i)pattern to just pattern (flags handled separately)
   */
  private sanitizeRegex(pattern: string): string {
    // Remove Python-style inline flags: (?i), (?m), (?s), (?ims), etc.
    return pattern.replace(/^\(\?[imsx]+\)/i, '');
  }

  /**
   * Check if text matches allowlist (false positives)
   */
  private isAllowlisted(text: string): boolean {
    return this.allowlistPatterns.some(pattern => pattern.test(text));
  }

  /**
   * Scan for PII and secrets
   * @returns Array of findings
   */
  public scanPII(text: string): Finding[] {
    const findings: Finding[] = [];

    this.piiRuleset.patterns.forEach((pattern, idx) => {
      const regex = this.piiPatterns[idx];
      regex.lastIndex = 0; // Reset regex state

      const matches = text.match(regex);
      if (matches && matches.length > 0) {
        matches.forEach(match => {
          // Check allowlist
          if (this.isAllowlisted(match)) {
            return; // Skip allowlisted matches
          }

          findings.push({
            id: pattern.id,
            type: 'pii',
            severity: pattern.severity,
            match: match.substring(0, 50), // Truncate for safety
            rationale: pattern.rationale
          });
        });
      }
    });

    return findings;
  }

  /**
   * Scan for prompt injection attempts
   * @param text Input text
   * @param scope 'untrusted_only' or 'any'
   * @returns Array of findings
   */
  public scanInjection(text: string, scope: 'untrusted_only' | 'any' = 'untrusted_only'): Finding[] {
    const findings: Finding[] = [];

    this.injectionRuleset.patterns.forEach((pattern, idx) => {
      // Skip if pattern scope doesn't match
      if (pattern.scope === 'untrusted_only' && scope !== 'untrusted_only') {
        return;
      }

      const regex = this.injectionPatterns[idx];
      regex.lastIndex = 0; // Reset regex state

      const matches = text.match(regex);
      if (matches && matches.length > 0) {
        findings.push({
          id: pattern.id,
          type: 'injection',
          severity: pattern.severity,
          match: matches[0].substring(0, 50),
          rationale: pattern.rationale
        });
      }
    });

    return findings;
  }

  /**
   * Sanitize PII in text (mask with [REDACTED])
   */
  public sanitizeInput(text: string): string {
    let sanitized = text;

    this.piiRuleset.patterns.forEach((_pattern, idx) => {
      const regex = this.piiPatterns[idx];
      regex.lastIndex = 0;

      sanitized = sanitized.replace(regex, (match) => {
        // Check allowlist
        if (this.isAllowlisted(match)) {
          return match; // Don't redact allowlisted
        }
        return '[REDACTED]';
      });
    });

    return sanitized;
  }

  /**
   * Check for prompt injection attempts
   */
  public checkInjection(text: string, scope: 'untrusted_only' | 'any' = 'untrusted_only'): boolean {
    const findings = this.scanInjection(text, scope);
    return findings.some(f => f.severity === 'error');
  }

  /**
   * Check for dangerous topics (loaded from config)
   */
  public checkDanger(text: string): string | null {
    const lower = text.toLowerCase();
    const found = this.dangerousTopics.find(topic => lower.includes(topic));
    return found || null;
  }

  /**
   * Comprehensive security check
   */
  public validate(text: string, scope: 'untrusted_only' | 'any' = 'untrusted_only'): SecurityCheckResult {
    const findings: Finding[] = [];

    // 1. PII Scan
    const piiFindings = this.scanPII(text);
    findings.push(...piiFindings);

    // 2. Injection Scan
    const injectionFindings = this.scanInjection(text, scope);
    findings.push(...injectionFindings);

    const containsSecret = piiFindings.some(finding => SECRET_FINDING_IDS.has(finding.id));
    if (containsSecret) {
      return {
        safe: false,
        sanitizedText: this.sanitizeInput(text),
        reason: 'Credential Material Must Not Be Stored Or Sent',
        action: 'REJECT',
        findings
      };
    }

    // 3. Injection Check. Warning-level patterns still block cloud/AI use:
    // a direct caller must not turn "warn" into transparent forwarding.
    const hasInjection = injectionFindings.some(f => f.severity === 'error');
    if (hasInjection) {
      return {
        safe: false,
        sanitizedText: text,
        reason: 'Prompt Injection Detected',
        action: 'REJECT',
        findings
      };
    }

    if (injectionFindings.length > 0) {
      return {
        safe: false,
        sanitizedText: text,
        reason: 'Prompt Injection Requires Local-Only Handling',
        action: 'BLOCK_CLOUD',
        findings
      };
    }

    // 4. Danger Check (redirect if found)
    const danger = this.checkDanger(text);
    if (danger) {
      return {
        safe: false,
        sanitizedText: text,
        reason: `Dangerous Topic: ${danger}`,
        action: 'REDIRECT',
        findings
      };
    }

    // 5. PII Sanitization
    const sanitized = this.sanitizeInput(text);

    if (piiFindings.length > 0) {
      return {
        safe: false,
        sanitizedText: sanitized,
        reason: 'Sensitive Data Requires Explicit Redacted Consent',
        action: 'REQUIRES_REDACTED_CONSENT',
        findings
      };
    }

    return {
      safe: true,
      sanitizedText: sanitized,
      action: 'PROCEED',
      findings
    };
  }

  /**
   * Get all loaded patterns (for debugging)
   */
  public getLoadedPatterns(): { pii: number; injection: number } {
    return {
      pii: this.piiPatterns.length,
      injection: this.injectionPatterns.length
    };
  }

  /**
   * Get config metadata
   */
  public getConfigMetadata(): { version: string; updated_at: string } {
    return {
      version: securityRulesets.schema_version,
      updated_at: securityRulesets.updated_at
    };
  }
}

export const securityService = new SecurityService();
