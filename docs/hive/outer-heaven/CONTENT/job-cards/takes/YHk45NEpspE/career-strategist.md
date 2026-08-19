# Career Strategist — YHk45NEpspE
Status: filled
Protocol: deep-video-learning
**Source:** `docs/hive/outer-heaven/CONTENT/watch-later/packets/YHk45NEpspE/full.txt`
**Packet LEARNED:** `docs/hive/outer-heaven/CONTENT/watch-later/packets/YHk45NEpspE/LEARNED.md`
**ICP:** parked unless Evens named one.

## A. Source Map
Video (14:45, 3697 words). Caption ingest. Beats in order: (1) Claude Code + Skool CLI (no official API): nine wins, three strongest, links check out (2) 10 recent posts: ~260 tokens out, ~132k back, **~2k into context** because the CLI summarized (3) he built the Skool CLI in ~10 minutes with Printing Press (4) thesis: APIs suck for agents (huge JSON, built for code); MCP sucks (tool-list bloat, server, 35× tokens vs CLI, 72% vs 100% reliability on hard tasks — UNVERIFIED); CLIs are local, short output, composable, SQLite, lazy discovery, auth once (5) slogan: APIs for code, MCP for tools, CLIs for agents that pay per token (6) Printing Press = factory + ~50-CLI library (Steinberger/OpenClaw inspiration; Gog vs official GWS) (7) starter pack + factory; need Go; paste three URLs into Claude Code (8) sites with no API: ESPN, Craigslist, Allrecipes (Chrome session), Domino’s, Skool — factory reverse-engineers (9) he built Skool / Tally / YouTube CLIs; ESPN skill demo (NBA times) (10) Contact Goat: LinkedIn + Happenstance + email verify — he has **not** tried it (11) factory demo: Hacker News CLI, 30–60 min estimate (he says estimates are always wrong) (12) `.env` for auth; **quotas still apply** (YouTube comment cap) (13) publish back to the library or share internally. Visual/click: UNKNOWN.

## B. Atomic Knowledge

### Pay-per-token agents want a short local command, not a 50-tool server
- **Claim:** MCP discovery is flexible and expensive (tools+descriptions sit in context even unused). A CLI can spend 132k on the wire and return 2k of summary. He cites 35× tokens and 72% vs 100% reliability — UNVERIFIED.
- **Reasoning:** Agents pay per token and have a session cap.
- **Mechanism:** Lazy discovery, pre-formatted ~200-token answers, local SQLite, one-time auth.
- **Evidence:** “none of that hit my context window” / “APIs are built for code, MCPs built for tools, and CLIs are built for agents” @ UNKNOWN
- **Conditions:** You are in a token-metered agent.
- **Exceptions:** Sometimes you need the raw JSON API. MCP still wins discovery of many tools.
- **Action:** Prefer a thin command over loading a server you might not call.
- **Confidence:** high as worldview; benches UNVERIFIED
- **Source:** `YHk45NEpspE` @ UNKNOWN
- **Epistemic:** SOURCE
- **Knowledge type:** declared
- **Modality:** speech
- **Evidence status:** transcript-implied
- **Shown / clicked / sequenced:** UNKNOWN
- **Failed / retried:** time estimates “always bad”
- **Speech ≠ behavior:** none

### No official API is not “no quota” and not a hunt license
- **Claim:** Factory can reverse-engineer Skool (no API) in ~10 minutes — he could not have done it by hand. Quotas (YouTube comments) still bind. Contact Goat (find email for a stranger) is in the catalog; he has not run it.
- **Reasoning:** CLI is a shape, not a legal/ethical free pass.
- **Mechanism:** Chrome session / reverse discovery / `.env`.
- **Evidence:** “just because you’re using a CLI doesn’t mean you’re jumping over those quotas.” @ UNKNOWN
- **Conditions:** A site or API you already have a right to.
- **Exceptions:** HN needs no auth — weak demo, he says so.
- **Action:** Treat factory output as a tool you still must have permission and quota for.
- **Confidence:** high as warning
- **Source:** `YHk45NEpspE` @ UNKNOWN
- **Epistemic:** SOURCE
- **Knowledge type:** declared
- **Modality:** speech
- **Evidence status:** transcript-implied
- **Shown / clicked / sequenced:** UNKNOWN
- **Failed / retried:** unobserved
- **Speech ≠ behavior:** none

## C. Mental Models
Official CLIs can be worse than community ones (Gog vs GWS). Token routing is a career skill. 10-minute factory is a capability story, not a Skool scrape SKU. Library + factory = marketplace thinking. Do not trust the model’s 30–60 minute promise.

## D. Procedures
1. Before adding MCP: `/context` — what is the idle tax?
2. If the job is one action: prefer a short CLI/summary over a 50-tool server.
3. Auth in `.env`; expect the same rate limits as the API.
4. Do not run Contact Goat / stranger-email CLIs (hunt).
5. If you build a CLI: verify the output (he checked Skool links).
6. Discount time estimates.

Questions: Idle MCP tax? Do I have a right to this site? Quota? Signals: 132k on the wire, 2k in context. Qualify: agent-native vs code-native.

## E. Examples
**Situation:** Skool has no API; he wants wins.  
**Action:** 10-minute CLI; filter wins; verify three links.  
**Reasoning:** CLI factory + Chrome/reverse.  
**Outcome:** Links exist.  
**Lesson:** Verify the pull; still not a hive Skool integration.

**Situation:** Same task, MCP vs CLI (cited bench).  
**Action:** He quotes 35× tokens, 72% vs 100%.  
**Reasoning:** Tool-list bloat.  
**Outcome:** Unverified.  
**Lesson:** Idle MCP is a tax.

## F. Decision Rules
- IF MCP is loaded and unused → you are paying rent.
- IF the site has no API → CLI is a shape, not permission.
- IF the catalog is “find a stranger’s email” → do not operate.
- IF the model says 30–60 minutes → assume it is wrong.
- IF you wrap an API → quotas remain.

## G. Contrarian
Rejects “MCP everywhere after it broke the internet.” Rejects official CLI as automatically best.

## H. Assumptions
**Theirs:** 35× / 72% / 50 CLIs / 10 minutes / 132k. Steinberger story. **Ours:** All benches UNVERIFIED. Reverse-engineering third-party sites is operate-never for hive. Clients parked. Falsifier: a well-scoped MCP cheaper than a bad CLI. Speech≠behavior: “I could not have done it” vs “absolutely not” after it worked.

## I. Questions
- Who measured 35× and 72%?
- What did the Skool CLI actually hit (ToS)?
- Which starter CLIs are toys vs jobs?

## J. Connections
- SYSTEM SYNTHESIS → `eRS3CmvrOvA` (context garbage / Context Mode).
- SYSTEM SYNTHESIS → `kB9iMD0EjT8` (tool-agnostic, not a new vendor).
- SYSTEM SYNTHESIS → do not hunt via Contact Goat.

## K. Future-Use
Unassigned: idle-connector tax as a career `/context` habit. CLI-shaped thin adapters inside Cursor + Grok, not Printing Press. Not a hunt. Not a Skool CLI.

## Steal / Operate-never

### Machine: thin command over idle MCP; verify the pull
- **Epistemic:** SOURCE + SYSTEM SYNTHESIS
- **Workflow / loop:** need a tool → check idle context tax → prefer a short local command that returns a summary → keep auth/quotas → verify links/rows → do not run stranger-email goats
- **Questions / signals:** 50 tools loaded unused? 132k wire / 2k context? ToS?
- **Qualify / frame / objections:** APIs for code, MCP for discovery, CLI for metered agents. Objection to no-API CLIs: permission and quota remain.
- **Procedure:** `.env` for secrets. Discount ETAs. Check outputs.
- **Example that proves it:** Skool wins with verified links; MCP tax cited (E).
- **Why it works:** Agents pay for descriptions they do not use; summaries keep the session (B/C).
- **Conditions / exceptions:** Benches UNVERIFIED. Factory is on-tape.
- **Operate-never payload:** Installing Printing Press / Go / Skool CLI; Contact Goat; quoting 35× as FACT; scraping; new hunt ICP.
- **Hive run (existing skills only):** `context-docs` · `info-gain-cite` · `ask-principal` · Cursor + Grok
- **Source:** `YHk45NEpspE` @ UNKNOWN

### Operate-never
- Install Printing Press / reverse-engineer Skool. Cursor + Grok only.
- Run Contact Goat / scrape. Clients parked.
- Quote 35× / 132k / 10 minutes as FACT.
- Send / pay / deploy / book / publish.
- Auto-write `SKILL.md`. Merge `LESSONS-FROM-TAPE.md`.

## L. Role-Specific Applications
Employment still covers baseline. The career habit is “what is this connector costing me when I am not using it?” Gym a `/context`-style audit in the allowed stack. Do not build a Skool CLI or a stranger-email goat. Quotas and permission stay.
