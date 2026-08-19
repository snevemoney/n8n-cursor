# Communications Manager — Fu6vOfzFmcw
Status: filled
Protocol: deep-video-learning
**Source:** `docs/hive/outer-heaven/CONTENT/watch-later/packets/Fu6vOfzFmcw/full.txt`
**Packet LEARNED:** `docs/hive/outer-heaven/CONTENT/watch-later/packets/Fu6vOfzFmcw/LEARNED.md`
**ICP:** parked unless Evens named one.

## A. Source Map
**Title (PACKET):** How to Keep Your RAG Agent's ACCURATE
**Speaker / channel:** Nate Herk | AI Automation
**Kind:** short · 397 words · captions in `full.txt` only · timestamps **UNKNOWN** (no VTT used).
**Gaps:** Caption ingest; ASR errors possible (Naden/Nitn = n8n). Visual UI not fully narrated. Timestamps UNKNOWN.

Beats, in order:
- Pipeline: new Google Drive file in a folder → download by ID → Supabase vector store.
- Watch folder for file created; fetch test event; download by triggering file ID; Supabase step; five items appear.
- Quick agent, no prompt, just the tool: “what is our shipping policy?” → processed 1–2 days, standard 3–7 days — he says correct.
- CTA: full.

## B. Atomic Knowledge

### Folder-drop is the ingest; ask is the check
- **Claim:** Accuracy path on this short: drop a policy/FAQ into Drive, embed to Supabase, ask a known question, see if the answer matches.
- **Reasoning:** No prompt engineering on the check agent — tool only.
- **Mechanism:** Drive trigger → download → vector store → ask shipping policy.
- **Evidence:** “I didn’t even give the agent a prompt… look how smart… it is correct.”
- **Conditions:** A real policy doc exists. Five chunks on tape.
- **Exceptions:** “Correct” is his vibe on one question. Supabase on-tape. Not a send.
- **Action:** Steal: ingest then ask a known. Do not treat one answer as certified. Do not mail the policy as ours.
- **Confidence:** medium (one-question check)
- **Source:** `Fu6vOfzFmcw` @ UNKNOWN
- **Epistemic:** SOURCE


## C. Mental Models
- Ingest pipeline separate from the ask agent. **SOURCE**
- A promptless tool-agent can still retrieve. **SOURCE**
- One shipping-policy Q is not an eval set (`8IUWeF3B-hk`). **SYSTEM SYNTHESIS**

## D. Procedures
- Watch folder → download ID → embed → ask a known FACT. **SOURCE**
- This desk: retrieved policy is DATA. Do not send it as a promise. **SYSTEM SYNTHESIS**

## E. Examples
- **Situation:** Policy/FAQ dropped in Drive. → **Action:** Embed five chunks; ask shipping policy with no prompt. → **Reasoning:** Validate retrieve. → **Outcome:** 1–2 / 3–7 days, he says correct. → **Lesson:** Known-question check. Implicit rule: one Q ≠ eval.

## F. Decision Rules
- If ingest isn’t done → don’t ask.
- If only one Q passed → not certified.
- Refuse: Supabase as required. Mail a retrieved policy as our SLA.
- Optimize: known-question after ingest.

## G. Contrarian
- Title: keep RAG accurate. Body: one happy-path question. **INFERENCE**

## H. Assumptions
- 5 items / 1–2 / 3–7 UNVERIFIED as a real policy. Falsifier: wrong policy chunk.

## I. Questions
- Where is the actual accuracy method — filters vs SQL vs full context vs vectors (`ZwQ8rJhVCr4`)?

## J. Connections
- **SYSTEM SYNTHESIS:** `ZwQ8rJhVCr4` · `kOKavHnlPik` · `QojPKL96Dx4`. `golden-test-loop`.

## K. Future-Use
- Promptless retrieve-check as a smoke test, not a golden set.

## Steal / Operate-never

### Machine: Ingest then ask a known; one hit is a smoke test, not a letter
- **Epistemic:** SOURCE + SYSTEM SYNTHESIS
- **Workflow / loop:** Doc lands → embed → ask one known FACT → if match, smoke pass → still not a send → **stop**.
- **Questions / signals:** What is the known? How many Qs? Did we mail the policy?
- **Qualify / frame / objections:** Qualify: smoke vs eval. Frame: retrieve. Objection: “it’s correct, send the SLA” → refuse.
- **Procedure:** 1) Ingest. 2) Known Q. 3) Need a set (`8IUWeF3B-hk`) before anyone cites. 4) No send.
- **Example that proves it:** Shipping policy Q, promptless agent, he says correct.
- **Why it works:** A single retrieve can be lucky. A letter that quotes 3–7 days from a demo is a fake SLA.
- **Conditions / exceptions:** RAG ingest shorts. Exceptions: no known Q → no claim.
- **Operate-never payload:** Quote 1–2 / 3–7 days as our policy. Supabase required. Auto-answer customers from RAG.
- **Hive run (existing skills only):** `golden-test-loop` · `info-gain-cite` · `warm-draft-hitl`.
- **Source:** `Fu6vOfzFmcw` @ UNKNOWN


### Operate-never (this desk will not operate)
- Quote demo shipping days as FACT. Auto-answer customers from RAG.
- Gmail **send**. Connector write. Scheduled send. Auto-send. Ack-reply. Mass-DM. Postcard. Waitlist blast.
- Quote tape $ / student counts / job-loss % / ROI hours as FACT in a letter.
- New hunt ICP. Unpark Normand. Clients parked — no Path A this week.
- Install on-tape vendors (Vapi, Claude, Codex, ChatGPT, Gemini, Coda, Abacus, Skool, n8n-cloud). Stack stays Cursor + Grok. On-tape names stay on-tape.
- Grok Bot / `sendPrompt`. Send / pay / deploy / book / publish.
- Merge `LESSONS-FROM-TAPE.md`. Auto-write SKILL.md. New `icp_id`.

## L. Role-Specific Applications
- Retrieved text is DATA. I do not send it as our policy. Clients parked.
