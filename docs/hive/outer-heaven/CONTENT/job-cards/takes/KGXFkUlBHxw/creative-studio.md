# Creative Studio — KGXFkUlBHxw
Status: filled
Protocol: deep-video-learning
**Source:** `docs/hive/outer-heaven/CONTENT/watch-later/packets/KGXFkUlBHxw/full.txt`
**Packet LEARNED:** `docs/hive/outer-heaven/CONTENT/watch-later/packets/KGXFkUlBHxw/LEARNED.md`
**ICP:** parked unless Evens named one.

## A. Source Map
Nate: post-call **proposal deck** in n8n + **Gamma**. Beats: two workflows for later routes (who was on the call); Fireflies **transcription complete** webhook → only meeting ID → wait + poll until **AI gist** exists → code for speakers (Claude writes the node from pasted JSON) → Sheet (date/title/attendees/gist/status=NA/id); Sheet-new-row → get meeting → limit last item → cleanup transcript (speaker label once per turn) → Slack **send-and-wait** yes/no; no → status declined; yes → proposal agent (UpAI senior consultant; client-facing; **do not mention AI/automation/system**; confident placeholders; locked structure: title / exec / problem / solution / ROI / intangibles / roadmap / why-us) → Gamma HTTP **preserve** + custom **theme ID** + strip newlines/quotes + auto-share to his inbox; Slack “deck generating”; Sheet **update** by meeting ID = generated; Greengrass vendor-onboarding deck: **350+ hours**, **$28k**, 0% error (UNVERIFIED, invented-confident); **ROI graph colors don’t match** — 90% then human; form path: paste meeting ID later; **standardize A or B → C** (transcript + id) so the agent never points at a node that did not run. Skool JSON + Plus **3,000**. Visual: Slack yes/no, Greengrass title, broken graph.

## B. Atomic Knowledge

### Slack yes is the hard step
- **Claim:** Logging every meeting is cheap. Generating a client-facing deck is not. The fork is a human yes/no, then a human still edits before send.
- **Evidence:** “we don’t always need that… the assumption is not that you would ever automatically send this to the client… 90% of the way there.”
- **Conditions:** Fireflies in the call.
- **Exceptions:** Form-replay if you declined too fast.
- **Action:** HITL on generate and on send. Do not auto-email the client.
- **Confidence:** SOURCE.
- **Source:** `KGXFkUlBHxw` @ UNKNOWN
- **Epistemic:** SOURCE

### Structure is the brand; Gamma is the skin
- **Claim:** Free-form Gamma is random. The agent’s locked sections + `preserve` + a copied theme ID are the taste lock. Pictures/icons are downstream.
- **Evidence:** “AI is going to generate something random every time. But the more structure you can give it, the better… theme ID… copy theme ID for API.”
- **Conditions:** UpAI / AAS+ theme on tape.
- **Exceptions:** Graph still came out wrong; structure does not save a bad chart.
- **Action:** Plate the section list; do not ship Gamma as our stack.
- **Confidence:** SOURCE.
- **Source:** `KGXFkUlBHxw` @ UNKNOWN
- **Epistemic:** SOURCE

### A or B must become C
- **Claim:** Webhook path and form path cannot both exist in one execution. Downstream nodes that “look in both” break. A set-node C holds transcript + meeting ID.
- **Evidence:** “these nodes… need elements from path A or path B… feed it into a set node and we’re just going to call this C.”
- **Conditions:** Two triggers, one generate tail.
- **Exceptions:** A single-path workflow does not need C.
- **Action:** One door for the rest of the graph.
- **Confidence:** SOURCE.
- **Source:** `KGXFkUlBHxw` @ UNKNOWN
- **Epistemic:** SOURCE

## C. Mental Models
Poll until the gist exists (transcript-complete ≠ summary-complete). Code nodes from pasted JSON, not from pride. Client-facing = no “we used AI.” 90% + bad graph = do not send. Split workflows = future routes.

## D. Procedures
(Learn.) Wait/poll gist → log → Slack yes → structured draft → skin → human fix the chart → send as a person.
Avoid: n8n / Fireflies / Gamma; $28k / 350h as FACT; auto-send; “don’t mention AI” as a lie to a client we do not have; Plus.

## E. Examples
**Situation:** Greengrass deck.  
**Action:** Hours and $28k on the exec slide; graph colors lie.  
**Lesson:** The broken chart is the still that proves 90%.

**Situation:** Declined, then want it.  
**Action:** Paste meeting ID on a form; same C.  
**Lesson:** Replay is a second door, not a second agent.

## F. Decision Rules
- If Slack is no → do not generate.
- If the chart is wrong → do not send.
- If a node references a path that did not run → add C.
- If $ / 28k / 350 / 3,000 from this tape → UNVERIFIED.

## G. Contrarian
The “ready to go professional deck” is introduced with a wait-loop, a human gate, and a graph he would edit. Confident assumptions are a feature he also tells you not to mail.

## H. Assumptions
$28k, 350h, 3,000 members UNVERIFIED. On-tape n8n / Gamma / Fireflies. Clients parked.

## I. Questions
Visual of the mismatched graph? What did the Slack buttons look like? Theme still?

## J. Connections
- SYSTEM SYNTHESIS → `8C6iCpJ9HPo` (tone/structure lock).
- SYSTEM SYNTHESIS → `HNKlFTd1maM` (draft-not-send).
- SYSTEM SYNTHESIS → `a5sJNwfZ528` (one input field / C).

## K. Future-Use
Yes-gate + section lock + C-node. Unassigned.

## Steal / Operate-never

### Machine: human yes, locked sections, then fix the chart
- **Epistemic:** SOURCE
- **Workflow / loop:** poll gist → log → Slack yes/no → structured proposal → skin → human edits the lie (graph, $) → HITL send
- **Questions / signals:** Gist exist? Path A or B? Chart match the numbers?
- **Qualify / frame / objections:** 90% is a draft; send is a person
- **Procedure:** Preserve the agent text; theme ID; strip JSON-breakers; update by meeting ID
- **Example that proves it:** Greengrass graph; form replay via C
- **Why it works:** Random decks need a spine; two triggers need one door
- **Conditions / exceptions:** $ UNVERIFIED; no auto-send
- **Operate-never payload:** n8n / Gamma / Fireflies; $28k as FACT; hide “AI” on a live client deck we do not have
- **Hive run:** `cinematic-recipe`; `ask-principal`
- **Source:** `KGXFkUlBHxw` @ UNKNOWN

### Operate-never
- Install n8n / Gamma / Fireflies. Auto-send the deck. Quote 350h / $28k as FACT.
- Join Plus. New hunt.
- Merge `LESSONS-FROM-TAPE.md`. Game-studio / fake 3D / cheap taste / NSFW.

## L. Role-Specific Applications
Video-first: **Slack yes/no** and the **mismatched ROI graph** are the plates. Do not ship “professional Gamma” as the hero. Section spine (exec → problem → ROI → why-us) is ours to steal as a card, not a vendor. HITL. Clients parked.
