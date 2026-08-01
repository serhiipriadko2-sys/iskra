/// <reference lib="dom" />
import { Command } from "commander";
import chalk from "chalk";
import inquirer from "inquirer";
import ora from "ora";
import { createGeminiCliService, sanitizeForTerminal } from "../services/geminiCliService.js";

export const siftCommand = new Command("sift")
  .description("Verify a statement using SIFT protocol (Source → Inference → Fact)")
  .argument("[statement]", "Statement to verify")
  .option("-d, --detailed", "Show detailed SIFT analysis")
  .action(async (statement, options) => {
    console.log(chalk.cyan.bold("\n⟡ ISKRA SIFT Protocol\n"));
    console.log(chalk.gray("Source → Inference → Fact → Trace\n"));
    console.log(
      chalk.gray("(candidate assessment only — no independent evidence retrieval wired in yet;\n") +
        chalk.gray(" FACT/INFERENCE are unreachable until an evidence adapter lands)\n")
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

      if (options.detailed && siftResult.candidateSources.length > 0) {
        // Deliberately NOT headed "Sources": these strings come straight from
        // the model and have not been fetched, dereferenced or checked against
        // the claim. Printing them under an authoritative heading would restate
        // the very source claim this command's fail-closed verdict denies.
        console.log(chalk.yellow("├─ Candidate locators (model-proposed, NOT retrieved or verified)"));
        siftResult.candidateSources.forEach((source, idx) => {
          console.log(chalk.yellow("│  "), chalk.white(`${idx + 1}.`), chalk.gray(sanitizeForTerminal(source)));
        });
        console.log(chalk.yellow("│  "), chalk.gray("These are not evidence. Nothing above was fetched."));
        console.log(chalk.cyan("│"));
      }

      console.log(chalk.cyan("├─ Reasoning"));
      // Split first, then sanitize each line: real line breaks are legitimate
      // here and get the "│" prefix, while every other control or format
      // character is neutralised so it cannot escape that prefix.
      const reasoningLines = siftResult.reasoning.split("\n").map(sanitizeForTerminal);
      reasoningLines.forEach(line => {
        console.log(chalk.cyan("│  "), chalk.white(line));
      });
      console.log(chalk.cyan("│"));
      console.log(chalk.cyan("└─────────────────────────────────────\n"));

      // Recommendations
      if (siftResult.verdict === "INFERENCE") {
        console.log(chalk.yellow("⚠ Recommendation:"), "Seek additional sources to verify this inference.\n");
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
