# Researcher — NO97pqqc10A
Status: filled
Protocol: deep-video-learning
**Source:** `docs/hive/outer-heaven/CONTENT/watch-later/packets/NO97pqqc10A/full.txt`
**Packet LEARNED:** `docs/hive/outer-heaven/CONTENT/watch-later/packets/NO97pqqc10A/LEARNED.md`
**ICP:** parked unless Evens named one.

## A. Source Map
Agentic Arena clip. Beats: (1) Nate uses a “co-pilot power up” so ChatGPT generates a system prompt for his agent. (2) “We using five. It’s pretty smart.” (3) Caveat: “in the end sometimes it has some issues.” (4) Aside: cheer the robot — it gets hit if players are not perfect. (5) They may have designed one question that is very hard. No timestamps in `full.txt`. Timestamp UNKNOWN.

## B. Atomic Knowledge

### Prompt-as-power-up
- **Claim:** A copilot can generate the system prompt for a live agent.
- **Reasoning:** Faster than hand-writing the prompt under arena pressure.
- **Mechanism:** ChatGPT (on-tape) drafts the system prompt; Nate pastes/uses it.
- **Evidence:** “using his co-pilot power up to get chat chief t to generate a system prompt.”
- **Conditions:** Time-boxed contest; prompt quality is the lever.
- **Exceptions:** Generated prompt “has some issues” at the end.
- **Action:** Treat generated prompts as drafts; expect a tail failure.
- **Confidence:** high that he did this; low that the prompt was good.
- **Source:** `NO97pqqc10A` @ UNKNOWN
- **Epistemic:** SOURCE

### Design one hard check
- **Claim:** The arena may include one question designed to be very hard / not a perfect score.
- **Reasoning:** Entertainment + a discriminator so “perfect” is rare.
- **Mechanism:** Plant a hard item; robot “gets hit” if players are not perfect.
- **Evidence:** “we may have even designed one question that is going to be very hard.”
- **Conditions:** Game-show eval, not a production SLA.
- **Exceptions:** A real eval should not hide the hard item as a gag.
- **Action:** If you need a discriminator, name it; do not pretend 100% is the bar.
- **Confidence:** medium (hosts hedging with “may”).
- **Source:** `NO97pqqc10A` @ UNKNOWN
- **Epistemic:** SOURCE

## C. Mental Models
Prompt generation is a power-up, not a finished skill. “Pretty smart” and “issues at the end” sit in the same breath. Perfect score is a gag threat (robot gets hit), not an ops target.

## D. Procedures
1. Generate a system prompt under time pressure (copilot).
2. Run it; expect end-of-run issues.
3. Optionally plant one hard question so perfect is rare.

## E. Examples
- **Situation:** Live trivia agent needs a system prompt fast. **Action:** Copilot drafts it; they “use five.” **Reasoning:** Speed. **Outcome:** “Pretty smart” + “issues” at the end. **Lesson:** Generated prompts still fail at the tail. Implicit rule: do not ship the first generated prompt.

## F. Decision Rules
- If time-boxed → generate prompt, then watch the tail.
- If you need a discriminator → one hard item, named as hard.
- Refuse: treating arena “pretty smart” as a production eval.

## G. Contrarian
Field: “just generate the system prompt.” He still reports issues. Perfect score is designed against.

## H. Assumptions
Copilot output is usable enough to run. “Five” is a model/version, not verified. **Researcher:** this is show design, not a sellable agent. Falsifier: a generated prompt that is clean to the last turn.
**Desk dissent:** none yet.

## I. Questions
- What were the “issues” at the end?
- What was the hard question?
- Was “five” a model name or a score?

## J. Connections
- **SYSTEM SYNTHESIS:** `G9Ho8n4lD6I` also uses ChatGPT to draft a voice-agent system prompt (when-to-use-each-tool). `NWbh5ZoEHkA` is the same arena night (calculator). Do not flatten: one clip is prompt-gen, one is tool-for-math.

## K. Future-Use
Unassigned: “one intentionally hard item” as an eval design note. Not a hunt.

## Steal / Operate-never

### Machine: generate-prompt-then-watch-the-tail
- **Epistemic:** SOURCE + SYSTEM SYNTHESIS
- **Workflow / loop:** need a system prompt → generate draft → run → watch the last turns for issues
- **Questions / signals:** Did it fail at the end? Is there one item designed to be hard?
- **Qualify / frame / objections:** “The copilot prompt is smart” → “sometimes it has issues.”
- **Procedure:** Never treat the first generated system prompt as done; inspect the tail.
- **Example that proves it:** Arena copilot prompt, “pretty smart,” issues at the end; optional hard question.
- **Why it works:** Speed under pressure, with an expected defect at the edge.
- **Conditions / exceptions:** Contest / draft only. Production needs a named eval (`8IUWeF3B-hk`).
- **Operate-never payload:** ChatGPT copilot as hive SKU; arena robot gag; quote “pretty smart” as FACT.
- **Hive run:** `golden-test-loop` · `ask-principal` (do not auto-send the generated prompt to prod).
- **Source:** `NO97pqqc10A` @ UNKNOWN

**Operate-never**
- Install ChatGPT / arena copilot as hive stack (Cursor + Grok only).
- New `icp_id` / unpark / send / pay / deploy / book / publish.
- Quote tape scores or prize as FACT.

## L. Role-Specific Applications
Store the tail-failure + hard-item notes in LEARNED. Do not add a trivia-bot ICP. Do not merge with `LESSONS-FROM-TAPE.md`.
