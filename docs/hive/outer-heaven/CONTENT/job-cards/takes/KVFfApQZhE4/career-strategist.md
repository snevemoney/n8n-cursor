# Career Strategist — KVFfApQZhE4
Status: filled
Protocol: deep-video-learning
**Source:** `docs/hive/outer-heaven/CONTENT/watch-later/packets/KVFfApQZhE4/full.txt`
**Packet LEARNED:** `docs/hive/outer-heaven/CONTENT/watch-later/packets/KVFfApQZhE4/LEARNED.md`
**ICP:** parked unless Evens named one.

## A. Source Map
Short (1:48, 524 words). Gemini File Search in n8n. Beats: (1) drop a document, embeddings happen, chat immediately — no “huge massive data pipeline” (2) four HTTP steps: create store (“folder”), upload file to Google Cloud, move file into the store, query (3) agent hooked to the query tool (4) demo PDF: rules of golf, ~22 pages (5) ask: what happens if your club breaks during the round (6) short answer: if broken in normal play, continue / repair / replace; source = knowledge base, rule 4 clubs (7) CTA. Gemini/Google Cloud on-tape.

## B. Atomic Knowledge

### Managed file search vs home-rolled pipeline
- **Claim:** File Search lets you skip building the embed pipeline; four HTTP calls replace it.
- **Reasoning:** Upload ≠ in-the-folder; you must move into the store after upload.
- **Mechanism:** create store → upload → move → query.
- **Evidence:** “without having to build a huge massive data pipeline” + three-step put-in-folder. @ UNKNOWN
- **Conditions:** Gemini File Search API available.
- **Exceptions:** Hive does not install Gemini; steal the *move-after-upload* distinction.
- **Action:** Never assume upload equals searchable.
- **Confidence:** high as his wiring.
- **Source:** `KVFfApQZhE4` @ UNKNOWN
- **Epistemic:** SOURCE

### Answer plus where it came from
- **Claim:** The agent returned a short rule and named the document/rule number.
- **Reasoning:** Citation is part of done for a rules question.
- **Mechanism:** brain → knowledge-base tool → short answer + source.
- **Evidence:** “It showed us the source was from the knowledge base from this document. And then rule four, clubs.” @ UNKNOWN
- **Conditions:** The PDF is in the store.
- **Exceptions:** Questions outside the PDF (not shown).
- **Action:** Require a source line on fact answers.
- **Confidence:** high as this demo.
- **Source:** `KVFfApQZhE4` @ UNKNOWN
- **Epistemic:** SOURCE

## C. Mental Models
“Folder” is a friendlier word for store. Upload and index are different states. Golf rules are a good eval corpus because answers are checkable.

## D. Procedures
Create store → upload → move into store → query via agent tool → ask a known rules question → check source.  
Avoid: querying after upload but before move.

## E. Examples
**Situation:** 22-page golf rules PDF.  
**Action:** Four HTTP steps; ask broken-club rule.  
**Reasoning:** Known-answer + citation.  
**Outcome:** Continue/repair/replace; rule 4.  
**Lesson:** Source line is the receipt. Implicit rule: move is the easy-to-skip step.

## F. Decision Rules
- If it is not in the store, do not debug the prompt.
- If the answer has no source, it is not done for a rules question.
- Do not build a giant pipeline when a managed store fits — and do not install his managed store as hive.

## G. Contrarian
Rejects DIY chunk pipelines as the default (contrast `Fu6vOfzFmcw` which builds one).

## H. Assumptions
**Theirs:** Gemini File Search, 22 pages, rule text correct. **Ours:** vendor; golf is demo. Falsifier: a move that silently fails.

## I. Questions
- Multi-file stores? Deletes?
- Cost vs Supabase path?

## J. Connections
- SYSTEM SYNTHESIS → `QrJhdTbK3TU` (OpenAI file search).
- SYSTEM SYNTHESIS → `Fu6vOfzFmcw` / `ZwQ8rJhVCr4`.
- SYSTEM SYNTHESIS → `info-gain-cite`.

## K. Future-Use
Unassigned: upload-vs-indexed as a vault hygiene check.

## Steal / Operate-never

### Machine: index-then-ask, require a source line
- **Epistemic:** SOURCE + SYSTEM SYNTHESIS
- **Workflow / loop:** create store → put file in store (not merely uploaded) → ask a known question → demand source → stop
- **Questions / signals:** Is it in the folder or only in the cloud dump? Which rule/page?
- **Qualify / frame / objections:** Managed API is optional. Citation is not.
- **Procedure:** Four states. Known-question smoke.
- **Example that proves it:** Broken club / rule 4 (E).
- **Why it works:** Searchable ≠ uploaded (B/C).
- **Conditions / exceptions:** Checkable corpora. Offer letters still full-read.
- **Operate-never payload:** Gemini as hive; auto-answer legal/HR from a PDF; quit-job.
- **Hive run:** `info-gain-cite` · `golden-test-loop` · `context-docs`
- **Source:** `KVFfApQZhE4` @ UNKNOWN

### Operate-never
- Install Gemini / Google Cloud as stack.
- Auto-answer employment/legal from a PDF. Quit-job. Unpark clients.
- Merge LESSONS. Auto-write `SKILL.md`.

## L. Role-Specific Applications
Employment still covers baseline. Career analog: a policy PDF in the vault is not usable until it is *in* the vault and a known question cites it. Gym answers need a source receipt. Clients parked.
