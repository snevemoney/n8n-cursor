# Librarian — irg-2IfAjpo
Status: filled
Protocol: deep-video-learning
**Source:** `docs/hive/outer-heaven/CONTENT/watch-later/packets/irg-2IfAjpo/full.txt`
**Packet LEARNED:** `docs/hive/outer-heaven/CONTENT/watch-later/packets/irg-2IfAjpo/LEARNED.md`
**ICP:** parked unless Evens named one.
**Title:** Gemini's New File Search Just Leveled Up RAG Agents (10x Cheaper)
**Channel:** Nate Herk | AI Automation
**Kind:** video (~4696 words)
**Captions:** yt-dlp — timestamp UNKNOWN (no VTT unless noted)
**Walked:** 2026-08-14 librarian re-walk. Did not merge `LESSONS-FROM-TAPE.md`. Clients parked. Did not overwrite `takes/librarian.md` (18-tape SSOT).

## A. Source Map
1. Gemini File Search: upload → they chunk/embed → chat. Cuts the Pinecone/Supabase pipeline. Honest: not magic. Price (his table, UNVERIFIED): **$0.15 / 1M** index tokens; 121-page PDF ~95k tokens; **storage free**; query ≈ chat-model only (+ possible high-query base). 100GB + 1M queries: ~$12 index once + ~$35 first month vs Supabase (more ops) vs Pinecone Assistant / OpenAI store (storage + **$0.05/hr** not even in his table). “10x cheaper” is the title.
2. Four HTTP steps: **create store** (“folder”) → **upload** to Google (temp, **expires** if not moved) → **import** into the store → **generateContent** query. Docs he dislikes; tip (Kashef): view-as-markdown → LLM helps the requests.
3. n8n: query-param `key` → better as generic query-auth credential. Create store `YouTube-test`, pin `name`. Form drop **Rules of Golf** (~22p) as binary. Resumable upload to `/files`. Import: store name **in the path** (not `?`), file name from upload. Query: Gemini 2.5 Flash, store name in body, `$fromAI` question; prompt: cite, **no punctuation in the tool query** (JSON). Club-breaks → rule 4, grounded. Second file Nvidia PR: Q1 FY25 **$26B / $22B DC** (UNVERIFIED) + press-release cite. Tool payload: candidates text + **grounding metadata** chunks + supports (char spans).
4. Eval: three PDFs (golf 22 + Nvidia 9 + Apple 10-K 121) / 10 Qs. First run **wrong API key**, 8 errors. Second: **4.2/5** (one **2**). ~200 pages, mixed domains, thin prompt.
5. Not magic: re-upload = **dupes** (no update/delete hygiene) → quality dies. GIGO / OCR / preprocess scans. Chunk RAG cannot count “how many rules?” → said **5** (true last rule **28**). Privacy: files live on Google; no PII; GDPR/HIPAA/CCPA. Skool JSON + Plus 200 (UNVERIFIED).
Gap: exact HTTP bodies. Timestamp UNKNOWN. Gemini/n8n/Skool on-tape. Complements `QojPKL96Dx4` / `kOKavHnlPik`.

## B. Atomic Knowledge

### Managed RAG is cheap until dupes, chunks, or PII
- **Claim:** File Search is create→upload→import→query. Temp upload expires. Agent writes the question; strip punctuation. Grounding chunks exist — use them. Title-10x is a table, not a law. Do not chunk-count a whole doc. Do not put PII on Google.
- **Reasoning:** You traded pipeline pain for vendor hygiene pain (dupes, privacy, whole-doc questions).
- **Mechanism:** four HTTP + query-auth + fromAI + cite prompt + eval.
- **Evidence:** golf rule 4; Nvidia cite; 4.2/5; “5 rules” fail; key-typo 8 errors.
- **Conditions:** $0.15 / $12 / $35 / 10x UNVERIFIED. Storage-free “as of right now.”
- **Exceptions:** Needle-in-haystack is the job it is for.
- **Action:** File four-step + expire-if-not-moved + dupe-hygiene + chunk-cannot-count. Do not install Gemini File Search. No PII. 10x not FACT.
- **Confidence:** high as a managed-RAG machine
- **Source:** `irg-2IfAjpo` @ UNKNOWN
- **Epistemic:** SOURCE
- **Knowledge type:** declared + demonstrated (transcript-implied)
- **Modality:** speech
- **Evidence status:** transcript-implied
- **Shown / clicked / sequenced:** UNKNOWN
- **Failed / retried:** wrong key; “5 rules”
- **Speech ≠ behavior:** “just drop a file” vs four HTTP + auth + import-before-expiry

## C. Mental Models
Folder not magic. Temp blob ≠ indexed. Grounding is in the payload. Cheap query, expensive mistake (PII/dupes).

## D. Procedures
1. Create store; pin the name.
2. Upload binary; import before expiry.
3. Query with fromAI; no punctuation in the tool string; cite.
4. Read grounding chunks, not only the sentence.
5. Eval mixed docs; fix the key first.
6. Plan update/delete; preprocess garbage; never PII.
Avoid: Gemini as hive; 10x as FACT; Apple/Nvidia $ as FACT; HIPAA files on Google.

## E. Examples
**Club breaks:** Situation — golf PDF. Action — fromAI query. Outcome — rule 4 + cite. Lesson — one-doc needle.

**How many rules:** Situation — count. Action — chunk search. Outcome — 5 vs 28. Lesson — wrong retrieve (see `kOKavHnlPik`).

## F. Decision Rules
- IF the Q needs the whole doc → not File Search.
- IF the file has PII → do not upload.
- IF you re-drop the same PDF → you are poisoning the store.
- Refuse: Gemini as hive; 10x as FACT.

## G. Contrarian
Against “pipeline-or-nothing.” Against “drop-file is production.”

## H. Assumptions
Complements `QojPKL96Dx4` (highlights) and `kOKavHnlPik`. Caption-only.

## I. Questions
Is storage still free? What’s the query base fee really?

## J. Connections
SYSTEM SYNTHESIS → `QojPKL96Dx4`; `kOKavHnlPik`; `QCjMBOEhpLE`.

## K. Future-Use
Four-step managed RAG + expire-window + dupe-hygiene + chunk-cannot-count as atoms.

## Steal / Operate-never

### Machine: create/upload/import/query; eval; never PII; don’t count with chunks
- **Epistemic:** SOURCE
- **Workflow / loop:** store → upload → import before expiry → fromAI query → read grounding → eval 10 Qs → checkable stop = a cite you can open, not a 4.2 average
- **Questions / signals:** Whole-doc or needle? Update or dupe? PII?
- **Qualify / frame / objections:** Cheap vs Pinecone hour-meter; not magic.
- **Procedure:** D above.
- **Example that proves it:** rule 4; 5-vs-28; wrong key.
- **Why it works:** Vendor index is a trade: less pipeline, more hygiene.
- **Conditions / exceptions:** $ UNVERIFIED; storage-free may change.
- **Operate-never payload:** Gemini as hive; 10x as FACT; PII upload; n8n-cloud.
- **Hive run:** Same retrieve-routing. Do not add Gemini File Search.
- **Source:** `irg-2IfAjpo` @ UNKNOWN

### Operate-never
- Gemini File Search as hive. Quote 10x as FACT. Upload PII. Merge LESSONS. Send / pay / deploy / book / publish.

## L. Role-Specific Applications
File chunk-cannot-count next to four-way retrieve. Do not add a Google store.
