---
name: steal-usecases
description: After any video, Watch Later batch, X bookmarks, or dossier, extract stealable ICPs and delivery machines into the one master steal sheet. Thesis-only is not done. Use when Researcher finishes L2 or a bookmark true-read, or when an agent needs a business type or SKU. Cursor plus Grok Bot.
---

# Steal use cases (Researcher + all agents)

**Master sheet:** `docs/hive/outer-heaven/CONTENT/watch-later/STEAL_SHEET.md`  
**Catalog:** `docs/hive/outer-heaven/CONTENT/watch-later/business-types.json`  
**One-person subset:** `one-person-usecases` · `USE_CASES-one-person.md`  
**Whole argument:** `CONTENT/watch-later/DEEP_SUMMARIES.md`  
**Router:** `website-offer-funnel`  
**SKU map:** `usecase-to-sku`

Workflow = funnel. Do not stop at the YouTuber’s or tweeter’s thesis.  
ICPs below are a **hunt catalog**, not new `business-lanes.json` rows. Do not register a lane without operator yes.  
**One catalog.** X bookmarks append the same `STEAL_SHEET.md`. Tag `yt:{id}` or `x:{id}`. Do not fork `x-bookmarks/STEAL_SHEET.md`.

---

## When (Researcher — mandatory)

After L2 transcript / chapters for **each** video or Watch Later item, **or** after an X-bookmark true-read, that names an ICP, numbered offer, or delivery machine.

## Extract steps
1. Read the transcript **or** bookmark cluster. List every **who** (business type) and every **machine** (steps → hard step).
2. For each: `steal_as` slug · Path A/B/C · hive skills · kill/quarantine. Tag `yt:{videoId}` or `x:{tweetId}`.
3. Append to packet `STEAL_SHEET.md` **and** merge into the **one** master sheet + `business-types.json`. Bookmarks = cluster bullets, not one row per tweet.
4. If sellable → add a row on `usecase-to-sku`. Promote new `icp_id` to OPERATOR_MEMORY FACTS.
5. $ / client counts / tweet prices = **UNVERIFIED**. Other AI vendors = on tape only.
6. Hand Consultant / GTM / Lead Hunter the new rows. Do not leave them in chat.
7. If the source has a **doctrine** (economics, role, failure mode) — append `DEEP_SUMMARIES.md` (videos = per-video; bookmarks = clusters). Machines ≠ the whole argument.

## Template (per video)

```markdown
### {N}. {Title} — `yt:{videoId}`
- **Named business / ICP:**
- **Steal as:** `slug` · Path A|B|C
- **Hive run:**
- **Kill / do not:**
```

## Template (bookmark cluster)

```markdown
### {Cluster} — `x:{id}` `x:{id}`
- **Named claim / ICP:**
- **Steal as:** `slug` · Path A|B|C
- **Hive run:**
- **Kill / do not:**
```

---

## When (other agents)

Need a business type or SKU → open the master sheet, pick `icp_id` + `steal_as`, then the router.  
**Run today:** load `CONTENT/icp-runbooks/{icp_id}.md` (skill `icp-runbook`). **Default city:** Greater Montreal. **Log:** `CONTENT/icp-runbooks/HUNT_LOG.md`. Route siblings via INDEX disambiguation. Do not invent a new ICP without Researcher steal + triangle.

---

## Memorize — business types we take (`icp_id`)

| icp_id | Who | Default machine | Path |
|--------|-----|-----------------|------|
| `local-clinic` | Dentists, med-spa, physio, vet | `review-to-book` | A |
| `local-pro` | Plumber, HVAC, salon, home services (trade) | `private-book-install` | A |
| `restaurant` | Independent restaurant | `missed-call-book` | A |
| `exec-coach` | Exec coaches: VP→consulting | `orchestrated-site-brief` | A/C |
| `creator-longform` | Podcasters, YouTubers, course people | `clip-factory` | A or C |
| `agency-delivery` | Agency owners drowning in client delivery | `client-delivery-kit` | A/C |
| `industrial-smb` | Manufacturing, castings, robotics, B2B ops | `list-anneal` → Path A | B→A |
| `mktg-software` | Marketing **software** (not agencies) | `list-anneal` → install on leak | B |
| `owner-coach-fitness` | Fitness / wellness coach with leaky book | `private-book-install` | A |
| `law-adj` | Solo/boutique consult rails | `private-book-install` | A |
| `us` | Evens / hive OS | internal machines | C |

**Kill (never an ICP / do not operate):** OFM / IG farms · betting / prediction markets · “I do AI” shops · generic landing mills · auto-dial factories · auto-book with no callback · tweet-$ swarms · jailbreak/watermark/NSFW · cold postcard mail · game studio this cycle.

**Steal the machine, do not skip the tape.** Farms/OTP/mass-DM stay operate-never. The workflow (many surfaces → one destination, dashboard as proof, parallel workers, redirect panel, speed, close) is fair steal. Evens keeps or kills.

---

## Run — machines we already know how to do

Pick `steal_as`, then follow the hive skills. Hard step (send / pay / book / deploy / publish) = Evens.

| steal_as | Path | Hive run (do this) |
|----------|------|--------------------|
| `review-to-book` | A | `lead-web-find` → MUST → constraint → four-blank → margin → `warm-draft-hitl` → `private-book-install` (thank-you + book link) → `proof-30-60-90` |
| `clip-factory` | C or A | Creative + Publishing: transcript → hooks → cut → captions/thumbs/copy → Evens ships. No Opus/Descript. |
| `orchestrated-site-brief` | C | `session-bootstrap` with ICP / numbered promise / tone / fear / CTA → `slice-build` 3–5 passes |
| `speed-positioning` | A | Researcher competitors → Consultant 3 options → GTM 2-week calendar + Loom |
| `demand-validate` | B | Pre-hunt gate for `us` only — public gigs >$500; then `money-now-pick3`. Not a client ICP. |
| `morning-ceo-desk` | C | `morning-day-plan` — visible → efficient → automatic → then delegate |
| `folder-to-deck` | C | Cursor Agent on one notes folder → one deck/page (`slice-build`) |
| `interview-gym` | C | Career Strategist: stay in character → coach → harder persona |
| `wiki-ingest` | C | `wiki-ingest` — raw → pages → index → log → lint |
| `session-bootstrap` | C | `session-bootstrap` — one dump, then short loops |
| `competitive-teardown` | C or A | Researcher: two channels, same job, score the artifact (not the thesis) |
| `golden-test-loop` | C | Watchdog + Forge: untrusted workers; keep only what a cheap check passes |
| `client-delivery-kit` | A/C | Notes/transcript → interactive deck for *their* clients. Analog of Client Pack. `paid-slice` or `slice-build`. Do **not** fork a SaaS this week. |
| `paid-slice` | C | `paid-slice-funnel` — thin V1, Stripe HITL, preview ≠ domain |
| `interview-to-desk` | C | `interview-to-desk` — triangle, then one TEAM task |
| `context-docs` | C | Write judgment Gmail never captured → Outer Heaven / `wiki-ingest` |
| `ask-principal` | C | `ask-principal` — act → ask Evens → resume; no cards |
| `missed-call-book` | A | Restaurant / local: missed-call → book CTA + HITL. Voice vendor = `ask-principal` only. No auto-book. |
| `playbook-before-send` | A | `outbound-playbook-funnel` — certify playbook before anyone is approved to send |
| `same-day-qa` | A | Score every send/call that day (`outbound-playbook-funnel`) |
| `list-anneal` | B | `list-anneal-funnel` — 50 → 60–70% → exclusions → 3–5 to Path A. Do not MUST-score the raw 50. |
| `slice-build` | C | `slice-build` — bible → plan → one system |
| `checkout-proof` | C | `paid-slice-funnel` — real pay in one sitting; warm network first |
| `one-channel-deep` | C | `outcome-offer-funnel` — one surface, spaced posts, warm net |
| `cinematic-recipe` | C | Big model for taste · 3 loved motion sites · hero = video not fake 3D · `slice-build`. $50k tweet = UNVERIFIED |
| `click-live-site` | C | After every site ship: Watchdog/Forge open the URL and click. Skill: `click-live-site.md`. No “looks good.” |
| `agent-job-card` | C | Librarian: one page per agent (owns / never) before the agent works. Not 8k nodes |
| `motion-pipeline` | C | Creative: still → frames → clip → grade; previs before a long render. Higgsfield/AE we have |
| `private-book-install` | A | Site book CTA on the page they have (Cal/Tally/alert). Not a second Twilio number. PSTN missed-call = `missed-call-book`. `:3007` is proof, not a third machine. |
| `agent-as-hire` | C | `session-bootstrap` → one real SOP (`interview-to-desk`) → review/correct → then connectors. Cursor + Grok. Send/pay/deploy stay HITL. `yt:Ums8suyAG1A` |
| `info-gain-cite` | C | One honest page from work we ran → HITL publish → ask Grok if it cited. `one-channel-deep`. No indexer, no farm. `yt:kpMreA9ATOo` |
| `solo-then-consult` | C | One ICP + leak → MUST/margin → Loom → HITL send → metrics. No agency hire before 3–5 paid Path A. `yt:QIsJe-nZ5XE` |

---

## Never
Quote YouTube $ or tweet $ as ours · operate an IG farm / OTP / mass-DM · auto-dial · betting SKU · skip Path A MUST/margin on a named client · add a `business-lanes.json` row from a YouTube/X ICP without operator yes · fork a second steal sheet under `x-bookmarks/` · quote job-loss % / “replace millions” as FACT · install Claude Code · give Lead Hunter Gmail because Clay was on screen · Indexceptional / rank-everywhere farm · quote 24h first page or “3,700 businesses” as FACT · agency-first · invent hours×$100 pain · Accenture $ as our price · AI-excitement as a MUST gate · skip an ugly tape because Cursor wrote CUT.
