import { run, claudeCode } from "@ai-hero/sandcastle";
import { docker } from "@ai-hero/sandcastle/sandboxes/docker";

// Arbeitet offene Issues mit Label "Sandcastle" nacheinander ab, ein Issue pro Iteration.
// Start: bun run sandcastle (nicht auf main).
await run({
  name: "worker",
  sandbox: docker({ imageName: "sandcastle:foerderverein" }),
  agent: claudeCode("claude-opus-5-5"),
  promptFile: "./.sandcastle/prompt.md",
  maxIterations: 10,
  // Temporärer Branch für den Agenten, am Ende zurück in HEAD gemergt.
  branchStrategy: { type: "merge-to-head" },
  copyToWorktree: ["node_modules"],
  hooks: {
    sandbox: {
      onSandboxReady: [{ command: "bun install --frozen-lockfile" }],
    },
  },
});
