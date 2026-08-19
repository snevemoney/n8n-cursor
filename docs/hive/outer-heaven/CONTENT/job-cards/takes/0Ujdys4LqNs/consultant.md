# Consultant — 0Ujdys4LqNs
Status: filled
Protocol: deep-video-learning
**Source:** `docs/hive/outer-heaven/CONTENT/watch-later/packets/0Ujdys4LqNs/full.txt`
**Packet LEARNED:** `docs/hive/outer-heaven/CONTENT/watch-later/packets/0Ujdys4LqNs/LEARNED.md`
**ICP:** parked unless Evens named one.

## A. Source Map

Newsletter-system teaser. Beats: after trigger, research with Tavily; query is a stable niche (“AI adoption for small businesses”) that stays the same every run → three URLs + summarized content. Next: AI agent as newsletter planner; attach OpenRouter GPT-5-mini; system message: expert planner, three articles from the past week, creative title + main topics. Run → fields you can drag; pin the data so you do not rerun if something later fails. CTA to the long (`pxzo2lXhWJE`). No VTT. UNKNOWN. ~398 words.

## B. Atomic Knowledge

### Stable research query, new articles each run
- **Claim:** The Tavily query is the newsletter’s niche and does not change when the cron fires; the URLs do.
- **Reasoning:** A fixed beat + fresh sources is how a recurring newsletter stays on-topic.
- **Mechanism:** Trigger → Tavily(query=niche) → three URLs + summaries.
- **Evidence:** “this is going to stay the same every single time this workflow goes off.”
- **Conditions:** You have a niche sentence. Research tool returns three.
- **Exceptions:** Three URLs can be junk or off-niche. “Past week” is in the planner prompt, not proven in Tavily settings on this short.
- **Action:** Write the niche as a toddler sentence. Do not re-prompt the niche every morning.
- **Confidence:** high
- **Source:** `0Ujdys4LqNs` @ UNKNOWN — “AI adoption for small businesses… stay the same every single time”
- **Epistemic:** SOURCE
### Planner agent, then pin
- **Claim:** A planner agent turns three articles into a title + topics; he pins the output so later failures do not burn another research/plan call.
- **Reasoning:** Pin is a builder’s checkable stop: freeze a good intermediate.
- **Mechanism:** Attach model → system message (role + job + inputs) → run → pin.
- **Evidence:** “I'm also going to pin this data so we don't have to rerun our agent if something goes wrong.”
- **Conditions:** Building/debugging. OpenRouter GPT-5-mini on tape.
- **Exceptions:** Pinning stale news into production would be a different bug.
- **Action:** Steal pin-while-building. Do not pin last week in prod.
- **Confidence:** high
- **Source:** `0Ujdys4LqNs` @ UNKNOWN — “pin this data so we don't have to rerun”
- **Epistemic:** SOURCE


## C. Mental Models

He builds in public from a wireframe (research then titles). He likes structured fields he can drag. He treats the planner as a specialist (“expert newsletter planner”), not a do-everything agent. He is happy to use OpenRouter/GPT on tape. The long is the rest of the multi-agent system.

## D. Procedures

1. Write a niche that can stay fixed. 2. Research N sources. 3. Planner: title + topics only. 4. Pin while assembling downstream. 5. Human still ships the newsletter. Avoid: auto-send the issue. Avoid: changing the niche every run without a reason.

## E. Examples

**Situation:** Recurring newsletter on SMB AI adoption. **Action:** Tavily three URLs → planner agent for title/topics → pin. **Outcome:** Fields populated; teaser stops. **Lesson:** Split research from planning. Implicit rule: pin intermediates while building.

## F. Decision Rules

If the niche sentence is vague, the three URLs will wander. If you skip pin while debugging, you will pay to re-research. If the next node sends Gmail, that is HITL.

## G. Contrarian

Field default: one agent does research + write + send. He splits research and plan. Field default: rerun everything on each debug. He pins.

## H. Assumptions

GPT/OpenRouter/Tavily on-tape. Three sources is thin. No send on this short. Niche example is not a hive SKU.

## I. Questions

How does the long add writers/editors? Who quality-checks the three URLs? What is the trigger (cron vs button)?

## J. Connections

**SYSTEM SYNTHESIS:** Long `pxzo2lXhWJE`. Maps to `clip-factory` / wiki-ingest (sources → structured plan) + `warm-draft-hitl`. Not a new ICP for SMB AI newsletters.

## K. Future-Use

Unassigned: pin-while-building as a session-bootstrap habit; fixed-niche-sentence as a four-blank for recurring content.

## Steal / Operate-never

### Machine: Fixed niche → N sources → planner fields → pin while building
- **Epistemic:** SOURCE
- **Workflow / loop:** Write niche sentence → trigger → research N URLs → planner (title+topics) → pin intermediate → human writes/ships later
- **Questions / signals:** What niche stays the same every run? Do we have three real URLs? Are we debugging (pin) or producing (don’t ship stale)?
- **Qualify / frame / objections:** Qualify: they want a recurring issue, not a one-off essay. Frame: research then plan. Objection: “just have GPT write the newsletter” — he splits jobs.
- **Procedure:** Keep niche stable. Pin in build. Do not send.
- **Example that proves it:** SMB AI adoption → three Tavily URLs → planner title/topics → pin.
- **Why it works:** Recurring content dies when the query changes every morning or when debug reruns wipe a good plan.
- **Conditions / exceptions:** Teaser only. Vendors on-tape. No send.
- **Operate-never payload:** Auto-send the newsletter. Install OpenRouter/GPT/Tavily. New newsletter ICP.
- **Hive run (existing skills only):** `wiki-ingest` · `clip-factory` · `warm-draft-hitl` · `ask-principal`
- **Source:** `0Ujdys4LqNs` @ UNKNOWN


### Operate-never
- Auto-send the newsletter.
- Install Tavily / OpenRouter / GPT.
- Treat “AI adoption for small businesses” as a hive SKU.
- Unpark a client / new `icp_id` / new `business-lanes.json` row. Learning ≠ hunt.
- Quote tape $ / student counts / job-loss % / hours×rate as FACT.
- Send / pay / deploy / book / publish. Approve draft ≠ send.
- Install on-tape vendors (Claude, Codex, ChatGPT, Gemini, Coda, Vapi, Abacus, n8n-cloud, Skool). Stack stays Cursor + Grok.
- Grok Bot / `sendPrompt`. Merge `LESSONS-FROM-TAPE.md`. Auto-write SKILL.md. Overwrite `takes/consultant.md` or another desk's take.

## L. Role-Specific Applications

**Constraint first:** The stated ask is “automate newsletters.” Felt problem is not a Tavily query. Do not stand up a newsletter machine for a parked Path A.

**Four-blank after constraint:** If Evens ever wants a recurring brief, toddler stop = fixed niche sentence + N sources + human ship.

**Skeptical-customer:** Pin is honest engineering. “Automate newsletters” is the smash. Clients parked.
