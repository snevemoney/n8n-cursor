# Forge — y-cq_Qo4zVo
Status: filled
Protocol: deep-video-learning
**Source:** `docs/hive/outer-heaven/CONTENT/watch-later/packets/y-cq_Qo4zVo/full.txt`
**Packet LEARNED:** `docs/hive/outer-heaven/CONTENT/watch-later/packets/y-cq_Qo4zVo/LEARNED.md`
**ICP:** parked unless Evens named one.

## A. Source Map
Nate Herk **Vapi front + n8n MCP back** — Kylie, Hercules Detailing receptionist. Seven one-job workflows, **no AI on the back**. Demo: new caller (email/name/phone confirm) → CRM → interior detail tomorrow 8am (busy 10:15–11:15, 2–3) → end-of-call summary “booked.” Second call: lookup → move +1h to 9am → log “rescheduled.” **Edit insert:** always disclose “I am an AI.” Wireframe first (inbound → email lookup → new/exist → intent → FAQ loop / book|change|delete with deps → CRM activity → end → call log). He tried two mega-webhooks (CRM + appointments + intent switch); **webhook reply + param matrix got messy → one MCP server**. Vapi: GPT-4.1 (better than 4 at following), ~50th prompt, generate-edits (sarcastic demo discarded). Tool = n8n MCP: production URL + `Authorization: Bearer <n8n API>` + **SSE not streamable HTTP**. Prompt: lowercase email; **speak before every tool** (no 5s silence); confirm spelling before write; today = now→23:59:59; future = 00:00–23:59; don’t read event titles; 1h duration. Handoff tool → other Vapi assistants (CS/sales); transfer-call = real phone. Knowledge = uploaded FAQ, “default query tool,” don’t invent. End-of-call report webhook → summary + structured `outcome` → sheet. Vapi free numbers ≤10/account UNVERIFIED; inbound assign. Caption-only. Vapi / n8n / Skool on-tape.

## B. Atomic Knowledge

### One brain in Vapi; dumb fast tools behind MCP
- **Claim:** A second n8n agent doubles reason/cost/latency/error. Each workflow is one function (some 1–2 nodes). MCP picks by description. Two-webhook design forced you to maintain params in Vapi *and* n8n.
- **Reasoning:** Voice already is an agent. Back end should be guardrails.
- **Mechanism:** Server trigger lists workflows + schemas; Vapi sends what the prompt said the tool needs.
- **Evidence:** Lookup miss → “new client” payload → new-client tool writes the row. Book = calendar create + appointment-log row.
- **Conditions:** His seven JSONs. GPT-4.1 as taped.
- **Exceptions:** He still has a *separate* end-of-call webhook (not MCP) for the logger.
- **Action:** Steal one-brain + dumb tools + MCP over param-matrix. Do not install Vapi/n8n-cloud. Do not take live calls.
- **Confidence:** high.
- **Source:** `y-cq_Qo4zVo` @ UNKNOWN
- **Epistemic:** SOURCE
- **Knowledge type:** demonstrated
- **Modality:** speech
- **Evidence status:** transcript-implied
- **Shown / clicked / sequenced:** UNKNOWN
- **Failed / retried:** two-webhook abandoned
- **Speech ≠ behavior:** first-message does *not* say “I’m an AI”; insert says it should

### Wireframe the if/then; speak-then-tool; disclose
- **Claim:** Voice has too many branches to prompt from memory. Script like a call center. Confirm before CRM write. Email lowercase. Knowledge file only for FAQ. Handoff when they refuse email / want a human dept.
- **Reasoning:** Silence while the tool runs feels broken. Invented hours are worse than a transfer.
- **Mechanism:** Prompt sections: identity, greeting+lookup, CRM branch, intent, appointment (avail first), general→file, handoff destinations with when-to.
- **Evidence:** Furious no-email → CS assistant. FAQ tiers from the PDF. Update matches **event ID**.
- **Conditions:** Hercules is 24h in the demo (he jokes).
- **Exceptions:** “Buddy” slipped — prompt still leaky after 50 versions.
- **Action:** Steal wireframe + speak-before-tool + file-ground + event-ID match. Disclose if we ever voice. No auto-call.
- **Confidence:** high.
- **Source:** `y-cq_Qo4zVo` @ UNKNOWN
- **Epistemic:** SOURCE
- **Knowledge type:** declared
- **Modality:** speech
- **Evidence status:** transcript-implied
- **Shown / clicked / sequenced:** UNKNOWN
- **Failed / retried:** 50 prompt versions
- **Speech ≠ behavior:** disclose insert vs shipped first line

### End-of-call is a webhook, not a tool call
- **Claim:** Vapi call logs are for listen/debug. External logger = advanced → messaging → server URL = n8n production webhook; server message = **end of call report**; analysis = 2–3 sentence summary + structured outcome.
- **Reasoning:** Appointment facts already live on the appointment sheet; call log is the story.
- **Mechanism:** Active webhook uses production even if the node UI shows test.
- **Evidence:** Payload schema → summary + outcome “inquired about services.”
- **Conditions:** One outcome enum as taped.
- **Exceptions:** Could pluck email/time here too; he didn’t because the other sheet has it.
- **Action:** Steal EoC report → sheet. Do not wire a real number.
- **Confidence:** high.
- **Source:** `y-cq_Qo4zVo` @ UNKNOWN
- **Epistemic:** SOURCE
- **Knowledge type:** demonstrated
- **Modality:** speech
- **Evidence status:** transcript-implied
- **Shown / clicked / sequenced:** UNKNOWN
- **Failed / retried:** none
- **Speech ≠ behavior:** none

## C. Mental Models
Front thinks, back fetches. MCP is one plug so params don’t fork. Wireframe is the prompt. Silence is a bug. Disclose because it will never be perfect.

## D. Procedures
1. Do not install Vapi or n8n-cloud. Do not import his zip.
2. Do not assign a phone or auto-call. Do not send Skool.
3. Wireframe: lookup → branch → intent → FAQ|book|change|delete → log.
4. One voice brain; tools with no AI; descriptions = when-to-call.
5. MCP: prod URL + Bearer + SSE.
6. Prompt: speak before tools; confirm; lowercase email; date windows; don’t invent; handoff vs transfer.
7. Knowledge = uploaded source of truth.
8. EoC webhook for summary+outcome.
9. Match appointments on event ID.
10. Disclose AI if we ever ship voice.

## E. Examples
**Situation:** New Nate / nateample.com.  
**Action:** Lookup empty → confirm → create → avail → book 8am.  
**Reasoning:** Two tools, no second brain.  
**Outcome:** CRM + calendar + call outcome booked.  
**Lesson:** Confirm is a prompt rule, not a node.

**Situation:** Move +1 hour.  
**Action:** Avail → lookup event ID → update cal + sheet.  
**Reasoning:** Change needs the ID.  
**Outcome:** 9–10am, notes “moved.”  
**Lesson:** Unique ID or you collide.

**Situation:** Two webhooks with intent switches.  
**Action:** Abandoned for MCP.  
**Reasoning:** Reply + param lists in two places.  
**Outcome:** Seven tiny workflows.  
**Lesson:** Schema lives on the server.

## F. Decision Rules
- IF the back end starts reasoning → rip the agent out.
- IF params differ per action → MCP, not seven custom Vapi tools (his conclusion).
- IF caller refuses email / wants a human → handoff/transfer, don’t block.
- IF FAQ → file only.
- IF public voice → disclose.
- IF book/call → HITL / refuse.

## G. Contrarian
Field puts an n8n agent behind Vapi. He calls that latency+error. Field hides that it’s AI; the edit says say it.

## H. Assumptions
Vapi + n8n + GPT-4.1. Free numbers ≤10 UNVERIFIED. Hercules is a demo — do not unpark. Clients parked.

## I. Questions
What’s a hive notify path that isn’t Vapi? Do we already refuse outbound on `BO-jFbN4p8Y`?

## J. Connections
SYSTEM SYNTHESIS: `BO-jFbN4p8Y` Vapi outbound + poll — inbound twin. `-cdexJWN8YA` four pieces + disclose-adjacent. `jBanaNBY-sM` thin manager. No Vapi. Cursor + Grok.

## K. Future-Use
One brain, dumb tools, MCP, speak-then-tool, EoC webhook, disclose. No live number.

## Steal / Operate-never

### Machine: wireframe → Vapi script + n8n MCP one-job tools → EoC sheet; disclose
- **Epistemic:** SOURCE
- **Workflow / loop:** inbound → email lookup → create|greet → intent → (FAQ file | avail→book/change/delete on event ID | handoff) → hangup → end-of-call report
- **Questions / signals:** Exist in CRM? Book/change/delete/FAQ/human? Spoke before the tool?
- **Qualify / frame / objections:** Second brain = double latency. Two webhooks = dual maintenance.
- **Procedure:** No Vapi/n8n-cloud. No phone. No Skool. Disclose if voice.
- **Example that proves it:** 8am book / 9am move; no-email CS handoff; FAQ from PDF; 50 prompt versions.
- **Why it works:** Voice decides; tools are fast and typed; logger is a side webhook.
- **Conditions / exceptions:** SSE + Bearer. Active webhook = production URL.
- **Operate-never payload:** Vapi; auto-call; his zip; Skool; hide that it’s AI.
- **Hive run:** none. Book/call HITL.
- **Source:** `y-cq_Qo4zVo` @ UNKNOWN

### Operate-never
- Do not install Vapi or n8n-cloud.
- Do not take or place live calls.
- Do not send Skool or import the seven JSONs as hive.
- Clients parked. Call / book HITL.

## L. Role-Specific Applications
Forge steals **one-brain / dumb-tools**, **speak-before-tool**, **EoC logger**, **disclose**. We do not stand up Kylie. Cursor + Grok. No Vapi.
