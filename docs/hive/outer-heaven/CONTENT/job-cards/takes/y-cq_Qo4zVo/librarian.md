# Librarian — y-cq_Qo4zVo
Status: filled
Protocol: deep-video-learning
**Source:** `docs/hive/outer-heaven/CONTENT/watch-later/packets/y-cq_Qo4zVo/full.txt`
**Packet LEARNED:** `docs/hive/outer-heaven/CONTENT/watch-later/packets/y-cq_Qo4zVo/LEARNED.md`
**ICP:** parked unless Evens named one.
**Title:** I Built an AI Voice Receptionist with Vapi and n8n MCP
**Channel:** Nate Herk | AI Automation
**Kind:** video (~8187 words)
**Captions:** yt-dlp — timestamp UNKNOWN (no VTT unless noted)
**Walked:** 2026-08-14 librarian re-walk. Did not merge `LESSONS-FROM-TAPE.md`. Clients parked. Did not overwrite `takes/librarian.md` (18-tape SSOT).

## A. Source Map
1. **Kylie** / Hercules Detailing. Front: **Vapi**. Back: **n8n MCP** with **seven** one-job workflows (lookup, new client, availability, book, update, lookup appt, delete). Free prompt + 15-page guide. Live: new caller `nateample.com` / 333-444-5678 → confirm spell → CRM → interior tomorrow **8 a.m.** → call-log outcome booked. Second call: same email → move +1h → **9 a.m. Dec 7**. Edit-insert: **always disclose "I am an AI"** — he did not in the opening demo. Prerequisite: ~40-min beginner voice tape (`zWLZ3bVVwD8`).
2. Wireframe first (inbound → email lookup → new vs exist → intent → FAQ loop / book-change-delete / transfer → end-call log). First design: two mega webhooks (CRM + calendar) with intent switches — **abandoned** (webhook response hell). MCP instead. Vapi model **GPT-4.1** (better follower than 4). First message asks email. Prompt is ~**50th** version; Vapi "generate" can rewrite (sarcastic demo, discarded). **No AI in the n8n tools** — a second brain doubles latency/cost/error. One-node tools are a feature.
3. Wire: Vapi MCP tool = n8n production MCP URL + `Authorization: Bearer <n8n API key>` + **SSE** (not streamable HTTP). Prompt: lowercase email; **speak before every tool** ("let me check") or the line goes silent; confirm spelling before write. Lookup miss → "new client" payload → new-client tool. Book: availability (now→23:59:59 today, or 00:00–23:59 other days) → confirm 1-hour slot → calendar create + sheet row. Update: window search → **event ID** → patch calendar + match-ID sheet. Delete = same ID, notes cancelled. "Buddy" slip he dislikes.
4. Angry no-email → **Handoff** tool to another Vapi assistant (CS), not a phone transfer (transfer-call is the human-number variant; one handoff can fan to CS / sales / Alex). KB: upload FAQ PDF; prompt "use only this via **default query tool**" (no tool you add). Why MCP over N custom tools: one schema surface; change inputs in n8n only. Call log: Vapi listen-back **and** Advanced → Messaging → server URL = n8n webhook, **end-of-call report only**; analysis summary (2–3 sentences) + structured `outcome`. Production URL even if the node shows test. Phone: free Vapi numbers **≤10**/account; assign inbound; fallback dest; outbound teased. Plus **200** + 2-hour live build in Plus. Courses named: Agent Zero, 10 hours/10 seconds, one-person agency, subs-to-sales.
Gap: full 50th prompt, MCP JSON. Timestamp UNKNOWN. Vapi/n8n on-tape. Hercules ICP parked. Do not flatten with `-cdexJWN8YA` (ElevenLabs widget) — different door, same "don't double-brain."

## B. Atomic Knowledge

### Wireframe the branches; one brain; MCP one-job tools; disclose AI; log the hang-up
- **Claim:** Voice is a tree of ifs. Draw it. Vapi reasons; n8n executes with zero LLM. MCP beats two fat webhooks and beats N named custom tools (params live in one place). Speak-before-tool is latency etiquette. Event ID is the unique key. Handoff ≠ PSTN transfer. KB is a file + "don't invent." End-of-call report is a second webhook, not the MCP. He teaches disclose-AI after a demo that didn't. Book/move are hard steps.
- **Reasoning:** Complements ElevenLabs widget tape and beginner voice tape. Hive does not install Vapi/n8n or take detailing calls.
- **Mechanism:** wireframe → Vapi prompt+MCP → seven dumb workflows → speak-then-tool → ID match → handoff/KB → EoC sheet → HITL on real numbers.
- **Evidence:** 8 a.m. then 9 a.m.; mike@ vs nateample; buddy slip; no-email transfer; default query; 50th prompt.
- **Conditions:** Plus 200 vs 200k / 2,500 wobble. 10 free numbers UNVERIFIED.
- **Exceptions:** Do not stand Kylie on a real line. Do not skip the AI disclosure he added in edit.
- **Action:** File one-brain, MCP-one-job, speak-before-tool, event-id-match, disclose-AI, EoC-report. Do not book.
- **Confidence:** high as a Vapi+n8n receptionist anatomy
- **Source:** `y-cq_Qo4zVo` @ UNKNOWN
- **Epistemic:** SOURCE
- **Knowledge type:** declared + demonstrated (transcript-implied)
- **Modality:** speech
- **Evidence status:** transcript-implied
- **Shown / clicked / sequenced:** UNKNOWN
- **Failed / retried:** 50 prompt versions; two-webhook design thrown away; "buddy"
- **Speech ≠ behavior:** edit says always disclose AI vs opening calls that don't; "pretty much anything" vs 7 tools + FAQ file

## C. Mental Models
Front voice / back dumb. Don't double-brain. Wireframe is the prompt. MCP is the schema bus. Silence is a bug. ID not name. Disclose. Skool room.

## D. Procedures
1. Draw new/exist, intent, book/change/delete, transfer, FAQ, log.
2. One Vapi brain; n8n tools with no LLM.
3. MCP URL + Bearer + SSE.
4. Prompt: lowercase email, speak before tools, confirm before write, FAQ-only.
5. Match calendar + sheet on event ID.
6. Handoff assistants vs PSTN transfer — pick on purpose.
7. EoC report webhook; production URL.
8. Say you are AI on a real line.
Avoid: Vapi/n8n as hive; second agent in n8n; auto-book; skip disclosure.

## E. Examples
**Two-webhook abort:** Situation — CRM+calendar mega flows. Action — MCP seven ways. Outcome — params live in n8n. Lesson — one schema surface.

**No-email fury:** Situation — refuses lookup. Action — handoff CS assistant. Outcome — "Hello, I am customer support." Lesson — a door, not a lecture.

## F. Decision Rules
- IF the back end is deciding → you doubled the brain.
- IF the line goes quiet → you forgot "let me check."
- IF two rows can share a name → match event ID / email.
- IF the caller is a human on a real number → disclose AI.
- Refuse: Vapi as hive; detailing hunt; book without HITL.

## G. Contrarian
Against n8n-agent behind Vapi. Against "optimal receptionist" (he says this is just what he wanted). Against hiding that it is AI (edit).

## H. Assumptions
Caption-only. Complements `-cdexJWN8YA` / `zWLZ3bVVwD8`. Keep Plus-200.

## I. Questions
Did the 50th prompt ever stabilize? Did anyone use the free Vapi number in production?

## J. Connections
SYSTEM SYNTHESIS → one-job tools (`jBanaNBY-sM`); book HITL; do not flatten Vapi vs ElevenLabs.

## K. Future-Use
One-brain + speak-before-tool + event-id + disclose-AI + EoC as atoms.

## Steal / Operate-never

### Machine: draw the tree; one brain; dumb tools; say you are AI; log the hang-up
- **Epistemic:** SOURCE
- **Workflow / loop:** wireframe → Vapi+MCP → seven tools → speak/confirm → ID write → handoff/KB → EoC
- **Questions / signals:** Did it disclose? Did it speak before the tool? Whose ID?
- **Qualify / frame / objections:** Hercules is a demo shop. 15 pages are not a hive OS.
- **Procedure:** D above.
- **Example that proves it:** 8→9 a.m.; two-webhook abort; no-email handoff.
- **Why it works:** A scripted tree plus dumb I/O beats a second LLM.
- **Conditions / exceptions:** Counts UNVERIFIED. Hive does not run Vapi.
- **Operate-never payload:** n8n-cloud/Vapi as hive. Hidden AI. Auto-book. Plus as the only build log.
- **Hive run:** File disclose-AI + one-brain. Book stays HITL.
- **Source:** `y-cq_Qo4zVo` @ UNKNOWN

### Operate-never
- Vapi / n8n-cloud as hive. Hidden-AI receptionist. Auto-book. Merge LESSONS. Send / pay / deploy / book / publish.

## L. Role-Specific Applications
Upgrade old take: add disclose-AI edit + two-webhook abort + SSE. Do not stand Kylie. Hard steps HITL.
