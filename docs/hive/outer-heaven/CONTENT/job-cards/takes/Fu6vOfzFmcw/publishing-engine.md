# Publishing Engine — Fu6vOfzFmcw
Status: filled
Protocol: deep-video-learning
**Source:** `docs/hive/outer-heaven/CONTENT/watch-later/packets/Fu6vOfzFmcw/full.txt`
**Packet LEARNED:** `docs/hive/outer-heaven/CONTENT/watch-later/packets/Fu6vOfzFmcw/LEARNED.md`
**ICP:** parked unless Evens named one.
**Title:** Simple RAG pipeline in n8n (Drive → Supabase)
**Channel:** Nate Herk | AI Automation

## A. Source Map
1. Build a RAG pipeline: new doc in a Google Drive folder → vector database.
2. Drive trigger: on changes in a specific folder, watch for a new file created; fetch test event.
3. Second Drive node: download file by ID from the trigger.
4. Supabase vector store step; run; five items appear after refresh.
5. Quick agent with no prompt, only a tool, to validate: 'what is our shipping policy.'
6. Answer: processed 1–2 business days; standard shipping 3–7 days — he says it is correct.
7. CTA: full video.
Timestamp UNKNOWN (no VTT unless noted). Tape $ / student counts / job-loss % = UNVERIFIED.

## B. Atomic Knowledge

### Folder-drop ingest
- **Claim:** RAG starts when a new file lands in a watched folder, then download-by-ID, then embed.
- **Reasoning:** You do not paste the doc into chat. The folder is the inbox.
- **Mechanism:** Trigger on create → download by ID → vector store → N chunks.
- **Evidence:** On changes involving a specific folder… watching for a new file being created.
- **Conditions:** One folder is the source of truth.
- **Exceptions:** A chat upload is a different machine (`KVFfApQZhE4` file-search).
- **Action:** If we ever ingest, the pack is folder → chunk count, not a chatbot screenshot.
- **Confidence:** high
- **Source:** `Fu6vOfzFmcw` @ UNKNOWN
- **Epistemic:** SOURCE

### Validate with a known question
- **Claim:** He asks a question whose answer he already knows (shipping policy) with no agent prompt — only a tool.
- **Reasoning:** Validation is 'did the chunks land,' not 'is the agent smart.'
- **Mechanism:** Ask known Q → tool hits vectors → compare to the doc.
- **Evidence:** I didn't even give the agent a prompt or anything. We just hooked it up to a tool.
- **Conditions:** You have a ground-truth sentence in the file.
- **Exceptions:** An open question you cannot check is not validation.
- **Action:** Pack the known-Q + cited answer. Do not pack 'look how smart.'
- **Confidence:** high
- **Source:** `Fu6vOfzFmcw` @ UNKNOWN
- **Epistemic:** SOURCE

## C. Mental Models
- Folder is the inbox.
- Five items popping is the checkable stop.
- No prompt is a feature of the validation, not of production.

## D. Procedures
- Watch one folder. Download by ID. Count chunks.
- Ask a question you can grade.
- Do not treat Supabase as our stack — on tape.

## E. Examples
- Situation: Policy/FAQ dropped in Drive. Action: Embed to Supabase; ask shipping policy. Reasoning: Known answer. Outcome: 1–2 / 3–7 days, 'correct.' Lesson: Known-Q validation is the pack.

## F. Decision Rules
- If chunk count is zero → fail.
- If the question is not in the doc → not a test.
- Do not publish a RAG farm.

## G. Contrarian
- Field would prompt the agent first. He validates with an empty prompt + a tool.

## H. Assumptions
- Theirs: five chunks and a correct shipping line prove the pipeline. Thin.
- Ours: Drive/Supabase stay on tape. Steal folder-drop + known-Q.

## I. Questions
- What chunker?
- Who updates the doc?
- Is the long video a query pipeline too?

## J. Connections
- **SYSTEM SYNTHESIS:** Full-context vs vector accuracy is `ZwQ8rJhVCr4`.
- **SYSTEM SYNTHESIS:** Gemini file search skip-pipeline is `KVFfApQZhE4`.

## K. Future-Use
- Unassigned: folder-drop as wiki-ingest analog.
- Unassigned: known-Q card on any ingest we run.

## Steal / Operate-never

### Machine: folder-drop-then-known-q
- **Epistemic:** SOURCE
- **Workflow / loop:** drop file in one folder → download by ID → embed → count chunks → ask a question already in the file → checkable stop = chunk count + graded answer
- **Questions / signals:** Which folder? How many chunks? What is the known answer?
- **Qualify / frame / objections:** 'The agent is smart' is not validation.
- **Procedure:** Package the drop + the graded Q. Do not stand up their store.
- **Example that proves it:** Shipping-policy Q with no agent prompt returns the doc's days.
- **Why it works:** You can see the file become answerable.
- **Conditions / exceptions:** Ground-truth Q only. On-tape DB is not ours.
- **Operate-never payload:** Install Supabase as hive default; publish a RAG product; treat five chunks as a benchmark.
- **Hive run (existing skills only):** `wiki-ingest` · `info-gain-cite` · `ask-principal`
- **Source:** `Fu6vOfzFmcw` @ UNKNOWN

**Operate-never**
- Publish / schedule live / paid boost without Evens.
- Republish Nate or any source creator.
- Quote tape $ / hours×rate / student counts as FACT or as our price.
- Send / pay / deploy / book.
- New icp_id / unpark a client / Grok Bot sendPrompt.
- Install on-tape vendors (n8n-cloud, Skool, Vapi, Claude, ChatGPT, Gemini, Coda, Abacus).
- Stand up their Drive/Supabase as ours.
- Publish a RAG chatbot.

## L. Role-Specific Applications
- I package folder-drop + known-Q from a run we did. I do not ship their pipeline.
- I will not cut 'look how smart this guy is.'
- Evens publishes. I do not.
