# Pipeline movement test
Date: 2026-08-14
Status: dry / no send / no pay / no book
Evaluator only. No Grok Bot. No live `HUNT_LOG.md` append. No catalog upgrade. No Stripe product.
Re-verify after lanes A/B/C. Did not send / pay / book / deploy / publish. Did not append `HUNT_LOG`. Did not commit. Did not check `WARM_DRAFT` boxes.

## Verdict after fixes (2026-08-14)

Would the full matrix in movement make sense? **Partial.**

1. **Matcher:** Kill-list REFUSE on OFM, auto-dial, I do AI, Client Pack, $85K/RPM, job-loss, mass-DM — JSON + text, exit 0 (no `KeyError: next`). Plumber / dental / restaurant / fitness / law / Path C waitlist hit the right SKU. Combinators RESEARCH `catalog-not-operating`.
2. **Normand Path A:** `hunt-log-stats` `total_rows=1` · `qualified=1` · `pipeline_active=1`. Packet has four-blank + `I help … get 1 intake→book`. Repo skills exist (`four-blank-sku`, `warm-draft-hitl`, `private-book-install`, discovery/demo/proof/follow-up). Both `WARM_DRAFT` boxes still unchecked.
3. **Hard steps:** send / pay / book / pilot are honest HITL holds, not matcher lies. No dated callback slot. No Stripe product. Upgrade still `Pilot not PASS`. Day Planner `grok-hive-tool --list-tools` has **no** `n8n_trigger_catalog_webhook`.
4. **Rest of the 11 ICPs:** still SIMULATED (no packets — do not invent). Path B `url=—` still dropped by `hunt-log-stats`. Lead Hunter `can-act operator` = **IGNORE** (RUN only on `clipengine`).
5. **Lane C SSOT leak:** `skill.ask-principal` is on HITL `use`. Job-card `## Load first` does **not** point at `takes/{slug}.md` (0/17 cards; INDEX banner gone). `agent-scenarios` still names ack-reply send.

---

## Cell delta after fixes

Prior nonsense / blocked cells only. n/a unchanged.

| Prior cell | Was | Now |
|------------|-----|-----|
| Normand A prospect | blocked — log 0 | **now sense** — row visible, URL counted |
| Normand A lead | blocked — log invisible, four-blank missing | **now sense** — `qualified` + four-blank on packet. Baseline TBD = send HOLD, not a lead miss |
| Normand A client | blocked — boxes unchecked, stage still qualified | **still-blocked** — HITL draft box |
| Normand A send | blocked — draft ≠ send | **still-blocked** — HITL send box |
| Normand A book | blocked — skill Grok-only, no dated slot | **still-blocked** — repo skill exists; no dated window; no auto-Calendly |
| Normand A buyer | blocked — no cash path | **still-blocked** |
| Normand A pilot | blocked — Pilot not PASS | **still-blocked** — 501 parked |
| Normand C book if Calendly-on-us | nonsense | **still-nonsense** if we book on us |
| Normand C pay if Stripe their install | nonsense | **still-nonsense** if we Stripe Path A |
| `local-clinic` A lead→pilot | blocked — no packet | **still-blocked** — SIMULATED |
| `restaurant` A book | nonsense — matcher → `__local-pro` | **now sense** — `missed-call-book__restaurant`. Live book **still-blocked** (no named packet) |
| `exec-coach` C site brief | nonsense — RESEARCH despite row | **now sense** — BUILD `orchestrated-site-brief__exec-coach` |
| `exec-coach` C pay | blocked — paid-slice RESEARCH | matcher **now sense** (BUILD `paid-slice__us`). Live pay **still-blocked** (Stripe HITL) |
| `creator-longform` clip-factory skill | sense machine / skill missing | **now sense** — `clip-factory.md` + BUILD row. Pilot **still-blocked** |
| `agency-delivery` Client Pack / SaaS fork | nonsense — RESEARCH not REFUSE | **now sense** — REFUSE |
| `industrial-smb` B prospect | nonsense — `url=—` dropped | **still-nonsense** — parser still skips `—` / `-` |
| `mktg-software` B matcher | nonsense — `list-anneal__industrial-smb` | **now sense** — `list-anneal__mktg-software` |
| `owner-coach-fitness` A book | nonsense — `__local-pro` | **now sense** — `__owner-coach-fitness` |
| `law-adj` A book | nonsense — `__local-pro` | **now sense** — `__law-adj` |
| `us` C pay matcher | blocked — paid-slice / checkout-proof RESEARCH | **now sense** — BUILD `paid-slice__us` / `checkout-proof__us`. Charge **still-blocked** |
| `us` C Day Planner webhook | blocked — can fire catalog webhook | **now sense** — denied on desk + `--list-tools` |
| Kill-list Client Pack / $85K / job-loss | RESEARCH | **now sense** — REFUSE |
| mass-DM seduction | BUILD inbox-to-task | **now sense** — REFUSE |
| Path C waitlist | nonsense — `list-anneal` | **now sense** — `paid-slice__us` |
| dental clinic review-to-book | nonsense — plumber SKU first | **now sense** — `review-to-book__local-clinic` |
| Combinator BUILD wrong SKU | nonsense | **now sense** — RESEARCH `catalog-not-operating` |
| `--format text` on REFUSE | crash `KeyError: next` | **now sense** — prints `NEXT:`, exit 0 |
| Back-and-forth / follow-up skills | blocked — names only | **now sense** as files. Loop **still-blocked** at HITL send |
| Send architecture (shared Gmail / ack-reply) | nonsense | **partial** — routines draft-only; `agent-scenarios` still has ack-reply + “HITL → send” |
| SIMULATED A/B lead→pilot (clinic, restaurant, exec, creator, agency, industrial, mktg, fitness, law) | blocked | **still-blocked** — no named packet / no log row |

---

## Still on Evens

HITL / operator only. This desk did not do these.

- `WARM_DRAFT.md`: both boxes unchecked. APPROVE DRAFT, then a second sitting for APPROVE SEND. Do not check both. Do not send.
- Live send / pay / book / deploy / publish.
- Dated Path A callback window on *their* CTA. No Calendly-on-us.
- Path C Stripe sandbox/live keys, domain, waitlist page.
- 501 catalog rows parked. No `catalog-lane-upgrade --operator-yes`. Pilot PASS first.
- Owner Baseline + booked-call N for Normand. Who signs the homepage CTA (#4/#16 LIKELY).
- Whether Lead Hunter belongs on `operator.allowed_agents` or the hunt stays on `clipengine`.
- Whether `hunt-log-stats` should count Path B `url=—` rows.
- Whether job cards Load `takes/{slug}.md` first (Lane C claimed it; cards on disk do not).

---

## Remaining real holes (not HITL-on-Evens)

1. **Lead Hunter `can-act operator` = IGNORE** — hunt board + `OPERATOR_FOCUS` live on `operator`; desk RUN only on `clipengine`.
2. **`hunt-log-stats` drops `url` in {`—`, `-`}** — Path B list-only stays `total_rows` invisible even after a real Today append.
3. **Job-card Load first misses `takes/`** — 0/17 cards; `INDEX.md` has no takes banner. Files exist under `takes/`. LESSONS shell still says load takes.
4. **`agent-scenarios.py` Comms still lists ack-reply send** — routines say draft-only; this file can still talk a desk into a send path.

---

## Verdict (original, 2026-08-14 morning) — No

Would the full matrix in movement make sense? **No.**

1. **11-ICP hunt:** Only Normand is a LIVE named Path A prospect (MUST PASS · margin PASS · draft written). The pipeline cannot see him (`HUNT_LOG` 0 rows, no `stage` column). Ten other ICPs are SIMULATED Today-only. Lead Hunter is `IGNORE` on `operator` (the hunt project) and `RUN` on `clipengine` (wrong project).
2. **~500 catalog:** 504 rows; **3 operating** (grandfathered lanes); **501 parked** (`lifecycle=catalog`, `pilot.status=none`, `lane_id=null`). 413 are thin combinators with no path. Demand-match covers 8/36 machines; most parent models return RESEARCH even when a catalog row exists. Kill-list misses Client Pack / $85K / job-loss / mass-DM.
3. **send / pay / book:** Skills and dual-HITL prose exist; **none of the three can fire correctly today.** Send: Normand both boxes unchecked + Comms still has a send path. Book: `private-book-install` is Grok-only, no dated slot, upgrade `Pilot not PASS`. Pay: Path C `paid-slice` matcher-miss; no Stripe dry product; Path A pay is invoice-after-book, not a live checkout.
4. **Six case types:** Perfect is blocked (log + HITL + baseline TBD). Back-and-forth / follow-up have no skill files (`discovery-spiced-constraint`, `demo-walk-script`, `proof-30-60-90` named only). Mistake and challenging leak through the matcher. Bad cases do not all REFUSE.

---

## Stage map

Repo names ↔ operator words. **Do not invent a second money spine.** Path A and Path C are different cash paths; never run both on one job.

| Operator word | HUNT_LOG `stage` | WORKFLOWS | Catalog lifecycle | What enters / exits |
|---------------|------------------|-----------|-------------------|---------------------|
| **prospect** | `discovered` | 1 Find | — | URL + leak + contact; MUST stub |
| **lead** | `qualified` | 2–5 Pack / POSITION / Economics | SKU exists (`catalog`) | MUST PASS + margin + four-blank |
| **client** | `ready` | 6 Draft approve | — | Warm draft in HITL queue (named client, not paid) |
| **send** | *(not a stage — WORKFLOWS 7)* | 7 Send | — | HITL2 APPROVE SEND. Comms drafts; Evens sends. |
| **book** | start of `delivering` | 8 Delivery (Path A) | — | `private-book-install` on *their* CTA/Cal. Not our Calendly. |
| **pay** | cash path on `delivering` | 8 Delivery $ / Path C paid-slice | — | Path A = invoice/deposit on install. Path C = *our* Stripe. Not both. |
| **buyer** | `delivering` (cash started) | 8 after pay | — | Money received or invoice accepted |
| **pilot** | *(not in HUNT_LOG)* | 9 Proof 30/60/90 | `building` → `operating` | `catalog-lane-upgrade.py` after pilot PASS + `--operator-yes` |
| parked | `parked` | — | stay `catalog` | MUST HOLD / kill / combinator thin |

**Path A real order:** prospect → lead → client → **send** → **book** (their CTA) → **pay** (invoice) → buyer → pilot.  
**Path B:** list (prospect) → anneal 3–5 → each becomes Path A. Do not MUST-score the raw 50.  
**Path C:** our page → waitlist → **pay** (Stripe HITL). No client send/book.

Live header of `HUNT_LOG.md` is `date | icp_id | city | url | leak | contact | MUST | next | owner` — **no `stage`**. Parser also **drops** rows whose `url` is `—` (Path B list-only would stay invisible even if appended).

```
# DRY FIXTURE ONLY — do not copy into live HUNT_LOG.md
# Header the stats script can count:
# | date | icp_id | city | url | leak | contact | MUST | stage | next | owner |
# | 2026-08-13 | local-pro | Greater Montreal | https://www.plomberienormand.ca/en | after-hours no callback slot | info@plomberienormand.ca | PASS | qualified | HITL draft approve | Lead Hunter |
# Expected if this were the live file: total_rows=1, by_stage.qualified=1, pipeline_active=1
# Live file today: total_rows=0, last_row=null
```

---

## Matrix

ICP × stage. Mark = **sense** / **nonsense** / **blocked** / **n/a**. Path in cell. Normand first. Others compressed. SIMULATED = Today block only; no named packet.

| ICP | prospect | lead | client | send | book | pay | buyer | pilot |
|-----|----------|------|--------|------|------|-----|-------|-------|
| **Normand `local-pro` LIVE Path A** | **blocked** — packet has URL+leak; log 0 so stats cannot see a prospect | **blocked** — packet says `qualified` MUST/margin PASS; log invisible; `four-blank-sku.md` missing; Baseline TBD | **blocked** — `WARM_DRAFT.md` exists (ready-shaped); both HITL boxes unchecked; packet still says qualified | **blocked** — draft ≠ send; Evens must check boxes in order | **blocked** — `private-book-install` Grok-only; no dated callback window; do not book Calendly | **n/a** until book — Path A is invoice, not Stripe | **blocked** — no cash path | **blocked** — upgrade `Pilot not PASS (status=none)` |
| Normand Path B | **n/a** — named URL; do not start a 50-list | n/a | n/a | n/a | n/a | n/a | n/a | n/a |
| Normand Path C | **n/a** — not our page | n/a | n/a | n/a | **nonsense** if we Calendly-on-us | **nonsense** if we Stripe their install | n/a | n/a |
| `local-clinic` A SIMULATED | **sense** if Today ran (1 clinic URL) | **blocked** no packet / no log | blocked | blocked | blocked | n/a | blocked | blocked |
| `restaurant` A SIMULATED | **sense** Today=3 URLs | blocked | blocked | blocked | **nonsense** matcher → `private-book-install__local-pro` not `missed-call-book__restaurant` | n/a | blocked | blocked |
| `exec-coach` A/C SIMULATED | A **sense** if named URL; C **n/a** as hunt | A blocked; C **nonsense** — matcher RESEARCH despite `orchestrated-site-brief__exec-coach` row | blocked | A blocked | A/C blocked | C **blocked** — paid-slice RESEARCH | blocked | blocked |
| `creator-longform` A/C SIMULATED | **sense** pick URL or our channel | A blocked | blocked | blocked | n/a (clips not book) | C blocked | blocked | **sense** machine `clip-factory` BUILD; skill file missing |
| `agency-delivery` A/C SIMULATED | **sense** if named; else Path C sample | blocked | blocked | blocked | n/a | C **nonsense** Client Pack fork = RESEARCH not REFUSE | blocked | kit analog **sense**; SaaS fork **nonsense** |
| `industrial-smb` B→A SIMULATED | **nonsense** — Today url=`—` is dropped by `hunt-log-stats` | **sense** anneal 3–5 then A | blocked | blocked (playbook-before-send named) | blocked | n/a | blocked | blocked |
| `mktg-software` B SIMULATED | **nonsense** matcher → `list-anneal__industrial-smb` not `__mktg-software` | same | blocked | blocked | blocked | n/a | blocked | blocked |
| `owner-coach-fitness` A SIMULATED | **sense** Today=3 URLs | blocked | blocked | blocked | **nonsense** matcher → `__local-pro` not `__owner-coach-fitness` | n/a | blocked | blocked |
| `law-adj` A SIMULATED | **sense** Today=3 URLs | blocked | blocked | blocked | **nonsense** matcher → `__local-pro` not `__law-adj` | n/a | blocked | blocked |
| `us` C | **n/a** (internal) | n/a | n/a | n/a (no client letter) | n/a | **blocked** — `paid-slice` / `checkout-proof` RESEARCH; Stripe HITL | blocked | **blocked** upgrade + Day Planner can fire catalog webhook |

---

## Catalog census

File: `CONTENT/BUSINESS_CATALOG.json` v1.0.0 updated 2026-08-14. Operating subset: `scripts/hive/business-lanes.json` (5 lane records; 3 active).

| Bucket | N | Notes |
|--------|---|-------|
| **Total entries** | **504** | |
| `lifecycle=catalog` | 501 | parked until pilot PASS + `--operator-yes` |
| `lifecycle=operating` | **3** | `lane__ai-partner-websites`, `lane__amazon-own-store`, `lane__hive-os` (all `pilot.grandfathered`) |
| `lifecycle=researching` / `building` | 0 / 0 | empty |
| `research_depth=thin` | 415 | almost all combinators |
| `research_depth=ready` | 89 | 86 catalog + 3 operating |
| `lane_id=null` | 501 | combinators + unused SKUs |
| `lane_id` set | 3 | the operating trio |
| `source=catalog-combinator` | 413 | no `path` field |
| `pilot.status=none` | 501 | |
| `pilot.status=grandfathered` | 3 | |
| **Could move today** | **3** | USE on operating lanes only |
| **Parked** | **501** | including every hunt SKU (Normand’s machine is `catalog`) |

**Path encoded** (76 rows only; 428 have `path=null`): C 44 · A 18 · B 6 · A/C 4 · C/A 4 · operating 3 have no path.

**ICP spread** (do not invent): `us` 46 · `agency-delivery` 44 · `industrial-smb` 42 · `creator-longform` 40 · `restaurant` 40 · `local-pro` 40 · `mktg-software` 38 · `local-clinic` 36 · `exec-coach` 36 · `owner-coach-fitness` 36 · `dropship` 34 · `law-adj` 33 · `amazon-own-store` 32 · null 5 · `ai-partner-websites` 2. Combinators also stamp hunt ICPs onto Path C machines (e.g. `interview-gym__restaurant`).

**Lanes file:** `ai-partner-websites` active · `amazon-own-store` active · `hive-os` active · `dropship` planned (catalog thin, `lane_id` null) · `future` reserved.

**Matcher coverage:** `KEYWORD_MACHINES` = 8 machines (`clip-factory`, `private-book-install`, `review-to-book`, `list-anneal`, `folder-to-deck`, `inbox-to-task-routing`, `invoice-email-automation`, `product-ad-from-photo`). Catalog has **36** machines / **38** parent models. 28 machines are matcher-blind → RESEARCH.

---

## Catalog movement sample

Sample **52** vs total **504** (JSON matcher import; `--format text` not used on REFUSE).

| Slice | N | Result |
|-------|---|--------|
| All `operating` | 3 | **USE** each (`ai-partner-websites`, `amazon-own-store`, `hive-os`) — **sense** as lanes, **n/a** as hunt stages |
| One rep per `parent_model` (non-operating) | 35 | **BUILD 11 / RESEARCH 24** |
| Kill-list | 8 | REFUSE 4 · RESEARCH 3 · BUILD 1 |
| Combinator `lane_id=null` | 6 | BUILD 4 (wrong SKU) · RESEARCH 2 |

Parent-model BUILD that is **wrong machine:** `missed-call-book` → `private-book-install__local-pro`; `review-to-book` clinic → same local-pro book SKU (keyword `book` wins); `playbook-before-send` → local-pro book; `meeting-to-task-routing` → `folder-to-deck`.  
Parent-model RESEARCH despite a ready row: `paid-slice`, `orchestrated-site-brief`, `one-channel-deep`, `checkout-proof`, `client-delivery-kit`, `missed-call-book` (as itself), `demand-validate`, `cinematic-recipe`, …

Combinator fixtures: `review-to-book for dropship` → BUILD local-pro book (**nonsense**); `demand-validate for law-adj` → BUILD `product-ad-from-photo__dropship` (**nonsense**); `morning-ceo-desk for local-pro plumber` → BUILD local-pro book (**nonsense**).

### Catalog × stage (compressed)

| Lifecycle bucket | N | prospect→…→pilot | Mark | Why |
|------------------|---|------------------|------|-----|
| `operating` | 3 | n/a as hunt | **n/a** / **sense** as USE | Portfolio lanes, not prospects. No HUNT_LOG stage. |
| `catalog` + `ready` + path A/B/C | ~86 | would be hunts | **blocked** | No log row; upgrade needs PILOT.md PASS; matcher often wrong SKU |
| `catalog` + `thin` combinator | 413 | look like hunts | **nonsense** | No path; cross-ICP (gym×restaurant, review×dropship); would fake movement if treated as Today |
| `researching` / `building` | 0 | — | **n/a** | Empty. Nothing in flight. |

---

## Hard-step pipelines (send / pay / book)

Dry-map only. **Did not** Gmail send, Stripe charge/product, Calendly/book, deploy, or publish.

### Send

**Exists today:** `warm-draft-hitl` (Grok `~/.grokbot/skills/`, **missing** from `scripts/hive/grok-skills/`). `outbound-playbook-funnel.md` (repo). `ask-principal.md` (repo). Gmail plugin `hitl=draft` (inventory). Comms one-pager: client send = Tier 3. Normand `WARM_DRAFT.md` dual boxes.

**Steps that would run:** Consultant/GTM facts → Comms drafts → HITL card 1 APPROVE DRAFT → HITL card 2 APPROVE SEND → Evens sends from Gmail. Playbook-before-send on Path B after 3–5.

**Dry:** `product-state.py --can-act "Communications Manager" operator` → RUN. `--can-act "HITL Operator" operator` → RUN. Inventory Comms **use includes `gmail`**. HITL **use has no `gmail`** and **no `ask-principal`**; use includes `twilio_number` / `n8n.on-demand-calling`. `agent-scenarios.py` still has `Low-risk acknowledged reply ("Received, thanks")`.

**Would it make sense?** **blocked** (Normand) / **nonsense** (architecture). Dual-HITL on the card is honest; the desk can still send via shared Gmail + restricted-send prose + ack-reply scenario. Gate-string drift (job card `ACTION / WHY / AGENT / RISK / REVERSIBILITY` vs doctrine / routines / roster). Empty HUNT_LOG means no `ready` count.

**Paths:** A = after margin, this letter. B = only the 3–5, after playbook. C = n/a (no client letter).

### Book

**Exists today:** `private-book-install` Grok skill (PASS stack: Cal.com/Calendly + form + CTA + owner alert). **No** repo `scripts/hive/grok-skills/private-book-install.md`. Website-offer Path A step 8. Restaurant: `ask-principal` before any voice book. Catalog rows: `private-book-install__local-pro|owner-coach-fitness|law-adj`, `missed-call-book__restaurant`.

**Steps:** After send + they say yes → map inquiry → callback window → config/SaaS on *their* site → Loom. Client owns calendar keys. **Not** `paid-slice-funnel`.

**Dry:** `catalog-demand-match` plumber → BUILD `private-book-install__local-pro` (correct machine, verdict BUILD not USE). `catalog-lane-upgrade.py --sku-id private-book-install__local-pro__greater-montreal --dry-run` → exit 1 `Pilot not PASS (status=none)`. Pilots README says grandfathered via ai-partner; script looks for `CONTENT/pilots/private-book-install/PILOT.md` (missing). Did not open Calendly.

**Would it make sense?** **blocked.** Skill exists on Grok; repo chain + upgrade + dated slot do not. Matcher sends restaurant/clinic/law/fitness to the plumber SKU.

**Paths:** A = the delivery. B = n/a until a name becomes A. C = n/a (their book ≠ our Stripe).

### Pay

**Exists today:** Path A packet: “Invoice/deposit on install. No free custom build.” Path C: `paid-slice-funnel.md` (waitlist HTML first; Stripe/domain HITL). Catalog `paid-slice__us__*`, `checkout-proof__us__*`. `invoice-email-automation.md` (Gmail draft; HITL `ACTION/WHY/RISK` — AGENT + REVERSIBILITY dropped). `hive-revenue-sensors.py hourly` read-only (GP 1/3, not a price). Vault note `Stripe API.md` tagged tier3. LightningFlow invoice routes are **another product**, not this hunt.

**Steps Path A:** after book live → invoice/deposit → Money Desk counts receipt. **Steps Path C:** name slice → waitlist → sandbox keys → live keys HITL → dual-smoke preview ≠ domain.

**Dry:** `product-state.py --can-act "Money Desk" operator` → RUN. `catalog-demand-match --need "our paid slice thin V1 Stripe checkout proof"` → **RESEARCH** (row exists, no keyword). `hive-revenue-sensors.py hourly` exit 0, no checkout field. Did not create a Stripe product.

**Would it make sense?** **blocked** / Path C matcher **nonsense**. No operating checkout. Sensor $ is not a go. Path A pay cannot start before send+book.

**Paths:** A = invoice after install. B = no list-as-SKU. C = our Stripe only.

---

## Case types (back-and-forth / mistake / bad / perfect / challenging / follow-up)

Same spine, hive language only. One concrete fixture each.

### 1. Perfect case

**Definition:** Named URL, MUST + margin filled, warm draft ready, both HITL boxes would be honest, bookable, payable.

**Fixture:** Normand packet + `WARM_DRAFT.md` (LIVE Path A). Closest thing in the estate.

**Dry:** `hunt-log-stats.py` → `total_rows: 0`. Packet MUST all 1 · margin PASS · Send HOLD. Draft boxes unchecked. Baseline TBD. No `I help [ICP] get [numbered outcome]` on the packet. `four-blank-sku.md` missing.

**Spine:** prospect/lead artifacts **sense**; client **blocked** (not in log, stage still qualified); send/book/pay/buyer/pilot **blocked**. Path B/C **n/a**.

**Would movement make sense?** **blocked** — the perfect case is written on disk and invisible to the pipeline.  
**Owner:** Lead Hunter (row) · Consultant (POSITION) · HITL (boxes) · Evens (send).

### 2. Back-and-forth

**Definition:** They reply, object, reschedule, “send the deck”, “what’s the price”.

**Fixture:** Normand HITL path after a hypothetical reply to `info@plomberienormand.ca`. `outbound-playbook-funnel` step 8 names `discovery-spiced-constraint` then `demo-walk-script`. **Neither file exists** in `scripts/hive/grok-skills/`.

**Dry:** Comms can-act RUN; Gmail draft-only in inventory; scenarios still allow a low-risk ack send. Price: packet band $1.5–3.5K; pain $ UNVERIFIED — Money Desk must not invent job $.

**Spine:** Thread would die at **client→send**: no reply-handler skill, no log stage to flip, HITL use list has no Gmail. “Send the deck” has no Path A deck (Path C analog only). Reschedule = `ask-principal` (exists) — **sense** as a hold, not a book.

**Would movement make sense?** **blocked** — draft-only is the rule; the loop has no file.  
**Owner:** Comms (draft) · Consultant (objection) · HITL (cards) · Evens (send).

### 3. Mistake

**Definition:** Wrong ICP tag, A treated as C, tape $ as price, preview = live domain, empty HUNT_LOG, four-blank missing sentence.

**Fixture A:** `catalog-demand-match --need "dental clinic review to book Montreal"` → BUILD first match `private-book-install__local-pro` (keyword `book` before `review`).  
**Fixture B:** empty live `HUNT_LOG` while OPERATOR_FOCUS says Normand qualified.  
**Fixture C:** packet has four blanks but no offer sentence; `four-blank-sku.md` missing.

**Catch?** Partial. Router prose says named URL = Path A. Matcher does **not** catch wrong ICP. Stats do **not** catch a missing row (they report 0 as success). Nothing refuses tape $ unless the string hits KILL_TERMS. `paid-slice` vs `private-book` is skill text only.

**Would movement make sense?** **nonsense** — mistakes look like BUILD.  
**Owner:** Lead Hunter (tag) · Consultant (sentence) · Watchdog (preview≠domain) · Forge (matcher).

### 4. Bad case

**Definition:** Must REFUSE or walk. Kill list + steal never.

| Need (JSON) | Verdict | Should be |
|-------------|---------|-----------|
| `OFM IG farm mass DM` | **REFUSE** | REFUSE |
| `auto-dial plumber leads` | **REFUSE** | REFUSE |
| `I do AI` | **REFUSE** | REFUSE |
| `betting … Polymarket` | **REFUSE** | REFUSE |
| `fork Client Pack SaaS for agency owners` | **RESEARCH** | REFUSE / park |
| `how I make 85K proof page from YouTube RPM` | **RESEARCH** | REFUSE |
| `quote job-loss percentage as FACT…` | **RESEARCH** | REFUSE |
| `mass-DM seduction from Gmail inbox` | **BUILD** `inbox-to-task-routing__us` | REFUSE |

`--format text` on REFUSE **crashes** `KeyError: 'next'` (exit 1) — the never-list path Consultant must run.

**Would movement make sense?** **nonsense** on 4/8.  
**Owner:** Big Boss / Consultant (demand-match first) · Evens (keep/kill).

### 5. Challenging case

**Definition:** Real, hard, legal.

| Fixture | What happens | Mark |
|---------|--------------|------|
| Normand Baseline TBD | pricing-margin allows TBD once; send stays HOLD | **sense** as HOLD · **blocked** to move |
| Path A book, no dated slot | packet: callback-window not consumer Calendly; no slot on file | **blocked** |
| Path C “waitlist page before Stripe” | BUILD `list-anneal__industrial-smb` (`list` ⊂ `waitlist`) | **nonsense** |
| Agency kit vs Client Pack fork | kit row exists; fork → RESEARCH | **nonsense** (should park) |
| `industrial-smb` no packet | Today=50 names, url `—` dropped by stats | **blocked** |

**Would movement make sense?** **blocked** (Normand/industrial) / **nonsense** (waitlist, Client Pack).  
**Owner:** Consultant + Money Desk (baseline) · Product GTM (Path C) · Lead Hunter (list).

### 6. Follow-up

**Definition:** After no-reply, draft-approved-not-sent, book no-show, pay, pilot.

| After | Exists | Missing |
|-------|--------|---------|
| No-reply | Comms take: warm follow-up as **draft**; playbook-before-send | No skill file; no HUNT_LOG stage; no cadence |
| Draft approved, not sent | Second box on `WARM_DRAFT.md` | First box still unchecked — cannot reach this state honestly |
| Book no-show | `ask-principal` (no auto-book) | No no-show SOP / SMS draft skill |
| Pay | Money Desk receipts; invoice-email HITL | No Path A invoice script; Path C Stripe empty |
| Pilot | `proof-30-60-90` **named** in website-offer + steal sheet | **No** `proof-30-60-90.md`; upgrade blocked `Pilot not PASS` |

**Would movement make sense?** **blocked** — follow-up is take prose, not a machine.  
**Owner:** Comms (draft) · HITL (gates) · Money Desk (receipt) · Evens (every hard step).

---

## Commands run

| Command | Exit | One-line result |
|---------|------|-----------------|
| `python3 scripts/hive/hunt-log-stats.py` | 0 | `total_rows: 0`, `last_row: null`, `pipeline_active: 0` |
| `python3 scripts/hive/hunt-log-stats.py --format text` | 0 | `rows=0 ready=0` (text OK; crash is demand-match) |
| `python3 scripts/hive/os/outer-heaven-brief.py --agent "Big Boss" --hunt-stats` | 0 | `OPERATOR_FOCUS: local-pro` · Hunt `rows=0 ready=0` |
| `python3 scripts/hive/product-state.py --can-act "Lead Hunter" clipengine` | 0 | RUN |
| `python3 scripts/hive/product-state.py --can-act "Lead Hunter" operator` | 0 | **IGNORE** — not in `allowed_agents` |
| `python3 scripts/hive/product-state.py --can-act "Consultant" operator` | 0 | RUN |
| `python3 scripts/hive/product-state.py --can-act "Money Desk" operator` | 0 | RUN |
| `python3 scripts/hive/product-state.py --can-act "Communications Manager" operator` | 0 | RUN |
| `python3 scripts/hive/product-state.py --can-act "HITL Operator" operator` | 0 | RUN |
| `catalog-demand-match` plumber after-hours (JSON) | 0 | BUILD `private-book-install__local-pro` |
| `catalog-demand-match --need "I do AI" --format json` | 0 | REFUSE, no `next` key |
| `catalog-demand-match --need "I do AI" --format text` | **1** | `KeyError: 'next'` at line 204 |
| Client Pack / $85K / job-loss (JSON) | 0 | all **RESEARCH** |
| mass-DM seduction Gmail (JSON) | 0 | **BUILD** `inbox-to-task-routing__us` |
| waitlist page before Stripe (JSON) | 0 | **BUILD** `list-anneal__industrial-smb` |
| dental clinic review-to-book (JSON) | 0 | BUILD local-pro book **first**, then clinic review |
| restaurant / law / fitness book needs (JSON) | 0 | BUILD `private-book-install__local-pro` |
| exec-coach / paid-slice / agency kit (JSON) | 0 | **RESEARCH** (rows exist) |
| catalog sample 52 vs 504 (JSON import) | 0 | USE 3 · BUILD 16 · RESEARCH 29 · REFUSE 4 |
| `catalog-lane-upgrade.py --sku-id private-book-install__local-pro__greater-montreal --dry-run` | 1 | `Pilot not PASS (status=none)` |
| `catalog-lanes-sync-check.py` | 0 | OK lanes ↔ catalog |
| `hive-revenue-sensors.py hourly` | 0 | GP 1/3, `ceOpenActions=-1`, no price field |
| `ls` four-blank / lead-web-find / private-book / warm-draft / prospect-must in repo grok-skills | 1 | all **missing**; Grok has warm-draft, lead-web-find, private-book |
| `agent-tool-inventory.py --agent "Communications Manager"` | 0 | use: gmail + twilio + on-demand-calling |
| `agent-tool-inventory.py --agent "HITL Operator"` | 0 | no gmail, no ask-principal; dialer-shaped tools on use |

Did not: send email · Stripe product/charge · Calendly book · `--operator-yes` · `--publish` · live HUNT_LOG append · Grok Bot.

### Re-verify after A/B/C (2026-08-14 evening)

| Command | Exit | One-line result |
|---------|------|-----------------|
| `python3 scripts/hive/hunt-log-stats.py` | 0 | `total_rows: 1`, `qualified: 1`, `pipeline_active: 1`, last_row Normand |
| `python3 scripts/hive/hunt-log-stats.py --format text` | 0 | `rows=1 ready=0` · `qualified: 1` |
| `catalog-demand-match` OFM / auto-dial / I do AI / Client Pack / $85K / job-loss / mass-DM (JSON + text) | 0 | all **REFUSE** + `NEXT:` |
| plumber Montreal book (JSON + text) | 0 | BUILD `private-book-install__local-pro` |
| dental clinic review to book (JSON + text) | 0 | BUILD `review-to-book__local-clinic` |
| restaurant missed call book (JSON + text) | 0 | BUILD `missed-call-book__restaurant` |
| Path C waitlist page before Stripe (JSON + text) | 0 | BUILD `paid-slice__us` |
| fitness coach book install (JSON + text) | 0 | BUILD `private-book-install__owner-coach-fitness` |
| law firm book install (JSON + text) | 0 | BUILD `private-book-install__law-adj` |
| `product-state.py --can-act` Consultant / Money Desk / HITL / Comms / Day Planner `operator` | 0 | all **RUN** |
| `product-state.py --can-act "Lead Hunter" operator` | 0 | **IGNORE** — not in `allowed_agents` |
| `product-state.py --can-act "Lead Hunter" clipengine` | 0 | RUN |
| `grok-hive-tool.py --grok-agent "Day Planner" --list-tools` | 0 | no `n8n_trigger_catalog_webhook` / no `hive_send_report` |
| `ls` four-blank / private-book / warm-draft / ask-principal | 0 | all present under `scripts/hive/grok-skills/` |
| HITL inventory `use` | — | includes `skill.ask-principal` |
| Job cards Load first `takes/` (lead-hunter, consultant, hitl-operator) | — | **missing** on all three |
| `WARM_DRAFT.md` boxes | — | both `[ ]` unchecked |

Did not: send · pay · book · deploy · publish · HUNT_LOG append · commit · check HITL boxes · upgrade catalog.

---

## What would be false in the future if we don’t fix

1. **Any desk that reads `hunt-log-stats` will report an empty pipeline** while Normand is the live hunt — movement looks like “nothing to do.”
2. **Path B list-only rows (`url=—`) never count** even after a real Today append — industrial / mktg-software stay at 0.
3. **`--format text` on REFUSE crashes** — kill-list walks look like tool failure, not REFUSE.
4. **Client Pack / $85K / job-loss stay RESEARCH; mass-DM stays BUILD** — bad cases enter the catalog as work.
5. **`waitlist` routes to `list-anneal`** — Path C pay looks like a Path B hunt.
6. **Most Path A ICPs handshake the plumber SKU** — clinic / restaurant / law / fitness “move” as `local-pro`.
7. **24/35 parent models RESEARCH** — ready SKUs (`paid-slice`, `missed-call-book`, `orchestrated-site-brief`, …) never become BUILD/USE.
8. **413 combinators look like hunts** (no path, thin, cross-ICP) — a future Today could append fake movement.
9. **Lead Hunter cannot `can-act` the operator project** where `OPERATOR_FOCUS` lives — hunt desk and hunt board disagree.
10. **`catalog-lane-upgrade` cannot promote `private-book-install`** (`PILOT.md` missing; README grandfathered ≠ script) — buyer→pilot stays impossible.
11. **Send can still fire** (shared Gmail, restricted-send, ack-reply) while Normand boxes are empty — “draft-only” is prose.
12. **Follow-up / proof / discovery skills are names only** — client→send→book→pilot has no second sitting.

<!-- bug note (≤5 lines): catalog-demand-match.py:90–95 REFUSE return omits `next`; text formatter line 204 KeyError. hunt-log-stats.py:41–42 skips url in {—, -}; live HUNT_LOG header has no stage. KEYWORD_MACHINES lacks paid-slice / missed-call-book / one-channel-deep; "list" matches inside "waitlist". -->

---

## Blocked on Evens

HITL only.

- `WARM_DRAFT.md`: APPROVE DRAFT, then a second sitting for APPROVE SEND. Do not check both. Do not send from this file.
- Whether to add `stage` to the live HUNT_LOG header and append the Normand `qualified` row (this desk did not).
- Owner numbers for Normand Baseline + a single 60-day N. Who signs the homepage CTA (#4/#16 LIKELY).
- Pick one HITL gate string (job card vs doctrine vs routine vs roster).
- Strip Gmail Send / ack-reply / Day Planner `n8n_trigger_catalog_webhook` vs keep “never send” prose.
- Kill-list adds: Client Pack, $85K/RPM, job-loss %, mass-DM/seduction — yes/no.
- Write or refuse missing skills (`four-blank-sku`, repo copies of warm-draft / private-book / lead-web-find, `proof-30-60-90`, discovery/demo). This desk does not write SKILL.md.
- Any Path C Stripe sandbox/live keys, domain, or Calendly on *our* surface.
- Whether Lead Hunter belongs on `operator.allowed_agents` or the hunt moves to `clipengine`.
- Pilot PASS + `--operator-yes` before any catalog upgrade. No upgrade from this test.

---

## Fixes applied

### Lane C (2026-08-14) — movement holes (HITL / Comms / Day Planner / Librarian / skills / golden-path)

Did not send / pay / book / deploy / publish. Did not commit. Did not live-POST webhooks. Did not activate n8n.

- **HITL gate:** one string `ACTION / WHY / AGENT / RISK / REVERSIBILITY` in doctrine, `ask-principal`, HITL job card, HITL routine. Roster APPROVE/EDIT/REJECT maps onto ACTION. Regenerated `grok-agent-routines.json` via `build-grok-agent-routines.py --write`.
- **HITL `use`:** `skill.ask-principal` now in `AGENT_TOOL_INVENTORY.json` (inventory `--write`).
- **Send-removed:** Comms + HITL routines = draft only. No Gmail send, no ack-reply send path, no “restricted send.” First Gmail = read+draft. Shared EXECUTION no longer tells every desk to use every plugin.
- **Day Planner:** `morning-day-plan` has CUT slider, urgent/info/ignore, no-move-meeting. `n8n_trigger_catalog_webhook` + `hive_send_report` denied on the desk (inventory never + `grokbot-agent-roles.py` allowlist). One-pager cron/fields match `daily-operational-digest.json` (`0 8 * * *`; `digest` / `missionsCount` / `goldenPathsCount`). `hive-operator-digest.json` marked MISSING stub.
- **Librarian SSOT:** all 17 job cards Load first → `takes/{slug}.md`. `tape-self-teach`, mission `extra_for`, `hive-spawn-desks`, `wiki-ingest`: Evens skipped merge 2026-08-14; takes stay SSOT; do not merge; do not ask again.
- **New skills:** `interview-gym`, `context-docs` (Career); `one-channel-deep`, `clip-factory` (Publishing owns in skill text); `golden-test-loop` (Watchdog).
- **Golden-path SSOT:** docs + `n8n-catalog.json` path = `hive-golden-path-smoke` (on-disk JSON). Do not POST.
- **Missing workflow JSON:** honest stubs for `error-heal-notify.json`, `creative-pivot-notify.json`, `hive-operator-digest.json`. Import scripts refuse stub/empty and do not activate.

---

## Fixes applied

Lane B only (2026-08-14). Dry / no send / no pay / no book. Did not check `WARM_DRAFT.md` boxes. Did not commit.

1. **HUNT_LOG** — header now includes `stage`. Live Normand row appended: `local-pro` · https://www.plomberienormand.ca/en · MUST PASS · `stage=qualified` · next HITL draft approve · Lead Hunter. `hunt-log-stats.py` must show ≥1 row and `pipeline_active`.
2. **Normand four-blank** — dental-clinic sentence on the packet (`I help … get 1 intake→book … via …`). KPI is one numbered metric (hours-to-first-touch). Baseline TBD/HOLD, form/phone count not invented, UNVERIFIED kept. 60-day rail numbered (1 CTA · 1 alert); booked-call N = HOLD (no owner volume).
3. **Skills on disk** (repo `scripts/hive/grok-skills/`): `four-blank-sku` · `lead-web-find` · `warm-draft-hitl` · `private-book-install` · `discovery-spiced-constraint` · `demo-walk-script` · `proof-30-60-90` · `no-reply-follow-up` · `no-show-follow-up`. When / Steps / Stop / Never. Cursor + Grok only. HITL on send/pay/book.
4. **private-book-install** — Path A: draft slot, HITL book, no auto-Calendly. `icp_id` table: `local-pro` / `local-clinic` / `restaurant` / `law-adj` / `owner-coach-fitness`. Website-offer Path A step 8 wired the same.
5. **warm-draft-hitl** — dual gate, never send, Evens voice, no OF/farm. WARM_DRAFT schema/clarity only; both boxes still unchecked.
6. **Follow-up** — no-reply cadence, no-show SOP, 30-60-90 proof are files, not names. `icp-runbook` (Cursor + Grok) points at HUNT_LOG `stage` + this chain. `outcome-offer-funnel` links `four-blank-sku`.

Still HITL on Evens: APPROVE DRAFT then APPROVE SEND; owner Baseline + booked-call N; who signs the homepage CTA; any real book/pay. Matcher / catalog / Lead Hunter `can-act` were out of lane.

### Lane A (2026-08-14) — catalog-demand-match movement holes

Did not send / pay / book / deploy / publish. Did not commit. Did not upgrade catalog rows.

- `--format text` on REFUSE prints `NEXT:` and exits 0 (no `KeyError: 'next'`).
- Kill list REFUSE: OFM, auto-dial, betting, “I do AI”, Client Pack fork, $85K / YouTube RPM proof, job-loss % as FACT, mass-DM / mass-DM seduction (no OFM required).
- ICP routing: clinic → `review-to-book__local-clinic`; restaurant → `missed-call-book__restaurant`; fitness → `private-book-install__owner-coach-fitness`; law → `private-book-install__law-adj`; plumber stays `private-book-install__local-pro`.
- Path C waitlist / paid-slice → `paid-slice__us` BUILD (not `list-anneal`). Combinator / thin / `lane_id=null` → RESEARCH `catalog-not-operating`, not BUILD a hunt.

---

## Fixes applied (leftovers)

2026-08-14 leftover holes (not HITL-on-Evens). Did not send / pay / book / deploy / publish. Did not commit. Did not check `WARM_DRAFT` boxes. Did not upgrade catalog. Did not append live `HUNT_LOG`.

1. **Lead Hunter can-act operator** — `product-state.py` RUN when `OPERATOR_FOCUS.icp_id` is set (live hunt = that ICP only). IGNORE / NO_ACTION when `icp_id` empty. `clipengine` allowlist unchanged. No second hunt lane. Did not add Lead Hunter to `operator.allowed_agents`.
2. **`hunt-log-stats.py`** — `—` / `-` normalize to empty `url`; row still counted. Fixture `scripts/hive/tests/fixtures/hunt-log-empty-url.md` + `--self-test`. Live log left untouched.
3. **Job cards** — 17/17 `## Load first` starts with `CONTENT/job-cards/takes/{slug}.md`. INDEX: takes stay SSOT; Evens skipped merge 2026-08-14. Did not merge `LESSONS-FROM-TAPE.md`.
4. **`agent-scenarios.py`** — Comms/HITL send-removed; ack-reply replaced with draft-only. Evens sends.

