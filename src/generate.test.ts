import { describe, it, expect, vi } from "vitest";
import { generateCommitMessage } from "./generate.js";

describe("generateCommitMessage", () => {
  it("returns a commit message string", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        content: [{ type: "text", text: "feat(auth): add wallet signature verification" }],
      }),
    } as unknown as Response);

    const msg = await generateCommitMessage("diff --git a/src/auth.ts", "", "test-key");
    expect(msg).toBe("feat(auth): add wallet signature verification");
  });

  it("throws if no staged diff", async () => {
    await expect(generateCommitMessage("", "", "test-key")).rejects.toThrow("No staged");
  });

  it("truncates long diffs", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        content: [{ type: "text", text: "chore: update large file" }],
      }),
    } as unknown as Response);

    const longDiff = "x".repeat(10000);
    const msg = await generateCommitMessage(longDiff, "", "test-key");
    expect(msg).toBeTruthy();

    // Verify truncation happened in the API call
    const callBody = JSON.parse((global.fetch as ReturnType<typeof vi.fn>).mock.calls[0][1].body);
    expect(callBody.messages[0].content).toContain("truncated");
  });

  it("throws on API error", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: false, status: 429, text: async () => "Rate limited",
    } as unknown as Response);

    await expect(generateCommitMessage("some diff", "", "test-key")).rejects.toThrow("429");
  });
});
