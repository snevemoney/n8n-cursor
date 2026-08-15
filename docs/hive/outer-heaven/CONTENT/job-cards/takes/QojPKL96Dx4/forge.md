# Forge — QojPKL96Dx4
Status: filled
Protocol: deep-video-learning
**Source:** `docs/hive/outer-heaven/CONTENT/watch-later/packets/QojPKL96Dx4/full.txt`
**Packet LEARNED:** `docs/hive/outer-heaven/CONTENT/watch-later/packets/QojPKL96Dx4/LEARNED.md`
**ICP:** parked unless Evens named one.

## A. Source Map
Nate Herk **Pinecone Assistant RAG in n8n** (“<5 min”). Beats: three earnings Qs (Tesla Q2’25, Nvidia Q1 FY25, Nike Q4 FY25) → agent hits Pinecone **3×**; answers + **doc / pages / quote**; he Ctrl+F-checks (Tesla quote on p4, agent said p3–7; Nvidia/Nike p1) → usual RAG needs metadata pipelines; here **drop file + chat** → Skool free template → Assistant UI like a custom GPT; **$0.05/hr** active UNVERIFIED → upload 3 PDFs; playground cites on hover → n8n: no native Assistant node (vector-store node exists) → **HTTP + import cURL** from Connect → API key (shown once) or reuse native Pinecone cred → tool desc “talk to your knowledge base”; body `messages` → `$fromAI("search query")` (Pride and Prejudice default must die) → OpenRouter **GPT-4.1 Mini**, **no** system prompt → Tesla deliveries **384k**, **−13%** YoY UNVERIFIED; he fact-checks → without a prompt, cites stay in the tool payload and never reach the user → add: always cite doc/page/section/**exact quote** → agent chose **two** queries (2025 and 2024) → still **fake quotes** because Assistant `content` is a **summary** → docs: **`include_highlights: true`** → Nike quote now Ctrl+F-hits; highlights live in a second `content` → playground model ≠ API model (set model in the request) → vs **Pinecone vector store** and **Supabase** same prompt/docs: Assistant Tesla op-margin **4.1%** + cite, **1,277** tokens; vector store wrong + **~30k** tokens; Supabase miss + **~5k** UNVERIFIED → Assistant not always best (hourly fee); beginner spin-up; shout-out **Mark Kashef** → Plus **200+**. Timestamp UNKNOWN. Pinecone / n8n / OpenRouter / Skool on-tape.

## B. Atomic Knowledge

### Cite the highlight, not the assistant’s summary
- **Claim:** Default Assistant text is a paraphrase. “Exact quote” in the prompt will hallucinate a quote unless the API returns highlights. The agent must be told to surface doc/page/quote.
- **Reasoning:** Nike quote Ctrl+F = 0 until `include_highlights`. Tesla page range was already sloppy (p4 vs p3–7).
- **Mechanism:** HTTP body: dynamic query + highlights on; system prompt demands quote-from-payload.
- **Evidence:** Same Q, two quote qualities; 4.1% vs miss.
- **Conditions:** Pinecone Assistant as taped.
- **Exceptions:** Hourly fee. Not always the best store.
- **Action:** Steal “highlights or it isn’t a quote” and “prompt the cite.” Do not add Pinecone Assistant / n8n HTTP to hive.
- **Confidence:** high on the failure mode; 384k / 4.1% / token counts UNVERIFIED.
- **Source:** `QojPKL96Dx4` @ UNKNOWN
- **Epistemic:** SOURCE

### Managed chunking is a speed trade, not a hive DB
- **Claim:** Assistant hides embed/chunk/index. DIY vector missed 4.1% and burned more tokens in his three-way.
- **Reasoning:** Beginners skip the pipeline.
- **Mechanism:** Drop PDF in the UI; chat via API.
- **Evidence:** 1277 vs 30k vs 5k (his math).
- **Conditions:** Small demo corpus.
- **Exceptions:** $0.05/hr. Playground model doesn’t persist.
- **Action:** Park Pinecone. Don’t treat token-win as a stack switch.
- **Confidence:** medium (one corpus).
- **Source:** `QojPKL96Dx4` @ UNKNOWN
- **Epistemic:** SOURCE

## C. Mental Models
Tool payload ≠ user answer until you prompt it. Agent chooses query count. Docs have levers (`include_highlights`). Import-cURL is the missing native node. Key is shown once.

## D. Procedures
1. Don’t create a Pinecone Assistant. 2. If we ever cite: require a highlight that Ctrl+F’s, not a summary. 3. Don’t quote 384k / 4.1% / $0.05 as FACT. 4. Don’t paste API keys into a video. 5. Don’t join Plus for the template.

## E. Examples
**Situation:** Nike revenue.  
**Action:** Prompt says “exact quote”; API summary.  
**Reasoning:** Ctrl+F miss.  
**Outcome:** Fake quote.  
**Lesson:** Highlights or don’t claim quote.

**Situation:** Same 4.1% Q.  
**Action:** Assistant vs two vector stores.  
**Reasoning:** Managed vs DIY chunks.  
**Outcome:** Only Assistant hits; cheaper tokens (claimed).  
**Lesson:** Demo, not a hive migration.

## F. Decision Rules
- If the answer has a “quote” that doesn’t Ctrl+F → it’s a summary.
- If playground model changed → check the API body.
- If 5 min / $0.05 / 200+ appear → UNVERIFIED.
- If Pinecone/n8n-cloud as hive RAG → park.

## G. Contrarian
Field builds a chunk/metadata pipeline first. He drops the PDF. Field trusts the model to cite; he shows it won’t without highlights + a prompt.

## H. Assumptions
Three PDFs as demoed. Falsifier: highlights still paraphrase. We do not run n8n-cloud or Pinecone. Earnings numbers UNVERIFIED.

## I. Questions
Do any hive RAG paths already emit summaries labeled as quotes?

## J. Connections
SYSTEM SYNTHESIS: `lcNN3X9gXls` evals (same Tesla motif). `QCjMBOEhpLE` tables. No Pinecone / n8n-cloud. Cite-or-don’t is the steal.

## K. Future-Use
Highlights-or-it-isn’t-a-quote. Prompt the cite. Don’t add Assistant.

## Steal / Operate-never

### Machine: demand a Ctrl+F-able highlight; don’t trust the summary as a quote
- **Epistemic:** SOURCE
- **Workflow / loop:** retrieve → require highlight → prompt must print doc/page/quote → human Ctrl+F once
- **Questions / signals:** Does the quote exist in the PDF? Did the agent invent the cite?
- **Qualify / frame / objections:** Assistant is a paid wrapper. DIY can win on a real corpus.
- **Procedure:** No Pinecone Assistant. No n8n HTTP to it. No Skool template as ours.
- **Example that proves it:** Nike fake quote → `include_highlights`; 4.1% vs two misses.
- **Why it works:** The model will cite the paraphrase if that’s all it sees.
- **Conditions / exceptions:** Tape numbers UNVERIFIED. Hourly fee.
- **Operate-never payload:** Pinecone as hive DB; quote 384k/4.1% as FACT; Plus course.
- **Hive run:** existing knowledge only. Deploy HITL.
- **Source:** `QojPKL96Dx4` @ UNKNOWN

### Operate-never
- Stand up Pinecone Assistant / n8n-cloud RAG.
- Quote earnings / $0.05 / 200+ as FACT.
- New hunt. Send / pay / deploy / book / publish.
- Merge `LESSONS-FROM-TAPE.md`.

## L. Role-Specific Applications
I will not add Pinecone. If I cite, it must Ctrl+F. Deploy HITL.
