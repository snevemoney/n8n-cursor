# Forge — 0Ujdys4LqNs
Status: filled
Protocol: deep-video-learning
**Source:** `docs/hive/outer-heaven/CONTENT/watch-later/packets/0Ujdys4LqNs/full.txt`
**Packet LEARNED:** `docs/hive/outer-heaven/CONTENT/watch-later/packets/0Ujdys4LqNs/LEARNED.md`
**ICP:** parked unless Evens named one.

## A. Source Map
Newsletter-system teaser. Beats: after trigger, research first → Tavily node → query is a **stable niche** (“AI adoption for small businesses”) that stays the same every run → three URLs + summaries back → AI agent for titles/topics → OpenRouter / “GBT 5 mini” → system message: expert newsletter planner, three articles from the past week, creative title + main topics → run → fields you can drag → **pin the data** so you don’t rerun the agent if something later breaks → play-button to `pxzo2lXhWJE`. Timestamp UNKNOWN.

## B. Atomic Knowledge

### Stable query, fresh pages
- **Claim:** The Tavily query is a broad category that does not change each morning; the pages do.
- **Reasoning:** Niche is the identity of the newsletter.
- **Mechanism:** Trigger → same query → three URLs.
- **Evidence:** “This is going to stay the same every single time.”
- **Conditions:** You can name the niche in one phrase.
- **Exceptions:** He does not show query rotation.
- **Action:** Freeze the niche string. Do not “improve” it every run.
- **Confidence:** high.
- **Source:** `0Ujdys4LqNs` @ UNKNOWN
- **Epistemic:** SOURCE

### Pin planner output before downstream
- **Claim:** He pins the agent’s title/topics so a later fail doesn’t rerun research+plan.
- **Reasoning:** Tokens and drift.
- **Mechanism:** Run planner → pin → continue.
- **Evidence:** Close.
- **Conditions:** You liked this run’s plan.
- **Exceptions:** Pinning a bad plan freezes the bad plan.
- **Action:** Pin only after you read the titles.
- **Confidence:** high.
- **Source:** `0Ujdys4LqNs` @ UNKNOWN
- **Epistemic:** SOURCE

## C. Mental Models
Research is a tool, planning is an agent. The niche is config, not a prompt you rewrite. Pin is a checkpoint.

## D. Procedures
1. Name niche once. 2. Tavily. 3. Planner agent with a short system message. 4. Read title+topics. 5. Pin. 6. Only then write the letter (long).

## E. Examples
**Situation:** Small-business AI adoption newsletter.  
**Action:** Fixed query → 3 URLs → planner → pin.  
**Reasoning:** Don’t rerun if the next node breaks.  
**Outcome:** Teaser stops at plan fields.  
**Lesson:** Checkpoint the plan.

## F. Decision Rules
- If the niche changes every run → not this machine.
- If downstream fails → do not silently rerun the planner.
- If you didn’t read the titles → don’t pin.

## G. Contrarian
Field lets the agent pick a new topic every morning. He locks the niche.

## H. Assumptions
Three URLs are enough. OpenRouter model names on-tape. Falsifier: stale niche, stale letter.

## I. Questions
Does the long add a human approve before send? (`pxzo2lXhWJE`)

## J. Connections
SYSTEM SYNTHESIS: `pxzo2lXhWJE` long. `rXpHzWXjHrw` text-to-workflow newsletter. `send-removed`. `6cEQEba0i2A` token hygiene.

## K. Future-Use
Pin-as-checkpoint on any multi-node slice.

## Steal / Operate-never

### Machine: frozen niche → research → plan → pin → human send
- **Epistemic:** SOURCE + SYSTEM SYNTHESIS (HITL send)
- **Workflow / loop:** trigger → same Tavily query → planner → read → pin → stop (letter/send on long / HITL)
- **Questions / signals:** Did the niche string change? Did we pin unread output?
- **Qualify / frame / objections:** Multi-agent newsletter is a later slice.
- **Procedure:** One planner system message. No auto-Gmail.
- **Example that proves it:** “AI adoption for small businesses” stays put; pin before more nodes.
- **Why it works:** A stable question makes the research comparable day to day.
- **Conditions / exceptions:** Teaser. Tavily/OpenRouter on-tape.
- **Operate-never payload:** Auto-send newsletter; install Tavily because of a short.
- **Hive run:** `slice-build` + `ask-principal`.
- **Source:** `0Ujdys4LqNs` @ UNKNOWN

### Operate-never
- Auto-send. Quote model names as a stack switch.
- New hunt. Merge `LESSONS-FROM-TAPE.md`.
- Send / pay / deploy / book / publish.

## L. Role-Specific Applications
I will not one-shot a newsletter OS. One research→plan slice, pin after I read it, Evens sends. Deploy HITL.
