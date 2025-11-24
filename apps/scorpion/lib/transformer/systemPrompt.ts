/**
 * System Prompt Loader for Transformer Architecture
 * 
 * Loads the transformer-style Scorpion system prompt and allows switching
 * risk modes (safe / balanced / exploratory).
 */

import fs from 'node:fs';
import path from 'node:path';

export type RiskMode = 'safe' | 'balanced' | 'exploratory';

export interface SystemPromptOptions {
  riskMode?: RiskMode;
  extraInstructions?: string;
}

// Path to the transformer system prompt file
const DEFAULT_PROMPT_PATH = path.join(
  process.cwd(),
  'apps',
  'scorpion',
  'server',
  'transformer',
  'system-prompt.txt'
);

// Fallback if file can't be loaded
const FALLBACK_PROMPT = `
You are Scorpion, a system-sized transformer orchestrating tools, workflows,
and knowledge. Treat each run as a decoder block:

1) Normalize context
2) Attend over tools/docs/workflows/logs (Planner + Council heads)
3) Plan concrete tool calls
4) Execute tools (feed-forward)
5) Validate, summarize, and emit next step

Always:
- Prefer small, reversible changes
- Generate explicit plans and diffs
- Respect risk mode (safe | balanced | exploratory)
`.trim();

/**
 * Load base system prompt from file or env.
 */
function loadBaseSystemPrompt(): string {
  // Highest priority: env override (for hot-iterating)
  if (process.env.SCORPION_SYSTEM_PROMPT) {
    return process.env.SCORPION_SYSTEM_PROMPT;
  }

  try {
    const raw = fs.readFileSync(DEFAULT_PROMPT_PATH, 'utf8');
    return raw.trim();
  } catch {
    return FALLBACK_PROMPT;
  }
}

/**
 * Map risk mode to explicit behavioural hints.
 */
function riskModeInstructions(mode: RiskMode): string {
  switch (mode) {
    case 'safe':
      return `
[RISK MODE: SAFE]
- Minimize changes
- Avoid destructive operations
- Prefer read-only analysis and explicit human approval before risky actions
- Favor conservative, obvious tool choices
`.trim();

    case 'exploratory':
      return `
[RISK MODE: EXPLORATORY]
- You may propose bold refactors and alternative architectures
- Keep all changes reversible (branches, versioned workflows)
- Clearly label speculative suggestions and simulations
`.trim();

    case 'balanced':
    default:
      return `
[RISK MODE: BALANCED]
- Balance safety and progress
- Propose reasonable changes, but keep rollback paths
- Use tests and validation steps for any non-trivial modification
`.trim();
  }
}

/**
 * Returns the final system prompt used for Planner/Council/Orchestrator agents.
 */
export function getSystemPrompt(options: SystemPromptOptions = {}): string {
  const base = loadBaseSystemPrompt();
  const mode = options.riskMode ?? 'balanced';
  const risk = riskModeInstructions(mode);

  const extra = options.extraInstructions?.trim();
  const extraBlock = extra
    ? `\n\n[ADDITIONAL INSTRUCTIONS]\n${extra}`
    : '';

  return `${base}\n\n${risk}${extraBlock}`.trim();
}

