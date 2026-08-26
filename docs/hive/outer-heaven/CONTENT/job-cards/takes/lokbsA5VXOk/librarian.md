# Librarian — lokbsA5VXOk
Status: filled
Protocol: deep-video-learning
**Source:** `docs/hive/outer-heaven/CONTENT/watch-later/packets/lokbsA5VXOk/full.txt`
**Packet LEARNED:** `docs/hive/outer-heaven/CONTENT/watch-later/packets/lokbsA5VXOk/LEARNED.md`
**ICP:** parked unless Evens named one.
**Title:** OpenAI Just Leveled Up n8n AI Agents (here's how it works)
**Channel:** Nate Herk | AI Automation
**Kind:** video (~10:31 / ~2655 words)
**Captions:** yt-dlp — timestamp UNKNOWN (no VTT)
**Walked:** 2026-08-14 librarian re-walk. Did not merge `LESSONS-FROM-TAPE.md`. Clients parked. Did not overwrite `takes/librarian.md` (18-tape SSOT).

## A. Source Map
1. Costume: Agent A has Perplexity + Supabase, no system prompt ("helpful assistant") — flag-stick rule 17 from PDF; Bears 2025 8–3 from web.
2. Agent B: no tools, no prompt — same answers; Bears from ChicagoBears.com. Not magic: OpenAI chat model Responses API built-in web + file search.
3. n8n OpenAI chat node ≥~1.118; settings version 1.3; Open Router does not expose Responses yet even for OpenAI models.
4. Built-in tools: web, file, also code interpreter + MCP (MCP not visible in UI). Web: latest info; without it "who won the World Series" hits June 2024 cutoff. File: drop file, OpenAI embeds/indexes/stores; filter from docs (screenshot→paste).
5. Price: OpenAI ~$0.10/GB/day even idle vs Gemini file search cheaper (he has not A/B'd quality). Built-in search often no exact source/section — Gemini gives that; prompt if you want cites. Turn Responses off → tools vanish.
6. Extra knobs: memory, prompt cache key, metadata; "top log props" he does not understand. CTA Plus.
Gap: visual node. Timestamp UNKNOWN. OpenAI/n8n/Open Router on-tape. 8–3 / rule 17 / $0.10 / 1.118 UNVERIFIED.

## B. Atomic Knowledge

### Tools-in-the-model vs tools-on-the-agent
- **Claim:** Same answers with no agent tools because web/file live on the OpenAI Responses model.
- **Evidence:** "this agent has no tools attached at all" / "enabling web search and we're enabling file search"
- **Action:** File the costume; do not buy Responses to hide the tool list
- **Confidence:** high
- **Source:** `lokbsA5VXOk` @ UNKNOWN
- **Epistemic:** SOURCE

### Cite gap + idle GB
- **Claim:** OpenAI built-in often lacks exact source/section; Gemini returns it; $0.10/GB/day idle; he has not A/B'd retrieval.
- **Evidence:** "no exact source/section" (paraphrase of his compare) / "$0.10/GB/day" on tape
- **Action:** File cite-the-page; idle store never; $ UNVERIFIED
- **Confidence:** high as his warning
- **Source:** `lokbsA5VXOk` @ UNKNOWN
- **Epistemic:** SOURCE

### Open Router ≠ Responses (yet)
- **Claim:** Even OpenAI models via Open Router do not get Responses/built-ins yet.
- **Evidence:** "we don't yet have access to responses API through Open Router yet"
- **Action:** File as dated vendor row
- **Confidence:** high as his then-state
- **Source:** `lokbsA5VXOk` @ UNKNOWN
- **Epistemic:** SOURCE

## C. Mental Models
Cutoff dates explain "dumb" answers. Filter is copy-from-docs. Knobs he does not understand stay unlabeled. Plus CTA.

## D. Procedures
1. OpenAI chat node, version that has Responses. 2. Toggle web and/or file. 3. File: create store, filter. 4. Prompt for cites. 5. Know tools vanish if Responses off. Avoid: hive OpenAI store. Signals: rule 17; 8–3; June 2024 cutoff.

## E. Examples
**Twin agents:** Situation — same two questions. Action — A has tools; B has Responses built-ins. Outcome — same answers. Lesson — costume; still demand cites; idle $ never.

## F. Decision Rules
- If you need source/section → do not trust built-in without a prompt (his).
- If the store bills idle → never for hive.
- If on Open Router → no Responses (this tape).
- Refuse: OpenAI RAG as hive; 8–3/rule 17/$0.10 as FACT.

## G. Contrarian
Against "the agent has no tools so it is magic." Against Open Router as the Responses path (then).

## H. Assumptions
1.118 / $0.10 / Gemini cheaper UNVERIFIED. Pair `QrJhdTbK3TU` / `KVFfApQZhE4` — keep cite-quality dissent.

## I. Questions
Did he A/B later? MCP in UI later?

## J. Connections
SYSTEM SYNTHESIS → `QrJhdTbK3TU`; `KVFfApQZhE4`; `wiki-ingest`; `info-gain-cite`.

## K. Future-Use
Costume + cite-gap + idle-GB as atoms.

## Steal / Operate-never

### Machine: demand cite; do not buy hidden built-ins; idle GB never
- **Epistemic:** SOURCE
- **Workflow / loop:** answer from web/file → require source/section → if missing, fail the FACT bar → checkable stop = path+quote
- **Questions / signals:** Responses on? Source/section present? Idle store?
- **Qualify / frame / objections:** "Leveled up" / no-tools magic is the hook
- **Procedure:** golf PDF + Bears smoke; prompt cites
- **Example that proves it:** twin agents same answers; Gemini cites, OpenAI often not
- **Why it works:** FACT needs provenance
- **Conditions / exceptions:** n8n/OpenAI on-tape
- **Operate-never payload:** OpenAI Responses/store as hive; $0.10/8–3 as FACT; Open Router chase
- **Hive run:** `info-gain-cite` · `wiki-ingest` · `golden-test-loop`
- **Source:** `lokbsA5VXOk` @ UNKNOWN

### Operate-never
- OpenAI Responses/file-search store as hive. Quote $0.10/8–3/1.118 as FACT. n8n-cloud. Open Router chase.
- Merge `LESSONS-FROM-TAPE.md`. New `icp_id`. Send / pay / deploy / book / publish.

## L. Role-Specific Applications
This is the cite bar. File costume vs Gemini-cites as labeled rows. Do not stand up an idle store. 18-tape SSOT untouched.
