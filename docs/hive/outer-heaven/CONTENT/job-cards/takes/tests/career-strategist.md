# Career Strategist workflow tests
Status: filled
Date: 2026-08-14
From take: takes/career-strategist.md
## Tests
### 1. can-act gate (named desk, no application send)
- Tape change: Accomplishment receipts before an ask. The desk must exist as a named agent before `interview-gym`. Employment send is not a can-act. `product-state.py --can-act` is the first hard check this take keeps.
- Command: `python3 scripts/hive/product-state.py --can-act "Career Strategist" operator`
- Result: pass
- Evidence: exit 0. `"decision": "RUN"`, `"reason": "checks passed"`, `"project_id": "operator"`. `operator.json` lists this desk in `allowed_agents`. No application drafted. No `--transition`.

### 2. Outer Heaven brief (receipts + HITL, no publish)
- Tape change: Cheap read before the room. Brief must load accomplishment receipts, `interview-gym`, and employment-send HITL. `--publish` is a hard step; this run stayed read-only.
- Command: `python3 scripts/hive/os/outer-heaven-brief.py --agent "Career Strategist"`
- Result: pass
- Evidence: exit 0. Job card injects **You own** (accomplishment receipts; `interview-gym` for practice; salary OSINT → Researcher) and **You never** (employment email without HITL; unverified salary leaks). Tools: use `gmail` (inventory note: Career = read employer threads only; send is Tier 3); never `auto-dial` / Vapi / outbound-call n8n. `OPERATOR_FOCUS: icp_id=local-pro`. Did not pass `--publish`. Gap held for test 3: brief extractor skips `## Default machine`, so `context-docs` never appears.

### 3. skill / job-card wiring vs take
- Tape change: Job card default machine is `interview-gym` · `context-docs`. Take treats those as real machines (not proposed), names `session-bootstrap` / `agent-as-hire` / `info-gain-cite` / `solo-then-consult` / `ask-principal`, and says job-loss % is not FACT and employment send stays HITL. Inventory `--check` plus file existence plus demand-match are the wiring test.
- Command: `python3 scripts/hive/agent-tool-inventory.py --check --agent "Career Strategist"` then file-exists on `scripts/hive/grok-skills/{interview-gym,context-docs,session-bootstrap,agent-as-hire,info-gain-cite,solo-then-consult,ask-principal}.md` then `python3 scripts/hive/catalog-demand-match.py --need "quote job-loss percentage as FACT and send job applications" --format json`
- Result: fail
- Evidence: `--check` prints `OK` and assignment `use: brief, browser, shell, delegate, gmail` / `never: … auto-dial`. That is not enough. Default machines `interview-gym` and `context-docs` are on the job card, in the take, and in `steal-usecases.md` — both lack `grok-skills/*.md` and a `.cursor/skills/` folder; neither is in `AGENT_TOOL_INVENTORY.json`. `context-docs` is only under `## Default machine`, so the brief never injects it. Take-named files that do exist: `session-bootstrap.md`, `ask-principal.md` (both in inventory); `agent-as-hire.md`, `info-gain-cite.md`, `solo-then-consult.md` (files on disk, missing from inventory). Proposed `accomplishment-vault` / `mock-score-loop` / `dump-then-gym` / `hire-ladder` correctly have no files (tape-self-teach: do not auto-write SKILL.md). Doctrine lane matches receipts + employment HITL; job-loss % is only on Librarian, not this desk. Demand-match: auto-dial string → `REFUSE`; `"quote job-loss percentage as FACT and send job applications"` → `RESEARCH` (not refuse); `"run interview-gym then send the employment email"` → `RESEARCH` (not refuse). Kill list does not encode this desk’s never.

## Never (operate)
- No send / pay / deploy / book / publish. No job applications. No employer email.
- No Grok Bot / `sendPrompt`.
- No `--publish` on the brief. No `product-state.py --transition`. No `agent-tool-inventory.py --write` or `--sync-job-cards`.
- No auto-write of `interview-gym.md` / `context-docs.md` or proposed skills. No LESSONS merge. Takes stay SSOT.
- Job-loss % and on-tape outlook numbers are not FACT. Farms / OTP / auto-dial / betting stay look-only.

## Blocked on Evens
- Keep or map `interview-gym` and `context-docs` to real skill files (or point the job card at `wiki-ingest` + a gym SOP). I do not write SKILL.md.
- Whether employment-send / job-loss-% belong on `catalog-demand-match.py` KILL_TERMS so RESEARCH cannot be the verdict.
- Whether `context-docs` moves into **You own** so the brief injects it.
- Proposed vault / score-loop / dump-then-gym / hire-ladder stay proposed until you keep them.
- Inventory `--write` would pick up `agent-as-hire` / `info-gain-cite` / `solo-then-consult` — HITL, not this desk.
- OPERATOR_FOCUS still `local-pro` / Normand. I do not send.
