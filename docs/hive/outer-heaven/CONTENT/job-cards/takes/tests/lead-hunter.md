# Lead Hunter workflow tests
Status: filled
Date: 2026-08-14
From take: takes/lead-hunter.md

## Tests

### 1. hunt-log-stats live parse (HUNT_LOG as wiki)

- Tape change: Nate wiki + LeadGrow — raw stays off the assistant; wiki = ICP pages + exclusion phrases + HUNT_LOG rows; observability is why a 4 vs a 9, not a vibe. `icp-runbook` appends with `stage` (`discovered` minimum). Do not rotate the live hunt.
- Command: `python3 scripts/hive/hunt-log-stats.py` (also `--format text`)
- Result: fail
- Evidence: Script exits 0 and emits JSON. Live log `docs/hive/outer-heaven/CONTENT/icp-runbooks/HUNT_LOG.md` has **0 rows** (`total_rows: 0`, `last_row: null`, `pipeline_active: 0`). Header is `date | icp_id | city | url | leak | contact | MUST | next | owner` — **no `stage` column**. File text has no `stage`. `ICP_PIPELINE.md`, `.cursor/skills/icp-runbook/SKILL.md`, and `scripts/hive/grok-skills/icp-runbook.md` all require `stage`. `OPERATOR_FOCUS.json` is tagged `local-pro` / Greater Montreal / Normand qualified / do not rotate. Packet `CONTENT/icp-runbooks/packets/local-pro-normand/PACKET.md` is MUST PASS · margin PASS · stage **qualified** — not in the log. Live hunt is invisible to the stats script the take treats as the index.

### 2. hunt-log-stats dry schema (stage column)

- Tape change: Same wiki/index rule. Stateless score/enrich; `stage` is the lint handle. Parser must count `qualified` when the column exists. Did **not** append the live `HUNT_LOG.md` (dry only).
- Command: `python3 scripts/hive/hunt-log-stats.py --path <tmp>/HUNT_LOG.dry.md --format json` then `--format text`. Fixture header: `date | icp_id | city | url | leak | contact | MUST | stage | next | owner`. One dry row: 2026-08-13 · `local-pro` · https://www.plomberienormand.ca/en · MUST PASS · `stage=qualified`. Fixture deleted after the run.
- Result: pass
- Evidence: Dry JSON: `total_rows: 1`, `by_stage.qualified: 1`, `by_icp_id.local-pro: 1`, `qualified_count: 1`, `pipeline_active: 1`, `ready_count: 0`. Text: `rows=1 ready=0` / `qualified: 1`. Immediate re-run on the live path still `rows=0 ready=0`. Live header unchanged (still no `stage`). No outreach. No Gmail.

### 3. Normand packet + Path A / list-anneal dry-read

- Tape change: Named leaky URL is Path A — dump once, MUST + constraint + four-blank, not a raw-50 MUST. Width without send. Dual HITL (approve draft ≠ approve send). `needs-review` / recon-then-book. Leak gate, not AI-excitement. Playbook before send. Do not rotate off Normand. `list-anneal-funnel` still forbids MUST-scoring the raw 50.
- Command: Dry-read only — `CONTENT/icp-runbooks/packets/local-pro-normand/PACKET.md`, `WARM_DRAFT.md`, `evidence/local-pro-normand-20260813.md`, `CONTENT/icp-runbooks/local-pro.md`, `scripts/hive/grok-skills/list-anneal-funnel.md`, `website-offer-funnel.md` Path B, `outbound-playbook-funnel.md`. No send. No HUNT_LOG append.
- Result: pass
- Evidence: Packet is Path A on a named URL (not a 50-list). MUST table filled; #4/#16 LIKELY; margin PASS; Send HOLD. Warm draft: both HITL boxes unchecked; subject is the after-hours leak; no localhost / `:3007` / hive talk / dollar claims / auto-dial. `list-anneal-funnel` anti-pattern still includes “MUST-scoring the raw 50” and “Instagram / OTP farms.” `website-offer-funnel` Path B **Do not** = “MUST-score 50 URLs.” `outbound-playbook-funnel` dual gate intact. `lead-web-find` is named in the take and the router but **has no skill file on disk**. Packet is not a live HUNT_LOG row (see test 1).

## Never (operate)

Auto-dial · OTP / Instagram farms · fake identity · mass-DM · betting / OFM · Gmail connect · client send · MUST-score the raw 50 · rotate the live hunt because a tape was interesting · append HUNT_LOG as a real Today row from this test file.

## Blocked on Evens

- Approve **draft** on `WARM_DRAFT.md` (first gate). Approve **send** only after that — do not check both.
- Whether to add `stage` to the live HUNT_LOG header and append the Normand `qualified` row (this desk did not).
- Whether Librarian/Forge persist a `lead-web-find` skill file (referenced, not on disk).
