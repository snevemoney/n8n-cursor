# Communications Manager — -Q_P7HFydZk
Status: filled
Protocol: deep-video-learning
**Source:** `docs/hive/outer-heaven/CONTENT/watch-later/packets/-Q_P7HFydZk/full.txt`
**Packet LEARNED:** `docs/hive/outer-heaven/CONTENT/watch-later/packets/-Q_P7HFydZk/LEARNED.md`
**ICP:** parked unless Evens named one.

## A. Source Map
**Title (PACKET):** How I INSTANTLY Generate Proposal Decks with n8n AI Agents
**Speaker / channel:** Nate Herk | AI Automation
**Kind:** short · 812 words · captions in `full.txt` only · timestamps **UNKNOWN** (no VTT used).
**Gaps:** Caption ingest; ASR errors possible (Naden/Nitn = n8n). Visual UI not fully narrated. Timestamps UNKNOWN.

Beats, in order:
- After a call you owe minutes or a proposal — a big part of his old full-time job. Now automatable.
- Two parts: (1) log meeting when it ends to a Google Sheet (date, title, attendees, gist, ID, status); (2) slide deck via Gamma after human approval — “we don’t always need that.”
- Webhook to Fireflies; wait; pull title/transcript; if exists; clean JSON attendees; log sheet.
- Second workflow on new row; re-fetch meeting; limit to last item if two meetings end together (guardrail); cleanup code node for speakers + full transcript — speaker name once until the next person (not every sentence).
- CTA: full. Long-form `KGXFkUlBHxw`.

## B. Atomic Knowledge

### Log first; human yes before Gamma
- **Claim:** Meeting end → log sheet. Deck only after a human approval node because you don’t always need slides.
- **Reasoning:** Approval is in the architecture, not a speech.
- **Mechanism:** Fireflies webhook → clean → sheet → (optional) approve → Gamma API.
- **Evidence:** “we get human approval right here to see if we want to have a slide deck generated or not.”
- **Conditions:** Fireflies + Gamma + Sheet on tape.
- **Exceptions:** Approve-generate is not approve-send. Deck to a client is still HITL.
- **Action:** Steal the approval node. Do not auto-send the deck. Do not install Gamma/Fireflies without Evens.
- **Confidence:** high
- **Source:** `-Q_P7HFydZk` @ UNKNOWN
- **Epistemic:** SOURCE

### Transcript cleanup is a real code job
- **Claim:** He writes a code node so the speaker label doesn’t repeat every sentence — name until the next speaker.
- **Reasoning:** Dirty transcripts make dirty decks.
- **Mechanism:** Cleanup speakers + full transcript; limit-to-last as a collision guardrail.
- **Evidence:** “it didn’t say Nate Herk again until the next person spoke.”
- **Conditions:** Fireflies JSON is messy.
- **Exceptions:** Code node is on-tape n8n. Not our send path.
- **Action:** If we ever draft minutes, collapse speaker labels. Still no send.
- **Confidence:** high
- **Source:** `-Q_P7HFydZk` @ UNKNOWN
- **Epistemic:** SOURCE


## C. Mental Models
- Not every meeting deserves a deck. **SOURCE**
- Guardrail: one meeting at a time. **SOURCE**
- Full-time follow-up pain is the why. **SOURCE**

## D. Procedures
- Webhook → validate → clean → log → human approve? → maybe deck. **SOURCE**
- This desk: approval maps to APPROVE DRAFT, not APPROVE SEND. **SYSTEM SYNTHESIS**

## E. Examples
- **Situation:** Just hopped off a call, need a proposal deck. → **Action:** Fireflies log + approval + Gamma; speaker-collapse code; last-item limit. → **Reasoning:** Don’t always need slides. → **Outcome:** Short ends in cleanup. → **Lesson:** Approve before generate. Implicit rule: generate ≠ email the client.

## F. Decision Rules
- If no human approve → no deck.
- If two meetings collide → process one.
- Refuse: auto-send Gamma. Fireflies/Gamma as required stack.
- Optimize: log + optional draft.

## G. Contrarian
- Field auto-sends the deck when the call ends. He put an approval node in. We keep it and still don’t send. **SYSTEM SYNTHESIS**

## H. Assumptions
- Fireflies/Gamma on-tape. Falsifier: deck that invents a scope he didn’t say.

## I. Questions
- What does the approval UI actually show the human?

## J. Connections
- **SYSTEM SYNTHESIS:** `KGXFkUlBHxw`. `warm-draft-hitl` (two boxes). `golden-test-loop`.

## K. Future-Use
- Speaker-collapse as a minutes-draft hygiene note.

## Steal / Operate-never

### Machine: Log the call; approve before a deck; sending the deck is a second box
- **Epistemic:** SOURCE + SYSTEM SYNTHESIS
- **Workflow / loop:** Call ends → log gist/attendees → HITL: do we want a deck? → if yes, draft slides → **stop**. Evens sends if ever.
- **Questions / signals:** Do we need slides? Who approved generate? Who approved send?
- **Qualify / frame / objections:** Qualify: minutes vs proposal. Frame: not always a deck. Objection: “instantly generate and send” → refuse.
- **Procedure:** 1) Log. 2) Approve generate. 3) Hold deck. 4) Separate approve-send.
- **Example that proves it:** Fireflies → sheet → human approval → Gamma; speaker names collapsed.
- **Why it works:** Always-deck is waste. Always-send is a hard step. Dirty transcripts become dirty scopes.
- **Conditions / exceptions:** Post-call machines. Exceptions: no transcript → no deck.
- **Operate-never payload:** Auto-send Gamma. Skip approval. Fireflies/Gamma install as ours.
- **Hive run (existing skills only):** `warm-draft-hitl` · `ask-principal` · `playbook-before-send`.
- **Source:** `-Q_P7HFydZk` @ UNKNOWN


### Operate-never (this desk will not operate)
- Auto-send the Gamma deck. Skip the approval node. Install Fireflies/Gamma as ours.
- Gmail **send**. Connector write. Scheduled send. Auto-send. Ack-reply. Mass-DM. Postcard. Waitlist blast.
- Quote tape $ / student counts / job-loss % / ROI hours as FACT in a letter.
- New hunt ICP. Unpark Normand. Clients parked — no Path A this week.
- Install on-tape vendors (Vapi, Claude, Codex, ChatGPT, Gemini, Coda, Abacus, Skool, n8n-cloud). Stack stays Cursor + Grok. On-tape names stay on-tape.
- Grok Bot / `sendPrompt`. Send / pay / deploy / book / publish.
- Merge `LESSONS-FROM-TAPE.md`. Auto-write SKILL.md. New `icp_id`.

## L. Role-Specific Applications
- I may draft minutes or a deck card after Evens says yes to generate. I do not send. Clients parked.
