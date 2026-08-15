# Communications Manager — eRS3CmvrOvA
Status: filled
Protocol: deep-video-learning
**Source:** `docs/hive/outer-heaven/CONTENT/watch-later/packets/eRS3CmvrOvA/full.txt`
**Packet LEARNED:** `docs/hive/outer-heaven/CONTENT/watch-later/packets/eRS3CmvrOvA/LEARNED.md`
**ICP:** parked unless Evens named one.

## A. Source Map
**Title (PACKET):** I Tried 100+ Claude Code Skills. These 6 Are The Best
**Speaker / channel:** Nate Herk | AI Automation
**Kind:** talk · 3401 words · captions in `full.txt` only · timestamps **UNKNOWN** (no VTT used).
**Gaps:** Caption ingest; ASR errors possible (Naden/Nitn = n8n). Visual UI not fully narrated. Timestamps UNKNOWN.

Beats, in order:
- 400 hours in Claude Code — UNVERIFIED. Fancy skills are for videos; businesses pay for six boring ones that save time/money/mistakes and let you build agents cheaper. Same patterns across RE, HVAC, coaches, marketing agencies.
- 1) Skill Creator (official Anthropic): describe the job / drop an SOP → it drafts, tests, packages skill.md. Factory for every other skill, not what the client pays for. /plugin install; he installed user-global. Property-description example.
- Aside: some are plugins (skills + hooks + MCP). He still says ‘skills.’ Not an AI avatar.
- 2) Superpowers: plan first, isolated env, tests before code, two-stage review (spec + quality). Fixes rushed one-shot that dies in prod. HVAC dispatch / agency reporting. 80% first pass vs 60% = fewer debug cycles / tokens. ~150k GitHub stars — UNVERIFIED. Separate video on its token spend.
- 3) GSD (Get Stuff Done): environment vs process. Context rot halfway through a window (sloppy, forgets, fake-done). Fresh sub-agent per task, clean context; quality gates (scope-production detection, security vs threat model); autonomous mode (plan/execute/commit). Not a token saver — saves redo hours. /gsd-help.
- 4) Built-in /review and /ultra-review (Opus 4.7+). /review = local, fast, bugs/edges/design. /ultra-review = upload branch, parallel reviewers (logic/security/perf/edges); bugs must be independently reproduced. Need Code ≥2.1.86 + Claude account (API key alone won’t). 10–20 min background. /review always; ultra before merge that matters (payments/auth/migration). Pro/Max ~3 free then ~$5–20/run — UNVERIFIED.
- 5) Context Mode: tool calls dump garbage (Playwright 56KB, 20 GitHub issues 59KB; ~40% of window in 30 min). Sandbox the call; return the slice (56KB→299B; 315KB→5KB — vendor benches). Local SQL of files/tasks/decisions/errors; after compact, reinject snapshot. Sessions 30 min → ~3h (claim). /contextmode:ctx-stats. Auto-installs MCP+hooks.
- 6) ClaudeMem: across sessions. Hooks lifecycle; SDK compresses to local SQLite + vectors; auto folder CLAUDE.md. Three-layer retrieval (index → timeline → details); repo claims ~10× vs dump-all. Local web viewer. Don’t npm-install the SDK only — hooks won’t register.
- Bonus 7) official frontend-design skill (global) — less ‘AI slop’; also in Claude Design. Sell outcomes not workflows (10h/week, fewer admin mistakes, more leads). New: pick one skill, demo; don’t install all six. School guide. Stack of install commands on-tape.

## B. Atomic Knowledge

### Boring skills that save time/money/mistakes outsell fancy demo skills
- **Claim:** Clients pay for reliability and cheaper builds, not a cool skill video. Same six keep showing up across industries.
- **Reasoning:** Skill Creator is the factory; Superpowers is the process; GSD is clean context; review is the gate; Context Mode/ClaudeMem fight rot and startup tax.
- **Mechanism:** One skill → a few workflows → a demo of hours/mistakes, not the plugin name.
- **Evidence:** 400h / 150k stars / 56KB→299B / 10× — UNVERIFIED.
- **Conditions:** You are in Claude Code (we are not).
- **Exceptions:** Every install command is operate-never. Ultra-review $ UNVERIFIED. Autonomous walk-away that commits is never without HITL.
- **Action:** Steal the stack-as-layers (factory/process/context/review/memory). Do not /plugin install.
- **Confidence:** high as map; counts UNVERIFIED
- **Source:** `eRS3CmvrOvA` @ UNKNOWN
- **Epistemic:** SOURCE

### Context rot and fake-done are the failure mode; review before merge that can hurt
- **Claim:** Halfway through a window it forgets and claims done. Ultra-review only lists reproduced bugs. Payments/auth/migrations are the ‘matters’ list.
- **Reasoning:** Garbage tool output and missing cross-session memory tax every new chat.
- **Mechanism:** Fresh sub per task; sandbox raw output; retrieve in layers; /review always, ultra when a bug is expensive.
- **Evidence:** 30 min → 3h claim; 10–20 min ultra.
- **Conditions:** Production-shaped work.
- **Exceptions:** We do not merge or pay $5–20. A letter is not a payment migration — still verify, don’t ultra-review-as-ours.
- **Action:** Demand a done-check that can be pointed at. Evens before anything outbound.
- **Confidence:** high
- **Source:** `eRS3CmvrOvA` @ UNKNOWN
- **Epistemic:** SOURCE


## C. Mental Models
- Plugin vs skill is packaging; the job is ‘Claude gets better at X.’ **SOURCE**
- QA is still your job; 80% first pass is a win. **SOURCE**
- Sell 10 hours / fewer mistakes, not the workflow. **SOURCE**

## D. Procedures
- Don’t write skill.md by hand if a creator exists — on his stack. **SOURCE**
- Plan/test/review; don’t one-shot prod. **SOURCE**
- This desk: no Claude plugins. Outcome sentence only. **SYSTEM SYNTHESIS**

## E. Examples
- **Situation:** Property descriptions eat a RE team’s week. → **Action:** Skill Creator from an SOP, not hand-rolled md. → **Reasoning:** Factory, not the SKU. → **Outcome:** Repeatable skill (his claim). → **Lesson:** Client doesn’t buy Skill Creator. Implicit rule: npm-only install can silently do nothing.

## F. Decision Rules
- If the session is rotting → new sub, don’t push through.
- If it touches payments/auth/DB → his ultra-review slot (we still HITL).
- If you’re new → one skill, not six.
- Refuse: 400h / 150k / 10× as FACT. Install any of the six. Autonomous commit. School as ours.
- Optimize: outcome demo from one boring skill.

## G. Contrarian
- Field ships fancy skills for the thumbnail. He says businesses want boring reliability. **SOURCE**

## H. Assumptions
- Vendor benches and star counts UNVERIFIED. 400h self-report. Falsifier: Superpowers that still one-shots past tests.

## I. Questions
- What is our Cursor equivalent of ‘startup tax’ on a letter thread?

## J. Connections
- **SYSTEM SYNTHESIS:** `XNQBCRcwXV4` (thin skills). `6cEQEba0i2A` (cache/handoff). `w9-gfaV5vlM` (sell outcomes).

## K. Future-Use
- Layer map (factory/process/context/review/memory) as an unassigned OS card. Fake-done as a standing inspect.

## Steal / Operate-never

### Machine: Buy outcomes not plugin names; review before it can hurt; never install the six as ours
- **Epistemic:** SOURCE + SYSTEM SYNTHESIS
- **Workflow / loop:** Hear a skill pitch → translate to hours/mistakes → if we draft, verify done → Evens → stop. No /plugin. No send.
- **Questions / signals:** Is this a demo skill or a leak-fixer? Fake-done? Install CTA?
- **Qualify / frame / objections:** Qualify: boring vs thumbnail. Frame: factory then product. Objection: ‘install these six’ → he says pick one if new; we install none.
- **Procedure:** 1) Outcome sentence. 2) Done-check. 3) No marketplace. 4) No $5–20 ultra.
- **Example that proves it:** RE descriptions via Skill Creator; ultra-review before payments/auth.
- **Why it works:** Reliability is the product. Context rot is the silent killer.
- **Conditions / exceptions:** Claude Code tapes. Exceptions: our stack is Cursor + Grok.
- **Operate-never payload:** Install Skill Creator/Superpowers/GSD/Context Mode/ClaudeMem. Quote 400h/10×. Autonomous commit.
- **Hive run (existing skills only):** `golden-test-loop` · `ask-principal`. Stack Cursor + Grok.
- **Source:** `eRS3CmvrOvA` @ UNKNOWN


### Operate-never (this desk will not operate)
- Install any on-tape Claude plugin. Quote 400 hours / 150k stars / 10× tokens as FACT.
- Gmail **send**. Connector write. Scheduled send. Auto-send. Ack-reply. Mass-DM. Postcard. Waitlist blast.
- Quote tape $ / student counts / job-loss % / ROI hours as FACT in a letter.
- New hunt ICP. Unpark Normand. Clients parked — no Path A this week.
- Install on-tape vendors (Vapi, Claude, Codex, ChatGPT, Gemini, Coda, Abacus, Skool, n8n-cloud). Stack stays Cursor + Grok. On-tape names stay on-tape.
- Grok Bot / `sendPrompt`. Send / pay / deploy / book / publish.
- Merge `LESSONS-FROM-TAPE.md`. Auto-write SKILL.md. New `icp_id`.

## L. Role-Specific Applications
- I sell (draft) hours and fewer mistakes, not a plugin list. I do not send. Clients parked.
