# ICP runbook: `local-clinic`

**Who:** Dentists, med-spa, physio, vet, dental hygiene practices  
**Pain:** Google reviews sit unused; thank-yous never sent; book link weak or missing  
**Path:** A (named clinic)  
**Machine:** `review-to-book`  
**SKU:** Review-to-book Install · Rung 1 · $1.5–3.5K CAD  
**Owners:** Lead Hunter · Consultant · Forge · Comms (HITL send)  
**Default city:** Greater Montreal

## Route here / not here

**Route here:** Clinic with 4★+ Google reviews, weak or buried book path, owner can approve thank-you templates.  
**Not here:** No Google presence · solo trade (→ `local-pro`) · gym/coach (→ `owner-coach-fitness`) · lawyer (→ `law-adj`).

## Leak signals

- 4★+ reviews with no owner reply
- “Call us” only — no online book
- Book widget buried on mobile

## Disqualify

- No Google presence · committee-only buyer · wants auto-spam reviews · wants PHI in automated messages

## Offer sentence

“I help [clinic type] in Greater Montreal turn new Google reviews into booked appointments via a thank-you + book path you approve before send.”

## Landmines

- **No PHI** — never use patient names or review text with identifying details in drafts
- Thank-you / referral sends = **HITL only** — no auto-DM, no review-spam
- Intake rails only — not clinical advice

## Proof in drafts

Public URLs only in client drafts. STL Intake→Book demo `:3007` (not `:3006` MCP). Cinematic `:3005` for premium pages if scoped.

## Path A — skill chain (router order)

1. `lead-web-find` — URL + reviews + leak + contact
2. `prospect-must-score` — MUST=0 → HOLD. Stop.
3. `constraint-position` — where reviews die today
4. `four-blank-sku` + `usecase-to-sku` → Review-to-book Install
5. `pricing-margin-roi-guardrails` → PASS/HOLD
6. `warm-draft-hitl` — thank-you template + book link draft
7. `private-book-install` — their Cal/acuity embed
8. `click-live-site` on shipped preview
9. `proof-30-60-90`

## Hard step (HITL)

Evens approves every thank-you/referral send. No auto-DM. Deploy domain if scoped.

## Today (session 1)

1. Lead Hunter: one named Montreal clinic URL + leak note → MUST stub.
2. Consultant: constraint sentence (reviews → book gap).
3. Forge: draft review-monitor + thank-you flow spec (no send).
4. **Append row(s) to [HUNT_LOG.md](./HUNT_LOG.md).**

## Session 2

1. Complete MUST score → PASS or HOLD.
2. Margin check on Review-to-book Install.
3. Warm draft for HITL (thank-you + book link) — still no send.

## Done when (≤60d)

Book link live on site · thank-you template approved · N new 4–5★ reviews get HITL thank-you path · booked appointments from that path tracked.

## Handoff

Log → [HUNT_LOG.md](./HUNT_LOG.md) · Load: [USE_CASES-one-person.md](../watch-later/USE_CASES-one-person.md#1-review--book-dental)
