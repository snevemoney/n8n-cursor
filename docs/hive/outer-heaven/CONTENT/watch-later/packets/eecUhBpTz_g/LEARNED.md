# LEARNED — eecUhBpTz_g
Protocol: deep-video-learning
Status: filled
**Source:** `docs/hive/outer-heaven/CONTENT/watch-later/packets/eecUhBpTz_g/full.txt`
**Timed:** `transcripts/eecUhBpTz_g.timed.txt`
**Desks merged:** Researcher 2026-08-14. Librarian not yet. Keep later dissent as labeled rows. Do not flatten.
**ICP:** parked. Tape $ UNVERIFIED. No new `icp_id`.
**Evidence:** caption-only. Visual/click unobserved. Speech≠behavior rows labeled.

## A. Source Map
Caption-only (`full.txt` ~5426 words / 750 segments). Title: How to Build the Most Powerful System for AI Coding (Full Breakdown) (Cole Medin). Visual/click **UNKNOWN**. Beats: (1) **Dark factory** = a repo that **ships its own code**. Input = spec/PRD. Output = reviewed + validated + shipped. “Ultimate evolution of AI coding harnesses.” Not reliable for everything yet. (2) His experiment: agentic chat over his YouTube (+ Dynamis courses). Built **without looking at a line** it shipped. `chat.dynamis.ai`. Encoded lessons in a **build-dark-factory skill** (PRD in → harness out). **Not vibe coding** — engineering the harness so the agent can plan; a **different agent critiques** the builder. Millions of tokens / months spoken. (3) **Dan Shapiro five levels** (vehicle). 0 stick-shift / spicy autocomplete. 1–2 pair / boilerplate. **3 = agent writes most code; human still plans + validates** — “most of us / most reliable / we should be.” 4–5 = no steering wheel; console is the spec; agent plans, ships, deploys. Human is the bottleneck at 3; factory is the bet that the harness is good enough. Do not jump. (4) Install: Claude Code marketplace plugin **or** point Pi/Codex at the GitHub repo. Empty folder + skill(s) + PRD. Skill **interviews**: autonomy, workflow (his: prime → plan → implement → validate → commit → PR), validation strategy. Then it builds the harness. Games as a test bed (can add features without bloating a chat app). Tower-defense demo. Still **experimental**; stay at 3 for reliability. (5) **Sponsor Parallel** — web index APIs; **Monitor** = always-on search → webhook → Task API briefing with citations; priced per request. (6) **Runtime.** GitHub repo; each spec = **issue**. 30-min **cron** triages. Labels = state (accepted / in progress / needs review). Headless coding agent per step. Driver can be Archon (his) or bare agent. Review = **separate session** (no builder bias). Approve → merge + **auto-deploy**. Needs-fix → builder. Escalation fail-safe (interview can set never). Priority each tick: **fix PR > review PR > next accepted issue > triage new**. Parallelism is a token dial; he keeps a couple. (7) **Merge without deploy = PR generator, not a factory.** Recommends **blue-green** (standby update, then flip; no downtime). (8) **Guidance layer (three files).** Global rules (always, even outside factory). **Factory rules** (stricter; bite-size tasks; maybe not even loaded in normal pair). **mission.md** from PRD: goals **and out-of-scope** so the agent can **reject** specs (correct the human). Reliability dial: split / pair on too-hard specs. (9) **Validation.** Builder ≠ validator. **Hold-out scenarios** written before work, **builder never sees** (or it will design to the test). Builder may have unit/integration to iterate. Validator runs the hold-outs; misses go back to builder. Without this he would not run the experiment. Close: try the skill; any agent/model; he will keep evolving it. **Operate-never:** Claude Code / Codex / Pi as ours · auto-merge/auto-deploy · human-out-of-loop overnight · quote millions of tokens as FACT. **Do not flatten** vs `separate-verifier` · `checkable-stop` · `hosted-neq-scheduled` · `golden-test-loop` · `session-bootstrap`.

## B. Atomic Knowledge

### Level 3 is the reliable seat; a factory is a harness, not a vibe
- **Claim:** Most people should stay at Shapiro level 3 (agent writes; human plans + validates). A “dark factory” is **up-front harness engineering** (interview, rules, queue, separate reviewer, hold-outs, deploy strategy) so a spec can run headless. Vibe coding is the thing he is distinguishing against.
- **Reasoning:** At 3 the human is the bottleneck; at 4–5 an unengineered agent loops or ships junk. He spent months so you do not start from zero.
- **Mechanism:** PRD → interview → three guidance files → issue queue → headless steps.
- **Evidence:** Levels @ 02:53–04:49; “not vibe coding” @ 02:03; interview @ 07:00.
- **Conditions:** Claude/Codex/Pi on-tape. Hive stack Cursor+Grok. Tape $ / token burn UNVERIFIED.
- **Exceptions:** Empty-folder greenfield; existing-codebase factory **untested** (he said).
- **Action:** Steal harness shape. Stay at hive HITL for deploy. Do not install his marketplace.
- **Confidence:** high as the level split.
- **Source:** `eecUhBpTz_g` @ 02:03–07:46
- **Epistemic:** SOURCE
- **Knowledge type:** declared
- **Modality:** speech
- **Evidence status:** transcript-implied
- **Shown / clicked / sequenced:** UNKNOWN
- **Failed / retried:** “ton of rejections” on issues while testing
- **Speech ≠ behavior:** “don’t even have to be in the loop” vs escalation fail-safe + “intervene at least once in a while.”

### Separate validator + hold-outs the builder cannot see; merge≠ship
- **Claim:** Builder bias is the reliability hole. Review must be a **new session** that does not know the plan. Hold-out success tests are written **before** implementation and **hidden from the builder**. A queue that only opens PRs is not a factory — you need a **deploy strategy** (he uses blue-green). Cron triage is stateful (labels) with a written priority.
- **Reasoning:** Same agent that built will go blind or lazy. If the builder sees the exam, it studies the exam.
- **Mechanism:** 30-min cron; priority fix>review>build>triage; factory rules = bite-size; mission.md reject/split; blue-green flip.
- **Evidence:** Separate review @ 14:33; hold-outs @ 22:02–23:48; PR-generator line @ 16:26; blue-green @ 16:41.
- **Conditions:** Auto-deploy on-tape = hive operate-never. 30-min cron = `hosted-neq-scheduled` (scheduled ≠ 24/7 host).
- **Exceptions:** Interview can disable reject or escalation.
- **Action:** MERGE into `separate-verifier` (hold-out / no shared plan) · `checkable-stop` (priority + reject) · `hosted-neq-scheduled` (cron) · `session-bootstrap` (PRD first). Deploy stays Evens.
- **Confidence:** high as the reliability core.
- **Source:** `eecUhBpTz_g` @ 13:52–23:48
- **Epistemic:** SOURCE
- **Knowledge type:** declared
- **Modality:** speech
- **Evidence status:** transcript-implied
- **Shown / clicked / sequenced:** UNKNOWN
- **Failed / retried:** infinite-loop fix (named as the reason to escalate)
- **Speech ≠ behavior:** “automatically deployed” vs “fail safe / escalate to you.”

## C. Mental Models
Autonomy is earned by the harness, not granted by a bigger model. The spec is the steering wheel you keep. The agent should be allowed to **reject you**. Reliability is separation of builder and exam. A PR is not a ship. Bite-size or it slips. Games are a good factory gym because you can add features without product bloat.

## D. Procedures
1. Write the PRD / spec first (`session-bootstrap` dump + done-when).
2. Interview: autonomy, loop steps, how we check, when to escalate.
3. Three files: global rules · stricter factory rules · mission (in + out of scope).
4. Queue: one spec = one ticket. Labels = state. One cron/cadence Evens names — not a new always-on host.
5. Builder runs the bite. Validator is a **different** desk/session (`separate-verifier`). Hold-outs written first; builder must not read them.
6. Priority: fix open misses → review → next accepted → triage (accept/reject/split).
7. Deploy strategy named (blue-green on-tape). **Hive: Evens flips.** Merge to preview ≠ prod.
8. Claude Code marketplace / headless auto-merge to users = operate-never.

## E. Examples
- **Situation:** Dynamis chat. **Action:** factory ships without him reading code. **Outcome:** live URL spoken. **Lesson:** proof-of-harness; we did not click it.
- **Situation:** Issue list messy. **Action:** many rejects. **Outcome:** mission.md can correct him. **Lesson:** reject is a feature.
- **Situation:** Tower defense. **Action:** factory gym. **Outcome:** waves/upgrades narrated. **Lesson:** widen vs deepen while testing the skill.

## F. Decision Rules
- IF you cannot name validation → do not leave level 3.
- IF builder would fill GRADE → fail (`separate-verifier`).
- IF builder can see hold-outs → they are not hold-outs.
- IF merge does not have a deploy strategy → you built a PR bot.
- IF the spec is out of mission.md → reject or split.
- IF cron wants a new 24/7 host → `hosted-neq-scheduled` default no.
- Refuse: Claude/Codex install; auto-deploy to users; unsupervised `/goal`.

## G. Contrarian
The “most powerful system” is **not** a better prompt — it is a factory that can tell you no. Level 5 is advertised; level 3 is recommended. Human-out-of-loop is the hook; escalate-sometimes is the fine print.

## H. Assumptions
chat.dynamis.ai works · millions of tokens · months · 30-min cron · Parallel per-request $ · game quality = **UNVERIFIED**.
**Desk dissent:** vs hive HITL deploy. vs `checkable-stop` overnight-`/goal` warn. vs Chase `U6k4MeVks_Y` `/goal` + Codex grader (same “other model grades”; different vendor). Do not flatten.

## I. Questions
- Hold-out format on disk — not shown. What does a scenario file look like?
- Archon vs bare agent — which path did the skill actually emit in the demos?
- Blue-green on a personal chat app — did he flip, or only recommend?

## J. Connections
- **SYSTEM SYNTHESIS:** MERGE `separate-verifier` · `golden-test-loop` · `checkable-stop` · `hosted-neq-scheduled` · `session-bootstrap` · `assume-it-will-touch`. `U6k4MeVks_Y` other-model grade. Do **not** wire a dark-factory auto-deploy skill.

## K. Future-Use
PRD-first. Interview-the-harness. Global vs factory rules. mission.md reject. Stateful queue + priority. Hold-outs hidden from builder. Merge≠ship. Blue-green as a named strategy (HITL flip).

## Stolen machines

### Machine: spec-queue-separate-holdout
- **Epistemic:** SOURCE
- **Workflow / loop:** PRD → interview → rules+mission → ticket → cron triage (reject/split/accept) → builder bite → hidden hold-outs → other-session review → fix-first priority → named deploy (HITL)
- **Questions / signals:** Can the builder see the exam? Is there a deploy strategy? What is out of scope?
- **Qualify / frame / objections:** Level 3 default. Factory is experimental on-tape.
- **Procedure:** D.
- **Example that proves it:** Rejected issues; hold-out blindness; PR-generator warning.
- **Why it works:** Separation + a written mission the agent can enforce against you.
- **Conditions / exceptions:** Caption-only. Auto-deploy operate-never. No new host.
- **Operate-never payload:** Claude Code/Codex/Pi · auto-merge to users · 24/7 unsupervised factory · quote token $
- **Hive run:** existing verifier/stop/hosted/bootstrap skills — merge only
- **Source:** `eecUhBpTz_g` @ 06:24–23:48

## THINK / BEHAVE / TRICKS / USE
**Added:** 2026-08-14 last-mile. Caption-only. Visual/click UNKNOWN (no watch.json).

### THINK
PRD first. Interview the harness (autonomy, loop, validation, escalate). Stay at Shapiro level 3 unless the harness is proven. The agent may **reject** you (mission.md). Kill: jump to 4–5; builder sees hold-outs; merge without a deploy strategy.

### BEHAVE
“Ton of rejections” while testing. Separate review session. Speech≠behavior: “don’t even have to be in the loop” vs escalate-sometimes; “automatically deployed” vs fail-safe. Cron/labels **unobserved**.

### TRICKS
- Do: three files (global / factory-stricter / mission); hold-outs written first; priority fix→review→next→triage; name blue-green, Evens flips.
- Don’t: Claude marketplace; auto-merge to users; 24/7 new host.
- Hive: `dark-factory` (un-hid). Parts: `separate-verifier` · `checkable-stop` · `hosted-neq-scheduled`.

### USE
Forge builds the bite. Watchdog runs hold-outs in a new session. Big Boss owns the queue. Deploy HITL.
