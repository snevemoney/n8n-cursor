# HITL Operator workflow tests
Status: filled
Date: 2026-08-14
From take: takes/hitl-operator.md
## Tests
### 1. Gate format (ACTION / WHY / AGENT / RISK / REVERSIBILITY)
- Tape change: Proposed `tier-3-card` — every money / send / deploy / secret / delete item is ACTION / WHY / AGENT / RISK / REVERSIBILITY before Evens sees it. Job card owns that string. I test the wiring, I do not rewrite the take.
- Command:
  ```bash
  python3 scripts/hive/product-state.py --can-act "HITL Operator" operator
  python3 scripts/hive/os/outer-heaven-brief.py --agent "HITL Operator" --project operator --format json
  python3 scripts/hive/build-grok-agent-routines.py --validate
  ```
- Result: fail
- Evidence: can-act `"decision": "RUN"` / `"reason": "checks passed"` — digest may list, not approve. Brief (no `--publish`) injects job-card SSOT: `Format: ACTION / WHY / AGENT / RISK / REVERSIBILITY` plus `ask-principal`. Routines registry valid. Same string is not wired through the scripts the take touches:
  - `agent-doctrine-lanes.py` HITL line: `ACTION/WHY/RISK/REVERSIBILITY` (AGENT dropped)
  - `grokbot-tool-cookbook.py`: `ACTION/WHY/AGENT/RISK/REVERSIBILITY` (matches job card, no spaces)
  - `build-grok-agent-routines.py`: `ACTION/WHY/AGENT/TARGET/RISK/REVERSIBILITY` (TARGET added)
  - `os_agents_config.py` + `agent-roster-registry.json`: `APPROVE/EDIT/REJECT` (other schema)
  - `invoice-email-automation.md`: `ACTION/WHY/RISK` (AGENT + REVERSIBILITY dropped)
  - `grok-handoff-chains.json` HITL hops (`tier3Stop: true`) say “Propose Tier 3 items only” — no card fields
  ACTION: report drift. RISK: Evens gets three card shapes plus a /pro approve UI. REVERSIBILITY: read-only; no queue write.

### 2. Skill wiring (ask-principal + proposed gates)
- Tape change: Roll-up keeps `ask-principal` (act → ask Evens → resume). Proposed `input-required-gate`, `callback-before-book`, `sandbox-then-live`, `one-job-one-test` stay files-or-nothing — prose in a prompt is not a gate.
- Command:
  ```bash
  python3 scripts/hive/agent-tool-inventory.py --agent "HITL Operator"
  python3 scripts/hive/agent-tool-inventory.py --check
  ls scripts/hive/grok-skills/ask-principal.md scripts/hive/grok-skills/agent-as-hire.md
  ls scripts/hive/grok-skills/{tier-3-card,send-removed,input-required-gate,sandbox-then-live,callback-before-book,one-job-one-test}.md
  ```
- Result: fail
- Evidence: `--check` → `OK: agent-tool-inventory`. `ask-principal.md` and `agent-as-hire.md` exist. Cookbook HITL block points at `ask-principal.md`. Brief job card names the pattern. Inventory has `skill.ask-principal` as a tool. HITL `use` does not include it: `brief, browser, shell, delegate, twilio_number, n8n.on-demand-calling, n8n.elevenlabs-post-call, hitl_propose_action`. HITL `use` does include on-demand-calling / elevenlabs-post-call / twilio_number (tier3 propose in inventory notes — still a dialer-shaped tool, not a callback-before-book skill). All six proposed skill files are missing. `ask-principal.md` itself has no ACTION / RISK / REVERSIBILITY fields. ACTION: list wiring holes. RISK: a different box cannot resume a held ask from a card. REVERSIBILITY: `ls` + inventory read; no skill files written.

### 3. Send-removed / first Gmail = read+draft
- Tape change: Proposed `send-removed` — if the workflow has Send, strip it; do not rely on “never send” in the prompt. First Gmail = read+draft. Promote slowly. Swadia / Alli / Nate sheet: fifty drafts are not fifty sends.
- Command:
  ```bash
  python3 scripts/hive/agent-tool-inventory.py --agent "Communications Manager"
  python3 scripts/hive/agent-tool-inventory.py --agent "HITL Operator"
  ```
- Result: fail
- Evidence: Gmail `hitl=draft`, note “Send is Tier 3.” Owners are Comms / Day Planner / Big Boss / Career Strategist — HITL `use` has no `gmail` (first Gmail is Comms). Inventory rule 1: “Grok plugins are workspace-shared — assignment is policy, not OAuth isolation.” Comms cookbook still says “restricted send matrix.” Shared `EXECUTION` in `build-grok-agent-routines.py` tells every desk including HITL: “Use your lane tools NOW: Grok plugins (Gmail/Calendar/GitHub).” `send-removed.md` does not exist. Did not open Gmail send, did not call `ce_list_actions`, did not POST a webhook, did not `--publish`, did not put a row in a live send queue. ACTION: keep send out of this desk. RISK: a shared plugin will send. REVERSIBILITY: inventory print only.

## Never (operate)
- No send / pay / deploy / book / publish. No Grok Bot. No approve. No live send queue.
- No `ce_list_actions`, no n8n trigger, no Twilio/on-demand call, no `--publish`, no `--write` / `--sync-job-cards`, no `product-state.py --transition`.
- Do not merge `LESSONS-FROM-TAPE.md`. Takes stay SSOT. Do not write the six proposed skill files from this test.

## Blocked on Evens
- Pick one gate string: job-card `ACTION / WHY / AGENT / RISK / REVERSIBILITY` vs doctrine (no AGENT) vs routine (+TARGET) vs roster `APPROVE/EDIT/REJECT`. I will not pick.
- Write or refuse the proposed skills (`tier-3-card`, `send-removed`, `input-required-gate`, `sandbox-then-live`, `callback-before-book`, `one-job-one-test`). I will not add them.
- Strip Gmail Send in the plugin (architecture) vs keep “never send” prose. Shared OAuth means policy is not a gate.
- HITL `use` still lists `n8n.on-demand-calling` / `twilio_number` — Evens says whether that stays propose-only or comes off the desk. I do not dial.
- Nothing in the queue was approved.
