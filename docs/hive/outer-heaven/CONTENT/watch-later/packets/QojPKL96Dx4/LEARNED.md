# LEARNED — QojPKL96Dx4
Protocol: deep-video-learning
Status: filled
**Source:** `docs/hive/outer-heaven/CONTENT/watch-later/packets/QojPKL96Dx4/full.txt`
**Desks merged:** Researcher 2026-08-14. Librarian not yet. Keep later dissent as labeled rows. Do not flatten.
**ICP:** parked. Tape $ UNVERIFIED. No new `icp_id`.
**Note:** Derived from Researcher A–K + Steal after a full `full.txt` walk. Other desks add labeled rows; do not overwrite dissent.

## A. Source Map
Caption-only (`full.txt`, ~3969 words). Title: easiest RAG in minutes (Pinecone **Assistant**). Visual/click **UNKNOWN**. Timestamp **UNKNOWN**. Beats: (1) Demo: three earnings Qs (Tesla Q2 25, Nvidia Q1 FY25, Nike Q4 FY25) → Pinecone tool ×3 → answers + document + pages + quote; he Ctrl+F-checks (Tesla quote on p4 vs agent “p3–7”). “Drop a file and chat” vs metadata-tag pipelines. (2) Pinecone Assistants: create `demo`; **$0.05/hour** while active — UNVERIFIED. Playground upload Tesla/Nike/Nvidia PDFs; same Qs work with hover citations. API: upload or chat — today **chat only**. (3) n8n: no native Assistant tool (there is Vector Store) → **HTTP** → Pinecone connect → copy chat curl (minus key rows) → import curl → API key (create; shown once) or reuse predefined Pinecone cred. Description: “talk to your knowledge base.” Body query: replace Pride-and-Prejudice stub with expression `$fromAI('search query')` so the agent chooses the string **and how many times**. Brain: OpenRouter GPT-4.1 Mini. (4) No system prompt → correct Tesla deliveries **384k / −13% YoY** (he fact-checks) but **no sources**. Prompt: always cite document, page, section, **exact quote**. Tool already returned pages/PDF; the agent just didn’t say so. Agent split Tesla Q into **two** searches (2025 and 2024). (5) Cite still not a real quote — Assistant `content` is a **summary**. Nike Q: agent invents a quote that **Ctrl+F misses**. Fix: API `include_highlights=true` → new highlight `content` is the real span; Ctrl+F hits. Docs also: playground model **does not persist** — set `model` in the HTTP body. (6) Why not DIY vector: Assistant does index/embed/chunk. Same prompt/docs bakeoff: Assistant Tesla **4.1%** operating margin + cite, **1,277** tokens; Pinecone **vector store** wrong, ~**30k** tokens; **Supabase** wrong, ~**5k**. Not always best (hourly fee); beginner spin-up. Shout: Mark Kashef. Skool template; Plus 200 UNVERIFIED. **Do not flatten** vs `Fu6vOfzFmcw` Drive→Supabase, `QrJhdTbK3TU` / `lokbsA5VXOk` OpenAI Responses, `KVFfApQZhE4` Gemini, `ZwQ8rJhVCr4` four-method. All $ / % / token counts UNVERIFIED.

## B. Atomic Knowledge

### Assistant hides the pipeline; HTTP + $fromAI is the glue
- **Claim:** Drop PDFs in Pinecone Assistant; n8n talks via imported chat curl; the agent fills `search query` (and call count). No native Assistant node.
- **Reasoning:** Chunk/embed/metadata is the hard part of RAG; they ate it.
- **Mechanism:** Playground upload + HTTP chat + OpenRouter brain.
- **Evidence:** “all I did here was drop in a file and then chat with it.”
- **Conditions:** $0.05/h active. Key shown once.
- **Exceptions:** Vector-store node exists and **lost** his bakeoff. Other RAG tapes stay rows.
- **Action:** Steal “managed assistant + agent-chosen query.” Do not buy Pinecone because tape.
- **Confidence:** high as recipe; $ UNVERIFIED.
- **Source:** `QojPKL96Dx4` @ UNKNOWN
- **Epistemic:** SOURCE
- **Knowledge type:** declared
- **Modality:** speech
- **Evidence status:** transcript-implied
- **Shown / clicked / sequenced:** UNKNOWN
- **Failed / retried:** fake Nike quote (below)
- **Speech ≠ behavior:** none.

### Cite what the tool already returned; highlights ≠ default content
- **Claim:** Without a system prompt the agent won’t cite even when the tool has pages. Default Assistant `content` is a **summary** — “exact quote” will be fake until `include_highlights=true`. Playground model ≠ API model.
- **Reasoning:** Trust = document + page + Ctrl+F-able span. Read the API when behavior is wrong.
- **Mechanism:** Prompt for cite + highlights flag + model field in the request.
- **Evidence:** Nike quote zero hits → highlights on → hit; Tesla page 4 vs “3–7.”
- **Conditions:** Assistant chat API as of tape.
- **Exceptions:** Gemini default metadata (`lokbsA5VXOk` / `KVFfApQZhE4`) is a different cite UX.
- **Action:** Steal highlights-flag + prompt-to-surface. `info-gain-cite`.
- **Confidence:** high as the scar.
- **Source:** `QojPKL96Dx4` @ UNKNOWN
- **Epistemic:** SOURCE
- **Knowledge type:** declared
- **Modality:** speech
- **Evidence status:** transcript-implied
- **Shown / clicked / sequenced:** UNKNOWN
- **Failed / retried:** invented quote; page-range slop
- **Speech ≠ behavior:** “exact quote” in the prompt before the flag was on.

### Managed assistant won his 3-way on quality and tokens — with a meter
- **Claim:** Same Q, Assistant 4.1% + cite @ ~1277 tokens; Pinecone vector wrong @ ~30k; Supabase wrong @ ~5k. Hourly fee means it’s not always cheapest.
- **Reasoning:** Beginners should spin this to learn RAG; don’t crown it forever.
- **Mechanism:** Three agents, same prompt/docs, different store.
- **Evidence:** He says 4.1% is correct; DIY stores miss it.
- **Conditions:** One question, his chunking. Tokens/$ UNVERIFIED.
- **Exceptions:** Do not flatten into “Pinecone wins RAG.”
- **Action:** Steal the 3-way + fee caveat. `golden-test-loop`.
- **Confidence:** medium (n=1).
- **Source:** `QojPKL96Dx4` @ UNKNOWN
- **Epistemic:** SOURCE
- **Knowledge type:** declared
- **Modality:** speech
- **Evidence status:** transcript-implied
- **Shown / clicked / sequenced:** UNKNOWN
- **Failed / retried:** two DIY misses
- **Speech ≠ behavior:** none.

## C. Mental Models
Easiest ≠ cheapest forever. The agent must be told to speak the citations the tool already has. Summary-as-content is a lie if you asked for a quote. Docs > guessing. Kashef as the pointer, not a vendor blessing.

## D. Procedures
1. Create Assistant; note hourly fee.
2. Upload files in playground (this tape).
3. Import chat curl into n8n HTTP; key or predefined cred.
4. `$fromAI('search query')`; description = knowledge base.
5. System: cite doc/page/section/**highlight**.
6. `include_highlights=true`; set `model` in the body.
7. Ctrl+F the span before you trust it.
8. If comparing stores: same prompt/docs; record tokens + correctness (`lcNN` one-variable).
9. Hive: no Pinecone spend; no Skool JSON; no new ICP.

## E. Examples
- **Situation:** Three earnings Qs. **Action:** Assistant ×3. **Outcome:** Right numbers; Tesla page slop 3–7 vs 4. **Lesson:** Cite range ≠ pin.
- **Situation:** “Exact quote” without highlights. **Action:** Nike Q. **Outcome:** Ctrl+F miss. **Lesson:** Content is a summary.
- **Situation:** 4.1% margin bakeoff. **Action:** Assistant vs two vector stores. **Outcome:** Only Assistant hits; DIY costs more tokens. **Lesson:** Managed win + fee.

## F. Decision Rules
- IF you need a quote → highlights on + Ctrl+F.
- IF playground model changed → still set it in the HTTP body.
- IF DIY vector is wrong/expensive on a spin-up → he picks Assistant (meter on).
- IF you already have Drive/Supabase/Gemini/Responses → keep those rows; don’t replace.
- Refuse: quote $0.05/1277/30k as FACT; Pinecone because tape; new ICP.

## G. Contrarian
“Easiest RAG” still needs an HTTP curl and an API flag. Native vector nodes lost. The first “quote” was a hallucination of a summary.

## H. Assumptions
All earnings numbers, $0.05/h, token counts, Plus 200 = **UNVERIFIED**.
**Desk dissent:** Fifth RAG row, not the winner. Learn highlights + $fromAI.

## I. Questions
- Upload-via-API path (he skipped)?
- Kashef source video?
- Did Tesla 3–7 vs p4 ever get a tighter cite?

## J. Connections
- **SYSTEM SYNTHESIS:** `Fu6vOfzFmcw` · `QrJhdTbK3TU` · `lokbsA5VXOk` · `KVFfApQZhE4` · `ZwQ8rJhVCr4` · `lcNN3X9gXls` (evals). Skills: `info-gain-cite` · `golden-test-loop` · `wiki-ingest`.

## K. Future-Use
$fromAI query. include_highlights. Playground≠API model. 3-way store bakeoff. Summary-vs-span.

## Stolen machines

### Machine: managed-rag-plus-highlights
- **Epistemic:** SOURCE
- **Workflow / loop:** drop files in Assistant → HTTP chat + $fromAI query → prompt to cite → include_highlights → Ctrl+F → optional 3-way vs DIY stores
- **Questions / signals:** Is `content` a summary? Did playground model persist? Hourly fee vs token win?
- **Qualify / frame / objections:** Easiest for beginners ≠ hive standard. Other RAG tapes stay open.
- **Procedure:** D.
- **Example that proves it:** Fake Nike quote then highlights; 4.1% vs two misses.
- **Why it works:** They hide chunking; you still have to demand and verify the span.
- **Conditions / exceptions:** $ / tokens UNVERIFIED. Do not flatten five RAG paths.
- **Operate-never payload:** Pinecone spend; quote $0.05/4.1%/30k as FACT; Skool JSON; new ICP.
- **Hive run (existing skills only):** `info-gain-cite` · `golden-test-loop` · `wiki-ingest`
- **Source:** `QojPKL96Dx4` @ UNKNOWN

**Operate-never**
- Install Pinecone/n8n-cloud. Quote tape $ as FACT. New `icp_id`. Send / pay / deploy.

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
