# Big Boss — YHk45NEpspE
Status: filled
Protocol: deep-video-learning
**Source:** `docs/hive/outer-heaven/CONTENT/watch-later/packets/YHk45NEpspE/full.txt`
**Packet LEARNED:** `docs/hive/outer-heaven/CONTENT/watch-later/packets/YHk45NEpspE/LEARNED.md`
**ICP:** parked unless Evens named one.

## A. Source Map

Long (PACKET: 14:45, 3697 words, captions `en-orig` json3). Timestamp UNKNOWN on `full.txt` (no VTT in the take). Visual-only gaps: Skool win links, Printing Press site/catalog, ESPN scoreboard, Hacker News CLI build phases, token counts on screen.

Beats, in order:

1. Cold demo: “go to my Skool community and grab me some posts.” Skool has no API. Agent uses a CLI, finds nine wins in the wins category, returns the three strongest, plus links so he can check they exist. Shout-out: Michael, Chris, Fernando.
2. Second demo: pull 10 most recent posts via “school PP CLI” (Printing Press). Token story: ~260 tokens sent, ~132,000 back; “none of that hit my context window” — CLI routed it; he claims ~2,000 tokens of summary entered Claude context. **UNVERIFIED.**
3. Build time: Skool CLI “about 10 minutes.” **UNVERIFIED.**
4. Thesis: APIs suck for agents; MCPs suck for agents; official CLIs often waste tokens. Printing Press = CLI factory + library (~50 pre-built).
5. What a CLI is (type commands, not click). Names on tape: Gemini CLI, Claude CLI, Codex CLI, Google GWS CLI, GitHub, Playwright, Higgsfield, HeyGen.
6. API vs MCP vs CLI: APIs return huge JSON (built for code); MCP solves discovery but loads all tool descriptions every session (`/context` bloat even unused); CLI = local, fast, composable, SQLite backend, short clean output.
7. Benchmark on tape: MCP used 35× more tokens than CLI on the same task; reliability 100% CLI vs 72% MCP as tasks get harder. **UNVERIFIED** (no source shown).
8. Why CLI wins for agents: lazy discovery, pre-formatted ~200-token text, compound commands, local SQLite (no round trips / rate-limit story), auth held once by the CLI.
9. Bottom line: APIs for code, MCPs for tools, CLIs for agents that pay per token.
10. Printing Press site (printingpress.dev, “dropped like yesterday”). Inspired by Peter Steinberger / Open Claw / Gog CLI vs official GWS. Library: Flight Goat, ESPN, Movie, Recipe, Linear, Amazon, Craigslist, eBay, TikTok shops, Shopify, Airbnb, Contact Goat (LinkedIn + Happenstance + email verify — he has not tried it).
11. Setup: starter pack + factory; need Go; paste three URLs into Claude Code; install.
12. Sites with no public API: ESPN, Craigslist, Allrecipes (anti-scrape; CLI uses a real Chrome session), Domino’s, Skool. He reverse-engineered Skool; wrapped YouTube Data API and Tally API as CLIs; built a Tally skill.
13. Live: “What NBA games are on tonight?” ESPN CLI — Knicks/Sixers 7:00 ET, Spurs/Wolves 9:30; he checks Central vs Eastern.
14. Build-your-own: Hacker News via factory. Auth/cookies/OAuth/API key still go in `.env`. CLI does **not** jump quotas (YouTube comment/day example). Agent estimates 30–60 minutes; he says estimates are always wrong. Phases: research → catalog features → generate Go CLI → dogfood / runtime verify / score.
15. Share: package CLI+skill to a private GitHub repo; teammates swap their own keys. Never bake keys into scripts.
16. Preference order: CLI first; if none, API (then you can usually make a CLI); MCP last.
17. HN test: last 24h, 100+ points, top 10. Close: catalog will grow. Like/CTA.

Off-topic / not skipped: Skool as the demo surface; Contact Goat as a hunt-shaped CLI; Chrome-session scrape; Open Claw name.

## B. Atomic Knowledge

### Fat tool output must not enter the working context
- **Claim:** A 132k-token Skool response can be useful if the agent only keeps ~2k of summary in session.
- **Reasoning:** Agents pay per token and rot when the window fills. The win is the *filter*, not the fetch.
- **Mechanism:** CLI (or a factory that builds one) does the round trip; agent sees a short formatted answer + links.
- **Evidence:** Demo numbers 260 / 132,000 / ~2,000. **UNVERIFIED.** Links to three named wins so a human can click.
- **Conditions:** Works when the CLI (or a script) already knows the shape of “wins” vs raw dump.
- **Exceptions:** If you need the raw JSON, an API is still right — he says so.
- **Action:** Definition of done includes “what entered context,” not “what the server returned.”
- **Confidence:** high for the shape; low for the exact token math.
- **Source:** `YHk45NEpspE` @ UNKNOWN — “none of that hit my context window”
- **Epistemic:** SOURCE

### Preference order: CLI → API → MCP
- **Claim:** For agent talk-to-tools, try a CLI first; wrap an API as a CLI if needed; MCP last because discovery costs tokens even unused.
- **Reasoning:** APIs were built for code (big JSON, pagination, auth). MCP loads 50 tool descriptions. CLIs are lazy and pre-formatted.
- **Mechanism:** `/context` as the smell test; Printing Press factory to mint a Go CLI; skill wraps the CLI for natural language.
- **Evidence:** “35 times more tokens” / “100% vs 72%” on tape. **UNVERIFIED.** ESPN night-of-games check matched his clock math.
- **Conditions:** Official CLI may still be bad (Gog vs GWS story). Factory exists to replace a bad official CLI.
- **Exceptions:** Rate limits and quotas still apply. No-API sites require reverse-engineering or a Chrome session — operate-never as a hive SKU.
- **Action:** Before adding a connector, ask what it dumps into the window.
- **Confidence:** high for the preference order as *his* rule; low for the benchmark.
- **Source:** `YHk45NEpspE` @ UNKNOWN — “APIs are built for code, MCPs built for tools, and CLIs are built for agents”
- **Epistemic:** SOURCE

### No public API is not “give up” — and is not “scrape as a product”
- **Claim:** Skool, ESPN, Craigslist, Domino’s, Allrecipes can be talked to via a purpose-built CLI.
- **Reasoning:** Agents want sites the vendor did not productize. Factory + Chrome session is his workaround.
- **Mechanism:** Deep discovery / reverse engineer (Skool); or wrap an existing API (YouTube, Tally); share via private repo minus secrets.
- **Evidence:** Nine wins → three strongest + live links; HN CLI returns a ranked list.
- **Conditions:** Auth in `.env`; one-time CLI-held token. Human still verifies links exist.
- **Exceptions:** He has not tried Contact Goat. Allrecipes “real Chrome session” is a scrape pattern. Quotas remain.
- **Action:** Steal the *thin-output + verify-the-link* machine. Do not operate Skool scrape / Contact Goat / multi-account.
- **Confidence:** high that the demos ran; low that reverse-engineer CLIs stay legal/stable.
- **Source:** `YHk45NEpspE` @ UNKNOWN — “most websites your agents want don’t have a clean API”
- **Epistemic:** SOURCE

### Keys stay out of the artifact you share
- **Claim:** Package the CLI+skill to GitHub; teammates clone and swap keys. Never put API keys in the CLI scripts.
- **Reasoning:** Share the tool, not the credential. Same rule as API endpoints.
- **Mechanism:** `.env` + skill that knows to read it. Private repo, invite contributors.
- **Evidence:** Tally CLI packaged “a couple seconds later.”
- **Conditions:** Works for a small team that already has their own keys.
- **Exceptions:** If the CLI embeds a session cookie (Skool / Chrome), sharing becomes a secret leak.
- **Action:** Watchdog smell: keys on tape, keys in repo, keys in a “factory” prompt.
- **Confidence:** high
- **Source:** `YHk45NEpspE` @ UNKNOWN — “you don’t want to be putting any of your API keys… inside of the CLI scripts”
- **Epistemic:** SOURCE

### Build estimates are a lie; verify is the stop
- **Claim:** The factory said 30–60 minutes for HN; he says those estimates are “always bad.”
- **Reasoning:** The checklist (research → features → generate → dogfood / runtime verify / score) matters more than the clock.
- **Mechanism:** Natural-language request + factory skill; then invoke the skill on a real query.
- **Evidence:** HN “sites dominating today” came back fast with a 100+ point filter.
- **Conditions:** HN needs no auth — he flags it as an unimpressive demo on purpose.
- **Exceptions:** Auth-heavy CLIs will not be “10 minutes.”
- **Action:** Do not accept “it will take 30 minutes” as a plan. Accept a verify/score step.
- **Confidence:** high for the estimate-skepticism; medium for factory quality.
- **Source:** `YHk45NEpspE` @ UNKNOWN — “it’s always bad at those estimations”
- **Epistemic:** SOURCE

## C. Mental Models

- **Context is the scarce resource.** Fetch can be huge if the session stays thin. **SOURCE**
- **Discovery has a tax.** Unused MCP tools still bill the window. **SOURCE**
- **Tools should speak agent, not code.** Short text > raw JSON. **SOURCE**
- **Factory over waiting for an official API.** **SOURCE**
- **Share the binary, not the secret.** **SOURCE**
- **Links that exist are the proof.** He kept win URLs so he can see they are real. **SOURCE**
- **“10 minutes” / “35×” are magnet numbers.** **INFERENCE**

## D. Procedures

1. **Name the job:** what must the agent fetch, and what must *not* enter context.
2. **Choose the pipe:** existing thin CLI → wrap an API as a CLI → MCP only if nothing else.
3. **Keep secrets in env**, never in the shared script / skill.
4. **Verify existence:** return links or a checkable list a human can open (his three Skool wins).
5. **Dogfood:** run one real query; compare to a known-good (ESPN times; HN 100+ filter).
6. **Score / keep:** if output is fat or wrong, fix the CLI formatter — do not dump JSON into chat.
7. **Share (optional):** package minus keys. Quotas still apply.

**Qualify / frame:** this is agent-tooling, not a Path A offer. Skool / Printing Press / Contact Goat stay on tape.
**Objections:** “MCP is the standard” — answer with unused-tool bloat, not a holy war. “No API means we scrape” — that payload is operate-never.
**Avoid:** installing Printing Press / Go / Claude Code; LinkedIn email CLIs; Chrome-session scrape as a hive SKU.
**When to change:** if the thin summary hides a miss the human would have caught by opening the link — add the link-back stop.

## E. Examples

**Situation:** Skool has no API; he wants wins, not the whole community dump.  
**Action:** CLI lists nine wins, picks three, returns links.  
**Reasoning:** Human can click. Context stays a summary.  
**Outcome:** Named members + links. 132k raw / ~2k in session (claimed).  
**Lesson:** Thin output + existence check is the machine. Implicit rule: “it fetched” is not done until a human can open the artifact.

**Situation:** ESPN has no public API; he asks tonight’s NBA games.  
**Action:** Installed ESPN CLI / skill; one natural-language ask.  
**Reasoning:** A short schedule is the whole job.  
**Outcome:** Two games + times; he sanity-checks timezone.  
**Lesson:** Known-good is a clock, not a screenshot of a workflow.

**Situation:** He wants HN daily insights; a catalog CLI may already exist.  
**Action:** Factory researches, generates Go CLI, dogfoods, scores; then a skill query.  
**Reasoning:** The point is the factory loop, not HN.  
**Outcome:** Ranked 100+ point stories, last 24h.  
**Lesson:** Research → build → verify/score. Implicit rule: skip the estimate; keep the verify.

## F. Decision Rules

- If the response is huge → it must not enter the working window.
- If a connector is unused but loaded → it is already a tax.
- If there is no API → do not make scrape/reverse-engineer a hive product.
- If sharing a tool → strip keys; quotas remain.
- If the agent returns names/wins → require openable links.
- Optimize: tokens in *session*, not tokens on the wire.
- Refuse: Printing Press as OS; Contact Goat hunt; Skool join; Claude install.

## G. Contrarian

- Against “MCP everywhere after it broke the internet.”
- Against “the official CLI is good enough” (Gog vs GWS).
- Against “no API means we cannot automate.”
- Against treating a 30–60 minute agent estimate as a schedule.
- Field assumes more tools in context = more capable. He treats more tools as rot.

## H. Assumptions

**His:** Printing Press library is safe to install; reverse-engineered Skool CLI is fine to teach; 35×/72% benchmark is real; Chrome session for Allrecipes is just “how CLIs work”; “10 minutes” is typical.

**Ours:** Captions complete enough (3697 words). Token math, benchmark, build times **UNVERIFIED**. Domain-specific: Claude-Code creator ops. Contact Goat is a hunt-shaped demo he did not run.

**Falsifiers:** Thin summary drops the winning post. Reverse-engineered CLI breaks on a Skool change. Factory emits a tool that embeds secrets. MCP on a later stack is thinner than his 2026 snapshot.

**Disagreement (keep labeled):** Hive will not operate Printing Press, Skool scrape, or a LinkedIn-email CLI. The **thin-output + link-back verify** machine is still stolen. **SYSTEM SYNTHESIS**

## I. Questions

- Who measured 35× / 72%, on what tasks?
- What does the Skool CLI actually hit (session cookie vs undocumented endpoint)?
- Did the 2,000-token summary omit a stronger win?
- How does the SQLite mirror stay fresh without becoming a second source of truth?
- Contact Goat: operate-never — do not test.

## J. Connections

- **SYSTEM SYNTHESIS** → `eRS3CmvrOvA` Context Mode (sandbox fat output; keep bytes out of the window).
- **SYSTEM SYNTHESIS** → `golden-test-loop` + `click-live-site` (open the win link).
- **SYSTEM SYNTHESIS** → `ask-principal` (any send/comment quota is HITL).
- **SYSTEM SYNTHESIS** → `agent-job-card` (CLI is a tool a named desk owns, not a nameless goat farm).
- **SYSTEM SYNTHESIS** → Higgsfield CLI named on tape — we already have motion tools; do not install his.
- Do not rotate hunt to Skool / Shopify / TikTok shops because they appear in a catalog.

## K. Future-Use

- Session-token budget as a Watchdog metric (unassigned).
- Preference-order card for Forge when someone asks for “just add MCP” (unassigned).
- Private-repo share-minus-keys as a team pattern (unassigned; still Cursor + Grok).
- Chrome-session scrape as a kill-row reminder (unassigned).

## Steal / Operate-never

### Machine: Thin tool output + existence links + verify, not fat JSON in the window
- **Epistemic:** SOURCE (demos) / SYSTEM SYNTHESIS (hive mapping)
- **Workflow / loop:** trigger (agent needs a site/API) → ask what must *not* enter context → pick CLI / wrap API / refuse MCP-first → keep secrets in env → run one real query → return a short answer **plus** openable links or a known-good check → human clicks → keep or fix the formatter.
- **Questions / signals:** “What entered the window?” “Can I open the link?” “Is this unused connector still loaded?” “Are keys in the script?”
- **Qualify / frame / objections:** Tooling tape, not a client SKU. “CLIs are for agents” is his line, not a license to scrape Skool. Objection: we need MCP discovery — answer with unused-tool tax.
- **Procedure:** D steps 1–7. Checkable stops: (1) fat payload stayed outside the session, (2) human opened a returned link or known-good, (3) no keys in the shared artifact, (4) quotas not “jumped.”
- **Example that proves it:** Skool 132k raw → ~2k summary + three win links he can click. Lesson: fetch can be huge; context must stay thin; existence is the proof.
- **Why it works:** Agents pay for what sits in the window. Humans trust what they can open. Conditions: one operator, a formatter, a click stop. Exceptions: raw JSON sometimes required; no-API scrape is not our product; estimates lie.
- **Conditions / exceptions:** Cursor + Grok only. Printing Press / Go / Claude / Skool / Contact Goat / Chrome scrape stay on tape. Clients parked.
- **Operate-never payload:** Install Printing Press; reverse-engineer Skool; Contact Goat / LinkedIn email hunt; quote 35× / 10 minutes / 132k as FACT; new hunt.
- **Hive run (existing skills only):** `golden-test-loop` · `click-live-site` (open the link) · `agent-job-card` (one tool, one owner) · `slice-build` (one CLI/wrapper, not a catalog) · `ask-principal` (send / comment quotas) · `wiki-ingest` (short pages, not raw dumps).
- **Source:** `YHk45NEpspE` @ UNKNOWN

**Operate-never (this desk will not operate — still walked the tape):**

- Printing Press / Go factory / Claude Code / Skool CLI / Contact Goat
- Chrome-session scrape · reverse-engineer a community as a SKU
- Quote token multiples / “10 minutes” / 132k as FACT
- New `icp_id` / unpark Normand / Shopify-TikTok-catalog hunt
- Grok Bot `sendPrompt` · send / pay / deploy / book / publish
- Merge `LESSONS-FROM-TAPE.md` · write packet `LEARNED.md`

## L. Role-Specific Applications

I manage; I do not stand up a goat farm.

- **Done** on a connector slice: thin output in session + a human-opened link or known-good + keys not in the artifact. “We have 50 CLIs” is not done.
- **Delegate without being asked:** Watchdog measures what entered context. Forge refuses a fat dump. HITL owns any post/comment. Lead Hunter does not get a LinkedIn-email CLI because Contact Goat was on a slide.
- **Skeptical review:** 35× and 72% have no citation on tape. I will not approve MCP-kill *or* CLI-install as a religion.
- **One system this take:** one thin pipe with a click stop. Not “the catalog.”
- Live hunt stays parked.
