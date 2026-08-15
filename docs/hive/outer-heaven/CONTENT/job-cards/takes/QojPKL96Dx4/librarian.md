# Librarian — QojPKL96Dx4
Status: filled
Protocol: deep-video-learning
**Source:** `docs/hive/outer-heaven/CONTENT/watch-later/packets/QojPKL96Dx4/full.txt`
**Packet LEARNED:** `docs/hive/outer-heaven/CONTENT/watch-later/packets/QojPKL96Dx4/LEARNED.md`
**ICP:** parked unless Evens named one.
**Title:** The NEW Easiest Way to Build RAG Agents in Minutes (no code)
**Channel:** Nate Herk | AI Automation
**Kind:** video (~3969 words)
**Captions:** yt-dlp — timestamp UNKNOWN (no VTT unless noted)
**Walked:** 2026-08-14 librarian re-walk. Did not merge `LESSONS-FROM-TAPE.md`. Clients parked. Did not overwrite `takes/librarian.md` (18-tape SSOT).

## A. Source Map
1. <5 min RAG: three earnings Qs (Tesla Q2 2025 revenue, Nvidia Q1 FY25, Nike Q4 FY25). Agent hits Pinecone **three times**; answers + document + pages + quote. He Ctrl+F-checks quotes (Tesla pages 3–7 vs PDF p4 — close). Cite-the-page is usually a metadata pipeline; here “drop a file and chat.”
2. Pinecone **Assistant** (not raw vector store): $0.05/hr active (UNVERIFIED). Playground: drag Tesla/Nike/Nvidia PDFs; same Qs work with hover citations. API: upload or chat — today chat only.
3. n8n: no native Assistant tool (there is Vector Store). HTTP: copy chat cURL minus key rows → Import cURL. API key once (shown then gone) **or** reuse native Pinecone credential. Tool desc: “talk to your knowledge base.” Body: replace Pride-and-Prejudice stub with `{{ $fromAI("search_query") }}` so the agent writes the query and the hop count.
4. Brain: OpenRouter GPT-4.1 Mini. No system prompt → correct Tesla deliveries **384k / −13% YoY** (he fact-checked) but **no sources**. Prompt: always cite document, page, section, **exact quote**. Pinecone already returned pages; the agent just was not told to speak them. Agent split Tesla 2025 vs 2024 into **two** searches.
5. Quote still wrong: Assistant `content` is a **summary**, not the PDF sentence (Nike quote = 0 Ctrl+F hits). Docs: `include_highlights=true` adds a second content block with the real span. Playground model ≠ API model — set model in the HTTP body.
6. Bake-off, same prompt/docs: Assistant Tesla operating margin **4.1%** + cite, **1,277 tokens**. Pinecone Vector Store: wrong, ~**30k** tokens. Supabase vector: wrong, ~**5k**. Assistant wins this Q; he will not say always-best because of the **$0.05/hr** meter. Credit: Mark Kashef. Skool template + Plus (200 / courses UNVERIFIED).
Gap: HTTP JSON, highlight payload. Timestamp UNKNOWN. Pinecone/n8n/Skool on-tape. Earnings numbers UNVERIFIED.

## B. Atomic Knowledge

### Cite-the-page is a lever (`include_highlights`), not a vibe
- **Claim:** Drop-file Assistant hides chunk/embed/index. The agent must be told to cite. Default `content` is a summary — quotes fail Ctrl+F until highlights are on. Agent writes `search_query` and hop count. Playground model does not persist to API.
- **Reasoning:** Trust = document + page + exact span. Vector DIY failed the 4.1% Q and spent 3–15× tokens.
- **Mechanism:** Assistant + HTTP + `$fromAI` + cite prompt + `include_highlights=true`.
- **Evidence:** three-PDF demo; Nike 0-hit then hit; 1277 vs 30k vs 5k.
- **Conditions:** $0.05/hr and earnings figures UNVERIFIED. One-Q bake-off.
- **Exceptions:** He says Assistant is not always best.
- **Action:** File cite-lever + summary≠quote. Do not install Pinecone as hive. Do not flatten “always faster/cheaper.”
- **Confidence:** high as a RAG-trust machine
- **Source:** `QojPKL96Dx4` @ UNKNOWN
- **Epistemic:** SOURCE
- **Knowledge type:** declared + demonstrated (transcript-implied)
- **Modality:** speech
- **Evidence status:** transcript-implied
- **Shown / clicked / sequenced:** UNKNOWN
- **Failed / retried:** quote without highlights; no-prompt = no cite
- **Speech ≠ behavior:** “<5 minutes” / “no code” vs cURL, keys, docs, prompt, highlight flag

## C. Mental Models
RAG trust is a quote you can find. Managed index vs you-own-the-chunks. Tokens follow the pipeline, not the question. Docs change behavior.

## D. Procedures
1. Ask: do I need a cite I can Ctrl+F?
2. If yes, turn on the highlight/citation flag; do not trust the summary field.
3. Tell the agent to speak document/page/quote.
4. Let the agent write the search query (and multiple hops).
5. Set the model in the API body, not only the playground.
6. Bake-off tokens + correctness on one known figure before declaring a winner.
Avoid: Pinecone as hive; 4.1%/384k as FACT; Skool template as SSOT.

## E. Examples
**Nike quote:** Situation — “exact quote” in the prompt. Action — copy Assistant content. Outcome — 0 hits. Lesson — summary ≠ span.

**4.1% bake-off:** Situation — same Q. Action — Assistant vs two vector stores. Outcome — only Assistant + 1277 tokens. Lesson — keep the $0.05/hr exception.

## F. Decision Rules
- IF you cannot Ctrl+F the quote → the cite is fake.
- IF playground model changed → check the API body.
- IF the Q is one known figure → bake-off tokens, do not assume vectors.
- Refuse: Pinecone as hive; earnings as FACT; Plus.

## G. Contrarian
Against “vector store first” (`kOKavHnlPik` same doctrine). Against metadata-pipeline-or-nothing for a first experiment.

## H. Assumptions
One-question bake-off. Complements `kOKavHnlPik` / `irg-2IfAjpo`. Caption-only.

## I. Questions
Does highlights stay cheap at 100 PDFs? Who pays the 5¢ when idle?

## J. Connections
SYSTEM SYNTHESIS → `kOKavHnlPik`; `QCjMBOEhpLE`; `Tj3018n5MVg` (cite confirm).

## K. Future-Use
Summary≠quote + include-highlights + agent-writes-query as atoms.

## Steal / Operate-never

### Machine: managed retrieve + cite prompt + highlight flag + token bake-off
- **Epistemic:** SOURCE
- **Workflow / loop:** drop files → HTTP chat → `$fromAI` query → cite prompt → highlights on → Ctrl+F the span → checkable stop = a quote that exists on a named page
- **Questions / signals:** Summary or span? How many hops? What did tokens do?
- **Qualify / frame / objections:** Fast experiment ≠ always-best (meter).
- **Procedure:** D above.
- **Example that proves it:** Nike 0-hit; 4.1% 1277 vs 30k.
- **Why it works:** Trust is a findable span; the agent must be told to speak it.
- **Conditions / exceptions:** $0.05/hr UNVERIFIED; one-Q bake-off.
- **Operate-never payload:** Pinecone as hive; earnings as FACT; Skool/Plus; n8n-cloud.
- **Hive run:** Cite-the-page on our files. Do not add Pinecone.
- **Source:** `QojPKL96Dx4` @ UNKNOWN

### Operate-never
- Pinecone/n8n-cloud as hive. Quote 4.1%/384k as FACT. Merge LESSONS. Send / pay / deploy / book / publish.

## L. Role-Specific Applications
File summary≠quote next to STORM cite-confirm. Do not add a Pinecone Assistant SKU.
