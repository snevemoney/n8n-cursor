# Product GTM workflow tests
Status: filled
Date: 2026-08-14
From take: takes/product-gtm.md
## Tests
### 1. website-offer-funnel router
- Tape change: Router first. Named URL = Path A (MUST + margin + private-book). Volume list = Path B. Our page = Path C waitlist + walkthrough before live Stripe. Do not fork Client Pack. Do not skip the money spine. Do not publish a page.
- Command: Walk `scripts/hive/grok-skills/website-offer-funnel.md` Pick table against five fixtures. No `catalog-lane-upgrade.py`. No page, no Stripe, no ads.
- Result: pass
- Evidence: Skill table classifies without a live offer. (1) Normand `https://www.plomberienormand.ca/en` → **A** — packet already MUST PASS / margin PASS / four-blank drafted; do not start a 50-list. (2) “Make a B2B robotics outbound list” → **B** — `list-anneal-funnel` then 3–5 to A; do not MUST-score the raw 50; do not rotate the live hunt. (3) “Build our waitlist proof page” → **C** — `session-bootstrap` + `slice-build`; *our* checkout = `paid-slice-funnel` (waitlist HTML first); not Cal.com-on-their-site. (4) “Fork Client Pack SaaS” → **not a path** — park (`steal-usecases` `client-delivery-kit` + `agency-delivery` disqualify). (5) Unsure → ask Evens once; default A if a URL is already named. KPI for any steal stays destination conversions (booked / paid / deployed), not accounts or decks generated.

### 2. four-blank (Path A + Path C idea)
- Tape change: Four-blank after POSITION on a named client. Four-blank also for a Path C *idea* (not a hunt): agency owner / first client-ready pack / zero decks / value in one sitting. One KPI + baseline before launch spend. Time-to-aha is the sitting, not the third rewrite. Do not create a live offer.
- Command: Paper dry-run of Bucket / KPI / Baseline / 60-day against `CONTENT/icp-runbooks/packets/local-pro-normand/PACKET.md` and the take’s Client Pack analog. `ls scripts/hive/grok-skills/four-blank-sku.md`
- Result: fail
- Evidence: `four-blank-sku.md` is **missing** from `grok-skills/` (sand-workflow name only). `website-offer-funnel.md` still scopes four-blank as Path A after POSITION — take also wants it on a Path C idea. Paper fill only (no SKU, no page): **Path A Normand** — Bucket ACQUIRE · KPI time-to-first-touch / booked callback slots · Baseline **TBD** → launch HOLD · 60-day book CTA above fold + owner alert + SLA. **Path C idea (parked analog)** — Bucket ACQUIRE · KPI first deck in one sitting (activation) · Baseline zero decks · 60-day waitlist + clicked walkthrough on a real domain; no live Stripe keys. Watch three numbers only if Evens ever unparks: signups, first deck, first deck → paid. Did not price, publish, or fork Client Pack.

### 3. catalog-demand-match + Path C primitives
- Tape change: Demand-match before the router on unmapped needs. Kill “I do AI,” betting, OFM, auto-dial. Client Pack stays parked. Path C = waitlist-before-stripe + time-to-aha + known-good compare. Loud GTM stays behind `can-act` / offer_validated.
- Command:
  ```bash
  python3 scripts/hive/catalog-demand-match.py --format json --need "I do AI"
  python3 scripts/hive/catalog-demand-match.py --format json --need "fork Client Pack SaaS for agency owners"
  python3 scripts/hive/catalog-demand-match.py --format json --need "our Path C waitlist page before Stripe"
  python3 scripts/hive/catalog-demand-match.py --format text --need "I do AI"
  python3 scripts/hive/product-state.py --can-act "Product GTM" proofcheck
  python3 scripts/hive/os/should-run.py --self-test
  ls scripts/hive/grok-skills/{waitlist-before-stripe,known-good-compare,time-to-aha-gate,talk-track-17}.md
  ```
- Result: fail
- Evidence: Kill list **REFUSE** on `I do AI`, betting, OFM, auto-dial, generic landing — JSON only. `--format text` on REFUSE **crashes** (`KeyError: 'next'` — early kill return omits `next`). “Fork Client Pack SaaS for agency owners” → **RESEARCH** (should refuse / park, not open a packet). “Our Path C waitlist page before Stripe” → **BUILD** `list-anneal__industrial-smb__greater-montreal` because the keyword `list` sits inside `waitlist` — wrong path. Named plumber → correct machine `private-book-install` but verdict BUILD not USE. `paid-slice-funnel.md` already says waitlist HTML first, time-to-aha before 3–5 generations, Stripe/domain HITL, preview ≠ custom domain. `product-state.py --can-act "Product GTM" proofcheck` → IGNORE (`suppressed_agents`; `offer_validated: false`). `should-run` self-test OK; GTM + `lifecycle=development` → WAIT_FOR_STATE; beta + `offer_validated` → RUN. Proposed skill files from the take are **not on disk**. Did not run `--operator-yes`. Did not publish.

## Never (operate)
- No send / pay / deploy / book / publish. No live offer. No ads. No custom-domain pricing.
- No Client Pack SaaS fork. No betting / OFM / OTP / auto-dial / “I do AI” page.
- No Grok Bot. No LESSONS merge. Takes stay SSOT.

## Blocked on Evens
- Normand baseline is TBD — no launch spend until the owner gives a number. Draft approve / send stay HITL (not this desk).
- Write `four-blank-sku.md` (and the four proposed Path C gates) only if Evens keeps them. This desk does not auto-write SKILL.md.
- `catalog-demand-match.py`: Client Pack not on the kill list; `waitlist` collides with `list`; text REFUSE crashes. Forge/script change — not a Path C ship.
