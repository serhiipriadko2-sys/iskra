import { Command } from "commander";
import chalk from "chalk";
import inquirer from "inquirer";
import ora from "ora";

export const siftCommand = new Command("sift")
  .description("Verify a statement using SIFT protocol (Source → Inference → Fact)")
  .argument("[statement]", "Statement to verify")
  .option("-d, --detailed", "Show detailed SIFT analysis")
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

    // Check for API key
    const apiKey = process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY;
    if (!apiKey) {
      console.log(chalk.red("Error: GEMINI_API_KEY environment variable not set"));
      console.log(chalk.yellow("\nSet it with:"));
      console.log(chalk.gray("  export GEMINI_API_KEY=your_api_key_here\n"));
      process.exit(1);
    }

    // Show loading spinner
    const spinner = ora(chalk.gray("Analyzing with SIFT protocol...")).start();

    try {
      // Simulate SIFT analysis (in real implementation, call evidenceService/geminiService)
      await new Promise((resolve) => setTimeout(resolve, 1500));
      
      spinner.stop();

      // Mock SIFT result
      type Verdict = "FACT" | "INFERENCE" | "UNSOURCED";
      const siftResult: {
        statement: string;
        verdict: Verdict;
        confidence: number;
        sources: Array<{ type: string; description: string; score: number }>;
        reasoning: string;
        trace: string;
      } = {
        statement: statementToVerify,
        verdict: "INFERENCE",
        confidence: 0.72,
        sources: [
          { type: "DIRECT", description: "No direct source found", score: 0 },
          { type: "INFERRED", description: "Logical inference from context", score: 0.72 },
        ],
        reasoning: "Утверждение основано на логическом выводе, но требует дополнительной проверки источников.",
        trace: "SIFT-CLI-DEMO-001",
      };

      // Display results
      console.log(chalk.cyan("\n┌─ SIFT Analysis Result"));
      console.log(chalk.cyan("│"));
      
      const verdictColor = 
        siftResult.verdict === "FACT" ? chalk.green :
        siftResult.verdict === "INFERENCE" ? chalk.yellow :
        chalk.red;
      
      console.log(chalk.cyan("│"), chalk.white("Verdict:   "), verdictColor.bold(siftResult.verdict));
      console.log(chalk.cyan("│"), chalk.white("Confidence:"), verdictColor(`${(siftResult.confidence * 100).toFixed(0)}%`));
      console.log(chalk.cyan("│"), chalk.white("Trace:     "), chalk.gray(siftResult.trace));
      console.log(chalk.cyan("│"));

      if (options.detailed) {
        console.log(chalk.cyan("├─ Sources"));
        siftResult.sources.forEach((source, idx) => {
          console.log(chalk.cyan("│  "), chalk.white(`${idx + 1}.`), chalk.gray(source.type), "-", source.description);
        });
        console.log(chalk.cyan("│"));
      }

      console.log(chalk.cyan("├─ Reasoning"));
      console.log(chalk.cyan("│  "), chalk.white(siftResult.reasoning));
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

      console.log(chalk.gray("Note: This is a demonstration. Connect to evidenceService for full SIFT analysis.\n"));

    } catch (error) {
      spinner.stop();
      console.log(chalk.red(`\nError: ${error instanceof Error ? error.message : String(error)}\n`));
    }
  });
