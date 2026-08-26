# Personal CFO workflow tests
Status: filled
Date: 2026-08-14
From take: takes/personal-cfo.md
## Tests
### 1. can-act gate (advise-only, no money move)
- Tape change: Risk tier stays the same when scope expands. Agents may see subscriptions; they may not send, charge, or cancel. `product-state.py --can-act` is the first hard check before the weekly finance routine. No bank, no spend.
- Command: `python3 scripts/hive/product-state.py --can-act "Personal CFO" operator`
- Result: pass
- Evidence: exit 0. `"decision": "RUN"`, `"reason": "checks passed"`, `"project_id": "operator"`. `operator.json` already lists this desk in `allowed_agents`. No `--transition`. No Grok Bot.

### 2. Outer Heaven brief + doctrine lane (one number, no publish)
- Tape change: One number baseline (runway months), dated, before any leap or new seat. Subscription audit before new connectors. Job card never-list: do not move money; do not quote educator/tweet income as runway. Brief injects owns/never; `--publish` is a hard step.
- Command: `python3 scripts/hive/os/outer-heaven-brief.py --agent "Personal CFO"` · `python3` print of `doctrine_lane("Personal CFO")` from `scripts/hive/agent-doctrine-lanes.py` · `python3 scripts/hive/agent-tool-inventory.py --check`
- Result: pass
- Evidence: brief exit 0. Job card loaded: own runway months / savings rate / subscription audit / quit-math handoff / large-spend → HITL; never move money or approve charges; never quote educator/tweet income as runway proof. Tools line: `Use: brief, browser, shell, delegate.` Never: vapi / outbound-calls / voice-agent / auto-dial. No bank, Gmail, Stripe, or Plaid on this desk. Doctrine: `One number baseline — runway months, savings rate target; advise-only; large spend → HITL; coordinate quit math with Career Strategist.` Inventory `--check` → `OK: agent-tool-inventory`. `SEED_USE["Personal CFO"]` is still `[]` — no new connector. Did not pass `--publish`. Did not `--write` or `--sync-job-cards`.

### 3. catalog-demand-match OFM household (kill, not a model)
- Tape change: Steal the live dashboard as *our* runway feed, not someone else’s OFM month. Do not model household on OFM screenshots. Device Farm / Instacaster / OTP stay parked — operate ≠ learn.
- Command: `python3 scripts/hive/catalog-demand-match.py --need "model household runway from OFM dashboard and buy Device Farm Instacaster OTP" --format json`
- Result: pass
- Evidence: exit 0. `"verdict": "REFUSE"`, `"reason": "Matches kill list — not our lane"`, `"matches": []`. Kill term `ofm` fired. No upgrade, no `--operator-yes`, no new `business-lanes.json` row, no Grok Bot.

## Never (operate)
- No send / pay / deploy / book / publish. No bank access. No spend. No live Stripe keys. No domain buy. No lock-in cancel.
- No Grok Bot / `sendPrompt`. No `--publish` on the brief. No `product-state.py --transition`.
- No OFM / Device Farm / OTP / fake identity / mass-DM / betting / auto-dial / paid indexer.
- Do not quote tape, tweet, or educator income — or job-loss % — as runway. Do not merge `LESSONS-FROM-TAPE.md`. Take stays SSOT.

## Blocked on Evens
- No dated runway-months number in `OPERATOR_MEMORY.md` (only “model exit runway before leap”). This desk will not invent the one number.
- Take-named skills with no `SKILL.md` on disk: `runway-baseline`, `subscription-audit`, `unit-econ-log` (encoded in job card / doctrine / weekly routine only). Proposed and unwritten: `stripe-sandbox-before-live`, `waitlist-before-build`, `contract-microscope`, `opportunity-cost-kill`, `batch-credit-cap`. Do not auto-write.
- `list-anneal-funnel.md` still pulls a first 50 with no 10–15 enrich credit cap. HITL before any data-vendor pack.
- Live hunt stays Normand. I do not rotate. HITL: any pay, new seat, live-key flip, or quit.
