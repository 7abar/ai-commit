# ai-commit ✍️

> Stop writing commit messages. Let Claude write them from your diff.

`ai-commit` reads your staged changes and generates a [Conventional Commits](https://www.conventionalcommits.org/) message using Claude. Fast, cheap, and surprisingly good.

## Setup

```bash
git clone https://github.com/7abar/ai-commit
cd ai-commit
npm install
export ANTHROPIC_API_KEY=sk-ant-...
```

Optional alias for daily use:

```bash
alias aic="node /path/to/ai-commit/src/index.js"
```

## Usage

```bash
# Stage your changes
git add src/merkle.ts tests/merkle.test.ts

# Generate + commit
node src/index.js

# Preview only (no commit)
node src/index.js --dry-run

# Higher quality for important commits (uses claude-opus-4-5)
node src/index.js --quality
```

## Example

```
$ git add src/airdrop.ts
$ node src/index.js

Generating commit message (branch: feat/airdrop)...

┌─────────────────────────────────────────┐
│  Generated commit message:               │
└─────────────────────────────────────────┘

  feat(airdrop): add merkle proof verification for airdrop claims

  Implements MerkleProof.verify() check in claim() to ensure only
  whitelisted addresses can claim tokens. Prevents unauthorized claims
  without requiring on-chain storage of all eligible addresses.

  Commit with this message? [Y/n/e(dit)] Y
✓ Committed.
```

## How It Works

1. Runs `git diff --staged` to get your changes
2. Reads last 5 commits for style context
3. Sends to Claude with Conventional Commits instructions
4. Shows the generated message for approval
5. You can confirm (Y), abort (n), or edit (e) before committing

Large diffs are automatically truncated to 6000 chars to stay within token limits.

## Flags

| Flag | Description |
|---|---|
| `--dry-run`, `-n` | Preview message without committing |
| `--quality` | Use `claude-opus-4-5` for complex/important commits |

## Models

- **Default:** `claude-haiku-4-5` — fast (~2s) and cheap. Perfect for daily commits.
- **`--quality`:** `claude-opus-4-5` — better for large refactors or complex changes.

## Requirements

- Node.js 18+
- `ANTHROPIC_API_KEY` ([get one](https://console.anthropic.com))
- Must be run inside a git repository with staged changes

## License

MIT
