# Big Boss — 0Ujdys4LqNs
Status: filled
Protocol: deep-video-learning
**Source:** `docs/hive/outer-heaven/CONTENT/watch-later/packets/0Ujdys4LqNs/full.txt`
**Packet LEARNED:** `docs/hive/outer-heaven/CONTENT/watch-later/packets/0Ujdys4LqNs/LEARNED.md`
**ICP:** parked unless Evens named one.

## A. Source Map

Short (PACKET: 1:40, 398 words, captions `en-orig`). Timestamp UNKNOWN on `full.txt` (no VTT in the take). Visual-only gaps: the Tavily result cards, the three URL summaries, the agent field layout after run, and the pin-data UI are described, not seen.

Beats, in order:

1. Claim: “Watch me build this AI system to automate newsletters.”
2. After the trigger, first job is research. He adds a Tavily step (on-tape name: “Tavi”).
3. Query is a **fixed** niche string, not a new search each run. His example: “AI adoption for small businesses.”
4. Tavily returns **three** URLs with summarized content. He calls that “initial research.”
5. Next: an AI agent turns those three articles into titles and topics.
6. Config: attach a chat model via OpenRouter; he picks “GBT 5 mini” (on-tape).
7. System message: “expert newsletter planner.” Input = three articles from the past week. Output = a creative/fun title **and** main topics.
8. He hits play on the agent. Outputs land in separate fields he can drag.
9. He **pins** the agent output so a later failure does not force a rerun.
10. CTA: play-button to the “full breakdown.” Short ends before send, schedule, or a written issue.

Off-topic / not skipped: OpenRouter as the model router; “GBT 5 mini” as the cheap brain; pin-as-save; Tavily as the research vendor; the niche string is his, not a client brief.

## B. Atomic Knowledge

### Research is a fixed query, not a fresh brief
- **Claim:** The newsletter niche string stays the same every time the workflow fires.
- **Reasoning:** Recurring research on one category is the product. A new prompt each run would be a different machine.
- **Mechanism:** Tavily node; query field = “broad category or niche”; three URL summaries come back.
- **Evidence:** He types “AI adoption for small businesses” and says it “will stay the same every single time.”
- **Conditions:** Works when the operator already owns a niche. Does not invent the niche on the fly.
- **Exceptions:** Tape does not show what happens if Tavily returns junk or fewer than three URLs.
- **Action:** Definition of done for research = three named sources on a locked query, not “the agent researched.”
- **Confidence:** high for the demo shape
- **Source:** `0Ujdys4LqNs` @ UNKNOWN — “this is going to stay the same every single time this workflow goes off”
- **Epistemic:** SOURCE

### Planner agent reads three articles, writes title + topics
- **Claim:** A second step (AI agent + system message) turns research into a newsletter plan, not a finished letter.
- **Reasoning:** Research ≠ writing. He splits “find sources” from “name the issue.”
- **Mechanism:** Agent + OpenRouter chat model + system message (“expert newsletter planner”).
- **Evidence:** Play returns title/topics in separate fields he can drag.
- **Conditions:** Agent sees the three articles. System message names the job and the time window (“past week”).
- **Exceptions:** Body copy, send, and schedule are not on this short.
- **Action:** Checkable stop is a titled plan with topics — not a sent newsletter.
- **Confidence:** high
- **Source:** `0Ujdys4LqNs` @ UNKNOWN — “come up with a creative and fun title as well as the main topics”
- **Epistemic:** SOURCE

### Pin intermediate output so a later fail is cheap
- **Claim:** He pins the agent data so he does not rerun the agent if something downstream goes wrong.
- **Reasoning:** Tokens and time are wasted if every debug re-asks the planner.
- **Mechanism:** n8n pin on the agent output (visual-only; he narrates it).
- **Evidence:** “I’m also going to pin this data so we don’t have to rerun our agent if something goes wrong.”
- **Conditions:** Useful when the next nodes are still being wired. Less useful once the run is trusted.
- **Exceptions:** Pin can freeze a bad plan; tape does not show an unpin/re-run rule.
- **Action:** Pin is a debug stop, not a ship artifact. Review the pinned plan before anything sends.
- **Confidence:** high that he pinned; medium that pin is always correct
- **Source:** `0Ujdys4LqNs` @ UNKNOWN — “pin this data so we don’t have to rerun our agent”
- **Epistemic:** SOURCE

### Short is a magnet for the long
- **Claim:** The short withholds the rest of the build. CTA is the full breakdown.
- **Reasoning:** Trigger → research → plan is enough to look like a system; send/schedule stay off-screen.
- **Mechanism:** Play-button end card.
- **Evidence:** Last spoken lines.
- **Conditions:** Only works if a long exists. PACKET does not bind a sibling id.
- **Exceptions:** Viewer who wanted a sendable newsletter leaves empty.
- **Action:** Do not treat the short as a build spec. Do not invent a sibling id.
- **Confidence:** high for CTA; none for a named long
- **Source:** `0Ujdys4LqNs` @ UNKNOWN — “watch that full breakdown… click on that play button”
- **Epistemic:** SOURCE

### Cheap brain for the planner job
- **Claim:** He routes the planner through OpenRouter to a mini model, not a flagship.
- **Reasoning:** Title + topics from three summaries is grunt work. **INFERENCE** on “why mini”; **SOURCE** that he picked it.
- **Mechanism:** OpenRouter → “GBT 5 mini.”
- **Evidence:** He names the model after “like we talked about” (prior context not on this short).
- **Conditions:** Job is structured extraction/planning, not a client-facing letter.
- **Exceptions:** Tape does not compare mini vs a larger model.
- **Action:** Cheap model for plan; expensive brain stays off this slice.
- **Confidence:** high he used mini; medium that mini is enough
- **Source:** `0Ujdys4LqNs` @ UNKNOWN — “open router… GBT 5 mini”
- **Epistemic:** SOURCE (pick) / INFERENCE (cheap-brain doctrine)

## C. Mental Models

- **Trigger first, then research.** The workflow does not start with writing. **SOURCE**
- **Niche is a constant.** The query is an asset, not a chat. **SOURCE**
- **Three sources are enough to plan.** He does not ask for ten. **SOURCE**
- **Plan ≠ issue.** Title and topics are the agent’s job; the letter is later. **INFERENCE**
- **Pin is how you debug without paying twice.** **SOURCE**
- **“Automate newsletters” is the magnet, not done.** Send is missing. **INFERENCE**
- **Vendor names are the demo OS.** Tavily / OpenRouter / n8n stay on tape. **SYSTEM SYNTHESIS**

## D. Procedures

1. **Lock the niche:** write one category string that will not change per run.
2. **Trigger:** something fires the workflow (named, not shown).
3. **Research:** run the fixed query; require N sources (here, three URL summaries).
4. **Checkable stop:** three sources exist. If not, stop — do not invent topics.
5. **Plan:** a named planner job reads those sources; returns title + topics in fields.
6. **Pin:** freeze the plan while you wire the next nodes.
7. **Review the plan** before any write/send (not shown; required if this ever ships).
8. **CTA / stop:** if this is a short, do not build the missing send path from the short.

**Qualify / frame:** this is a content-ops demo on a creator niche, not a client SKU. “Small business AI adoption” is his example query, not an ICP.
**Objections:** “It’s automated” — answer with: no send, no schedule, no issue body on tape.
**Avoid:** treating Tavily / OpenRouter / n8n as the hive stack. On-tape tools stay on tape.
**When to change:** if the niche string is still mushy, do not add a research node. If the plan is unpinned and you are still debugging, you will rerun for no reason.

## E. Examples

**Situation:** Trigger fired; he needs research before writing.  
**Action:** Adds Tavily; types a locked niche; accepts three URL summaries.  
**Reasoning:** Recurring newsletter needs a stable query, not a new brief.  
**Outcome:** “Initial research” = three summarized URLs.  
**Lesson:** Research done = N named sources on a fixed query. Implicit rule: do not plan from zero sources.

**Situation:** Three articles are in; he wants a title and topics.  
**Action:** AI agent + system message (“expert newsletter planner”) + mini model via OpenRouter; play; fields appear.  
**Reasoning:** Planning is a different job than search.  
**Outcome:** Title/topics in dragable fields.  
**Lesson:** Split find vs name. Implicit rule: the planner does not send.

**Situation:** Downstream wiring might fail.  
**Action:** Pins the agent output.  
**Reasoning:** Rerunning the planner is waste.  
**Outcome:** Later debug can reuse the plan.  
**Lesson:** Pin is a checkable debug stop. Implicit rule: a pinned bad plan is still a bad plan — review before ship.

## F. Decision Rules

- If the niche is not locked → do not add research.
- If research returns fewer than the required N → stop; do not hallucinate topics.
- If the job is title/topics → cheap planner model; do not jump to a full letter.
- If you are still wiring → pin the last good plan.
- If the short is a magnet → do not build send from the short.
- Optimize: speed of “fixed query → three sources → titled plan → pin.”
- Refuse (on this desk): auto-send the newsletter; install Tavily/OpenRouter/n8n as hive OS; treat “automate newsletters” as done.

## G. Contrarian

- Against “ask the model what to write about”: the niche is a constant he typed once.
- Against “one agent does research and the letter”: he splits Tavily from the planner.
- Against “rerun everything when a node fails”: he pins.
- Field assumes the short is the system. He treats the short as an ad for the long.

## H. Assumptions

**His:** Tavily three-URL research is enough; a mini model can plan; pin is safe; “automate newsletters” is the right CTA; OpenRouter is the model door.

**Ours:** Captions are complete enough (398 words). Visual quality of the three summaries and the field layout is **UNVERIFIED**. No $ on tape. Domain-specific: creator newsletter ops, not a plumber book-flow.

**Falsifiers:** Locked query goes stale and the plan repeats. Pin freezes a bad title and it ships. Three summaries are SEO junk. Long does not match the short.

**Disagreement (keep labeled):** Hive will not operate a Tavily/n8n newsletter army. The **fixed-query → N sources → plan → pin** machine is still stolen. **SYSTEM SYNTHESIS**

## I. Questions

- What is the actual trigger (schedule, form, manual)? Not on this short.
- Who writes the body, and who sends? Not on tape.
- What if Tavily returns three weak URLs — rewrite, accept, or stop?
- Is “three” a Tavily default or his choice?
- Sibling long: PACKET does not bind an id. Do not invent one.
- Cost per run (Tavily + mini planner) — not on tape.

## J. Connections

- **SYSTEM SYNTHESIS** → `golden-test-loop`: pin is a cheap keep; do not rerun the expensive step to debug the cheap one.
- **SYSTEM SYNTHESIS** → `slice-build`: one slice is research→plan, not “automate newsletters.”
- **SYSTEM SYNTHESIS** → `one-channel-deep` / `clip-factory`: titled plan is a package; human ships.
- **SYSTEM SYNTHESIS** → `ask-principal`: send/publish stay HITL.
- **SYSTEM SYNTHESIS** → `wiki-ingest` / `context-docs`: three sources into a named plan is closer to our ingest than to a new vendor.
- Do not force a Path A client out of “AI adoption for small businesses.”

## K. Future-Use

- Pin-as-debug as a Forge/Watchdog habit (unassigned).
- Locked niche string as a catalog field, not a chat (unassigned).
- Planner-vs-writer split as an `agent-job-card` pair (unassigned).
- Short-as-magnet for Publishing Engine (learn only; no publish).
- “Past week” window as a freshness rule for research (unassigned).

## Steal / Operate-never

### Machine: Locked niche → N sources → titled plan → pin before more wiring
- **Epistemic:** SOURCE (demo) / SYSTEM SYNTHESIS (hive mapping)
- **Workflow / loop:** trigger → fixed-query research → checkable stop (N URL summaries) → planner agent (title + topics) → pin plan → human reviews → human ships (HITL). No send on this tape.
- **Questions / signals:** “What niche never changes?” “Do we have N sources?” “Is this a plan or a letter?” “Are we still debugging (pin)?”
- **Qualify / frame / objections:** Content-ops demo, not a client SKU. “Automate newsletters” is the magnet, not done. Objection: it’s already writing — answer with: title/topics only; send missing.
- **Procedure:** D steps 1–7. Checkable stops: (1) locked niche string, (2) N sources, (3) titled plan in fields, (4) pin while wiring, (5) no send without Evens.
- **Example that proves it:** “AI adoption for small businesses” stays constant → three Tavily summaries → planner returns title/topics → he pins so a later fail does not rerun the agent. Lesson: lock the query; split find vs name; pin the plan.
- **Why it works:** Recurring research needs a constant. Planning is cheaper than rewriting search. Pin makes debug cheap. Conditions: one operator, a real niche, a pick/review before send. Exceptions: no junk-URL loop on tape; body/send withheld; pin can freeze a miss.
- **Conditions / exceptions:** Cursor + Grok only (Tavily / OpenRouter / n8n / “GBT 5 mini” stay on tape). No auto-send. Clients parked. His niche is a prop, not an ICP.
- **Operate-never payload:** Auto-send newsletter; install his research/model stack; “automate newsletters” as done; new hunt on “small business AI.”
- **Hive run (existing skills only):** `slice-build` (one plan slice) · `golden-test-loop` (keep the pinned plan only if a cheap check passes) · `one-channel-deep` (human ships) · `ask-principal` (send/publish) · `agent-job-card` (researcher vs planner owns/never) · `wiki-ingest` (sources → named artifact).
- **Source:** `0Ujdys4LqNs` @ UNKNOWN

**Operate-never (this desk will not operate — still walked the tape):**

- Auto-send / auto-publish a newsletter
- Tavily + OpenRouter + n8n as hive OS
- Install Claude / Codex / ChatGPT / Gemini / Coda / Vapi / Abacus / Skool
- Quote any implied $ as FACT (none spoken; still do not invent)
- New `icp_id` / unpark Normand / “newsletter army” hunt
- Grok Bot `sendPrompt` · send / pay / deploy / book / publish
- Merge `LESSONS-FROM-TAPE.md` · write packet `LEARNED.md` (Researcher owns that)

## L. Role-Specific Applications

I manage; I do not chat a newsletter into existence.

- **Done** on this slice: locked niche + three sources + titled plan + pin. A sent issue is not done and is not on tape.
- **Delegate without being asked:** Researcher owns the fixed query and the three-source stop. Publishing Engine packages title/topics and does not ship. Watchdog treats an unpinned rerun as waste. Forge fails the slice if send is wired.
- **Skeptical review:** “Automate newsletters” is the short’s job, not ours. I will not approve a nameless research-and-write farm because Tavily returned three cards.
- **One system this take:** research → plan → pin. Not “do the whole newsletter.”
- Live hunt stays parked. I do not rotate to creator-newsletters because a mini model named a title.
