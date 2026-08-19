# Consultant — KVFfApQZhE4
Status: filled
Protocol: deep-video-learning
**Source:** `docs/hive/outer-heaven/CONTENT/watch-later/packets/KVFfApQZhE4/full.txt`
**Packet LEARNED:** `docs/hive/outer-heaven/CONTENT/watch-later/packets/KVFfApQZhE4/LEARNED.md`
**ICP:** parked unless Evens named one.

## A. Source Map

Gemini File Search teaser (short twin of `irg-2IfAjpo`). Beats: drop a document, embeddings happen, chat immediately — skip a huge RAG pipeline. In n8n: four HTTP calls — (1) create store (“folder”), (2) upload file to Google Cloud (not yet in the folder), (3) move file into the store, (4) query via an agent tool. Demo PDF: ~22-page rules of golf. Ask: what if your club breaks during the round? Answer: continue / repair / replace if broken in normal play; cites knowledge base + rule 4. CTA to the long. No VTT. UNKNOWN. ~524 words.

## B. Atomic Knowledge

### Managed file search vs a home-rolled pipeline
- **Claim:** File Search lets you drop a doc, get embeddings, and query without building the Drive→chunk→vector graph.
- **Reasoning:** The pipeline is the cost; a managed store is the shortcut he is selling.
- **Mechanism:** Create store → upload → move into store → query tool.
- **Evidence:** “without having to build a huge massive data pipeline that looks like this.”
- **Conditions:** One PDF. Gemini File Search on tape. “10x cheaper” is in the title, not proven in this short’s words.
- **Exceptions:** Managed = vendor lock-in and a four-call HTTP ritual anyway.
- **Action:** Steal “query must cite the store.” Do not install Gemini.
- **Confidence:** high as a contrast; low as 10x
- **Source:** `KVFfApQZhE4` @ UNKNOWN — “drop in a file and get answers back”
- **Epistemic:** SOURCE
### Upload ≠ in the store
- **Claim:** Uploading to Google Cloud does not put the file in the File Search store; a third call must move it.
- **Reasoning:** Builders will query an empty store if they skip the move.
- **Mechanism:** Upload → move → then query.
- **Evidence:** “that doesn't yet mean it's in the folder.”
- **Conditions:** Four-request setup.
- **Exceptions:** API shapes may change.
- **Action:** Treat “in the store” as a checkable stop before asking a question.
- **Confidence:** high
- **Source:** `KVFfApQZhE4` @ UNKNOWN — “take this file and we're going to move it into the folder”
- **Epistemic:** SOURCE
### Answer plus where it came from
- **Claim:** The golf-club answer includes a short rule and names the knowledge-base document / rule 4.
- **Reasoning:** A cite is part of the toddler stop, not a nice-to-have.
- **Mechanism:** Ask a known-rule question → require source in the reply.
- **Evidence:** “It showed us the source was from the knowledge base from this document. And then rule four, clubs.”
- **Conditions:** Rules-of-golf PDF. One question.
- **Exceptions:** Cite can be hallucinated. One Q ≠ eval.
- **Action:** Require a source line. Then score more questions.
- **Confidence:** high as a demo habit
- **Source:** `KVFfApQZhE4` @ UNKNOWN — “tells us where it got it from”
- **Epistemic:** SOURCE


## C. Mental Models

He wants RAG to feel like “drop a PDF.” He still shows four HTTP steps — the shortcut is not zero-work. He picks a public rules PDF so the answer is checkable. He is in a Gemini launch week. Title’s “10x cheaper” is not walked on this short.

## D. Procedures

1. Create store. 2. Upload. 3. Confirm move-into-store. 4. Ask a question you can check in the PDF. 5. Demand a source. Avoid: calling this cheaper/accurate from the title. Avoid: installing Gemini HTTP.

## E. Examples

**Situation:** 22-page golf rules PDF. **Action:** Four HTTP steps; ask club-breaks. **Outcome:** Plausible rule + cite. **Lesson:** Empty-store trap (upload ≠ moved). Implicit rule: source line is part of the answer.

## F. Decision Rules

If the file is not in the store, do not query. If the answer has no source, fail the smoke test. If you need 10x cheaper, this short does not prove it.

## G. Contrarian

Field default: always build Drive→Supabase. He shows a managed alternative. Field default: answer-only. He shows a cite.

## H. Assumptions

Gemini/Google on-tape. 10x in the title UNVERIFIED. One PDF, one Q. HTTP four-step may rot. Golf is not a client.

## I. Questions

What does `irg-2IfAjpo` add? Cost numbers? Failure cases?

## J. Connections

**SYSTEM SYNTHESIS:** Long/twin `irg-2IfAjpo`. Contrast `Fu6vOfzFmcw` (home-rolled). Maps to `wiki-ingest` + `golden-test-loop` + `info-gain-cite`.

## K. Future-Use

Unassigned: upload-vs-in-store as a general “object not in collection yet” atom; cite-required smoke test.

## Steal / Operate-never

### Machine: Managed store: create → upload → move → cited smoke question
- **Epistemic:** SOURCE
- **Workflow / loop:** Create store → upload file → move into store (checkable) → ask a question you can verify in the doc → require a source line → stop
- **Questions / signals:** Is the file in the store? Can we point at the page/rule? Are we quoting 10x?
- **Qualify / frame / objections:** Qualify: they have a doc to drop, not a pipeline fetish. Frame: skip the huge graph. Objection: “just chat the PDF in the vendor UI” — he still wires n8n HTTP.
- **Procedure:** Do not skip move. Do not install Gemini. Do not quote 10x as FACT.
- **Example that proves it:** Golf rules PDF → club-breaks question → rule 4 cite.
- **Why it works:** Managed search removes chunk plumbing; it does not remove “is it in the store?” or “where did you get that?”
- **Conditions / exceptions:** Vendor on-tape. One Q. Title 10x unverified.
- **Operate-never payload:** Install Gemini File Search. Quote 10x cheaper as FACT. Sell golf-rules RAG.
- **Hive run (existing skills only):** `wiki-ingest` · `golden-test-loop` · `info-gain-cite` · `ask-principal`
- **Source:** `KVFfApQZhE4` @ UNKNOWN


### Operate-never
- Install Gemini File Search.
- Quote “10x cheaper” as FACT.
- Query before the file is in the store.
- Unpark a client / new `icp_id` / new `business-lanes.json` row. Learning ≠ hunt.
- Quote tape $ / student counts / job-loss % / hours×rate as FACT.
- Send / pay / deploy / book / publish. Approve draft ≠ send.
- Install on-tape vendors (Claude, Codex, ChatGPT, Gemini, Coda, Vapi, Abacus, n8n-cloud, Skool). Stack stays Cursor + Grok.
- Grok Bot / `sendPrompt`. Merge `LESSONS-FROM-TAPE.md`. Auto-write SKILL.md. Overwrite `takes/consultant.md` or another desk's take.

## L. Role-Specific Applications

**Constraint first:** The stated ask is “level up RAG / 10x cheaper.” Felt problem is wrong answers or a brutal pipeline — if named. Do not add Gemini HTTP to a parked client.

**Four-blank after constraint:** Toddler stop = file-in-store + cited answer to a known question.

**Skeptical-customer:** 10x is title smash. Clients parked.
