# Watch Later 15 — workflow library

**Purpose:** Understand how these operators run their machines so we can **borrow a piece later** if a lane needs it.  
**Not a build list.** Shelf ≠ adopt. Illegal/ToS rows are documented as systems, not playbooks to run.

**Our stack (non-negotiable):** **Cursor** (build, browser, repo) + **Grok Bot** (17-agent OS, plugins, routines).  
Other products (Claude Cowork, Claude Code, ChatGPT, Gemini, Coda, Codex, Obsidian, Abacus, Vapi, …) appear below only as **what the video used**. Do not install or switch to them. Map the *job* onto Cursor / Grok.

**Labels:** `SHELF` = we might need a piece · `ANALOG` = hive already has a cousin · `SHELF-ONLY` = understand, do not operate

Captions: `transcripts/{id}/full.txt` · Chapters: `CHAPTERS.md`  
**Steal sheet (ICPs + machines we run):** [STEAL_SHEET.md](STEAL_SHEET.md) · `business-types.json` · skill `steal-usecases`  
**Deep summaries (whole argument):** [DEEP_SUMMARIES.md](DEEP_SUMMARIES.md)

---

## Cross-cutting machines (appear in many videos)

| Machine | What it is | Seen in | Hive analog if we ever need it |
|---------|------------|---------|--------------------------------|
| **Session bootstrap** | One long dump (voice or text) at the start of a project; short loops after | Dream Labs, Karpathy, Nate SaaS, Can It Code | New Cursor/Grok thread with problem + done + constraints |
| **Planner / builder / verifier** | One model decides what/why; one writes; one attacks the result | Can It Code, Nate SaaS, Swadia advisory board | Cursor Agent (Forge) plans then implements; Grok Watchdog attacks the result |
| **Wiki ingest** | Raw → wiki pages → index → log → lint → query | Nate Herk, Isenberg/Miller, Zubair “second brain” | Outer Heaven + research-packets |
| **List anneal** | Pull 50 → score → rewrite exclusions → pull again | Mitchell, Glencoco | Lead Hunter briefs |
| **Human-in-the-hard-step** | Agent does research/admin; human speaks, pays, sends, books | Swadia, Zubair, Glencoco, Nate SaaS (Stripe/domain) | HITL Tier 3 |
| **Outcome offer** | One ICP + one number + one proof | One-person co, Nate SaaS naming, Swadia triangle | Consultant four-blank |
| **Capacity without headcount** | Operator at center; agents as the unit of scale | Isenberg, one-person, Karpathy token throughput | 17-agent OS |
| **Distribution factory** | Many surfaces → one conversion URL | OFM (IG farm), Ty (X/IG/School), one-person (one channel deep) | Publishing Engine — **different ethics, same shape** |

---

## 1. Multi-surface traffic factory — Manila AI OFM
**URL:** https://www.youtube.com/watch?v=13eo8dWa1Gw · **Shelf:** `SHELF-ONLY` (ToS / fraud-adjacent)  
**Job:** Many cheap identities → attention → one paid destination.

### How their machine works
1. **Proof surface** — show a payout dashboard (claim, UNVERIFIED).
2. **Device layer** — Device Farm / cloud phones so each identity has a “real” device fingerprint. He says you can stand up ~50 phones.
3. **Identity provision** — automation creates Instagram accounts (~7–8 min each). Inputs: proxy, name, Gmail OTP via Instacaster (~$0.10/code).
4. **Warmup** — follow, view stories, post Reels/stories from the cloud phone (he argues Reels *can* get reach on farmed devices).
5. **Distribution** — follow-automation puts the account in front of people.
6. **Conversion** — chatter bot DMs, voices, jokes; steers to OnlyFans. He still has to add profile pics + fake followers by hand.
7. **Scale** — many VPS panels, many icons per panel.

### What is actually reusable (if a *legal* lane ever needs “many surfaces → one URL”)
- Separate **device / identity / warmup / message / conversion** stages.
- Human still finishes identity (photos, bio) — automation does not do 100%.
- Cost model is per-identity (OTP + device time), not per-post.

### What we are not running
IG OTP farms, fake followers, mass-DM funnels. Documented so we recognize the pattern if it shows up in a client brief or a competitor.

---

## 2. Personal four-agent desk — Sandeep Swadia
**URL:** https://www.youtube.com/watch?v=TL8V41Ea6oM · **Shelf:** `ANALOG` + `SHELF`  
**Job:** CEO desk without hiring an EA.  
**On tape he used:** Claude / ChatGPT / Gemini + Coda schedules + Gmail/calendar connectors + voice.  
**We run it on:** Grok Bot plugins (Gmail, Calendar) + Cursor Agent on a folder.

### Workflow A — Coordination (inbox + calendar)
1. Connect mail/calendar (he: product connectors; **we:** Grok Gmail + Calendar plugins).
2. Run **email pass**: summarize unread, what needs me, what can wait.
3. Run **calendar pass**: meetings, prep, open blocks.
4. When both outputs are trusted, **schedule** the combined run every morning (**we:** Grok Day Planner routine — not Coda).
5. Promotion path: same agent can later propose personal slots — only after trust; HITL books.

**Ramp he insists on:** make work **visible** → **efficient** → **automatic** → **then** hand off judgment.

### Workflow B — Creativity (folder → artifact)
1. Open the notes folder in **Cursor** (he opened Claude Cowork — we don’t).
2. Point the Agent at that folder (notes in, deck/page out).
3. Specify audience, length, format, voice **in the output spec**, not the vibe.
4. Iterate the output, not the whole agent, until intuition forms.

### Workflow C — Clarity / research (telescope + microscope)
1. **Telescope:** Grok Researcher web/packet + “please verify” + “be concise.”
2. **Microscope:** Cursor on the local folder / contracts; cite sources.
3. **Second pass:** Grok brief ↔ Cursor Agent — not a third-vendor “advisory board.”
4. Contract mode: what it says, plain English, why it matters, risks.

### Workflow D — Confidence (interview gym)
1. Stay in character (interviewer) in a **Grok** Career Strategist thread.
2. **Break character** → coach: weak answers, rambles, three better lines.
3. Turn heat up: new persona (startup CEO, etc.) and run again.

**If we need it:** Grok Day Planner = A. Cursor folder-in = B. Grok Researcher + Cursor = C. Grok Career Strategist = D.

---

## 3. LLM wiki (Karpathy pattern) — Nate Herk
**URL:** https://www.youtube.com/watch?v=sboNwYmH3AY · **Shelf:** `ANALOG`  
**Job:** Turn a pile of sources into a queryable project an agent can keep updating.

### Architecture (as he builds it)
```
vault/                    # he used Obsidian + Claude Code — we use Outer Heaven in this repo
  raw/                    # transcripts, clipped articles
  wiki/                   # synthesized pages + relationships
  index                   # how to find things
  log                     # every ingest/update
  instructions            # how the project works (he named claw.md / CLAUDE.md)
```
**On tape:** Obsidian = viewer, Claude Code = worker.  
**We:** markdown in `docs/hive/outer-heaven/` + `~/.grokbot/research-packets/`. Cursor Agent writes. Grok Librarian queries (`outer-heaven-brief.py`).

### Workflow
1. Create / open the canon folder in **Cursor** (not a new Obsidian vault).
2. Dump a batch (he: 36 YouTube transcripts).
3. Prompt: purpose of the project + “be thorough” + keep thoughts related.
4. Agent writes wiki pages (he got ~23), index, log, instructions file.
5. **Ingest loop:** each new video/article → “add this to the wiki” → log grows.
6. **Capture:** save sources into `raw/` from the Cursor browser tab (he used a clipper — we don’t need that app).
7. **Q&A:** ask Grok Librarian / Cursor Agent; they read index + instructions.
8. **Lint:** Grok Librarian routine; agent asks for missing articles if confused.
9. Point **other** Cursor workspaces at the same Outer Heaven paths when they need that brain.
10. RAG vs wiki: wiki for structure; existing hive search when the pile is huge.

**If we need another wiki:** same folder contract inside Outer Heaven. Do not stand up Claude Code or Obsidian.

---

## 4. Prompting 2.0 + competitive teardown — Dream Labs
**URL:** https://www.youtube.com/watch?v=eMPWBunaOic · **Shelf:** `SHELF`  
**Job:** Start a hard project with a 10-minute voice dump; compare two creators with scraped data.

### Karpathy 2.0 (as restated)
1. **When:** new session or new project — not every message.
2. **Declare style first:** “stream of consciousness, voice, ignore typos.”
3. **Voice or a long first message** — he used Whisper/Claude mic; **we** dump in the first Cursor Agent or Grok thread.
4. Dump goals, constraints, taste, what “good” looks like.
5. After that, short prompts. The model already has the world.

### Teardown workflow he ran
1. Pick a comparison channel (Nick Saraev) + own channel.
2. Prompt 1.0 (short) vs 2.0 (10-min voice) on the **same** job: scrape Social Blade / uploads / transcripts, build an interactive journey dashboard.
3. Score the artifact (he: 1.0 messy, 2.0 cleaner, still ~7/10).
4. Read “most repeated lesson” from the other creator’s transcripts.

**If we need it:** new lane or client site — one long first message in **Cursor or Grok**, then build. Competitive teardown = Grok Researcher packet.

---

## 5. Loopy-era operator — Karpathy / No Priors
**URL:** https://www.youtube.com/watch?v=kwSVtQ7dziU · **Shelf:** `SHELF`  
**Job:** Increase **token throughput** and stay out of the loop when verification is cheap.

### How he works (not a tutorial — an operating model)
1. **Verb change:** he does not “code”; he **expresses will** to several harnesses (on tape: Claude Code, Codex, claw-like). **We:** Cursor Agent + Grok Bot fleet.
2. **Fleet:** multiple sessions in parallel, each with instructions (Cursor chats + Grok agents).
3. **AutoResearch pattern:**
   - Define an **easy-to-check** objective (e.g. commit that hits a val-loss).
   - Let untrusted workers propose.
   - Keep the ones that pass the check. No need to watch the work.
4. **Jaggedness handling:** when the agent enters a wrong loop, he still has to break it. Power + frustration coexist.
5. **Ask-when-unsure:** he wants agents that know when to clarify vs when to just implement a half-baked idea. **We:** Grok/Cursor already have “ask until sure” in doctrine.
6. **Curriculum as a skill:** script what the agent should learn/practice next instead of one-off prompts.
7. **Open platform instinct:** Linux-like common layer; capital-heavy labs vs shared harness.
8. **Expensive-sensor domains** (materials, labs): the loop is the same but the verifier is physical equipment (Periodic example).

**If we need it:** jobs with a **golden test** → Cursor Agent loop + Grok Watchdog smokes. No cheap verifier → HITL.

---

## 6. Live SaaS factory — Nate Herk (2h)
**URL:** https://www.youtube.com/watch?v=IVx8OSMbTss · **Shelf:** `SHELF`  
**Job:** Zero idea → paid product on a real domain in one sitting.

### Stack he actually used (on tape)
Claude + Codex orchestrator · GitHub · Vercel · Supabase · Stripe · custom domain vs `*.vercel.app`

### Stack we use
**Cursor Agent (Forge)** builds and verifies · **Grok** (Consultant/GTM) names and copy · GitHub · existing deploy path · Stripe/domain stay HITL

### Workflow
1. **Ideate from pain you know** — agency owners overwhelmed on client delivery.
2. **Name / brand** — literal promise (“Client Pack”); logo variations from **Grok Creative / GTM**.
3. **Orchestrator** — Cursor Agent writes progress back to the repo (session handoff when context fills). He used Codex sub-agents — we use Cursor + Grok handoff, not Codex.
4. **V1 slice** — transcript → interactive deck. Not the whole agency OS.
5. **Auth + waitlist HTML** first, then kill waitlist when checkout works.
6. **Infra** — `.env`, DB, Stripe webhook, host env (never commit keys).
7. **Dual deploy** — preview host works; **custom domain fails** (prod-only bug). Cursor browser smokes both.
8. **Verifier pass** — Cursor Agent + Grok Watchdog find release blockers a human walkthrough missed.
9. **Aha design** — when does the user feel “this is good”? If it takes 3–5 generations, they churn.
10. **Monetize later** — he doubts subscriptions; talks $250–$500 one-shot / community; week-2 = free plan + interviews. He says he might **not** keep Client Pack.

**If we need a new paid surface:** same assembly line in **Cursor + Grok**. Stripe/domain stay HITL.

---

## 7. Agent workforce OS — Greg Isenberg + Allie K. Miller
**URL:** https://www.youtube.com/watch?v=EzQAgnjTq2k · **Shelf:** `SHELF` + `ANALOG`  
**Job:** Run a company as a queryable workforce, not a pile of chats.

### How they describe the machine
1. **Context docs for every contact / client / decision** — Gmail + meeting transcripts are not enough. Uncodified judgment (“this client thinks they need workflows, they actually need X”) must be written down.
2. **Width vs risk** — more tools connected; **tier of risk stays the same** (what the human still owns).
3. **Three employee types** applied to agents: doesn’t finish / finishes / finishes **and** improves the system. Hire the third in the prompt.
4. **Interview-to-workforce** — one prompt: interview the operator, then stand up the desk (they credited new frontier models; **we:** Grok Big Boss intake).
5. **Director + workers** — one agent directs others on a task.
6. **Watcher / diary agent** — only job: watch the workforce, log friction, notice “you keep correcting agent X — give it this file.”
7. **Factory behind one task** — don’t ask “write a lead email”; ask “what is the factory that produces leads every day?”
8. **Skills + wiki** — Allie mentions public skills and a Claude wiki. **We:** `scripts/hive/grok-skills/` + Outer Heaven.
9. **SaaS POV** — mediocre software dies; taste / relationships / being the person who unblocks still sell.

**If we need it:** “interview me, then propose the desk” = **Grok Big Boss**. Watcher = Grok Watchdog. Context docs = OPERATOR_MEMORY + client packets in Cursor.

---

## 8. One-person company OS — There's An AI For That
**URL:** https://www.youtube.com/watch?v=hGdG-04TkDs · **Shelf:** `SHELF`  
**Job:** Replace headcount with directed agents; win on choice, not volume.  
**Steal sheet:** [STEAL_SHEET.md](STEAL_SHEET.md) · [USE_CASES-one-person.md](USE_CASES-one-person.md) · skills `steal-usecases` / `one-person-usecases`

### Use cases on tape (steal the machine, not the $)

| # | On tape | Steal as | Path | Hive run |
|---|---------|----------|------|----------|
| 1 | Dental: reviews → thank-you + book link → referrals. “15 books/mo” | `review-to-book` | A | lead-web-find → MUST → private-book + HITL thank-you |
| 2 | Sarah: long ep → 30 shorts/week, she reviews 45 min | `clip-factory` | C or A | Creative + Publishing; Cursor + Grok, not Opus/Descript |
| 3 | Person B: exec-coach landing, numbered promise, 3–5 passes | `orchestrated-site-brief` | C | session-bootstrap + slice-build |
| 4 | Positioning + content plan same day vs 7-day agency | `speed-positioning` | A | Researcher packet → Consultant 3 options → GTM calendar |
| 5 | Upwork/Fiverr >$500, most jobs, “can AI do 80%?” | `demand-validate` | B | Researcher before `money-now-pick3` |

$3k / $2k / $18k / $20k / $8k vs $3k = **UNVERIFIED**.

### Kill (do not sell)
Basic content packages · generic landing pages · copy-paste admin · “I do AI.”

### His 5-step playbook (method)
1. Narrow problem people already pay for (`demand-validate`).
2. Delivery system; test on self or one pilot.
3. Proof: Loom + screenshot + testimonial.
4. One channel deep.
5. Human edge: trust, taste, judgment — you own the outcome.

**If we need a new offer:** pick a row from the steal sheet, then `website-offer-funnel` router. Dental = Path A. Our clips = Path C. Do not quote his prices.

---

## 9. Founders triangle + TEAM machine — Sandeep Swadia
**URL:** https://www.youtube.com/watch?v=IWdvG9Up8Mc · **Shelf:** `SHELF`  
**Job:** Decide *whether* to start, then automate one slice of the company.

### Decision workflow
1. **Triangle:** domain (years of intuition) · depth (can you go deep) · distribution (can you reach buyers).
2. One green = go. Three green = accelerate. Zero = don’t.

### Operating workflow (TEAM)
- **T** team/ops — how work moves  
- **E** engineering — product  
- **A** admin — finance, legal, billing  
- **M** marketing — reputation, content, case studies  

**This week:** pick **one recurring task** in one letter. Not the whole machine.  
**Moats he names later:** habit, switching cost, proprietary data loops.

**If we need a new lane:** triangle in **Grok** (Researcher + Consultant) → one TEAM letter → one task in **Cursor**.

---

## 10. Voice ops assistant — Zubair Trabzada
**URL:** https://www.youtube.com/watch?v=whIp1SOahOM · **Shelf:** `SHELF`  
**Job:** Phone-capable assistant that can act in the world and still escalate.

### Workflows he demos
**A. Outbound booking**
1. Human: “Jarvis, book 3 at 7.”
2. Agent calls, identifies as assistant.
3. Ambiguity (inside/outside, time full) → **call the human back** → human decides → agent re-dials and closes.
4. Reports when the call ends.

**B. Inbound hotline**
1. Human calls Jarvis’s number.
2. Agent demands a **code** before any data.
3. Wrong/missing code → refuse. Scoped: calendar, email, “second brain” files. **No cards / PII** (baked into the prompt/code).

**C. Desk ops**
- Voice or text.
- “New lead John Doe, quote $2500” → writes a leads table.
- Classroom CTA for the prompt (ignore the CTA; keep the state machine).

**State machine worth keeping:** `act → if unsure, ask principal → resume → never touch money/PII`.

**If we need voice:** same state machine on **Grok Bot** (ask principal, no PII). Do not stand up a second voice vendor.

---

## 11. Outbound sales system — Glencoco
**URL:** https://www.youtube.com/watch?v=nS2FrgXN-EY · **Shelf:** `SHELF`  
**Job:** Make an average rep sound like year-five on day three. AI is around the call, not instead of it.

### Factory
1. **Knowledge ingest** — PDFs, videos, competitors, ICP, objections, case studies → training modules.
2. **Certification gate** — AI writes the course; **humans are not approved to dial** until they pass.
3. **Playbook Studio** — intro, pitch, downsell, qualify, top 5–7 objections, expansion riffs, question bank. Top reps/managers edit. Reuse playbooks from similar offers in their marketplace.
4. **List** — they used Claude; **we:** Grok Lead Hunter + Cursor scripts. Enrich if needed. Export CSV. Same playbook works without their enrich vendor.
5. **Personalization** — triggers on the account so the call can branch.
6. **During the day** — **fast between calls** (CRM, email, disposition), **slow with the prospect**.
7. **Same-day QA** — Clozd-style scores on every call; coach leaves notes on the call page that day, not 500 dials later.
8. **One rep, many companies** — playbook swap is the product.

**If we need outbound for websites:** steps 1–3 + 6–7 in **Grok** (playbook) + **Cursor** (list files). Dialer optional. Send stays HITL.

---

## 12. Incremental game production — Can It Code?
**URL:** https://www.youtube.com/watch?v=mjg_JUMar04 · **Shelf:** `SHELF`  
**Job:** Ship a Godot prototype without one-shotting the game.

### Role split (he named four vendor models — we keep the *jobs*)
| Job | He used | We use |
|-----|---------|--------|
| Hard calls — what/why; plans | Fable 5 | Cursor Agent (plan turn) or Grok Consultant |
| Mechanics / implementation | Opus 5 | Cursor Agent (Forge) |
| Concepts / images | GPT 5.6 | Grok Creative Studio |
| Support | Soul / Kimik | same two surfaces — no extra model shop |

### Workflow
1. Reference a feeling (not a copy) → **color bible** (daylight → night translation). Nothing enters without it.
2. Best model writes the **plan**; implementer writes the **system**.
3. One system at a time: height field → walk/run in deep vs thin snow → footprints as **one texture**, not a list (1,000 tracks = cost of 1).
4. Placeholders first (box house). Light does the heavy lift. Don’t ask for realistic meshes.
5. Character: concept pass → simpler rigged mesh → fix in-engine.
6. Lighting presets (flat, nightfall, blizzard, sunrise) before more content.
7. Enemies as a thin prototype (warn → charge). Interior = same scene, not a load.

**If we need Godot or a cinematic site:** bible → plan → one system → placeholders → light, all in **Cursor + Grok Creative**. Same as website: brief → one page → rest.

---

## 13. Lead-list factory — Mitchell Keller
**URL:** https://www.youtube.com/watch?v=ESIxitOLYoQ · **Shelf:** `SHELF`  
**Job:** Perfect-fit accounts from a coding agent, getting sharper every run.  
**On tape:** Claude Code + Disco-like CLI. **We:** Cursor Agent + Grok Lead Hunter.

### Pipeline
1. **Campaign brief** (who + why).
2. **Disco-like CLI** — pull a first 50 (example: robotics).
3. **Score** — great / marginal / borderline. Target **60–70%** “great” (too high = you killed valid companies; too low = noise).
4. **Anneal** — agent proposes exclusion/inclusion changes; you accept; run again. He did **45 prompt tests** on one system.
5. **Nuance** — “software” leaks agencies. Don’t exclude “marketing” if you want marketing **software**. Use funding, model, size.
6. **People** — after companies, find contacts (growth/head of growth, etc.).
7. **Enrich** — AI overview / AI mode; Clay only when you need ClayGen/custom snippets (Brandon Charleston Clay CLI).
8. **Three-tier pull** — more leads at the top, tighter as you go.
9. **Handoff** — append “target market” line; export. V2 he describes: Matica-style project board so the brief rides the pipeline.
10. **API keys as CLI args** — don’t hardcode.

**If we need lists:** brief → 50 → score → anneal → people in **Grok + Cursor**. Keep the percentages and the agency-leak lesson. Do not install his Claude Code course/CLI.

---

## 14. 10-hour paid-MVP sprint — Ty Chen
**URL:** https://www.youtube.com/watch?v=I7mpF7_pnPM · **Shelf:** `SHELF` (method) / `SHELF-ONLY` (betting SKU)  
**Job:** Strangers pay today — not a waitlist.

### Workflow
1. Constraint: laptop + one operator surface + **real checkout**.
2. Pick a product he already understands (prediction-market helper / daily picks — **not a hive lane**).
3. He used **Abacus** to generate a Stripe site. **We:** Cursor Agent builds the site.
4. Domain + DNS (GoDaddy wait), deploy when records propagate.
5. Use the product himself (temperature bet) so the loop is real.
6. **Distribution test, not spray:**
   - Hold X posts ~3h apart (his experience: algorithm punishes stacks).
   - Short post + URL in comments (pattern he copies).
   - School/community + IG reel as extras.
7. **Read the receipts:** most clicks from X; IG ~400 views flop; at least one payer from a **warm business contact** who already trades those markets.

**If we need a 10-hour offer test:** Cursor builds + Grok drafts distribution + real checkout + warm network. Ignore the SKU and the “strangers in 10 hours” myth until receipts exist.

---

## 15. Stateless MCP (protocol) — Better Stack
**URL:** https://www.youtube.com/watch?v=f4mI3d-nTrI · **Shelf:** `SHELF` (when we touch MCP)

### Old machine
Initialize handshake → session ID → sticky pod or Redis. Pod death → `400 session not found`. Server could push “are you sure?” down an open stream (surprise prompt = UX + security smell).

### New machine (as of the video)
1. Tool call = **one HTTP request** with everything inside.
2. Headers `MCP-Method` / `MCP-Name` for gateways/WAF/rate limits.
3. Client caps ride in JSON `meta`; `server/discover` is optional.
4. If you want state, you **echo request state** so any instance can resume.
5. Long tools don’t hold the conversation open.
6. SDKs major-bump to v2; **≥12 months** deprecation.

**If we need it:** read current spec, then migrate. Not a this-week rewrite.

---

## How to use this library later

When a lane needs a capability, pick a **row**, not a YouTuber:

| We need… | Skill (`/` or Cursor hive-funnels) | First slice |
|----------|-----------------------------------|-------------|
| Morning desk | `morning-day-plan` | Email+calendar digest, draft-only |
| New project kickoff | `session-bootstrap` | One voice/text dump |
| Memory that compounds | `wiki-ingest` | raw/wiki/index/log + OPERATOR_MEMORY |
| Cheap-to-check research | `session-bootstrap` + Watchdog | Golden test + loop |
| Paid surface | `paid-slice-funnel` | Slice + Stripe HITL + domain smoke |
| Offer language | `outcome-offer-funnel` | One ICP sentence |
| Voice in the world | `ask-principal` | Ask Evens, no PII |
| Outbound | `outbound-playbook-funnel` | Playbook + same-day review |
| Lists | `list-anneal-funnel` | 50 → 60–70% → exclusions |
| Godot / cinematic | `slice-build` | Bible → one system |
| Website funnel | `website-offer-funnel` | **Router:** A client (MUST→margin→private-book) / B list 50→3–5 / C our surface |
| New lane / desk | `interview-to-desk` | Triangle → one task |
| Many legal surfaces | OFM *shape only* | Separate identity/warmup/message — **no farms** |
| MCP server | Better Stack | Stateless HTTP |

Full timestamps: `CHAPTERS.md`. Playlist remainder: **1788 unread** (batch 1 = videos 1–15).

---

## Coverage state (batch 1)

| Metric | Value |
|--------|-------|
| Processed | **15** / ~1803 claimed |
| Next offset | **15** (batch 2 starts at row 16 in DOM order) |
| Transcripts | `~/.grokbot/research-packets/watchlater-15-20260813/transcripts/` |
| Processed IDs | `processed-video-ids.json` |
| Ledger | `ITEMS_LEDGER.md` |

Batch 1 is **understood at L2** (full auto-captions + chapters + workflow maps). Shelf ≠ adopt.

---

## Scrape playbook (native browser — ready when asked)

**MCP:** `cursor-ide-browser` (Glass browser). **Not** Playwright. **Not** Chrome cookie CLI.

### Preconditions
- YouTube tab on `https://www.youtube.com/playlist?list=WL`, logged in as Snevemoney
- Cursor Settings → Browser Automation → **Browser Tab**, Connected
- Tab attached to the Agent chat (or agent opens it via `browser_navigate`)

### Agent steps (copy this runbook)
1. **`browser_tabs`** `{ action: "list" }` — find `playlist?list=WL` viewId
2. **`browser_lock`** `{ action: "lock", viewId }` — take control
3. Edit **`scripts/hive/os/fixtures/watch-later-browser-scrape.js`**:
   - `OFFSET` = value from `processed-video-ids.json` → `next_offset` (currently **15**)
   - `LIMIT` = batch size (default **15**)
   - `SCROLL_PASSES` = **3–5** if DOM row count &lt; OFFSET + LIMIT
4. **`browser_cdp`** `{ method: "Runtime.evaluate", params: { expression: <file contents>, returnByValue: true }, viewId }`
5. Save result JSON → `/tmp/watch-later-batch-NNN.json`
6. **`browser_lock`** `{ action: "unlock", viewId }`
7. Normalize + write:
   ```bash
   python3 scripts/hive/scrape-youtube-watch-later.py \
     --from-json /tmp/watch-later-batch-NNN.json \
     --write-dir docs/hive/outer-heaven/CONTENT/watch-later
   ```
8. Research pass (when asked):
   ```bash
   python3 scripts/hive/researcher-research-implement.py watchlater \
     --from-json /tmp/watch-later-batch-NNN.json --write --mirror-repo
   ```
9. Append new workflow sections to this file; bump `processed-video-ids.json` + `coverage.json`

### Never
- Invent videos when `loggedIn: false`
- Use `yt-dlp --cookies-from-browser chrome` (operator preference)
- Treat 15 rows as the full 1803 queue

### Operator one-liner
> “Scrape next 15” or “Scrape Watch Later offset 15”

---

## Post-scrape pipeline (Researcher, skills unchanged)

```
browser CDP scrape → scrape-youtube-watch-later.py --write-dir
                  → yt-dlp json3 captions (per videoId)
                  → CHAPTERS.md + WORKFLOWS.md section per video
                  → FINDINGS.md + learnings-implement.md (durable only)
                  → OPERATOR_MEMORY LESSONS (quarantine ToS / income claims)
```

Transcript path fix: `hive-web-research.py` uses yt-dlp **json3 to temp file** (not stdout).

---

## Composite recipes (mix machines without adopting stacks)

These are **design patterns** extracted from batch 1 — combine rows when a lane needs more than one machine.

| Recipe | Machines combined | Example use in hive |
|--------|-------------------|-------------------|
| **Morning CEO desk** | Swadia A + Isenberg context docs | Day Planner digest + OPERATOR_MEMORY delta |
| **New lane kickoff** | Prompting 2.0 + triangle + one-person offer | Consultant four-blank before any build |
| **Compounding brain** | Nate wiki + Karpathy curriculum-as-skill | Outer Heaven ingest + agent skill updates |
| **Ship paid slice** | Nate SaaS factory + Can It Code slice + Watchdog | Preview URL ≠ custom domain smoke |
| **Research at scale** | Karpathy AutoResearch + Mitchell anneal | Golden test loop on list scoring |
| **Voice in the wild** | Zubair state machine + Swadia HITL ramp | Ask principal; visible→automatic before delegate |
| **Outbound without dialer** | Glencoco 1–3 + Mitchell lists | Playbook + scored list; human sends |
| **10-hour offer test** | Ty checkout + one-person one channel | Real pay + warm network; ignore SKU |
| **Creative increment** | Can It Code bible + Dream Labs bootstrap | Color/motion bible before Forge builds |
| **Legal multi-surface** | OFM *stage shape* + Publishing Engine | Identity/warmup/message separated — **no farms** |

---

## Tool & vendor index (batch 1)

Transcript names → **job** → **our surface**. Do not install the left column.

| On tape | Videos | Job | We use |
|---------|--------|-----|--------|
| Claude / Claude Code / Cowork | Swadia, Nate, Mitchell, Glencoco, Dream Labs | Build, wiki, lists, playbooks | Cursor Agent + Grok Bot |
| Codex | Nate SaaS | Orchestrator / verifier | Cursor Agent + Grok Watchdog |
| ChatGPT / Gemini | Swadia advisory board | Cross-check | Grok Researcher ↔ Cursor Agent |
| Coda schedules | Swadia | Recurring agent runs | Grok Day Planner routines |
| Obsidian + Web Clipper | Nate wiki | Viewer + raw capture | Outer Heaven + Cursor browser |
| Supabase / Stripe / Vercel | Nate SaaS, Ty | Auth, pay, deploy | Existing deploy path; Stripe HITL |
| Device Farm / Instacaster | OFM | Identity farm | **SHELF-ONLY — do not run** |
| n8n / Vapi / Twilio | Zubair | Voice + workflow | Grok Bot state machine (no second voice vendor) |
| Abacus / Chaten | Ty | Site gen + Stripe embed | Cursor Agent |
| Disco-like CLI / Clay | Mitchell | List pull + enrich | Grok Lead Hunter + Cursor scripts |
| Godot + Fable/Opus/GPT | Can It Code | Plan vs implement vs concept | Cursor plan/Forge + Grok Creative |
| MCP HTTP (stateless) | Better Stack | Protocol note | Forge when we touch MCP |
| Social Blade | Dream Labs | Competitive scrape input | Grok Researcher packet |

---

## Anti-patterns (seen in batch 1 — recognize, don’t copy)

| Anti-pattern | Where | Why it fails |
|--------------|-------|--------------|
| One-shot the whole game/app | Can It Code | Cost explosion, no iterability |
| Automate before visible/efficient | Swadia | Agents amplify bad process |
| Second wiki app (Obsidian / Claude Code) for hive canon | Nate wiki | Outer Heaven + Cursor + Grok Librarian already is the wiki |
| Preview works = prod works | Nate SaaS | Custom domain / env bugs hide |
| 500 agents = company | Isenberg | Theater; no queryable context |
| “I do AI” positioning | One-person co | Commodity; need numbered outcome |
| Strangers pay in 10h without warm net | Ty | Receipts showed warm contact converted |
| Auto-dial / auto-book without playbook | Glencoco/Zubair | HITL on hard step |
| IG OTP / fake follower farms | OFM | ToS + fraud-adjacent — **quarantine** |
| Income dashboards as proof | OFM, Ty, Nate | UNVERIFIED — shelf only |
| Course/community CTA as the product | Dream Labs, Zubair, Mitchell | Strip CTA; keep method |
| MCP rewrite before reading spec | Better Stack | 12mo deprecation — read first |

---

## Hive agent routing (expanded)

| Agent | Workflows to pull from | Default slice |
|-------|------------------------|---------------|
| **Big Boss** | Isenberg interview-to-workforce, Swadia triangle | Lane intake + desk proposal |
| **Librarian** | Nate wiki, Isenberg context docs | ingest / DON'TS / canon |
| **Researcher** | Dream Labs teardown, Mitchell anneal, Karpathy AutoResearch | packets + verify |
| **Forge** | Nate SaaS, Can It Code, Mitchell anneal | one system per session |
| **Creative Studio** | Can It Code bible | color/motion before assets |
| **Lead Hunter** | Mitchell, Glencoco lists | 50 → score → anneal |
| **HITL Operator** | Zubair, Swadia ramp, Glencoco certify | human on speak/pay/send |
| **Comms Manager** | Swadia A, Glencoco fast-admin | drafts only until Tier 3 |
| **Watchdog** | Nate domain bug, Karpathy verifier | preview ≠ prod smokes |
| **Product GTM** | One-person offer, Ty distribution | one ICP sentence |
| **Consultant** | Triangle, one-person steps 2–5 | four-blank before build |
| **Publishing Engine** | Ty spacing, one-person channel depth | HITL post pick |
| **Money Desk** | Nate monetize-later, Ty receipts | UNVERIFIED income quarantine |
| **Day Planner** | Swadia coordination A | morning packet |
| **Researcher** (Grok) | Karpathy throughput | golden-test loops |

---

## Workflow depth tiers

When asked to “understand” a video, target a tier — not every video needs L3.

| Tier | Done when | Batch 1 status |
|------|-----------|----------------|
| **L0** | Title + channel in ledger | ✓ all 15 |
| **L1** | Metadata + theme classify | ✓ all 15 |
| **L2** | Full transcript + chapters | ✓ all 15 |
| **L3** | Workflow map in this file (how the machine runs) | ✓ all 15 |
| **L4** | Means-for-Evens + implement into doctrine | ✓ batch 1 (see FINDINGS) |
| **L5** | Grok reprovision / live workflow change | ✗ not run (gateway) |

---

## Batch 2 checklist (when operator says “scrape next 15”)

- [ ] Confirm Watch Later tab open + logged in
- [ ] Set `OFFSET=15`, `LIMIT=15` in browser scrape snippet
- [ ] Run CDP scrape → `/tmp/watch-later-batch-002.json`
- [ ] `scrape-youtube-watch-later.py --from-json … --write-dir …`
- [ ] Skip IDs already in `processed-video-ids.json`
- [ ] yt-dlp json3 transcripts → new packet dir `watchlater-15-20260814` (or batch-002)
- [ ] Add sections **16–30** below (same template as §1–15)
- [ ] Update cross-cutting machines table if new patterns appear
- [ ] Update composite recipes + tool index
- [ ] Bump `next_offset` to **30**

---

## Section template (for batch 2+ videos)

```markdown
## N. {Short name} — {Channel}
**URL:** … · **Shelf:** `SHELF` | `ANALOG` | `SHELF-ONLY`
**Job:** one sentence — what outcome the operator sells.  
**On tape / we use:** vendor they named → Cursor + Grok mapping.

### How their machine works
1. …

### Tools named (on tape only)
- …

### What is reusable (if a legal lane needs it)
- …

### What we are not running
- …

**If we need it:** hive agent + first slice
```
