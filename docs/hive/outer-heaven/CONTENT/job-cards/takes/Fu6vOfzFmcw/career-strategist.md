# Career Strategist — Fu6vOfzFmcw
Status: filled
Protocol: deep-video-learning
**Source:** `docs/hive/outer-heaven/CONTENT/watch-later/packets/Fu6vOfzFmcw/full.txt`
**Packet LEARNED:** `docs/hive/outer-heaven/CONTENT/watch-later/packets/Fu6vOfzFmcw/LEARNED.md`
**ICP:** parked unless Evens named one.

## A. Source Map
Short (397 words). Simple RAG. Beats: (1) pipeline: new doc in a Drive folder → vector DB (2) Drive trigger: changes in a specific folder, watch for file created (3) fetch test event; file arrives (4) second Drive node: download by ID from the trigger (5) Supabase vector store; run; five items appear (6) before the query pipeline, a quick agent with no prompt — only a tool — “what is our shipping policy” (7) answers 1–2 day process, 3–7 day standard shipping; he says it is correct (8) CTA. Policy text is demo data, not ours.

## B. Atomic Knowledge

### Folder-drop is the ingest trigger
- **Claim:** RAG ingest starts when a file is created in a chosen Drive folder; download by the trigger’s file ID; upsert to Supabase.
- **Reasoning:** No manual embed step — drop is the API.
- **Mechanism:** on-create → download → vector store (5 chunks here).
- **Evidence:** “watching for a new file being created in this folder.” @ UNKNOWN
- **Conditions:** Drive connected; folder chosen.
- **Exceptions:** Updates to an existing file not specified.
- **Action:** One drop-folder per corpus.
- **Confidence:** high as demo.
- **Source:** `Fu6vOfzFmcw` @ UNKNOWN
- **Epistemic:** SOURCE

### Empty prompt + a retrieval tool can still answer
- **Claim:** He gave the agent no prompt, only a vector tool, and it answered shipping policy correctly.
- **Reasoning:** The document is the knowledge; the tool is the skill.
- **Mechanism:** question → tool → cite-ish answer.
- **Evidence:** “I didn’t even give the agent a prompt or anything. We just hooked it up to a tool.” @ UNKNOWN
- **Conditions:** The FAQ is in the store; question matches.
- **Exceptions:** Chronology / order questions fail on chunk RAG (sister `ZwQ8rJhVCr4`).
- **Action:** Do not confuse “no prompt” with “no director” for taste work.
- **Confidence:** high as this demo; narrow.
- **Source:** `Fu6vOfzFmcw` @ UNKNOWN
- **Epistemic:** SOURCE

## C. Mental Models
Ingest and query are two pipelines. A folder is a contract. Five chunks from one FAQ is enough for a policy question. Validation is asking a question you already know the answer to.

## D. Procedures
1. Pick folder. 2. Trigger on create. 3. Download by ID. 4. Upsert. 5. Refresh and count items. 6. Ask a known question.  
Avoid: claiming RAG is done before the known-question check.

## E. Examples
**Situation:** Policy/FAQ dropped in Drive.  
**Action:** Ingest to Supabase (5 items); ask shipping policy with a promptless agent.  
**Reasoning:** Validate read-back.  
**Outcome:** Matches his expected 1–2 / 3–7 days.  
**Lesson:** Known-answer test is the receipt. Implicit rule: do not skip the ask.

## F. Decision Rules
- If the file is not in the folder, do not debug the agent.
- If you have not asked a known question, you have not validated.
- Full-document read vs chunk is a later choice (`ZwQ8rJhVCr4`).

## G. Contrarian
Rejects a “huge massive data pipeline” (sister Gemini file-search short). Also rejects prompt-first for a fact lookup.

## H. Assumptions
**Theirs:** Supabase, Drive, five chunks, shipping numbers. **Ours:** demo FAQ; not employment policy. Falsifier: a question whose answer spans chunks poorly.

## I. Questions
- Update/delete behavior?
- Citation of which chunk?

## J. Connections
- SYSTEM SYNTHESIS → `ZwQ8rJhVCr4` (four RAG methods; chunk loses order).
- SYSTEM SYNTHESIS → `KVFfApQZhE4` / `QrJhdTbK3TU` (managed file search).
- SYSTEM SYNTHESIS → `context-docs` / `golden-test-loop`.

## K. Future-Use
Unassigned: drop-folder as the ingest for accomplishment PDFs — query in gym, not a public bot.

## Steal / Operate-never

### Machine: drop-folder ingest → known-question smoke
- **Epistemic:** SOURCE + SYSTEM SYNTHESIS
- **Workflow / loop:** drop a source file → embed → ask a question you already know → pass/fail → stop
- **Questions / signals:** How many chunks landed? Did the known answer match?
- **Qualify / frame / objections:** Promptless is ok for FAQ; not for an offer letter.
- **Procedure:** One folder per corpus. Validate before wiring chat to humans.
- **Example that proves it:** Shipping policy ask (E).
- **Why it works:** The folder contract + a known question catches empty stores (B/C).
- **Conditions / exceptions:** Fact lookup. Chronology needs full context.
- **Operate-never payload:** Auto-answer customers from a stale store; quote shipping days as ours; quit-job.
- **Hive run:** `context-docs` · `golden-test-loop` · `info-gain-cite`
- **Source:** `Fu6vOfzFmcw` @ UNKNOWN

### Operate-never
- Customer-facing auto-answer without HITL.
- Treat demo policy as our policy. Employment send. Quit-job. Unpark clients.
- Merge LESSONS. Auto-write `SKILL.md`.

## L. Role-Specific Applications
Employment still covers baseline. Career analog: put offer letters / review notes in a private vault folder; gym asks a known question (“what did we ship in June?”) before Evens walks into a room. Not a public FAQ bot. Clients parked.
