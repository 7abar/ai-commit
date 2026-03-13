#!/usr/bin/env node
import * as readline from "readline";
import { getStagedDiff, getRecentCommits, commitWithMessage, getCurrentBranch } from "./git.js";
import { generateCommitMessage } from "./generate.js";

const args = process.argv.slice(2);
const dryRun = args.includes("--dry-run") || args.includes("-n");
const useOpus = args.includes("--quality");
const model = useOpus ? "claude-opus-4-5" : "claude-haiku-4-5";
const apiKey = process.env.ANTHROPIC_API_KEY;

if (!apiKey) {
  console.error("\nMissing ANTHROPIC_API_KEY environment variable.");
  console.error("Get your key at: https://console.anthropic.com\n");
  process.exit(1);
}

function ask(question: string): Promise<string> {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  return new Promise(resolve => {
    rl.question(question, answer => { rl.close(); resolve(answer.trim()); });
  });
}

async function main() {
  const diff = getStagedDiff();

  if (!diff.trim()) {
    console.log("\nNo staged changes. Run `git add` first.\n");
    process.exit(0);
  }

  const branch = getCurrentBranch();
  const recentCommits = getRecentCommits(5);

  console.log(`\nGenerating commit message (branch: ${branch})...`);

  const message = await generateCommitMessage(diff, recentCommits, apiKey, model);

  console.log("\n┌─────────────────────────────────────────┐");
  console.log("│  Generated commit message:               │");
  console.log("└─────────────────────────────────────────┘");
  console.log(`\n  ${message.split("\n").join("\n  ")}\n`);

  if (dryRun) {
    console.log("(--dry-run: not committing)\n");
    return;
  }

  const answer = await ask("  Commit with this message? [Y/n/e(dit)] ");

  if (answer.toLowerCase() === "n") {
    console.log("\nAborted.\n");
    return;
  }

  if (answer.toLowerCase() === "e") {
    const edited = await ask(`\n  Edit message:\n  `);
    commitWithMessage(edited || message);
  } else {
    commitWithMessage(message);
    console.log("\n✓ Committed.\n");
  }
}

main().catch(err => {
  console.error("\nError:", err.message);
  process.exit(1);
});
