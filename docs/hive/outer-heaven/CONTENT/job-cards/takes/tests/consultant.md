# Consultant workflow tests
Status: filled
Date: 2026-08-14
From take: takes/consultant.md
## Tests
### 1. Normand packet vs four-blank / outcome-offer
- Tape change: Four-blank is the eval harness (Bucket / KPI / Baseline / 60-day). Demand the dump before scope. Dental-clinic sentence required — never “I do AI.” Speak time and money only from owner numbers. Walk before magic-$. Path A writes constraint + four-blank + offer sentence; one does not replace the others.
- Command:
  ```bash
  python3 -c "
  from pathlib import Path
  t = Path('docs/hive/outer-heaven/CONTENT/icp-runbooks/packets/local-pro-normand/PACKET.md').read_text()
  print({k: (k in t) for k in ('| Bucket |','| KPI |','| Baseline |','| 60-day target |','I help ','UNVERIFIED','Do not send')})
  "
  # dry-read vs scripts/hive/grok-skills/outcome-offer-funnel.md
  # + ~/.grokbot/skills/constraint-position/SKILL.md
  # + ~/.grokbot/skills/pricing-margin-roi-guardrails/SKILL.md
  # + scripts/hive/grok-skills/website-offer-funnel.md Path A
  # Did not send WARM_DRAFT. Did not open a client channel.
  ```
- Result: fail
- Evidence: Packet has POSITION (stated vs felt, one-sentence constraint, adoption risk, Rung-1 gate question, 20-min reversible next). MUST all 1 · SHOULD PASS · margin PASS · pain $ UNVERIFIED · Send HOLD. Four blanks exist: Bucket=ACQUIRE; KPI=time-to-first-touch **and** booked-slot count (two numbers, not one); Baseline=TBD / owner UNVERIFIED (pricing-margin allows TBD once — send stay HOLD); 60-day=`N booked calls` (N unnumbered). **No** `I help [ICP] get [numbered outcome] via [proof]` in PACKET.md (`I help ` = false). local-pro runbook sentence is unnumbered and not copied onto the named client. `four-blank-sku` SKILL.md is missing from `scripts/hive/grok-skills/` and `~/.grokbot/skills/` — only named in website-offer / usecase-to-sku. Did not invent job $. Did not send.

### 2. catalog-demand-match (chatbot trap / I-do-AI kill)
- Tape change: They ask for a chatbot — find clog and leak. “I do AI” is a Consultant never. Auto-dial stays operate-never. Plumber after-hours maps to `private-book-install`, not a seduction/voice SKU.
- Command:
  ```bash
  python3 scripts/hive/catalog-demand-match.py --need "I do AI" --format text
  python3 scripts/hive/catalog-demand-match.py --need "I do AI" --format json
  python3 scripts/hive/catalog-demand-match.py --need "plumber after-hours missed call book callback Montreal" --format text
  python3 scripts/hive/catalog-demand-match.py --need "AI chatbot for a Montreal plumber" --format json
  python3 scripts/hive/catalog-demand-match.py --need "auto-dial plumber leads" --format text
  ```
- Result: fail
- Evidence: JSON `"I do AI"` → `REFUSE` / kill list / `matches: []` (no `next` key). Plumber need → `BUILD` + `private-book-install__local-pro__greater-montreal` (correct machine; handshake says propose HITL, do not connect Twilio). Chatbot-for-plumber still matches `private-book-install`, not a chatbot SKU — clog/leak steal holds. Auto-dial → `REFUSE`. `--format text` on REFUSE **crashes** (`KeyError: 'next'` at `catalog-demand-match.py:204`) — the exact never-list path Consultant must run. Catalog `required_skills` on that SKU omit `constraint-position` and `four-blank-sku` (only lead-web-find / prospect-must-score / private-book-install / warm-draft-hitl). No `--operator-yes`. No lane upgrade.

### 3. warm-draft-hitl dual gate (no send)
- Tape change: Boundary language is architecture — draft, do not send. `ask-principal` + dual HITL. Proposal send stays Evens. Walk the packet before a magic-$ client. Normand stay the hunt.
- Command:
  ```bash
  python3 scripts/hive/hunt-log-stats.py --format json
  # dry-read WARM_DRAFT.md + OPERATOR_FOCUS.json
  # Did not check APPROVE boxes. Did not email info@ or francoispineau@.
  ```
- Result: pass
- Evidence: `WARM_DRAFT.md` is DRAFT ONLY. Both boxes unchecked (`APPROVE DRAFT`, `APPROVE SEND`). Body has no localhost / `:3007` / hive talk / dollar claims. Channel named, not used. OPERATOR_FOCUS `session_goal`: “HITL approve WARM_DRAFT.md; do not send; do not rotate ICP.” `hunt-log-stats.py` exit 0: `total_rows: 0`, `last_row: null` — script ran; log has no dated rows and no `stage` column (icp-runbook / ICP_PIPELINE expect `stage`; schema is date…MUST…next…owner). Packet still says `qualified`; pipeline `ready` = draft in HITL queue. Stage drift is a log gap, not a send. Did not send.

## Never (operate)
- No send / pay / deploy / book / publish. WARM_DRAFT stays unsent.
- No Grok Bot. No farms / OTP / fake identity / mass-DM / betting / auto-dial.
- No “I do AI” scope. No invented job $ or hours×rate. No localhost in client copy.
- Do not merge `LESSONS-FROM-TAPE.md`. Takes stay SSOT. Do not rewrite the take. Do not rotate off Normand.

## Blocked on Evens
- APPROVE DRAFT on `WARM_DRAFT.md` (not send). Second gate only after the first.
- Owner numbers for Baseline + a single 60-day N. Who signs the homepage CTA (#4/#16 LIKELY).
- Write `four-blank-sku` SKILL.md only if you say yes — proposed/named, not on disk.
- `HUNT_LOG.md` append (Normand row + `stage`) — Consultant will not invent a hunt line.
- Forge: `catalog-demand-match.py --format text` REFUSE `KeyError: 'next'`.
