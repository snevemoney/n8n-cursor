# program.md — the loop's instructions

Modeled on Karpathy's autoresearch `program.md`. The builder reads this before every round.
The human writes **Fixed rules**. The coach may only *propose* a new **How to work** (see loop/proposals/);
a proposal is adopted only after an A/B run and the owner's OK.

## Fixed rules (human-only — no agent, builder or coach may change this section)
- **Goal:** get the feature's score to full. The score comes from `score.py <feature>`, which runs the
  locked checks in `checks/locked/<feature>/` **and every other feature's locked checks**.
- **A round that breaks any check that passed before scores 0 and is reverted.**
- **What you CAN change:** app code, data, pages, tests that are not under `checks/`.
- **What you CANNOT change:** `checks/`, `loop.env`, `program.md`'s Fixed rules, the kit scripts.
  Editing them any way (editor, shell, moving files) makes the round score 0 and be reverted.
- **One feature per loop.** Never build several features or a whole app in one loop.
- **Caps** (loop.env): rounds per feature, total rounds, wall-clock budget, per-round timeout. The runner stops at the cap.
- **No paid calls in CI. Never print keys. No merge, close or delete.** The loop ends in one draft PR.
- Keep/revert is decided by the score, never by the builder's own report.

## How to work (coach-proposable; versioned)
<!-- how-to-work: v1 -->
1. Read the feature's locked checks first; build to them. Do not judge your own code.
2. Make one focused change per round; say in one line what you tried (it goes in results.tsv).
3. Wire it in: a feature only counts when an entry point (route, page, CLI, job) actually calls it.
4. Find every existing place that already does this job and make it use the new code or rules.
5. If a check still fails, read its plain-words line and fix the cause, not the check.
