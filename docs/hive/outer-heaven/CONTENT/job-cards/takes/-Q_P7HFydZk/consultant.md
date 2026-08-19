# Consultant — -Q_P7HFydZk
Status: filled
Protocol: deep-video-learning
**Source:** `docs/hive/outer-heaven/CONTENT/watch-later/packets/-Q_P7HFydZk/full.txt`
**Packet LEARNED:** `docs/hive/outer-heaven/CONTENT/watch-later/packets/-Q_P7HFydZk/LEARNED.md`
**ICP:** parked unless Evens named one.

## A. Source Map

Proposal-deck teaser (long `KGXFkUlBHxw`). Beats: after a call you owe minutes or a proposal — that was a big part of his full-time job; now automatable. Two parts: (1) meeting ends → log to Google Sheet (date, title, attendees, gist, ID, status) via Fireflies webhook → wait → fetch title/transcript → if exists → clean JSON attendees → log. (2) new sheet row → pull details → **human approval** whether to generate a deck (not always needed) → proposal generator → Gamma API → professional slides. Guardrail: process only the last item if two meetings end together. Second cleanup code node: full transcript with speaker labels collapsed (don’t repeat the name every sentence). CTA to the long. No VTT. UNKNOWN. ~812 words. Cuts during the code-node explanation.

## B. Atomic Knowledge

### Log the meeting, then ask a human before Gamma
- **Claim:** A ended call becomes a sheet row; a second workflow asks whether to generate a deck because you do not always need one.
- **Reasoning:** Auto-deck on every call is waste and can ship a wrong proposal.
- **Mechanism:** Fireflies webhook → log row → on new row → approve y/n → Gamma.
- **Evidence:** “we get human approval right here to see if we want to have a slide deck generated or not, cuz we don't always need that.”
- **Conditions:** Fireflies + Sheet + Gamma on tape. Post-call follow-up.
- **Exceptions:** Approval is on tape; send of the deck is not shown here.
- **Action:** Steal the approve gate. Do not auto-Gamma. Do not send the deck.
- **Confidence:** high
- **Source:** `-Q_P7HFydZk` @ UNKNOWN — “human approval… we don't always need that”
- **Epistemic:** SOURCE
### Speaker-collapsed transcript is a cleanup job
- **Claim:** He writes a code node so “Nate Herk” appears when the speaker changes, not on every sentence.
- **Reasoning:** A noisy transcript makes a worse deck.
- **Mechanism:** Fetch raw → collapse speaker turns → then generate.
- **Evidence:** On-tape reason for the trickier code node.
- **Conditions:** Fireflies JSON. He still uses a code node (necessary here).
- **Exceptions:** Cleanup ≠ a true proposal. The deck can still be wrong.
- **Action:** Clean the transcript before any generator. Keep a human on the deck.
- **Confidence:** high
- **Source:** `-Q_P7HFydZk` @ UNKNOWN — “it didn't say Nate Herk again until the next person spoke”
- **Epistemic:** SOURCE


## C. Mental Models

He remembers proposal-after-call as the grind of a job. He splits log vs generate. He is willing to use a code node for speaker cleanup. He wants a template people can run. He treats Gamma as “ready to go” and “super professional” — vendor praise.

## D. Procedures

1. Capture the ended meeting. 2. Log structured fields. 3. Ask generate y/n. 4. Collapse speakers. 5. Draft a deck. 6. Human edits/sends. Avoid: deck on every call. Avoid: installing Fireflies/Gamma.

## E. Examples

**Situation:** Hop off a potential-client call, need a follow-up deck. **Action:** Fireflies → sheet → approve → Gamma. **Outcome:** Teaser stops in cleanup. **Lesson:** Approve is the steal. Implicit rule: last-item guardrail when two meetings collide.

## F. Decision Rules

If every call auto-makes a deck, fail. If speakers are per-sentence, clean first. If the next step is send, HITL. If two rows land, process one.

## G. Contrarian

Field default: generate always. He asks. Field default: one workflow. He splits log vs deck.

## H. Assumptions

Fireflies/Gamma/Sheets on-tape. “Super professional” unverified. Teaser incomplete. Long `KGXFkUlBHxw`.

## I. Questions

What does approval look like in the UI? Who sends the Gamma link? What’s in the gist field?

## J. Connections

**SYSTEM SYNTHESIS:** Long `KGXFkUlBHxw`. Maps to `warm-draft-hitl` + `ask-principal` (proposal send is the hard step on this desk’s job card) + `same-day-qa` after a real tape exists.

## K. Future-Use

Unassigned: generate-y/n as a default after any call logger; speaker-collapse as a transcript hygiene atom.

## Steal / Operate-never

### Machine: Call log → human y/n → draft deck (send HITL)
- **Epistemic:** SOURCE
- **Workflow / loop:** Meeting ends → structured log → ask generate? → collapse speakers → draft slides → human edits → Evens sends
- **Questions / signals:** Do we need a deck at all? Are speakers collapsed? Who sends?
- **Qualify / frame / objections:** Qualify: there was a real call. Frame: not every call needs slides. Objection: “automate proposals” — he still asks.
- **Procedure:** Keep the gate. Do not install Gamma/Fireflies. Do not send.
- **Example that proves it:** Fireflies webhook logs a row; second flow asks before Gamma.
- **Why it works:** Proposal send is a hard step. Always-on generate is how you ship a wrong deck.
- **Conditions / exceptions:** Teaser. Vendors. Professional unverified.
- **Operate-never payload:** Auto-Gamma. Auto-send a proposal. Install Fireflies/Gamma. Unpark a client.
- **Hive run (existing skills only):** `warm-draft-hitl` · `ask-principal` · `same-day-qa` · `four-blank-sku`
- **Source:** `-Q_P7HFydZk` @ UNKNOWN


### Operate-never
- Auto-generate or auto-send a proposal deck.
- Install Fireflies / Gamma.
- Skip the generate y/n gate.
- Unpark a client / new `icp_id` / new `business-lanes.json` row. Learning ≠ hunt.
- Quote tape $ / student counts / job-loss % / hours×rate as FACT.
- Send / pay / deploy / book / publish. Approve draft ≠ send.
- Install on-tape vendors (Claude, Codex, ChatGPT, Gemini, Coda, Vapi, Abacus, n8n-cloud, Skool). Stack stays Cursor + Grok.
- Grok Bot / `sendPrompt`. Merge `LESSONS-FROM-TAPE.md`. Auto-write SKILL.md. Overwrite `takes/consultant.md` or another desk's take.

## L. Role-Specific Applications

**Constraint first:** The stated ask is “generate proposal decks automatically.” Felt problem is the leak the call was about — not Gamma. This desk’s hard step is proposal send. Do not auto-deck a parked Path A.

**Four-blank after constraint:** Toddler stop = a human said yes to generating, then Evens sends. No tape $ here.

**Skeptical-customer:** “Ready to go / super professional” is smash. Clients parked.
