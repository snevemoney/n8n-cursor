# Money Desk — YHk45NEpspE
Status: filled
Protocol: deep-video-learning
**Source:** `docs/hive/outer-heaven/CONTENT/watch-later/packets/YHk45NEpspE/full.txt`
**Packet LEARNED:** `docs/hive/outer-heaven/CONTENT/watch-later/packets/YHk45NEpspE/LEARNED.md`
**ICP:** parked unless Evens named one.

## A. Source Map
~3697 words. Nate: Printing Press — CLI factory + ~50-CLI library because APIs/MCPs waste agent tokens. Caption-only; timestamp UNKNOWN. Beats in order: cold open — Claude Code + School CLI (School has no API) → 9 wins in Wins category → 3 strongest + links (Michael, Chris, Fernando). Second ask: 10 recent posts; ~260 tokens to School, ~132k back; ~2k of summary hit the Claude window — rest routed through CLI. CLI = type commands not click; Gemini/Claude/Codex CLIs; GWS CLI (his most-used in CC), GitHub, Playwright, Higgsfield, HeyGen. API = raw JSON, built for code, pagination/auth pain, still more token-efficient than MCP. MCP = discovery of many tools but loads all descriptions every session (`/context` tax even unused); keep a server running. CLI = local, fast, composable, SQLite backend, agent-native, short clean output. Bench he cites: MCP 35× more tokens than CLI on same task; reliability 100% CLI vs 72% MCP as tasks harden — UNVERIFIED. Lazy discovery, ~200-token preformatted text, compound commands, local SQLite = no round-trip/rate-limit (auth once in the CLI). Bottom line: APIs for code, MCPs for tools, CLIs for agents that pay per token. Printing Press (printingpress.dev, dropped ~yesterday): factory + library (Flight Goat, ESPN, Movie, Recipe, Linear, Amazon, Craigslist, eBay, TikTok shops, Shopify…). Inspired by Steinberger / Open Claw / Gog CLI beating official GWS. Starter pack: ESPN, Flight Goat, Movie Goat, Recipe Goat + factory. Need Go (ask CC to install). Sites with no public API: ESPN, Craigslist, Allrecipes (anti-scrape; CLI uses real Chrome session), Domino’s, School. He built School (reverse-engineer, ~10 min), Tally (from his API), YouTube (from Data API). Catalog skill lists installed vs available. Live: ‘NBA games tonight’ → P ESPN → Knicks/Sixers 7 ET, Spurs/Wolves 9:30 — he checks Central = +1h. Contact Goat mentioned (LinkedIn + Happenstance + email verify) — he has not tried. Build-your-own: Hacker News via factory + page link; no auth; CC plans research → catalog features → Go CLI → dogfood/runtime/score; estimates 30–60 min, ‘always bad at estimates.’ Auth/cookies/OAuth/API key still go in `.env`; CLI does not jump YouTube comment quotas. Publish to library or private repo (Tally: package CLI+skill, teammates swap their key — never bake keys into scripts). Finished HN: binary path + skill; ‘sites dominating HN last 24h, 100+ points’ → 10 stories, fast. Tier: CLI first; else API (then you can wrap a CLI); MCP last. Close: like CTA. No School/Plus card this tape.

## B. Atomic Knowledge
### CLI-for-agents-MCP-for-catalog-tax
- **Claim:** APIs return huge JSON (built for code). MCP solves discovery but taxes every session with all tool descriptions even unused. CLIs return short preformatted text, lazy discovery, local SQLite.
- **Reasoning:** School pull: 132k tokens on the wire, ~2k in the Claude window. Cited bench: MCP 35× tokens, 72% vs 100% reliability — UNVERIFIED.
- **Mechanism:** Prefer an existing CLI or wrap the API as a CLI. MCP last. `/context` to see the tax.
- **Evidence:** On-tape 260 sent / 132k back / ~2k in-window; NBA two-game card.
- **Conditions:** You pay per token or you have a session cap.
- **Exceptions:** Printing Press / Go / Chrome-session scrape / School CLI are not ours. Reverse-engineering a product without an API is not a hive job.
- **Action:** Steal CLI-over-MCP-tax. Do not install Printing Press. Do not scrape.
- **Confidence:** high as a token thesis; bench UNVERIFIED
- **Source:** YHk45NEpspE @ UNKNOWN
- **Epistemic:** SOURCE
### Factory-then-skill-keys-in-env
- **Claim:** Factory researches the site, writes a Go CLI, dogfoods. Then wrap a skill for natural language. Keys stay in `.env`; package the CLI+skill to a private repo so teammates swap keys.
- **Reasoning:** No-API sites (School, ESPN, Craigslist) are the pitch. CLI does not bypass YouTube comment quotas.
- **Mechanism:** Three URLs → install starter+factory → Go if missing → NL request. Never bake auth into the script.
- **Evidence:** On-tape School 10 min; Tally private repo; HN 10 stories.
- **Conditions:** You already have an API or a site you should not scrape.
- **Exceptions:** Chrome-session Allrecipes / School reverse-engineer = operate-never for us. Contact Goat / LinkedIn lookup = not a hunt.
- **Action:** Steal keys-in-env + short-output. HOLD the factory.
- **Confidence:** high as hygiene; factory not ours
- **Source:** YHk45NEpspE @ UNKNOWN
- **Epistemic:** SOURCE
### Tier-CLI-then-API-then-MCP
- **Claim:** If a CLI exists, use it. If an API exists, you can wrap a CLI. If only MCP exists, that’s last because of the catalog tax.
- **Reasoning:** Discovery is MCP’s win. Session-tax is MCP’s loss. He wants every CC↔tool hop to try CLI first.
- **Mechanism:** Ask: is there a CLI? Can we wrap the API? Only then MCP.
- **Evidence:** On-tape GWS as his most-used official CLI; Gog as the ‘better unofficial’ story — not verified by us.
- **Conditions:** You are adding a tool to an agent.
- **Exceptions:** Does not authorize installing Go/PP/CC. Official CLIs can still suck (his Steinberger point).
- **Action:** Steal the tier. Do not install.
- **Confidence:** high as a decision rule
- **Source:** YHk45NEpspE @ UNKNOWN
- **Epistemic:** SOURCE


## C. Mental Models
Belief: agents should speak CLI. Priority: tokens-in-window over tokens-on-the-wire; keys in env. Experience: School CLI in ~10 min; Tally/YouTube wraps. Contrarian: MCP is not the default. Uncertainty: 35×/72% bench unsourced; HN estimate wrong on purpose.

## D. Procedures
His order: starter pack + factory URLs into CC → install Go → catalog skill → try a library CLI (ESPN) → factory for a site → `.env` for auth → skill wrap → optional private repo without keys. Our order: do not install. Steal the tier and the in-window vs on-wire split. Caption-only: clicks UNKNOWN.

## E. Examples
**Situation:** School has no API; pull wins. **Action:** School CLI via PP. **Reasoning:** CLI routes the dump. **Outcome:** 9 wins → 3; 132k on wire, ~2k in window. **Lesson:** Measure tokens in the session, not on the wire.

**Situation:** NBA tonight. **Action:** P ESPN skill. **Reasoning:** library CLI. **Outcome:** two games; he corrects TZ. **Lesson:** Verify the card.

**Situation:** Tally CLI+skill. **Action:** private GitHub, teammates clone, swap `.env`. **Reasoning:** share the tool not the key. **Outcome:** repo in ‘a couple seconds.’ **Lesson:** Never bake auth.

## F. Decision Rules
IF `/context` shows unused MCP tax → prefer CLI. IF site has no API → do not scrape/reverse-engineer as us. IF wrapping an API → keys in `.env`, not the script. IF only MCP exists → last resort. IF 35×/72%/132k → UNVERIFIED. Refuse: Printing Press / Go / Claude Code / School CLI as ours; Contact Goat as a hunt.

## G. Contrarian
Rejects ‘MCP everything.’ Rejects ‘CLI bypasses quotas.’ Rejects baking keys into shared CLIs.

## H. Assumptions
Tool dropped ‘yesterday.’ Bench unsourced. Chrome-session scrape is his method, not ours. Survivorship: one afternoon. Falsifier: CLI output is lossy and the agent misses fields. Speech≠behavior: ‘10 min’ School vs HN 30–60 estimate.

## I. Questions
Where is the 35×/72% bench published? Any receipt that CLI-vs-MCP cut $ we can open? Does School ToS allow that CLI?

## J. Connections
SYSTEM SYNTHESIS: in-window vs on-wire = Context Mode (`eRS3CmvrOvA`) 56kb→299b. Filter-then-calc (`QCjMBOEhpLE`). MCP catalog tax = instance MCP (`5p5cV0yVDvQ`). PP/Go/CC/scrape operate-never.

## K. Future-Use
Unassigned: local SQLite mirror as a no-round-trip pattern (observe). Official-CLI-can-lose-to-unofficial as a vendor-risk note.

## Steal / Operate-never

### Machine: In-window-tokens-not-on-the-wire-CLI-tier
- **Epistemic:** SOURCE
- **Workflow / loop:** trigger: agent must talk to a tool → action: CLI if it exists; else wrap API as short output; MCP last → checkable stop: `/context` tax and the in-window token count, not the wire dump
- **Questions / signals:** What hits the window? Is there a CLI? Are keys in `.env`?
- **Qualify / frame / objections:** Frame: APIs for code, MCP for discovery, CLI for agents. Objection: ‘MCP is the standard’ — he cites 35×/72% UNVERIFIED.
- **Procedure:** Measure in-window. Do not scrape. Do not install PP. HITL any send from a CLI.
- **Example that proves it:** School 132k wire / ~2k window; ESPN two games; Tally private repo. UNVERIFIED.
- **Why it works:** Agents pay per token in the session. Discovery tax is paid even when the tool is idle.
- **Conditions / exceptions:** Works as a tier. Exception: PP / Go / CC / School CLI / scrape / Contact Goat operate-never.
- **Operate-never payload:** Printing Press · Go · Claude Code · School reverse-engineer · Chrome scrape · Contact Goat hunt · 35× as FACT
- **Hive run (existing skills only):** `token-receipt` (proposed) · `playbook-before-send` · `ask-principal` · `pricing-margin-roi-guardrails`
- **Source:** YHk45NEpspE @ UNKNOWN


### Operate-never (this desk will not operate)
- Quote 35× / 72% / 132k / 10 min as FACT or as our analog.
- Install Printing Press / Go / Claude Code. Reverse-engineer School. Chrome-session scrape. Contact Goat as a hunt.

- Move money, approve a charge, refund, or fee. Live Stripe. Auto-send / auto-pay / auto-book / auto-deploy / auto-publish.
- Quote any tape $ / student count / job-loss % / prize / 10x as FACT or as our price analog.
- Nate Skool / Plus / AIS Plus / Hostinger NATEHERK / Uppit / Glaido / sold templates as a SKU. Do not map through `usecase-to-sku`. Do not join / install / import.
- Install Claude Code / Codex / Claude / ChatGPT / Gemini / Coda / Vapi / ElevenLabs / n8n-cloud / Trigger.dev / Hermes / Base44 / Sora / NanoBanana / Poppy / Lovable as ours. Cursor + Grok only. Vendor on tape is a mention, not a Bot dispatch.
- New hunt ICP. Unpark a client. Live hunt stays `local-pro` / Normand. Clients parked. No new `icp_id`.
- Grok Bot / `sendPrompt`. Send / pay / deploy / book / publish.
- Merge `LESSONS-FROM-TAPE.md`. Overwrite `takes/money-desk.md`.

## L. Role-Specific Applications
HOLD Printing Press and the School CLI. Steal in-window vs on-wire and CLI-then-API-then-MCP. Keys stay out of scripts. Early rung $500–1K/mo CAD.

**Lens only (after A–K + Steal).** This desk votes PASS/HOLD on margin. It does not move money.

- `pricing-margin-roi-guardrails`: tape $ stays **UNVERIFIED**. Our early rung stays **$500–1K/mo CAD** after a 30–60d win. Delivery ≤40% of fee. Vendor / educator $ does not move Normand Path A.
- `outcome-offer-funnel` + `checkout-proof`: count checkout + warm conversions we can open. Quarantine YouTube receipts.
- `paid-slice-funnel`: thin V1; Stripe HITL; preview ≠ domain.
- `ask-principal` + `input-required-gate`: confirm ≠ execute. Pay / refund / fee stay HITL.
- `website-offer-funnel`: Path A/B/C spine still exists; this tape does not open a client unless Evens names one.
- Proposed, not written: `unit-econ-card` (price, COGS, contribution, aha-gate — tape $ never fills the line) · `token-receipt` (session cost versus artifact; leftover quota is not a KPI).

**Business parked:** no new `icp_id`. No `business-lanes.json` row. Hunt stays `local-pro` / Normand.
