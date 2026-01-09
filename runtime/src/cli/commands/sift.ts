import { Command } from "commander";
import chalk from "chalk";
import inquirer from "inquirer";
import ora from "ora";
import { createGeminiService } from "../gemini.js";

export const siftCommand = new Command("sift")
  .description("Verify a statement using SIFT protocol (Source → Inference → Fact)")
  .argument("[statement]", "Statement to verify")
  .option("-d, --detailed", "Show detailed SIFT analysis")
  .option("-j, --json", "Output raw JSON result")
  .action(async (statement, options) => {
    console.log(chalk.cyan.bold("\n⟡ ISKRA SIFT Protocol\n"));
    console.log(chalk.gray("Source → Inference → Fact → Trace\n"));

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

    // Create Gemini service
    const gemini = createGeminiService();

    if (!gemini) {
      console.log(chalk.red("Error: GEMINI_API_KEY environment variable not set"));
      console.log(chalk.yellow("\nSet it with:"));
      console.log(chalk.gray("  export GEMINI_API_KEY=your_api_key_here\n"));
      process.exit(1);
    }

    // Show loading spinner
    const spinner = ora(chalk.gray("Analyzing with SIFT protocol...")).start();

    try {
      // Perform SIFT verification
      const siftResult = await gemini.verifySift(statementToVerify);

      spinner.stop();

      // JSON output mode
      if (options.json) {
        console.log(JSON.stringify(siftResult, null, 2));
        return;
      }

      // Display results
      console.log(chalk.cyan("\n┌─ SIFT Analysis Result"));
      console.log(chalk.cyan("│"));

      const verdictColor =
        siftResult.verdict === "FACT"
          ? chalk.green
          : siftResult.verdict === "INFERENCE"
            ? chalk.yellow
            : chalk.red;

      console.log(
        chalk.cyan("│"),
        chalk.white("Verdict:   "),
        verdictColor.bold(siftResult.verdict)
      );
      console.log(
        chalk.cyan("│"),
        chalk.white("Confidence:"),
        verdictColor(`${(siftResult.confidence * 100).toFixed(0)}%`)
      );
      console.log(
        chalk.cyan("│"),
        chalk.white("Trace:     "),
        chalk.gray(siftResult.trace)
      );
      console.log(chalk.cyan("│"));

      if (options.detailed && siftResult.sources.length > 0) {
        console.log(chalk.cyan("├─ Sources"));
        siftResult.sources.forEach((source, idx) => {
          const sourceColor =
            source.type === "DIRECT"
              ? chalk.green
              : source.type === "INFERRED"
                ? chalk.yellow
                : chalk.red;
          console.log(
            chalk.cyan("│  "),
            chalk.white(`${idx + 1}.`),
            sourceColor(source.type),
            "-",
            source.description
          );
          if (source.score > 0) {
            console.log(
              chalk.cyan("│     "),
              chalk.gray(`Score: ${(source.score * 100).toFixed(0)}%`)
            );
          }
        });
        console.log(chalk.cyan("│"));
      }

      console.log(chalk.cyan("├─ Reasoning"));
      // Split reasoning into lines for better formatting
      const reasoningLines = siftResult.reasoning.split(/[.!?]+/).filter(Boolean);
      reasoningLines.forEach((line) => {
        console.log(chalk.cyan("│  "), chalk.white(line.trim() + "."));
      });
      console.log(chalk.cyan("│"));
      console.log(chalk.cyan("└─────────────────────────────────────\n"));

      // Recommendations
      if (siftResult.verdict === "INFERENCE") {
        console.log(
          chalk.yellow("⚠ Recommendation:"),
          "Seek additional sources to verify this inference.\n"
        );
      } else if (siftResult.verdict === "UNSOURCED") {
        console.log(
          chalk.red("✗ Warning:"),
          "No reliable sources found. Treat as speculation.\n"
        );
      } else {
        console.log(
          chalk.green("✓ Verified:"),
          "Statement supported by reliable sources.\n"
        );
      }

      // Delta signature
      console.log(chalk.gray("─────────────────────────────────────"));
      console.log(chalk.cyan("∆DΩΛ Signature:"));
      console.log(chalk.white(`  ∆: ${siftResult.verdict} - ${siftResult.statement.substring(0, 50)}...`));
      console.log(chalk.white(`  D: SIFT Protocol Analysis`));
      console.log(chalk.white(`  Ω: ${(siftResult.confidence * 100).toFixed(0)}%`));
      console.log(chalk.white(`  Λ: ${
        siftResult.verdict === "FACT"
          ? "Можно использовать как основу для решений"
          : siftResult.verdict === "INFERENCE"
            ? "Требуется дополнительная верификация"
            : "Не использовать без проверки"
      }`));
      console.log();

    } catch (error) {
      spinner.stop();
      console.log(
        chalk.red(`\nError: ${error instanceof Error ? error.message : String(error)}\n`)
      );
    }
  });
