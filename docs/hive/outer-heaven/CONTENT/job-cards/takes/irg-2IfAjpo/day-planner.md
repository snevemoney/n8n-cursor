# Day Planner — irg-2IfAjpo
Status: filled
Protocol: deep-video-learning
**Source:** `docs/hive/outer-heaven/CONTENT/watch-later/packets/irg-2IfAjpo/full.txt`
**Packet LEARNED:** `docs/hive/outer-heaven/CONTENT/watch-later/packets/irg-2IfAjpo/LEARNED.md`
**ICP:** parked unless Evens named one.

## A. Source Map
Nate: **Gemini File Search** as cheap RAG (n8n HTTP). Beats: upload → Google chunks/embeds → chat; **$0.15 / 1M** index, storage “free,” query ≈ model $ (UNVERIFIED); 121p PDF ~95k tok; vs Pinecone/OpenAI/Supabase table (Pinecone Assistant **5¢/hr** not in table); four calls: **create store** → **upload** (temp, **expires**) → **import/move** into store → **generateContent** query; Google docs ugly — view-as-markdown + LLM (Mark Kashef); `?key=` is a query param → generic query auth; pin store name; form drop golf rules PDF; query tool uses `fromAI`, prompt: cite + **query text only (no punctuation/newlines)** so JSON doesn’t break; club-breaks → rule 4; second file Nvidia Q1; grounding metadata + chunks; eval 10 Qs across golf + Nvidia + Apple 10-K (~200p, uncorrelated same store): first run **wrong API key** 8 errors; second **4.2/5**; not magic: **re-upload = duplicates**, GIGO / OCR, **chunk ≠ whole-doc count** (“how many rules?” → **5**, last rule 28 works), **PII goes to Google** (GDPR/HIPAA/CCPA). Skool + Plus. Caption-only. Timestamp UNKNOWN. $ / 4.2 UNVERIFIED.

## B. Atomic Knowledge
### Upload-then-move; cite the chunk; vector is not a whole-doc count; no PII
- **Claim:** “Drop a file” still has a four-step API and an expiry. Cheap RAG is not magic: duplicates, garbage, and chunk questions lie. Query shape still picks the method (`kOKavHnlPik`).
- **Reasoning:** The store is a folder; the upload is a temp object until import. A count needs the whole doc.
- **Mechanism:** Create → upload → move (before expiry) → query with cite + clean query string.
- **Evidence:** “if you don’t move it into a folder by this date, it will expire.” / “How many total rules… it came back and said five.”
- **Conditions:** Public/non-sensitive docs; a needle question, not a total.
- **Exceptions:** We do not Gemini, Skool, or upload hive/client files.
- **Action:** Steal upload-then-move + cite + not-a-count. Do not Gemini. Do not PII.
- **Confidence:** high as the caveats.
- **Source:** `irg-2IfAjpo` @ UNKNOWN
- **Epistemic:** SOURCE
- **Knowledge type:** declared + demonstrated (speech)
- **Modality:** speech
- **Evidence status:** transcript-implied
- **Shown / clicked / sequenced:** UNKNOWN
- **Failed / retried:** wrong API key; “5 rules”
- **Speech ≠ behavior:** “10x cheaper / not magic” vs Plus CTA

## C. Mental Models
Pipeline cut is the pitch; hygiene is the job. Priority: grounded + cheap. Uncertainty: storage stays free.

## D. Procedures
1. Name the question type first (filter/SQL/full/vector).
2. If vector: create store, upload, **move before expiry**, pin the name.
3. Query: cite; no punctuation in the tool string (his JSON).
4. Re-upload = delete/dedupe or quality dies.
5. Never put PII on Google.
Avoid: Gemini; Skool/Plus; quote $0.15 as FACT; whole-doc counts via chunks.

## E. Examples
**Club break:** Situation → golf PDF. Action → query + cite rule 4. Reasoning → needle. Outcome → grounded. Lesson → steal cite.

**How many rules:** Situation → count. Action → chunk search. Outcome → 5 vs 28. Lesson → steal question-shape.

## F. Decision Rules
- IF the question is a total/order/summary → not this store.
- IF the file is PII/client → never upload.
- IF you re-drop the same PDF → you now have dupes (his).

## G. Contrarian
Rejects “RAG = Pinecone pipeline” *and* “file search is magic.” Field: drop-and-done. He: four HTTP + caveats.

## H. Assumptions
Theirs: Google storage free forever. Ours: UNVERIFIED; no Gemini. Falsifier: a count that we treat as a vector win. Survivorship: 10 Qs.

## I. Questions
Same Apple 10-K as `X80ljdCPM_U`?

## J. Connections
- SYSTEM SYNTHESIS → `kOKavHnlPik` · `XTBWVVcF3Pk` · `golden-test-loop`.

## K. Future-Use
Upload-then-move. Chunk≠count. Unassigned Gemini $.

## Steal / Operate-never

### Machine: question-shape first → if vector, create/upload/move/cite; never PII; never count-via-chunk
- **Epistemic:** SOURCE
- **Workflow / loop:** name the Q → if needle, store+move+cite → if total, full-read → if PII, stop
- **Questions / signals:** Expiry? Dupe? “How many?” PII?
- **Qualify / frame / objections:** “Drop-in magic” is the fail. Cite + shape is the pass.
- **Procedure:** No Gemini. No Skool. No client PDF to Google.
- **Example that proves it:** Situation → how many rules. Action → chunks. Outcome → 5. Lesson → steal the shape.
- **Why it works:** A cite and a question-type are checkable; a 10x headline is not.
- **Conditions / exceptions:** $ / 4.2 UNVERIFIED.
- **Operate-never payload:** Gemini; PII upload; Skool/Plus; quote 10x as FACT.
- **Hive run (existing skills only):** `kOKavHnlPik` · `golden-test-loop`.
- **Source:** `irg-2IfAjpo` @ UNKNOWN

### Operate-never
- Gemini / PII-to-Google / Skool / Plus.
- Send / pay / deploy / book / publish.

## L. Role-Specific Applications
**One next:** `coverage-loop` score this packet as upload-then-move + chunk≠count. Clients parked.
