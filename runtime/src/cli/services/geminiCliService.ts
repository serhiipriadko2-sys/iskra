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
    verdict: "FACT" | "INFERENCE" | "UNSOURCED";
    confidence: number;
    reasoning: string;
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
        candidateSources: [],
        trace,
      };
    }

    const assessment = schemaResult.data;

    // No evidence adapter exists yet: all evidence-dependent fields are
    // empty by construction, not by omission. `verdict` is a placeholder —
    // calculateSiftOmega()/decideSiftVerdictStatus() never read it, they
    // derive the real verdict from source/inference/evidence/trace below.
    const siftInput: Omit<SiftResult, "delta"> = {
      source: {
        identified: [],
        reliability: 0,
        flags: assessment.status === "contradicted_candidate" ? ["model_flagged_contradiction"] : [],
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

    const verdict: "FACT" | "INFERENCE" | "UNSOURCED" =
      decision.status === "verified" ? "FACT" : decision.status === "partially_verified" ? "INFERENCE" : "UNSOURCED";

    return {
      statement,
      verdict,
      confidence: omega / 100,
      reasoning: `[Model assessment — candidate only, not independently verified] ${assessment.rationaleSummary}`,
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
