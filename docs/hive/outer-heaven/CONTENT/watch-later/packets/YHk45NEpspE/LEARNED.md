# LEARNED — YHk45NEpspE
Protocol: deep-video-learning
Status: filled
**Source:** `docs/hive/outer-heaven/CONTENT/watch-later/packets/YHk45NEpspE/full.txt`
**Desks merged:** Researcher 2026-08-14. Librarian not yet. Keep later dissent as labeled rows. Do not flatten.
**ICP:** parked. Tape $ UNVERIFIED. No new `icp_id`.
**Note:** Derived from Researcher A–K + Steal after a full `full.txt` walk. Other desks add labeled rows; do not overwrite dissent.

## A. Source Map
Caption-only (`full.txt`, ~3697 words). Title: the most powerful tool to give Claude Code (Printing Press). Visual/click **UNKNOWN**. Timestamp **UNKNOWN**. Beats: (1) “Go to my Skool, grab wins” — **Skool has no API**; CLI finds 9 wins, picks 3 (Michael/Chris/Fernando). Then 10 recent posts via **school PP CLI** (Printing Press). Claim: ~**260** tokens sent, ~**132k** back, **~2k** into context (rest routed outside the window) — UNVERIFIED. He built the Skool CLI in ~**10 minutes**. (2) Thesis: APIs suck for agents; MCPs suck (tool-list bloat); official CLIs often waste tokens. Printing Press = **CLI factory + library (~50)**. CLI = typed commands, not new. Google GWS CLI “most used in his Claude Code”; GitHub, Playwright, Higgsfield, HeyGen CLIs. (3) Compare: API = raw JSON, pagination/auth pain, built for code. MCP = discovery of many tools but **always-on token tax** (`/context` even unused). CLI = local, fast, composable, SQLite mirror, short clean output, lazy discovery, auth once in the CLI. Bench he cites: MCP **35×** tokens vs CLI; reliability **100% CLI vs 72% MCP** as tasks harden — **UNVERIFIED**. Bottom line: APIs for code, MCP for tools, **CLI for agents**. (4) printingpress.dev, dropped “yesterday.” Inspired by Peter Steinberger / OpenClaw needing better-than-official CLIs (Gog > GWS, people say). Starter pack (ESPN, Flight/Movie/Recipe Goat) + factory. Need **Go**. He pastes three URLs into Claude: install everything. (5) Sites **without** public API: ESPN, Craigslist, Allrecipes (anti-scrape; CLI uses **real Chrome session**), Domino’s, **Skool reverse-engineered**. He also wrapped his YouTube Data API + Tally API as CLIs. Catalog: Amazon, eBay, TikTok shops, Shopify, Airbnb, Contact Goat (LinkedIn + Happenstance + email verify — **he has not tried**). (6) Build demo: Hacker News via factory (no auth); research → Go CLI → dogfood/verify/score; estimate 30–60 min (he says estimates are bad). Auth/cookies/OAuth/API key still live in `.env`; **quotas still apply** (YouTube comment/day). Publish to library or private repo for the team; **never bake keys into the CLI**. (7) Tier: **CLI first → API (then you can wrap a CLI) → MCP last**. Operate-never: scrape/reverse-engineer Skool/LinkedIn/Craigslist; Chrome-session anti-scrape; Contact Goat; install Printing Press; quote 35×/72% as FACT.

## B. Atomic Knowledge

### CLI as the agent I/O: short out, fat off-window
- **Claim:** A CLI can pull 132k tokens of Skool and return ~2k of summary into the session. MCP loads every tool description even unused; API dumps JSON.
- **Reasoning:** Agents pay per token; they want lazy discovery + pre-formatted text.
- **Mechanism:** Local binary + SQLite mirror; skill wraps the command.
- **Evidence:** Skool wins + “none of that hit my context window.”
- **Conditions:** His PP Skool CLI. 260/132k/2k UNVERIFIED.
- **Exceptions:** Official CLIs can still suck (why PP exists). Quotas remain.
- **Action:** Steal “prefer a thin CLI over always-on MCP.” Do not install PP / scrape Skool.
- **Confidence:** high as preference; benches UNVERIFIED.
- **Source:** `YHk45NEpspE` @ UNKNOWN
- **Epistemic:** SOURCE
- **Knowledge type:** declared
- **Modality:** speech
- **Evidence status:** transcript-implied
- **Shown / clicked / sequenced:** UNKNOWN
- **Failed / retried:** unobserved
- **Speech ≠ behavior:** none.

### Factory: no-API sites become a CLI (ugly path)
- **Claim:** PP factory + Go lets Claude reverse-engineer or wrap APIs into a CLI in minutes (Skool ~10 min; HN natural-language build). Chrome session for anti-scrape sites.
- **Reasoning:** Most sites agents want have no clean API.
- **Mechanism:** Research features → generate Go → dogfood → skill; keys in `.env` only.
- **Evidence:** “School, it had to reverse engineer.”
- **Conditions:** Day-old tool. Go pre-req.
- **Exceptions:** Hive: reverse-engineer / scrape / LinkedIn email = operate-never.
- **Action:** Learn the *tier* (CLI>API>MCP). Do not operate the factory on third-party sites.
- **Confidence:** high as his story; 10 min UNVERIFIED.
- **Source:** `YHk45NEpspE` @ UNKNOWN
- **Epistemic:** SOURCE
- **Knowledge type:** declared
- **Modality:** speech
- **Evidence status:** transcript-implied
- **Shown / clicked / sequenced:** UNKNOWN
- **Failed / retried:** unobserved
- **Speech ≠ behavior:** none.

### Keys stay in .env; CLI ≠ quota bypass
- **Claim:** Auth is one-time in the CLI; never commit keys; YouTube-style quotas still bind.
- **Reasoning:** Share the binary/skill, swap the key.
- **Mechanism:** Private repo + `.env`; same as API hygiene.
- **Evidence:** Tally share story; YouTube comment quota aside.
- **Conditions:** Team clone.
- **Exceptions:** Chrome-session CLIs may hold cookies — extra risk he underplays.
- **Action:** Steal key-hygiene. No cookie-CLI.
- **Confidence:** high as rule.
- **Source:** `YHk45NEpspE` @ UNKNOWN
- **Epistemic:** SOURCE
- **Knowledge type:** declared
- **Modality:** speech
- **Evidence status:** transcript-implied
- **Shown / clicked / sequenced:** UNKNOWN
- **Failed / retried:** unobserved
- **Speech ≠ behavior:** none.

## C. Mental Models
MCP won the narrative; CLI wins the meter. Discovery has a tax. Factory > waiting for official APIs (ugly). Time estimates from the model are junk. Catalog will grow. Contact Goat is a demo of capability, not a blessing.

## D. Procedures
1. When an agent must talk to a tool: look for a CLI; else wrap an API; MCP last (his tier).
2. Keep keys in `.env`; never in the binary; quotas still count.
3. Measure tokens in-window vs on-the-wire (`/context`).
4. Hive: do **not** reverse-engineer Skool, scrape Craigslist/Allrecipes, run Contact Goat, or install PP because tape.
5. If sharing a CLI: private repo, teammate brings their key.

## E. Examples
- **Situation:** Skool wins, no API. **Action:** 10-min reverse-engineered CLI. **Outcome:** 3 links that exist. **Lesson:** Capability demo; operate-never for hive.
- **Situation:** 132k Skool payload. **Action:** CLI summarizes to ~2k. **Outcome:** Window stays clean. **Lesson:** Off-window fetch is the point (numbers UNVERIFIED).
- **Situation:** HN factory. **Action:** NL → research → Go CLI → skill test. **Outcome:** 24h top stories. **Lesson:** Easy because no auth — not the hard case.

## F. Decision Rules
- IF MCP is loaded and unused → he calls it waste (`/context`).
- IF no API → he builds a CLI (hive: stop if that means scrape/RE).
- IF sharing → keys out of repo.
- IF quota exists → CLI doesn’t dodge it.
- Refuse: PP install; scrape; Contact Goat; quote 35×/72%/132k as FACT; new ICP.

## G. Contrarian
MCP is the wrong default for agents. Official CLIs can lose to a day-old factory. “Most powerful tool” is a scraper-shaped factory.

## H. Assumptions
35×, 72%, 50 CLIs, 10 min, 132k = **UNVERIFIED**. Day-old product.
**Desk dissent:** Learn CLI>API>MCP. Do not operate reverse-engineer/scrape. Instance-MCP tapes stay a separate row.

## I. Questions
- Primary source for 35× / 72%?
- What did the Skool reverse-engineer actually hit?
- Gog vs GWS — his or “people say”?

## J. Connections
- **SYSTEM SYNTHESIS:** `5p5cV0yVDvQ` (instance MCP — opposite default) · `eRS3CmvrOvA` (Context Mode also fights dump) · `lokbsA5VXOk` (OpenRouter vs native). Skills: `ask-principal` · `golden-test-loop`.

## K. Future-Use
CLI>API>MCP tier. In-window vs wire tokens. Key-in-env. Factory as a *pattern*, not a vendor.

## Stolen machines

### Machine: cli-before-mcp-for-token-io
- **Epistemic:** SOURCE
- **Workflow / loop:** need a tool → search official CLI → else wrap *your* API → MCP last → keep keys in `.env` → measure in-window tokens
- **Questions / signals:** Is MCP sitting unused in `/context`? Is this a no-API site (stop if scrape)? Quota?
- **Qualify / frame / objections:** Short CLI text ≠ bypass ToS. 35× is their bench, not FACT.
- **Procedure:** D.
- **Example that proves it:** Skool 132k→2k story; HN no-auth build; Tally wrap of an API he already had.
- **Why it works:** Agents want lazy, formatted I/O; MCP discovery is a tax.
- **Conditions / exceptions:** Day-old PP. Scrape/RE paths stay operate-never.
- **Operate-never payload:** Printing Press; Skool/LinkedIn/Craigslist scrape; Chrome anti-scrape; Contact Goat; quote 35×/72% as FACT; new ICP.
- **Hive run (existing skills only):** `ask-principal` · `golden-test-loop`
- **Source:** `YHk45NEpspE` @ UNKNOWN

**Operate-never**
- Reverse-engineer / scrape. Install PP. Quote tape benches as FACT. New `icp_id`. Send / pay / deploy.

## THINK / BEHAVE / TRICKS / USE
**Added:** 2026-08-14 last-mile. Caption-only. Visual/click UNKNOWN unless `watch.json`. Do not flatten this speaker into a hive personality.

### THINK
Decision order, what they ask before they build, what they ignore, how they choose tools, when they kill vs continue — see §C Mental Models and §F Decision Rules above. Desk that must think this way: see TAPE-WIRE-NOTES.

### BEHAVE
What they repeatedly check, skip, retry, and speech≠behavior — see §A / §E / speech≠behavior rows. Sequence-from-speech only. `multimodal-youtube-learning`: no invented clicks.

### TRICKS
Do / don’t and implicit shortcuts — see §D Procedures and Stolen machines. Shown system (files, loops, UI, offer, CTA) mapped to Cursor+Grok primitives on the named workflow. Caption-only = transcript-implied / unobserved.

### USE
Each trick lands as a desk **action** on Cursor + Grok Bot (not a quote). Operate-never on their vendors. Reproduce card: `job-cards/takes/_knowledge-use/{{slug}}.md`.
