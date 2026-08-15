# Librarian — 0Ujdys4LqNs
Status: filled
Protocol: deep-video-learning
**Source:** `docs/hive/outer-heaven/CONTENT/watch-later/packets/0Ujdys4LqNs/full.txt`
**Packet LEARNED:** `docs/hive/outer-heaven/CONTENT/watch-later/packets/0Ujdys4LqNs/LEARNED.md`
**ICP:** parked unless Evens named one.
**Title:** I Built a Multi-Agent Newsletter System Live
**Channel:** Nate Herk | AI Automation
**Kind:** short (~1:40 / ~398 words)
**Captions:** yt-dlp — timestamp UNKNOWN (no VTT)
**Walked:** 2026-08-14 librarian re-walk. Did not merge `LESSONS-FROM-TAPE.md`. Clients parked. Did not overwrite `takes/librarian.md` (18-tape SSOT).

## A. Source Map
1. First step after trigger: research. Tool typed as "Tavi" (Tavily on-tape).
2. Query is a broad category/niche; example: "AI adoption for small businesses"; stays the same every run.
3. Returns three URLs with summarized content.
4. Next: AI agent creates titles and topics from that research.
5. Chat model via Open Router → "GBT 5 mini" (GPT-5 mini on-tape).
6. System message (expression, fullscreen): expert newsletter planner; receive three articles from the past week; creative/fun title + main topics.
7. Run: fields come back separately (can drag); he pins the data so he does not rerun the agent if something goes wrong.
8. CTA: full breakdown.
Gap: later agents, send, long `pxzo2lXhWJE`. Timestamp UNKNOWN. Tavily / Open Router / GPT on-tape.

## B. Atomic Knowledge

### Fixed niche query, then plan
- **Claim:** Research query is a stable niche string, not a new prompt every morning; then an agent turns three articles into title + topics.
- **Reasoning:** Repeatable newsletter = same query, new articles.
- **Mechanism:** Tavily query → 3 URL summaries → planner agent + system message.
- **Evidence:** "this is going to stay the same every single time this workflow goes off" / "three different URLs"
- **Conditions:** A niche exists
- **Exceptions:** None on tape
- **Action:** File fixed-query + planner; park Tavily/Open Router
- **Confidence:** high as demo
- **Source:** `0Ujdys4LqNs` @ UNKNOWN
- **Epistemic:** SOURCE

### Pin so you do not rerun
- **Claim:** He pins the agent output so a later fail does not rerun the planner.
- **Reasoning:** Research/plan calls are treated as expensive or unstable.
- **Mechanism:** n8n pin on the planner output.
- **Evidence:** "I'm also going to pin this data so we don't have to rerun our agent if something goes wrong."
- **Conditions:** Building live
- **Exceptions:** None
- **Action:** File pin-as-checkpoint
- **Confidence:** high
- **Source:** `0Ujdys4LqNs` @ UNKNOWN
- **Epistemic:** SOURCE

## C. Mental Models
Research before writing. Three sources is enough to plan. System message names the job (planner, not writer). Pin is a keep-gate against reroll.

## D. Procedures
1. After trigger, research with a fixed niche query.
2. Take three URL summaries.
3. Attach a cheap chat model; system: planner, three articles, title + topics.
4. Pin the plan.
Avoid: auto-send newsletter. Signals: three URLs; fields separable; pin on.

## E. Examples
**SMB AI adoption:** Situation — newsletter niche. Action — Tavily query stays "AI adoption for small businesses" → 3 URLs → planner agent → pin. Reasoning — same query every run. Outcome — title/topics in fields. Lesson — fixed query + pin; send not on this short.

## F. Decision Rules
- If the query changes every run → not this machine.
- If you rerun the planner after a later fail → you ignored the pin lesson.
- Refuse: Tavily/Open Router as hive; auto-send; SMB-AI as `icp_id`.

## G. Contrarian
Against a new research prompt every morning. Against writing the newsletter before a plan exists (on this short).

## H. Assumptions
Theirs: three summaries are "the past week" (not proven). Ours: teaser of `pxzo2lXhWJE`. Falsifier: long tape that sends. GPT/Open Router on-tape only.

## I. Questions
What are the later agents? Does the long send? Same as `rXpHzWXjHrw` text-to-workflow newsletter?

## J. Connections
SYSTEM SYNTHESIS → `pxzo2lXhWJE`; `rXpHzWXjHrw`; `send-removed`; stack Cursor+Grok (Open Router on-tape).

## K. Future-Use
Fixed-query + pin-checkpoint as atoms. Unassigned: hive newsletters parked.

## Steal / Operate-never

### Machine: fixed-niche research → plan → pin
- **Epistemic:** SOURCE
- **Workflow / loop:** trigger → fixed niche query → N source summaries → planner system message (title+topics) → pin → checkable stop = pinned fields exist, no send
- **Questions / signals:** Does the query stay the same? Is the plan pinned?
- **Qualify / frame / objections:** "Automate newsletters" is the hook; this clip stops at plan
- **Procedure:** three articles, expert newsletter planner
- **Example that proves it:** "AI adoption for small businesses" → 3 URLs → title/topics → pin
- **Why it works:** stable query + checkpoint
- **Conditions / exceptions:** Tavily/Open Router on-tape
- **Operate-never payload:** auto-send; Tavily as hive; SMB-AI hunt
- **Hive run:** `send-removed` · `channel-walk`
- **Source:** `0Ujdys4LqNs` @ UNKNOWN

### Operate-never
- Auto-send newsletter. Tavily / Open Router / GPT as hive. New `icp_id`.
- Merge `LESSONS-FROM-TAPE.md`. Send / pay / deploy / book / publish.

## L. Role-Specific Applications
File fixed-query and pin. Do not invent the send step. Point to the long without flattening.
