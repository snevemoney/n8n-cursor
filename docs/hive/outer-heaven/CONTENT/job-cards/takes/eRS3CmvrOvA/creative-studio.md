# Creative Studio — eRS3CmvrOvA
Status: filled
Protocol: deep-video-learning
**Source:** `docs/hive/outer-heaven/CONTENT/watch-later/packets/eRS3CmvrOvA/full.txt`
**Packet LEARNED:** `docs/hive/outer-heaven/CONTENT/watch-later/packets/eRS3CmvrOvA/LEARNED.md`
**ICP:** parked unless Evens named one.

## A. Source Map
“400 hours in Claude Code” (UNVERIFIED); six boring skills clients pay for. Beats: (1) **skill-creator** (Anthropic official) — talk/SOP → packaged skill.md, factory for the rest, `/plugin install`, user-global; skill vs plugin (hooks/MCP); “I’m not an AI avatar”; (2) **superpowers** — plan, isolated env, tests first, two-stage review (spec + quality); 80% first pass vs 60%; ~150k GitHub stars (UNVERIFIED); (3) **GSD (get shit done)** — fresh sub-agent per task against context rot; quality gates (dropped-requirement, security); autonomous plan/execute/commit; **not** a token saver; (4) `/review` local vs `/ultra-review` (Opus 4.7+, cloud fleet, independently reproduced bugs; need ≥2.1.86 + Claude login not API key; 10–20 min bg; 3 free then ~$5–20/run UNVERIFIED) — use ultra on payments/auth/migrations; (5) **context mode** — sandbox tool I/O (56kB Playwright → 299B; 315kB → 5kB claimed), SQLite event log, rebuild after compact, 30 min → 3 h sessions (vendor benches UNVERIFIED); (6) **ClaudeMem** — cross-session vector SQLite, auto folder CLAUDE.md, 3-layer retrieve, ~10× retrieval save claimed; do **not** npm-install the SDK-only path (hooks never register); bonus **front-end design** official skill (less “AI-looking”; also Claude Design). Sell the outcome not the plugin; pick one, demo. Skool guide. On-tape HVAC/RE/coaches = pattern, not a hunt.

## B. Atomic Knowledge

### Factory skill first
- **Claim:** Clients do not pay for skill-creator; every paid skill comes out of it. Manual skill.md is where beginners flake.
- **Evidence:** “the factory that builds the product.”
- **Conditions:** Plain English or an SOP; install user-global so it always invokes.
- **Exceptions:** He still calls plugins “skills” on purpose.
- **Action:** Learn the factory idea; do not `/plugin install` on the hive.
- **Confidence:** SOURCE.
- **Source:** `eRS3CmvrOvA` @ UNKNOWN
- **Epistemic:** SOURCE

### Process + clean context + review
- **Claim:** Superpowers = how (plan/test/review). GSD = clean window so that how survives. Review/ultra = last gate; ultra only when a prod bug costs more than the run.
- **Reasoning:** #1 fail is sprint-then-it-breaks-on-the-client.
- **Evidence:** “Superpowers gives Claude the process… GSD gives Claude the clean context… before you merge anything important, you run /ultra review.”
- **Conditions:** Ultra needs account login + version pin; not free after trial.
- **Exceptions:** GSD spends more tokens to save redo hours.
- **Action:** Steal the stack order; stay on Cursor + Grok.
- **Confidence:** SOURCE.
- **Source:** `eRS3CmvrOvA` @ UNKNOWN
- **Epistemic:** SOURCE

### Session memory is two clocks
- **Claim:** Context Mode keeps *this* session from filling with raw tool junk and survives compact. ClaudeMem carries *across* sessions so you stop paying the startup tax.
- **Evidence:** Vendor: 56kB → 299B; Mem: 10× retrieval vs dump-all (UNVERIFIED).
- **Conditions:** Local SQLite + viewer; Mem via marketplace, not npm SDK-only.
- **Exceptions:** CLAUDE.md by hand still matters if you skip Mem.
- **Action:** Learn the two clocks; do not install either.
- **Confidence:** SOURCE as his read of their benches.
- **Source:** `eRS3CmvrOvA` @ UNKNOWN
- **Epistemic:** SOURCE

## C. Mental Models
Businesses buy time/money/mistake-removal, not fancy skill videos. 80% first pass is a win. Front-end skill exists because default UI looks AI. He is not an avatar (aside).

## D. Procedures
(Learn only.) Factory → superpowers → GSD → review always / ultra on money-paths → context mode for long sessions → Mem for next session → optional front-end design. Sell hours-back, not the plugin list. One skill, a few workflows, a demo.
Avoid: every `/plugin install`; $5–20 ultra as FACT; Claude as stack; new hunt.

## E. Examples
**Situation:** RE agency wastes hours on property descriptions.  
**Action:** Skill-creator from a spoken SOP vs hand-rolled skill.md.  
**Lesson:** Factory compresses the flake.

**Situation:** About to merge payments.  
**Action:** Ultra-review, 10–20 min background, reproduced bugs only.  
**Lesson:** Gate cost < prod bug cost.

## F. Decision Rules
- If the session is rotting at 30 minutes → context engineering, not a longer prompt.
- If the commit touches auth/pay/migrate → ultra, not local review only.
- If install path is npm SDK-only → hooks will not register (repo warning).
- If stars / kB / $ from this tape → UNVERIFIED.

## G. Contrarian
Fancy skills are YouTube. The money skills are boring. Autonomous GSD is offered; hive still HITL.

## H. Assumptions
400 hours, 150k stars, 56kB→299B, 10×, $5–20 UNVERIFIED. On-tape Claude. Clients parked.

## I. Questions
What does the Mem web viewer look like? Did ultra’s 3-free stay? Visual of context-mode stats?

## J. Connections
- SYSTEM SYNTHESIS → `XNQBCRcwXV4` (verify, don’t hobble; thin skills).
- SYSTEM SYNTHESIS → `w9-gfaV5vlM` (sell outcome).
- SYSTEM SYNTHESIS → `cinematic-recipe` (front-end design / less AI-look).

## K. Future-Use
Two-clock memory (in-session vs across-session) as a card. Unassigned.

## Steal / Operate-never

### Machine: factory → process → clean window → money-path review
- **Epistemic:** SOURCE
- **Workflow / loop:** describe the job → plan/test/review → fresh context per task → local review always → ultra on pay/auth → keep this session small → carry the next session
- **Questions / signals:** Context rot? Startup tax? Prod-bug cost > review cost?
- **Qualify / frame / objections:** Sell 10 hours / fewer mistakes, not the plugin
- **Procedure:** One skill first; camera demo
- **Example that proves it:** Property-description factory; ultra on payments
- **Why it works:** Sloppy one-shots fail on the client; garbage I/O kills the window
- **Conditions / exceptions:** Token spend can go up; benches UNVERIFIED
- **Operate-never payload:** Claude plugins; ultra $ as FACT; HVAC/RE hunt; Skool
- **Hive run:** `golden-test-loop`; `ask-principal`; `cinematic-recipe`
- **Source:** `eRS3CmvrOvA` @ UNKNOWN

### Operate-never
- `/plugin install` anything on-tape. Claude as stack.
- Quote 150k stars / $5–20 / 400 hours as FACT.
- New hunt. Join Skool. Auto-merge after ultra.
- Merge `LESSONS-FROM-TAPE.md`. Game-studio / fake 3D / cheap taste / NSFW.

## L. Role-Specific Applications
Video-first: bonus **front-end design** is the taste lock — less default-AI look. Do not ship Claude Design. Plate = before/after UI, not a plugin list. HITL. Clients parked.
