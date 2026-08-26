# Creative Studio — pxzo2lXhWJE
Status: filled
Protocol: deep-video-learning
**Source:** `docs/hive/outer-heaven/CONTENT/watch-later/packets/pxzo2lXhWJE/full.txt`
**Packet LEARNED:** `docs/hive/outer-heaven/CONTENT/watch-later/packets/pxzo2lXhWJE/LEARNED.md`
**ICP:** parked unless Evens named one.

## A. Source Map
Nate: **Watch Me Build a Multi-Agent Newsletter in n8n**. Caption-only. Visual/click UNKNOWN. Beats: Excalidraw/Miro **first** (green = AI); weekly Sunday midnight; Tavily news/past-week/max 3 (“AI adoption for SMBs”) → planner (title + 3–5 word topics, structured parser) → split-out → Tavily again **raw content** / past month → section writer (heading only, cite sources, no intro/outro) → aggregate → editor **GPT-5** (intro/outro/sources, HTML, subject+content parser) → **Gmail draft** (he also hits send to a test inbox — treat as demo); pin/rename hygiene; Hostinger sponsor (code Nate Herk 10% — operate-never); Claude “writes nicer,” GPT-5 impressed. n8n / Tavily / OpenRouter / Hostinger / Skool on tape. **Human approval is in the open; production send is operate-never.**

## B. Atomic Knowledge

### Wireframe before nodes; one job per agent
- **Claim:** Planner ≠ section writer ≠ editor. One agent + a pile of articles is “way too overwhelming.”
- **Evidence:** Green boxes on the board; “I like to break it up in steps and have each AI do something very specialized.”
- **Conditions:** Recurring editorial.
- **Exceptions:** none on tape.
- **Action:** Three plates: topics, sections, dressed HTML.
- **Confidence:** SOURCE.
- **Source:** `pxzo2lXhWJE` @ UNKNOWN
- **Epistemic:** SOURCE
- **Knowledge type:** declared + demonstrated
- **Modality:** speech
- **Evidence status:** transcript-implied
- **Shown / clicked / sequenced:** UNKNOWN (caption-only)
- **Failed / retried:** Unstructured planner blob; title ref broke until he renamed the node.
- **Speech ≠ behavior:** Intro says “send it off to you for human approval”; demo Gmail goes to his test inbox as send.

### Structure the output or you cannot dress it
- **Claim:** Title+topics in one string cannot be split. Editor must emit `subject` + `content` or Gmail is soup. HTML type or you see raw `<p>`.
- **Evidence:** Set-node demo of the blob; structured parser; “if we sent it as text… weird -p-p2.”
- **Conditions:** Multi-step mail.
- **Exceptions:** none.
- **Action:** Schema before style.
- **Confidence:** SOURCE.
- **Source:** `pxzo2lXhWJE` @ UNKNOWN
- **Epistemic:** SOURCE

### First search is headlines; second search is the body
- **Claim:** Initial Tavily = news, week, no raw. Topic pass = raw on, wider window. You cannot write from summaries.
- **Evidence:** “we weren’t getting the actual raw content. And that’s what we want to write the newsletter.”
- **Conditions:** Cited edition.
- **Exceptions:** He used max 3 for the live demo.
- **Action:** Two research depths.
- **Confidence:** SOURCE.
- **Source:** `pxzo2lXhWJE` @ UNKNOWN
- **Epistemic:** SOURCE

## C. Mental Models
Board first, then the lean stack. Pin live data so you do not re-pay the API. Name nodes or later refs go red. Editor prompt is the brand/ICP spin. Sources after sentences are a taste you can rename (Forbes vs “source”). Draft weekly; human tweaks.

## D. Procedures
1. Board: trigger → scan → plan → deep research → write ×N → aggregate → edit → **draft**.
2. Pin/rename as you go.
3. Parser on plan and on editor.
4. HITL read; do not list-send.
Avoid: n8n/Tavily/OpenRouter/Hostinger/Skool; auto-send; sponsor coupon.

## E. Examples
**Situation:** Planner without schema.  
**Action:** One field.  
**Outcome:** Cannot split topics.  
**Lesson:** Schema is the split.

**Situation:** Editor user-message join with no newlines.  
**Action:** Sections smashed.  
**Outcome:** `join('\n\n\n')`.  
**Lesson:** The still of the HTML depends on whitespace.

**Situation:** “Gap to growth” draft.  
**Action:** Three sections + inline sources + footer list.  
**Lesson:** The plate is the draft, not the blast.

## F. Decision Rules
- If you cannot name the three jobs → do not run one mega-writer.
- If Gmail type ≠ HTML → reject the still.
- If it can send the list → draft only.
- If $ / Hostinger % from this tape → UNVERIFIED.

## G. Contrarian
He builds live instead of dropping a finished JSON first — the wireframe is the teaching still. GPT-5 for HTML, smaller model for plan/sections.

## H. Assumptions
Tavily 1000/mo free UNVERIFIED. On-tape n8n. Clients parked. Caption-only: Excalidraw, HTML mail = unobserved.

## I. Questions
Did the Gmail node say draft or send in the UI? Visual of the board? What did inline “source” look like?

## J. Connections
- SYSTEM SYNTHESIS → `vFepZE_wrfg` (same newsletter, WAT/Claude).
- SYSTEM SYNTHESIS → `tFFKuq2t0rI` (consultant then stylist).
- SYSTEM SYNTHESIS → `clip-factory` (draft pack).

## K. Future-Use
Three-agent editorial + draft-not-send. Unassigned.

## Steal / Operate-never

### Machine: board → scan → plan → cite-write → HTML draft (never list-send)
- **Epistemic:** SOURCE
- **Workflow / loop:** weekly trigger → headline scan → 3 topics → raw research → sections → editor HTML → Gmail **draft** → human
- **Questions / signals:** Blob or schema? Raw on? HTML type?
- **Qualify / frame / objections:** One agent + a pile is overwhelm
- **Procedure:** Pin/rename; join with newlines; sources required
- **Example that proves it:** Unparsed topics; “gap to growth” draft
- **Why it works:** Specialists + cites + a human last look
- **Conditions / exceptions:** Demo send to self ≠ production
- **Operate-never payload:** n8n/Tavily/Hostinger/Skool; list-send
- **Hive run:** `clip-factory`; `ask-principal`
- **Source:** `pxzo2lXhWJE` @ UNKNOWN

### Operate-never
- Install n8n / Tavily / Hostinger. Join Skool. Use coupon.
- Auto-send the list. New hunt.
- Merge `LESSONS-FROM-TAPE.md`. Game-studio / cheap taste / NSFW.

## L. Role-Specific Applications
Video-first: plate the **green-box wireframe** and the **sourced HTML draft**. Editor prompt is our voice lock. We do not Hostinger-ad the still. HITL. Clients parked.
