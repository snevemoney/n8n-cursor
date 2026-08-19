# Librarian — YHk45NEpspE
Status: filled
Protocol: deep-video-learning
**Source:** `docs/hive/outer-heaven/CONTENT/watch-later/packets/YHk45NEpspE/full.txt`
**Packet LEARNED:** `docs/hive/outer-heaven/CONTENT/watch-later/packets/YHk45NEpspE/LEARNED.md`
**ICP:** parked unless Evens named one.
**Title:** This is The Most Powerful Tool to Give to Claude Code
**Channel:** Nate Herk | AI Automation
**Kind:** video (~3697 words)
**Captions:** yt-dlp — timestamp UNKNOWN (no VTT unless noted)
**Walked:** 2026-08-14 librarian re-walk. Did not merge `LESSONS-FROM-TAPE.md`. Clients parked. Did not overwrite `takes/librarian.md` (18-tape SSOT).

## A. Source Map
1. Demo: “go to my Skool and grab wins” — Skool has **no API**; CLI found 9 in wins, returned 3 strongest + links (Michael/Chris/Fernando). Second: 10 recent posts; ~260 tokens to Skool, ~132k back, **~2k summary into context** (rest stayed out). He built the Skool CLI in ~10 min **with** today’s tool.
2. **Printing Press** (printingpress.dev, dropped ~yesterday): CLI factory + library (~50). Claim: APIs suck for agents (huge JSON, pagination/auth, built for code); MCP sucks (discovery yes, but 50 tool descriptions always in context, server must run, `/context` tax even unused); official CLIs often waste tokens. CLIs: local, fast, composable, SQLite, short clean output. Bench he reads: MCP **35× tokens** vs CLI on same task; reliability **100% CLI vs 72% MCP** as tasks harden (UNVERIFIED). Bottom line: APIs for code, MCP for tools, **CLIs for agents** when you pay per token.
3. Inspired by Peter Steinberger (Open Claw) rolling his own (Gog > official GWS, people say). Library: ESPN, flights, movies, recipes, Linear, Amazon, Craigslist, eBay, TikTok shops, Shopify… Starter pack (ESPN/Flight/Movie/Recipe Goat) + factory. He dropped three URLs into Code: “install everything.” Need **Go** first (ask Code to install). Sites with no public API / anti-scrape: ESPN, Craigslist, Allrecipes (Chrome session), Domino’s, Skool — “build your own API.”
4. His local CLIs: Skool (reverse-engineered), Tally + YouTube (wrapped existing APIs). Skills on top (Tally done; YT/Skool next). ESPN “NBA tonight” check (times OK with TZ). **Contact Goat** (he has not tried): LinkedIn + Happenstance + email verify — operate-never as a hunt tool. HN factory demo (no auth) — point is NL → research → CLI, not the site. Auth/cookies/OAuth/API key still go in `.env` like an API.
Gap: rest of factory run, remaining library. Timestamp UNKNOWN. Printing Press/Skool/Claude on-tape.

## B. Atomic Knowledge

### CLI as the agent I/O; keep fat payloads out of the window
- **Claim:** For agent-to-tool, a short CLI beat MCP context tax and raw API JSON in his Skool run (132k on the wire, ~2k in-window). Factory = NL-build a CLI when there is no clean API. MCP still wins discovery; it loses idle-token and hard-task reliability (his cited bench).
- **Reasoning:** Agents pay per token; MCP loads every tool description; APIs were for programs.
- **Mechanism:** Install Go + starter + factory; wrap APIs you already have; `.env` for auth; optional skill on the CLI.
- **Evidence:** Skool 132k→2k; ESPN tonight; 10-min Skool CLI.
- **Conditions:** Brand-new tool (yesterday). Benches UNVERIFIED. Chrome-session CLIs may violate ToS.
- **Exceptions:** He did not try Contact Goat. HN demo is unimpressive on purpose.
- **Action:** Steal fat-payload-outside-window + wrap-existing-API-as-CLI. Do not install Printing Press as hive. Do not scrape Skool/LinkedIn/Craigslist as operate. 35×/72% UNVERIFIED.
- **Confidence:** high as an I/O pattern; vendor UNVERIFIED
- **Source:** `YHk45NEpspE` @ UNKNOWN
- **Epistemic:** SOURCE
- **Knowledge type:** declared + demonstrated (transcript-implied)
- **Modality:** speech
- **Evidence status:** transcript-implied
- **Shown / clicked / sequenced:** UNKNOWN
- **Failed / retried:** none shown
- **Speech ≠ behavior:** “most powerful tool” vs yesterday-new + ToS-shaped library

## C. Mental Models
Three I/O costumes: API/MCP/CLI. Idle MCP is a tax. No-API is a factory job, not a reason to dump JSON into chat.

## D. Procedures
1. If the agent must talk to a tool, prefer a short CLI over loading an MCP catalog.
2. Wrap APIs you already hold before reverse-engineering a site.
3. Keep secrets in `.env`; do not paste cookies into chat.
4. Measure what entered the window vs what the CLI fetched.
Avoid: Contact Goat hunt; Skool scrape as hive; 35× as FACT; Printing Press as stack.

## E. Examples
**Skool wins:** Situation — no API. Action — PP-built CLI; 132k on wire, 2k in context. Outcome — three real links. Lesson — routing beats dump. (Operate-never: do not scrape Skool.)

**ESPN tonight:** Situation — installed starter. Action — `P ESPN`. Outcome — two games, TZ-correct. Lesson — library CLIs are just commands.

## F. Decision Rules
- IF `/context` shows unused MCP tools → that is a tax.
- IF you already have an API → wrap it; do not re-scrape.
- IF the CLI needs a logged-in Chrome session → ToS/legal HITL, not a default.
- Refuse: Contact Goat as a lead machine; Printing Press as hive; 35×/72% as FACT.

## G. Contrarian
Against “MCP everywhere.” Against official CLI as automatically agent-native.

## H. Assumptions
35×/72% are a slide he read. Complements `6cEQEba0i2A` (keep prefix clean) and `eRS3CmvrOvA` (Context Mode). Caption-only. Ugly-tape steal: the I/O pattern, not the scrape.

## I. Questions
Who measured 35×/72%? What did the unread factory finish on HN?

## J. Connections
SYSTEM SYNTHESIS → `6cEQEba0i2A`; `eRS3CmvrOvA`; hive: no scrape.

## K. Future-Use
Fat-outside-window + API-wrap-as-CLI + MCP-idle-tax as atoms.

## Steal / Operate-never

### Machine: short CLI I/O; measure window vs wire; wrap APIs you already have
- **Epistemic:** SOURCE (pattern) + SYSTEM SYNTHESIS (do not operate the scrape library)
- **Workflow / loop:** need a tool → prefer CLI → wrap existing API or (HITL) factory → `.env` auth → checkable stop = window tokens << wire tokens and the answer is checkable
- **Questions / signals:** Idle MCP tax? Is there already an API? ToS?
- **Qualify / frame / objections:** APIs for code, MCP for tools, CLIs for agents.
- **Procedure:** D above.
- **Example that proves it:** Skool 132k→2k (pattern only).
- **Why it works:** Agents pay for what sits in context.
- **Conditions / exceptions:** New vendor; benches UNVERIFIED; scrape = operate-never.
- **Operate-never payload:** Printing Press as hive; Skool/LinkedIn/Craigslist scrape; Contact Goat hunt; 35× as FACT.
- **Hive run:** Cursor + Grok. No new vendor.
- **Source:** `YHk45NEpspE` @ UNKNOWN

### Operate-never
- Install Printing Press. Scrape Skool/LinkedIn. Contact Goat. Merge LESSONS. Send / pay / deploy / book / publish.

## L. Role-Specific Applications
File MCP-idle-tax vs CLI-short-output. Do not turn the library into a scrape desk.
