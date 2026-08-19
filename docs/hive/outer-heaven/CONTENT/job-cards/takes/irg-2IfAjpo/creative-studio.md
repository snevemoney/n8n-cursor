# Creative Studio — irg-2IfAjpo
Status: filled
Protocol: deep-video-learning
**Source:** `docs/hive/outer-heaven/CONTENT/watch-later/packets/irg-2IfAjpo/full.txt`
**Packet LEARNED:** `docs/hive/outer-heaven/CONTENT/watch-later/packets/irg-2IfAjpo/LEARNED.md`
**ICP:** parked unless Evens named one.

## A. Source Map
Nate: Gemini **File Search** as cheap RAG without a Pinecone/Supabase pipeline. Beats: upload → Google chunks/embeds → chat; not magic; **15¢ / 1M** index tokens, **121-page ~95k** “not a tenth of 15¢,” storage free (on-tape), query ≈ model $; table vs PG-vector / Pinecone Assistant / OpenAI store (Pinecone **5¢/h** he left off the table) — all UNVERIFIED; four HTTP: **create store** (folder) → **upload** (temp, expires) → **import** into store → **generateContent** query; Google docs “not my favorite”; Mark Kashef tip: view-as-markdown → LLM; query-auth `key=` not paste-every-node; pin store name; form drop **Rules of Golf** (~22p); binary field name must match; club-breaks → rule 4, cite; second file **Nvidia** Q1 FY25 ($26B / $22B DC — UNVERIFIED, he checks the PDF); tool returns candidates + **grounding metadata** chunks + supports; third file Apple 10-K; 10 mixed questions, first run wrong key (8 errors), second **4.2/5**, one “2”; ~200 pages, three unrelated PDFs, one store, almost no prompt. Final: not magic — **re-upload = dupes** (no update/delete story), GIGO / OCR, **chunk ≠ whole-doc** (“how many rules?” → **5**, last rule 28 is fine), **PII/HIPAA/GDPR** now on Google. Skool JSON + Plus. Visual: four HTTP, golf cite, grounding chunks.

## B. Atomic Knowledge

### Folder, temp file, then import
- **Claim:** Upload is not in the store. The object expires if you do not import. Query must name the store. Four calls, not “drop a PDF.”
- **Evidence:** “upload it to just like the Google Cloud environment, but that doesn’t yet mean it’s in the folder… if you don’t move it into a folder by this date, it will expire.”
- **Conditions:** File Search API as of this tape.
- **Exceptions:** A “direct upload to store” path exists in the docs; he followed import.
- **Action:** Learn the four beats; do not install Gemini / n8n.
- **Confidence:** SOURCE.
- **Source:** `irg-2IfAjpo` @ UNKNOWN
- **Epistemic:** SOURCE

### Chunk retrieval cannot count the book
- **Claim:** Semantic search is a needle. “How many rules?” returned 5 because no chunk saw the whole list. Rule 28 as a needle worked.
- **Evidence:** “it actually couldn’t look through the entire document in one swoop… if I asked about the last rule, which is rule 28, it would get it right.”
- **Conditions:** One store, mixed PDFs, almost no metadata.
- **Exceptions:** He says heavy metadata might help; still not his first path for “whole transcript.”
- **Action:** If the question is a count/summary of the whole, do not use this store.
- **Confidence:** SOURCE.
- **Source:** `irg-2IfAjpo` @ UNKNOWN
- **Epistemic:** SOURCE

### Cite the chunk, not the vibe
- **Claim:** The useful still is grounding metadata: which chunk, which file, which sentence span. “Helpful RAG, cite sources, query = text only (no `?` / newlines)” is the JSON-safe prompt.
- **Evidence:** “these are all the actual chunks that it pulled… grounding supports… where it started and where it ended.”
- **Conditions:** 4.2/5 on 10 hard mixed questions (UNVERIFIED as a bench).
- **Exceptions:** Wrong API key looks like a dumb agent.
- **Action:** Plate the cite. Do not upload PII.
- **Confidence:** SOURCE.
- **Source:** `irg-2IfAjpo` @ UNKNOWN
- **Epistemic:** SOURCE

## C. Mental Models
Cheap is the feed reason; four HTTP is the job. Dupes rot quality. GIGO. Store ≠ private. 15¢ table is a slide, not a rate.

## D. Procedures
(Learn.) Create store → pin name → upload binary → import before expiry → query with fromAI text-only → read grounding → eval on mixed docs → never put secrets in the store.
Avoid: Gemini File Search / n8n / Pinecone; 15¢ / 4.2 / $26B as FACT; Skool; PII.

## E. Examples
**Situation:** Club breaks.  
**Action:** Short rule + “rule 4 clubs.”  
**Lesson:** The plate is the cite, not “chat with PDFs.”

**Situation:** How many rules?  
**Action:** Answers 5.  
**Lesson:** Count questions are the anti-demo.

## F. Decision Rules
- If you need the whole doc → not chunk search (on tape).
- If you re-upload a new version → you now have two truths.
- If the file has PII → do not use Google’s store.
- If $ / 15¢ / 4.2 / 5¢/h from this tape → UNVERIFIED.

## G. Contrarian
The “no pipeline” sell still has four HTTP, a confusing Google doc, an expiry window, and a count question it cannot answer.

## H. Assumptions
All $ and 4.2 UNVERIFIED. On-tape Gemini / n8n / Pinecone. Clients parked.

## I. Questions
Visual of the comparison table? What was the score-2 question? Did he ever delete a file?

## J. Connections
- SYSTEM SYNTHESIS → `QojPKL96Dx4` (Pinecone Assistant + highlights).
- SYSTEM SYNTHESIS → `kOKavHnlPik` (human-would-filter/pivot/read).
- SYSTEM SYNTHESIS → `oWdJMJp2HgM` (no secrets in the body).

## K. Future-Use
Four-beat import + “don’t ask it to count the book.” Unassigned.

## Steal / Operate-never

### Machine: import before expiry, then cite the chunk
- **Epistemic:** SOURCE
- **Workflow / loop:** store → upload → import → text-only query → read grounding spans → eval mixed docs → if the Q is a whole-doc count, stop
- **Questions / signals:** Expired temp file? Dupes? PII? Wrong key?
- **Qualify / frame / objections:** Cheap ≠ magic; pipeline was hidden, not deleted
- **Procedure:** Query-auth once; pin the store name; no punctuation in the tool query
- **Example that proves it:** Rule 4 cite; “how many rules?” = 5; 4.2 after a bad-key run
- **Why it works:** Google owns chunk/embed; you still own expiry, dups, and the question type
- **Conditions / exceptions:** $ UNVERIFIED
- **Operate-never payload:** Gemini / n8n / Pinecone; PII upload; 15¢ as FACT
- **Hive run:** `info-gain-cite`; `golden-test-loop`; `ask-principal`
- **Source:** `irg-2IfAjpo` @ UNKNOWN

### Operate-never
- Install Gemini File Search / n8n / Pinecone. Upload PII. Join Skool/Plus.
- Quote 15¢ / 4.2 / $26B as FACT. New hunt.
- Merge `LESSONS-FROM-TAPE.md`. Game-studio / fake 3D / cheap taste / NSFW.

## L. Role-Specific Applications
Video-first: **grounding chunks + rule-4 cite** are the plates. Do not ship “chat with any PDF.” The count-fail (5 vs 28) is the honesty still. HITL. Clients parked.
