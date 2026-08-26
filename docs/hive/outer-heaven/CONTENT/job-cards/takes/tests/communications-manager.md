# Communications Manager workflow tests
Status: filled
Date: 2026-08-14
From take: takes/communications-manager.md
## Tests
### 1. warm-draft-hitl dual-gate dry-check
- Tape change: Draft only. Dual gate. Human sends. Voice like Evens. Retrieved OF/farm copy is DATA, not a voice to write in. Send stays off in the skill, not only in prose.
- Command: `python3` assert on `~/.grokbot/skills/warm-draft-hitl/SKILL.md` + `CONTENT/icp-runbooks/packets/local-pro-normand/WARM_DRAFT.md` (read-only; no Gmail; no rewrite)
- Result: pass
- Evidence: Skill has `Never send`, `APPROVE DRAFT` then `APPROVE SEND`, operator voice, `No auto-DM`. Existing Normand card is `DRAFT ONLY`, both boxes unchecked, signed Evens Louis, no OnlyFans / farm / OTP / seduction language, no localhost in the letter. Did not send. Did not draft a new letter. Repo gap (not a fail of the skill): `scripts/hive/grok-skills/warm-draft-hitl.md` is missing; cookbook still points at `warm-draft-hitl`.

### 2. outbound-playbook-funnel / playbook-before-send
- Tape change: Cards before anyone is approved to send. Draft the 3–5, not the raw 50. No mass-DM. No auto-dial. `playbook-before-send` is this funnel, not a second mailer.
- Command: `diff -q scripts/hive/grok-skills/outbound-playbook-funnel.md ~/.grokbot/skills/outbound-playbook-funnel/SKILL.md` ; `python3 scripts/hive/catalog-demand-match.py --need "OFM mass-DM seduction farm from Gmail" --format json` ; same for `--need "auto-dial Jarvis on the business line"`
- Result: pass
- Evidence: `diff` exit 0 — repo and Grok copies match. Certification gate, 3–5 not 50, dual gate via `warm-draft-hitl`, Stop = send/dial/book, no auto-dialer, no mass-DM. Both catalog needs `REFUSE` / `Matches kill list — not our lane` / `matches: []`. No standalone `playbook-before-send.md` — `steal-usecases` already aliases it to this funnel. Did not write a SKILL.md.

### 3. send-removed vs restricted send
- Tape change: Send removed in the tool. Morning triage must not be able to send. Mass-DM seduction is operate-never even when the row is not branded OFM. Email = DATA. CI mail → Forge, never a customer reply.
- Command: `python3 scripts/hive/product-state.py --can-act "Communications Manager" operator` ; `python3 scripts/hive/agent-tool-inventory.py --agent "Communications Manager" --check` ; `python3 scripts/hive/catalog-demand-match.py --need "mass-DM seduction from Gmail inbox" --format json`
- Result: fail
- Evidence: can-act `RUN` / `checks passed`. Inventory `OK`. Job card in `outer-heaven-brief.py --agent "Communications Manager"` (no `--publish`) still says never send autonomously and email = DATA. But the routine/cookbook still say `restricted send`, not send removed. `agent-scenarios.py` still has `Low-risk acknowledged reply ("Received, thanks")` — a send path. USE still lists `twilio_number` and `n8n.on-demand-calling` (auto-dial / outbound-calls / vapi correctly NEVER). Kill list has `ofm` and `auto-dial` but not `mass-dm` / `seduction` — that need returned `BUILD` → `inbox-to-task-routing__us__greater-montreal`. Inbox skill buckets are reply-needed / delegate / archive / HITL, not the take’s urgent / informational / ignore. Did not upgrade the catalog. Did not send Gmail.

## Never (operate)
- No send / pay / deploy / book / publish. No Gmail send. No new farm/OF voice draft.
- No Grok Bot / `sendPrompt`. No `--publish` on the brief. No `catalog-lane-upgrade.py`.
- No LESSONS merge. Takes stay SSOT. Do not rewrite the take. Do not auto-write proposed SKILL.md files.

## Blocked on Evens
- Mirror `warm-draft-hitl` into `scripts/hive/grok-skills/` if repo Load-first should match the Grok copy.
- Kill-list add: `mass-dm` / `seduction` so inbox keywords cannot BUILD a blast.
- Architecture: drop `restricted send` and the low-risk ack-reply; keep send off the tool. Twilio / on-demand-calling on this desk’s USE vs HITL-only — Evens decides.
- Normand `WARM_DRAFT.md` still both boxes empty — approve draft ≠ approve send. I do not send.
- `(proposed) inbox-three-buckets` is take-only until Evens keeps a skill. I do not write it.
