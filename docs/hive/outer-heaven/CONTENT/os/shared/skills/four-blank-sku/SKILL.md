---
name: Four-blank SKU
description: >-
  Use when drafting a prospect SKU after Consultant POSITION — emit four blanks,
  rung band, talk track, and anti-pitch; no client send.
---
# Four-blank SKU (Product GTM)

## When
After Lead Hunter named a web-only URL and Consultant delivered POSITION. Money Desk challenge comes after this draft.

## Steps
1. Read POSITION + `prospect-qualification-criteria` MUST gates; score PASS/FAIL/PARTIAL.
2. Write one-sentence constraint (outcomes, not chatbot).
3. Fill **four blanks**: Bucket (ACQUIRE/CUT) · KPI · Baseline (TBD OK if explicit) · 60-day target.
4. Pick **one** first-ask rung from Money Desk SoT: Rung 0 ($750–1.2K) XOR Rung 1 ($1.5–3.5K). Note held rungs (install/retainer).
5. Delivery check: config/SaaS path with ≤40% fee hours — FAIL custom app as first ask.
6. Talk track: public proof URLs only (cinematic, MCP, speed-to-lead when public). Never localhost in client-facing drafts.
7. Anti-pitch list (chatbot, ads agency, fake revenue, loud Book Free if premium brand).
8. Save to `~/.grokbot/research/<slug>-sku-offer-draft-YYYYMMDD.md`.
9. Ping Money Desk for ROI challenge; ping Consultant if POSITION drift. **Do not send** to prospect.


## Grok Bot harness (2026-09-01 — update, not a rebuild)

Org: Evens talks to Big Boss. Consultant audits/scope. Other desks only via mention or handoff. No 17 DMs.

After a meaningful run, append one JSON line (never overwrite, never log secrets):
`python3 /home/box/.grokbot/outer-heaven/append-action-log.py --agent "<desk>" --action "<slug>" --target "<what>" --result "<one line>"`
Log file: `/home/box/.grokbot/outer-heaven/ACTION_LOG.jsonl`

Failed or finished scheduled work doorbells the Big Boss / Day Planner / Consultant exec group only. Stay quiet if nothing failed. No logger desk. Mac out unless Evens asks local. HITL: money, client send, prod deploy, secrets.

## Batch-4 extract — Nate 6P SaaS sprint (`yt:IVx8OSMbTss`) 2026-09-01

FACT six P's from tape: **Pain · Promise · Product · Plumbing · Packaging · Proof**. Sell-before-you-build. Operator stays the project manager; agent proves confidence. Claude desktop + Codex desktop + “Glido” voice on tape → **Grok + Cursor Cloud + [local-push-to-talk-dictation](sand-workflow:local-push-to-talk-dictation)**. No second desktop.

### Hive remap (building mode — no client send)

| P | Hive |
|---|---|
| Pain | Consultant POSITION / [ai-ideas-from-pain](sand-workflow:ai-ideas-from-pain) |
| Promise | one-sentence constraint (this skill blank 1–2) |
| Product | one XOR rung, not a custom app first ask |
| Plumbing | auth/payments only after proof; Stripe CFO read-only; secrets Tier 3 |
| Packaging | [design-tokens](sand-workflow:design-tokens) + public proof URL — never localhost |
| Proof | [verify-then-done](sand-workflow:verify-then-done) + [proof-before-seat](sand-workflow:proof-before-seat) |

Do not treat the 2-hour course as permission to mint an AI SaaS ICP. School community / educator $ = **UNVERIFIED**. Codex/Claude desktop as required path = **BLOCKED**.

### Prompt

```
6P → four blanks for [prospect or self-proof]:
Pain (ops sigh):
Promise (one sentence):
Product (XOR rung):
Plumbing (auth/pay — HITL, no secrets in chat):
Packaging (public URL only):
Proof (verify until confident — PM is the operator):
No client send. No Claude desktop.
```
