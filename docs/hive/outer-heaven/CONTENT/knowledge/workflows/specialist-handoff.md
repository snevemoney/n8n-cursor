# Workflow — specialist-handoff
Status: compiled · tape-faithful 2026-08-14
Protocol: workflow-compiler
**Provenance:** WORKFLOW → PATTERN → ATOMS → TRANSCRIPT
**Title:** Two named desks, written handoff, draft ≠ send
**Tape:** `lRUpu2-KtGQ` · Brock Mesarich · caption-only · 5332 words
**Owners:** communications-manager, hitl-operator, day-planner
**Hive skill:** `specialist-handoff`
**On-stack tape** (Grok Bot).

## Classify
- **Who:** Two existing hive slugs. No new desk. No new ClickUp.
- **Outcome:** Handoff sentence + draft. Evens sends.
- **Operate-never:** Gmail send · Claude Cowork · auto-charge · Firecrawl/Zapier/Granola subscribe from this tape

## Decompose (spoken order)
1. Name two specialists (not one omni-agent)
2. One dump + one reference artifact
3. Classify WAKE: schedule vs event (`hosted-neq-scheduled`)
4. Write the handoff sentence in the thread
5. File draft. Outbound = Gmail SMTP from env (not Gmail MCP). He said “I send it myself” on the invoice path
6. Photo → ad stays `product-ad-from-photo` (Higgsfield on Creative)
7. Meeting notes → Day Planner tasks (no Granola SKU)

## Coverage map
| id | task | coverage | pointer |
|----|------|----------|---------|
| T1 | Two slugs | have | @ 01:10 inbox ↔ chief of staff |
| T2 | Dump + reference | have | invoice PDF @ 15:24 |
| T3 | WAKE classify | have | Slack trigger @ 14:52 vs daily |
| T4 | Handoff sentence | have | agents DM each other |
| T5 | Draft ≠ send | have | @ 16:47 |
| T6 | Send | HITL | Evens |

## Steps
### 1. Name two specialists
- **Do:** Existing slugs only (e.g. Comms ↔ HITL, inbox ↔ invoice).
- **Transcript:** `packets/lRUpu2-KtGQ/full.txt` @ 01:10
- **support_ids:** K-lRUpu2-KtGQ-01

### 2. Dump + reference
- **Do:** One dump + one artifact (PDF, photo, click-live card).
- **Transcript:** `packets/lRUpu2-KtGQ/full.txt` @ 15:24

### 3. Classify WAKE
- **Do:** Daily schedule vs event (mail/Slack). Default no new host.
- **Transcript:** `packets/lRUpu2-KtGQ/full.txt` @ 14:52
- **Hive:** `hosted-neq-scheduled`

### 4. Write the handoff
- **Do:** One sentence: who flags, who drafts, what “done” is.
- **Transcript:** `packets/lRUpu2-KtGQ/full.txt` @ 15:24

### 5. Draft only
- **Do:** Write the draft on disk. Transport = Gmail SMTP from env (`SMTP_*` in `.env.dev`). Not Gmail MCP. `send-removed`. Pass ≠ send. SMTP fires only when Evens says send.
- **Transcript:** `packets/lRUpu2-KtGQ/full.txt` @ 16:47

### 6. Evens sends
- **Do:** Hard step.

## Audits
- **coverage:** pass
- **context-misuse:** pass
- **contradiction:** pass — parts stay; this is the handoff machine
