import { execSync } from "child_process";

export function getStagedDiff(): string {
  try {
    return execSync("git diff --staged", { encoding: "utf-8" });
  } catch {
    throw new Error("Not a git repository or git is not installed.");
  }
}

export function getRecentCommits(n = 5): string {
  try {
    return execSync(`git log --oneline -${n}`, { encoding: "utf-8" });
  } catch {
    return "";
  }
}

export function commitWithMessage(message: string): void {
  execSync(`git commit -m ${JSON.stringify(message)}`, { stdio: "inherit" });
}

export function getCurrentBranch(): string {
  try {
    return execSync("git rev-parse --abbrev-ref HEAD", { encoding: "utf-8" }).trim();
  } catch {
    return "unknown";
  }
}
