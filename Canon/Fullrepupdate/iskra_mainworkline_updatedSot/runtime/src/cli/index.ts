#!/usr/bin/env node

import { Command } from "commander";
import chalk from "chalk";
import { chatCommand } from "./commands/chat.js";
import { metricsCommand } from "./commands/metrics.js";
import { siftCommand } from "./commands/sift.js";
import { version } from "./version.js";

const program = new Command();

program
  .name("iskra")
  .description(
    chalk.cyan("ISKRA AI Companion") + " - Terminal interface for deep conversation"
  )
  .version(version, "-v, --version", "Display version")
  .helpOption("-h, --help", "Display help");

// Register commands
program.addCommand(chatCommand);
program.addCommand(metricsCommand);
program.addCommand(siftCommand);

// Parse arguments
program.parse(process.argv);

// Show help if no command provided
if (!process.argv.slice(2).length) {
  program.outputHelp();
}
