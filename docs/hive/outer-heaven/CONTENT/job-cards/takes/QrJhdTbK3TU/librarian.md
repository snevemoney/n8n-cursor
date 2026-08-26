# Librarian — QrJhdTbK3TU
Status: filled
Protocol: deep-video-learning
**Source:** `docs/hive/outer-heaven/CONTENT/watch-later/packets/QrJhdTbK3TU/full.txt`
**Packet LEARNED:** `docs/hive/outer-heaven/CONTENT/watch-later/packets/QrJhdTbK3TU/LEARNED.md`
**ICP:** parked unless Evens named one.
**Title:** Building n8n Agents Just Got So Much Easier with OpenAI
**Channel:** Nate Herk | AI Automation
**Kind:** short (~1:48 / ~464 words)
**Captions:** yt-dlp — timestamp UNKNOWN (no VTT)
**Walked:** 2026-08-14 librarian re-walk. Did not merge `LESSONS-FROM-TAPE.md`. Clients parked. Did not overwrite `takes/librarian.md` (18-tape SSOT).

## A. Source Map
1. Easiest way to add web search and file search to n8n agents.
2. Web: AI agent + OpenAI chat model → API key → toggle Use Responses API → built-in tools: web search, file search, code interpreter.
3. Web knobs: context size low/medium/high; allowed domains (Google, LinkedIn, Wikipedia).
4. Demo: who won the World Series this year → LA Dodgers 2025 over Blue Jays in seven; pulls websites.
5. File search: Responses on, web off; needs vector store ID + filter; platform.openai.com → storage → upload/create store → copy ID as array.
6. Ask: what should happen if a ball at rest moves in golf → depends on what caused the move.
7. CTA: full breakdown.
Gap: cite quality, $0.10/GB (on long `lokbsA5VXOk`). Timestamp UNKNOWN. OpenAI / n8n. 2025 Series / golf UNVERIFIED as ours.

## B. Atomic Knowledge

### Responses toggle unlocks built-in tools
- **Claim:** Use Responses API on the OpenAI chat model to get web search, file search, and code interpreter without attaching those as agent tools.
- **Reasoning:** Easiest add is a toggle, not a Perplexity+Supabase costume (`lokbsA5VXOk`).
- **Evidence:** "this is what gives us access to adding in those built-in tools"
- **Conditions:** OpenAI chat model in n8n; credential
- **Exceptions:** Open Router not mentioned here (long says no Responses yet)
- **Action:** File toggle-unlocks-tools; do not adopt OpenAI Responses as hive
- **Confidence:** high as how-to
- **Source:** `QrJhdTbK3TU` @ UNKNOWN
- **Epistemic:** SOURCE

### Domain allowlist + store ID
- **Claim:** Web search can restrict allowed domains; file search needs a vector store ID (array) + filter from platform storage.
- **Evidence:** "web search allowed domains" / "vector store ID and a filter"
- **Action:** File allowlist + ID; park OpenAI storage
- **Confidence:** high
- **Source:** `QrJhdTbK3TU` @ UNKNOWN
- **Epistemic:** SOURCE

## C. Mental Models
Built-in tools live on the model, not the agent tool list. Context size is a knob. Storage page mints the ID. Sports + golf are the smoke tests.

## D. Procedures
1. Agent + OpenAI chat + key. 2. Toggle Responses. 3. Web: context size + optional domains; ask a current-fact. 4. File: store ID array + filter; ask an in-doc rule. Avoid: hive OpenAI store. Signals: Dodgers 2025; ball-at-rest depends on cause.

## E. Examples
**World Series + golf rest:** Situation — need web and file. Action — Responses toggle; web ask Series; file ask ball-at-rest. Outcome — Dodgers 2025 + sites; golf depends on cause. Lesson — toggle + ID; facts UNVERIFIED as ours.

## F. Decision Rules
- If Responses is off → built-in tools vanish (long `lokbsA5VXOk`).
- If store ID is missing → file search cannot run.
- If you need cites → this short shows sites for web; golf answer here is thinner than `KVFfApQZhE4` rule-4 — do not flatten.
- Refuse: OpenAI Responses RAG as hive; quote Series as FACT.

## G. Contrarian
Against attaching Perplexity+vector tools for these two jobs (this short's "easiest").

## H. Assumptions
Theirs: Dodgers 2025 is correct (UNVERIFIED). Ours: teaser of `lokbsA5VXOk`. Cite quality may be worse than Gemini — keep dissent. Idle $ never.

## I. Questions
Does this short show source/section for golf? Same 1.118 version as the long?

## J. Connections
SYSTEM SYNTHESIS → `lokbsA5VXOk`; `KVFfApQZhE4`; `Fu6vOfzFmcw`.

## K. Future-Use
Toggle-unlocks-tools + domain allowlist as atoms. Unassigned: hive does not buy Responses.

## Steal / Operate-never

### Machine: model-toggle tools vs agent-tool costume
- **Epistemic:** SOURCE
- **Workflow / loop:** attach OpenAI chat → Responses on → web and/or file → checkable stop = answer + (web) listed sites; file needs store ID
- **Questions / signals:** Responses on? Store ID present? Allowed domains set?
- **Qualify / frame / objections:** "Easiest" is the hook; cite may still be thin
- **Procedure:** context size; ID as array
- **Example that proves it:** Series web + golf file
- **Why it works:** tools on the model hide the costume — we still do not install
- **Conditions / exceptions:** n8n/OpenAI on-tape
- **Operate-never payload:** OpenAI Responses/store as hive; Series as FACT; idle GB
- **Hive run:** `wiki-ingest` · `info-gain-cite` (cite bar)
- **Source:** `QrJhdTbK3TU` @ UNKNOWN

### Operate-never
- OpenAI Responses / vector store as hive. Quote Dodgers 2025 as FACT. Idle GB/day.
- Merge `LESSONS-FROM-TAPE.md`. New `icp_id`. Send / pay / deploy / book / publish.

## L. Role-Specific Applications
File toggle vs costume. Keep Gemini-cites vs OpenAI-thin as labeled rows. Do not buy a store that bills idle.
