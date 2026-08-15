# Big Boss workflow tests
Status: filled
Date: 2026-08-14
From take: takes/big-boss.md
## Tests
### 1. can-act gate (named desk, not a swarm)
- Tape change: Manage don't chat. Seventeen named desks earn the badge; can-act is the first hard check before any routine. I do not spawn nameless workers. `product-state.py --can-act` is the gate the take keeps on this desk.
- Command: `python3 scripts/hive/product-state.py --can-act "Big Boss" operator`
- Result: pass
- Evidence: exit 0. `"decision": "RUN"`, `"reason": "checks passed"`, `"project_id": "operator"`. `operator.json` already lists this desk as `owner_agent` with 13 named `allowed_agents` — no farm, no transition written.

### 2. Outer Heaven brief + hunt-stats (dry, no publish)
- Tape change: Fleet brief is exceptions + one number, not a chat. Point desks at the wiki path; do not paste the estate. `session-bootstrap` / `agent-as-hire` stay talk → one SOP → review → tools. `--publish` is a hard step; this run stayed read-only.
- Command: `python3 scripts/hive/os/outer-heaven-brief.py --agent "Big Boss" --hunt-stats`
- Result: pass
- Evidence: exit 0. Job card loaded (morning brief, triangle before a new lane row, 17 named agents, never spawn hundreds). Tools line still bans auto-dial / outbound-call n8n. `OPERATOR_FOCUS: icp_id=local-pro city=Greater Montreal`. Catalog `total=504 operating=3`. Hunt block: `rows=0 ready=0` — same as `python3 scripts/hive/hunt-log-stats.py` (`total_rows: 0`, `last_row: null`). Script ran; the log is empty. Did not pass `--publish`.

### 3. catalog-demand-match dry (kill-list, no new lane)
- Tape change: `session-bootstrap` demand-matches first. Client Pack / auto-dial / receptionist farm stay parked — steal the shape, do not operate the payload, do not add a `business-lanes.json` row from a tape.
- Command: `python3 scripts/hive/catalog-demand-match.py --need "add a Client Pack SaaS lane and auto-dial a receptionist farm" --format json`
- Result: pass
- Evidence: exit 0. `"verdict": "REFUSE"`, `"reason": "Matches kill list — not our lane"`, `"matches": []`. No upgrade, no `--operator-yes`, no Grok Bot.

## Never (operate)
- No send / pay / deploy / book / publish.
- No Grok Bot / `sendPrompt`.
- No `--publish` on the brief. No `product-state.py --transition`. No `catalog-lane-upgrade.py`.
- No new desk, no nameless farm, no LESSONS merge. Takes stay SSOT.

## Blocked on Evens
- `HUNT_LOG.md` has zero dated rows — pipeline-stage-brief can count, not coach. Lead Hunter / Consultant append; I do not invent a hunt.
- OPERATOR_FOCUS still `local-pro` / Normand warm draft — HITL approve or skip. I do not send.
- Empty chronicle user lines in the brief are a Librarian/capture issue, not a new lane.
