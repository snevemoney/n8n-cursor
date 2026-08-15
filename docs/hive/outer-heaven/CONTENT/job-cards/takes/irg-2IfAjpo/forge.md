# Forge — irg-2IfAjpo
Status: filled
Protocol: deep-video-learning
**Source:** `docs/hive/outer-heaven/CONTENT/watch-later/packets/irg-2IfAjpo/full.txt`
**Packet LEARNED:** `docs/hive/outer-heaven/CONTENT/watch-later/packets/irg-2IfAjpo/LEARNED.md`
**ICP:** parked unless Evens named one.

## A. Source Map
Nate Herk **Gemini File Search** in n8n (honest “not magic”). Beats: upload → Google chunks/embeds → chat; skip Pinecone/Supabase pipeline; **$0.15 / 1M** index tokens; 121p PDF **~95k** ≈ pennies; **storage free** (as taped); query ≈ model $ + possible high-volume base; vs PG-vector (more ops), Pinecone Assistant / OpenAI store (storage + **$0.05/hr** not in his table) UNVERIFIED. Four HTTPs: **create store** → **upload** (temp, expires) → **import into store** (store name in **path**, not `?`) → **generateContent** query. Docs ugly; Mark Kashef: view-as-md → LLM. Query-auth `key=` once, reuse. Pin store name. Form drop golf-rules PDF → club-breaks Q → rule 4 cite → add Nvidia PR (rev **$26B / DC $22B** UNVERIFIED) → payload has **candidates + grounding metadata + chunk supports** → eval 3 PDFs (golf 22p, Nvidia 9p, Apple 10-K 121p) mixed store, 10 Qs: first run **wrong key** 8 errors; second **4.2/5** (one 2). Considerations: **not magic** — update = **dupes** (no lifecycle); GIGO / OCR / preprocess; **don’t chunk** when you need the whole (golf “how many rules?” → **5** because chunks; last rule 28 works); **PII/HIPAA/GDPR** — files live on Google. Skool + Plus. Timestamp UNKNOWN. Gemini / n8n / Google on-tape.

## B. Atomic Knowledge

### Drop-in RAG is cheap and leaks; dups and whole-doc questions break it
- **Claim:** Managed file search is a speed trade. Updates duplicate. “How many rules?” needs the whole PDF (`kOKavHnlPik`). Grounding chunks exist — prompt the cite. Don’t upload PII.
- **Reasoning:** 4.2/5 on mixed unrelated PDFs with almost no prompt. Count-the-rules failed. Expire-if-not-imported.
- **Mechanism:** Store → upload → import → `$fromAI` query, no punctuation in the JSON; pin the store name.
- **Evidence:** Club-break cite; Nvidia numbers; 4.2; five-vs-28.
- **Conditions:** Gemini File Search as taped.
- **Exceptions:** $0.15 / free storage UNVERIFIED and can change. High query volume may fee.
- **Action:** Steal dupe/lifecycle + whole-vs-chunk + no-PII. Do not add Gemini File Search / n8n HTTP.
- **Confidence:** high on the failure modes; $ / 4.2 UNVERIFIED.
- **Source:** `irg-2IfAjpo` @ UNKNOWN
- **Epistemic:** SOURCE

## C. Mental Models
Folder metaphor. Temp upload ≠ in the store. `?` = query param; path vars aren’t. Grounding ≠ the user saw a quote until you prompt it (`QojPKL96Dx4`). Mixed-corpus store is a demo, not a design.

## D. Procedures
1. Don’t create a Gemini store. 2. Don’t upload hive/client PII to Google. 3. If we ever retrieve: don’t use chunks for counts/summaries. 4. Don’t quote $26B / 4.2 as FACT. 5. Don’t join Plus.

## E. Examples
**Situation:** How many golf rules?  
**Action:** Chunk search.  
**Reasoning:** Never sees the whole.  
**Outcome:** Answers 5.  
**Lesson:** Wrong fetch (`kOKavHnlPik`).

**Situation:** Update the PDF.  
**Action:** Re-upload.  
**Reasoning:** No delete/version.  
**Outcome:** Dupes, worse answers.  
**Lesson:** Lifecycle is your job.

## F. Decision Rules
- If the Q needs the whole doc → not File Search.
- If the file has PII → don’t upload.
- If $0.15 / 4.2 / $26B appear → UNVERIFIED.
- If Gemini/n8n-cloud as hive RAG → park.

## G. Contrarian
Field builds the pipeline. He drops the file — then lists why that’s not enough. Field trusts the 4.2; he says n=10 and a wrong key first.

## H. Assumptions
API as demoed. Falsifier: Google adds dedupe. We do not run n8n-cloud. Nvidia/Apple numbers UNVERIFIED.

## I. Questions
Do any hive ingest paths re-add without deleting?

## J. Connections
SYSTEM SYNTHESIS: `QojPKL96Dx4` Assistant + highlights. `kOKavHnlPik` four fetches. `hQvwMj7IJe4` wiki pages, not chunks. No Gemini store. Knowledge stays in repo md.

## K. Future-Use
No-PII. Lifecycle-or-dupes. Whole-doc vs chunk.

## Steal / Operate-never

### Machine: managed RAG is a drop-in with no lifecycle; don’t chunk a count; don’t upload secrets
- **Epistemic:** SOURCE
- **Workflow / loop:** need a needle? maybe. need a count/timeline? whole doc. updating? delete-or-version first
- **Questions / signals:** Will this dupe? Is it PII? Did grounding stay in the tool payload?
- **Qualify / frame / objections:** Cheap index. Google holds the bytes. n=10.
- **Procedure:** No Gemini File Search. No n8n HTTP. No Plus.
- **Example that proves it:** 5 vs 28 rules; 4.2 after a wrong-key wipe.
- **Why it works:** Embeddings don’t see the whole. Re-upload without delete poisons the store.
- **Conditions / exceptions:** Tape $ UNVERIFIED.
- **Operate-never payload:** Gemini as hive DB; upload PII; quote $26B as FACT.
- **Hive run:** existing packets as whole docs. Deploy HITL.
- **Source:** `irg-2IfAjpo` @ UNKNOWN

### Operate-never
- Stand up Gemini File Search / n8n-cloud RAG.
- Upload PII. New hunt. Send / pay / deploy / book / publish.
- Merge `LESSONS-FROM-TAPE.md`.

## L. Role-Specific Applications
I will not add Gemini File Search. No PII to Google. Deploy HITL.
