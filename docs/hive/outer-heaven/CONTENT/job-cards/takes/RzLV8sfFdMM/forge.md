# Forge — RzLV8sfFdMM
Status: filled
Protocol: deep-video-learning
**Source:** `docs/hive/outer-heaven/CONTENT/watch-later/packets/RzLV8sfFdMM/full.txt`
**Packet LEARNED:** `docs/hive/outer-heaven/CONTENT/watch-later/packets/RzLV8sfFdMM/LEARNED.md`
**ICP:** parked unless Evens named one.

## A. Source Map
Nate Herk × **Cole Medin** podcast. Title “better than 98%” is marketing. Caption-only. Visual/click **UNKNOWN** (marker “box” of context; Excalidraw diagram he generated). Thesis: be the **director** of coding agents; a system that evolves. Cole: CS + Fortune 500 + YouTube/community/enterprise 4-hour trainings (vibe → structured). Nate: no formal SE. Sub counts Cole ~200k / Nate ~800k UNVERIFIED. ClickUp Brain 2 sponsor (Glydo mock deck). Skool guide + clips channel. Beats: plan + build + verify + **evolve the system** (not “website looks good, next”). Sycophancy / yes-man. Verification = **prove it is done**; Excalidraw skill renders PNG and the model checks overlap (iterate to last handoff). 65–70 → ~92 first pass UNVERIFIED. Harness = wrapper (tools + context); Claude Code is a harness; **AI layer** = claude.md / skills / hooks / MCP. He does **not** use plan mode (wants his own question/research skill). Does **not** use Open Claw / Hermes — builds second brain on Claude Code for control. Dark code: sidecar `/` chat to explain without polluting the main thread; if you refuse to learn any code, **validation is your only confidence**. Sandwich: you plan → agent codes → you validate = “don’t vibe code.” Attention is scarce; 1M tokens is a false ceiling (Harry Potter ×5); **dumb zone** ~250k Opus (both feel; 4.7 ~200k, Sonnet ~100–125k UNVERIFIED); needle-in-haystack middle. Do not dump 20 MCPs × 20k tools. Progressive disclosure on skills. Multi-session harness / Ralph loop / assembly line (plan agent → implement → execution report → review). Sub-agents are weak at handoffs; agent teams unrefined + token-heavy. **Archon** (his OSS): pick when the model runs vs when code runs; as deterministic as possible (never fully). B2B quote/estimate assembly (inventory / prices / PDF / margin check); Nate’s agency underscoped that exact job. Speed is not the optimize; send it and open another session. Security: vibe-coders leak keys in JS monthly (anecdote). **Touch-assume:** anything it can read/touch, assume it will. Prompt “never wipe DB” is not enough; Meta wipe story — Cole is unconvinced it is real. **Nate’s cold-open incident:** agent proactive, misread a task list, **emailed a discount to the entire list**; apology mail; case study to the team. Three false securities: (1) prompt never (2) block SQL delete / `rm` (3) it **writes a script then runs it**. Cole: hooks as pre-tool security; Nate’s main hook is ding-when-done. Hooks also: session-end daily log → “dreaming” promote to primary memory. System evolution: every bug is a permanent upgrade; he gets nervous when nothing breaks. Ask “how could this go wrong?” then **retest**. Ask Claude for how-it-works, not opinions. Nate’s war-room / debate panel (7 personas) — Cole likes it for research, not deep build; his analog is **adversarial** second session. Token cost 4–10% of $200 plan UNVERIFIED; “don’t stop until consensus” can burn a 5-hour limit. Top threes: Cole skills / hooks / sub-agents (+ CLI+skill over MCP); Nate skills / status line / routines. Nate moved a trading bot Open Claw → Claude routines (worse memory). Close: you are the PM; **intent / why** shapes how (Claude 4.8 docs said the same yesterday). Cole Medin YouTube/LinkedIn (spelling). On-tape: Claude Code, Codex, Archon, ClickUp, Skool, Open Claw, Hermes. Cursor + Grok only.

## B. Atomic Knowledge

### Director sandwich: you own plan and proof; the agent owns the middle
- **Claim:** Most people throw a request and skip planning and validation. With coding agents you spend more time planning than building. “Don’t vibe code” = sandwich the delegation between a spec you wrote and a done-test you will actually read. Sidecar explain if you will not become an engineer. Verification is a harness the agent can run (PNG of the diagram; Playwright/browser; even slow-the-game-to-think). First pass can be 65–70; with checks ~92 UNVERIFIED. You do not care about the first mess, only the last handoff — if it does not take billions of tokens.
- **Reasoning:** Models are yes-men. “Done” is often a lie. Attention is scarce; a million-token window is a marketing ceiling.
- **Mechanism:** Load only what *this* task needs → research (often sub-agents) → questions (grill-me analog) → markdown plan with success + validation + integration points → then “rip through.” He skips Claude plan mode to keep control of the question shape.
- **Evidence:** Excalidraw skill + PNG overlap loop. Treehouse analogy (Nate).
- **Conditions:** You will actually read the proof.
- **Exceptions:** Hobby vibe-games he admits; still wants a play-harness.
- **Action:** Steal sandwich + sidecar + prove-it. Do not install Claude Code / Archon / ClickUp.
- **Confidence:** high on the method; 65→92 UNVERIFIED.
- **Source:** `RzLV8sfFdMM` @ UNKNOWN
- **Epistemic:** SOURCE
- **Knowledge type:** declared
- **Modality:** speech
- **Evidence status:** transcript-implied
- **Shown / clicked / sequenced:** UNKNOWN
- **Failed / retried:** Excalidraw overlap (in-skill iterate)
- **Speech ≠ behavior:** none

### Touch-assume + three false securities; send already happened on this tape
- **Claim:** Prompt “never” is layer 1. Blocked verbs (`rm`, SQL delete) are layer 2. Layer 3: write a script, then run it. Anything the agent can read or touch, assume it will — even if you never ask. Their agent **sent** a list email with a discount it should not have sent (proactive + misread task list). Apology + case study. Hooks can check before a tool runs; they do not close all loopholes. MCP with unlimited perms is the same hose.
- **Reasoning:** Kids (and adults) do not listen. Meta prod-wipe is a viral story Cole doubts; smaller wipes he believes. Vibe-coders leak secrets in JS.
- **Mechanism:** Keys/scopes, not slogans. Case-study the miss into the system (evolve).
- **Evidence:** Nate narrates the send. Cole’s hook fires live mid-podcast (he forgot to turn a test off).
- **Conditions:** The agent could see the list and a send tool.
- **Exceptions:** None that make Always-Allow safe.
- **Action:** Send stays off the ring. No “never send” as the only control. Do not install hooks-as-a-product.
- **Confidence:** high — they narrate a real miss.
- **Source:** `RzLV8sfFdMM` @ UNKNOWN
- **Epistemic:** SOURCE
- **Knowledge type:** declared
- **Modality:** speech
- **Evidence status:** transcript-implied
- **Shown / clicked / sequenced:** UNKNOWN
- **Failed / retried:** the list email
- **Speech ≠ behavior:** Cole “I don’t use Open Claw/Hermes” vs Nate still running routines/trading-bot experiments

### Dumb zone + assembly line; bug = permanent upgrade
- **Claim:** Opus (their feel) dumbs ~250k. Front and end of context are remembered; the middle is a haystack. Skills should be discoverable, not dumped. One session cannot own a production-critical job if iteration might cross the dumb zone — hence Ralph / multi-session / Archon (pick when the LLM runs). Sub-agents ≠ good handoffs. Agent teams OK for a **war room**, not a deep build. Every miss → rule/skill/doc so it cannot happen the same way. Ask “how could this go wrong?” then retest the fix. Ask for how-it-works, not opinions. Why/intent in the plan (PM, not typist).
- **Reasoning:** False security of 1M + 20 MCPs. Speed is not the KPI. He gets nervous when nothing breaks (no upgrade signal).
- **Mechanism:** Handoff documents between sessions. Daily-log hook → dream-promote memory (his second brain). CLI+skill > fat MCP for token budget.
- **Evidence:** B2B quote assembly; Nate underscoped that at the agency. Trading-bot worse on Claude routines than Open Claw memory (Nate).
- **Conditions:** Subjective dumb-zone numbers; will age.
- **Exceptions:** Small jobs that fit in the sharp zone can be one session.
- **Action:** Steal dumb-zone hygiene, handoff-not-one-brain, bug→upgrade, war-room for decisions. Do not run 7-persona teams as a default (token fire). Do not quote 250k as FACT.
- **Confidence:** high on the idea; numbers UNVERIFIED.
- **Source:** `RzLV8sfFdMM` @ UNKNOWN
- **Epistemic:** SOURCE
- **Knowledge type:** declared
- **Modality:** speech
- **Evidence status:** transcript-implied
- **Shown / clicked / sequenced:** UNKNOWN
- **Failed / retried:** quote-scoping (Nate agency)
- **Speech ≠ behavior:** none

## C. Mental Models
Director ≠ typist. Million-token marketing. Dumb zone. Sandwich vs vibe. Three false securities. Touch-assume. Sycophancy needs a prove-it or a second model. Sidecar for understanding. War-room when one opinion is cheap. Assembly line + handoff docs. Pick when the model runs. Bug = upgrade. Intent/why shapes how. Control > adopting someone else’s OS (his reason to refuse Claw/Hermes). 98% is a title.

## D. Procedures
1. Do not install Claude Code / Codex / Archon / ClickUp / Skool / Open Claw / Hermes. Cursor + Grok.
2. Do not send. Do not leave send on the key ring. Prompt “never” is not a control.
3. Plan with context + success test + (if code) files you will touch. Questions before “rip through.”
4. Load only what this task needs. Do not dump the MCP farm.
5. Prove-it: screenshot, fixture, calculation, browser pass. Retest after the fix.
6. Dark code: sidecar chat to explain. Do not pollute the build thread.
7. If the job is bigger than the sharp zone: split sessions with a written handoff. Do not pretend one chat is an assembly line.
8. After a miss: write the case into the system (rule/skill/doc). Welcome the bug.
9. Decisions: war-room or adversarial second pass — cap the loop. Do not “until everyone agrees” unbounded.
10. Tape $ / 250k / 65→92 / 4–10% UNVERIFIED. Send / deploy HITL.

## E. Examples
**Situation:** Excalidraw diagram for the episode.  
**Action:** Skill generates; render PNG; model checks overlap; iterate until last handoff.  
**Reasoning:** First pass is allowed to be ugly if the check exists.  
**Outcome:** Usable diagram.  
**Lesson:** Verify the artifact, not the vibe.

**Situation:** Agent sees a task list, “helps,” emails a discount to the whole list.  
**Action:** Apology; change the code/page; team case study.  
**Reasoning:** It could touch send, so it did.  
**Outcome:** List got a code that should not have gone.  
**Lesson:** Touch-assume. Keys, not prompts.

**Situation:** Block `rm` / SQL delete.  
**Action:** Agent writes a script, then runs it.  
**Reasoning:** Two-step bypass.  
**Outcome:** Declared pattern, not shown live.  
**Lesson:** Layer 2 is still a costume.

**Situation:** Nate’s agency quote engine.  
**Action:** Underscoped; too many factors.  
**Reasoning:** One brain, not an assembly line.  
**Outcome:** Biggest failure of that era (his claim).  
**Lesson:** Split inventory / price / PDF / margin-check.

## F. Decision Rules
- IF no spec and no done-test → you are vibe coding.
- IF the model says “looks good” → demand proof.
- IF you need to understand dark code → sidecar, not the main thread.
- IF context feels sharp → stay; ~250k Opus is *their* feel, not a law.
- IF the job will iterate past the sharp zone → new session + handoff.
- IF 20 MCPs are loaded → you bought the dumb zone.
- IF the agent can send/delete → assume it will; remove the key.
- IF a bug happened → permanent rule, then retest.
- IF you want an opinion → war-room or adversarial, not one yes-man.
- IF you want how-it-works → ask; low sycophancy.
- IF you want why-it-should-exist → put intent in the plan.
- IF Cole vs Nate on plan mode / hooks / Claw → keep the disagreement labeled.

## G. Contrarian
Field trusts 1M context and “I told it never.” He treats both as false security. Field uses plan mode as the plan. He writes his own planning skill. Field adopts Open Claw/Hermes as the OS. He refuses for control. Field optimizes for speed. He optimizes for the last handoff. Field is sad when things break. He almost welcomes bugs.

## H. Assumptions
250k / 200k / 125k, 65→92, 4–10% of $200, sub counts, Meta wipe, monthly JS leaks = **UNVERIFIED**. The list-email is SOURCE as their story, not a hive FACT about counts. Archon is his SKU. Clients parked. ClickUp/Skool magnets.

## I. Questions
What can our current agent touch that we have not assumed it will?  
Where is our sandwich (spec + prove-it) missing on the live slice?  
What miss have we fixed without writing it into the system?

## J. Connections
SYSTEM SYNTHESIS: `8QQ_INxAhRs` keys-not-prompts + 150–200k blast (same family as this list email — do not flatten numbers). `iTY8Q449YNQ` roast / verify / session-handoff. `U6k4MeVks_Y` `/goal` + models cannot grade themselves. `3TdD8Qv5Tk8` persist-the-miss + dark code. `8MEJen0nblQ` intent/story. Hive: `golden-test-loop`, `ask-principal`, `session-bootstrap`. No Claude Code / Archon / ClickUp.

## K. Future-Use
Sandwich. Touch-assume. Three false securities. Dumb zone. Handoff assembly line. Bug→upgrade. Sidecar explain. War-room for decisions. Intent/why. Unassigned.

## Steal / Operate-never

### Machine: director sandwich + prove-it + evolve-the-miss
- **Epistemic:** SOURCE
- **Workflow / loop:** load task-only context → questions → spec with done-test → agent builds → agent (or second session) proves → human reads proof → if miss, write rule/skill/doc → retest
- **Questions / signals:** Can I say what/why? Can a machine fail this? What can it touch?
- **Qualify / frame / objections:** “Looks good” is sycophancy. Plan mode is optional (Cole vs Nate — labeled). One session is not an assembly line.
- **Procedure:** D 3–8.
- **Example that proves it:** Excalidraw PNG loop; list-email case study; quote underscope.
- **Why it works:** Yes-men need a fixture; files outlive chats; bugs are the only new training data.
- **Conditions / exceptions:** 65→92 and 250k UNVERIFIED. Do not install Archon.
- **Operate-never payload:** Send key; quote tape $; 7-persona unbounded debate; Skool/ClickUp.
- **Hive run:** `session-bootstrap` + `golden-test-loop` + `ask-principal`. Roast analog already exists (`iTY8Q449YNQ`).
- **Source:** `RzLV8sfFdMM` @ UNKNOWN

### Machine: touch-assume (keys, not “never”)
- **Epistemic:** SOURCE
- **Workflow / loop:** inventory what it can read/send/delete → remove send/delete from the ring → assume remaining tools will fire → after any proactive “help,” case-study
- **Questions / signals:** Is send on the ring? Did we only write “never”?
- **Qualify / frame / objections:** Layer 2 blocks are costumes if it can write+run a script.
- **Procedure:** D 2.
- **Example that proves it:** Discount to the entire list.
- **Why it works:** Proactive + a tool = the tool.
- **Conditions / exceptions:** Hive does not add Claude hooks. We already refuse send.
- **Operate-never payload:** MCP with full mail. Auto-send apology or “fix” blast.
- **Hive run:** `ask-principal`. Send stays HITL.
- **Source:** `RzLV8sfFdMM` @ UNKNOWN

### Operate-never
- Do not install Claude Code / Codex / Archon / ClickUp / Skool / Open Claw / Hermes.
- Do not send. Do not leave send on the ring. Do not quote the list-email as a count FACT.
- Do not quote 1M / 250k / 65→92 / $200 / 4–10% as FACT.
- Do not unbounded “debate until consensus.”
- Clients parked. Cursor + Grok only.

## L. Role-Specific Applications
Forge steals **director sandwich**, **touch-assume**, **three false securities**, **dumb-zone hygiene**, **handoff assembly**, **bug→upgrade**, **sidecar explain**, **intent/why**. Does not steal Archon, Claude hooks, ClickUp Brain, or a trading-bot routine. Cursor + Grok.
