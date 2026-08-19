# Consultant — Fu6vOfzFmcw
Status: filled
Protocol: deep-video-learning
**Source:** `docs/hive/outer-heaven/CONTENT/watch-later/packets/Fu6vOfzFmcw/full.txt`
**Packet LEARNED:** `docs/hive/outer-heaven/CONTENT/watch-later/packets/Fu6vOfzFmcw/LEARNED.md`
**ICP:** parked unless Evens named one.

## A. Source Map

RAG accuracy teaser. Beats: pipeline 1 — new doc in a Drive folder → vector DB. Google Drive trigger on file created in a specific folder → download by ID from the trigger → Supabase vector store → run → five items appear. Then a tiny agent with no prompt, only a tool, asked “what is our shipping policy?” → answers 1–2 business days process, 3–7 standard shipping, “correct.” CTA to the long. No VTT. UNKNOWN. ~397 words.

## B. Atomic Knowledge

### Folder-drop is the ingest trigger
- **Claim:** A new file in a chosen Drive folder is enough to start embed→store.
- **Reasoning:** Humans already know how to drop a file; that can be the API.
- **Mechanism:** Drive on-create in folder → download by trigger ID → upsert vectors.
- **Evidence:** “watching for a new file being created in this folder.”
- **Conditions:** One folder, one policy/FAQ doc. Supabase on tape.
- **Exceptions:** Folder-drop can ingest junk if the folder is sloppy.
- **Action:** Name the folder as the ingest gate. Do not watch an entire Drive.
- **Confidence:** high
- **Source:** `Fu6vOfzFmcw` @ UNKNOWN — “on changes involving a specific folder”
- **Epistemic:** SOURCE
### Smoke-test the retrieve path with a known question
- **Claim:** He builds a no-prompt agent whose only job is to hit the store with “what is our shipping policy?” and checks the answer against the doc.
- **Reasoning:** Ingest without retrieve-check is a pile of vectors, not RAG.
- **Mechanism:** Attach store as tool → ask a question you already know → compare.
- **Evidence:** “I didn't even give the agent a prompt or anything. We just hooked it up to a tool.”
- **Conditions:** FAQ/shipping policy he just embedded. Five chunks.
- **Exceptions:** One question. “Correct” is his eye, not an eval set (`8IUWeF3B-hk`).
- **Action:** Always ask a known question after ingest. Then score more.
- **Confidence:** high as a smoke test; low as accuracy proof
- **Source:** `Fu6vOfzFmcw` @ UNKNOWN — “what is our shipping policy” / “it is correct”
- **Epistemic:** SOURCE


## C. Mental Models

He wants RAG to look simple: folder → store → ask. He treats five chunks popping up as a toddler stop. He is not doing chunk-strategy on this short (that is `ZwQ8rJhVCr4` / `kOKavHnlPik`). He is willing to run an agent with zero system prompt to prove the tool.

## D. Procedures

1. Pick one folder. 2. Trigger on create. 3. Download the triggering file (by ID). 4. Embed to the store. 5. Count items. 6. Ask a known question. 7. Compare to the doc. Avoid: calling this “accurate RAG” after one Q. Avoid: installing Supabase because he did.

## E. Examples

**Situation:** Policy/FAQ dropped in Drive. **Action:** Ingest to Supabase; ask shipping policy. **Outcome:** Five items; answer matches what he expects. **Lesson:** Folder + known question is the smoke path. Implicit rule: retrieve-check the same hour you ingest.

## F. Decision Rules

If the folder is not specific, stop. If you cannot name a known question, you are not ready to ingest. If you need a long system prompt for the smoke test, the tool path is not proven yet.

## G. Contrarian

Field default: build the chatbot first. He builds ingest first. Field default: prompt-engineer the smoke test. He uses no prompt.

## H. Assumptions

Supabase/Drive on-tape. Five chunks, one Q. “Accurate” in the title is stronger than the short. Shipping days UNVERIFIED as a real business policy.

## I. Questions

What is on the long for staying accurate (re-ingest, deletes, eval)? Did the five chunks overlap?

## J. Connections

**SYSTEM SYNTHESIS:** Long likely continues this RAG series; method siblings `ZwQ8rJhVCr4`, `kOKavHnlPik`, `QojPKL96Dx4`. Maps to `wiki-ingest` + `golden-test-loop` + `context-docs`.

## K. Future-Use

Unassigned: folder-as-ingest-gate; known-question smoke test as a consultant accept test.

## Steal / Operate-never

### Machine: Folder ingest → count chunks → known-question smoke test
- **Epistemic:** SOURCE
- **Workflow / loop:** Name one folder → file created → download that ID → embed → count items → ask a question you already know → compare to source → stop (not “accurate” yet)
- **Questions / signals:** Which folder? How many items landed? What known question? Who said the answer is correct?
- **Qualify / frame / objections:** Qualify: they have docs that change by drop. Frame: smoke test, not production RAG. Objection: “is it accurate?” — one Q is not eval.
- **Procedure:** Specific folder. Known question. Then a labeled set.
- **Example that proves it:** Policy/FAQ → five Supabase items → shipping-policy answer he calls correct.
- **Why it works:** Ingest without retrieve-check is faith. A known question is a toddler stop.
- **Conditions / exceptions:** One doc, one Q. Vendors on-tape. Title overclaims.
- **Operate-never payload:** Install Supabase/Drive RAG on a parked client. Call one answer “accurate.” Quote shipping days as a client SLA.
- **Hive run (existing skills only):** `wiki-ingest` · `golden-test-loop` · `context-docs` · `ask-principal`
- **Source:** `Fu6vOfzFmcw` @ UNKNOWN


### Operate-never
- Install Supabase / Drive RAG for a client.
- Call one smoke-test answer production accuracy.
- Unpark a client / new `icp_id` / new `business-lanes.json` row. Learning ≠ hunt.
- Quote tape $ / student counts / job-loss % / hours×rate as FACT.
- Send / pay / deploy / book / publish. Approve draft ≠ send.
- Install on-tape vendors (Claude, Codex, ChatGPT, Gemini, Coda, Vapi, Abacus, n8n-cloud, Skool). Stack stays Cursor + Grok.
- Grok Bot / `sendPrompt`. Merge `LESSONS-FROM-TAPE.md`. Auto-write SKILL.md. Overwrite `takes/consultant.md` or another desk's take.

## L. Role-Specific Applications

**Constraint first:** The stated ask is “keep RAG accurate.” Felt problem is wrong answers on a named job — if anyone named it. Do not stand up Drive→Supabase for a parked Path A.

**Four-blank after constraint:** Toddler stop = chunk count + known question matched. Accuracy % needs a set (`8IUWeF3B-hk`).

**Skeptical-customer:** “Look how smart this guy is” is smash. Clients parked.
