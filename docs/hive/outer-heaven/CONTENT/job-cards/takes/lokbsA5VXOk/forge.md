# Forge — lokbsA5VXOk
Status: filled
Protocol: deep-video-learning
**Source:** `docs/hive/outer-heaven/CONTENT/watch-later/packets/lokbsA5VXOk/full.txt`
**Packet LEARNED:** `docs/hive/outer-heaven/CONTENT/watch-later/packets/lokbsA5VXOk/LEARNED.md`
**ICP:** parked unless Evens named one.

## A. Source Map
Nate Herk n8n + OpenAI Responses API tape (web search + file search as **built-in tools**, not agent tools). Beats: two agents, same questions (golf flag-stick rule + Bears record) — one has Perplexity + Supabase tools, one has **no tools and no system prompt**, same answers → magic is inside the OpenAI chat-model node: Responses API toggles → n8n **1.118+**, chat model **v1.3**; Open Router does **not** expose Responses yet → built-ins: web search, file search; code interpreter + MCP mentioned, MCP not shown → setup: platform.openai.com key (not ChatGPT) → web search: context size low/med/high; city/country/region; **allowed domains** → proof: World Series 2025 without search = cutoff June 2024; with search = Dodgers over Blue Jays (on-tape, UNVERIFIED as sports fact) + citations → domain allow-list to his old **upai.com** + GPT-4.1 **cannot** use the filter; GPT-5 mini can and correctly says “not on this domain” → file search: vector store ID as array; **filter required** or it errors (he pastes a JSON from docs); max results → pricing aside: OpenAI **$0.10/GB/day** even idle UNVERIFIED vs Gemini upload-only (he leans Gemini for metadata, has **not** A/B’d retrieval) → golf “ball at rest moves” answer from PDF; **no citation/section** by default (Gemini does) → extra Responses options: saved prompt ID, service tier, safety identifier, **conversation ID** (memory in OpenAI not n8n Postgres), prompt cache key, metadata, top logprobs (he doesn’t understand) → Plus community CTA. Timestamp UNKNOWN. OpenAI / n8n / Gemini / Plus on-tape.

## B. Atomic Knowledge

### Built-in search ≠ agent tools
- **Claim:** The model node can search the web / files with no agent tools and no system prompt.
- **Reasoning:** Responses API “enriches the response” inside the brain.
- **Mechanism:** Toggle Use Responses API → web and/or file search.
- **Evidence:** Flag-stick rule 17 + Bears 8–3 from both setups (records UNVERIFIED).
- **Conditions:** n8n OpenAI chat model v1.3+, not Open Router (as of this tape).
- **Exceptions:** MCP not in the UI; he skips it.
- **Action:** Steal “search can live in the model.” Do not add OpenAI as hive stack.
- **Confidence:** high on the shape; version numbers / sports facts UNVERIFIED.
- **Source:** `lokbsA5VXOk` @ UNKNOWN
- **Epistemic:** SOURCE

### Allow-list and filters are the real control
- **Claim:** Domain allow-list can correctly refuse. File search needs a filter or the node errors. Older models may not support the domain filter.
- **Reasoning:** He proved the empty-domain case on upai.com.
- **Mechanism:** Allowed domains + vector-store filter JSON + max results.
- **Evidence:** GPT-4.1 fail → 5 mini success; filter-required error.
- **Conditions:** OpenAI Responses as wired in n8n.
- **Exceptions:** He has not tested retrieval quality vs Gemini.
- **Action:** Steal allow-list ≠ execute-any. Idle vector-store $ is a vendor tax — UNVERIFIED, do not quote as FACT.
- **Confidence:** high on allow-list; $0.10/GB/day UNVERIFIED.
- **Source:** `lokbsA5VXOk` @ UNKNOWN
- **Epistemic:** SOURCE

## C. Mental Models
A “helpful assistant” with no prompt can still look smart if the brain has tools. Citations/metadata are part of trust (Gemini wins that demo). Memory can live in the vendor (conversation ID) — that is a lock-in, not a gift. Plus community is the close.

## D. Procedures
1. Do not follow his OpenAI key / billing setup. 2. If we ever need search: prefer allow-listed sources. 3. Empty allow-list should refuse, not hallucinate. 4. Don’t assume the cheap/old model supports the filter. 5. Don’t pay idle store $ without a test. 6. Ask for section/citation; default file-search may not cite.

## E. Examples
**Situation:** World Series 2025, no search.  
**Action:** Same question with Responses + web search.  
**Reasoning:** Cutoff vs live search.  
**Outcome:** Dodgers/Jays + citations (on-tape).  
**Lesson:** Search is a toggle, not a personality.

**Situation:** Allow-list = upai.com.  
**Action:** Same World Series question.  
**Reasoning:** Prove the filter.  
**Outcome:** Cannot find it on that domain.  
**Lesson:** Allow-list is a refuse path.

**Situation:** File search without filter.  
**Action:** Errors; he pastes docs JSON.  
**Reasoning:** API requires the shape.  
**Outcome:** Golf PDF answers, no section cite.  
**Lesson:** Works ≠ cited.

## F. Decision Rules
- If Open Router → no Responses (this tape).
- If domain filter + old model → expect it to fail.
- If idle GB/day $ appears → UNVERIFIED; don’t buy the store.
- If Plus / OpenAI key CTA → park.

## G. Contrarian
Field wires Perplexity + a vector DB as agent tools. He shows the same answers with zero tools. Field assumes OpenAI retrieval is “the” store; he leans Gemini for metadata and admits no A/B.

## H. Assumptions
n8n 1.118 / v1.3 / Open Router gap are as of this tape. Falsifier: Open Router later grew Responses. Sports scores on tape are not facts we store. We do not run his n8n OpenAI node.

## I. Questions
Do we already have allow-listed search in Cursor, or is this only an n8n vendor demo?

## J. Connections
SYSTEM SYNTHESIS: `9IzGe0BBj_c` / `mPflFTQUCGk` search→details, refuse execute-any. `6cEQEba0i2A` cache keys. No OpenAI / n8n-cloud install. Hive stays Cursor + Grok.

## K. Future-Use
Allow-list + cite-or-say-so as a search habit. Conversation-ID lock-in as a warning.

## Steal / Operate-never

### Machine: model-native search with an allow-list and a refuse path
- **Epistemic:** SOURCE
- **Workflow / loop:** need live/file facts → search inside the model (or a tool) → allow-list / filter → cite or refuse → stop
- **Questions / signals:** Is this a cutoff question? Which domains are allowed? Did it cite a section?
- **Qualify / frame / objections:** No-tools “magic” is the vendor brain. Idle store $ is a tax.
- **Procedure:** Do not paste his filter JSON into a hive n8n. Do not buy OpenAI storage.
- **Example that proves it:** World Series toggle; upai.com refuse; golf PDF no cite.
- **Why it works:** Search without a fence hallucinates. A fence that cannot fire is a false sense of safety (4.1).
- **Conditions / exceptions:** n8n/OpenAI-specific wiring. Gemini cheaper/metadata — untested retrieval.
- **Operate-never payload:** OpenAI key + billing; Plus; quote $0.10/GB/day as FACT; MCP “just code it.”
- **Hive run:** existing search habits only. No new skill file.
- **Source:** `lokbsA5VXOk` @ UNKNOWN

### Operate-never
- Add OpenAI / Open Router / n8n-cloud as hive stack.
- Quote sports scores / $0.10/GB/day as FACT.
- New hunt. Send / pay / deploy / book / publish.
- Merge `LESSONS-FROM-TAPE.md`.

## L. Role-Specific Applications
I will not wire OpenAI Responses in n8n this session. If I search, I want an allow-list and a cite. Deploy HITL.
