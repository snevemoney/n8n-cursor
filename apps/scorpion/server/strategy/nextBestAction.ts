// apps/scorpion/server/strategy/nextBestAction.ts

import {
  NextBestAction,
  ScorpionContextSnapshot,
  ScorpionGoal,
} from '../types/strategy';

/**
 * Naive goal extractor (LLM already understands context; this just structures it).
 * You can later upgrade this to use your internal planner or a small LLM call.
 */
export function inferGoalFromContext(
  snapshot: ScorpionContextSnapshot,
): ScorpionGoal {
  const lastUserMessage = [...snapshot.messages]
    .reverse()
    .find((m) => m.role === 'user');

  const description =
    lastUserMessage?.content?.slice(0, 400) ||
    'User goal not fully clear from recent messages.';

  // Very simple heuristic; you can wire into your intent classifier later.
  let category: ScorpionGoal['category'] = undefined;
  if (/bug|error|crash|fails?/.test(description.toLowerCase())) {
    category = 'bugfix';
  } else if (/architecture|stack|design|system/.test(description.toLowerCase())) {
    category = 'architecture';
  } else if (/research|investigate|compare|analy(z|s)e/.test(description.toLowerCase())) {
    category = 'research';
  } else if (/ui|ux|screen|page|component/.test(description.toLowerCase())) {
    category = 'product';
  }

  const clarityScore = description.length > 40 ? 1 : 0.5;

  return {
    description,
    category,
    clarityScore,
  };
}

/**
 * Core Next-Best-Action engine.
 * It looks at the context + goal and proposes the next move.
 */
export function computeNextBestAction(
  snapshot: ScorpionContextSnapshot,
): NextBestAction {
  const goal = inferGoalFromContext(snapshot);
  const lastMsg = snapshot.messages[snapshot.messages.length - 1];

  const toolsUsed = snapshot.toolsUsed || [];
  const hasPlan =
    typeof snapshot.planSummary === 'string' &&
    snapshot.planSummary.trim().length > 0;

  // If the goal is unclear, ask a clarifying question.
  if (goal.clarityScore < 0.7) {
    return {
      title: 'Clarify the Goal',
      description:
        "The user's goal is not fully explicit yet. Before touching the stack or tools, clarify exactly what must be achieved.",
      steps: [
        'Ask one precise clarifying question about the expected outcome.',
        'Restate the goal in your own words.',
        'Only then, create or update the plan.',
      ],
      rationale:
        'Strategy must lead. Acting without a clear goal increases tech debt, rework, and confusion in Scorpion.',
      suggestedTools: [],
      risks: [
        'Building the wrong feature.',
        'Debugging the wrong layer (UI vs. orchestrator vs. tools).',
      ],
    };
  }

  // Simple heuristics depending on phase / context.
  if (!hasPlan) {
    return {
      title: 'Draft a Small, Focused Plan',
      description:
        'There is no explicit plan yet for this mission. Define a short, concrete plan before using tools.',
      steps: [
        'Write a 3–5 step plan to satisfy the current goal.',
        'Mark which steps require tools and which are pure reasoning/design.',
        'Execute the smallest useful step first (no over-planning).',
      ],
      rationale:
        'A tiny plan prevents random tool calls and ensures every action serves the strategy.',
      suggestedTools: [],
      risks: ['Overcomplicating the mission with too many steps.'],
    };
  }

  if (
    snapshot.currentPhase === 'EXECUTE' &&
    lastMsg?.role === 'assistant' &&
    /done|completed|implemented/i.test(lastMsg.content)
  ) {
    return {
      title: 'Run a Sanity Check & Capture Learnings',
      description:
        'Execution seems complete. Now verify behavior and record what worked for future missions.',
      steps: [
        'Run or describe minimal tests (happy path + one edge case).',
        'If tests pass, log this pattern as a successful mission.',
        'If tests fail, narrow down the failing step and update the plan.',
      ],
      rationale:
        'Closing the loop makes Scorpion more reliable and builds a library of successful patterns.',
      suggestedTools: ['workflow.run', 'code.search'],
      risks: ['Skipping validation leads to recurring bugs and regressions.'],
    };
  }

  // Fallback: default NBA for mid-mission.
  return {
    title: 'Execute the Next Smallest High-Impact Step',
    description:
      'The goal and plan are known. Focus on the next smallest action that moves the mission forward without increasing complexity.',
    steps: [
      'Identify the next step in the plan that unblocks the most progress.',
      'If a tool is needed, call it once with a clear, minimal query.',
      'Update the plan and context summary after executing this step.',
    ],
    rationale:
      'Small, high-impact actions keep Scorpion lean and avoid noisy, unfocused tool usage.',
    suggestedTools: toolsUsed.length ? toolsUsed.slice(-3) : [],
    risks: [
      'Jumping ahead in the plan and leaving steps half-done.',
      'Calling tools without clearly defined inputs or outputs.',
    ],
  };
}

