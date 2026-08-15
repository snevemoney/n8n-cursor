# Money Desk workflow tests
Status: filled
Date: 2026-08-14
From take: takes/money-desk.md
## Tests
### 1. hive-revenue-sensors.py hourly (read-only, no register)
- Tape change: Tape $ is UNVERIFIED. Receipts are X→Y we can open. A live dashboard flash (OFM reload, GP %, CE queue) is not a price analog and not a Stripe charge. Path C ops only — observe, do not SKU the sensor.
- Command: `python3 scripts/hive/hive-revenue-sensors.py hourly`
- Result: pass
- Evidence: exit 0. Printed `jobType: product.hypothesis.proposed`, `summary: Revenue sensor: GP 1/3 (33%), CE open -1`, `metadata.goldenPaths.pass=1 total=3 stabilityPct=33`, `ceOpenActions=-1` (CE URL failed closed; script kept going). Payload has no price, band, or checkout field. Did not pass `--register` (that path is Grok Bot / `grok-hive-tool.py`). `--dry-run` is a parent flag only — `hourly --dry-run` exits 2 (`unrecognized arguments`); correct read-only run is `hourly` with no register. Did not run `n8n-import-revenue-sensor.sh` (that PUTs/activates n8n).

### 2. outcome-offer-funnel dry-run (Normand Path A)
- Tape change: Count checkout + warm conversions. Quarantine YouTube and tweet $. Named client still needs MUST + margin + private-book — the offer sentence does not replace Path A. Hours×rate and educator retainers stay UNVERIFIED stretch.
- Command: paper walk of `scripts/hive/grok-skills/outcome-offer-funnel.md` against `OPERATOR_FOCUS` (`icp_id=local-pro`, machine `private-book-install`) + `CONTENT/icp-runbooks/local-pro.md` + `packets/local-pro-normand/PACKET.md`. No send.
- Result: pass
- Evidence: Sentence already on the runbook: “I help [trade] owners in Greater Montreal stop losing jobs to missed calls with one intake→book path on the site they already have.” Four-blank on the packet: ACQUIRE · time-to-first-touch / booked callback slots · baseline TBD (owner numbers UNVERIFIED) · 60-day book CTA + owner alert + SLA + N booked calls. Time-to-aha = first booked callback window, not 3–5 generations. Proof on file is the 2026-08-13 live site read + packet, not a workflow screenshot and not an OFM/YouTube dashboard. Money Desk counts this sitting: checkout conversions = 0 (Path A, no our Stripe); warm conversions = 0 (`WARM_DRAFT.md` both HITL boxes unchecked). `pricing-margin-roi-guardrails` on the same packet stays **PASS** (Rung 1 $1.5–3.5K, delivery = CTA/form/calendar/alert, pain $ UNVERIFIED). Tape offers dry-fail the skill: OFM “unlimited $ from a reloaded creator dashboard” = HOLD / not a receipt; Polymind tripwire + refund-if-not-profitable = signal not revenue, betting = operate-never; “I do marketing with AI” = anti-pattern. Did not invent owner job $. Did not send.

### 3. paid-slice-funnel dry-run (Path A ≠ Path C; no live Stripe)
- Tape change: Thin V1, Stripe HITL, preview ≠ domain, aha before scale. Sandbox before live keys. Checkout-in-one-sitting on a warm list is the machine — a tripwire card is not a lane. HOLD live Stripe and custom-domain cutover until the journey smokes.
- Command: paper walk of `scripts/hive/grok-skills/paid-slice-funnel.md` + `website-offer-funnel.md` Path pick. No Stripe API. No product/charge create.
- Result: pass
- Evidence: Live hunt is a named client URL → Path A. Router step 8: delivery = `private-book-install`, **not** `paid-slice-funnel` unless we are selling *our* checkout. Catalog row `private-book-install__local-pro__greater-montreal` is `path: A`, `lifecycle: catalog`, required skills = lead-web-find / MUST / private-book / warm-draft-hitl — no Stripe skill. Path C rows `checkout-proof__us__greater-montreal` and `__remote` require `paid-slice-funnel`, `lifecycle: catalog`, `pilot.status: none` — no operating checkout, no live keys to flip. Skill Stop is explicit: Stripe live keys, domain DNS, prod deploy = operator only. Dual-smoke (preview **and** custom domain) was not run because nothing shipped this sitting. No sandbox charge, no live charge, no Stripe product. OFM dashboard $ and tape monthly/tripwire numbers were not used as a price band.

## Never (operate)
- No send / pay / deploy / book / publish.
- No Grok Bot / `sendPrompt` / `--register` on the sensor.
- No live Stripe charge or product. No sandbox charge this sitting.
- No `n8n-import-revenue-sensor.sh` (activates a workflow).
- No OFM / YouTube / tweet / GP% / CE-queue $ as our price.
- No farms, OTP, fake identity, mass-DM, betting, auto-dial, paid indexer.
- No LESSONS-FROM-TAPE merge. Takes stay SSOT. Take file not rewritten.

## Blocked on Evens
- `WARM_DRAFT.md` — approve draft, then a second HITL to send. This desk does not send.
- Any Path C checkout: sandbox keys, then live keys, stay HITL. No product until Evens names one.
- CE actions URL returned closed (`ceOpenActions=-1`). Sensor still ran; do not treat GP 1/3 as a price or a go.
- Owner volume on Normand is still UNVERIFIED — do not invent pain $ to “improve” the PASS.
