# LEARNED — 0Ujdys4LqNs
Protocol: deep-video-learning
Status: filled
**Source:** `docs/hive/outer-heaven/CONTENT/watch-later/packets/0Ujdys4LqNs/full.txt`
**Desks merged:** Researcher 2026-08-14. Librarian not yet. Keep later dissent as labeled rows. Do not flatten.
**ICP:** parked. Tape $ UNVERIFIED. No new `icp_id`.
**Note:** Derived from Researcher A–K + Steal after a full `full.txt` walk. Other desks add labeled rows; do not overwrite dissent.

## A. Source Map
Newsletter-system short (live build fragment). Beats: (1) After trigger: research via Tavily. (2) Query = broad niche; example “AI adoption for small businesses”; stays the same every run. (3) Returns three URLs + summarized content. (4) AI agent (OpenRouter → “GBT 5 mini” on-tape) reads the three articles. (5) System message: expert newsletter planner; three articles from the past week; creative/fun title + main topics. (6) Output fields can be dragged; he **pins** the data so a later failure does not rerun the agent. (7) Play-button to full. Timestamp UNKNOWN. Long: `pxzo2lXhWJE`. Tavily / GPT / OpenRouter on-tape only.

## B. Atomic Knowledge

### Fixed-niche research then plan
- **Claim:** Recurring newsletter research uses a stable niche query, not a new topic each time.
- **Reasoning:** Same workflow fire; same category; fresh URLs.
- **Mechanism:** Trigger → Tavily (3 URLs + summaries) → planner agent → title + topics.
- **Evidence:** “this is going to stay the same every single time this workflow goes off.”
- **Conditions:** A niche you want every issue.
- **Exceptions:** A rotating theme would need a changing query (not shown).
- **Action:** Separate “stable query” from “fresh results.”
- **Confidence:** high.
- **Source:** `0Ujdys4LqNs` @ UNKNOWN
- **Epistemic:** SOURCE

### Pin so you don’t rerun the expensive step
- **Claim:** Pin agent output so a downstream failure does not recall the model.
- **Reasoning:** “if something goes wrong.”
- **Mechanism:** n8n pin on the planner output.
- **Evidence:** Explicit pin step.
- **Conditions:** Iterating on later nodes.
- **Exceptions:** Pinning stale research when you meant to refresh (INFERENCE).
- **Action:** Pin after a good research/plan when debugging below.
- **Confidence:** high as a build habit.
- **Source:** `0Ujdys4LqNs` @ UNKNOWN
- **Epistemic:** SOURCE

## C. Mental Models
Newsletter = research packet + planner, not a full writer in this clip. Three sources is enough to plan. Cheap/small model is fine for planning (he picks mini). Pin is a cost/time control.

## D. Procedures
1. Fix the niche query.
2. Research tool → three summarized URLs.
3. Planner system prompt: title + topics from those three, “past week.”
4. Pin the plan before touching later nodes.

## E. Examples
- **Situation:** AI-adoption-for-SMB newsletter. **Action:** Tavily with that exact query → planner on three articles → pin. **Reasoning:** Stable niche, fresh links. **Outcome:** Title/topics in fields. **Lesson:** The short stops at the plan. Implicit rule: do not rerun research while debugging.

## F. Decision Rules
- If the issue is recurring → freeze the query.
- If debugging downstream → pin.
- Refuse: auto-sending the newsletter; quoting three URLs as a quality FACT.

## G. Contrarian
Does not “let the agent pick the niche” each morning. The human chose the category once.

## H. Assumptions
Tavily returns useful week-ish articles. Three is enough. “Past week” in the prompt may not be enforced by the search tool (possible mismatch — store it).
**Desk dissent:** none yet.

## I. Questions
- Does Tavily filter to the past week or only the prompt says that?
- What writes the actual newsletter? (long tape)

## J. Connections
- **SYSTEM SYNTHESIS:** `pxzo2lXhWJE` long. `coverage-loop` (research then plan). Do not new-ICP a newsletter product.

## K. Future-Use
Pin-after-good-step as an unassigned debug habit (Cursor analog: don’t re-walk a tape while editing L).

## Stolen machines

### Machine: stable-query-three-sources-pin-the-plan
- **Epistemic:** SOURCE
- **Workflow / loop:** trigger → fixed niche search → 3 summaries → planner (title+topics) → pin → stop (no send)
- **Questions / signals:** Is the query supposed to change? Are we about to rerun research to fix a later node?
- **Qualify / frame / objections:** “Let the agent pick topics from the whole web” → he locked the niche.
- **Procedure:** D.
- **Example that proves it:** SMB AI adoption; three URLs; planner; pin.
- **Why it works:** Stable category + fresh evidence + cheap plan + no rerun tax.
- **Conditions / exceptions:** Week filter may be prompt-only. Vendors on-tape.
- **Operate-never payload:** Tavily/OpenRouter as hive default; auto-send newsletter; SMB ICP.
- **Hive run:** `coverage-loop` · `ask-principal` on send
- **Source:** `0Ujdys4LqNs` @ UNKNOWN

**Operate-never**
- Auto-send. New `icp_id`. Quote “three URLs” as FACT. Send / pay / deploy / book / publish.

## THINK / BEHAVE / TRICKS / USE
**Added:** 2026-08-14 last-mile. Caption-only. Visual/click UNKNOWN unless `watch.json`. Do not flatten this speaker into a hive personality.

### THINK
Decision order, what they ask before they build, what they ignore, how they choose tools, when they kill vs continue — see §C Mental Models and §F Decision Rules above. Desk that must think this way: see TAPE-WIRE-NOTES.

### BEHAVE
What they repeatedly check, skip, retry, and speech≠behavior — see §A / §E / speech≠behavior rows. Sequence-from-speech only. `multimodal-youtube-learning`: no invented clicks.

### TRICKS
Do / don’t and implicit shortcuts — see §D Procedures and Stolen machines. Shown system (files, loops, UI, offer, CTA) mapped to Cursor+Grok primitives on the named workflow. Caption-only = transcript-implied / unobserved.

### USE
Each trick lands as a desk **action** on Cursor + Grok Bot (not a quote). Operate-never on their vendors. Reproduce card: `job-cards/takes/_knowledge-use/{{slug}}.md`.
