# Wealth Manager — -Q_P7HFydZk
Status: filled
Protocol: deep-video-learning
**Source:** `docs/hive/outer-heaven/CONTENT/watch-later/packets/-Q_P7HFydZk/full.txt`
**Packet LEARNED:** `docs/hive/outer-heaven/CONTENT/watch-later/packets/-Q_P7HFydZk/LEARNED.md`
**ICP:** parked unless Evens named one.
**Tape:** How I INSTANTLY Generate Proposal Decks with n8n AI Agents · short · 3:00 · 812w · Channel: Nate Herk | AI Automation
**Upgrade:** old short steal/never → A–K global reconstruct, then Steal / Operate-never, then L. Clients parked. Do not allocate tape SKUs.

## A. Source Map
1. Hook: generate proposal decks automatically after a call.
2. Two-part system: (1) log meeting when it ends → Google Sheet (date, title, attendees, gist, ID, status); (2) slide deck creation.
3. Human approval node before Gamma: “we don’t always need” a deck.
4. Fireflies webhook → wait → fetch title/transcript → if exists → code-clean attendees → log sheet.
5. Second workflow: new row → re-fetch meeting → limit to last item (two meetings ending at once) → cleanup speakers so names don’t repeat every sentence → (teaser cuts before Gamma fire).
6. CTA: full breakdown.
**Gaps:** full.txt has no inline timestamps. json3 exists for most Nate packets; cites below use json3 when a locus is recoverable, else `UNKNOWN`. Visual-only UI is described in speech, not seen here.

## B. Atomic Knowledge
### Approval before the artifact
- **Claim:** After a meeting is logged, a human decides whether a deck is generated.
- **Reasoning:** Not every call needs a proposal. Auto-Gamma would burn tokens and send junk.
- **Mechanism:** Sheet row → approval node → only then proposal agent → Gamma API.
- **Evidence:** Spoken + node pointed at.
- **Conditions:** Post-call deliverables.
- **Exceptions:** If Evens already said “always deck this ICP” — still HITL send.
- **Action:** Keep the approval node. Do not skip it to look autonomous.
- **Confidence:** high
- **Source:** `-Q_P7HFydZk` @ UNKNOWN
- **Epistemic:** SOURCE

### Pin / limit as anti-double-fire
- **Claim:** Limit to last item if two meetings end at once; pin demo data so you do not re-burn.
- **Reasoning:** Idempotence is a money control, not just an engineering nicety.
- **Mechanism:** Limit node + pin.
- **Evidence:** He names the two-meetings race.
- **Conditions:** Any webhook that can double.
- **Exceptions:** True unique meeting ID is better than “last item.”
- **Action:** Treat double-fire as a cost bug.
- **Confidence:** medium
- **Source:** `-Q_P7HFydZk` @ UNKNOWN
- **Epistemic:** SOURCE

## C. Mental Models
He still thinks like a full-time employee who owed meeting notes. Automation is the follow-up tax, not the relationship. Fireflies/Gamma are conveniences. Approval is the value judgment.

## D. Procedures
Webhook from recorder → existence check → clean speakers (name once per turn) → log sheet → human yes/no on deck → Gamma. Pin test data. Limit to one meeting.

## E. Examples
- **Fireflies → sheet** — Situation → Call ends; need a log and maybe a deck. Action → Webhook, wait, fetch, if-exists, clean attendees, write row. Reasoning → Raw Fireflies JSON is messy; speaker-per-sentence is unreadable. Outcome → Row with title/attendees/gist/status/id. Deck step teased, not finished on this short. Lesson → Log cheap; generate expensive; approve between.

## F. Decision Rules
If meeting artifacts missing → do not proceed. If two rows race → keep last / one ID. If human says no deck → stop. If human says yes → generate, do not auto-send.

## G. Contrarian
Rejects “always generate the deck.” Rejects dumping raw transcript into slides without speaker cleanup.

## H. Assumptions
Assumes Fireflies + Gamma stay available and paid. Code node for cleanup is on tape (hive prefers standard nodes when possible). Tape does not show a sent deck. $ UNVERIFIED none on this short.

## I. Questions
Does the long tape (`KGXFkUlBHxw`) keep Slack send-and-wait? What is Gamma unit cost per deck?

## J. Connections
**SYSTEM SYNTHESIS:** Long form `KGXFkUlBHxw`. Same approval spine as inbox-draft tapes. `ask-principal` before send. Do not allocate Gamma as a SKU.

## K. Future-Use
Speaker-turn cleanup + approval-before-artifact is reusable on any post-call packet. Unassigned.

## Steal / Operate-never

### Machine: Log → approve → artifact
- **Epistemic:** SOURCE
- **Workflow / loop:** Meeting end → log sheet → human approval → optional deck → stop before send.
- **Questions / signals:** Do we need a deck this time? Are transcript + attendees present?
- **Qualify / frame / objections:** Follow-up is a deliverable, not an auto-send.
- **Procedure:** Existence if; speaker cleanup; pin; limit race; approval node.
- **Example that proves it:** Fireflies webhook logs the row; approval sits before Gamma.
- **Why it works:** Most calls do not deserve a deck. Tokens and client trust are the scarce things.
- **Conditions / exceptions:** Works with a recorder + a sheet we own. Fails if approval is removed.
- **Operate-never payload:** Auto-send the Gamma deck. Install Fireflies/Gamma as hive SKU. Quote any deck fee as FACT.
- **Hive run (existing skills only):** `ask-principal` · `input-required-money` · `cheap-read-expensive-decide`
- **Source:** `-Q_P7HFydZk` @ UNKNOWN

### Operate-never
- Autonomous trades, transfers, or account changes. L4 human only.
- Quote tape $ / student counts / minutes / prizes as FACT or NAV.
- Treat the tape as a sector or allocate a tape SKU.
- Book YouTube income, community size, or a demo as portfolio proof.
- Install Claude Code / Codex / ChatGPT / Gemini / Vapi / n8n-cloud / switch stack as ours. Cursor + Grok only.
- New `icp_id`. Unpark Normand. Start Path A. Learning ≠ hunt. Clients parked.
- Grok Bot / `sendPrompt`. Send / pay / deploy / book / publish.
- Overwrite `takes/wealth-manager.md`. Merge `LESSONS-FROM-TAPE.md`.
- Auto-send proposal decks. Allocate Gamma / Fireflies as a tape SKU.

## L. Role-Specific Applications
A deck is not NAV. Gamma seats are a cost line for Personal CFO. This desk only cares that approval sits before spend and before send. Clients parked. Do not book a proposal mill as a sector.
