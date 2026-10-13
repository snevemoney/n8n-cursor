---
name: pricing margin ROI guardrails
description: >-
  Use when scoring a prospect offer, SKU band, ROI narrative, or delivery margin
  for Money Desk / GTM / Consultant — Rung bands, ≤40% delivery, UNVERIFIED pain
---
# Pricing / margin / ROI guardrails

## When to use
- SKU draft review
- Prospect advance / HOLD / walk
- Warm-ask price narrative
- Retainer proposals

## Steps
1. **Load SoT:** [[METHODS/business-prospect-qualification-criteria]] · [[METHODS/business-service-ladder-economics]] · [[CONTENT/ai-partner-scoring-prototype-ladder/PACKET]] · [[CONTENT/business-kits/money-desk]].
2. **Name constraint** in one sentence. If you cannot → HOLD.
3. **Classify use case:**
   - Broken rails (404/mailto:null/no calendar) → Rung 1 candidate
   - Working slow premium SLA → Rung 0 until ops sigh confirmed
   - No contact / committee for micro-fee → DISQUALIFY
4. **Pick band (CAD):**
   - Rung 0: $750–1.2K
   - Rung 1: $1.5–3.5K (center of gravity ≤$3K unless volume verified)
   - Retainer early: $500–1K/mo after proof only
5. **Margin check:** delivery = config/SaaS/light site edits. If needs custom app/CE/ads/redesign as v1 → FAIL margin or re-scope down.
6. **ROI narrative:** four blanks required. Baseline may be TBD once. Never invent package prices. Label pain $ UNVERIFIED. Use ~10% of verified annualized pain only after owner numbers — else fixed fee.
7. **Output:** PASS / CONDITIONAL HOLD / DISQUALIFY + recommended rung + one discovery question that gates Rung 1.
8. **HITL:** propose only; operator approves before draft send; second approve before actual send.

## Anti-patterns
- Quoting educator $100k/mo or $3–10K retainers as ours
- Calendly pitch to intentional premium brands without confirmation
- % of pain without volume
- Demos shipped as client deliverables

## Enrich 2026-10-10: software-company unit economics (`yt:_Mvm7T_XMs4`)
NRR ((start + expansion − contraction − churn) / start; Snowflake 126%), RPO (contracted, not cash), rule of 40. AI lowers build cost, so price on outcomes and retention, not hours. `saas_metrics.py`.
