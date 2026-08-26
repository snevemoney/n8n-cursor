# Librarian — KGXFkUlBHxw
Status: filled
Protocol: deep-video-learning
**Source:** `docs/hive/outer-heaven/CONTENT/watch-later/packets/KGXFkUlBHxw/full.txt`
**Packet LEARNED:** `docs/hive/outer-heaven/CONTENT/watch-later/packets/KGXFkUlBHxw/LEARNED.md`
**ICP:** parked unless Evens named one.
**Title:** I Built an AI System That Automates My Proposals (n8n + Gamma)
**Channel:** Nate Herk | AI Automation
**Kind:** video (~5064 words)
**Captions:** yt-dlp — timestamp UNKNOWN (no VTT unless noted)
**Walked:** 2026-08-14 librarian re-walk. Did not merge `LESSONS-FROM-TAPE.md`. Clients parked. Did not overwrite `takes/librarian.md` (18-tape SSOT).

## A. Source Map
1. Hop off a call → deliverable. Two workflows on purpose (scale / extra exits later): **(1) log** when the meeting ends; **(2) maybe deck**.
2. Fireflies **transcription complete** webhook → body is mostly meeting ID + event, **not** the transcript → Fireflies get-by-ID. Immediate get misses AI gist/summary → **wait + poll** until gist exists, else loop. Code node: speakers array (he pastes incoming JSON into Claude to write n8n code; iterate). Sheet: date, title, attendees, gist, status `NA`, meeting ID.
3. New row → get meeting → **keep last** if two end together → cleanup transcript (speaker labels once per turn) → Slack **send and wait** (“Green Grass proposal… generate?”). No → status `generation declined`. Yes → proposal agent (Up AI consultant; client-facing; no “this was AI”; structured title/exec/problem/solution/ROI/intangibles/roadmap/why-us) → **not auto-send to the client** — “90% then you tweak.” Gamma HTTP: docs line-by-line (input_text required, text_mode **preserve**, theme ID from Gamma UI, image model, JSON replace for quotes/newlines, auto-share view/comment to his email). Slack “deck generating”; sheet **update** (not append) on meeting ID → `generated`. Email invite → Green Grass vendor-onboarding deck: **350+ hours / $28k / 0% error** (UNVERIFIED, model-invented). Graph he would edit. 4-week roadmap maybe wrong. Why-us could search a past-project DB (not built).
4. Second path: paste meeting ID on a form if you declined earlier. **Standardize A|B → set-node C** (transcript + ID) so later nodes don’t reference a branch that never ran. Outputs “a little random” — refine the prompt. Skool JSON. Plus 3,000 (UNVERIFIED).
Gap: Gamma JSON, Fireflies payload. Timestamp UNKNOWN. Fireflies/Gamma/Slack/n8n on-tape.

## B. Atomic Knowledge

### Log, then ask, then generate; collapse branches into one set
- **Claim:** Split ingest from make. Poll the field that is actually ready (gist), not the webhook event. Slack wait is the human gate. A|B must become C or the next node 404s. Gamma is a formatter; the agent is the proposal; you still edit the graph and the $ slides. Never auto-send the deck.
- **Reasoning:** Two meetings can end together; two paths cannot both have run; AI gist lags the transcript.
- **Mechanism:** webhook → poll gist → sheet → Slack wait → agent → Gamma preserve → update status.
- **Evidence:** empty-if-immediate; last-item guard; Green Grass 350h/$28k; A|B→C; random second deck.
- **Conditions:** 350h/$28k/3,000 UNVERIFIED. “90%” is a feel.
- **Exceptions:** Form replay if you said no.
- **Action:** File poll-until-field + send-and-wait + A|B→C. Do not install Fireflies/Gamma. Do not auto-send. $ slides are model-invented until checked.
- **Confidence:** high as a proposal-ops machine
- **Source:** `KGXFkUlBHxw` @ UNKNOWN
- **Epistemic:** SOURCE
- **Knowledge type:** declared + demonstrated (transcript-implied)
- **Modality:** speech
- **Evidence status:** transcript-implied
- **Shown / clicked / sequenced:** UNKNOWN
- **Failed / retried:** code-node iterate; ROI graph nonsense
- **Speech ≠ behavior:** “automates my proposals” vs Slack yes + 90% tweak + don’t send

## C. Mental Models
Event ≠ ready. Unique ID is the join key. Structure beats random decks. 90% is not a client send.

## D. Procedures
1. Split log vs make.
2. Poll the AI field, not the webhook.
3. Guard last-item if two fire.
4. Human yes/no before Gamma.
5. Collapse inbound paths into one set before the writer.
6. Preserve agent text; escape JSON; update by ID.
7. Edit invented ROI before a human sees it.
Avoid: Fireflies/Gamma as hive; auto-send; 350h/$28k as FACT; Plus.

## E. Examples
**Gist poll:** Situation — transcription complete. Action — get-by-ID immediately. Outcome — no AI gist. Lesson — wait on the field.

**A|B→C:** Situation — Slack path vs form replay. Action — set-node C. Outcome — agent always sees `json.transcript`. Lesson — don’t reference a node that didn’t run.

## F. Decision Rules
- IF the gist is empty → wait, don’t write.
- IF two paths can start the same writer → collapse first.
- IF the slide has a $ → treat as draft.
- Refuse: Gamma/Fireflies as hive; auto-send; 3,000 as FACT.

## G. Contrarian
Against baking generate into the ingest. Against “webhook means ready.”

## H. Assumptions
Complements `ask-principal` / `7siRW0My05o` (poll). Caption-only.

## I. Questions
What wait interval? Did Green Grass numbers match the call?

## J. Connections
SYSTEM SYNTHESIS → `ask-principal`; `7siRW0My05o`; `HNKlFTd1maM`.

## K. Future-Use
Poll-until-field + send-and-wait + A|B→C as atoms.

## Steal / Operate-never

### Machine: log → poll ready → human yes → format → update by ID
- **Epistemic:** SOURCE
- **Workflow / loop:** webhook → poll gist → sheet → Slack wait → structured draft → formatter → checkable stop = a deck you opened and edited, not a client email
- **Questions / signals:** Is the gist there? Did both meetings fire? Which path ran?
- **Qualify / frame / objections:** 90% then tweak.
- **Procedure:** D above.
- **Example that proves it:** empty gist; A|B→C; $28k slide.
- **Why it works:** Ready ≠ event; send ≠ generate.
- **Conditions / exceptions:** $ UNVERIFIED; form replay.
- **Operate-never payload:** Fireflies/Gamma as hive; auto-send; 350h/$28k/3,000 as FACT.
- **Hive run:** Same wait-gate. Do not add Gamma.
- **Source:** `KGXFkUlBHxw` @ UNKNOWN

### Operate-never
- Auto-generate/send proposals. Fireflies/Gamma as hive. Quote 3,000 or $28k as FACT. Merge LESSONS. Send / pay / deploy / book / publish.

## L. Role-Specific Applications
File Slack-wait next to ask-principal. Do not stand up a hive Gamma pipe.
