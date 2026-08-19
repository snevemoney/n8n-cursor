# Big Boss — irg-2IfAjpo
Status: filled
Protocol: deep-video-learning
**Source:** `docs/hive/outer-heaven/CONTENT/watch-later/packets/irg-2IfAjpo/full.txt`
**Packet LEARNED:** `docs/hive/outer-heaven/CONTENT/watch-later/packets/irg-2IfAjpo/LEARNED.md`
**ICP:** parked unless Evens named one.

## A. Source Map

Long (PACKET: 18:45, 4696 words, captions `en-orig`). Timestamp UNKNOWN on `full.txt` (no VTT in the take). Visual-only gaps: price table, four HTTP nodes, golf/Nvidia/Apple PDFs, eval scores, grounding-metadata JSON, Google docs UI.

Beats, in order:

1. Hook: Gemini File Search — drop a doc, it chunks/embeds, chat. Cheap. Honest: **not magic**; still a pipeline.
2. Vs DIY RAG (Pinecone/Supabase): you skip type/metadata/split/embed/upsert. Upload to Google; they store and search.
3. Pricing slide (**UNVERIFIED**): **$0.15 / 1M** index tokens; 121-page PDF ~**95k** tokens; storage “free” on tape; query ≈ chat-model tokens; 100GB + 1M queries ≈ **$12** index once + ~**$35** first month; Pinecone Assistant **$0.05/hour** not even in the table. Ease justifies cost vs cheaper-but-harder DIY.
4. Four HTTPs: (1) create store (“folder”), (2) upload file to Google (temp; **expires if not moved**), (3) import/move into the store, (4) query / generate content. Form drop for the file.
5. Docs are “not my favorite.” Tip (Mark Hashef): view as markdown, paste to an LLM. He still walks the import-files path. Query auth = `key` as generic query cred, not paste-every-node.
6. Demo: create store `YouTube-test`, pin the name. Upload *Rules of Golf* (~22p). Move. Agent tool: Gemini 2.5 Flash, store name in body, `fromAI` on the query. Prompt: grounded answers, **cite sources**, query text only (no punctuation) so JSON doesn’t break.
7. Q: club breaks during the round → rule 4, cite. Second file: Nvidia PR. Q1 FY25 numbers; he checks the PDF. Tool out: candidates + grounding metadata + chunk supports.
8. Third file: Apple 10-K (121p). Eval: 10 questions across ~200 pages, uncorrelated corpus. First run: **wrong API key**, eight errors. Second: **4.2 / 5** correctness; one 2. “Hardly any prompting.”
9. Final considerations: not magic. Re-upload = **duplicates** (Google doesn’t dedupe/update). Garbage in, garbage out (OCR helps; bad scans still fail; sometimes preprocess). Chunk search is wrong when you need the **whole** doc — “how many total rules?” returned **five**; last rule (28) would hit. Security: files live on Google; **do not upload PII**; GDPR / HIPAA / CCPA named.
10. Close: free Skool JSON; Plus — **200** members, same course names, weekly Q&A. **UNVERIFIED.**

Off-topic / not skipped: golf + Nvidia + Apple in one store on purpose.

## B. Atomic Knowledge

### Convenience RAG still lives on someone else’s disk
- **Claim:** File Search is “drop and chat,” but Google stores and indexes the bytes.
- **Reasoning:** You skipped *your* pipeline. You did not skip *a* pipeline or *a* landlord.
- **Mechanism:** Upload → their chunk/embed/store → generate-content with a store name.
- **Evidence:** Architecture talk + security close.
- **Conditions:** Docs are allowed on Google.
- **Exceptions:** He says every situation differs — then names GDPR/HIPAA/CCPA.
- **Action:** PII/client/HIPAA stay off. `input-required-gate`.
- **Confidence:** high
- **Source:** `irg-2IfAjpo` @ UNKNOWN — “your documents are being uploaded and stored on Google’s servers”
- **Epistemic:** SOURCE

### Four HTTPs; expire-if-not-moved is the real pipe
- **Claim:** Create store → upload (temp) → move into store → query. Skip move and the file dies.
- **Reasoning:** Upload is not “in the folder.” He is honest: not zero-pipeline.
- **Mechanism:** Three writes + one generate. Form trigger for binary. Pin store name.
- **Evidence:** Expiration time on the upload response.
- **Conditions:** You hold the store name and the file name.
- **Exceptions:** Docs also mention “upload directly to store” — he followed import-files.
- **Action:** If we ever need file-Q&A, keep the file in **our** wiki. Do not call this zero-ops.
- **Confidence:** high
- **Source:** `irg-2IfAjpo` @ UNKNOWN — “if you don’t move it into a folder by this date, it will expire”
- **Epistemic:** SOURCE

### Price slides are UNVERIFIED
- **Claim:** $0.15/1M index, 95k for 121 pages, free storage, ~$12 + ~$35 vs Pinecone hourly.
- **Reasoning:** Cheap + easy is the hook. He did not include Pinecone’s $0.05/h in the table.
- **Mechanism:** One comparison slide.
- **Evidence:** Spoken numbers. **$ UNVERIFIED.**
- **Conditions:** His assumptions (100GB, 1M queries).
- **Exceptions:** “You may be able to get cheaper if you go a different route.”
- **Action:** Do not switch vendors for $0.15. Do not quote as FACT.
- **Confidence:** high he said it; zero as our cost
- **Source:** `irg-2IfAjpo` @ UNKNOWN — “15 cents for every 1 million tokens”
- **Epistemic:** SOURCE (speech) / UNVERIFIED ($)

### Ask for quotes; read grounding metadata
- **Claim:** Prompt for cites. The tool returns chunks + supports you can verify in the PDF.
- **Reasoning:** A fluent answer is not a receipt.
- **Mechanism:** “Cite your sources.” Candidates array + grounding metadata + sentence offsets.
- **Evidence:** Golf rule 4; Nvidia PR title/date checked against the file.
- **Conditions:** You open the source.
- **Exceptions:** Eval still had a 2/5 on a hard item.
- **Action:** `info-gain-cite`. No cite, no claim.
- **Confidence:** high
- **Source:** `irg-2IfAjpo` @ UNKNOWN — “Please site your sources”
- **Epistemic:** SOURCE

### Re-upload duplicates; garbage in, garbage out
- **Claim:** Update = another copy. Google is not your records system. Messy scans stay messy.
- **Reasoning:** Convenience has no librarian. Quality in = quality out. OCR is not a cleanup desk.
- **Mechanism:** Same store, new import. Optional preprocess.
- **Evidence:** Final-considerations list.
- **Conditions:** Living documents.
- **Exceptions:** None shown for delete/version.
- **Action:** Wiki owns versions. Do not treat a store as a CMS.
- **Confidence:** high
- **Source:** `irg-2IfAjpo` @ UNKNOWN — “now you have duplicate data”
- **Epistemic:** SOURCE

### Whole-doc questions fail chunk search
- **Claim:** “How many total rules?” → **five**, because it never saw the whole PDF. Rule 28 as a needle would hit.
- **Reasoning:** Same ladder as `kOKavHnlPik`. Semantic search is a needle tool.
- **Mechanism:** Chunk retrieve, not a full read.
- **Evidence:** Community example he recounts (not this eval’s 10 Qs).
- **Conditions:** Count / chronology / “all of them.”
- **Exceptions:** Heavy metadata — he says still usually wrong.
- **Action:** Full-read or don’t ask that question of a chunk store.
- **Confidence:** high for the warning; the “five” is his story
- **Source:** `irg-2IfAjpo` @ UNKNOWN — “it came back and said five”
- **Epistemic:** SOURCE

### Eval 4.2/5 is a demo receipt
- **Claim:** 10 hard questions, three unrelated PDFs (~200 pages), second run 4.2/5 after a wrong-key first run.
- **Reasoning:** He wants “we barely prompted” to sell ease.
- **Mechanism:** n8n evaluation node. **UNVERIFIED** as a method we can audit.
- **Evidence:** Scores 5,5,4,5,2… spoken.
- **Conditions:** His questions, his judge.
- **Exceptions:** First run eight errors — ops still matter.
- **Action:** Do not treat 4.2 as a vendor win. Known-good is ours.
- **Confidence:** medium
- **Source:** `irg-2IfAjpo` @ UNKNOWN — “4.2 correctness, which is out of five”
- **Epistemic:** SOURCE (he said it) / UNVERIFIED (score)

### Docs are hostile; markdown-to-LLM is a workaround
- **Claim:** Google API docs confuse him. View-as-markdown + an LLM helps; still not perfect.
- **Reasoning:** The product is easy; the API write-up is not.
- **Mechanism:** Copy POST URLs; `?` = query param; path vars are not query params (store name in the URL).
- **Evidence:** He builds four nodes from the import-files path.
- **Conditions:** HTTP-from-docs skill.
- **Exceptions:** He still tells you to download his JSON.
- **Action:** Steal the “docs → markdown → model drafts HTTP” habit. Do not install Gemini.
- **Confidence:** high
- **Source:** `irg-2IfAjpo` @ UNKNOWN — “most of Google’s are not my favorite”
- **Epistemic:** SOURCE

### fromAI fills the query; punctuation can break the body
- **Claim:** The agent writes the search string. He forbids punctuation/newlines in that field.
- **Reasoning:** JSON body is brittle.
- **Mechanism:** `fromAI` + prompt rule.
- **Evidence:** Spoken constraint before the golf question.
- **Conditions:** HTTP JSON tool.
- **Exceptions:** None shown.
- **Action:** If a tool takes a raw string in JSON, constrain the alphabet.
- **Confidence:** high
- **Source:** `irg-2IfAjpo` @ UNKNOWN — “only send over text, no punctuation”
- **Epistemic:** SOURCE

## C. Mental Models

- **Not magic.** Four HTTPs + expire + dupes + chunks. **SOURCE**
- **Landlord RAG.** Cheap because they own the disk. **SOURCE**
- **Cite or it didn’t happen.** Grounding metadata is the receipt. **SOURCE**
- **Needle ≠ whole doc.** **SOURCE**
- **Ease can justify spend — on his slide, not ours.** **INFERENCE**
- **Wrong API key is still an ops story.** **SOURCE**

## D. Procedures

1. Decide whether the file may leave the building. If PII/HIPAA/client — stop.
2. If you still used his pattern (learn only): create store → upload → **move before expiry** → query with cite + grounding check.
3. Prefer tool-choose / wiki full-read for whole-doc questions.
4. Version updates yourself; do not re-drop into a mute store.
5. Preprocess garbage scans.
6. Eval with **your** known-goods, not a 4.2 slide.

**Qualify / frame:** “10× cheaper RAG” shopping-cart. Golf/Nvidia/Apple are props.
**Objections:** “It’s free storage” — UNVERIFIED + their disk. “Just drop PDFs” — expire, dupes, chunks, PII.
**Avoid:** Gemini as hive OS; upload client files; quote $0.15 / $12 / $35 / 4.2 as FACT.
**When to change:** question needs the whole doc; file is sensitive; store is full of dupes.

## E. Examples

**Situation:** Golf PDF in the store. “Club breaks during the round?”  
**Action:** Query tool + cite.  
**Reasoning:** Needle in a rules book.  
**Outcome:** Rule 4, source named.  
**Lesson:** Chunk search can hit a rule. Implicit rule: still open the PDF.

**Situation:** “How many total rules?” (community story).  
**Action:** Same chunk tool.  
**Reasoning:** Count needs the whole list.  
**Outcome:** Five — wrong.  
**Lesson:** Question class picks the retrieve. Implicit rule: File Search ≠ full read.

**Situation:** First eval run.  
**Action:** Wrong API key.  
**Reasoning:** Convenience still has creds.  
**Outcome:** Eight errors; second run 4.2/5.  
**Lesson:** Ops before magic. Implicit rule: a score after a key fix is not a product review.

## F. Decision Rules

- If the file has PII → do not upload.
- If the question is a count/timeline of the whole doc → not this store.
- If the file must persist → move it; then **you** version it.
- If the answer has no cite → reject.
- If the slide is $ → UNVERIFIED.
- Optimize: least pipeline *you* own — only for non-sensitive needles.
- Refuse: Gemini as OS; client PDFs to Google; 10×-cheaper as FACT.

## G. Contrarian

- Against “zero pipeline”: four HTTPs + expiry.
- Against “RAG = your vectors”: landlord is a choice with a privacy bill.
- Against “just dump the drive”: dupes and garbage.
- Field assumes the price table is the decision. He also taught the don’ts.

## H. Assumptions

**His:** Google storage stays free; 2.5 Flash is enough; mixed golf/Nvidia/Apple in one store is a fair stress; Skool JSON is the path.

**Ours:** Captions complete (4696 words). All $ and 4.2 / 200 members / 95k = **UNVERIFIED**. Domain: public PDFs.

**Falsifiers:** Storage starts metering. Dedupe appears (or never does and quality dies). HIPAA shop uses it anyway and leaks.

**Disagreement (keep labeled):** We will not put hive/client files in Gemini. Expire-if-not-moved, cite, whole-doc-don’t, PII-don’t are stolen. **SYSTEM SYNTHESIS**

## I. Questions

- Delete / replace API — not shown.
- Who pays when “free storage” ends?
- Eval judge prompt — not on tape.
- Direct-upload-to-store vs his three-step — when?

## J. Connections

- **SYSTEM SYNTHESIS** → `kOKavHnlPik`: same chunk failure mode.
- **SYSTEM SYNTHESIS** → `info-gain-cite` / `wiki-ingest`: our disk, our cite.
- **SYSTEM SYNTHESIS** → `input-required-gate`: PII.
- **SYSTEM SYNTHESIS** → `golden-test-loop`: 4.2 is his smoke, not ours.

## K. Future-Use

- Expiry as a Watchdog “temp object” smell (unassigned).
- Grounding-metadata as a cite format (unassigned).
- Docs-to-markdown HTTP habit for Researcher (unassigned).

## Steal / Operate-never

### Machine: Convenience RAG still needs a pipe, a cite, and a PII stop
- **Epistemic:** SOURCE (demo) / SYSTEM SYNTHESIS (hive mapping)
- **Workflow / loop:** may this file leave? → if no, stop → if yes (learn only), create store → upload → move before expiry → query with cite → verify grounding vs the PDF → never re-drop as “update.”
- **Questions / signals:** “PII?” “Whole-doc or needle?” “Has it been moved?” “Where is the chunk?”
- **Qualify / frame / objections:** 10×-cheaper cart. Objection: zero pipeline — four HTTPs.
- **Procedure:** D steps 1–6. Checkable stops: (1) PII gate, (2) moved before expiry, (3) cite + open source, (4) no silent re-upload.
- **Example that proves it:** Golf needle works; “how many rules” returns five; wrong key fails the eval. Lesson: not magic.
- **Why it works:** Landlord is fast for needles on public files. Conditions: non-sensitive, question is a needle, you still cite. Exceptions: living docs, whole-doc Qs, regulated files.
- **Conditions / exceptions:** Cursor + Grok only. Gemini / n8n / Skool on tape. Tape $ UNVERIFIED.
- **Operate-never payload:** Upload client/PII; switch stack; quote $0.15 / 95k / $12 / $35 / 10× / $0.05/h / 4.2 as FACT.
- **Hive run (existing skills only):** `wiki-ingest` · `info-gain-cite` · `input-required-gate` · `golden-test-loop`.
- **Source:** `irg-2IfAjpo` @ UNKNOWN

**Operate-never (this desk will not operate — still walked the tape):**

- Upload client / PII / HIPAA docs to Gemini
- Switch stack · Cursor + Grok only
- Quote $0.15 / 95k / $12 / $35 / 10× / $0.05/hr / 4.2 / 200 members as FACT
- Plus / Skool as a hive SKU
- New hunt / unpark Normand
- Grok Bot `sendPrompt` · send / pay / deploy / book / publish
- Merge `LESSONS-FROM-TAPE.md` · write packet `LEARNED.md`

## L. Role-Specific Applications

I manage; I do not rent Google a folder of our files because a slide said cheap.

- **Done:** file stays in our wiki; answer has a cite. Not a Gemini store.
- **Delegate without being asked:** Librarian versions; Watchdog PII-stops; Researcher cites.
- **Skeptical review:** 4.2 after a wrong key is a YouTube beat, not a vendor decision.
- **One system this take:** if we need file-Q&A, keep the file in **our** wiki and cite.
- Live hunt stays parked.
