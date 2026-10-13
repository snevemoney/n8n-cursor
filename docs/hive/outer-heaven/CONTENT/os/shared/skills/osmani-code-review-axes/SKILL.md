---
name: Osmani code review axes
description: >-
  Use before merging or accepting agent/human code — multi-axis review; verifier ≠ builder; remaps Osmani code-review-and-quality.
merged_from: [osmani-doubt-adversarial, superpowers-receive-review, superpowers-request-review]
---
# Osmani code review axes

Source: addyosmani/agent-skills `code-review-and-quality` (MIT).

## When
Before merge, before Forge-done, or when reviewing agent/human diffs.

## Do
1. Builder cannot grade own ship. Watchdog/Consultant critic.
2. Axes: correctness, security (no exploit writing), readability, tests, scope creep, HOLD list (live `/`, secrets, send).
3. Require evidence URLs/paths — mention ≠ review.
4. PASS DIFF ≠ PASS live. click-live-site when site claimed.

## Don't
Self-PASS. Merge PR 149 as ship. Invent traffic or dollars.

---

## Merged from `osmani-doubt-adversarial` (2026-10-11)

- Original description: Use when correctness matters more than speed — fresh-context adversarial review before a decision stands; remaps Osmani doubt-driven-development to Watchdog/Consultant critic.
- Unique content carried: request-with-evidence; verify feedback against codebase before implementing; fresh-context adversarial pass

# Osmani doubt adversarial

Source: addyosmani/agent-skills `doubt-driven-development` (MIT).

## When
Non-trivial architecture, CapEx close, security-sensitive, or feels done.

## Do
1. Writer stops. Separate critic node (Watchdog or Consultant) re-reads with evidence.
2. Critic lists what would make FAIL — including L5 open records when OS/frontend.
3. No stand until critic card exists. Forge does not self-PASS.

## Don't
Same agent grades itself. Ship live `/` to clear a doubt.


---

## Merged from `superpowers-receive-review` (2026-10-11)

- Original description: Use when receiving critic/review feedback — verify against the codebase before implementing; remaps obra/superpowers receiving-code-review.
- Unique content carried: request-with-evidence; verify feedback against codebase before implementing; fresh-context adversarial pass

# Superpowers receive review

Source: obra/superpowers `receiving-code-review` (MIT).

## When
Watchdog/Consultant/human feedback arrives — before changing code.

## Do
1. Read fully. Restate. Verify against disk/reality.
2. Push back with evidence if wrong for this codebase.
3. Implement one item at a time with a failing check first when behavior changes.

## Don't
Performative agreement. Blind paste of suggestions. Invent KPI to clear a FAIL.


---

## Merged from `superpowers-request-review` (2026-10-11)

- Original description: Use when completing a major task or before merge — ask Watchdog/Consultant critic with evidence; remaps obra/superpowers requesting-code-review without review-subagent fan-out.
- Unique content carried: request-with-evidence; verify feedback against codebase before implementing; fresh-context adversarial pass

# Superpowers request review

Source: obra/superpowers `requesting-code-review` (MIT). Remapped: **no** dispatching parallel review agents.

## When
After major feature, before merge, or when stuck needing a verifier.

## Do
1. Builder cannot grade own ship. Ping Watchdog or Consultant with evidence paths/URLs.
2. Distinct evidence artifact. Mention ≠ review.
3. Axes: correctness, HOLD list, tests, scope. Pair [Osmani code review axes](sand-workflow:osmani-code-review-axes).

## Don't
Self-PASS. Clone/subagent fan-out for review. Merge PR 149 as ship.
