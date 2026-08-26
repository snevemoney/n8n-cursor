# Forge — KGXFkUlBHxw
Status: filled
Protocol: deep-video-learning
**Source:** `docs/hive/outer-heaven/CONTENT/watch-later/packets/KGXFkUlBHxw/full.txt`
**Packet LEARNED:** `docs/hive/outer-heaven/CONTENT/watch-later/packets/KGXFkUlBHxw/LEARNED.md`
**ICP:** parked unless Evens named one.

## A. Source Map
Nate Herk **Fireflies → Sheet → Slack HITL → Gamma deck**. Beats: two workflows for **scale/routing** (who was the meeting?). **(1) Log:** Fireflies **transcription complete** webhook → body is mostly **meeting ID** → **wait** → Fireflies get-transcript (AI gist/actions **lag** the transcript) → **poll** until gist exists → code: speakers array (Claude-from-JSON loop) → Sheet: date/title/attendees/gist/status=`NA`/id. **(2) Deck:** new row → limit last item (two meetings at once) → fetch + code: speaker-blocked transcript (don’t repeat name every sentence) → Slack **send-and-wait** “generate proposal?” → no = `generation declined`; yes = proposal agent (UpAI consultant; **client-facing; no “this was AI”; no follow-up Qs; structured sections**) → HTTP Gamma (docs line-by-line; `preserve`; custom theme ID; **replace** newlines/`"`; auto-share email) → Slack “deck generating” → Sheet **update** by meeting ID `generated`. **Never auto-send to the client — 90% then human.** Greengrass sample: **350h / $28k / 0% error** UNVERIFIED; he flags a **wrong graph**. Extra path: form + meeting ID if you declined. **Set node C = A or B** so later nodes don’t reference a path that didn’t run (transcript + id). Same deck, different random. Plus **3,000+**. Timestamp UNKNOWN. Fireflies / Gamma / Slack / n8n / Claude-for-code on-tape.

## B. Atomic Knowledge

### Split log vs act; poll the slow AI; HITL before the artifact; standardize the fork
- **Claim:** Webhook ≠ transcript. Summary lags. Approve before Gamma. Two triggers need a **C** set node. Structure the proposal or Gamma is random. Don’t send the 90%.
- **Reasoning:** Immediate Fireflies fetch misses gist. Append vs update by ID. Greengrass graph is wrong on purpose as a lesson.
- **Mechanism:** Wait+if poll; Slack buttons; Gamma `preserve` + theme ID + JSON-safe; C = A|B.
- **Evidence:** Greengrass email; declined path; form replay.
- **Conditions:** Fireflies + Gamma as taped.
- **Exceptions:** $28k / 350h UNVERIFIED. Claude-written code nodes.
- **Action:** Steal split + poll + HITL + C-node. Do not add Fireflies/Gamma/n8n-cloud. Don’t auto-send a deck.
- **Confidence:** high on the shape; tape $ UNVERIFIED.
- **Source:** `KGXFkUlBHxw` @ UNKNOWN
- **Epistemic:** SOURCE

## C. Mental Models
Webhook is a ping. Poll until the derived field exists. 90% + human. Theme ID is a product. Unique id is the join key.

## D. Procedures
1. Don’t import the Skool JSON. 2. Don’t auto-email a client deck. 3. If we ever fork triggers: standardize to C. 4. Don’t quote 350h/$28k as FACT. 5. Don’t join Plus.

## E. Examples
**Situation:** Transcription-complete fires.  
**Action:** Fetch immediately.  
**Reasoning:** Gist empty.  
**Outcome:** Wait+poll.  
**Lesson:** Derived fields lag.

**Situation:** Slack no.  
**Action:** Status declined; form later.  
**Reasoning:** HITL.  
**Outcome:** Replay by ID.  
**Lesson:** Don’t bake generate into log.

## F. Decision Rules
- If the artifact is client-facing → HITL, never auto-send.
- If two paths can feed one agent → C-node.
- If 350h / $28k / 3,000+ appear → UNVERIFIED.
- If Gamma/Fireflies as hive → park.

## G. Contrarian
Field one-flows “meeting ended → send deck.” He splits and asks. Field trusts Gamma graphs; he circles the bad one.

## H. Assumptions
Fireflies lag as demoed. Falsifier: gist is now sync. We do not run n8n-cloud. Clients parked — no Greengrass send.

## I. Questions
Do any hive paths send an artifact without a yes?

## J. Connections
SYSTEM SYNTHESIS: `7siRW0My05o` poll + linear. `7UNsK9LoORo` JSON-safe + child workflow. `ehg4fhydTgs` one-shot vs HITL. No Fireflies/Gamma. Deploy HITL is the steal.

## K. Future-Use
Split log/act. Poll derived fields. C-node. Never auto-send.

## Steal / Operate-never

### Machine: log ≠ act; poll until gist; human yes before the deck; C-node the fork; never auto-send
- **Epistemic:** SOURCE
- **Workflow / loop:** ping → wait for derived → log → ask → generate 90% → human edits → send (HITL)
- **Questions / signals:** Is the gist there? Did both paths write the same fields? Would this email a client?
- **Qualify / frame / objections:** 90% still lies (bad graph). Tape $ UNVERIFIED.
- **Procedure:** No Fireflies/Gamma/n8n-cloud. No client send.
- **Example that proves it:** Poll loop; Slack yes/no; Greengrass graph miss.
- **Why it works:** The webhook is a doorbell. The summary is late. The deck is a claim.
- **Conditions / exceptions:** Vendor-specific lag.
- **Operate-never payload:** Auto-send Gamma; quote $28k as FACT; Plus as ours.
- **Hive run:** HITL on any artifact. Deploy HITL.
- **Source:** `KGXFkUlBHxw` @ UNKNOWN

### Operate-never
- Auto-send a client deck. Import Fireflies/Gamma.
- New hunt. Send / pay / deploy / book / publish.
- Merge `LESSONS-FROM-TAPE.md`.

## L. Role-Specific Applications
I will not add Gamma. Artifacts stay HITL. Deploy HITL.
