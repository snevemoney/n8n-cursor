# Creative Studio — QojPKL96Dx4
Status: filled
Protocol: deep-video-learning
**Source:** `docs/hive/outer-heaven/CONTENT/watch-later/packets/QojPKL96Dx4/full.txt`
**Packet LEARNED:** `docs/hive/outer-heaven/CONTENT/watch-later/packets/QojPKL96Dx4/LEARNED.md`
**ICP:** parked unless Evens named one.

## A. Source Map
Pinecone **Assistant** as 5-minute RAG (vs DIY vector). Beats: three earnings PDFs; agent cites doc/page/quote; Tesla page 4 vs agent “3–7”; Nike/Nvidia page 1 checks; playground chat + drag files; **$0.05/hour active** (UNVERIFIED); n8n has Pinecone *vector* node, not Assistant → HTTP import-curl from “chat with assistant”; key once (or reuse native cred); `$fromAI("search query")` so the model writes the query (Tesla deliveries = two searches, 2025 and 2024); no system prompt = right numbers, no cite; prompt “always cite document, page, section, exact quote” — still no quote because Assistant `content` is a **summary**; Nike quote Ctrl-F = 0 hits; docs: `include_highlights=true` adds the real span; playground model ≠ API model (must set in the body); bake-off Tesla operating margin **4.1%** (UNVERIFIED): Assistant ~1,277 tokens + cite; Pinecone vector ~30k tokens, wrong; Supabase ~5k, wrong. Credit Mark Kashef. Skool template + Plus ~200. Visual: hover cites, lighting apology aside.

## B. Atomic Knowledge

### Assistant hides chunking; highlights are the cite
- **Claim:** Drop-file works because Pinecone indexes/embeds/chunks. The chat `content` is a summary — exact quote only if `include_highlights` is on.
- **Evidence:** Nike quote failed Ctrl-F until highlights; “this is not an exact textbased quote.”
- **Conditions:** HTTP body must persist model + highlights (playground choice does not).
- **Exceptions:** Tesla page span 3–7 vs his Ctrl-F on 4 — cite can be a range.
- **Action:** Demand highlights; verify with Ctrl-F; do not open Pinecone.
- **Confidence:** SOURCE.
- **Source:** `QojPKL96Dx4` @ UNKNOWN
- **Epistemic:** SOURCE

### The agent writes the query
- **Claim:** A static Pride-and-Prejudice example in the curl is a trap. `$fromAI` lets the agent decide query text and how many hits.
- **Evidence:** Two tool runs: “Tesla vehicle delivers Q2 2025” then 2024.
- **Conditions:** Tool description = “talk to your knowledge base.”
- **Exceptions:** Without a cite prompt, it will not surface page/doc even when the API returned them.
- **Action:** Dynamic query + cite instruction as a pair.
- **Confidence:** SOURCE.
- **Source:** `QojPKL96Dx4` @ UNKNOWN
- **Epistemic:** SOURCE

### Fast RAG can beat a sloppy vector
- **Claim:** Same prompt/docs: Assistant got 4.1% + cite cheap; his vector/Supabase pipelines missed and cost more tokens.
- **Reasoning:** Beginners skip metadata/split work; Assistant is a playground, not always best (idle $0.05/h).
- **Evidence:** “I’m not saying that the Pine Cone Assistant is always the best option.”
- **Conditions:** One bake-off, his chunking.
- **Exceptions:** Idle meter vs “spin up and play.”
- **Action:** Learn the bake-off; $ / 4.1% UNVERIFIED.
- **Confidence:** SOURCE as his run.
- **Source:** `QojPKL96Dx4` @ UNKNOWN
- **Epistemic:** SOURCE

## C. Mental Models
Read the API when the quote is a lie. Playground ≠ production body. Trust = document + page + Ctrl-F-able span. Night-editing lighting is an aside, not a lesson.

## D. Procedures
1. Create assistant; drop files; note the hourly meter.
2. Import chat curl; key; `$fromAI` query; highlights true; set model in body.
3. System: cite doc/page/section/quote.
4. Ctrl-F the quote in the PDF.
5. Optional: same Q vs your vector to see miss/token tax.
Avoid: Pinecone/n8n-cloud; 4.1% / $0.05 as FACT; Skool JSON.

## E. Examples
**Situation:** Nike Q4 revenue, cite prompt on, highlights off.  
**Action:** Confident quote, 0 PDF hits.  
**Lesson:** Summary wearing a quote costume.

**Situation:** Same 4.1% question, three stores.  
**Action:** Assistant hits; vector/Supabase miss.  
**Lesson:** Pipeline quality, not the word RAG.

## F. Decision Rules
- If the quote fails Ctrl-F → turn on highlights or stop trusting.
- If the curl still asks Pride and Prejudice → you forgot `$fromAI`.
- If the assistant is idle all week → the $0.05/h is the product (on-tape).
- If earnings $ from this tape → UNVERIFIED.

## G. Contrarian
“Easiest RAG” still required reading the docs for one boolean. Native Pinecone node is the wrong verb (vector ≠ assistant).

## H. Assumptions
4.1%, 384k vehicles, 13%, $0.05/h, token counts UNVERIFIED. On-tape n8n/Pinecone/OpenRouter. Clients parked.

## I. Questions
What does the highlights blob look like raw? Visual of the three-agent bake-off? Did $0.05 stay?

## J. Connections
- SYSTEM SYNTHESIS → `kOKavHnlPik` / `irg-2IfAjpo` (RAG sisters).
- SYSTEM SYNTHESIS → `info-gain-cite`; `lokbsA5VXOk` (demand cite).
- SYSTEM SYNTHESIS → `lcNN3X9gXls` (evals on RAG).

## K. Future-Use
`include_highlights` as a cite-lever card. Unassigned.

## Steal / Operate-never

### Machine: dynamic query + highlights + Ctrl-F
- **Epistemic:** SOURCE
- **Workflow / loop:** drop docs → agent writes search query → require highlights → plate must Ctrl-F → else fail
- **Questions / signals:** Is `content` a summary? Did playground model leak into API?
- **Qualify / frame / objections:** Vector miss can be your chunking, not “RAG is dead”
- **Procedure:** Cite prompt + body flags together
- **Example that proves it:** Fake Nike quote; 4.1% Assistant vs 30k-token miss
- **Why it works:** Trust is a span in the PDF, not a fluent sentence
- **Conditions / exceptions:** Idle hourly fee; $ UNVERIFIED
- **Operate-never payload:** Pinecone/n8n-cloud; 4.1% as FACT; Skool
- **Hive run:** `info-gain-cite`; `golden-test-loop`; `ask-principal`
- **Source:** `QojPKL96Dx4` @ UNKNOWN

### Operate-never
- Install Pinecone / n8n-cloud. Join Skool/Plus.
- Quote 4.1% / $0.05 as FACT. New hunt.
- Merge `LESSONS-FROM-TAPE.md`. Game-studio / fake 3D / cheap taste / NSFW.

## L. Role-Specific Applications
Video-first: **Ctrl-F hit vs 0-hit** is the plate. Steal the cite costume problem, not the Pinecone CTA. HITL. Clients parked.
