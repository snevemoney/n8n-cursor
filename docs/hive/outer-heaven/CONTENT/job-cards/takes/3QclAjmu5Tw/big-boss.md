# Big Boss — 3QclAjmu5Tw
Status: filled
Protocol: deep-video-learning
**Source:** `docs/hive/outer-heaven/CONTENT/watch-later/packets/3QclAjmu5Tw/full.txt`
**Packet LEARNED:** `docs/hive/outer-heaven/CONTENT/watch-later/packets/3QclAjmu5Tw/LEARNED.md`
**ICP:** parked unless Evens named one.

## A. Source Map

Video (PACKET: 10:22, 2483 words, captions `en-orig`). Timestamp UNKNOWN on `full.txt` (json3 present; no VTT in the take). Visual-only gaps: Code with Claude event graphics, rate-limit tables, SpaceX/GPU numbers, and his five “what this changes” slides are described, not seen.

Beats, in order:

1. News: Anthropic × **SpaceX** partnership will “substantially increase” compute → higher Claude Code and API usage limits.
2. Color: first **Code with Claude** 2026 in San Francisco (also London, Tokyo); demand so high they added a day per city.
3. Pain: last quarter “awful” with outages. Reasons he lists: testing, feature ship, Opus, **Mythos**. Main reason: not enough compute for demand.
4. Practical promise: what this means for you; what to do differently.
5. Immediate product changes: **double** Claude Code 5-hour rate limits (Pro, Max, Team). **Remove peak-hours** limit reduction on Pro/Max. (He recalls weekday-morning throttle from ~a month ago.)
6. Aside: they had tested blocking new Pro ($20) from Claude Code (Max-only) except existing subscribers — demand management.
7. Compute math: buy too much unused capacity and you burn money. “Not a very simple problem.”
8. ToS aside: people used the subscription for **open Claude** and **Hermes**; Anthropic said stop. He wonders if ToS was also a load shed.
9. API: Opus rate limits “considerably” up. He mixes numbers: used to **30K input/min**; output **8,000 → 80,000**/min; “16% on the output side” also spoken — captions collide. “Every tier” jumped. Lowest tiers biggest multiples (16×, 10× on a table).
10. Buying spree: Amazon, Google, Broadcom, Microsoft, Nvidia, **FluidStack**; day-before **Goldman Sachs JV + Blackstone**. Enterprise + international.
11. Skips **managed agents** (webhooks, auto dreaming, multi-agent orchestration) — “play around… another video.”
12. Why it matters: months of hitting walls; Pro→Max→higher Max still dying inside 5 hours; production Opus APIs rate-limited.
13. Page metaphor: tier-1 input now “~370 pages/min” vs “20–22 pages” at 30K. Parallel agents were “really, really hard” before.
14. How they paid: SpaceX deal — **300 megawatts**, **220,000+ Nvidia GPUs**, fast. **UNVERIFIED**.
15. Closed vs open: closed feels fast because of their servers. Local/VPS needs RAM/VRAM. Compute is the difference.
16. Footer: interest in **multiple gigawatts of orbital AI compute** — “GPUs in space.” Not this year. Terrestrial compute (power, water, cooling, towns) has a “long-term ceiling.”
17. Five builder moves: (1) **retest workflows that broke** on rate limits; (2) if you were `/opus plan` or dumping to Haiku/Sonnet to save session, you can “treat yourself” — context management still matters; (3) **1M context finally usable in production** (API-first); (4) Claude Code can sit behind routines without eating the whole day; (5) multi-agent (e.g. five sub-agents × 50k) more viable.
18. LinkedIn-infographic story: told a client no; **3 months later** a new image model; he called back and built it.
19. Signals: 5+ year compute bet; Claude Code as flagship (event name; little **co-work** talk); community electricity-hike commitment as a trust play so they can build faster than labs pushed out of small towns.
20. CTA: next video on token/session hacks (tagged). Like / thanks.

Off-topic / not skipped: Mythos named as load; Hermes / open Claude ToS; orbital compute; Goldman/Blackstone; managed-agents tease.

## B. Atomic Knowledge

### Limits moved because compute moved, not because the product got wiser
- **Claim:** SpaceX (plus a buying spree) is why 5-hour limits doubled and peak throttle died.
- **Reasoning:** Last quarter’s outages were demand > iron. More iron → more allowance.
- **Mechanism:** Partnership + GPU/MW numbers → product-limit changelog.
- **Evidence:** Double 5-hour; peak-hours removed; API tables. MW/GPU **UNVERIFIED**.
- **Conditions:** Holds if the changelog is real. We did not open Anthropic’s post.
- **Exceptions:** He also lists feature-ship and Mythos as extra load.
- **Action:** Treat vendor capacity as weather, not as a hive strategy change.
- **Confidence:** medium (news via Nate)
- **Source:** `3QclAjmu5Tw` @ UNKNOWN — “double Claude Code’s 5-hour rate limits”
- **Epistemic:** SOURCE

### Demand management includes product cruelty
- **Claim:** Peak-hour taxes, Pro-can’t-use-Claude-Code tests, and ToS against Hermes/open-Claude were load sheds, not just philosophy.
- **Reasoning:** Unused compute wastes money; overused compute dies. They were steering people.
- **Mechanism:** Pricing/plan gates + ToS.
- **Evidence:** He recalls the peak-hours note and the Pro/Max experiment. ToS motive is his “wonder.”
- **Conditions:** Useful as a reminder that seats can be kneecapped without a model change.
- **Exceptions:** ToS-as-load-shed is labeled speculation.
- **Action:** Do not build routines that assume a consumer seat stays generous.
- **Confidence:** high for the gates existing on tape; medium for motive
- **Source:** `3QclAjmu5Tw` @ UNKNOWN — “you had to buy a Max plan”
- **Epistemic:** SOURCE / INFERENCE (ToS motive)

### Retest what the wall killed
- **Claim:** If you abandoned an Opus agent because of rate limits, try again; the wall may be gone.
- **Reasoning:** Constraints expire. Old “can’t” is not a forever no.
- **Mechanism:** Re-open the failed workflow; run it under new limits.
- **Evidence:** LinkedIn infographic client: no → new image model 3 months later → he called and built.
- **Conditions:** Only if the failure mode was capacity, not taste/quality.
- **Exceptions:** Context management is “still really, really important.” More limit ≠ more slop.
- **Action:** Keep a parked-because-wall list. Retest when weather changes. Do not retest as a reason to install Claude.
- **Confidence:** high as a procedure
- **Source:** `3QclAjmu5Tw` @ UNKNOWN — “the wall might not actually exist anymore”
- **Epistemic:** SOURCE

### Session rationing was a hidden architecture
- **Claim:** People used `/opus plan`, Haiku, Sonnet, and avoided routines so the 5-hour bar would last.
- **Reasoning:** Knowledge work + agentic loops shared one bucket. Routines lost.
- **Mechanism:** Model downshift and “don’t put this on a cron.”
- **Evidence:** Point 2 and 4 of his five.
- **Conditions:** Matters inside Claude Code. Hive analog: don’t let grunt loops eat the expensive brain (doctrine 11) — already true without their seat.
- **Exceptions:** He still says manage context; “treat yourself” is not “dump 1M tokens.”
- **Action:** Do not spawn a five-sub-agent fleet because a vendor doubled a bar.
- **Confidence:** high
- **Source:** `3QclAjmu5Tw` @ UNKNOWN — “delegating a lot of work to Haiku or Sonnet”
- **Epistemic:** SOURCE

### Parallel agents were a rate-limit problem, not a management problem
- **Claim:** Five sub-agents × 50k tokens (and 8k output/min) made production multi-agent “really, really hard.”
- **Reasoning:** He frames viability as tokens-per-minute, not as “can you define done.”
- **Mechanism:** API table + page-count metaphor (20–22 → ~370 pages/min on tier 1).
- **Evidence:** Output 8k → 80k/min spoken. Input 30k → much higher. Caption also says “16%” — inconsistent.
- **Conditions:** Only if you were actually blocked on RPM. Most hive work is not.
- **Exceptions:** More parallel without a checker just scales bugs (`EuzYhzB0vbI`).
- **Action:** I will not approve a swarm because Opus RPM went up.
- **Confidence:** medium on the table; high on the temptation
- **Source:** `3QclAjmu5Tw` @ UNKNOWN — “multi-agent workflows are way more viable”
- **Epistemic:** SOURCE

### 1M context “in production” is an API claim
- **Claim:** Rate limits, not the window size, were what made 1M unusable in production.
- **Reasoning:** You could have the window and still get 429’d.
- **Mechanism:** Higher input RPM.
- **Evidence:** He distinguishes API vs Claude Code here.
- **Conditions:** Production apps that stream huge contexts.
- **Exceptions:** A bigger window still needs a known-good pile. Working once proves almost nothing (doctrine 8).
- **Action:** Do not treat “1M usable” as a reason to paste the company into one prompt.
- **Confidence:** medium
- **Source:** `3QclAjmu5Tw` @ UNKNOWN — “1 million context window is finally usable in production”
- **Epistemic:** SOURCE

### Unused compute is also a loss — so generosity can reverse
- **Claim:** Buying iron that sits idle burns money; that is why they throttled, then un-throttled.
- **Reasoning:** Limits are a control loop, not a gift.
- **Mechanism:** Forecast demand ↔ purchase ↔ product gates.
- **Evidence:** He says the math is hard; peak-hours and Pro gates were experiments.
- **Conditions:** Predicts future re-throttles if demand or margins move.
- **Exceptions:** SpaceX/orbital story is a long-horizon hedge, not a promise to users.
- **Action:** Same as `-nG-9vlSkho`: do not marry a generous seat.
- **Confidence:** high as a model
- **Source:** `3QclAjmu5Tw` @ UNKNOWN — “computer is just sitting there not being utilized”
- **Epistemic:** SOURCE

### Orbital compute is a slide, not a plan
- **Claim:** Anthropic and SpaceX “expressed interest” in gigawatts of orbital AI compute because terrestrial power/water/politics ceiling.
- **Reasoning:** He likes the sci-fi; he says not this year.
- **Mechanism:** Quote from the announcement footer.
- **Evidence:** Spoken paragraph. No engineering plan.
- **Conditions:** Color. Future-use only.
- **Exceptions:** Community electricity commitment is the terrestrial PR twin.
- **Action:** Do not open a space/compute lane. Do not quote MW/GPU as FACT.
- **Confidence:** high that he read a sentence; zero as a project
- **Source:** `3QclAjmu5Tw` @ UNKNOWN — “orbital AI compute capacity”
- **Epistemic:** SOURCE

### Flagship signal: Claude Code, not co-work
- **Claim:** The event talked session limits and APIs; little about co-work. He reads Claude Code as the flagship.
- **Reasoning:** “Code with Claude” biases the sample; he still calls it out.
- **Mechanism:** What they chose to announce.
- **Evidence:** His “best of my knowledge” hedge.
- **Conditions:** One conference day.
- **Exceptions:** Session limits also hit other Claude products (he says that).
- **Action:** Ignore as a hive product pick. We are not on Claude.
- **Confidence:** low as strategy-read
- **Source:** `3QclAjmu5Tw` @ UNKNOWN — “Claude code also seems to be clearly their flagship”
- **Epistemic:** SOURCE (his read)

### Client “no” can become “yes” when the constraint lifts
- **Claim:** He refused LinkedIn AI infographics, then a new image model made him call the client back.
- **Reasoning:** Honest no + calendar reminder > fake yes.
- **Mechanism:** Park the job; retest; restart the conversation.
- **Evidence:** 3-month gap story.
- **Conditions:** Client still exists and still wants it. Quality bar was the block, not price.
- **Exceptions:** Clients parked **here**. I do not call anyone.
- **Action:** Steal the retest loop. Operate-never the outbound call.
- **Confidence:** high as a story; unverified as a receipt
- **Source:** `3QclAjmu5Tw` @ UNKNOWN — “3 months later, new image model dropped… I called him up”
- **Epistemic:** SOURCE

## C. Mental Models

- **Capacity is weather.** Outages and doubles are the same system. **SOURCE**
- **Cruel gates are load sheds.** Peak hours, plan locks, ToS. **SOURCE**
- **Walls expire.** Retest. **SOURCE**
- **Rationing becomes architecture.** People design around the bar. **SOURCE**
- **More RPM is not more management.** Parallel without done/check is a swarm. **INFERENCE**
- **Idle iron is a loss, so generosity reverses.** **SOURCE**
- **Honest no + later yes** when the tool catches up. **SOURCE**

## D. Procedures

1. **Read the changelog as weather:** what doubled, what throttle died, what API RPM moved. Label tape numbers UNVERIFIED.
2. **List jobs that died on that wall** (rate limit, peak hours, quality).
3. **Retest only the capacity-killed ones.** If the kill was taste, a bigger bar does nothing.
4. **Do not spend the new bar on a fleet.** Context management still required.
5. **Do not put “routines” on a consumer seat** just because it doubled — seats reverse.
6. **Park a client no** when the tool is not there; revisit when it is. (Learn; do not call. Clients parked.)
7. **Skip sci-fi footnotes** (orbital GPUs) as strategy.

**Qualify / frame:** Vendor-news tape for Claude users. Not a hive OS change.
**Objections:** “We can finally run five sub-agents” — we already refuse nameless swarms; RPM is not a triangle.
**Avoid:** Install Claude. Quote 300 MW / 220k GPUs / 80k TPM as FACT. Unpark a client because an image model story slapped.
**When to change:** Evens names a stack or a client. Not this tape.

## E. Examples

**Situation:** Builders hitting 5-hour walls and peak-hour taxes.  
**Action:** Anthropic doubles the bar and removes the tax after a compute deal.  
**Reasoning:** Demand exceeded iron; they bought iron.  
**Outcome:** He tells you to retest and “treat yourself.”  
**Lesson:** Weather changed. Implicit rule: do not freeze a “can’t” that was only RPM.

**Situation:** Client wanted AI LinkedIn infographics.  
**Action:** He said he would not ship something he would not post; 3 months later a new model; he called and built.  
**Reasoning:** Honest no protects the brand; retest captures the job.  
**Outcome:** Work happens when the tool exists.  
**Lesson:** Park-and-retest. Implicit rule: the no is temporary if the block was the model.

**Situation:** People hid work in Haiku/Sonnet and avoided crons to save the bar.  
**Action:** He says you can use Opus more and put some routines back.  
**Reasoning:** Shared bucket was the constraint.  
**Outcome:** Temptation to swarm.  
**Lesson:** Rationing shaped the architecture. Implicit rule: I do not let a doubled bar spawn a fleet.

## F. Decision Rules

- If the failure was RPM/outage → retest when weather changes.
- If the failure was quality/taste → more limit does not fix it.
- If someone wants five sub-agents because TPM went up → refuse; define done first.
- If a seat just got generous → assume it can reverse.
- If a number is MW / GPU / pages-per-minute / $20 Pro → **UNVERIFIED**.
- Optimize: honest constraint list + retest.
- Refuse: stack switch, swarm, client call, orbital strategy.

## G. Contrarian

- Against “the product got better today” — iron got bigger.
- Against “ToS is only principle” — he wonders about load.
- Against “use the whole 1M because you can.”
- Against treating a developer conference as a full product map (he admits the name bias).

## H. Assumptions

**His:** The SpaceX story is causal; the tables are right; doubling makes production agents safe; orbital interest is meaningful; electricity-hike PR lets them build faster.

**Ours:** Captions complete enough (2483 words) but API numbers internally collide (16% vs 8k→80k). All infra $ and counts **UNVERIFIED**. Domain-specific: Claude users. Hive stack unchanged.

**Falsifiers:** Changelog is marketing. Doubled bar still dies. Retest still fails on quality. Seats re-throttle next quarter.

**Disagreement (keep labeled):** We will not operate Claude Code routines. The **retest-when-the-wall-moves** machine is still stolen. **SYSTEM SYNTHESIS**

## I. Questions

- Which output number is right: 16% or 10× (8k→80k)?
- Managed agents / “auto dreaming” — what did he skip?
- Did the Pro-block experiment actually ship?
- Sibling token-hacks tape — he tags it; do not invent the id.
- Mythos load — how much of the outage story is that vs iron?

## J. Connections

- **SYSTEM SYNTHESIS** → `-nG-9vlSkho` / `2OD14-0cot4`: generous seats are samples; portability; cheap/expensive.
- **SYSTEM SYNTHESIS** → `6cEQEba0i2A`: session/token hygiene still required after a double.
- **SYSTEM SYNTHESIS** → `EuzYhzB0vbI`: more parallel without a stop condition scales bugs.
- **SYSTEM SYNTHESIS** → `ask-principal` + parked clients: the “I called him up” story is operate-never here.
- **SYSTEM SYNTHESIS** → `coverage-loop`: retest is a score, not a vibe.
- Do not force a Path A client out of a SpaceX press release.

## K. Future-Use

- Parked-because-wall list (unassigned; Forge/Watchdog).
- Seat-generosity reversals as Money Desk observe-only (unassigned).
- Managed-agents follow-up he promised (unassigned).
- Orbital/compute notes as Librarian color (unassigned; not a lane).

## Steal / Operate-never

### Machine: Retest capacity-killed work; do not spend a doubled bar on a swarm
- **Epistemic:** SOURCE (his five points + infographic story) / SYSTEM SYNTHESIS (hive mapping)
- **Workflow / loop:** trigger (vendor raises limits or a new model drops) → list jobs that died on **that** wall → separate capacity-kills from taste-kills → retest only the first → keep context rules → do not add routines/fleets because the bar moved → if a client no was honest, park and revisit (HITL; clients parked now) → do not install the vendor.
- **Questions / signals:** “Was the block RPM or quality?” “Did we just invent a swarm?” “Can this seat reverse?”
- **Qualify / frame / objections:** Claude changelog tape. Objection: five × 50k sub-agents — answer with done/check (`EuzYhzB0vbI`) not TPM.
- **Procedure:** D steps 1–7. Checkable stops: (1) wall typed, (2) retest run or explicitly skipped, (3) no new fleet, (4) no client send.
- **Example that proves it:** Infographic no → model moves → he rebuilds. Opposite temptation: doubled 5-hour → “treat yourself” / routines / multi-agent. Lesson: retest the job; do not redecorate the org.
- **Why it works:** Constraints expire; architecture calcifies around them; idle-iron economics reverse generosity. Conditions: honest failure notes. Exceptions: taste walls; caption-math collisions; we do not sit on Claude.
- **Conditions / exceptions:** Cursor + Grok only. SpaceX / Claude / Hermes stay on tape. Clients parked.
- **Operate-never payload:** Install Claude; quote MW/GPU/TPM as FACT; call a parked client; spawn five nameless agents.
- **Hive run (existing skills only):** `coverage-loop` (retest/score) · `golden-test-loop` · `slice-build` · `ask-principal` · `interview-to-desk` (no 18th agent).
- **Source:** `3QclAjmu5Tw` @ UNKNOWN

**Operate-never (this desk will not operate — still walked the tape):**

- Install Claude Code / Codex / ChatGPT / Gemini / Coda / Vapi / Abacus / Skool / Hermes
- Quote 300 MW / 220k GPUs / $20 / 80k TPM / 370 pages as FACT
- New `icp_id` / unpark Normand / “call the infographic client”
- Grok Bot `sendPrompt` · send / pay / deploy / book / publish
- Merge `LESSONS-FROM-TAPE.md` · write packet `LEARNED.md` (Researcher owns that)

## L. Role-Specific Applications

I manage; I do not spend a doubled vendor bar on a second army.

- **Done** on a changelog slice: walls typed, retest list written or skipped on purpose, no fleet, stack unchanged.
- **Delegate without being asked:** Watchdog keeps the parked-because-wall note. Forge does not “turn on routines.” I do not add a lane because SpaceX was on a slide.
- **Skeptical review:** “Solved session limits” is a thumbnail. He also said context still matters and they will not leave iron idle. I will not approve production swarms from a conference recap.
- **One system this take:** retest the capacity-killed job. Not orbital compute. Not five sub-agents.
- Live hunt stays parked. I do not rotate because Anthropic bought megawatts on tape.
