# Day Planner workflow tests
Status: filled
Date: 2026-08-14
From take: takes/day-planner.md
## Tests
### 1. morning-day-plan skill vs take
- Tape change: Swadia coordination is the job card — plugins not paste; unread Gmail in three buckets; calendar vs urgents vs open agent jobs; digest sliders meetings / Top 3 / CUT / evening; draft only; escalate, do not move the meeting; visible → efficient → automatic. Skill file was supposed to already own that machine.
- Command: `python3` keyword pass on `scripts/hive/grok-skills/morning-day-plan.md` vs take + `grok-agent-routines.json` Day Planner prompt + cookbook block
- Result: fail
- Evidence: Skill has Calendar/Gmail plugins, conflicts/gaps, Meetings, Top 3, protect-evening, do-not-send/accept. Missing vs take: `CUT`, `move`, three Gmail buckets, `draft`, `hot.md`, open-agent-job collision, visible → efficient → automatic. Routine doctrine line has CUT + draft-only; execution steps omit Top 3, protect-evening, and conflict flags. Cookbook cites the ladder on the skill path (`visible → efficient → automatic → then delegate`) but the skill body does not. Proposed take skills still have no files: `conflict-flag-digest`, `one-job-one-session`, `recon-then-confirm`, `same-day-plan-score`, `waitlist-before-keys`, `end-of-day-dictation-bank`, `poll-dont-block`. Take not rewritten.

### 2. Day Planner script dry-run (no Gmail send)
- Tape change: Gather → ask Evens → then act. Register `ops.day_plan` is optional audit. Consume digests; do not fire webhooks. Send removed in architecture, not prose.
- Command: `python3 scripts/hive/product-state.py --can-act "Day Planner" operator` · `python3 scripts/hive/os/outer-heaven-brief.py --agent "Day Planner" --format json --source cache` (no `--publish`) · `python3 scripts/hive/grok-hive-tool.py --grok-agent "Day Planner" --list-tools` · `--tool scorpion_register_outcome --params '{"jobType":"ops.day_plan","status":"done","summary":"dry-run only — no register"}' --dry-run` · `--tool n8n_trigger_catalog_webhook --params '{"name":"hive-operator-digest"}' --dry-run`
- Result: fail
- Evidence: can-act exit 0, `"decision": "RUN"`. Brief exit 0, job card loads CUT + never-send/accept; `OPERATOR_FOCUS: icp_id=local-pro city=Greater Montreal`. Register dry-run `"ok": true`, `"dryRun": true`, no SSH. Allowlist still includes `n8n_trigger_catalog_webhook` and `hive_send_report` (`comms_qa` + `INFRA_OPS_EXTRA`). Webhook dry-run also `"ok": true` — the desk can fire the operator digest. One-pager + take say consume only. No live register, no webhook POST, no Gmail, no Grok Bot.

### 3. one-pager nodes vs repo JSON
- Tape change: Digest shape I consume is meetings / Top 3 / CUT / evening from plugins. n8n digest is hive state, not my weekday plan. I parse JSON only; I do not own webhook firing. One-pager FACT must match nodes.
- Command: read `docs/hive/outer-heaven/CONTENT/n8n-learning/one-pagers/day-planner.md` against `workflows/hive/daily-operational-digest.json`; `ls workflows/hive/` for `hive-operator-digest.json`
- Result: fail
- Evidence: Daily digest JSON exists (`id` `VOqRWrgrP2Wmoriq`). Cron is `0 8 * * *` on node `Daily 8AM Schedule`, not one-pager `0 12 * * *`. `Build Digest` returns `digest`, `missionsCount`, `goldenPathsCount`, `generatedAt`, `fetchErrors` — missions + golden-paths markdown only. One-pager FACT (System Uptime & Health / stability%, Testing & Self-Healing, Financial Velocity, cid `digest-${date}`) is not in the jsCode. Nodes include `Send Digest Telegram` after `Telegram Preflight` — consume-only; not fired. `workflows/hive/hive-operator-digest.json` is missing (catalog + one-pager still cite it; `Build Operator Digest` fields unverified). Did not POST `/webhook/hive-operator-digest`.

## Never (operate)
- No send / pay / deploy / book / publish. No Gmail send. No accept or move invites. No restaurant/hotline book.
- No Grok Bot. No live `scorpion_register_outcome`. No `n8n_trigger_catalog_webhook`. No Telegram digest fire.
- No LESSONS-FROM-TAPE merge. Take stays SSOT. No skill rewrite this run.
- No OTP / farms / mass-DM / bets / auto-dial.

## Blocked on Evens
- Strip `n8n_trigger_catalog_webhook` + `hive_send_report` from Day Planner (`comms_qa`) so send/fire is not on the desk.
- HITL: update `morning-day-plan.md` (and routine steps) to the take contract — CUT slider, three Gmail buckets, no-move, conflict vs open agent jobs — or leave the gap.
- Forge/Watchdog: missing `hive-operator-digest.json`; one-pager cron/fields are stale FACT.
- Live Calendar + Gmail plugins are Grok-side; this Cursor pass did not read the inbox. Full weekday run waits until Evens has trusted a few mornings.
