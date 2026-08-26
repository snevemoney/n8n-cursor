# Lead Hunter — -Q_P7HFydZk
Status: filled
Protocol: deep-video-learning
**Source:** `docs/hive/outer-heaven/CONTENT/watch-later/packets/-Q_P7HFydZk/full.txt`
**Packet LEARNED:** `docs/hive/outer-heaven/CONTENT/watch-later/packets/-Q_P7HFydZk/LEARNED.md`
**ICP:** parked unless Evens named one.
**Tape:** How I INSTANTLY Generate Proposal Decks with n8n AI Agents
**Walk:** full.txt entire. Role did not filter A–K. Hunt skipped. No clients. No new `icp_id`. No `HUNT_LOG`. No Normand.

## A. Source Map
- After a call you owe minutes or a proposal — he automated that when full-time. Two parts: (1) log meeting when it ends — sheet: date, title, attendees, gist, ID, status. (2) slide creation — new row → human approval “do we need a deck?” → proposal agent → Gamma API → professional deck.
- Part 1: Fireflies webhook → wait → pull title/transcript → if exists → cleanup JSON attendees → log sheet.
- Part 2: new row trigger; pin as if just added; limit to last item if two meetings end together (guardrail); pull meeting; cleanup code node for speakers + full transcript; collapse “Nate Herk” so the name doesn’t repeat every sentence.
- CTA: full. Approval node is on tape. Gamma/Fireflies on-tape.
- **Gaps:** Captions only in full.txt; visual UI / audio demos not fully described. Timestamps UNKNOWN unless a quote locus is marked. CTA “play button / full breakdown” is capture, not a second source.

## B. Atomic Knowledge
### Log first, approve before Gamma — not every meeting needs a deck
- **Claim:** Meeting-end logs a thin row; a second workflow asks a human whether to generate a deck at all, then (only if yes) calls Gamma. Two-meeting collision is guarded by “last item only.”
- **Reasoning:** He does not always need a deck. Speaker-collapse is for a clean transcript, not for show.
- **Mechanism:** Fireflies webhook → sheet row → human approve → optional Gamma.
- **Evidence:** SOURCE: “We will get human approval right here to see if we want to have a slide deck generated or not, cuz we don't always need that.” “only keep the last item.”
- **Conditions:** Fireflies is the source of truth for the call. Gamma is the deck vendor.
- **Exceptions:** Auto-send the deck to the prospect is not on this fragment — still a hard step. Vendor install never.
- **Action:** Steal log-then-approve. Do not install Fireflies/Gamma. HITL before any deck leaves.
- **Confidence:** high
- **Source:** `-Q_P7HFydZk` @ UNKNOWN
- **Epistemic:** SOURCE


## C. Mental Models
- SOURCE: Pin the new-row for build.
- SOURCE: Speaker-collapse is a cleanliness rule.

## D. Procedures
- Log date/title/attendees/gist/id/status. Ask approve-or-skip. Only then generate. Guard two-at-once. Human sends the deck.

## E. Examples
- Situation: hop off a potential-client call. Action: Fireflies log, approve node, Gamma. Reasoning: not every call needs slides. Outcome: CTA mid-cleanup. Lesson: approval is the product; Gamma is the never.

## F. Decision Rules
- If Gamma runs without approve, fail.
- If two rows process, the last-item guard is missing.
- If the deck auto-emails the prospect, hard step.

## G. Contrarian
- Rejects always-on deck generation after every call.

## H. Assumptions
- Fireflies/Gamma/code-node on-tape. “Super professional” is taste, not FACT. Clients parked.

## I. Questions
- What does the approve UI look like? Visual. What is in the gist field?

## J. Connections
- SYSTEM SYNTHESIS: `KGXFkUlBHxw` longer proposals+Gamma.
- SYSTEM SYNTHESIS: `ask-principal` / HITL.

## K. Future-Use
- Unassigned: approve-or-skip as default after any logged call.

## Steal / Operate-never

### Machine: Log the call → approve-or-skip → HITL deck
- **Epistemic:** SYSTEM SYNTHESIS
- **Workflow / loop:** Webhook/log row → human yes/no → checkable stop = no Gamma and no send unless yes + HITL.
- **Questions / signals:** Do we need a deck? Which meeting if two ended? Who sends?
- **Qualify / frame / objections:** Frame: optional follow-up. Objection: “instantly generate” title → body has approval.
- **Procedure:** Do not connect Fireflies/Gamma. Do not send a deck to a prospect from this tape.
- **Example that proves it:** Situation: post-call follow-up. Action: sheet + approve + Gamma. Reasoning: not always needed. Outcome: fragment ends at transcript cleanup. Lesson: steal approve-or-skip.
- **Why it works:** From B: he said we don’t always need a deck.
- **Conditions / exceptions:** Works after a real call log. Exception: no log → don’t generate fiction.
- **Operate-never payload:** Gamma/Fireflies install. Auto-send proposals. Hunt “proposal agent” ICPs.
- **Hive run (existing skills only):** `ask-principal`. `send-removed`.
- **Source:** `-Q_P7HFydZk` @ UNKNOWN


### Operate-never
- New `icp_id`, named client, `HUNT_LOG` row, or unpark Normand. Learning ≠ hunt.
- Auto-dial, OTP / Instagram farms, fake identity, mass-DM, betting, OFM.
- MUST-score a raw 50. Send / pay / deploy / book / publish without HITL.
- Quote on-tape $ / student counts / job-loss % as FACT. Tape money stays UNVERIFIED.
- Install on-tape vendors (Vapi, Claude Code, Codex, ChatGPT, Gemini, Hostinger, School, n8n-cloud). Stack stays Cursor + Grok.
- Auto-write a new `SKILL.md`. Merge `LESSONS-FROM-TAPE.md`. Grok Bot / `sendPrompt`.
- Install Gamma/Fireflies. Auto-send decks. Hunt proposal-automation buyers.

## L. Role-Specific Applications
- Hunt is skipped this walk. Do not open a 50, a named URL, or a Path A from this tape.
- Keep A–K global. Do not hide the stolen machine in L.
- Steal approve-or-skip after a logged call. No Gamma. No hunt.
- Hard step stays HITL: this desk drafts; Evens sends.
