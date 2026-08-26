# Day Planner — 0Ujdys4LqNs
Status: filled
Protocol: deep-video-learning
**Source:** `docs/hive/outer-heaven/CONTENT/watch-later/packets/0Ujdys4LqNs/full.txt`
**Packet LEARNED:** `docs/hive/outer-heaven/CONTENT/watch-later/packets/0Ujdys4LqNs/LEARNED.md`
**ICP:** parked unless Evens named one.

## A. Source Map
Short teaser: multi-agent newsletter live. Beats: after trigger, first step = research via Tavily; query is a fixed niche (“AI adoption for small businesses”) that stays the same every run; returns three URLs + summaries; then an AI agent + OpenRouter “GBT 5 mini”; system message = expert newsletter planner, three articles from the past week → creative title + main topics; run; fields become drag-able; **pin the data** so a later fail does not rerun the agent. CTA to full (`pxzo2lXhWJE`). Timestamp UNKNOWN. Vendors: Tavily, OpenRouter — on-tape.

## B. Atomic Knowledge
### Fixed niche query, three sources, then plan
- **Claim:** Research query is a stable niche string; each run gets three URLs; an agent turns them into title + topics.
- **Reasoning:** The niche does not get rewritten every morning.
- **Mechanism:** Trigger → Tavily (fixed query) → planner agent (system message).
- **Evidence:** “this is going to stay the same every single time this workflow goes off.”
- **Conditions:** A niche exists.
- **Exceptions:** A breaking-news letter might need a new query — not on this short.
- **Action:** Steal fixed-query + three sources. Do not auto-send the letter.
- **Confidence:** high as the path.
- **Source:** `0Ujdys4LqNs` @ UNKNOWN
- **Epistemic:** SOURCE

### Pin so a later fail does not rerun the expensive step
- **Claim:** He pins the planner output so he does not rerun the agent if something downstream goes wrong.
- **Reasoning:** Tokens and time.
- **Mechanism:** Run once → pin.
- **Evidence:** “pin this data so we don’t have to rerun our agent if something goes wrong.”
- **Conditions:** Downstream is still being built.
- **Exceptions:** Stale pin on a live daily send would be wrong — we will not send.
- **Action:** Pin/cache during build. CUT on rerun-loops.
- **Confidence:** high.
- **Source:** `0Ujdys4LqNs` @ UNKNOWN
- **Epistemic:** SOURCE

## C. Mental Models
Research before writing. Three is enough to plan. He uses OpenRouter + a small model for the planner. Priority: show the first two stages, then CTA. Uncertainty: we do not see write/send on this short.

## D. Procedures
1. Write the niche string once.
2. Fetch three sources.
3. Planner: title + topics only.
4. Pin while building.
5. Human writes/sends later — not this desk.
Avoid: Tavily/OpenRouter as required SKUs; daily auto-send.

## E. Examples
**Small-business AI adoption:** Situation → newsletter trigger. Action → fixed Tavily query → three URLs → planner system message → pin. Reasoning → research then plan; don’t rerun. Outcome → title/topics in fields. Lesson → steal pin + three sources; never the send.

## F. Decision Rules
- If the query changes every run without a reason → fail (not his machine).
- If we are about to send the letter → HITL / never from this desk.
- If a downstream fail would rerun research → pin first.

## G. Contrarian
Rejects “just have the LLM write the newsletter from memory.” He forces fresh three-URL research. Also rejects rerunning the planner on every downstream hiccup.

## H. Assumptions
Theirs: Tavily’s three URLs are good enough. Ours: vendors on-tape; send-never. Falsifier: three off-niche links. Survivorship: one happy plan.

## I. Questions
What happens after topics (write? design? send?)? Full `pxzo2lXhWJE`? Who is the audience?

## J. Connections
- SYSTEM SYNTHESIS → `pxzo2lXhWJE` · `send-removed` · `coverage-loop` (don’t rerun the expensive step).

## K. Future-Use
Pin-during-build as a weekday CUT against rerun loops. Unassigned newsletter SKU.

## Steal / Operate-never

### Machine: fixed niche → three sources → plan → pin; send stays HITL
- **Epistemic:** SOURCE
- **Workflow / loop:** trigger → fixed research query → three URLs → title/topics → pin → Evens writes/sends
- **Questions / signals:** Is the niche stable? Did we pin? Are we about to send?
- **Qualify / frame / objections:** Memory-write is the fail. Rerun-on-every-fail is the fail.
- **Procedure:** Plan only. No Tavily/OpenRouter install required. No send.
- **Example that proves it:** Situation → SB AI-adoption letter. Action → Tavily three + planner + pin. Reasoning → research then plan. Outcome → fields ready. Lesson → steal pin; never send.
- **Why it works:** A pinned plan is a checkable stop; a send cron is not.
- **Conditions / exceptions:** Teaser; long tape owns the rest. Clients parked.
- **Operate-never payload:** Auto-send newsletter; Tavily/OpenRouter as hive SKUs; n8n-cloud.
- **Hive run (existing skills only):** `send-removed` · `coverage-loop`.
- **Source:** `0Ujdys4LqNs` @ UNKNOWN

### Operate-never
- Auto-send the newsletter.
- Install Tavily / OpenRouter / switch stack as a duty.
- Send / pay / deploy / book / publish.

## L. Role-Specific Applications
**One next:** `coverage-loop` score this packet as pin-during-build (no send). Clients parked.
