# Consultant — U6k4MeVks_Y
Status: filled
Protocol: deep-video-learning
**Source:** `docs/hive/outer-heaven/CONTENT/watch-later/packets/U6k4MeVks_Y/transcripts/full.txt`
**Packet LEARNED:** `docs/hive/outer-heaven/CONTENT/watch-later/packets/U6k4MeVks_Y/LEARNED.md`
**ICP:** parked unless Evens named one.

## A. Source Map

Caption-only. No VTT. UNKNOWN. Desktop-app UI / browser pane / Vercel URL unobserved. ~11335 words. Chase: Claude Code beginner → intermediate → pro. Close: Chase AI Plus / masterclass.

Beginner: where to run (web / desktop / terminal). He now pushes **desktop** for non-technical (voice, browser, artifacts); terminal still inside desktop. Global instructions stay blank unless they apply to every chat. Capabilities: load tools when needed; leave PR setting off if you do not know PRs. Local 99.99%; pick a folder; git main, no worktree if beginner. Permissions: sit on **auto** (not bypass, not manual); use **plan** before execute. Models/effort: $20 plan cannot burn “Fable”; max plans sit Fable medium; effort is not linear (ultra may be +1% for 5x cost). Prompting: buy a mic; stream of consciousness + “ask what I’m not thinking”; do not smash **recommended** on tech-stack — ask it to explain or you stay replaceable. Plan comments → accept + auto. Fake Lighthouse analytics site, CTA = book a call.

Intermediate: watch context window (~30% he starts asking whether to continue; `/clear` vs `/compact` vs new chat in same folder — files remain). Ugly first site = no inspiration. Skills = prompts that make a behavior repeatable (frontend-design plugin; skill-creator is the meta-skill; paste GitHub URL → “add this skill”). One screenshot + one skill → three divergent versions; he picks V1. Outside tools: connectors / plugins / CLIs (CLI often more complete). Ask Claude to find+add GitHub+Vercel and stand up a deploy pipeline in language.

Advanced: long-horizon = trigger + task + **objective success criteria** (`/goal` loops until criteria; subjective “looks cool” fails). Forever loops add logging + score past runs → skill → routine schedule (morning brief example). Graph = nested micro-loops that talk (usually overkill). Ultra/dynamic: custom harness, many sub-agents; `/deep-research` fan-out + adversarial check; he saw 103 agents / 6M tokens — UNVERIFIED. Cap sub-agents; route cheap models for workers. Models do not grade themselves — bring a second frontier (Codex plugin; “grill me” plan vs Codex, up to five rounds). Agentic OS = skills mapped to daily work + optional visual wrapper; value is the skill architecture, not the UI. Obsidian vault: raw / wiki / output + index.md at each level (Karpathy-style). Headless `claude -p`. Visual wrapper not required; skill corpus is.

## B. Atomic Knowledge

### Plan + explain-the-question beats smash-recommended
- **Claim:** Unknown-unknowns are the non-technical failure mode. Plan mode forces questions. Hitting recommended forever makes you interchangeable and leaves you unable to debug a unique project.
- **Reasoning:** Models will still produce a pretty page if you smash recommended. You will not have a moat or a foundation.
- **Mechanism:** Stream of consciousness → “what am I not thinking?” → when you do not understand an option, ask for a breakdown → comment the plan → accept + auto.
- **Evidence:** “If you have spent all of your time learning cloud code by never actually learning anything and just hitting recommended… you're going to have zero idea of what's actually happening.”
- **Conditions:** Desktop-app plan UI. Caption-only.
- **Exceptions:** You never need to become a traditional SWE; you do need building-block literacy.
- **Action:** Steal plan-then-explain. Do not install Claude Code.
- **Confidence:** high
- **Source:** `U6k4MeVks_Y` @ UNKNOWN — don't hit recommended
- **Epistemic:** SOURCE
- **Knowledge type:** declared
- **Modality:** speech
- **Evidence status:** transcript-implied
- **Shown / clicked / sequenced:** UNKNOWN
- **Failed / retried:** first Lighthouse page was “ugly / generic”
- **Speech ≠ behavior:** none

### Skills + objective success criteria; models must not self-grade
- **Claim:** Skills make non-deterministic work more repeatable. `/goal` and loops die on subjective “cool.” A model asked to grade itself will say it did a great job — bring a second model.
- **Reasoning:** Context fill degrades performance (~30% he resets). Files in the folder mean `/clear` is not zero. One screenshot changes the site more than more chat.
- **Mechanism:** Skill (or skill-creator) → run until good → log/score → schedule if it should repeat. Hard problems: second-model adversarial review before execute.
- **Evidence:** “AI systems in general… don't do a great job of grading themselves.”
- **Conditions:** Token / Fable-limit claims UNVERIFIED. Codex/ChatGPT on tape.
- **Exceptions:** Graph engineering is overkill for most.
- **Action:** Steal objective-stop + second-grader. Stack stays Cursor + Grok.
- **Confidence:** high
- **Source:** `U6k4MeVks_Y` @ UNKNOWN — success criteria / don't self-grade
- **Epistemic:** SOURCE
- **Knowledge type:** declared
- **Modality:** speech
- **Evidence status:** transcript-implied
- **Shown / clicked / sequenced:** UNKNOWN
- **Failed / retried:** deep-research burned a huge token pile (on tape)
- **Speech ≠ behavior:** none

## C. Mental Models

Desktop is good enough now; terminal shame is outdated. Global instructions are a high bar. Effort ≠ linear quality. Agentic OS is a mapped skill corpus, not a dashboard fetish. Memory is a navigable file tree with indexes. He is selling Plus.

## D. Procedures

Beginner: desktop → blank globals → auto permissions → local folder → plan mode → ramble + ask-back → explain unknown options → accept+auto.
Context: watch ~30% → `/compact` or new chat in the same folder.
Quality: add a skill + a screenshot; generate versions; pick.
Tools: for any outside app, ask “connector, plugin, or CLI?” — pick one; or ask the agent to find and add it.
Loops: write objective success → `/goal` or skill+routine+log. Cap sub-agents / route cheap workers. Second model reviews plans you cannot grade.
OS: dump weekly work into skill-creator; raw→wiki→output with index.md.
Avoid: bypass permissions; ultra-by-default; “looks cool” as a stop; self-grade.

## E. Examples

**Situation:** Fake Lighthouse site, CTA book-a-call, he does not know the stack. **Action:** Asks what a tech stack is instead of recommended. **Outcome:** Plan + a generic first page. **Lesson:** Literacy over smash. Implicit: book-a-call CTA is his default, not a hive SKU.

**Situation:** Page is slop. **Action:** Pinterest SaaS screenshot + frontend-design skill → three versions → keep V1. **Outcome:** “Infinitely different end result.” **Lesson:** Context injection beats more adjectives.

**Situation:** Wants hosting, does not know GitHub/Vercel. **Action:** Asks Claude to look up CLIs/MCPs, add them, connect the pipeline. **Outcome:** Live `lighthouse-site` Vercel URL — unobserved. **Lesson:** Ask for the best-practice path; deploy still HITL for us.

## F. Decision Rules

- IF non-technical → desktop, not terminal-shame.
- IF instruction is not universal → do not put it in globals.
- IF starting a fuzzy A→Z → plan mode.
- IF you do not understand the multiple-choice → ask for a breakdown, do not smash recommended.
- IF context ~30–50% → new chat / compact; files remain.
- IF success is subjective → rewrite until a toddler could check it.
- IF you cannot grade the domain → second model, not self-score.
- IF a task repeats daily → skill then routine, after it works manually.
- GOAL → TOOL → INPUT → OUTPUT → DECISION: named end-state → plan → skills/connectors → artifact → human accept (HITL deploy).

## G. Contrarian

Field still says “real users use the terminal.” He says desktop is fine and has features terminal lacks. Field wants magic prompt format (goal/context/act-as); he wants a microphone. Field wants an agentic OS UI; he says the skill map is the value.

## H. Assumptions

Survivorship of his vault / Plus. Dated: Claude Code desktop, Fable, Codex plugin, Vercel, Obsidian. Domain: tool mastery course. Falsifier: desktop lags terminal again. Hive disagreement: we do not install Claude/Codex/ChatGPT; Grok Bot `sendPrompt` never; auto-deploy never.

## I. Questions

What exact classifier does “auto” use (unobserved)? Is `/goal` available outside his build? How does he score morning briefs in practice (he admits it is hard)?

## J. Connections

New-chat / compact pairs `0YXjEzFfft8` hygiene. Objective success pairs `golden-test-loop` and Hormozi toddler language (`rMf-JuikR-Q`). Skill-creator = do not auto-write hive SKILL.md. Vault indexes = `wiki-ingest` / `context-docs`. **SYSTEM SYNTHESIS.**

## K. Future-Use

30% context reset rule. Screenshot-as-spec. Second-model review when the operator cannot grade. raw/wiki/output + index.md.

## Steal / Operate-never

### Machine: plan → explain unknowns → skill+context → objective stop → second grader
- **Epistemic:** SOURCE
- **Workflow / loop:** plan mode → force unknown-unknowns into the open → inject skill + example → run → compare to a checkable stop → if you cannot grade it, route a second model → only then schedule a loop.
- **Questions / signals:** What am I not thinking? Can a toddler check done? Are we past ~30% context? Can Claude control the outside tool?
- **Qualify / frame / objections:** They want Claude Code OS / Ultra / Chase Plus. Frame: literacy + checkable stop. Objection “103 agents / live URL in one prompt” — UNVERIFIED / deploy HITL.
- **Procedure:** D above.
- **Example that proves it:** Smash-recommended warning; screenshot+skill → V1; self-grade failure (E + B).
- **Why it works:** Unknown-unknowns and self-grade are the two silent fails.
- **Conditions / exceptions:** Caption-only. Graph/Ultra expensive. Forever loops need logging.
- **Operate-never payload:** Claude Code / Codex / ChatGPT install; bypass permissions; auto-deploy; Grok Bot `sendPrompt`; auto-write SKILL.md from skill-creator.
- **Hive run (existing skills only):** `session-bootstrap` + `input-required-gate` + `info-gain-cite` + `golden-test-loop` + `wiki-ingest` / `context-docs` + `slice-build`. Deploy/publish: `ask-principal`.
- **Source:** `U6k4MeVks_Y` @ UNKNOWN

### Operate-never
- Install Claude Code / Codex / ChatGPT / switch stack. Auto-deploy Vercel.
- Quote token burns / plan prices / 103 agents as FACT.
- Unpark a client / new `icp_id`. Send / pay / deploy / book / publish.
- Merge `LESSONS-FROM-TAPE.md`. Auto-write SKILL.md. Overwrite `takes/consultant.md`.

## L. Role-Specific Applications

**Constraint first:** The stated ask is “master Claude Code / stand up an agentic OS / deploy the site.” Felt problem is still the leak. Do not re-scope a parked Path A as a Claude desktop install or a book-a-call landing page.

Four-blank after constraint: toddler-checkable stop; owner numbers only. Skeptical-customer: smash vs honest demo — a self-graded plan is not a pass (`golden-test-loop`). Clients parked. No new `icp_id`.
