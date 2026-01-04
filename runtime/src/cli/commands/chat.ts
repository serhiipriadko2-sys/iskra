import { Command } from "commander";
import chalk from "chalk";
import inquirer from "inquirer";
import ora from "ora";

export const chatCommand = new Command("chat")
  .description("Start an interactive chat session with ISKRA")
  .option("-v, --voice <voice>", "Select voice (ISKRA, KAIN, PINO, SAM, etc.)")
  .option("-m, --model <model>", "Select model (gemini-2.0-flash, gemini-2.0-pro)", "gemini-2.0-flash")
  .action(async (options) => {
    console.log(chalk.cyan.bold("\n⟡ ISKRA CLI Chat\n"));
    
    const voice = options.voice || "ISKRA";
    const model = options.model;

    console.log(chalk.gray(`Voice: ${voice}`));
    console.log(chalk.gray(`Model: ${model}\n`));

    // Check for API key
    const apiKey = process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY;
    if (!apiKey) {
      console.log(chalk.red("Error: GEMINI_API_KEY environment variable not set"));
      console.log(chalk.yellow("\nSet it with:"));
      console.log(chalk.gray("  export GEMINI_API_KEY=your_api_key_here\n"));
      process.exit(1);
    }

    console.log(chalk.green("✓ API key found"));
    console.log(chalk.gray("Type 'exit' or 'quit' to end the session\n"));

    // Interactive chat loop
    let continueChat = true;
    const messages: Array<{ role: string; content: string }> = [];

    while (continueChat) {
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
        continueChat = false;
        break;
      }

      // Add user message
      messages.push({ role: "user", content: message });

      // Show loading spinner
      const spinner = ora(chalk.gray("Thinking...")).start();

      try {
        // Simulate API call (in real implementation, call geminiService)
        await new Promise((resolve) => setTimeout(resolve, 1000));
        
        spinner.stop();

        // Mock response
        const response = `[${voice}] Это демонстрационный ответ CLI.\n\nДля полной функциональности необходимо:\n- Интеграция с geminiService\n- Реализация ∆DΩΛ протокола\n- Поддержка streaming\n\nВаше сообщение: "${message}"`;
        
        console.log(chalk.magenta(`\n${voice}:`), chalk.white(response), "\n");
        
        messages.push({ role: "assistant", content: response });
      } catch (error) {
        spinner.stop();
        console.log(chalk.red(`\nError: ${error instanceof Error ? error.message : String(error)}\n`));
      }
    }
  });
