# Day Planner — Fu6vOfzFmcw
Status: filled
Protocol: deep-video-learning
**Source:** `docs/hive/outer-heaven/CONTENT/watch-later/packets/Fu6vOfzFmcw/full.txt`
**Packet LEARNED:** `docs/hive/outer-heaven/CONTENT/watch-later/packets/Fu6vOfzFmcw/LEARNED.md`
**ICP:** parked unless Evens named one.

## A. Source Map
Short: simple RAG ingest. Beats: Drive folder trigger (new file in a specific folder) → fetch test event → download file by ID from the trigger → Supabase vector store → run → five items appear; then a throwaway agent with no prompt, only a tool, asked “what is our shipping policy” → answers 1–2 day process / 3–7 day standard shipping — “it is correct.” CTA to full (`kOKavHnlPik` / `QojPKL96Dx4`). Timestamp UNKNOWN. Vendor: Supabase — on-tape.

## B. Atomic Knowledge
### Folder-drop is the ingest trigger
- **Claim:** New doc in a chosen Drive folder starts the pipeline into a vector DB.
- **Reasoning:** “Super simple” — watch one folder, download by ID, upsert.
- **Mechanism:** Drive trigger (file created) → download by ID → Supabase vector store.
- **Evidence:** “on changes involving a specific folder… new file being created.”
- **Conditions:** One folder, one account connected.
- **Exceptions:** Wrong folder → silent miss.
- **Action:** One folder, one dry-run file. Do not watch the whole Drive.
- **Confidence:** high as the path.
- **Source:** `Fu6vOfzFmcw` @ UNKNOWN
- **Epistemic:** SOURCE

### Five chunks + one question is his validate
- **Claim:** Run shows five items; a no-prompt agent with a tool answers shipping policy correctly.
- **Reasoning:** If the tool can answer, ingest worked.
- **Mechanism:** Upsert → ask a known question → compare to the doc.
- **Evidence:** “five items should be there… I didn’t even give the agent a prompt.”
- **Conditions:** A known fact in the doc.
- **Exceptions:** A fluent wrong answer would still look smart — he does not show a negative.
- **Action:** Validate with a known Q. Do not treat “no prompt” as a SOP.
- **Confidence:** medium (one happy question).
- **Source:** `Fu6vOfzFmcw` @ UNKNOWN
- **Epistemic:** SOURCE

## C. Mental Models
Ingest first, chat second. A tool beat a system prompt in this demo. Priority: show five rows appear. He does not mention permissions, PII, or re-ingest. Uncertainty: chunking quality.

## D. Procedures
1. Pick one folder.
2. Trigger = file created.
3. Download by trigger ID (not “latest file”).
4. Upsert to the store.
5. Ask one known question. Compare to the doc.
Avoid: whole-Drive watch; Supabase as a required SKU; no-prompt as doctrine.

## E. Examples
**Policy/FAQ drop:** Situation → policy doc lands in folder. Action → trigger → download by ID → five vectors → ask shipping policy. Reasoning → validate ingest. Outcome → he says the 1–2 / 3–7 day lines are correct. Lesson → known-Q validate; five is UNVERIFIED as “enough.”

## F. Decision Rules
- If download is not by trigger ID → fail (wrong file risk).
- If we cannot name a known Q → not validated.
- If the store is a new vendor → do not install from this desk.

## G. Contrarian
Rejects a “huge massive data pipeline” (sibling `KVFfApQZhE4` says the same). Also: a prompt-less agent can still answer if the tool is right — we store that as a demo, not a plan.

## H. Assumptions
Theirs: five chunks = good ingest; the answer is correct. Ours: one happy Q is survivorship. Falsifier: hallucinated policy that sounds right. Supabase on-tape.

## I. Questions
Chunker settings? Re-ingest on edit? Full RAG method tape `ZwQ8rJhVCr4` / `kOKavHnlPik`?

## J. Connections
- SYSTEM SYNTHESIS → `KVFfApQZhE4` (file search, skip pipeline) · `kOKavHnlPik` · `QojPKL96Dx4` · `golden-test-loop` (known Q).

## K. Future-Use
Folder-drop + known-Q as a dry-run shape on stores we already have. Unassigned.

## Steal / Operate-never

### Machine: one-folder drop → download-by-ID → known-Q validate
- **Epistemic:** SOURCE
- **Workflow / loop:** file created in one folder → download by trigger ID → upsert → ask a fact from the doc → pass/fail
- **Questions / signals:** Which folder? Did five (or N) rows appear? Does the answer match the doc?
- **Qualify / frame / objections:** “Look how smart” is not a pass. Known Q is.
- **Procedure:** One file dry-run. No whole-Drive. No new vector vendor.
- **Example that proves it:** Situation → FAQ dropped. Action → Drive trigger + Supabase + shipping Q. Reasoning → ingest then validate. Outcome → he says correct. Lesson → steal the order; vendor stays on-tape.
- **Why it works:** Trigger ID ties the row to the file; a known Q is checkable.
- **Conditions / exceptions:** No known Q → not validated. PII folder → do not ingest.
- **Operate-never payload:** Supabase as hive SKU; no-prompt agents in prod; quote five items as FACT quality.
- **Hive run (existing skills only):** `golden-test-loop`.
- **Source:** `Fu6vOfzFmcw` @ UNKNOWN

### Operate-never
- Install Supabase / switch stack.
- Ingest PII/secrets.
- Send / pay / deploy / book / publish.

## L. Role-Specific Applications
**One next:** `coverage-loop` score this packet as one-folder + known-Q validate. Clients parked — I do not put a Drive-watch cron on the weekday board.
