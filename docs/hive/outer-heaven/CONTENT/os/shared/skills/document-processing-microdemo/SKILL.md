---
name: Document processing microdemo
description: >-
  Use for a small PDF/drawings-to-fields-to-sheet proof — Nate buy-list micro-demo
  or construction-estimate-from-plans. Triggers: PDF extract, takeoff, estimate
  from drawings, Claude Cowork estimate. Anti-triggers: new construction ICP,
  auto-email the extract, Claude desktop required.
merged_from: [document-processing-micro-demo]
---

# Document processing microdemo

Sources: Nate buy-list #2; youtube-ai-implement P2 #11.

## When
Need a tiny proof that messy PDFs become structured rows.

## Do
1. PDF or image in → fields out → sheet or JSON.
2. One golden sample with verify.
3. Keep it a proof, not a new icp_id.

## Don't
- Promise OCR accuracy without the golden set
- Auto-email extracted data

## Batch-4 extract — Claude Cowork custom-home estimate (`yt:wmPxY51vpSo`) 2026-09-01

FACT 10-step estimator on tape: analyze drawings + qualifying questions → scope categories (foundations, framing, rough-ins) → scope-writing guidelines + cost-code CSV + takeoffs from plans → **three outputs**: (1) structured estimate (scope, qty, cost) (2) inclusions / exclusions / assumptions (3) allowances list.

Inputs the skill asks for: cost-code CSV with a COGS column (labor / material / trade); a sample estimate in the same codes; a drawing set.

Claude Cowork / Claude desktop = **BLOCKED**. Remap: Grok + Cursor Cloud + this skill. Do not mint a construction ICP. Keep it a **proof** on operator or named-client files only. No auto-email of numbers. Tape “24–36 hours → 30 minutes” and WPM claims = **UNVERIFIED**.

### Tools

| Need | Path |
|---|---|
| PDF / image in | box Read / poppler — **PROVE** |
| Sheet / JSON out | workspace file — **PROVE** |
| Claude Cowork | **BLOCKED** — Grok+Cursor **WORKAROUND** |
| Buildwize / vendor estimate SaaS | **BLOCKED** — CSV/JSON **WORKAROUND** |

### Prompt

```
Drawings or PDF: [path]
Cost-code CSV (with COGS column): [path]
Sample estimate (same codes): [path]
Outputs: estimate rows · inclusions/exclusions/assumptions · allowances
Golden one job. No invented unit costs. No send. No new ICP.
```


## Merged from document-processing-microdemo (2026-10-11 gap audit)
- Position: P2 proof after speed-to-lead; do not sell as the main SKU before STL.
- Always label the demo and keep an AI-off path.
- Provenance wave Z `CWvN7NN-14c` (2026-09-09): doc collection = checklist-diff uploads, remind only on gaps, CRM onboarding writeback; DocuSign/phone BLOCKED. Packet `repass-20260909/CWvN7NN-14c/`.

---

## Merged from `document-processing-micro-demo` (2026-10-11)

- Original description: DEPRECATED alias: use document-processing-microdemo (merged 2026-10-11). Kept so old links do not break.
- Unique content carried: speed-to-lead: inquire-to-book rubric (form→qualify→calendar→owner alert, HITL drafts), OpenAI Cloud Agents closing notes

# Document-processing micro-demo (DEPRECATED)

> Merged into `document-processing-microdemo/SKILL.md` on 2026-10-11. Use that one.

**Owner desk:** Forge  
**Lane:** ai-partner-websites  
**Sources:** youtube-ai-implement P2#11

## When
P2 proof after speed-to-lead

## Do
1. PDF→fields→sheet
2. Demo labeled
3. AI-off path

## Don't
- Sell as main SKU before STL

## Done when
Reusable artifact on disk (brief, packet, checklist, or skill note) — not chat-only.

## Provenance delta — wave Z `CWvN7NN-14c` (2026-09-09)
- Doc collection = checklist-diff uploads → remind only on gaps → CRM onboarding writeback. DocuSign/phone **BLOCKED**. Packet: `repass-20260909/CWvN7NN-14c/`.
