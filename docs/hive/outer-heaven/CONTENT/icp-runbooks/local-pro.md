# ICP runbook: `local-pro`

**Who:** Plumber, HVAC, salon, home services (trade) — **not** lawyer, gym, or fitness coach  
**Pain:** Missed calls, no-shows, email-only intake, slow callback  
**Path:** A  
**Machine:** `private-book-install` + speed-to-lead positioning  
**SKU:** Intake→Book Install · Rung 1 · $1.5–3.5K CAD  
**Owners:** Lead Hunter · Consultant · Forge · Watchdog (click-live)  
**Default city:** Greater Montreal

## Route here / not here

**Route here:** Trade or home service with phone-first book, missed-call leak, Calendly buried.  
**Not here:** Solo lawyer (→ `law-adj`) · fitness/coach (→ `owner-coach-fitness`) · clinic with review leak (→ `local-clinic`) · restaurant (→ `restaurant`).

## Leak signals

- Phone-only book · no after-hours CTA · Calendly on page 4 · form → black hole

## Disqualify

- Wants auto-dialer · franchise corporate IT lock · no decision maker

## Offer sentence

“I help [trade] owners in Greater Montreal stop losing jobs to missed calls with one intake→book path on the site they already have.”

## Landmines

- No auto-dial SKU · no localhost in client drafts
- CASL-aware outreach — warm drafts only, HITL send

## Proof in drafts

Speed-to-lead / Intake→Book demo `:3007` (public Vercel when deployed). Cinematic `:3005` for premium positioning. MCP `:3006` = connector proof only — not STL.

## Path A — skill chain (router order)

1. `lead-web-find` — URL + leak + contact
2. `prospect-must-score` — MUST=0 → HOLD
3. `constraint-position` — missed-call / intake gap
4. `four-blank-sku` + `usecase-to-sku` → Intake→Book
5. `pricing-margin-roi-guardrails` → PASS/HOLD
6. `warm-draft-hitl`
7. `private-book-install` — book CTA above fold + optional speed-to-lead ref
8. `click-live-site` on shipped preview
9. `proof-30-60-90`

## Hard step (HITL)

Deploy domain · Stripe if any · client outreach send

## Today (session 1)

1. Lead Hunter: **3** Montreal trade URLs max (one vertical) — visible phone leak each.
2. Pick **1** → MUST score stub.
3. Forge: screenshot leak + one-paragraph fix (book above fold).
4. **Append row(s) to [HUNT_LOG.md](./HUNT_LOG.md).**

## Session 2

1. Complete MUST → PASS or HOLD.
2. Margin + four-blank scope.
3. Warm draft (HITL) or private-book wireframe on preview.

## Done when (≤60d)

Book CTA live above fold · owner gets structured lead alert · reply SLA tracked · N booked calls from new path.

## Handoff

Log → [HUNT_LOG.md](./HUNT_LOG.md) · Proof: [speed-to-lead-demo](../speed-to-lead-demo/INDEX.md)
