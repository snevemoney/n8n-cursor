---
name: Four blank before build
description: >-
  Use before any build burn — outcome, customer, channel, offer blanks plus one KPI baseline.
merged_from: [eval-harness-scope, four-blank-scope]
---

# Four blank before build

Sources: AI Partner playbook; Nate Northstar; youtube-ai-implement.

## When
Before greenfield build or paid SKU.

## Do
1. Fill four blanks (outcome, who, channel, offer).
2. One KPI + baseline ("5 to 15 in 60 days — win?").
3. If blanks empty, research or agent-job-card first.

## Don't
- Build on vibe alone
- New icp_id without blanks + operator yes


## Grok Bot harness (2026-09-01 — update, not a rebuild)

Org: Evens talks to Big Boss. Consultant audits/scope. Other desks only via mention or handoff. No 17 DMs.

After a meaningful run, append one JSON line (never overwrite, never log secrets):
`python3 /home/box/.grokbot/outer-heaven/append-action-log.py --agent "<desk>" --action "<slug>" --target "<what>" --result "<one line>"`
Log file: `/home/box/.grokbot/outer-heaven/ACTION_LOG.jsonl`

Failed or finished scheduled work doorbells the Big Boss / Day Planner / Consultant exec group only. Stay quiet if nothing failed. No logger desk. Mac out unless Evens asks local. HITL: money, client send, prod deploy, secrets.

---

## Merged from `eval-harness-scope` (2026-10-11)

- Original description: Use before an auto-loop, overnight eval, or "auto-research" ask — write Bucket / KPI / Baseline / 60-day that a machine can check without Evens. Do not fire for one-shot chats, leisure, or any loop with no cheap verify.
- Unique content carried: eval-harness: machine-checkable Bucket/KPI/Baseline/60-day for auto-loops

# Eval harness scope

Owner: Consultant + Watchdog. Pair [golden-test-loop](sand-workflow:golden-test-loop).

## When
- Someone wants a recurring / overnight / auto-research loop
- "Let the agent keep going until it's good"
- Karpathy-style program.md / multi-agent research ask

## Anti-triggers
- One-shot sitting with a human in the loop the whole time
- Leisure / GTA / sports recap
- Loop whose success is a vibe ("better", "amazing") with no checkable artifact

## Four blanks (any HOLD = no auto-loop)
1. **Bucket** — what class of work (research, code, lead score, motion). One bucket.
2. **KPI** — the number or binary the machine reads (test pass, click, loss analog, packet path exists).
3. **Baseline** — today's measured value, not a hope.
4. **60-day** — what "still working" looks like without Evens in the grind.

Write them. If any blank is HOLD, stop. Do not schedule.

## Karpathy cheap-verify 2026-09-01 (`yt:kwSVtQ7dziU`) FACT timedtext
No Priors. Remap Claude Code / Codex / OpenClaw auto-research → Grok + Cursor CloudAgent.

- Auto-research only when a **candidate is cheap to verify** (his analog: a commit you can check against validation loss). If checking needs Evens, it is not a loop.
- A research org is markdown files (`program.md` roles + how they connect), not standups. Hive = this card + skills + ACTION_LOG.jsonl. Do not productize program.md.
- Untrusted internet worker pool / "blockchain of commits" **BLOCKED**. Named desks + CloudAgent on owned repos only.
- Optimize **instructions** (skill.md), not the chat. Everything is a skill issue.
- Human job = the few bits agents cannot invent. Do not remove humans from the process.

## Tools
| Need | Path |
|---|---|
| Four blanks on disk | packet or topics/ — **PROVE** |
| Tests / Playwright / packet path | **PROVE** |
| ACTION_LOG.jsonl | **PROVE** (ClickUp remap) |
| Disk transcripts | **PROVE** (Composio YouTube remap) |
| Cursor CloudAgent | **PROVE** (Claude desktop / Codex-as-desk **WORKAROUND**) |
| OpenClaw swarm / untrusted public workers / lights-off | **BLOCKED** |

## Prompt
```
Bucket:
KPI (machine-readable):
Baseline (measured today):
60-day still-working:
Cheap verify without Evens? Y/N
If any HOLD: do not auto-loop.
Skill path whose instructions we will optimize:
```

## Enrich 2026-09-21 — JUDGE_RUBRIC / jev-as-judge (yt:VE5dsWll06M)
Online evals: score agent answers on correct / grounded / cited with a cheap gate instead of LLM-as-judge when rubric is closed. Vendor “more consistent” = UNVERIFIED. Local: `harness-route-risk-judge`.


## Owned-tools wiring (2026-10-11 gap audit)
- Jev/router regressions: `/workspace/tools/jev-evals/run.sh` (promptfoo, 25 cases, ~$0.001). Run after ANY change to `~/.local/bin/jev-route` or the Jev policy; must stay PASS 25/25. Promptfoo CLI also at `/workspace/tools/promptfoo-cli`.
- Append a line: `oh-uselog promptfoo eval`.


---

## Merged from `four-blank-scope` (2026-10-11)

- Original description: use this before any client build — fill Bucket, KPI, Baseline, 60-day target
- Unique content carried: eval-harness: machine-checkable Bucket/KPI/Baseline/60-day for auto-loops

# Four-blank scope

AI Partner scope before any client build (from AI Partner Playbook).

## Fill all four
1. **Bucket:** ACQUIRE | GROW | CUT
2. **KPI:** one measurable number
3. **Baseline today:** honest current value
4. **60-day target:** realistic target

## Rules
- Find the CONSTRAINT (where ops sighs), not the requested feature
- Workflow-only is OK if cheaper/safer than software
- No build until blanks are filled and operator/client agrees


## Grok Bot harness (2026-09-01 — update, not a rebuild)

Org: Evens talks to Big Boss. Consultant audits/scope. Other desks only via mention or handoff. No 17 DMs.

After a meaningful run, append one JSON line (never overwrite, never log secrets):
`python3 /home/box/.grokbot/outer-heaven/append-action-log.py --agent "<desk>" --action "<slug>" --target "<what>" --result "<one line>"`
Log file: `/home/box/.grokbot/outer-heaven/ACTION_LOG.jsonl`

Failed or finished scheduled work doorbells the Big Boss / Day Planner / Consultant exec group only. Stay quiet if nothing failed. No logger desk. Mac out unless Evens asks local. HITL: money, client send, prod deploy, secrets.
