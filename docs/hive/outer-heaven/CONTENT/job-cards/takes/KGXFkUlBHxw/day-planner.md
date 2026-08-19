# Day Planner — KGXFkUlBHxw
Status: filled
Protocol: deep-video-learning
**Source:** `docs/hive/outer-heaven/CONTENT/watch-later/packets/KGXFkUlBHxw/full.txt`
**Packet LEARNED:** `docs/hive/outer-heaven/CONTENT/watch-later/packets/KGXFkUlBHxw/LEARNED.md`
**ICP:** parked unless Evens named one.

## A. Source Map
Nate: n8n **proposal** after a call — Fireflies + Sheet + Slack approve + **Gamma**. Beats: two workflows for scale (log vs generate; extra paths later); Fireflies webhook = **id + event only** → fetch transcript; **wait + poll** until AI gist exists (summary lags transcript); code node: paste JSON into Claude, iterate; Sheet: date/title/attendees/gist/status=NA/id; workflow 2 on new row; limit last item (two meetings); cleanup speakers (don’t repeat name every sentence); Slack **send-and-wait** yes/no; no → declined; yes → proposal agent (UpAI / Greengrass) — client-facing, **don’t mention AI**, placeholders, **90% then human send** (he says); structured sections; Gamma HTTP from curl, line-by-line required/optional, **preserve** text, custom theme ID, **replace** newlines/quotes so JSON lives, auto-share to **his** email; Slack “generating”; Sheet **update** by meeting id; deck has **350h / $28k** (UNVERIFIED) + a **wrong graph** he would edit; form path to re-run a declined id; **standardize A|B → C** (set node) so later nodes don’t reference a path that didn’t run. Plus **3k**. Caption-only. Timestamp UNKNOWN.

## B. Atomic Knowledge
### Split log vs make; poll until the summary exists; A|B → C; 90% is not a send
- **Claim:** The webhook is a ping, not the payload. AI gist is late — poll. Two triggers need a standardized packet or the agent breaks. Gamma is a formatter; the graph can be nonsense; human still ships.
- **Reasoning:** Baking generate into log makes later routes harder. Live vars from the path that didn’t fire are empty.
- **Mechanism:** Webhook → wait/poll gist → log → HITL yes/no → draft deck → human edits → Evens sends (we stop at draft).
- **Evidence:** “if you search Fireflies right away… the AI generated stuff isn’t always done yet.” / “not that you would ever automatically send this to the client.”
- **Conditions:** A meeting tool that lags summary; two entry paths.
- **Exceptions:** He auto-emails himself a Gamma link — still a send surface.
- **Action:** Steal poll-until-ready + A|B→C + 90%-not-send. Do not Fireflies/Gamma/n8n-cloud. Do not send the deck.
- **Confidence:** high as the split/poll/standardize.
- **Source:** `KGXFkUlBHxw` @ UNKNOWN
- **Epistemic:** SOURCE
- **Knowledge type:** declared + demonstrated (speech)
- **Modality:** speech
- **Evidence status:** transcript-implied
- **Shown / clicked / sequenced:** UNKNOWN
- **Failed / retried:** code node not first-try; graph colors wrong
- **Speech ≠ behavior:** “automated proposals” vs Slack approve + “don’t send right away”

## C. Mental Models
Scalability = extra paths later. Priority: 90% draft. Uncertainty: 350h / $28k / Plus 3k.

## D. Procedures
1. Split “log the event” from “make the artifact.”
2. If the vendor’s AI fields lag, wait + poll a named field.
3. If two triggers, set C = A or B before the agent.
4. HITL yes/no before generate.
5. Treat charts/$ as UNVERIFIED; human edits; Evens sends.
Avoid: Gamma pay; Fireflies webhook to prod; auto-send client; Plus.

## E. Examples
**Poll:** Situation → transcription complete. Action → fetch too soon. Reasoning → gist empty. Outcome → wait loop. Lesson → steal poll-until-field.

**Wrong graph:** Situation → ROI slide. Action → Gamma draws bars. Reasoning → 90%. Outcome → colors don’t match. Lesson → steal don’t-send.

## F. Decision Rules
- IF webhook body is only an id → fetch; don’t trust the ping.
- IF two paths can fire → standardize before the agent.
- IF the deck has a $ or a chart → not FACT, not a send.

## G. Contrarian
Rejects one-graph-does-all. Field: auto-send after the call. He: approve + 90%. We keep HITL and park clients.

## H. Assumptions
Theirs: UpAI / Greengrass is a demo. Ours: no Path A. Falsifier: auto-email the client. Survivorship: one test meeting.

## I. Questions
Same Fireflies wait as other meeting tapes?

## J. Connections
- SYSTEM SYNTHESIS → `send-removed` · `slice-build` · `a5sJNwfZ528` (standardize inbound).

## K. Future-Use
Poll-until-field. A|B→C. Unassigned Gamma theme IDs.

## Steal / Operate-never

### Machine: log ≠ make → poll the late field → HITL → A|B→C → 90% draft, human send
- **Epistemic:** SOURCE
- **Workflow / loop:** ping → fetch → poll gist → log → yes/no → draft → edit → stop (Evens sends)
- **Questions / signals:** Gist empty? Two triggers? Chart nonsense?
- **Qualify / frame / objections:** “Auto-send the proposal” is the fail. Slack-approve + edit is the pass.
- **Procedure:** No Gamma/Fireflies prod. No client send. No Plus.
- **Example that proves it:** Situation → ROI graph. Action → he would edit. Reasoning → 90%. Outcome → not sent (in speech). Lesson → steal the stop.
- **Why it works:** A named gist field and a C packet are checkable; 350h is not FACT.
- **Conditions / exceptions:** 350h / $28k UNVERIFIED.
- **Operate-never payload:** Gamma pay; auto-email client; Plus; quote $ as FACT.
- **Hive run (existing skills only):** `send-removed` · `ask-principal` · `slice-build`.
- **Source:** `KGXFkUlBHxw` @ UNKNOWN

### Operate-never
- Gamma / Fireflies-prod / auto-send proposal / Plus.
- Send / pay / deploy / book / publish.

## L. Role-Specific Applications
**One next:** `coverage-loop` score this packet as poll-until-field + A|B→C. Clients parked.
