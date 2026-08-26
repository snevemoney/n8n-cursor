# Big Boss — KGXFkUlBHxw
Status: filled
Protocol: deep-video-learning
**Source:** `docs/hive/outer-heaven/CONTENT/watch-later/packets/KGXFkUlBHxw/full.txt`
**Packet LEARNED:** `docs/hive/outer-heaven/CONTENT/watch-later/packets/KGXFkUlBHxw/LEARNED.md`
**ICP:** parked unless Evens named one.

## A. Source Map

Nate Herk, 20:46, PACKET 5064 words, captions `en-orig`. Timestamp UNKNOWN on `full.txt`. Visual-only gaps: two n8n workflows, Google Sheet (date, title, attendees, gist, id, status), Slack yes/no, Gamma deck for “Greengrass,” form-submit recover path, Excalidraw A/B→C.

Beats, in order:

1. Hook: hop off a call, used to send minutes or a proposal by hand (his old full-time job). Today: follow-up slide deck after a potential-client call.
2. Live run of the whole system. **Two workflows on purpose** (scale / extra paths later). (1) Meeting ends → log sheet. (2) New row → refetch → human approval → maybe Gamma deck.
3. Why split: when a meeting ends you may want different things by who it was with. Baking Gamma into the logger makes later forks harder. He shows extra unused paths on both halves.
4. Workflow 1: Fireflies “transcription complete” webhook → n8n. Webhook body is thin (meeting id, event type) — not the transcript. **Wait**, then Fireflies get-transcript. AI summary/gist/action items are **not ready** at transcript-complete. **If** gist exists → continue; else wait and poll (infinite loop until ready). Code node: speakers array. He writes code by pasting incoming JSON into Claude, run, correct, repeat. Sheet append: now, title, attendees, gist, status `NA`, meeting id.
5. Workflow 2: new row trigger. Limit last item (two meetings ending at once). Refetch Fireflies. Harder code node: full transcript with speaker names collapsed until the next person talks. Slack **send-and-wait**: “Your meeting [title] has just concluded. Would you like to generate a proposal?” Yes → agent. No → status `generation declined`.
6. Agent role: senior AI solutions consultant / sales engineer for “Up” / Uppit. Transcript → polished client-facing proposal. Constraints: no follow-up questions; **do not mention automation, AI generation, or that this was system produced**; confident assumptions; placeholders. **Assumption: never auto-send to the client** — 90%, human tweaks, human sends. Structured sections: title, exec summary, problem, solution, ROI, intangibles, roadmap, success metrics, why-us.
7. Gamma HTTP: copy curl from docs, line-by-line required vs optional. `inputText` = agent blob. `textMode` = **preserve**. Theme ID from Gamma “copy theme ID for API.” Image/model filters like shopping. **Replace** newlines/quotes so the JSON body does not break. Auto-share view/comment + email himself a link.
8. Slack “deck is generating, email shortly.” Sheet **update** (not append) on meeting id → status `generated`. Email invite → open Greengrass vendor-onboarding deck. He walks slides; flags a graph he would edit; 350+ hours / 28K / 0% error are **on-deck claims, UNVERIFIED**. Four-week roadmap may be invented. Why-us could later RAG past projects — not built.
9. Recover path: paste meeting id on a form if you declined and changed your mind. Same generate tail.
10. **Standardize inputs:** path A form vs path B natural trigger cannot both fire in one execution. Set node **C** = transcript + meeting id from A **or** B. Downstream only reads C. Excalidraw lesson. Download the template and run both paths if this is still fuzzy.
11. Second deck is structurally similar, always a bit random (agent + Gamma). Refine the system prompt. Close: Plus, **3,000** members — **UNVERIFIED.**

Off-topic / not skipped: Claude-writes-the-code-node; Uppit costume; “do not mention AI”; Greengrass numbers; Skool free template.

## B. Atomic Knowledge

### Split the funnel so later paths can fork
- **Claim:** Two workflows on purpose. Logger ≠ always-a-proposal. Baking them together makes routing harder later.
- **Reasoning:** Different meeting counterparts want different last miles. Extra unused paths are reserved.
- **Mechanism:** Webhook/log vs sheet-trigger/generate. Shared id.
- **Evidence:** He says scalability; shows spare branches.
- **Conditions:** You expect more than one post-meeting job.
- **Exceptions:** A single always-proposal shop could merge — he still splits.
- **Action:** Router energy (`website-offer-funnel` shape), not a new client. Meeting-end is not auto-deck.
- **Confidence:** high
- **Source:** `KGXFkUlBHxw` @ UNKNOWN — “why did I split this up into two workflows?”
- **Epistemic:** SOURCE

### Wait until the summary exists
- **Claim:** Fireflies “transcription complete” is not “AI gist ready.” Poll: wait → fetch → if gist missing, loop.
- **Reasoning:** You would only know this if you played with Fireflies. Immediate fetch drops action items / overview.
- **Mechanism:** Wait node + if on AI summary/gist + loop back.
- **Evidence:** Spoken + live first-workflow run.
- **Conditions:** The vendor emits two-phase completeness.
- **Exceptions:** If you only need raw sentences, you could skip — he wants the gist on the sheet.
- **Action:** Checkable stop, not a hope. `golden-test-loop` / `coverage-loop`.
- **Confidence:** high
- **Source:** `KGXFkUlBHxw` @ UNKNOWN — “if you search Fireflies right away… the AI generated stuff isn’t always done yet”
- **Epistemic:** SOURCE

### Log first, unique id, status as the state machine
- **Claim:** Sheet row is the object: date, title, attendees, gist, id, status (`NA` → `generated` | `generation declined`).
- **Reasoning:** Later you must find the meeting. Id is the only unique handle. Status is how humans and the second workflow talk.
- **Mechanism:** Append on log; **update** on generate/decline, match on meeting id.
- **Evidence:** Live row, then status flip after Slack yes.
- **Conditions:** One row per meeting.
- **Exceptions:** Limit-last-item is a guard if two rows land together — last wins, first can be skipped.
- **Action:** Definition of done for slice 1: row exists with id + gist. Not a deck.
- **Confidence:** high
- **Source:** `KGXFkUlBHxw` @ UNKNOWN — “the only really unique identifier you have could be the meeting ID”
- **Epistemic:** SOURCE

### Human yes/no before generate
- **Claim:** Slack send-and-wait: generate proposal? Yes → agent. No → `generation declined`. You do not always need a deck.
- **Reasoning:** Meeting-end ≠ proposal. Approval is the product.
- **Mechanism:** Slack buttons. Recover later via meeting-id form.
- **Evidence:** Live “green grass proposal” prompt; yes path; decline path described.
- **Conditions:** Someone is at Slack.
- **Exceptions:** Form path skips the Slack question and goes to generate — still a human pasted the id.
- **Action:** `ask-principal`. I do not auto-send a deck because Fireflies fired.
- **Confidence:** high
- **Source:** `KGXFkUlBHxw` @ UNKNOWN — “we will get human approval… because we don’t always need that”
- **Epistemic:** SOURCE

### 90% costume, human still sends
- **Claim:** Agent writes a client-facing proposal. Do not mention AI. Do not auto-send. Human tweaks, then sends. Structure beats random slides.
- **Reasoning:** “AI is going to generate something random every time. But the more structure you can give it, the better.” Graph on the sample deck is wrong — proof it is not shippable.
- **Mechanism:** Long system prompt (role, constraints, section list) → blob → Gamma preserve + theme → email link to himself.
- **Evidence:** Greengrass walk; he would edit the graph; 4-week cycle “maybe that’s true, maybe that’s not.”
- **Conditions:** Discovery transcript exists. Theme ID exists.
- **Exceptions:** Invented ROI (350 hours, 28K, 0% error) is on the slide — UNVERIFIED, and a reason not to send.
- **Action:** Draft deck. Evens ships. “Do not mention AI” is his sales costume, not ours.
- **Confidence:** high
- **Source:** `KGXFkUlBHxw` @ UNKNOWN — “the assumption is not that you would ever automatically send this to the client”
- **Epistemic:** SOURCE

### Sanitize the payload or the API dies
- **Claim:** Replace newlines/quotes in the agent blob before the Gamma JSON body.
- **Reasoning:** One quote breaks the request.
- **Mechanism:** Replace function on `inputText`.
- **Evidence:** He calls it out as one of two must-knows (with auto-share).
- **Conditions:** LLM output inside JSON.
- **Exceptions:** If the vendor accepts multipart, maybe not — he is on a JSON body.
- **Action:** Any HTTP that embeds model text gets a sanitize step.
- **Confidence:** high
- **Source:** `KGXFkUlBHxw` @ UNKNOWN — “if the AI agent decides to put in some new lines or… quotation marks, it would break this body”
- **Epistemic:** SOURCE

### Standardize A or B into C
- **Claim:** Form recover and natural trigger never run in the same execution. Downstream must not reference both nodes. Set node C holds transcript + id from whichever ran.
- **Reasoning:** The agent cannot “look in both” when one never executed.
- **Mechanism:** Set node. Excalidraw A/B → C. He says download and run both paths if confused.
- **Evidence:** Full spoken lesson + second path demo.
- **Conditions:** Two entry points, one tail.
- **Exceptions:** A single-entry workflow does not need C — until you add the second door.
- **Action:** When you add a recover path, add the normalize node the same day.
- **Confidence:** high
- **Source:** `KGXFkUlBHxw` @ UNKNOWN — “make sure that these nodes are dynamic enough to reference either if A ran or if B ran”
- **Epistemic:** SOURCE

### Code nodes are paste-JSON-and-correct, not heroics
- **Claim:** He copies incoming JSON, asks Claude for an n8n code node, pastes, runs, sends the error back, repeats.
- **Reasoning:** “It’s not always perfect on the first try… that’s how I always write my code notes.”
- **Mechanism:** Speakers array; later collapsed transcript.
- **Evidence:** Two code nodes in the demo.
- **Conditions:** Incoming JSON is pinned and real.
- **Exceptions:** On-tape vendor is Claude. Hive: Cursor + Grok, same loop shape.
- **Action:** Do not install Claude because a code node was hard.
- **Confidence:** high
- **Source:** `KGXFkUlBHxw` @ UNKNOWN — “I will come into the code node and I will take the JSON”
- **Epistemic:** SOURCE

## C. Mental Models

- **Log ≠ act.** Meeting-end is a row, not a deck. **SOURCE**
- **Ready is a poll, not a webhook.** Vendor “complete” is a lie. **SOURCE**
- **Ask before generate.** Slack wait is the product. **SOURCE**
- **90% then human.** Structure in the prompt; taste in the edit. **SOURCE**
- **Costume: do not mention AI.** His close, not our ethics card. **SOURCE**
- **Two doors, one tail.** Normalize or the recover path breaks. **SOURCE**
- **Status is the conversation** between workflows. **SOURCE**
- **Plus / 3,000 is the magnet.** **INFERENCE**
- **Fireflies + Gamma stay on tape.** The physics is wait / ask / draft. **SYSTEM SYNTHESIS**

## D. Procedures

1. **Split:** logger workflow vs generate workflow. Shared meeting id.
2. **On vendor “complete”:** wait → fetch → if summary missing, loop.
3. **Clean** speakers / transcript (collapse repeats).
4. **Append** row: date, title, attendees, gist, id, status `NA`.
5. **On new row:** refetch, clean, **ask** generate? (HITL).
6. **No** → status declined. **Yes** → structured draft → render → link to **us**, not the client.
7. **Sanitize** model text before JSON.
8. **Update** status `generated` on id.
9. **Human** edits (graphs, invented ROI, roadmap) then Evens sends.
10. **Recover:** paste id → same tail via normalize node C.

**Qualify / frame:** `us` ops if we ever log calls. Not a Gamma SKU. Not Uppit.
**Objections:** “It auto-makes proposals” — Slack wait and “never automatically send” are on tape.
**Avoid:** auto-share to a client; pretend the deck is human-only; quote 3,000 / 28K / 350 hours as FACT; Fireflies/Gamma/n8n as hive stack.
**When to change:** if gist never arrives, stop the poll and page a human. If the graph is nonsense, do not send.

## E. Examples

**Situation:** Fireflies fires “transcription complete.”  
**Action:** Wait + poll until AI gist exists; then speakers + sheet row status `NA`.  
**Reasoning:** Immediate fetch is empty of the useful summary.  
**Outcome:** Row you can approve later.  
**Lesson:** Complete ≠ ready. Implicit rule: poll a checkable field.

**Situation:** Slack “generate proposal?”  
**Action:** Yes → agent + Gamma + email-to-self + status `generated`. No → declined. Later form can recover.  
**Reasoning:** Not every call wants a deck.  
**Outcome:** Human still in the loop.  
**Lesson:** Ask is the product.

**Situation:** Greengrass deck.  
**Action:** Walks exec summary, invented 350 hours / 28K / 0% error, bad graph, 4-week roadmap maybe-true.  
**Reasoning:** 90% is the point.  
**Outcome:** He says do not send yet.  
**Lesson:** Pretty slides can be false. Implicit rule: human owns numbers.

**Situation:** Two entry points.  
**Action:** Set node C so the agent always reads `json.transcript`.  
**Reasoning:** A and B never coexist.  
**Outcome:** Recover path does not break the tail.  
**Lesson:** Normalize when you add a second door.

## F. Decision Rules

- If the meeting just ended → log, do not generate.
- If the gist is missing → wait, do not proceed.
- If nobody said yes → no deck.
- If the deck exists → it goes to us, not the client.
- If model text enters JSON → sanitize.
- If you add a second trigger → add C the same day.
- If a slide invents ROI → edit or kill before send.
- Optimize: time from call-end to a **draft** link.
- Refuse: auto-send, Gamma as a SKU, “do not mention AI” as our brand.

## G. Contrarian

- Against one mega-workflow: split for later forks.
- Against trusting the vendor’s “complete” event.
- Against auto-proposal on every call.
- Against sending the first Gamma.
- Field assumes “automate proposals” means the client gets mail. He mails himself.

## H. Assumptions

**His:** Fireflies + n8n + Slack + Gamma + Claude-for-code is the OS; Uppit consultant voice is the right costume; theme ID = brand; Plus is the conversion.

**Ours:** Captions complete enough (5064 words). 3,000 members, Greengrass 28K / 350 hours **UNVERIFIED**. Domain: his agency follow-up, not Path A. Hive: Cursor + Grok; send/deploy HITL.

**Falsifiers:** Poll never exits. Slack yes is ignored and it still generates. Sanitize misses a quote and the run dies. Client receives the share link because auto-share was pointed at them.

**Disagreement (keep labeled):** We will not operate Gamma/Fireflies/n8n or auto-share. The **wait-until-ready**, **ask-then-draft**, **normalize A/B→C** machines are still stolen. **SYSTEM SYNTHESIS**

## I. Questions

- Who is on the Slack yes? One person or a channel?
- How long does the Fireflies gist poll usually take? Not on tape.
- Does auto-share ever include the client email by mistake in his real setup?
- Sibling “Uppit” / consultant-prompt tape? Do not invent.
- RAG of past projects on the why-us slide — built later?

## J. Connections

- **SYSTEM SYNTHESIS** → `ask-principal` (generate? / send).
- **SYSTEM SYNTHESIS** → `coverage-loop` / `golden-test-loop` (wait-until-ready).
- **SYSTEM SYNTHESIS** → `slice-build` (two workflows, one job this take: log + ask + draft).
- **SYSTEM SYNTHESIS** → `website-offer-funnel` router energy (meeting-end ≠ always proposal) — not a new client.
- **SYSTEM SYNTHESIS** → `client-delivery-kit` analog (deck for *their* client) — parked; do not fork SaaS.
- Do not unpark Normand because a Greengrass slide slapped.

## K. Future-Use

- Status state-machine as a Watchdog object (unassigned).
- Sanitize-before-JSON as a Forge lint (unassigned).
- A/B→C normalize as a standard when we add recover paths (unassigned).
- “Invented ROI on the slide” as a Consultant red-flag (unassigned).
- Form-recover as an `ask-principal` resume (unassigned).

## Steal / Operate-never

### Machine: Log the meeting → wait until gist → ask Evens → draft deck to us → human sends
- **Epistemic:** SOURCE (demo) / SYSTEM SYNTHESIS (hive mapping)
- **Workflow / loop:** trigger (call tool says complete) → wait/poll until summary exists → clean speakers → append row (id + status NA) → ask generate? → no: decline status · yes: structured draft → sanitize → render → link to **us** → update status → human edits → Evens sends. Recover: paste id → normalize C → same tail.
- **Questions / signals:** “Is the gist actually there?” “Do we need a proposal for this counterpart?” “Did we sanitize?” “Is the share target us?” “Which numbers are invented?”
- **Qualify / frame / objections:** `us` if we log calls. Not Gamma. “Automated proposals” → Slack wait + never auto-send are on tape.
- **Procedure:** D steps 1–10. Checkable stops: (1) gist present, (2) row with id, (3) human yes, (4) link not to client, (5) no send.
- **Example that proves it:** Fireflies complete → poll → sheet → Slack yes → Greengrass deck with a bad graph he would edit. Lesson: 90% is a draft.
- **Why it works:** Split keeps forks cheap. Poll makes “ready” checkable. Ask prevents deck spam. Structure + theme beat random slides. C makes two doors safe. Conditions: a transcript vendor, a human at the ask, a human at send. Exceptions: limit-last-item can drop a row; $ / 3,000 UNVERIFIED.
- **Conditions / exceptions:** Cursor + Grok only. Fireflies / Gamma / n8n / Claude / Slack-send stay on tape. Clients parked.
- **Operate-never payload:** Auto-send / auto-share to client; “do not mention AI” as our brand; quote 3,000 / 28K / 350 hours as FACT; Nate Plus / Uppit prompt as a SKU.
- **Hive run (existing skills only):** `ask-principal` · `coverage-loop` · `golden-test-loop` · `slice-build` · `client-delivery-kit` (analog only, parked)
- **Source:** `KGXFkUlBHxw` @ UNKNOWN

**Operate-never (this desk will not operate — still walked the tape):**

- Auto-send proposals / auto-share Gamma to a client / pretend the deck is human-only
- Install Fireflies / Gamma / n8n / Claude / Slack-send as hive OS
- Quote 3,000 / Greengrass $ / hours as FACT
- Nate Plus / Uppit consultant prompt as a hive SKU
- New `icp_id` / unpark Normand / hunt
- Grok Bot `sendPrompt` · send / pay / deploy / book / publish
- Merge `LESSONS-FROM-TAPE.md` · write packet `LEARNED.md` (Researcher owns that)

## L. Role-Specific Applications

I manage; I do not mail a Gamma because a webhook fired.

- **Done** this take: meeting logged, gist present, Evens yes/no, **draft** link to us. Not sent.
- **Delegate without being asked:** Forge owns wait/poll + sanitize + normalize C. Consultant owns the four-blank / invented-ROI kill. Communications does not send. Watchdog checks share target is us.
- **Skeptical review:** “Ready to go slide deck” is the hook. The graph is wrong on tape. I will not approve a Gamma SKU or a 3,000-member close as a lane.
- **One system this take:** log + ask + draft. Not two live proposal paths.
- Live hunt stays parked. Greengrass is a prop.
