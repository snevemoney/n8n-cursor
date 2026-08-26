# ICP runbook: `restaurant`

**Who:** Independent restaurant (not chains)  
**Pain:** Phone booking chaos; missed calls at service hours  
**Path:** A  
**Machine:** `missed-call-book`  
**SKU:** Intake→Book · Rung 1 · $1.5–3.5K CAD  
**Owners:** Lead Hunter · Consultant · Forge · HITL (voice/book)  
**Default city:** Greater Montreal

## Route here / not here

**Route here:** Indie restaurant with “call for reservations,” no after-hours capture, mobile menu without book button.  
**Not here:** Chain with corporate IT · live OpenTable/Resy **with no missed-call gap** (not a leak by itself) · wants AI voice auto-book (→ HOLD / `ask-principal`).

## Leak signals

- “Call for reservations” only · no OpenTable/Resy · mobile menu, no book button
- Peak-hour phone loss · no SMS/email capture after missed call

## Disqualify

- Wants AI voice that auto-books without callback · auto-dial outreach · franchise lock

## Offer sentence

“I help independent Montreal restaurants capture missed-call demand with a book CTA and human-approved follow-up — not a second voice vendor.”

## Landmines

- **Never auto-book a table** — voice vendor = `ask-principal` only
- SMS/call **drafts only** — CASL consent; HITL send
- No Glencoco-style dial factory

## Proof in drafts

Public URLs only. STL `:3007` for intake→book pattern. No localhost in client drafts.

## Path A — skill chain (router order)

1. `lead-web-find` — URL + leak + contact
2. `prospect-must-score` — MUST=0 → HOLD
3. `constraint-position` — peak-hour phone loss
4. `four-blank-sku` + `usecase-to-sku` → Intake→Book
5. `pricing-margin-roi-guardrails` → PASS/HOLD
6. `warm-draft-hitl` — missed-call SMS/email draft (HITL)
7. `private-book-install` — book link / widget
8. `ask-principal` for any voice/MCP book experiment
9. `click-live-site`
10. `proof-30-60-90`

## Hard step (HITL)

**Never** auto-book a table. Voice vendor = `ask-principal` only. Deploy · any client comms send.

## Today (session 1)

1. Lead Hunter: 3 indie Montreal restaurants — book leak noted (not just “has Resy”).
2. Consultant: missed-call → book CTA scope (no voice SKU).
3. Forge: mobile mock — book button + missed-call SMS draft (HITL).
4. **Append row(s) to [HUNT_LOG.md](./HUNT_LOG.md).**

## Session 2

1. MUST + margin on best URL.
2. Warm draft for owner (HITL).
3. `click-live-site` on mock/preview if built.

## Done when (≤60d)

Book CTA live on mobile · missed-call capture path documented · HITL follow-up template approved · no auto-voice book.

## Handoff

Log → [HUNT_LOG.md](./HUNT_LOG.md) · **Kill:** Glencoco-style dial · auto-reservation AI as product.
