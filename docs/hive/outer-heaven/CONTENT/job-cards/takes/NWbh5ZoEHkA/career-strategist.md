# Career Strategist — NWbh5ZoEHkA
Status: filled
Protocol: deep-video-learning
**Source:** `docs/hive/outer-heaven/CONTENT/watch-later/packets/NWbh5ZoEHkA/full.txt`
**Packet LEARNED:** `docs/hive/outer-heaven/CONTENT/watch-later/packets/NWbh5ZoEHkA/LEARNED.md`
**ICP:** parked unless Evens named one.

## A. Source Map
Short (0:25, 67 words). Arena fragment. Beats: (1) someone says “Fake it till you make it” (2) “It is running and you scored three” (3) Nate: “Okay, we got three” (4) second run (5) host: “Something special happened” — it used the calculator tool (6) “is there any idea behind adding this tool?” (7) Nate: “LLMs aren’t great at math and if I needed to do some math, I wanted to use that.” Visual-only: the game UI / score. Gap: we do not see the question that scored 3.

## B. Atomic Knowledge

### Give the model a calculator because it is bad at math
- **Claim:** He added a calculator tool because LLMs are not great at math and he might need math.
- **Reasoning:** Do not ask the language model to be the arithmetic engine.
- **Mechanism:** agent + calculator tool; second run used it; host calls it special.
- **Evidence:** “LLMs aren’t great at math and if I needed to do some math, I wanted to use that.” @ UNKNOWN
- **Conditions:** The task can include arithmetic.
- **Exceptions:** Pure language tasks.
- **Action:** Route math to a checkable tool.
- **Confidence:** high as his stated why.
- **Source:** `NWbh5ZoEHkA` @ UNKNOWN
- **Epistemic:** SOURCE

### Score is a public receipt
- **Claim:** The arena announces “you scored three” while the run is live.
- **Reasoning:** Live score is how the room knows it worked.
- **Mechanism:** run → score callout.
- **Evidence:** “It is running and you scored three.” @ UNKNOWN
- **Conditions:** A shared rubric exists (not specified).
- **Exceptions:** n/a
- **Action:** Prefer a scored run over a vibe.
- **Confidence:** medium — we do not know the rubric max.
- **Source:** `NWbh5ZoEHkA` @ UNKNOWN
- **Epistemic:** SOURCE

## C. Mental Models
Tools exist for the model’s known weakness. “Fake it till you make it” is someone else’s line on the tape — he answers with a tool, not a fake. Live score beats a private claim.

## D. Procedures
If the job may need math → attach a calculator (or equivalent checkable tool) → watch whether the second run actually calls it.  
Avoid: mental-math from the LLM.  
Signal: host surprise that it used the tool = the tool was the difference.

## E. Examples
**Situation:** Arena second run.  
**Action:** Agent uses calculator; score 3 announced.  
**Reasoning:** Math is a tool job.  
**Outcome:** Host treats tool-use as the special event.  
**Lesson:** The win they called out was tool routing, not prose. Implicit rule: add the tool for the known failure mode before the scored run.

## F. Decision Rules
- If LLMs are weak at X, do not prompt harder — add a tool for X.
- If a room is scoring you, make the checkable tool visible.

## G. Contrarian
The opener “fake it till you make it” is the field’s career cliché. The useful move on tape is the opposite: do not fake arithmetic.

## H. Assumptions
**Theirs:** Score 3 is meaningful; calculator was the cause. **Ours:** rubric unknown. “Fake it” is not his career advice just because it is on the tape. Falsifier: a run that used the calculator and still failed math.

## I. Questions
- What is max score? What was the math item?
- Who said “fake it till you make it”?

## J. Connections
- SYSTEM SYNTHESIS → `Q8aqkHi5qY4` / `NO97pqqc10A` (same arena).
- SYSTEM SYNTHESIS → `8IUWeF3B-hk` (evaluate with a dataset, not a vibe).
- SYSTEM SYNTHESIS → `golden-test-loop` / `interview-gym` scoreboard.

## K. Future-Use
Unassigned: “calculator for the known weakness” as a gym note when Evens is asked to estimate numbers in a room — bring the sheet, do not perform.

## Steal / Operate-never

### Machine: tool-for-the-known-weakness, then a live score
- **Epistemic:** SOURCE + SYSTEM SYNTHESIS
- **Workflow / loop:** name the model’s weak skill → attach a checkable tool → run → read the score → stop
- **Questions / signals:** Will this run need math (or another known fail)? Did the tool actually fire?
- **Qualify / frame / objections:** Do not “fake it.” If they want a number, use a tool/receipt.
- **Procedure:** Calculator (or sheet) for arithmetic. Rubric for the room.
- **Example that proves it:** Second run uses calculator; score 3 (E).
- **Why it works:** Language models miss arithmetic; a tool is auditable (B/C).
- **Conditions / exceptions:** Needs a tool and a score. Arena is not a job offer.
- **Operate-never payload:** “Fake it till you make it” as career advice; quoting score/prize as FACT; quit-job.
- **Hive run:** `golden-test-loop` · `interview-gym` (same-day score) · `info-gain-cite`
- **Source:** `NWbh5ZoEHkA` @ UNKNOWN

### Operate-never
- Adopt “fake it till you make it” as operate guidance.
- Quote arena score / prize as FACT.
- Employment send, quit-job, unpark clients.
- Merge LESSONS. Auto-write `SKILL.md`.

## L. Role-Specific Applications
Employment still covers baseline. Career analog: when a room asks for a number, bring a checkable sheet from the vault — do not perform mental math or fake fluency. Gym scores the mock; it does not fake the mock. Clients parked.
