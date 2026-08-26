# ICP runbook: `law-adj`

**Who:** Solo lawyer, boutique consult, law-adjacent professional services  
**Pain:** Apply/consult rails broken; 404 book; form → nothing  
**Path:** A  
**Machine:** `private-book-install`  
**SKU:** Intake→Book (+ alert if needed) · Rung 1 · $1.5–3.5K CAD  
**Owners:** Lead Hunter · Consultant · Forge · HITL  
**Default city:** Greater Montreal

## Route here / not here

**Route here:** Solo/boutique with broken apply/consult book, PDF intake, mobile broken.  
**Not here:** Multi-partner firm committee · home services trade (→ `local-pro`) · wants legal advice in SKU.

## Leak signals

- “Contact us” only · PDF intake · no consult book · mobile broken
- Apply page 404 · email-only with no book

## Disqualify

- Multi-partner firm HR committee · wants legal advice in deliverable · bar/advertising blocks online book (→ HOLD)

## Offer sentence

“I help solo professionals in Greater Montreal fix intake→book on the site they already have — consult request, not legal advice in the deliverable.”

## Landmines

- **Intake rails only** — no legal advice in copy or SKU
- HOLD if bar rules block online booking — flag for Evens
- Firm-wide multi-template without budget → DQ or walk (`usecase-to-sku`)
- CASL on any outreach · HITL send

## Proof in drafts

STL `:3007` for intake→book pattern · public URLs only · no localhost in client drafts.

## Path A — skill chain (router order)

1. `lead-web-find`
2. `prospect-must-score` — MUST=0 → HOLD
3. `constraint-position`
4. `four-blank-sku` + `usecase-to-sku` — Law-adj consult rails
5. `pricing-margin-roi-guardrails` → PASS/HOLD
6. `warm-draft-hitl`
7. `private-book-install` — no legal advice in copy
8. `click-live-site`
9. `proof-30-60-90`

## Hard step (HITL)

Any client comms · compliance-sensitive publish · send

## Today (session 1)

1. Lead Hunter: 3 solo/boutique Montreal URLs (law/consult/adjacent).
2. Note apply/book leak per URL.
3. Consultant: scope as intake rails only (DISQUALIFY legal advice).
4. **Append row(s) to [HUNT_LOG.md](./HUNT_LOG.md).**

## Session 2

1. MUST on best URL → PASS or HOLD.
2. Margin + four-blank.
3. Forge: wireframe apply→book (intake only).

## Done when (≤60d)

Consult request / book path live · mobile works · owner alert on new intake · no legal advice in deliverable copy.

## Handoff

Log → [HUNT_LOG.md](./HUNT_LOG.md) · **Kill:** Firm-wide multi-template without budget.
