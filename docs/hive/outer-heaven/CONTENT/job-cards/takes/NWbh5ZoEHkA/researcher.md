# Researcher — NWbh5ZoEHkA
Status: filled
Protocol: deep-video-learning
**Source:** `docs/hive/outer-heaven/CONTENT/watch-later/packets/NWbh5ZoEHkA/full.txt`
**Packet LEARNED:** `docs/hive/outer-heaven/CONTENT/watch-later/packets/NWbh5ZoEHkA/LEARNED.md`
**ICP:** parked unless Evens named one.

## A. Source Map
Arena-clip short. Beats in order: (1) “Fake it till you make it” + score three. (2) Confirm “we got three.” (3) Second run. (4) Aside: “something special happened” — the agent used a calculator tool. (5) Q: any idea behind adding that tool? (6) Answer: LLMs aren’t great at math; if he needed math, he wanted the tool. Music sting. No captions/timestamps in `full.txt`. Visual scoreboard not described in text. Timestamp UNKNOWN.

## B. Atomic Knowledge

### Tool covers a model weakness
- **Claim:** Add a calculator tool because LLMs are not great at math.
- **Reasoning:** If the task needs arithmetic, do not trust the model’s head-math; route it to a tool.
- **Mechanism:** Agent is given a calculator; on a later run it actually calls it.
- **Evidence:** On-tape second run “made use of the calculator tool”; speaker states the why.
- **Conditions:** Task includes numeric scoring / arithmetic.
- **Exceptions:** If the model is not asked to compute, the tool stays idle.
- **Action:** When a workflow needs numbers, attach a dedicated compute tool and watch whether it is called.
- **Confidence:** high for the speaker’s reason; low for “this agent is good at math” as a general fact.
- **Source:** `NWbh5ZoEHkA` @ UNKNOWN — “LLMs aren't great at math and if I needed to do some math, I wanted to use that.”
- **Epistemic:** SOURCE

### Score-then-rerun
- **Claim:** First pass can be performed / scored; a second run is where the interesting tool use shows up.
- **Reasoning:** “Fake it till you make it” + “second run” + “something special happened.”
- **Mechanism:** Run → score → run again → inspect tool calls.
- **Evidence:** “you scored three” / “Okay, we got three” / “Second run.”
- **Conditions:** Live arena / eval with a visible score.
- **Exceptions:** One-shot demos will miss the tool-call surprise.
- **Action:** Treat first score as a baseline, not the lesson.
- **Confidence:** medium (clip is fragmentary).
- **Source:** `NWbh5ZoEHkA` @ UNKNOWN
- **Epistemic:** SOURCE (events) + INFERENCE (baseline-then-inspect)

## C. Mental Models
Speaker treats agents as tool-users, not oracles. Math is a known LLM hole, so the design move is “give it a calculator,” not “prompt harder.” Live scoring is public and casual (“fake it till you make it”). Uncertainty: he asks the room why the tool was added, then answers himself — teaching by Q→A.

## D. Procedures
1. Give the agent a calculator when the job includes math.
2. Run, score, run again.
3. Inspect whether the tool was actually called (the “something special”).
4. Explain the tool by the weakness it covers, not by vendor branding.

## E. Examples
- **Situation:** Arena agent, first run scored three. **Action:** Second run. **Reasoning:** Look for what changed. **Outcome:** Calculator tool was used. **Lesson:** The proof is the tool call, not the slogan. Implicit rule: a tool that is never called is not a capability.

## F. Decision Rules
- If the task is arithmetic → attach a calculator; do not leave it to the LLM.
- If first run is merely “scored” → run again and inspect tools.
- Refuse: treating a live score as a product claim.

## G. Contrarian
Rejects “the model can just do math.” Field assumption: bigger model = better arithmetic. He assumes the opposite and designs around it.

## H. Assumptions
**Theirs:** Calculator tool is available and correctly wired; “three” is a meaningful score. **Ours:** Clip is arena entertainment, not a reproducible eval. Survivorship: we only see the run that used the tool. Falsifier: a model that is actually good at the required math, or a calculator that is called and still wrong. Desk dissent: none yet — Librarian not merged.

## I. Questions
- What was the actual question that required the calculator?
- Was “three” correct?
- Did the first run fail at math and the second succeed because of the tool?

## J. Connections
- **SYSTEM SYNTHESIS:** `golden-test-loop` — score, change, re-run, inspect. `8IUWeF3B-hk` (evaluate = hypothesis + objective proof). Do not flatten: this clip is a game-show demo; that tape is an n8n eval tab.

## K. Future-Use
Unassigned: “inspect whether the tool was actually called” as a teachable check in any agent eval. Not this week’s hunt.

## Steal / Operate-never

### Machine: tool-for-model-weakness
- **Epistemic:** SOURCE (why) + SYSTEM SYNTHESIS (hive loop)
- **Workflow / loop:** identify model hole (math) → attach a dedicated tool → run → score → re-run → check tool was called
- **Questions / signals:** Does this step need arithmetic? Did the agent call the tool or guess?
- **Qualify / frame / objections:** “The model is smart enough” → “LLMs aren’t great at math.”
- **Procedure:** Add calculator (or equivalent compute) before trusting numeric output; inspect traces on run 2.
- **Example that proves it:** First run scored three; second run used the calculator; speaker’s reason is the LLM math hole.
- **Why it works:** Routes a known failure mode out of the model.
- **Conditions / exceptions:** Only if the job is numeric; unused tools prove nothing.
- **Operate-never payload:** Agentic Arena / game-show agent as a hive SKU; quote “scored three” as FACT.
- **Hive run (existing skills only):** `golden-test-loop` · `coverage-loop` (dry-run + score). Do not auto-write `SKILL.md`.
- **Source:** `NWbh5ZoEHkA` @ UNKNOWN

**Operate-never**
- Install / run Agentic Arena as a product.
- Quote live scores or “fake it till you make it” as FACT.
- New `icp_id` / unpark client / send / pay / deploy / book / publish.
- Treat ChatGPT / arena stack as hive stack (Cursor + Grok only).

## L. Role-Specific Applications
Researcher stores the math-hole → tool-call machine in packet LEARNED. Do not add a hunt row. Do not promote arena scores to OPERATOR_MEMORY FACTS. Pointer after this block: master steal sheet may tag `yt:NWbh5ZoEHkA` as operate-never entertainment with one stolen eval check.
