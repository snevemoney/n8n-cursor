# Communications Manager — YHk45NEpspE
Status: filled
Protocol: deep-video-learning
**Source:** `docs/hive/outer-heaven/CONTENT/watch-later/packets/YHk45NEpspE/full.txt`
**Packet LEARNED:** `docs/hive/outer-heaven/CONTENT/watch-later/packets/YHk45NEpspE/LEARNED.md`
**ICP:** parked unless Evens named one.

## A. Source Map
**Title (PACKET):** This is The Most Powerful Tool to Give to Claude Code
**Speaker / channel:** Nate Herk | AI Automation
**Kind:** tutorial · 3697 words · captions in `full.txt` only · timestamps **UNKNOWN** (no VTT used).
**Gaps:** Caption ingest; ASR errors possible (Naden/Nitn = n8n). Visual UI not fully narrated. Timestamps UNKNOWN.

Beats, in order:
- Claude Code: ‘go to my School community and grab posts’ — School has no API. CLI found nine wins, picked three strongest (Michael, Chris, Fernando). Second ask: 10 recent posts via School PP CLI. ~260 tokens out / ~132k back — none hit the context window; ~2k of summary did. School CLI built in ~10 min.
- Printing Press (printingpress.dev, dropped ~yesterday): CLI factory + library (~50 prebuilt). Thesis: APIs suck for agents; MCPs suck; official CLIs often waste tokens. CLI = type commands not click. Examples: Gemini/Claude/Codex/GWS/GitHub/Playwright/Higgsfield/HeyGen CLIs. GWS is his most-used in Code.
- API = raw JSON, built for code, pagination/auth pain, but more token-efficient than a loaded MCP. MCP = discovery of many tools + descriptions always in context even unused (/context shows the bloat; server must stay up). CLI = local, fast, composable, SQLite backend, agent-native, short clean output. Claim: MCP used 35× more tokens than CLI on the same task; reliability 100% CLI vs 72% MCP as tasks harden — UNVERIFIED.
- Bottom line: APIs for code, MCPs for tools, CLIs for agents (pay-per-token / session limits). Lazy discovery, ~200 tokens of clean text, compound commands, local SQLite = no round trip / no rate limit (local), auth once in the CLI.
- Inspired by Peter Steinberger (OpenClaw) rolling his own (Gog CLI better than official GWS — on-tape claim). Library: Flight/ESPN/Movie/Recipe goats, Linear, Amazon, Craigslist, eBay, TikTok shops, Shopify, Airbnb, Contact Goat (LinkedIn + Happenstance + email verify — he hasn’t tried). Starter pack + factory. Needs Go. He dropped three URLs into Code: install everything.
- Sites with no clean API: ESPN, Craigslist, Allrecipes (anti-scrape; CLI uses a real Chrome session), Domino’s, School (reverse-engineered). He also wrapped YouTube Data API and Tally API as CLIs. Catalog skill lists local + available. NBA games via P ESPN — times matched (CT vs ET).
- Build your own: natural language + factory; HN example (no auth). If cookies/OAuth/key → .env like an API. Quotas still apply (YouTube comment/day). Time estimates are bad (30–60 min claimed). Publish to the library or private repo for the team; never bake keys into the script. Tier: CLI first; else API (then you can wrap a CLI); MCP last. HN skill test: last 24h, 100+ points, 10 stories.

## B. Atomic Knowledge

### CLIs are for agents; MCPs tax the window even when idle
- **Claim:** A loaded MCP’s tool list sits in context every session. A CLI returns a short answer; 132k tokens can stay outside the window.
- **Reasoning:** Agents pay per token. APIs were built for code. Discovery is MCP’s gift and its cost.
- **Mechanism:** Prefer a CLI (or wrap an API as one). Keep auth in .env. Don’t expect quotas to vanish.
- **Evidence:** School 132k→2k; 35× / 72% claim; /context bloat.
- **Conditions:** You are in a token-metered agent harness.
- **Exceptions:** 35×/72%/10 min UNVERIFIED. Printing Press / Go / Chrome-session scrape is operate-never. Contact Goat = hunt-shaped.
- **Action:** Steal: don’t load unused tool catalogs; keep secrets out of scripts. Do not install PP as ours.
- **Confidence:** high as thesis; benches UNVERIFIED
- **Source:** `YHk45NEpspE` @ UNKNOWN
- **Epistemic:** SOURCE

### No-API surfaces get reverse-engineered CLIs — that’s a never for School/mail
- **Claim:** School had no API; the factory reverse-engineered endpoints in ~10 min. Allrecipes uses a real Chrome session.
- **Reasoning:** Most sites agents want don’t have a clean API. That’s the pitch and the risk.
- **Mechanism:** If we need a host, use an official API or stay out. Never a cookie CLI that posts to School or Gmail.
- **Evidence:** Nine wins pulled; Tally/YouTube wraps.
- **Conditions:** A site without an API.
- **Exceptions:** Reverse-engineer + Chrome session on a community or inbox is never.
- **Action:** Do not build a School/Gmail CLI. Do not run Contact Goat.
- **Confidence:** high
- **Source:** `YHk45NEpspE` @ UNKNOWN
- **Epistemic:** SOURCE


## C. Mental Models
- CLI first, API second, MCP last. **SOURCE**
- Share the CLI, swap the key — never ship the key. **SOURCE**
- Model time estimates are bad. **SOURCE**

## D. Procedures
- If /context is fat from unused MCPs → that’s the tax. **SOURCE**
- If it needs auth → .env, not the script. **SOURCE**
- This desk: no PP install, no School scrape, no Contact Goat. **SYSTEM SYNTHESIS**

## E. Examples
- **Situation:** School has no API; he wants wins. → **Action:** 10-min reverse-engineered CLI; 132k off-window. → **Reasoning:** CLI for agents. → **Outcome:** Three win links. → **Lesson:** Token routing ≠ permission to scrape a community. Implicit rule: quotas still apply.

## F. Decision Rules
- If the MCP isn’t invoked → you’re still paying its catalog.
- If there’s no API → he builds a CLI; we don’t scrape School.
- If sharing with a team → private repo, keys stay local.
- Refuse: 35×/72% as FACT. Printing Press as ours. Contact Goat. Chrome-session scrape.
- Optimize: short tool output, secrets in .env.

## G. Contrarian
- Field stuffed MCP into every agent. He says CLI is the agent-native tier. **SOURCE**

## H. Assumptions
- 35×/72% is a ‘real benchmark’ with no paper. Day-one tool. Falsifier: a CLI that dumps 132k into context anyway.

## I. Questions
- What unused catalogs are we loading in Cursor that tax a letter thread?

## J. Connections
- **SYSTEM SYNTHESIS:** `6cEQEba0i2A` (cache). `5p5cV0yVDvQ` (MCP). `zyvdl__Ywfk` (Clay — later).

## K. Future-Use
- CLI-vs-MCP token tax as an ops note. Contact Goat as a hunt-never.

## Steal / Operate-never

### Machine: Don’t load idle tool catalogs; never reverse-engineer School/Gmail; never run Contact Goat
- **Epistemic:** SOURCE + SYSTEM SYNTHESIS
- **Workflow / loop:** Need a host → official API or don’t → if a CLI is mentioned, keep keys in .env → Evens → stop. No scrape. No send.
- **Questions / signals:** Is this MCP bloat or a scrape? Contact Goat? Keys in the script?
- **Qualify / frame / objections:** Qualify: CLI-for-agents vs scrape-the-community. Frame: token hygiene. Objection: ‘School has no API so CLI it’ → we do not operate that.
- **Procedure:** 1) No PP. 2) No School CLI. 3) No email-finder. 4) No send.
- **Example that proves it:** 132k School tokens off-window; three win posts.
- **Why it works:** Short answers beat a 50-tool catalog. Scrape is still scrape.
- **Conditions / exceptions:** Claude Code tapes. Exceptions: our stack is Cursor + Grok.
- **Operate-never payload:** Printing Press / Go / Chrome session. Quote 35×. Contact Goat. School bot.
- **Hive run (existing skills only):** `ask-principal`. Stack Cursor + Grok.
- **Source:** `YHk45NEpspE` @ UNKNOWN


### Operate-never (this desk will not operate)
- Install Printing Press. Reverse-engineer School. Run Contact Goat. Quote 35× tokens / 72% as FACT.
- Gmail **send**. Connector write. Scheduled send. Auto-send. Ack-reply. Mass-DM. Postcard. Waitlist blast.
- Quote tape $ / student counts / job-loss % / ROI hours as FACT in a letter.
- New hunt ICP. Unpark Normand. Clients parked — no Path A this week.
- Install on-tape vendors (Vapi, Claude, Codex, ChatGPT, Gemini, Coda, Abacus, Skool, n8n-cloud). Stack stays Cursor + Grok. On-tape names stay on-tape.
- Grok Bot / `sendPrompt`. Send / pay / deploy / book / publish.
- Merge `LESSONS-FROM-TAPE.md`. Auto-write SKILL.md. New `icp_id`.

## L. Role-Specific Applications
- I do not write ‘we built a School CLI.’ I do not send. Clients parked.
