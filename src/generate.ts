const SYSTEM_PROMPT = `You are an expert developer writing git commit messages.

Generate a single commit message following the Conventional Commits specification:
<type>(<scope>): <description>

[optional body]

Types: feat, fix, docs, style, refactor, test, chore, perf, build, ci

Rules:
- First line: type(scope): description — max 72 chars, imperative mood ("add" not "added")
- Scope: short noun describing what was changed (optional but helpful)
- Body: only if the change is complex; explain WHY not WHAT
- No period at end of subject line
- Be specific and concise

ONLY output the commit message. No explanation, no markdown, no quotes. Just the message.`;

export async function generateCommitMessage(
  diff: string,
  recentCommits: string,
  apiKey: string,
  model = "claude-haiku-4-5"
): Promise<string> {
  if (!diff.trim()) throw new Error("No staged changes found.");

  // Truncate diff if too long (keep first 6000 chars)
  const truncated = diff.length > 6000
    ? diff.slice(0, 6000) + "\n\n[... diff truncated ...]"
    : diff;

  const context = recentCommits
    ? `Recent commits for style reference:\n${recentCommits}\n\n`
    : "";

  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model,
      max_tokens: 256,
      system: SYSTEM_PROMPT,
      messages: [
        {
          role: "user",
          content: `${context}Generate a commit message for this diff:\n\n${truncated}`,
        },
      ],
    }),
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`Claude API error ${response.status}: ${err}`);
  }

  const data = await response.json() as {
    content: Array<{ type: string; text: string }>;
  };

  const message = data.content.find(c => c.type === "text")?.text?.trim() ?? "";
  if (!message) throw new Error("Empty response from Claude");
  return message;
}
