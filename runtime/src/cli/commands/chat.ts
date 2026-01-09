import { Command } from "commander";
import chalk from "chalk";
import inquirer from "inquirer";
import ora from "ora";
import { createGeminiService, ChatMessage } from "../gemini.js";

const VOICE_NAMES = ["ISKRA", "KAIN", "PINO", "SAM", "ANHANTRA", "HUYNDUN", "ISKRIV", "MAKI", "SIBYL"] as const;
type VoiceName = (typeof VOICE_NAMES)[number];

export const chatCommand = new Command("chat")
  .description("Start an interactive chat session with ISKRA")
  .option("-v, --voice <voice>", "Select voice (ISKRA, KAIN, PINO, SAM, etc.)")
  .option("-m, --model <model>", "Select model (gemini-2.0-flash-exp, gemini-2.0-pro)", "gemini-2.0-flash-exp")
  .option("--no-delta", "Disable ∆DΩΛ protocol in responses")
  .action(async (options) => {
    console.log(chalk.cyan.bold("\n⟡ ISKRA CLI Chat\n"));

    const voice = (options.voice?.toUpperCase() as VoiceName) || "ISKRA";
    const model = options.model;
    const includeDelta = options.delta !== false;

    console.log(chalk.gray(`Voice: ${voice}`));
    console.log(chalk.gray(`Model: ${model}`));
    console.log(chalk.gray(`∆DΩΛ Protocol: ${includeDelta ? "enabled" : "disabled"}\n`));

    // Create Gemini service
    const gemini = createGeminiService();

    if (!gemini) {
      console.log(chalk.red("Error: GEMINI_API_KEY environment variable not set"));
      console.log(chalk.yellow("\nSet it with:"));
      console.log(chalk.gray("  export GEMINI_API_KEY=your_api_key_here\n"));
      process.exit(1);
    }

    console.log(chalk.green("✓ Connected to Gemini API"));
    console.log(chalk.gray("Type 'exit', 'quit', or Ctrl+C to end the session"));
    console.log(chalk.gray("Type '/voice NAME' to switch voice\n"));

    // Interactive chat loop
    let continueChat = true;
    const messages: ChatMessage[] = [];
    let currentVoice: VoiceName = voice;

    while (continueChat) {
      const { message } = await inquirer.prompt([
        {
          type: "input",
          name: "message",
          message: chalk.cyan("You:"),
          validate: (input: string) => input.trim().length > 0 || "Message cannot be empty",
        },
      ]);

      const trimmedMessage = message.trim();
      const lowerMessage = trimmedMessage.toLowerCase();

      // Exit commands
      if (lowerMessage === "exit" || lowerMessage === "quit") {
        console.log(chalk.cyan("\n⟡ До встречи. Храни различие.\n"));
        continueChat = false;
        break;
      }

      // Voice switch command
      if (trimmedMessage.startsWith("/voice ")) {
        const newVoice = trimmedMessage.slice(7).toUpperCase() as VoiceName;
        if (VOICE_NAMES.includes(newVoice)) {
          currentVoice = newVoice;
          console.log(chalk.green(`✓ Voice switched to ${currentVoice}\n`));
        } else {
          console.log(chalk.red(`Unknown voice: ${newVoice}`));
          console.log(chalk.gray(`Available: ${VOICE_NAMES.join(", ")}\n`));
        }
        continue;
      }

      // Add user message
      messages.push({ role: "user", text: trimmedMessage });

      // Show loading indicator
      const spinner = ora(chalk.gray("Thinking...")).start();
      let responseText = "";

      try {
        // Stream response
        spinner.stop();
        process.stdout.write(chalk.magenta(`\n${currentVoice}: `));

        for await (const chunk of gemini.streamChatResponse(messages, {
          voice: currentVoice,
          includeDelta,
        })) {
          process.stdout.write(chalk.white(chunk));
          responseText += chunk;
        }

        console.log("\n");

        // Add assistant response to history
        messages.push({ role: "model", text: responseText });

      } catch (error) {
        spinner.stop();
        const errorMsg = error instanceof Error ? error.message : String(error);
        console.log(chalk.red(`\nError: ${errorMsg}\n`));

        // Remove the failed user message from history
        messages.pop();
      }
    }
  });
