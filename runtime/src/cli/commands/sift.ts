/// <reference lib="dom" />
import { Command } from "commander";
import chalk from "chalk";
import inquirer from "inquirer";
import ora from "ora";
import { createGeminiCliService, sanitizeForTerminal, wrapToWidth } from "../services/geminiCliService.js";

export const siftCommand = new Command("sift")
  .description(
    "Verify a statement using SIFT protocol (Source → Inference → Fact → Trace).\n" +
      "WAVE 0 LIMITATION: no independent evidence retrieval is wired in yet, so every\n" +
      "input currently returns UNSOURCED — FACT, INFERENCE, UNVERIFIED and FALSE are\n" +
      "all unreachable, because each of them requires evidence that was retrieved. The\n" +
      "model's reply is treated as an unverified candidate assessment; any locators it\n" +
      "proposes are shown as candidates, never as retrieved sources."
  )
  .argument("[statement]", "Statement to verify")
  .option("-d, --detailed", "Show detailed SIFT analysis")
  .action(async (statement, options) => {
    console.log(chalk.cyan.bold("\n⟡ ISKRA SIFT Protocol\n"));
    console.log(chalk.gray("Source → Inference → Fact → Trace\n"));
    console.log(
      chalk.gray("(candidate assessment only — no independent evidence retrieval wired in yet;\n") +
        chalk.gray(" FACT/INFERENCE/UNVERIFIED/FALSE are unreachable until an evidence adapter lands)\n")
    );

    let statementToVerify = statement;

    // If no statement provided, prompt for it
    if (!statementToVerify) {
      const { input } = await inquirer.prompt([
        {
          type: "input",
          name: "input",
          message: chalk.cyan("Statement to verify:"),
          validate: (input: string) => input.trim().length > 0 || "Statement cannot be empty",
        },
      ]);
      statementToVerify = input;
    }

    console.log(chalk.white("\nVerifying:"), chalk.bold(statementToVerify), "\n");

    // Initialize Gemini service (reads GEMINI_API_KEY only — no VITE_ fallback,
    // browser-prefixed variables are not a CLI secret contract).
    const geminiService = createGeminiCliService();
    if (!geminiService) {
      console.log(chalk.red("Error: GEMINI_API_KEY environment variable not set"));
      console.log(chalk.yellow("\nSet it with:"));
      console.log(chalk.gray("  export GEMINI_API_KEY=your_api_key_here\n"));
      process.exit(1);
    }

    // Show loading spinner
    const spinner = ora(chalk.gray("Analyzing with SIFT protocol...")).start();

    try {
      // Real SIFT analysis using Gemini
      const siftResult = await geminiService.siftVerify(statementToVerify);
      
      spinner.stop();

      // Display results
      console.log(chalk.cyan("\n┌─ SIFT Analysis Result"));
      console.log(chalk.cyan("│"));
      
      const verdictColor =
        siftResult.verdict === "FACT" ? chalk.green :
        siftResult.verdict === "INFERENCE" ? chalk.yellow :
        chalk.red;
      
      console.log(chalk.cyan("│"), chalk.white("Verdict:   "), verdictColor.bold(siftResult.verdict));
      console.log(chalk.cyan("│"), chalk.white("Confidence:"), verdictColor(`${(siftResult.confidence * 100).toFixed(0)}%`));
      console.log(chalk.cyan("│"), chalk.white("Trace:     "), chalk.gray(sanitizeForTerminal(siftResult.trace)));
      console.log(chalk.cyan("│"));

      // "│   NN. " is at most eight display columns (two-digit index — the
      // schema caps proposedSources at 12 entries, so "12." is the widest
      // label); one column of slack beyond that so a terminal wrapping at
      // exactly `columns` still cannot fold a chunk.
      const locatorWrapWidth = Math.max(1, (process.stdout.columns ?? 80) - 9);

      if (options.detailed && siftResult.candidateSources.length > 0) {
        // Deliberately NOT headed "Sources": these strings come straight from
        // the model and have not been fetched, dereferenced or checked against
        // the claim. Printing them under an authoritative heading would restate
        // the very source claim this command's fail-closed verdict denies.
        console.log(chalk.yellow("├─ Candidate locators (model-proposed, NOT retrieved or verified)"));
        siftResult.candidateSources.forEach((source, idx) => {
          // A schema-valid locator may be a single printable line up to 2048
          // characters (round 2's schema bound; it constrains character class,
          // not length) — long enough that a terminal soft-wraps it into rows
          // this loop never saw, the same vector round 11 closed for the
          // Reasoning block. Hard-wrapping and marking every resulting chunk
          // closes it here too, rather than leaving locators as the one block
          // still vulnerable to it.
          const label = `${idx + 1}.`;
          const chunks = wrapToWidth(sanitizeForTerminal(source), locatorWrapWidth);
          chunks.forEach((chunk, i) => {
            const marker = i === 0 ? label : " ".repeat(label.length);
            console.log(chalk.yellow("│  "), chalk.white(marker), chalk.gray(chunk));
          });
        });
        console.log(chalk.yellow("│  "), chalk.gray("These are not evidence. Nothing above was fetched."));
        console.log(chalk.cyan("│"));
      }

      // Attribution must be per *rendered* line, not per block and not even per
      // logical line. Two ways a forged "✓ Verified: …" can shed its marker:
      //   1. `rationaleSummary` permits newlines, so a model can put the forged
      //      text on line 2 while only line 1 carries the caveat prefix;
      //   2. it permits a single printable line up to 8000 chars, which the
      //      terminal soft-wraps into visual lines the renderer never saw — so
      //      one `>` marker guards the first screen row and the padded forgery
      //      lands unquoted further down, with the heading scrolled away.
      // Splitting on "\n" alone fixes (1) and not (2). Hard-wrapping to the
      // terminal width and marking every chunk fixes both, because the renderer
      // then emits exactly the lines the terminal shows.
      const provenance = siftResult.reasoningSource;
      console.log(
        provenance === "model"
          ? chalk.cyan("├─ Reasoning (model-supplied text, NOT verified)")
          // A validation diagnostic is this tool speaking, and quoting it as
          // model output would be false provenance in the opposite direction:
          // it would hide that the rejection is the tool's own finding.
          : chalk.cyan("├─ Reasoning (validation diagnostic from this tool, not model text)")
      );
      // Sanitize per logical line first: real line breaks are legitimate here,
      // while every other control or format character is neutralised so it
      // cannot escape the "│" prefix or corrupt the width arithmetic below.
      const reasoningLines = siftResult.reasoning.split("\n").map(sanitizeForTerminal);
      const marker = provenance === "model" ? ">" : "|";
      // "│   > " is six visible columns; leave a column of slack so a terminal
      // that wraps at exactly `columns` still does not fold a chunk. Floored
      // at 1, not at some larger convenience number: an earlier revision
      // floored at 20, which meant a terminal narrower than 27 columns got
      // chunks wider than it could display — the exact soft-wrap-creates-
      // unmarked-rows failure this wrapping exists to close, self-inflicted
      // by the floor. wrapToWidth() already floors at 1 internally, so this
      // just has to stop overriding the real available width upward.
      const wrapWidth = Math.max(1, (process.stdout.columns ?? 80) - 7);
      reasoningLines.forEach(line => {
        for (const chunk of wrapToWidth(line, wrapWidth)) {
          console.log(chalk.cyan("│  "), chalk.gray(marker), chalk.white(chunk));
        }
      });
      console.log(
        chalk.cyan("│  "),
        chalk.gray(
          provenance === "model"
            ? "Every line above is model output, not a verdict of this tool."
            : "Every line above is this tool's validation output, not model text."
        )
      );
      console.log(chalk.cyan("│"));
      console.log(chalk.cyan("└─────────────────────────────────────\n"));

      // Recommendations
      if (siftResult.verdict === "INFERENCE") {
        console.log(chalk.yellow("⚠ Recommendation:"), "Seek additional sources to verify this inference.\n");
      } else if (siftResult.verdict === "FALSE") {
        // Distinct from UNSOURCED on purpose: "evidence contradicts this" is a
        // different statement from "nothing was found", and reporting the
        // second when the first is true understates a refuted claim.
        console.log(chalk.red("✗ Contradicted:"), "Evidence contradicts this statement.\n");
      } else if (siftResult.verdict === "UNVERIFIED") {
        // Distinct from UNSOURCED: evidence was found and is too weak to
        // support the claim. Reporting "no reliable sources found" here would
        // deny the existence of evidence the scorer actually weighed.
        console.log(chalk.red("✗ Insufficient:"), "Evidence was found but is too weak to support this statement.\n");
      } else if (siftResult.verdict === "UNSOURCED") {
        console.log(chalk.red("✗ Warning:"), "No reliable sources found. Treat as speculation.\n");
      } else {
        console.log(chalk.green("✓ Verified:"), "Statement supported by reliable sources.\n");
      }

    } catch (error) {
      spinner.stop();
      console.log(chalk.red(`\nError: ${error instanceof Error ? error.message : String(error)}\n`));
    }
  });
