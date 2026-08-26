# Big Boss — R0qF17BVl9w
Status: filled
Protocol: deep-video-learning
**Source:** `docs/hive/outer-heaven/CONTENT/watch-later/packets/R0qF17BVl9w/full.txt`
**Packet LEARNED:** `docs/hive/outer-heaven/CONTENT/watch-later/packets/R0qF17BVl9w/LEARNED.md`
**ICP:** parked unless Evens named one.

## A. Source Map

Video (PACKET: 12:28, 2840 words, captions `en-orig`). Timestamp UNKNOWN on `full.txt` (json3 present; no VTT in the take). Visual-only gaps: Counter Brief landing, two launch videos, founder HeyGen/ElevenLabs clip, dashboard, recap HTML, brand/logo variants, research/tournament folders, and the Fable usage meters are described, not seen.

Beats, in order:

1. Hook: one `/goal` → “a whole company.” Hundreds of agents, verify, research, videos. Package: landing, product, launch videos, plan, market research, brand.
2. Landing: Counter Brief — “Win the disputes templates lose.” Design “not extraordinary.” Launch video: UI roughly beat-synced; the UI *is* the product (dispute dashboard, fight/fold, evidence). He infers screen record / screenshots + edit.
3. Founder note: HeyGen avatar + ElevenLabs clone speaking as Nate. Shopify chargeback pain; $19 flat; keep what you win. **UNVERIFIED** as a real offer.
4. Second launch video: slower VO, same $19 CTA.
5. Prompt trick: `/goal` has ~4k character limit → put the spec in a file, “read this, execute below the divider, never ask, don’t report until done.”
6. Master spec (paraphrase): build a complete company from open internet; find a real painful underserved problem people are complaining about *now*; product + brand + site; package he could take to market this month; prove why; no mid-run questions; write why you decided; surprise me. Guardrails: **no new spending** (`.env` keys fair game); **publish nothing** (local only); **invent nothing** (research + verify every fact); stay in this project; never ask. Orchestrate = fan-out researchers, idea tournaments, skeptic agents, completeness critic; patterns are a floor.
7. Cost shape: Fable barely moved (~500k tokens, ~15% weekly Fable budget — **UNVERIFIED**). Workers were Opus/Sonnet. Fable planned, delegated, reviewed — “didn’t actually build.” 5-hour limit took a “decent chunk” on a $200/mo Max plan **UNVERIFIED**. All-Fable workers would be “100 times” more expensive.
8. Arc: hunt pain → pick winner → design → brand → build → launch video → founder video → try to kill it → package. Subjective done: a stranger can open the recap HTML, understand, watch, run, demo.
9. Recap walk: Shopify stores with 3+ disputes/month; $19 per approved response; no success fee. Nine phases: 10 researchers, 35→18 problems, 18 verifiers, five-judge tournament (pain, urgency, reachability, WTP, buildability, incumbent weakness), top four get advocate+skeptic, chargeback evidence wins 3–0. Then pricing pages, Visa PDFs, APIs. Brand: counterbrief.com available (checked, not bought); six logo gens + critique; hand-vectorized. Red team: six skeptics, 38 attacks, zero kills, “viable with fixes,” honesty artifacts.
10. Folder tour: brand, research, business plan (ICP, unit economics, moat, risks), market research. He won’t read it all.
11. Time: ~3–4 hours vs “weeks” alone **UNVERIFIED**. Retrospective: he would have **stress-tested the idea harder before building everything**. Models can build anything if the idea is good and “good” is defined. Let the model be creative; get out of the way.
12. Lots he would fix (looks, landing). Functionality “pretty well.” Launch video + upfront research impressed. Maybe 50% there → run two with V1 feedback.
13. Close: experiment tape, not a practical tutorial. Like/CTA.

Off-topic / not skipped: `/goal` char-limit workaround; HeyGen/ElevenLabs as found keys; Skool not the main CTA here.

## B. Atomic Knowledge

### Goal lives in a file when the slash box is too small
- **Claim:** `/goal` ~4k chars. Long missions go in a file: read, execute below the divider, never ask, don’t report until done.
- **Reasoning:** The box is the limit, not the work.
- **Mechanism:** File = mission, guardrails, phases, deliverables, definition of done.
- **Evidence:** He shows the file and the “start now” line.
- **Conditions:** Done must still be checkable. Exceptions: his done is “stranger can open the HTML” — subjective, he admits.
- **Action:** Long briefs live in the repo, not the chat. Hive: `session-bootstrap` dump, then loops.
- **Confidence:** high
- **Source:** `R0qF17BVl9w` @ UNKNOWN — “slash goal has a character limit of like 4,000”
- **Epistemic:** SOURCE

### Expensive brain manages; cheaper brains build
- **Claim:** Fable planned/delegated/reviewed. Opus/Sonnet workers did the work. That is why the Fable meter barely moved.
- **Reasoning:** All-Fable workers would be ~100× the cost (his words, **UNVERIFIED**).
- **Mechanism:** Orchestrator writes no code; checks; sends back if not good enough.
- **Evidence:** ~500k Fable tokens; no Fable workers. **UNVERIFIED**.
- **Conditions:** Orchestrator must have a done line. Exceptions: he still burned a chunk of the 5-hour limit.
- **Action:** Doctrine 11. Do not install Fable. Cursor + Grok already split cheap/expensive.
- **Confidence:** high for the shape; low for the multiples.
- **Source:** `R0qF17BVl9w` @ UNKNOWN — “all Fable did was plan, delegate, review”
- **Epistemic:** SOURCE

### Guardrails: no spend, no publish, no invent, never ask
- **Claim:** Autonomy is allowed *inside* rails: existing keys only, local only, researched facts only, no mid-run questions.
- **Reasoning:** “Total creative freedom” without rails is a credit-card and a ship.
- **Mechanism:** `.env` fair game; publish nothing; verify every stat; write why you decided.
- **Evidence:** Domain checked not bought; videos local; $19 is a designed price, not a live Stripe.
- **Conditions:** Keys in `.env` are still a spend surface if they bill. Exceptions: he used HeyGen/ElevenLabs — that *is* vendor spend on existing accounts.
- **Action:** Hive hard steps stay HITL. “Never ask” is operate-never if the next step is send/pay/deploy.
- **Confidence:** high that he set the rails; medium that “no new spending” held.
- **Source:** `R0qF17BVl9w` @ UNKNOWN — “publish nothing” / “invent nothing” / “never ask me anything”
- **Epistemic:** SOURCE

### Tournament + skeptic is the idea machine — and he still built too early
- **Claim:** Pain hunt → merge → verify quotes → judge tournament → advocate/skeptic → red team. Chargebacks won 3–0. After the fact he wanted *more* idea-kill *before* the build.
- **Reasoning:** Models can now build almost anything; the scarce thing is a viable idea plus a definition of good.
- **Mechanism:** 10 researchers, 35→18, 18 verifiers, five personas, 38 attacks, honesty artifacts.
- **Evidence:** Recap HTML lists the phases. We do not see the primary sources.
- **Conditions:** “Invent nothing” depends on the skeptics actually refetching. Exceptions: Counter Brief is a demo company, not a live ICP.
- **Action:** Steal the tournament. Do not unpark a Shopify chargeback hunt.
- **Confidence:** high for the loop; low that the winner is real demand.
- **Source:** `R0qF17BVl9w` @ UNKNOWN — “what I would have put more emphasis on is probably the upfront idea”
- **Epistemic:** SOURCE

### Local package ≠ take-to-market
- **Claim:** Done is a stranger-openable recap + runnable local demo. He says he could take it to market this month — then says lots to fix, maybe 50%, run two next.
- **Reasoning:** Impressed ≠ shipped. Design and landing are not there.
- **Mechanism:** HTML recap links site, video, research, brand, record.
- **Evidence:** He would not ship the look. $19 / 3–4 hours / weeks saved **UNVERIFIED**.
- **Conditions:** Local only was a guardrail. Exceptions: founder video uses his face/voice clone — brand risk if it leaked.
- **Action:** `slice-build` a POC. No publish. No new `icp_id`.
- **Confidence:** high
- **Source:** `R0qF17BVl9w` @ UNKNOWN — “maybe we’re 50% of the way there”
- **Epistemic:** SOURCE

## C. Mental Models

- **Get out of the model’s way** once rails and done exist. **SOURCE**
- **Orchestrator is a manager, not a builder.** **SOURCE**
- **Floor not ceiling** on orchestration patterns. **SOURCE**
- **Creativity needs a kill step.** He under-weighted it. **SOURCE**
- **Impressed video is the magnet; 50% is the honest line.** **INFERENCE**
- **Counter Brief is a prop.** **SYSTEM SYNTHESIS**

## D. Procedures

1. **Write the mission in a file** (goal, rails, phases, done).
2. **Rails:** no new spend, no publish, no invented stats, stay in-repo.
3. **Never-ask is for research/build, not for send/pay/deploy.**
4. **Fan-out hunt** → merge → refetch quotes.
5. **Tournament** with named score axes + advocate/skeptic.
6. **Kill test before the expensive build** (his retrospective).
7. **Orchestrator delegates** to cheaper workers; reviews; sends back.
8. **Package** a recap a stranger can open.
9. **Human walks the demo.** List what is 50%.
10. **Run two** only if Evens wants a second slice — still local.

**Qualify / frame:** Experiment tape. Shopify chargeback is a prop, not an ICP.
**Objections:** “It built a business” — local package, no publish, he would restress the idea. “Never ask” — not a license to charge a card.
**Avoid:** Buying the domain. Shipping HeyGen-as-Evens. Quoting $19 / $200 / 500k as FACT.
**When to change:** If the idea fails the kill test, stop. Do not decorate a dead idea.

## E. Examples

**Situation:** `/goal` box too small.  
**Action:** File + “execute below the divider.”  
**Reasoning:** The limit is the UI.  
**Outcome:** Multi-hour run with phases.  
**Lesson:** Long missions are documents. Implicit rule: done lives in the file.

**Situation:** Fable as CEO of cheaper workers.  
**Action:** No Fable workers; Opus/Sonnet build.  
**Reasoning:** Meter and quality.  
**Outcome:** He calls it impressive and not cheap.  
**Lesson:** Manage don’t chat (doctrine 5). Implicit rule: expensive brain does not type the HTML.

**Situation:** After the recap, he wants more idea-kill first.  
**Action:** Names it as the miss.  
**Reasoning:** Build is cheap now; bad ideas are the waste.  
**Outcome:** 50% package, run two fantasized.  
**Lesson:** Tournament is not enough if you still build the winner too fast. Implicit rule: red team *before* the landing page.

## F. Decision Rules

- If the brief won’t fit the box → file it.
- If the next action is publish/pay → HITL, ignore “never ask.”
- If the idea has not been killed → do not build the company kit.
- If the orchestrator is building → you mis-assigned the brain.
- If a stranger cannot open the recap → not done.
- Optimize: idea-kill then one local package.
- Refuse: Counter Brief as a hive SKU; auto-buy domain; clone-Evens founder video as ship.

## G. Contrarian

- Against “one prompt = a business”: he still wants a harder idea test and a run two.
- Against “use the strongest model for every worker”: that is the 100× bill.
- Against “never interrupt the agent”: rails include never-ask *and* no publish.
- Field assumes the landing is the product. He is more impressed by the research + video than the look.

## H. Assumptions

**His:** Open-internet pain hunt finds real demand; six skeptics are enough; `.env` keys are “no new spend”; 3–4 hours vs weeks is fair; Skool/like is enough CTA.

**Ours:** Captions complete enough (2840 words). All $ / tokens / hours / 3–0 votes **UNVERIFIED**. Visuals unseen. Domain: demo company. Clients parked. Chargeback SaaS is kill-adjacent (we do not hunt it).

**Falsifiers:** Quotes were hallucinated despite “invent nothing.” $19 unit economics fail. HeyGen founder video leaks. Red team was theater.

**Disagreement (keep labeled):** We will not operate a one-prompt company or a Shopify dispute SKU. The **file-goal**, **cheap workers**, **no-publish rails**, and **kill-before-build** machines are still stolen. **SYSTEM SYNTHESIS**

## I. Questions

- Did run two happen? Not on this tape.
- What did the 38 attacks actually change on the site?
- Sibling “Opus think like Fable” — confirm id before pairing (`2J3uX8iRNng` is the bake-off, not necessarily that tip).

## J. Connections

- **SYSTEM SYNTHESIS** → `2J3uX8iRNng` (Fable orchestrates; Opus executes; slot machine).
- **SYSTEM SYNTHESIS** → `Tj3018n5MVg` (personas + skeptics + verify).
- **SYSTEM SYNTHESIS** → `XNQBCRcwXV4` (goal + guardrails + exit; unhobble).
- **SYSTEM SYNTHESIS** → `demand-validate` (us only) · `slice-build` · `ask-principal`.
- Do not add `icp_id` chargeback.

## K. Future-Use

- Honesty artifacts as a Watchdog deliverable type (unassigned).
- “Checked not bought” domain as a Money Desk observe-only (unassigned).
- Founder-clone video as a brand-risk don’t (unassigned).

## Steal / Operate-never

### Machine: File-goal + rails → tournament/kill → expensive manages, cheap builds → local recap
- **Epistemic:** SOURCE (demo) / SYSTEM SYNTHESIS (hive mapping)
- **Workflow / loop:** trigger (ambiguous “build a company” urge) → write file-goal with no-spend / no-publish / no-invent → hunt + verify quotes → tournament + skeptic → **kill test before build** → orchestrator delegates to cheaper workers → local package + stranger recap → human lists the 50% → HITL on any real domain/pay/publish.
- **Questions / signals:** “Is done in the file?” “Has the idea been killed?” “Who is building vs managing?” “Is this local?”
- **Qualify / frame / objections:** Experiment. Counter Brief is a prop. Objection: take it to market this month — he also said 50% and fix the idea first.
- **Procedure:** D steps 1–9. Checkable stops: (1) rails written, (2) kill test recorded, (3) recap opens, (4) nothing published.
- **Example that proves it:** Chargeback wins 3–0, then he wants more idea-stress. Lesson: the miss is building too soon.
- **Why it works:** Long missions need a document. Autonomy without rails spends and ships. Build is cheap; bad ideas are not. Conditions: local, HITL money. Exceptions: `.env` still bills; numbers unverified.
- **Conditions / exceptions:** Cursor + Grok only. HeyGen/ElevenLabs/Fable/Skool on tape. Clients parked.
- **Operate-never payload:** Ship Counter Brief; buy the domain; quote $19 / $200 / 100× as FACT; never-ask send/pay; new hunt.
- **Hive run (existing skills only):** `session-bootstrap` · `slice-build` · `golden-test-loop` · `ask-principal` · doctrine cheap/expensive · `demand-validate` (us only).
- **Source:** `R0qF17BVl9w` @ UNKNOWN

**Operate-never (this desk will not operate — still walked the tape):**

- One-prompt company as a hive SKU
- Shopify chargeback / Counter Brief hunt
- Auto-buy domain / auto-publish / clone-Evens video as ship
- Quote tape $ / tokens / “100 times” as FACT
- Install Fable / HeyGen / ElevenLabs / Skool
- New `icp_id` / unpark Normand
- Grok Bot `sendPrompt` · send / pay / deploy / book / publish
- Merge `LESSONS-FROM-TAPE.md` · write packet `LEARNED.md` (Researcher owns that)

## L. Role-Specific Applications

I manage; I do not green-light a company because a recap HTML slapped.

- **Done** on an experiment slice: rails + kill test + local recap + Evens lists the 50%. Not “take it to market this month.”
- **Delegate without being asked:** Researcher owns the skeptic pass; Money Desk does not price $19; Publishing does not ship the launch cut.
- **Skeptical review:** “Whole company” is the hook. He said Fable didn’t build and the idea needed more killing.
- **One system this take:** kill-before-build. Not a nine-phase fireworks show.
- Live hunt stays parked. I do not rotate to Shopify disputes.
