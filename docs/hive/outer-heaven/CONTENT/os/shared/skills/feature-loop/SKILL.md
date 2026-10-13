---
name: Feature loop
description: >-
  Use when building ONE feature with a keep-if-better agent loop (Karpathy autoresearch style):
  checks written first and approved by the owner, locked three ways, a fresh builder per round,
  a scorer that re-runs every feature's locked checks (regression = 0), keep/revert, results.tsv,
  caps in code, and a coach that only PROPOSES 'How to work' rewrites behind an A/B + owner OK.
---
# Feature loop (shared loop kit)

Source: AI LABS "loop engineering" video (yt:qLfSDQ5NGh0) + Karpathy autoresearch `program.md`.
Packet: `/workspace/research/packets/loops-video-qLfSDQ5NGh0/` (EXTRACT, GAP, CLAIMS). Kit dir: this folder.
Proof: `tests/e2e_toy.sh` (offline, ~5 s) — run it after any edit to the kit.

## When to loop (all four, else one good prompt)
Repeated task · budget allows failed rounds · checkable without a human (clear score) · the agent can run what it built.
One feature per loop. Never a whole app.

## Files in the target repo (made by `scripts/init.sh <repo> <feature>...`)
| File | Owner | Notes |
|---|---|---|
| `program.md` `## Fixed rules` | human only | goal, can/cannot, caps, no merge/paid/keys. Hook-blocked; hash in LOCK.json |
| `program.md` `## How to work` | coach proposes, owner adopts | versioned `<!-- how-to-work: vN -->` |
| `checks/drafts/<f>/NN-*.sh` | check author | each script: `# plain: <owner sentence>`; exit 0 = pass; no network |
| `checks/locked/<f>/` + `checks/LOCK.json` + `checks/approvals/<f>.md` | locked | never rewritten |
| `loop.env` | human | MAX_ROUNDS_PER_FEATURE, MAX_TOTAL_ROUNDS, MAX_BUDGET_SECONDS, ROUND_TIMEOUT_SECONDS, MAX_COST_UNITS, LOOP_BRANCH_PREFIX, OWNERS |
| `results.tsv` | runner | round ts feature commit score best_before status failing tried secs label (git-ignored) |
| `loop/` | runner/coach | passing.json baseline, proposals/ (git-ignored) |

## Steps
1. **Branch.** `git checkout -b loop/<feature>-<date>` (runner refuses other branches). Throwaway; ends in ONE draft PR. No merge/close/delete.
2. **Write checks first** in `checks/drafts/<f>/`. Always include the two standing checks from the templates:
   `90-wired.sh` (is it actually wired into the app: an entry point calls it) and `91-every-place.sh`
   (find every existing place that does this job; no old copy left). No feature code yet.
3. **The one stop — owner approves, every time.** `scripts/lock_checks.py show <f>` prints one plain line per check and
   "Happy with these? Say yes, or tell me what to change." Wait. Change drafts and re-show until yes.
4. **Lock (3 layers).** `scripts/lock_checks.py lock <f> --approved-by <name> --approval "<their words>"` → moves to
   `checks/locked/`, chmod a-w, writes LOCK.json, git-commits. Hook (`hooks/loop_guard.py`) blocks Edit/Write there.
5. **Run the inner loop.** `scripts/round.py <f> --builder "<fresh agent cmd>"`. Each round: fresh process
   (gets LOOP_FEATURE, LOOP_ROUND, LOOP_PROGRAM, LOOP_TRIED_FILE, LOOP_COST_FILE) → guard (checks/, loop.env,
   Fixed rules touched ⇒ TAMPERED 0) → commit → `score.py` (all features; previously-passing check fails ⇒ REGRESSION 0)
   → keep if score > best else `git reset --hard` → row in results.tsv. Stops at full score or any cap.
   Optional `--label-cmd` = Jev failure-type labeler (labels only; never keeps/reverts/approves).
6. **Report.** `scripts/stats.sh` + re-run `score.py <f>` yourself; the builder's report is evidence, not the grade.
7. **Watchdog on the PR.** `scripts/watchdog.sh <repo> origin/main` re-runs every locked check, verifies LOCK.json and that
   no locked file was modified in the PR. Offline, no keys, no paid calls (safe for CI).
8. **Coach (outer loop), between features/groups.** `scripts/coach.py` reads results.tsv, finds patterns repeating in
   ≥2 features (failing check kind, label, tried text) with round ids, writes `loop/proposals/how-to-work-vN.md`
   + `ab-vN.sh`. It cannot touch checks or Fixed rules (asserts hashes before/after).
9. **A/B, then owner OK.** `loop/proposals/ab-vN.sh <next-feature> "<builder>"` runs both arms in throwaway worktrees →
   `.ab.json` verdict. Only on `B_BETTER` **and** Evens's/owner's OK: `scripts/adopt.py --proposal P --approved-by Evens`
   (replaces How to work only; refuses non-owners).

## Jev (labels only)
Jev may label a failed round's failure type (`not-wired`, `old-path-left`, `regression`, `tamper`, `rule-fail`, `other`)
in ADVISORY mode via `--label-cmd`. It never approves checks, keeps/reverts, adopts, merges. Receipt line:
`jev: pack=engineering.prebuild mode=ADVISORY tier=small band=<band> lane=jev action=label hard_step=none live=<yes|no> authoritative=no`
Default labeler is deterministic (no call).

## Hooks per platform
`hooks/` has the guard + configs: Claude Code `PreToolUse` (Edit|Write|MultiEdit|NotebookEdit|Bash), Cursor
`hooks.json` `preToolUse` (Write|Shell, `--format cursor`), Codex `hooks.json` `PreToolUse` (apply_patch|Edit|Write|Bash;
needs `[features] codex_hooks = true` and a one-time trust in `/hooks`). `hooks/install.sh` backs up configs first.
The runner's tamper check is the backstop for anything a hook misses (shell tricks, other tools).

## Don'ts
No `--dangerously-skip-permissions` on a user machine. No loops against live services (e.g. Jarvis :4018). No paid calls in CI.
Never print keys. Don't skip check approval ("start building directly" is not allowed here).


## Wired 2026-10-13: safety tools + missed methods (Evens yes, Oct 13 1:14 AM ET)
Tools live in `/workspace/builds` (installed in `~/.local/bin` by `install.sh`, which runs every test first). Packet: `/workspace/research/packets/missed-methods-20261013/`.
1. **Run the loop capped, never open-ended:** `done-when-loop --routine <feature> --step '<builder cmd>' --done-when '<check cmd>' --max-iter 5 --budget-sec 1800 --log loop/receipts.jsonl --escalate escalate-hitl`. Exit 3 = capped, 4 = stalled; both write a HITL card to `/workspace/hitl/escalations/`. Do not re-launch past a cap. A human decides.
2. **Replay past failures before accepting an arm:** `replay-gate --library loop/failures.jsonl --cmd '<candidate cmd>'`. Exit 1 = regression, so reject the arm. Add every new real failure: `replay-gate --library loop/failures.jsonl --add ID 'input' 'expect'`.
3. **Two fresh reviewers before merge:** `two-review --builder <desk> --spec-reviewer <desk2> --standards-reviewer <desk3> --diff <patch> --spec loop/program.md --spec-cmd '<done_when>' --standards-cmd '<lint/tests>' [--jev]`. Both must PASS.
4. **Weekly:** `retry-rate loop/receipts.jsonl`. FLAG (first-pass < 70%) means fix the builder prompt or spec, not the retry count.
