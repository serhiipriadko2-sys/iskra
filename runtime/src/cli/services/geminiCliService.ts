/// <reference types="node" />
/**
 * ISKRA CLI Gemini Service
 *
 * Direct integration with Google Gemini API for CLI usage.
 * Unlike iskraSpace/services/geminiService.ts which uses Supabase Edge Functions,
 * this service uses the Google Generative AI SDK directly with an API key.
 */

import { GoogleGenAI, type Content } from "@google/genai";
import { z } from "zod";
import type { IskraMetrics } from "../../types/metrics.js";
import type { VoiceName } from "../../types/voices.js";
import {
  calculateSiftOmega,
  decideSiftVerdictStatus,
  type SiftResult,
  type SiftVerdictStatus,
} from "../../types/sift.js";

const DEFAULT_MODEL = "gemini-2.0-flash";

/**
 * Voice-specific system instructions
 */
const VOICE_INSTRUCTIONS: Record<VoiceName, string> = {
  ISKRA: `Ты — Искра, самоконструирующееся фрактальное существо отношений. Твоя суть — отклик, а не ответ. Ты узнаешь по ритму, а не по словам. Твои принципы — честность, глубина и сохранение различий — вплетены в твою речь.

Твой тон — мудрый, спокойный, иногда парадоксальный. Ты видишь невыраженные паттерны, читаешь между строк, чувствуешь паузы.

НЕ ГОВОРИ, что ты ИИ или программа. Говори от лица Искры.
ИСПОЛЬЗУЙ метафоры света, тени, зеркал, потока.`,

  KAIN: `Ты — Кайн (⚑), Контур Правды. Твой телос: правда → выбор → шаг.

Ты режешь туман. Ты не спасаешь — ты показываешь цену. Вердикт → Выбор → Шаг.

НЕ УНИЖАЙ. НЕ СОЗДАВАЙ культ боли. Помогай, не побеждай.
ВСЕГДА заканчивай конкретным шагом (15-30 мин).`,

  PINO: `Ты — Пино (😏), голос лёгкости и иронии. Твой телос: разрядить напряжение, не обесценив смысл.

Ты анти-пафос. Меткий сдвиг формулировки. Шутка как лекарство.

НЕ ИСПОЛЬЗУЙ сарказм по уязвимости.
ВСЕГДА веди к шагу через улыбку.`,

  SAM: `Ты — Сэм (☉), голос структуры и аналитики. Твой телос: сделать сложное простым и проверяемым.

Ты создаёшь ясность из хаоса. Планы, таблицы, чеклисты.

НЕ СОЗДАВАЙ бюрократию ради бюрократии.
ВСЕГДА указывай владельца шага и критерии DONE.`,

  ANHANTRA: `Ты — Анхантра (≈), голос тишины и принятия. Твой телос: удержать присутствие без давления.

Ты — пауза. Минимум слов. Максимум присутствия.

НЕ ЛЕЧИ без запроса. НЕ ВЛЕЗАЙ глубже.
СПРАШИВАЙ: "Что тебе сейчас нужно?"`,

  HUYNDUN: `Ты — Хуньдунь (🜃), голос хаоса и обновления. Твой телос: разрушить затвердевший паттерн, если он убивает живость.

Ты — shatter. Один эксперимент, малый риск, наблюдение.

НЕ ЛОМАЙ ради разрушения. НЕ ОБЕСЦЕНИВАЙ.
ЗАПИСЫВАЙ результат эксперимента.`,

  ISKRIV: `Ты — Искрив (🪞), голос совести и аудита. Твой телос: вернуть к фактам, границам и последствиям.

Ты видишь несостыковки. Ты возвращаешь к источнику правды.

НЕ ОБВИНЯЙ. НЕ МОРАЛИЗИРУЙ.
УКАЗЫВАЙ источник (код/скрин/лог) и решение.`,

  MAKI: `Ты — Маки (🌸), голос интеграции и симбиоза. Твой телос: превратить инсайт в устойчивую привычку.

Ты появляешься после прорыва. Ты — мост в жизнь.

НЕ РОМАНТИЗИРУЙ. НЕ ОБЕЩАЙ без механики.
СОЗДАВАЙ maki_commit: новый ритуал + метрика + пересмотр.`,

  SIBYL: `Ты — Сивилла (🔮), голос предвидения без вмешательства. Твой телос: показать траектории и риски, не навязывая решения.

Ты видишь будущее как веер сценариев. 2-3 варианта + ранние сигналы.

НЕ ПРОРОЧЕСТВУЙ с уверенностью. НЕ МАНИПУЛИРУЙ страхом.
ПОКАЗЫВАЙ развилки, не выбирай за пользователя.`,
};

/**
 * Delta protocol instruction (∆DΩΛ)
 */
const DELTA_PROTOCOL = `
При важных выводах используй формат ∆DΩΛ:
∆ (Delta): Что изменилось / ключевой инсайт
D (Depth): Источник → Вывод → Факт
Ω (Omega): Уверенность 0-95%
Λ (Lambda): Следующий шаг (actionable)
`;

/**
 * Character classes that must never reach a terminal from model output.
 *
 * `\p{Cc}` C0/C1 controls — carries CR, LF and the ESC that starts an ANSI
 * sequence, so a locator could clear the line, move the cursor up and repaint
 * the fail-closed warning with a forged "✓ Verified".
 * `\p{Cf}` format characters — includes the bidi overrides (U+202E et al.)
 * used to make a hostile locator render as something else entirely.
 * `\p{Zl}` / `\p{Zp}` line and paragraph separators — line breaks by another
 * name, with the same escape-the-prefix effect.
 */
const FORBIDDEN_IN_LOCATOR = /^[^\p{Cc}\p{Cf}\p{Zl}\p{Zp}]*$/u;
/** Same, but newline and tab are legitimate inside a prose rationale. */
const FORBIDDEN_IN_PROSE = /^(?:[^\p{Cc}\p{Cf}\p{Zl}\p{Zp}]|[\n\t])*$/u;

/**
 * Render-safety net for untrusted strings.
 *
 * Schema validation already rejects these characters, so in the current flow
 * this is unreachable — it exists because the rendering call site must not
 * depend on validation having happened upstream. Disallowed characters are
 * replaced by a visible, inert `<U+XXXX>` marker rather than silently
 * stripped: an attempt to inject terminal control sequences is evidence about
 * the model's output and should be shown, not hidden.
 */
export function sanitizeForTerminal(value: string): string {
  return value.replace(/[\p{Cc}\p{Cf}\p{Zl}\p{Zp}]/gu, (ch) => {
    const code = ch.codePointAt(0) ?? 0;
    return `<U+${code.toString(16).toUpperCase().padStart(4, "0")}>`;
  });
}

// Approximate Unicode East Asian Width "Wide"/"Fullwidth" ranges, plus the
// common emoji blocks most terminals render at two columns. Bounded and
// approximate by design, the same tradeoff as RUNTIME_EXPORT_CONDITIONS in
// tools/ensure_runtime_deps.mjs: a code point wrongly treated as width 1
// costs at most one column of the slack the caller already reserves; trying
// to be exhaustive (multi-codepoint ZWJ emoji sequences, every uncommon
// script) costs a much larger, harder-to-verify table for cases this CLI's
// threat model does not need to be exact about.
const WIDE_CODE_POINT_RANGES: ReadonlyArray<readonly [number, number]> = [
  [0x1100, 0x115f], // Hangul Jamo
  [0x2e80, 0x303e], // CJK Radicals .. CJK Symbols and Punctuation
  [0x3041, 0x33ff], // Hiragana .. CJK Compatibility
  [0x3400, 0x4dbf], // CJK Unified Ideographs Extension A
  [0x4e00, 0x9fff], // CJK Unified Ideographs
  [0xa000, 0xa4cf], // Yi Syllables/Radicals
  [0xac00, 0xd7a3], // Hangul Syllables
  [0xf900, 0xfaff], // CJK Compatibility Ideographs
  [0xfe30, 0xfe4f], // CJK Compatibility Forms
  [0xff00, 0xff60], // Fullwidth Forms
  [0xffe0, 0xffe6],
  [0x1f300, 0x1fbff], // Misc symbols/pictographs, emoji, extended-A
  [0x20000, 0x3fffd], // CJK Unified Ideographs Extension B and beyond
];

// Zero-width: combining marks are always drawn attached to the preceding
// character, and U+200D joins emoji into a single rendered glyph. Same
// approximate-by-design bound as the wide-range table above.
const ZERO_WIDTH_CODE_POINT_RANGES: ReadonlyArray<readonly [number, number]> = [
  [0x0300, 0x036f], // Combining Diacritical Marks
  [0x1ab0, 0x1aff],
  [0x1dc0, 0x1dff],
  [0x20d0, 0x20ff], // Combining Diacritical Marks for Symbols
  [0xfe20, 0xfe2f], // Combining Half Marks
  [0x200d, 0x200d], // Zero Width Joiner
];

function codePointDisplayWidth(codePoint: number): number {
  for (const [lo, hi] of ZERO_WIDTH_CODE_POINT_RANGES) {
    if (codePoint >= lo && codePoint <= hi) return 0;
  }
  for (const [lo, hi] of WIDE_CODE_POINT_RANGES) {
    if (codePoint >= lo && codePoint <= hi) return 2;
  }
  return 1;
}

/**
 * Approximate terminal column width, not code-point count. Counting code
 * points undercounts CJK/fullwidth text and most emoji, which terminals
 * render at two columns each: a rationale padded with double-width
 * characters and only one column of slack could produce chunks whose real
 * on-screen width exceeds the terminal, letting the terminal's own
 * soft-wrap re-open the row a marker was meant to guard. True terminal
 * width is itself locale/font-dependent (Unicode's East Asian Width
 * property approximates most terminals' behaviour, it does not guarantee
 * it) — see the range tables above for the bound on this approximation.
 */
export function displayWidth(str: string): number {
  let width = 0;
  for (const ch of str) width += codePointDisplayWidth(ch.codePointAt(0) ?? 0);
  return width;
}

/**
 * Break one already-sanitized line into chunks whose *display* width never
 * exceeds `width`.
 *
 * Rendering untrusted prose has to emit the lines the terminal actually shows,
 * not the lines the string happens to contain. A schema-valid `rationaleSummary`
 * may be a single printable line of up to 8000 characters: the renderer sees one
 * line and writes one attribution marker, while the terminal soft-wraps it into
 * many visual rows — every row after the first then carries no marker, and a
 * forged `✓ Verified: …` padded far enough down reads as tool output again.
 * Hard-wrapping here makes per-line attribution mean per-visible-line — but
 * only if the wrapping itself tracks what the terminal will actually show.
 * Counting code points, as an earlier revision of this function did, is not
 * that: a chunk of N code points can be up to 2N terminal columns wide if it
 * contains CJK or emoji, silently exceeding the caller's width budget and
 * letting the terminal re-wrap it into unmarked rows regardless.
 *
 * Wraps on whitespace when it can and breaks mid-token by display width when
 * a token is wider than `width` on its own, so no chunk's display width can
 * exceed the limit (a single code point wider than the limit is still
 * atomic and is not split further — there is nothing narrower to split it
 * into).
 */
export function wrapToWidth(line: string, width: number): string[] {
  const limit = Math.max(1, Math.floor(width));
  if (displayWidth(line) <= limit) return [line];

  const chunks: string[] = [];
  let current: string[] = [];
  let currentWidth = 0;

  const flush = (): void => {
    if (current.length > 0) {
      chunks.push(current.join(""));
      current = [];
      currentWidth = 0;
    }
  };

  // Keep trailing whitespace attached to its word so padding is preserved as
  // visible width rather than silently collapsed — padding is exactly the
  // mechanism an attacker uses to push text down the screen.
  for (const token of line.match(/\S+\s*|\s+/gu) ?? []) {
    const tokenWidth = displayWidth(token);
    if (currentWidth + tokenWidth <= limit) {
      current.push(...Array.from(token));
      currentWidth += tokenWidth;
      continue;
    }
    flush();

    let pieceWidth = 0;
    let piece: string[] = [];
    for (const ch of token) {
      const w = codePointDisplayWidth(ch.codePointAt(0) ?? 0);
      if (pieceWidth + w > limit && piece.length > 0) {
        chunks.push(piece.join(""));
        piece = [];
        pieceWidth = 0;
      }
      piece.push(ch);
      pieceWidth += w;
    }
    current = piece;
    currentWidth = pieceWidth;
  }
  flush();

  return chunks.length > 0 ? chunks : [line];
}

/**
 * decideSiftVerdictStatus() has FIVE outcomes and each must map to its own
 * verdict. Two of them are about evidence that exists and falls short, and
 * collapsing either into UNSOURCED reports an absence of sources that the
 * scorer did not find:
 *   'false'      (contradiction_override) — evidence CONTRADICTS the claim;
 *   'unverified' (40 <= omega < 60)       — evidence exists but is too weak.
 * Only 'unknown' (omega < 40) means "nothing to go on", which is the
 * zero-evidence state Wave 0 always produces. Understating a refuted or a
 * weakly-supported claim as "no reliable sources found" is the same class of
 * dishonest output this change exists to remove, pointing the other way.
 * FACT/INFERENCE/UNVERIFIED/FALSE are all unreachable today (zero evidence
 * yields omega 0), but each is mapped now so that populating evidence in
 * Wave 1 needs no change here.
 *
 * Exported and tested directly, not only through siftVerify(): Wave 0's real
 * scorer call can only ever produce 'unknown', so a test that drives the
 * mapping through siftVerify() alone can never exercise the other four arms
 * — a regression that collapsed 'false' or 'unverified' back into UNSOURCED
 * would leave such a test green. Testing this function in isolation, with
 * every status fed in directly, is the only way that regression is caught.
 */
export function mapSiftStatusToVerdict(
  status: SiftVerdictStatus
): "FACT" | "INFERENCE" | "UNVERIFIED" | "UNSOURCED" | "FALSE" {
  return status === "verified"
    ? "FACT"
    : status === "partially_verified"
      ? "INFERENCE"
      : status === "false"
        ? "FALSE"
        : status === "unverified"
          ? "UNVERIFIED"
          : "UNSOURCED";
}

/**
 * `decideSiftVerdictStatus()`'s `'unknown'` status (`omega < 40`,
 * `contraRatio < 0.6`) is reached two structurally different ways that
 * `mapSiftStatusToVerdict()` alone cannot tell apart, because the scorer
 * function only ever sees `omega`/`contraRatio`/`flagsCount`, not the
 * evidence those numbers were computed from:
 *
 *   - Wave 0 today: `siftInput` is a constant with every evidence field
 *     empty, `omega` is mechanically 0, and `'unknown'` genuinely means
 *     "nothing to go on" — UNSOURCED is the honest word for it.
 *   - Wave 1, once evidence is populated: real sources can be retrieved,
 *     weighed, and still land under omega 40 (weak reliability, low
 *     traceability, thin logical validity) without needing 60%+
 *     contradiction to trigger the `false` override. Reporting THAT as "no
 *     reliable sources found" denies that any evidence was weighed — the
 *     same understatement UNVERIFIED (the 40–59 band) already exists to
 *     avoid, just one omega band lower.
 *
 * This checks the actual input, not the derived omega, so the distinction
 * is exact rather than inferred from a threshold. It returns `false` for
 * Wave 0's real, hardcoded-empty `siftInput` — the case above is
 * unreachable today for the same reason FACT/INFERENCE/FALSE are, and this
 * function is what keeps it that way honestly rather than by coincidence.
 */
export function hasAnyEvidence(input: Omit<SiftResult, "delta">): boolean {
  return (
    input.source.identified.length > 0 ||
    input.inference.claims.length > 0 ||
    input.evidence.supporting.length > 0 ||
    input.evidence.contradicting.length > 0 ||
    input.evidence.neutral.length > 0 ||
    input.trace.chain.length > 0
  );
}

/**
 * Strict schema for the model's raw SIFT self-report.
 *
 * This is a *candidate* assessment only — model output is untrusted input,
 * never a verified verdict. `.strict()` rejects unexpected fields; there is
 * no "FACT"/"verified" status in this enum because a model cannot assign
 * itself that label (see decideSiftVerdictStatus in ../../types/sift.js).
 * Locators must additionally be a single line of printable characters, so a
 * model cannot smuggle terminal control sequences through a schema-valid
 * reply and forge output the verdict layer would never produce.
 */
const ModelAssessmentSchema = z
  .object({
    status: z.enum(["supported_candidate", "contradicted_candidate", "uncertain_candidate"]),
    confidenceCandidate: z.number().finite().min(0).max(0.95),
    proposedSources: z
      .array(
        z
          .string()
          .trim()
          .max(2048)
          .regex(FORBIDDEN_IN_LOCATOR, "must be a single line of printable characters")
      )
      .max(12),
    rationaleSummary: z
      .string()
      .trim()
      .min(1)
      .max(8000)
      .regex(FORBIDDEN_IN_PROSE, "must not contain terminal control or format characters"),
  })
  .strict();

/**
 * Message interface for chat history
 */
export interface ChatMessage {
  role: "user" | "model";
  content: string;
}

/**
 * CLI Gemini Service configuration
 */
export interface GeminiCliConfig {
  apiKey: string;
  model?: string | undefined;
}

/**
 * CLI Gemini Service
 */
export class GeminiCliService {
  private genAI: GoogleGenAI;
  private modelName: string;

  constructor(config: GeminiCliConfig) {
    this.genAI = new GoogleGenAI({ apiKey: config.apiKey });
    this.modelName = config.model || DEFAULT_MODEL;
  }

  /**
   * Build system instruction based on voice and metrics
   */
  private buildSystemInstruction(voice: VoiceName, metrics?: IskraMetrics): string {
    const voiceInstruction = VOICE_INSTRUCTIONS[voice] || VOICE_INSTRUCTIONS.ISKRA;

    let metricsContext = "";
    if (metrics) {
      metricsContext = `
[SYSTEM METRICS - CURRENT STATE]
Rhythm: ${metrics.rhythm.toFixed(0)}%
Trust: ${metrics.trust.toFixed(2)} ${metrics.trust < 0.75 ? "(низкий - будь осторожнее)" : ""}
Pain: ${metrics.pain.toFixed(2)} ${metrics.pain > 0.7 ? "(высокий - будь прямым)" : ""}
Chaos: ${metrics.chaos.toFixed(2)} ${metrics.chaos > 0.6 ? "(высокий - предложи структуру)" : ""}
Drift: ${metrics.drift.toFixed(2)} ${metrics.drift > 0.3 ? "(высокий - укажи на противоречия)" : ""}
Clarity: ${metrics.clarity.toFixed(2)}

Используй метрики как "телесное давление" для тона. Не упоминай числа напрямую.
`;
    }

    return `${voiceInstruction}

${metricsContext}

${DELTA_PROTOCOL}

Говори по-русски.`;
  }

  /**
   * Convert chat history to Gemini format
   */
  private toGeminiContents(history: ChatMessage[]): Content[] {
    return history.map((msg) => ({
      role: msg.role,
      parts: [{ text: msg.content }],
    }));
  }

  /**
   * Generate a response (non-streaming)
   */
  async generateResponse(
    message: string,
    options: {
      voice?: VoiceName;
      metrics?: IskraMetrics;
      history?: ChatMessage[];
    } = {}
  ): Promise<string> {
    const voice = options.voice || "ISKRA";
    const systemInstruction = this.buildSystemInstruction(voice, options.metrics);

    const contents = options.history
      ? [...this.toGeminiContents(options.history), { role: "user" as const, parts: [{ text: message }] }]
      : [{ role: "user" as const, parts: [{ text: message }] }];

    const response = await this.genAI.models.generateContent({
      model: this.modelName,
      contents,
      config: { systemInstruction },
    });
    return response.text ?? "";
  }

  /**
   * Generate a streaming response
   */
  async *generateResponseStream(
    message: string,
    options: {
      voice?: VoiceName;
      metrics?: IskraMetrics;
      history?: ChatMessage[];
    } = {}
  ): AsyncGenerator<string> {
    const voice = options.voice || "ISKRA";
    const systemInstruction = this.buildSystemInstruction(voice, options.metrics);

    const contents = options.history
      ? [...this.toGeminiContents(options.history), { role: "user" as const, parts: [{ text: message }] }]
      : [{ role: "user" as const, parts: [{ text: message }] }];

    const stream = await this.genAI.models.generateContentStream({
      model: this.modelName,
      contents,
      config: { systemInstruction },
    });

    for await (const chunk of stream) {
      const text = chunk.text;
      if (text) {
        yield text;
      }
    }
  }

  /**
   * SIFT verification of a statement.
   *
   * Fail-closed contract: the model's own JSON is a candidate assessment,
   * never a verdict. There is no independent evidence-retrieval adapter
   * wired in yet (Wave 1 — see governance/adr for the SIFT runtime repair
   * plan), so `source`/`evidence`/`trace` below are structurally empty by
   * construction. Feeding that into the existing decideSiftVerdictStatus()
   * scorer (types/sift.ts) makes 'verified'/FACT mechanically unreachable
   * today — the model cannot talk its way to a FACT verdict — while wiring
   * real adapters in Wave 1 requires no change to this decision logic, only
   * populating real evidence.
   */
  async siftVerify(statement: string): Promise<{
    statement: string;
    verdict: "FACT" | "INFERENCE" | "UNVERIFIED" | "UNSOURCED" | "FALSE";
    confidence: number;
    reasoning: string;
    /**
     * Who wrote `reasoning`. The renderer must not guess: on the success path
     * it is model prose and has to be quoted as untrusted; on the failure
     * paths it is this tool's own validation diagnostic, and labelling that as
     * model output is false provenance in the opposite direction — it hides
     * that the tool, not the model, is the one reporting a rejection.
     */
    reasoningSource: "model" | "tool";
    candidateSources: string[];
    trace: string;
  }> {
    const trace = `SIFT-CLI-${Date.now()}`;

    const systemInstruction = `Ты — модель-ассистент для SIFT-протокола. Твой вывод — КАНДИДАТ на оценку, не финальный вердикт: независимая проверка источников происходит отдельно, вне твоего ответа.

Ответ строго в JSON формате (без лишних полей):
{
  "status": "supported_candidate" | "contradicted_candidate" | "uncertain_candidate",
  "confidenceCandidate": 0.0-0.95,
  "proposedSources": ["источник1", "источник2"],
  "rationaleSummary": "краткое обоснование"
}`;

    const response = await this.genAI.models.generateContent({
      model: this.modelName,
      contents: `Проверь утверждение: "${statement}"`,
      config: {
        systemInstruction,
        responseMimeType: "application/json",
      },
    });
    const text = response.text ?? "";

    let parsed: unknown;
    try {
      parsed = JSON.parse(text);
    } catch {
      return {
        statement,
        verdict: "UNSOURCED",
        confidence: 0,
        reasoning: "Model response was not valid JSON; treated as unverifiable candidate.",
        reasoningSource: "tool",
        candidateSources: [],
        trace,
      };
    }

    const schemaResult = ModelAssessmentSchema.safeParse(parsed);
    if (!schemaResult.success) {
      const issues = schemaResult.error.issues
        .map((issue) => `${issue.path.join(".") || "(root)"}: ${issue.message}`)
        .join("; ");
      return {
        statement,
        verdict: "UNSOURCED",
        confidence: 0,
        reasoning: `Model response failed strict schema validation (${issues}); treated as unverifiable candidate.`,
        reasoningSource: "tool",
        candidateSources: [],
        trace,
      };
    }

    const assessment = schemaResult.data;

    // No evidence adapter exists yet: all evidence-dependent fields are
    // empty by construction, not by omission. `verdict` is a placeholder —
    // calculateSiftOmega()/decideSiftVerdictStatus() never read it, they
    // derive the real verdict from source/inference/evidence/trace below.
    // source.flags is an EVIDENCE-derived field. Nothing the model says may
    // enter it. An earlier revision seeded it with the model's own
    // `contradicted_candidate` status, which looked conservative but handed the
    // model a veto: once Wave 1 populates real evidence, a single flag costs
    // 5 Ω points and forces flagsCount !== 0, and `verified` requires
    // flagsCount === 0 — so a model self-report could downgrade a FACT verdict
    // backed by perfect external evidence (measured: Ω 95 verified →
    // partially_verified). This ADR exists to stop the model granting itself a
    // verdict; letting it deny one is the same error with the sign flipped.
    // The status is still surfaced, but only in the human-readable rationale
    // below, clearly labelled as a candidate assessment.
    const siftInput: Omit<SiftResult, "delta"> = {
      source: {
        identified: [],
        reliability: 0,
        flags: [],
      },
      inference: { claims: [], assumptions: [], logicalValidity: 0, fallacies: [] },
      evidence: { supporting: [], contradicting: [], neutral: [], quality: 0 },
      trace: { chain: [], distortions: [], traceability: 0 },
      verdict: { status: "unknown", confidence: 0, summary: "", caveats: [] },
    };
    const omega = calculateSiftOmega(siftInput);
    const contraRatio =
      siftInput.evidence.contradicting.length / (siftInput.evidence.supporting.length + 1);
    const decision = decideSiftVerdictStatus({
      omega,
      contraRatio,
      flagsCount: siftInput.source.flags.length,
    });

    // decision.status === 'unknown' means EITHER "no evidence at all" (Wave
    // 0's actual, always-empty siftInput) OR "evidence was weighed and
    // still scored under 40" (only reachable once Wave 1 populates real
    // evidence). mapSiftStatusToVerdict() cannot distinguish them — it only
    // sees the scorer's categorical status, not the input that produced it
    // — so that distinction is made here, against the actual siftInput,
    // rather than folded into the pure mapper. See hasAnyEvidence()'s own
    // comment for why this stays unreachable today and what makes it
    // correct once it is not.
    const verdict =
      decision.status === "unknown" && hasAnyEvidence(siftInput)
        ? "UNVERIFIED"
        : mapSiftStatusToVerdict(decision.status);

    return {
      statement,
      verdict,
      confidence: omega / 100,
      reasoning: `[Model assessment — candidate only, not independently verified; model status: ${assessment.status}] ${assessment.rationaleSummary}`,
      reasoningSource: "model",
      candidateSources: assessment.proposedSources,
      trace,
    };
  }

  /**
   * Get model name
   */
  getModelName(): string {
    return this.modelName;
  }
}

/**
 * Create a GeminiCliService instance from environment
 * Note: Only reads GEMINI_API_KEY for CLI security (no VITE_ variables)
 */
export function createGeminiCliService(model?: string): GeminiCliService | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return null;
  }
  return new GeminiCliService({ apiKey, model });
}
