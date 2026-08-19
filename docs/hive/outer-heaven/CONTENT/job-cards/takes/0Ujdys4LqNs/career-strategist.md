# Career Strategist — 0Ujdys4LqNs
Status: filled
Protocol: deep-video-learning
**Source:** `docs/hive/outer-heaven/CONTENT/watch-later/packets/0Ujdys4LqNs/full.txt`
**Packet LEARNED:** `docs/hive/outer-heaven/CONTENT/watch-later/packets/0Ujdys4LqNs/LEARNED.md`
**ICP:** parked unless Evens named one.

## A. Source Map
Short (1:40, 398 words). Live newsletter build. Beats: (1) after trigger, first step is research (2) Tavily node; query = broad niche — he uses “AI adoption for small businesses”; query stays the same every run (3) returns three URLs with summarized content (4) AI agent next: OpenRouter → GPT-5 mini (on-tape vendor) (5) system message: expert newsletter planner; receive three articles from the past week; creative fun title + main topics (6) execute; fields come back drag-able (7) **pin the data** so a later failure does not rerun the agent (8) CTA to full. Visual: n8n canvas.

## B. Atomic Knowledge

### Fixed query, fresh articles
- **Claim:** The research query is a stable niche string; each run should still return current articles.
- **Reasoning:** Newsletter topic is a lane, not a one-off prompt.
- **Mechanism:** Tavily search → three URLs + summaries.
- **Evidence:** “this is going to stay the same every single time this workflow goes off.” @ UNKNOWN
- **Conditions:** Niche is known.
- **Exceptions:** Breaking-news lanes may need a changing query (not discussed).
- **Action:** Write the lane once; do not re-prompt the niche every morning.
- **Confidence:** high as his build.
- **Source:** `0Ujdys4LqNs` @ UNKNOWN
- **Epistemic:** SOURCE

### Pin so a later break does not bill the planner again
- **Claim:** He pins the agent output so he does not rerun if something downstream fails.
- **Reasoning:** Downstream edits should not re-spend the planner.
- **Mechanism:** pin data on the node.
- **Evidence:** “I’m also going to pin this data so we don’t have to rerun our agent if something goes wrong.” @ UNKNOWN
- **Conditions:** You are still building.
- **Exceptions:** Production runs should not serve stale pins (INFERENCE).
- **Action:** Pin while assembling; unpin for live.
- **Confidence:** high as builder hygiene.
- **Source:** `0Ujdys4LqNs` @ UNKNOWN
- **Epistemic:** SOURCE

## C. Mental Models
Research before writing. Planner agent ≠ writer agent (he only builds planner here). Three sources are enough to title. Tokens are conserved with pins.

## D. Procedures
Trigger → Tavily (fixed niche) → planner agent (title + topics) → pin.  
System prompt job: title + main topics from three past-week articles.  
Avoid: rerunning the planner while debugging later nodes.

## E. Examples
**Situation:** Niche = small-business AI adoption.  
**Action:** Three URLs in; planner out; pin.  
**Reasoning:** Same lane every morning.  
**Outcome:** Fields ready; full write not on this short.  
**Lesson:** Separate research, plan, and (later) write. Implicit rule: pin is a build tool.

## F. Decision Rules
- If the niche is stable, freeze the query.
- If downstream is broken, do not rerun the expensive step.
- Do not auto-send the newsletter.

## G. Contrarian
Rejects blank-page newsletter writing. Also rejects re-paying the model on every canvas twitch.

## H. Assumptions
**Theirs:** Tavily + GPT-5 mini + OpenRouter. **Ours:** vendors on-tape; hive Cursor+Grok; auto-send never. Three URLs may be thin. Falsifier: stale or off-niche articles.

## I. Questions
- Who sends the newsletter in the long? (see `pxzo2lXhWJE`.)
- How does he de-dupe stories week to week?

## J. Connections
- SYSTEM SYNTHESIS → `pxzo2lXhWJE` (multi-agent newsletter long).
- SYSTEM SYNTHESIS → `rXpHzWXjHrw` (text-to-workflow newsletter).
- SYSTEM SYNTHESIS → `6cEQEba0i2A` family (save tokens).

## K. Future-Use
Unassigned: pin-while-building as a desk habit for any expensive step.

## Steal / Operate-never

### Machine: fixed-lane research → plan → pin; human publish
- **Epistemic:** SOURCE + SYSTEM SYNTHESIS
- **Workflow / loop:** lock niche query → pull 3 sources → plan title/topics → pin while building → Evens publishes
- **Questions / signals:** Is the query the lane or a one-off? Are we about to rerun a pinned step for no reason?
- **Qualify / frame / objections:** A plan is not a sent issue.
- **Procedure:** Planner prompt as in D. No Gmail send in the operated loop.
- **Example that proves it:** Small-business AI adoption planner (E).
- **Why it works:** Stable lane + fresh sources + cheap retries (B/C).
- **Conditions / exceptions:** Pin is for build. Live needs a fresh run on a schedule.
- **Operate-never payload:** Auto-send newsletter; OpenRouter/GPT as hive must; quit-job.
- **Hive run:** `ask-principal` (publish) · `slice-build` · `info-gain-cite`
- **Source:** `0Ujdys4LqNs` @ UNKNOWN

### Operate-never
- Auto-publish/send the newsletter.
- Install OpenRouter/GPT as stack. Quote model names as accomplishments.
- Employment send, quit-job, unpark clients.
- Merge LESSONS. Auto-write `SKILL.md`.

## L. Role-Specific Applications
Employment still covers baseline. Career analog: a weekly “what I shipped” brief is research → plan → Evens publish, not an auto-post. Pin the vault facts while you draft the gym card. Clients parked.
