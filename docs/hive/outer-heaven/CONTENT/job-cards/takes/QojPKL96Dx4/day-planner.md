# Day Planner — QojPKL96Dx4
Status: filled
Protocol: deep-video-learning
**Source:** `docs/hive/outer-heaven/CONTENT/watch-later/packets/QojPKL96Dx4/full.txt`
**Packet LEARNED:** `docs/hive/outer-heaven/CONTENT/watch-later/packets/QojPKL96Dx4/LEARNED.md`
**ICP:** parked unless Evens named one.

## A. Source Map
Nate: **Pinecone Assistant** as 5-min RAG (vs DIY vector). Beats: three earnings Qs with **doc + page + quote**; Tesla page he Ctrl+F’d on 4 vs agent “3–7”; create assistant, **$0.05/hour while active** (UNVERIFIED); drag PDFs; playground cites; n8n: no native Assistant node → **import curl**, API key (shown-once), or reuse Pinecone cred; `$fromAI` `search_query`; empty system = numbers, no cites — prompt must demand doc/page/section/**exact quote**; first “quote” was a **summary** (Nike Ctrl+F **0 hits**); docs: **`include_highlights: true`**; playground model ≠ API model (must set in the call); same Q Tesla **4.1%**: Assistant **1,277 tok correct** vs Pinecone vector **~30k wrong** vs Supabase **~5k wrong** (UNVERIFIED); still “not always best” because idle fee; Mark Kashef shout; Skool/Plus. Caption-only. Timestamp UNKNOWN. Earnings numbers UNVERIFIED.

## B. Atomic Knowledge
### Cite is a lever (`include_highlights`); a summary is not a quote; idle assistants bill
- **Claim:** Drop-file RAG works when the API returns **highlights** and the agent is told to print them; without the flag you will invent a quote; DIY chunk pipelines can miss a number and cost more; **$0.05/hr** is a silent pay.
- **Reasoning:** Assistant hides embed/chunk; the agent still won’t cite unless prompted; playground settings don’t persist.
- **Mechanism:** Upload → HTTP chat → `$fromAI` query → highlights on → prompt demands quote.
- **Evidence:** “this quote didn’t work… include highlights equals true… now… exact quote.”
- **Conditions:** Pinecone Assistant + HTTP.
- **Exceptions:** He says not always best once the store is large / fee matters.
- **Action:** Steal highlights-or-it-isn’t-a-cite + idle-fee. Do not buy Pinecone. Do not quote 4.1%/384k as FACT.
- **Confidence:** high as the miss-then-fix; $ / tok UNVERIFIED.
- **Source:** `QojPKL96Dx4` @ UNKNOWN
- **Epistemic:** SOURCE
- **Knowledge type:** demonstrated (speech)
- **Modality:** speech
- **Evidence status:** transcript-implied
- **Shown / clicked / sequenced:** UNKNOWN
- **Failed / retried:** fake quote → highlights
- **Speech ≠ behavior:** “<5 minutes” vs docs dive

## C. Mental Models
Beginner RAG should not start with a chunk pipeline. Read the API when behavior is wrong. Priority: trust via quote. Uncertainty: 5¢, 15×.

## D. Procedures
1. If the “quote” doesn’t Ctrl+F → you got a summary; find the highlight flag.
2. Demand doc/page/quote in the system prompt (the tool may already have it).
3. Set the model **in the request**, not only the playground.
4. Ask: am I paying per idle hour?
Avoid: Pinecone $; Plus; vector-first; quote earnings as FACT.

## E. Examples
**Nike fake quote:** Situation → Q4 revenue. Action → agent prints a sentence. Reasoning → content field is a summary. Outcome → 0 hits in the PDF. Lesson → steal the flag.

**4.1% card:** Situation → same prompt, three stores. Action → Assistant vs two vectors. Reasoning → they own chunking. Outcome → Assistant right/cheap; others miss. Lesson → steal the card; numbers UNVERIFIED.

## F. Decision Rules
- IF cite must Ctrl+F → require highlights.
- IF playground model changed but API didn’t → expect the old model.
- IF the assistant is “active” 24/7 → idle bill (his).
- IF DIY vector is the first move → ask if a managed assistant (on-tape) or full-doc is enough — we still don’t buy.

## G. Contrarian
Rejects “real RAG = you chunk.” Field: more pipeline. He: drop file + flag. We steal the flag, not the 5¢.

## H. Assumptions
Theirs: 5¢ is cheap. Ours: UNVERIFIED; no Pinecone. Falsifier: a highlight that still isn’t in the PDF. Survivorship: three 10-Ks.

## I. Questions
Same question-shape tape as `kOKavHnlPik`? Kashef tape?

## J. Connections
- SYSTEM SYNTHESIS → `kOKavHnlPik` · `XTBWVVcF3Pk` · `lokbsA5VXOk` (idle store bills).

## K. Future-Use
Highlights-or-not-a-cite. Idle-assistant-bills. Unassigned Pinecone.

## Steal / Operate-never

### Machine: demand quote → if Ctrl+F fails, turn on highlights; price the idle hour — don’t buy
- **Epistemic:** SOURCE
- **Workflow / loop:** ask with required cite → paste the quote into the source → if 0 hits, find the highlight lever → ask about idle $
- **Questions / signals:** Summary or quote? Playground vs API model? 5¢/hr?
- **Qualify / frame / objections:** “Drop a file and trust” is the fail. 0-hit quote is the tell.
- **Procedure:** No Pinecone key. No Plus. No earnings as FACT.
- **Example that proves it:** Situation → Nike quote. Action → highlights true. Reasoning → docs. Outcome → Ctrl+F hits. Lesson → steal the lever.
- **Why it works:** A highlight is checkable; a summary dressed as a quote is a lie.
- **Conditions / exceptions:** 5¢ / 1277 tok UNVERIFIED.
- **Operate-never payload:** Pinecone pay; Plus; quote 4.1% as FACT.
- **Hive run (existing skills only):** `golden-test-loop` · `coverage-loop`.
- **Source:** `QojPKL96Dx4` @ UNKNOWN

### Operate-never
- Pinecone / n8n-cloud / Plus.
- Send / pay / deploy / book / publish.

## L. Role-Specific Applications
**One next:** `coverage-loop` score this packet as highlights-or-not-a-cite. Clients parked.
