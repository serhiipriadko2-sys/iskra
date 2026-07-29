import { Command } from "commander";
import chalk from "chalk";
import inquirer from "inquirer";
import ora from "ora";
import { GeminiCliService, ChatMessage } from "../services/geminiCliService.js";
import type { VoiceName } from "../../types/voices.js";
import { VOICE_SYMBOLS } from "../../types/voices.js";
import { DEFAULT_METRICS } from "../../types/metrics.js";

export const chatCommand = new Command("chat")
  .description("Start an interactive chat session with ISKRA")
  .option("-v, --voice <voice>", "Select voice (ISKRA, KAIN, PINO, SAM, etc.)")
  .option("-m, --model <model>", "Select model (gemini-2.0-flash, gemini-2.0-pro)", "gemini-2.0-flash")
  .option("--no-stream", "Disable streaming (get full response at once)")
  .action(async (options) => {
    console.log(chalk.cyan.bold("\n⟡ ISKRA CLI Chat\n"));
    
    const voice = (options.voice?.toUpperCase() || "ISKRA") as VoiceName;
    const model = options.model;
    const streaming = options.stream !== false;

    const voiceSymbol = VOICE_SYMBOLS[voice] || "⟡";
    console.log(chalk.gray(`Voice: ${voiceSymbol} ${voice}`));
    console.log(chalk.gray(`Model: ${model}`));
    console.log(chalk.gray(`Streaming: ${streaming ? "enabled" : "disabled"}\n`));

    // Check for API key
    const apiKey = process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY;
    if (!apiKey) {
      console.log(chalk.red("Error: GEMINI_API_KEY environment variable not set"));
      console.log(chalk.yellow("\nSet it with:"));
      console.log(chalk.gray("  export GEMINI_API_KEY=your_api_key_here\n"));
      process.exit(1);
    }

    // Initialize Gemini service
    const geminiService = new GeminiCliService({ apiKey, model });
    console.log(chalk.green("✓ Connected to Gemini API"));
    console.log(chalk.gray("Type 'exit' or 'quit' to end the session\n"));

    // Interactive chat loop
    const history: ChatMessage[] = [];

    while (true) {
      const { message } = await inquirer.prompt([
        {
          type: "input",
          name: "message",
          message: chalk.cyan("You:"),
          validate: (input: string) => input.trim().length > 0 || "Message cannot be empty",
        },
      ]);

      const trimmedMessage = message.trim().toLowerCase();
      
      if (trimmedMessage === "exit" || trimmedMessage === "quit") {
        console.log(chalk.cyan("\n⟡ До встречи. Храни различие.\n"));
        break;
      }

      // Add user message to history
      history.push({ role: "user", content: message });

      // Show loading spinner
      const spinner = ora(chalk.gray("Thinking...")).start();

      try {
        let response = "";

        if (streaming) {
          // Streaming response
          spinner.stop();
          process.stdout.write(chalk.magenta(`\n${voiceSymbol} ${voice}: `));

          for await (const chunk of geminiService.generateResponseStream(message, {
            voice,
            metrics: DEFAULT_METRICS,
            history: history.slice(0, -1), // Exclude the just-added user message
          })) {
            response += chunk;
            process.stdout.write(chalk.white(chunk));
          }
          console.log("\n");
        } else {
          // Non-streaming response
          response = await geminiService.generateResponse(message, {
            voice,
            metrics: DEFAULT_METRICS,
            history: history.slice(0, -1),
          });
          spinner.stop();
          console.log(chalk.magenta(`\n${voiceSymbol} ${voice}:`), chalk.white(response), "\n");
        }

        // Add assistant response to history
        history.push({ role: "model", content: response });
      } catch (error) {
        spinner.stop();
        console.log(chalk.red(`\nError: ${error instanceof Error ? error.message : String(error)}\n`));
      }
    }
  });
